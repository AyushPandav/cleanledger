import os
import json
from typing import Optional
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import PromptTemplate
from models import AnalyzeRequest


def calculate_completion_score(data: dict) -> int:
    """Calculate profile completion score out of 100."""
    score = 0
    if data.get("name"):
        score += 10
    if data.get("description"):
        score += 20
    if data.get("industry"):
        score += 10
    if data.get("fundingGoal"):
        score += 15
    if data.get("teamMembers") and len(data["teamMembers"]) > 0:
        score += 20
    if data.get("milestones") and len(data["milestones"]) > 0:
        score += 25
    return score


def analyze_startup_profile(req: AnalyzeRequest, mistral_api_key: str) -> dict:
    """
    Calls Mistral AI to evaluate a startup profile.
    Returns riskLevel, trustScore, insights, warnings, suggestions.
    """
    # --- Pre-analysis rule-based layer ---
    warnings = []
    insights = []
    suggestions = []

    score = req.profileCompletionScore or 0

    if not req.description:
        warnings.append("No description provided — investors cannot evaluate your startup.")
        suggestions.append("Add a compelling 2-3 sentence description of what your startup does.")

    if not req.teamMembers or len(req.teamMembers) == 0:
        warnings.append("No team members listed — investors heavily weigh team quality.")
        suggestions.append("Add at least 2 key team members with their roles.")

    if not req.milestones or len(req.milestones) == 0:
        warnings.append("No milestones defined — this signals lack of planning to investors.")
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
        warnings.append("Business Registration not verified. This is a severe trust hazard for investors.")

    if req.kycCompleted:
        insights.append("✔ Founder KYC Completed")
        score += 15
    else:
        suggestions.append("Complete KYC to secure a 'Verified' badge and drastically increase your trust score.")

    if req.panId:
        score += 10
    else:
        warnings.append("No PAN provided. Tax compliance cannot be verified.")

    if req.gstRegistration:
        score += 10
    else:
        suggestions.append("Adding GST Registration details proves operational revenue activity and tax integrity.")

    if not req.foundedYear:
        suggestions.append("Clarify the year your startup was founded.")
    if not req.founderExperience:
        suggestions.append("List your founders' industry experience to build confidence.")

    # Preliminary risk + trust based on rules
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

    # --- Mistral AI deep analysis ---
    try:
        model = ChatMistralAI(api_key=mistral_api_key, model="mistral-large-latest")

        prompt = PromptTemplate.from_template(
            """You are a senior venture capital analyst evaluating a startup for investment readiness.

Startup Profile:
- Description: {description}
- Industry: {industry}
- Funding Goal: {fundingGoal}
- Founded Year: {foundedYear}
- Founder Experience: {founderExperience}
- Verified Business Registration: {businessRegistered}
- KYC Completed: {kycCompleted}
- PAN Verified: {panId}
- GST Verified: {gstRegistration}
- Team Members: {teamCount}
- Milestones: {milestoneCount}
- Profile Completion Score: {score}/100

Based ONLY on the above data, respond STRICTLY in this JSON format (no extra text, no markdown):
{{
  "riskLevel": "Low" | "Medium" | "High",
  "trustScore": <number between 0-100>,
  "insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "warnings": ["<warning if any>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}}

Rules:
- riskLevel must be "Low" if score >= 70 AND KYC + Registration is verified. "High" if unverified + low score.
- trustScore must be between 0 and 100, strongly influenced by score and verified status. Automatically deduct points if KYC or Business is unverified.
- insights should be 2-3 positive observations about the startup
- warnings should highlight any red flags
- suggestions should be actionable steps to improve the profile
"""
        )

        chain = prompt | model
        response = chain.invoke({
            "description": req.description or "Not provided",
            "industry": req.industry or "Not provided",
            "fundingGoal": f"₹{req.fundingGoal:,.0f}" if req.fundingGoal else "Not set",
            "foundedYear": req.foundedYear or "Unknown",
            "founderExperience": req.founderExperience or "Unknown",
            "businessRegistered": "Yes" if req.businessRegistered else "No",
            "kycCompleted": "Yes" if req.kycCompleted else "No",
            "panId": "Yes, Active" if req.panId else "Not Connected",
            "gstRegistration": "Yes, Active" if req.gstRegistration else "Not Connected",
            "teamCount": len(req.teamMembers) if req.teamMembers else 0,
            "milestoneCount": len(req.milestones) if req.milestones else 0,
            "score": score
        })

        # Parse the JSON from Mistral
        raw = response.content.strip()
        # Strip possible markdown code fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())

        # Merge rule-based warnings/suggestions with AI ones
        ai_warnings = result.get("warnings", [])
        ai_suggestions = result.get("suggestions", [])
        for w in warnings:
            if w not in ai_warnings:
                ai_warnings.insert(0, w)
        for s in suggestions:
            if s not in ai_suggestions:
                ai_suggestions.append(s)

        return {
            "riskLevel": result.get("riskLevel", preliminary_risk),
            "trustScore": result.get("trustScore", preliminary_trust),
            "insights": result.get("insights", insights),
            "warnings": ai_warnings,
            "suggestions": ai_suggestions
        }

    except Exception as e:
        print(f"Mistral analysis error: {e}")
        # Fallback to rule-based result
        return {
            "riskLevel": preliminary_risk,
            "trustScore": preliminary_trust,
            "insights": [
                f"Profile is {score}% complete.",
                "Ensure all key fields are filled before approaching investors."
            ],
            "warnings": warnings,
            "suggestions": suggestions
        }
