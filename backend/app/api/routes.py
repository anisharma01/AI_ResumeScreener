import logging
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel

from app.config import settings
from app.models.schemas import AnalysisResponse
from app.services.pdf_service import extract_text_from_pdf
from app.services.analysis_service import analyze_batch_resumes
from app.utils.auth import register_user, authenticate_user, create_access_token, get_current_user
from app.utils.rate_limiter import rate_limit_dependency

# Configure routes logging
logger = logging.getLogger("app.api")

router = APIRouter()

class UserAuth(BaseModel):
    username: str
    password: str

@router.get("/api/health")
def health_check():
    """
    Exposes service health status and checks if Groq key is loaded on the server.
    """
    return {
        "status": "healthy",
        "groq_configured": bool(settings.GROQ_API_KEY)
    }

@router.post("/api/auth/register", dependencies=[Depends(rate_limit_dependency)])
def register(auth_data: UserAuth):
    """
    Registers a new user and hashes their password securely in SQLite.
    """
    username = auth_data.username.strip()
    password = auth_data.password
    if len(username) < 3 or len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Username must be at least 3 characters and password at least 6 characters."
        )
    success = register_user(username, password)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Username already exists. Please choose a different one."
        )
    return {"message": "Registration successful. You can now login!"}

@router.post("/api/auth/login", dependencies=[Depends(rate_limit_dependency)])
def login(auth_data: UserAuth):
    """
    Authenticates a user and returns a standard JWT token.
    """
    username = auth_data.username.strip()
    password = auth_data.password
    authenticated = authenticate_user(username, password)
    if not authenticated:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )
    token = create_access_token(username)
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": username
    }

@router.post("/api/analyze", response_model=AnalysisResponse, dependencies=[Depends(rate_limit_dependency)])
async def analyze_resumes(
    files: List[UploadFile] = File(...),
    jd: str = Form(...),
    current_user: str = Depends(get_current_user)
):
    """
    Endpoint that accepts up to 10 PDF files, extracts/structures their texts,
    pre-scores them locally, and invokes Groq Llama AI to rank candidates.
    """
    # 1. Enforce max file count limit
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="You can upload a maximum of 10 resume files at a time."
        )
        
    # 2. Verify server-side Groq Key is configured
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Groq API Key is not configured on the server. Please set the GROQ_API_KEY environment variable."
        )

    # 3. Read and validate uploaded files
    resumes = []
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    
    for file in files:
        # Validate MIME-type and extension
        is_pdf_extension = file.filename.lower().endswith(".pdf")
        is_pdf_mime = file.content_type in settings.ALLOWED_MIME_TYPES
        
        if not is_pdf_extension or not is_pdf_mime:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: '{file.filename}'. Only PDF documents (.pdf) are allowed."
            )
            
        try:
            # Read bytes to validate file size
            content = await file.read()
            if len(content) > max_bytes:
                raise HTTPException(
                    status_code=400,
                    detail=f"File size exceeds the allowed limit of {settings.MAX_FILE_SIZE_MB}MB: '{file.filename}'."
                )
                
            # Extract plain text from PDF
            text = extract_text_from_pdf(content)
            resumes.append({
                "filename": file.filename,
                "text": text
            })
        except HTTPException as he:
            # Re-raise standard HTTP exceptions (like file size violations)
            raise he
        except Exception as e:
            logger.error(f"Error parsing uploaded file '{file.filename}': {str(e)}")
            # Fallback text inside resume data so one corrupted file does not ruin the batch
            resumes.append({
                "filename": file.filename,
                "text": f"Error parsing PDF content: {str(e)}"
            })
            
    # 4. Trigger the optimized batch analysis pipeline
    try:
        ranked_candidates = await analyze_batch_resumes(resumes, jd)
        return AnalysisResponse(candidates=ranked_candidates)
    except Exception as e:
        logger.error(f"Analysis pipeline crashed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during resume analysis: {str(e)}"
        )
