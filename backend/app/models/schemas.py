from pydantic import BaseModel, Field, field_validator
from typing import List

class CandidateProfile(BaseModel):
    name: str = Field(description="Full name of the candidate extracted from the resume. If not found, use 'Unknown Candidate'.")
    email: str = Field(default="Not Available", description="Email address extracted from the resume. If not found, return 'Not Available'.")
    phone: str = Field(default="Not Available", description="Phone number extracted from the resume. If not found, return 'Not Available'.")
    score: int = Field(description="Match score from 0 to 100 indicating how well the candidate fits the job description.")
    summary: str = Field(description="A concise summary (2-3 sentences) of the candidate's profile and alignment with the job description.")
    strong_areas: List[str] = Field(description="Key strengths, skills, or experiences that align strongly with the job description.")
    missing_skills: List[str] = Field(description="Critical or nice-to-have requirements from the job description that are missing or weak in the resume.")
    recommended_role: str = Field(description="Recommended fit or action, e.g., 'Interview', 'Shortlist', 'Hold'.")

    @field_validator("email", "phone", mode="before")
    @classmethod
    def allow_none_as_not_available(cls, v):
        """
        Converts null/None, empty strings, or placeholders from the LLM output into 'Not Available'.
        """
        if v is None:
            return "Not Available"
        val = str(v).strip()
        if not val or val.lower() in ["none", "null", "n/a", "not available", "not_available"]:
            return "Not Available"
        return val

class AnalysisResponse(BaseModel):
    candidates: List[CandidateProfile]
