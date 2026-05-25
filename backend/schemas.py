from pydantic import BaseModel, Field
from typing import List, Optional

class CandidateProfile(BaseModel):
    name: str = Field(description="Full name of the candidate extracted from the resume. If not found, use 'Unknown Candidate'.")
    email: str = Field(description="Email address extracted from the resume. If not found, return an empty string.")
    phone: str = Field(description="Phone number extracted from the resume. If not found, return an empty string.")
    score: int = Field(description="Match score from 0 to 100 indicating how well the candidate fits the job description.")
    summary: str = Field(description="A concise summary (2-3 sentences) of the candidate's profile and alignment with the job description.")
    strong_areas: List[str] = Field(description="Key strengths, skills, or experiences that align strongly with the job description.")
    missing_skills: List[str] = Field(description="Critical or nice-to-have requirements from the job description that are missing or weak in the resume.")
    recommended_role: str = Field(description="Recommended fit or action, e.g., 'Interview', 'Shortlist', 'Hold'.")

class AnalysisResponse(BaseModel):
    candidates: List[CandidateProfile]
