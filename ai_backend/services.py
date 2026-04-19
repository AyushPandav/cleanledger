import os
import json
from typing import Optional
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import PromptTemplate
from models import AnalyzeRequest


def calculate_completion_score(data: dict) -> int:
    """Calculate profile completion score precisely matching frontend logic."""
    score = 0
    if data.get("name"): score += 10
    if data.get("description"): score += 20
    if data.get("industry"): score += 10
    if data.get("fundingGoal"): score += 15
    if data.get("teamMembers") and len(data["teamMembers"]) > 0: score += 20
    if data.get("milestones") and len(data["milestones"]) > 0: score += 25
    if data.get("foundedYear"): score += 5
    if data.get("founderExperience"): score += 5
    if data.get("businessRegistered"): score += 15
    if data.get("kycCompleted"): score += 15
    if data.get("panId"): score += 10
    if data.get("gstRegistration"): score += 10
    if data.get("pitchVideoUrl"): score += 20
    return score


from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, END
import json

class GraphState(TypedDict):
    req: AnalyzeRequest
    mistral_api_key: str
    score: int
    preliminary_risk: str
    preliminary_trust: int
    warnings: List[str]
    insights: List[str]
    suggestions: List[str]
    ai_raw_json: str
    final_output: dict
    error: Optional[str]

def rule_engine_node(state: GraphState):
    req = state["req"]
    score = req.profileCompletionScore or 0
    warnings, insights, suggestions = [], [], []

    if not req.description:
        warnings.append("No description provided — investors cannot evaluate your startup.")
        suggestions.append("Add a compelling 2-3 sentence description.")
    if not req.teamMembers or len(req.teamMembers) == 0:
        warnings.append("No team members listed — investors heavily weigh team quality.")
        suggestions.append("Add at least 2 key team members with their roles.")
    if not req.milestones or len(req.milestones) == 0:
        warnings.append("No milestones defined — this signals lack of planning.")
        suggestions.append("Define 3-5 key milestones with target dates.")
    if not req.industry:
        suggestions.append("Specify your industry to appear in filtered searches.")
    if not req.fundingGoal:
        suggestions.append("Set a funding goal to give investors a clear target.")

    # Legitimacy Check
    if req.businessRegistered:
        insights.append("✔ Verified Business Registration")
        score += 15
    else:
        warnings.append("Business Registration not verified. Severe trust hazard.")
    if req.kycCompleted:
        insights.append("✔ Founder KYC Completed")
        score += 15
    else:
        suggestions.append("Complete KYC to secure a 'Verified' badge and drastically increase trust.")

    if req.panId: score += 10
    else: warnings.append("No PAN provided. Tax compliance cannot be verified.")
    if req.gstRegistration: score += 10
    else: suggestions.append("Adding GST Registration proves operational revenue activity.")

    if not req.foundedYear: suggestions.append("Clarify the year your startup was founded.")
    if not req.founderExperience: suggestions.append("List founder industry experience to build confidence.")

    if req.pitchVideoUrl:
        insights.append("✔ Founder Pitch Video Provided (Boosts investor confidence significantly)")
        score += 20
        # If it's over 100, that's fine. We normalize if needed, but extra credit is good!

    if score < 40 or not req.description:
        preliminary_risk = "High"
        preliminary_trust = max(10, score)
    elif score < 70:
        preliminary_risk = "Medium"
        preliminary_trust = 40 + int(score * 0.4)
    else:
        preliminary_risk = "Low"
        preliminary_trust = 60 + int((score - 70) * 1.3)
    preliminary_trust = min(preliminary_trust, 95)

    return {
        "score": score,
        "warnings": warnings,
        "insights": insights,
        "suggestions": suggestions,
        "preliminary_risk": preliminary_risk,
        "preliminary_trust": preliminary_trust
    }

