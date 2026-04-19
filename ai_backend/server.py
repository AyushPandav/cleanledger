from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import json
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


async def verify_api_key(x_platform_secret: str = Header(None)):
    """Simple API Gateway Auth to block public abuse of Mistral Tokens."""
    if x_platform_secret != "FINTECH_SECURE_123":
        raise HTTPException(status_code=401, detail="Unauthorized AI Gateway Access")


# ─── Startup Profile: Create / Update ─────────────────────────────────────────
@app.post("/startup/profile", dependencies=[Depends(verify_api_key)])
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


# ─── Real AI Document Verification ───────────────────────────────────────────
class DocumentVerifyRequest(BaseModel):
    fileName: str = Field(..., max_length=200)
    docType: str = Field(..., max_length=50)  # "business" or "kyc"
    base64Data: str | None = Field(default=None, description="Base64 encoded image data for visual OCR validation")

VALID_BUSINESS_KEYWORDS = ["registration", "certificate", "incorporation", "msme", "cin", "gst", "company", "llp", "mca", "trade", "license", "shop", "business", "udyam", "pan"]
VALID_KYC_KEYWORDS = ["pan", "aadhaar", "aadhar", "passport", "voter", "driving", "license", "id", "identity", "kyc", "nid", "rc", "uidai", "adhaar"]
VALID_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic"]

# ONLY auto-reject things that are CLEARLY not documents — be conservative
HARD_REJECT_KEYWORDS = ["meme", "wallpaper", "selfie", "funny", "lol", "dog.", "cat.", "fake", "dummy", "test123", "abcdef", "xxx", "porn", "random123"]

def check_filename_legitimacy(file_name: str, doc_type: str) -> dict:
    """Deterministic pre-check — only hard-reject obvious non-documents."""
    name_lower = file_name.lower().strip()
    
    # Check extension
    has_valid_ext = any(name_lower.endswith(ext) for ext in VALID_EXTENSIONS)
    
    # Only auto-reject clearly fake/inappropriate files
    is_hard_reject = any(kw in name_lower for kw in HARD_REJECT_KEYWORDS)
    
    # Check for relevant keywords based on doc type (used for confidence boost only)
    if doc_type == "business":
        has_relevant_kw = any(kw in name_lower for kw in VALID_BUSINESS_KEYWORDS)
    else:
        has_relevant_kw = any(kw in name_lower for kw in VALID_KYC_KEYWORDS)
    
    if not has_valid_ext:
        return {"passed": False, "reason": f"Invalid file format '{file_name}'. Please upload a PDF, JPG, or PNG."}
    if is_hard_reject:
        return {"passed": False, "reason": f"'{file_name}' appears to be a non-document file."}
    
    # Everything else goes to Mistral — including IMG_xxxx.jpg (phone camera photos of real docs)
    return {"passed": True, "has_relevant_kw": has_relevant_kw, "reason": None}

