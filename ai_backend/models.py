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
    description: Optional[str] = Field(None, max_length=2000)
    industry: Optional[str] = Field(None, max_length=100)
    fundingGoal: Optional[float] = Field(None, ge=0, le=1_000_000_000)
    teamMembers: Optional[List[TeamMember]] = Field([], max_items=50)
    milestones: Optional[List[Milestone]] = Field([], max_items=50)
    pitchVideoUrl: Optional[str] = Field(None, max_length=500)
    profileCompletionScore: Optional[int] = Field(0, ge=0, le=100)
    foundedYear: Optional[str] = Field(None, max_length=4)
    founderExperience: Optional[str] = Field(None, max_length=500)
    businessRegistered: Optional[bool] = False
    kycCompleted: Optional[bool] = False
    panId: Optional[str] = Field(None, max_length=20)
    gstRegistration: Optional[str] = Field(None, max_length=30)
    businessFileName: Optional[str] = Field(None, max_length=200)
    kycFileName: Optional[str] = Field(None, max_length=200)


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
