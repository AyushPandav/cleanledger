from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import PromptTemplate

# Load the environment file from the root Fintech directory
load_dotenv(dotenv_path="../.env")

app = FastAPI()

# Allow frontend to make POST requests seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartupData(BaseModel):
    id: str
    name: str
    industry: str
    stage: str
    description: str

class CompareRequest(BaseModel):
    startup1: StartupData
    startup2: StartupData

import os
from pathlib import Path
from dotenv import load_dotenv

# Set explicit Path for the root .env
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

@app.post("/api/compare")
async def compare_startups(req: CompareRequest):
    mistral_api_key = os.getenv("MISTRAL_API_KEY")
    if not mistral_api_key:
        raise HTTPException(status_code=500, detail=f"MISTRAL_API_KEY not found in environment at {env_path}")
        
    try:
        # Initialize Mistral Chat model via LangChain
        model = ChatMistralAI(api_key=mistral_api_key, model="mistral-large-latest")
        
        prompt = PromptTemplate.from_template(
            """You are an elite venture capital analyst. 
            Compare the following two startups strictly based on three metric categories requested by the user: Risk, Trust Score, and Growth.
            Provide your analysis in a clear, concise bulleted format. Do not use overly verbose language.

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