def mistral_analysis_node(state: GraphState):
    req = state["req"]
    score = state["score"]
    
    try:
        model = ChatMistralAI(api_key=state["mistral_api_key"], model="mistral-large-latest")
        prompt = PromptTemplate.from_template(
            """You are a senior VC analyst evaluating a startup for investment readiness.

Profile Context:
- Description: {description}
- Industry: {industry}
- Funding Goal: {fundingGoal}
- Verified Business Registration: {businessRegistered}
- Uploaded Business File: {businessFileName}
- Uploaded KYC File: {kycFileName}
- Pitch Video Input: {pitchVideoInput}
- Profile Completion Score: {score}/100

CRITICAL RULES FOR STRICT AI VERIFICATION:
1. PITCH VIDEO: Examine the 'Pitch Video Input'. If it contains random gibberish or a clearly fake URL, you MUST deduct 30 points and add a WARNING. If it's a valid link (youtube, gdrive, etc.), boost Trust by 15.
2. DOCUMENTS: Examine the 'Uploaded Business File' and 'Uploaded KYC File'. 
   - If the file name looks like a typical random image/unrelated file (e.g. 'dog.jpg', 'screenshot.png', 'meme', 'fake'), you MUST revoke their verified status, mark them 'High Risk', heavily deduct trust points (-40), and add a severe WARNING: "Uploaded documents appear fraudulent or unrelated to legal KYC/Business requirements."
   - If the file names look legitimate (e.g. 'certificate_of_incorporation.pdf', 'pan_card.jpg'), praise the compliance.
3. Trust Score must reflect these strict verification penalties.

Based ONLY on the above data, respond STRICTLY in this JSON format (no extra text, no markdown block):
{{
  "riskLevel": "Low" | "Medium" | "High",
  "trustScore": <int>,
  "insights": ["<positive observation>"],
  "warnings": ["<red flag>"],
  "suggestions": ["<actionable step>"]
}}
"""
        )
        chain = prompt | model
        response = chain.invoke({
            "description": req.description or "Not provided",
            "industry": req.industry or "Not provided",
            "fundingGoal": f"₹{req.fundingGoal:,.0f}" if req.fundingGoal else "Not set",
            "businessRegistered": "Yes" if req.businessRegistered else "No",
            "kycCompleted": "Yes" if req.kycCompleted else "No",
            "teamCount": len(req.teamMembers) if req.teamMembers else 0,
            "milestoneCount": len(req.milestones) if req.milestones else 0,
            "businessFileName": req.businessFileName if req.businessFileName else "None Uploaded",
            "kycFileName": req.kycFileName if req.kycFileName else "None Uploaded",
            "pitchVideoInput": req.pitchVideoUrl if req.pitchVideoUrl else "None Provided",
            "score": score
        })
        return {"ai_raw_json": response.content.strip()}
    except Exception as e:
        return {"error": str(e)}

def merge_results_node(state: GraphState):
    if state.get("error"):
        print(f"Graph Fallback Hit! Error: {state['error']}")
        return {
            "final_output": {
                "riskLevel": state["preliminary_risk"],
                "trustScore": state["preliminary_trust"],
                "insights": state["insights"] + [f"Profile is {state['score']}% complete."],
                "warnings": state["warnings"],
                "suggestions": state["suggestions"]
            }
        }
        
    try:
        raw = state["ai_raw_json"]
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        ai_data = json.loads(raw.strip())
        
        # Merge AI output with Rule output robustly
        final_warnings = state["warnings"].copy()
        for w in ai_data.get("warnings", []):
            if w not in final_warnings: final_warnings.insert(0, w)
            
        final_suggestions = state["suggestions"].copy()
        for s in ai_data.get("suggestions", []):
            if s not in final_suggestions: final_suggestions.append(s)
            
        final_insights = ai_data.get("insights", [])
        if not final_insights: final_insights = state["insights"]

        return {
            "final_output": {
                "riskLevel": ai_data.get("riskLevel", state["preliminary_risk"]),
                "trustScore": int(ai_data.get("trustScore", state["preliminary_trust"])),
                "insights": final_insights,
                "warnings": final_warnings,
                "suggestions": final_suggestions
            }
        }
    except Exception as e:
        print(f"JSON Parse Error in Graph: {str(e)}")
        # Fallback if AI JSON output is mangled
        return {
            "final_output": {
                "riskLevel": state["preliminary_risk"],
                "trustScore": state["preliminary_trust"],
                "insights": state["insights"],
                "warnings": state["warnings"],
                "suggestions": state["suggestions"] + [f"AI could not parse detailed feedback from Mistral."]
            }
        }

# --- Compile the LangGraph Workflow ---
workflow = StateGraph(GraphState)
workflow.add_node("rules", rule_engine_node)
workflow.add_node("mistral", mistral_analysis_node)
workflow.add_node("merge", merge_results_node)

workflow.set_entry_point("rules")
workflow.add_edge("rules", "mistral")
workflow.add_edge("mistral", "merge")
workflow.add_edge("merge", END)

startup_analyzer_graph = workflow.compile()


def analyze_startup_profile(req: AnalyzeRequest, mistral_api_key: str) -> dict:
    """
    Executes the LangGraph pipeline to analyze the startup using rules and Mistral AI.
    """
    initial_state = {
        "req": req,
        "mistral_api_key": mistral_api_key,
        "score": req.profileCompletionScore or 0,
        "preliminary_risk": "High",
        "preliminary_trust": 0,
        "warnings": [],
        "insights": [],
        "suggestions": [],
        "ai_raw_json": "",
        "final_output": {},
        "error": None
    }
    
    final_state = startup_analyzer_graph.invoke(initial_state)
    return final_state["final_output"]
