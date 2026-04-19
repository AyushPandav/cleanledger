from pydantic import BaseModel, Field
from typing import Optional, List


class TeamMember(BaseModel):
    name: str
    role: str


class Milestone(BaseModel):
    title: str
    targetDate: Optional[str] = None
    completed: Optional[bool] = False


class StartupProfileRequest(BaseModel):
    userId: str
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    fundingGoal: Optional[float] = None
    stage: Optional[str] = None
    teamMembers: Optional[List[TeamMember]] = []
    milestones: Optional[List[Milestone]] = []
    pitchVideoUrl: Optional[str] = None


class AnalyzeRequest(BaseModel):
    description: Optional[str] = None
    industry: Optional[str] = None
    fundingGoal: Optional[float] = None
    teamMembers: Optional[List[TeamMember]] = []
    milestones: Optional[List[Milestone]] = []
    pitchVideoUrl: Optional[str] = None
    profileCompletionScore: Optional[int] = 0
    foundedYear: Optional[str] = None
    founderExperience: Optional[str] = None
    businessRegistered: Optional[bool] = False
    kycCompleted: Optional[bool] = False
    panId: Optional[str] = None
    gstRegistration: Optional[str] = None
    businessFileName: Optional[str] = None
    kycFileName: Optional[str] = None


class StartupData(BaseModel):
    id: str
    name: str
    industry: str
    stage: str
    description: str


class CompareRequest(BaseModel):
    startup1: StartupData
    startup2: StartupData

class CreateQuestionRequest(BaseModel):
    startupId: str
    investorId: str
    question: str
    isAnonymous: Optional[bool] = False

class AnswerQuestionRequest(BaseModel):
    answer: str
