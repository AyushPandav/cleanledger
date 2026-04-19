from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import PromptTemplate

from models import (
    StartupProfileRequest,
    AnalyzeRequest,
    CompareRequest,
    CreateQuestionRequest,
    AnswerQuestionRequest
)
from services import calculate_completion_score, analyze_startup_profile
from motor.motor_asyncio import AsyncIOMotorClient
import datetime
from bson import ObjectId

# ─── Environment ──────────────────────────────────────────────────────────────
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Fintech AI Backend", version="2.0.0")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/")
async def health():
    return {"status": "ok", "message": "Fintech AI Backend is running"}


# ─── Startup Profile: Create / Update ─────────────────────────────────────────
@app.post("/startup/profile")
async def create_or_update_profile(req: StartupProfileRequest):
    """
    Accepts startup profile fields, computes profileCompletionScore,
    determines profileComplete flag, and returns updated data ready
    to be saved to MongoDB from the Node.js server.
    """
    try:
        data = req.dict()
        score = calculate_completion_score(data)
        profile_complete = score >= 60

        return {
            "userId": req.userId,
            "profileCompletionScore": score,
            "profileComplete": profile_complete,
            "updatedFields": {
                "name": req.name,
                "description": req.description,
                "industry": req.industry,
                "fundingGoal": req.fundingGoal,
                "stage": req.stage,
                "teamMembers": [m.dict() for m in req.teamMembers] if req.teamMembers else [],
                "milestones": [m.dict() for m in req.milestones] if req.milestones else [],
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Startup Analyze: AI Scorecard ────────────────────────────────────────────
@app.post("/startup/analyze")
async def analyze_startup(req: AnalyzeRequest):
    """
    Calls Mistral AI to generate a full risk scorecard for a startup.
    Returns: riskLevel, trustScore, insights, warnings, suggestions
    """
    mistral_api_key = os.getenv("MISTRAL_API_KEY")
    if not mistral_api_key:
        raise HTTPException(
            status_code=500,
            detail=f"MISTRAL_API_KEY not found. Looked in: {env_path}"
        )

    # Trust the carefully calculated frontend score, as the AI dict doesn't contain all DB fields.
    result = analyze_startup_profile(req, mistral_api_key)
    result["profileCompletionScore"] = req.profileCompletionScore
    return result


# ─── Compare Two Startups ─────────────────────────────────────────────────────
@app.post("/api/compare")
async def compare_startups(req: CompareRequest):
    mistral_api_key = os.getenv("MISTRAL_API_KEY")
    if not mistral_api_key:
        raise HTTPException(status_code=500, detail=f"MISTRAL_API_KEY not found at {env_path}")

    try:
        model = ChatMistralAI(api_key=mistral_api_key, model="mistral-large-latest")

        prompt = PromptTemplate.from_template(
            """You are an elite venture capital analyst. 
            Compare the following two startups strictly based on three metric categories: Risk, Trust Score, and Growth.
            Provide your analysis in a clear, concise bulleted format.

            Startup 1:
            Name: {s1_name}
            Industry: {s1_ind}
            Stage: {s1_stage}
            Description: {s1_desc}

            Startup 2:
            Name: {s2_name}
            Industry: {s2_ind}
            Stage: {s2_stage}
            Description: {s2_desc}
            
            Format Output:
            **Risk Analysis:** ...
            **Trust Score Analysis:** ...
            **Growth Assessment:** ...
            **Recommendation:** ...
            """
        )

        chain = prompt | model
        response = chain.invoke({
            "s1_name": req.startup1.name,
            "s1_ind": req.startup1.industry,
            "s1_stage": req.startup1.stage,
            "s1_desc": req.startup1.description,
            "s2_name": req.startup2.name,
            "s2_ind": req.startup2.industry,
            "s2_stage": req.startup2.stage,
            "s2_desc": req.startup2.description
        })

        return {"comparison": response.content}
    except Exception as e:
        print("Model Execution Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# ─── Questions Data Model ─────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_db_client():
    mongo_uri = os.environ.get("EXPO_PUBLIC_MONGO_URI")
    app.mongodb_client = AsyncIOMotorClient(mongo_uri)
    app.mongodb = app.mongodb_client.get_database("test") # Using default test DB or read from uri if possible

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# ─── Questions Endpoints ─────────────────────────────────────────────────────

@app.post("/questions")
async def ask_question(req: CreateQuestionRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    question_doc = {
        "type": "qa",
        "startup": ObjectId(req.startupId) if len(req.startupId) == 24 else req.startupId,
        "author": ObjectId(req.investorId) if len(req.investorId) == 24 else req.investorId,
        "question": req.question.strip(),
        "answer": None,
        "isAnswered": False,
        "isPublic": True,
        "isAnonymous": req.isAnonymous,
        "likes": [],
        "likeCount": 0,
        "pinned": False,
        "createdAt": datetime.datetime.utcnow(),
        "updatedAt": datetime.datetime.utcnow()
    }
    
    result = await app.mongodb["messages"].insert_one(question_doc)
    return {"status": "success", "questionId": str(result.inserted_id)}

@app.put("/questions/{question_id}/answer")
async def answer_question(question_id: str, req: AnswerQuestionRequest):
    if not req.answer or not req.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")
        
    result = await app.mongodb["messages"].update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {
            "answer": req.answer.strip(),
            "isAnswered": True,
            "answeredAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
        
    return {"status": "success", "message": "Question answered successfully"}

@app.get("/questions/startup/{startup_id}")
async def get_startup_questions(startup_id: str):
    parsed_id = ObjectId(startup_id) if len(startup_id) == 24 else startup_id
    questions_cursor = app.mongodb["messages"].find(
        {"startup": parsed_id, "isPublic": True, "type": "qa"}
    ).sort("createdAt", -1)
    
    questions = []
    async for q in questions_cursor:
        q["_id"] = str(q["_id"])
        if "startup" in q and isinstance(q["startup"], ObjectId):
            q["startup"] = str(q["startup"])
        if "author" in q and isinstance(q["author"], ObjectId):
            q["author"] = str(q["author"])
        questions.append(q)
        
    return {"status": "success", "questions": questions}

@app.get("/questions")
async def get_all_public_questions():
    questions_cursor = app.mongodb["messages"].find(
        {"isPublic": True, "type": "qa"}
    ).sort("createdAt", -1)
    
    questions = []
    async for q in questions_cursor:
        q["_id"] = str(q["_id"])
        if "startup" in q and isinstance(q["startup"], ObjectId):
            q["startup"] = str(q["startup"])
        if "author" in q and isinstance(q["author"], ObjectId):
            q["author"] = str(q["author"])
        questions.append(q)
        
    return {"status": "success", "questions": questions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