@app.post("/verify-document", dependencies=[Depends(verify_api_key)])
async def verify_document(req: DocumentVerifyRequest):
    """
    Real AI document verification: deterministic pre-check + Mistral analysis.
    """
    check = check_filename_legitimacy(req.fileName, req.docType)
    
    # If no base64 image provided, and the filename fails deterministic validation, reject it immediately
    if not req.base64Data and not check["passed"]:
        return {"verified": False, "reason": check["reason"], "confidence": 0, "label": "REJECTED"}
        
    mistral_api_key = os.getenv("MISTRAL_API_KEY")
    if not mistral_api_key:
        return {
            "verified": check["has_relevant_kw"],
            "reason": "Passed format check." if check["has_relevant_kw"] else "File name doesn't match document naming conventions.",
            "confidence": 65 if check["has_relevant_kw"] else 35,
            "label": "APPROVED" if check["has_relevant_kw"] else "SUSPICIOUS"
        }
    
    try:
        # If we have base64 image data, do REAL VISUAL OCR verification with Gemini!
        # This completely ignores the file name and only looks at the image pixels.
        if req.base64Data:
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if not gemini_api_key:
                return {"verified": False, "reason": "Gemini API key missing", "confidence": 0, "label": "REJECTED"}
                
            clean_base64 = req.base64Data
            if "base64," in clean_base64:
                clean_base64 = clean_base64.split("base64,")[1]
                
            prompt_text = f"""You are an AI document compliance checker for a FinTech investment platform in India.
Look at this uploaded image. The user claims it is a "{req.docType}" document.
- If docType is 'business': we need a Business Registration, GST Certificate, MSME/Udyam, or Trade License.
- If docType is 'kyc': we need an Aadhaar, PAN Card, Passport, Voter ID, or Driving License.

Analyze the visual contents of the image:
1. Does it look like a legitimate document? (Check for government logos, stamps, ID formats).
2. Does it match the requested '{req.docType}' category?
3. If it is a random selfie, meme, dog, or unrelated photo, REJECT it immediately with 0 confidence.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{{"verified": true|false, "label": "APPROVED"|"SUSPICIOUS"|"REJECTED", "confidence": <0-100>, "reason": "<one clear sentence about what document you see>"}}"""

            import requests
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt_text},
                        {"inline_data": {"mime_type": "image/jpeg", "data": clean_base64}}
                    ]
                }],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
            res = requests.post(gemini_url, headers=headers, json=payload)
            res_data = res.json()
            
            if "candidates" not in res_data:
                raise Exception(f"Gemini API Error: {res_data}")
                
            text_response = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            import json
            return json.loads(text_response)
            
        else:
            # Fallback to pure filename analysis
            model = ChatMistralAI(api_key=mistral_api_key, model="mistral-large-latest")
            prompt = PromptTemplate.from_template(
                """You are an AI document compliance checker for a FinTech investment platform in India.
    
    A startup founder has uploaded a file named: "{fileName}"
    Document type required: "{docType}"
      - If docType is 'business': accepts Business Registration, GST Certificate, MSME/Udyam, Trade License
      - If docType is 'kyc': accepts Aadhaar, PAN Card, Passport, Voter ID, Driving License
    
    IMPORTANT CONTEXT:
    - Founders often photograph their documents with a phone camera. Phone camera files are often named like "IMG_20241015_123456.jpg", "DCIM_photo.jpg", "CAM_001.jpg", "20240315_aadhaar.jpg".
    - A file named "aadhaar.jpg", "pan_card.pdf", "gst_certificate.pdf" is clearly APPROVED.
    - A file that is completely unrelated (e.g. "vacation.jpg", "logo.png", "meme.jpg") should be REJECTED.
    - A file that is vague/generic (e.g. "scan001.pdf", "document.pdf", "image.jpg", "photo.png", "file.pdf", "Screenshot_2024.jpg") MUST be marked SUSPICIOUS with confidence 50. Since we cannot analyze the image content right now, do NOT blindly approve generic filenames.
    - ONLY mark SUSPICIOUS if the file name actively implies it might be wrong (e.g., "driving_license.jpg" when asking for Business Registration).
    
    Respond ONLY in this exact JSON format (no markdown, no extra text):
    {{"verified": true|false, "label": "APPROVED"|"SUSPICIOUS"|"REJECTED", "confidence": <0-100>, "reason": "<one clear sentence>"}}
    """
            )
            chain = prompt | model
            response = chain.invoke({"fileName": req.fileName, "docType": req.docType})
        
        raw_response = response.content.strip()
        if raw_response.startswith("```"):
            lines = raw_response.split("\n")
            if lines[0].startswith("```"): lines = lines[1:]
            if lines[-1].startswith("```"): lines = lines[:-1]
            raw_response = "\n".join(lines).strip()
            
        result = json.loads(raw_response)
        return result
    except Exception as e:
        # Fallback if Mistral fails
        return {
            "verified": check.get("has_relevant_kw", False),
            "reason": "AI validation temporarily unavailable. Reverted to filename analysis.",
            "confidence": 50,
            "label": "SUSPICIOUS"
        }


# ─── Startup Analyze: AI Scorecard ────────────────────────────────────────────
@app.post("/startup/analyze", dependencies=[Depends(verify_api_key)])
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
@app.post("/api/compare", dependencies=[Depends(verify_api_key)])
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
