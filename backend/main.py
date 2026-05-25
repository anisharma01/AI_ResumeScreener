import os
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

from parser import extract_text_from_pdf
from analyzer import analyze_multiple_resumes
from schemas import AnalysisResponse

app = FastAPI(
    title="AI Resume Screener API (Groq)",
    description="FastAPI service for parsing PDF resumes and scoring/ranking them using Groq AI.",
    version="1.0.0"
)

# Allow CORS for development and Docker environment routing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """
    Basic health check endpoint.
    """
    return {
        "status": "healthy",
        "groq_configured": bool(os.getenv("GROQ_API_KEY"))
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_resumes(
    files: List[UploadFile] = File(...),
    jd: str = Form(...),
    x_groq_key: str = Header(None, alias="X-Groq-Key")
):
    """
    Accepts up to 10 PDF resumes and a Job Description.
    Extracts content, sends to Groq AI, ranks by score, and returns the results.
    """
    # 1. Enforce max file limit
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="You can upload up to 10 resume files at a time."
        )
    
    # 2. Resolve Groq API Key (check Env Var first, then Request Header)
    api_key = os.getenv("GROQ_API_KEY") or x_groq_key
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Groq API Key is missing. Please set the GROQ_API_KEY environment variable on the server or provide it in the X-Groq-Key request header."
        )

    # 3. Parse PDFs and prepare resume data for analysis
    resumes = []
    for file in files:
        # Validate that the file is a PDF
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: '{file.filename}'. Only PDF files are allowed."
            )
        
        try:
            content = await file.read()
            text = extract_text_from_pdf(content)
            resumes.append({
                "filename": file.filename,
                "text": text
            })
        except Exception as e:
            # Add a placeholder for this candidate if parsing failed
            resumes.append({
                "filename": file.filename,
                "text": f"Error parsing PDF content: {str(e)}"
            })
            
    # 4. Trigger concurrent analysis
    try:
        ranked_candidates = await analyze_multiple_resumes(resumes, jd, api_key)
        return AnalysisResponse(candidates=ranked_candidates)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during resume analysis: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
