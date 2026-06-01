import asyncio
import json
from typing import List, Dict
import groq

from app.config import settings
from app.models.schemas import CandidateProfile
from app.services.groq_service import get_groq_client
from app.services.pdf_service import clean_resume_text, segment_resume_into_structured_data
from app.utils.helpers import generate_sha256_hash, calculate_jaccard_similarity

# Global in-memory cache for resume analyses
# Key: sha256(structured_resume_data_json + jd_text)
# Value: CandidateProfile object
_analysis_cache: Dict[str, CandidateProfile] = {}

async def analyze_single_candidate(
    resume_filename: str, 
    raw_text: str, 
    job_description: str
) -> CandidateProfile:
    """
    Coordinates the complete analysis pipeline for a single resume.
    1. Preprocesses and cleans raw PDF text.
    2. Segments text into structured resume sections.
    3. Runs lightweight local pre-scoring (keyword overlap).
    4. Automatically bypasses AI calls for completely irrelevant files.
    5. Performs optional memory cache lookups.
    6. Triggers optimized Groq Llama calls for detailed screen.
    """
    # Step 1: Preprocess and clean PDF text
    cleaned_text = clean_resume_text(raw_text)
    
    # Step 2: Segment text into structured fields
    structured_data = segment_resume_into_structured_data(cleaned_text)
    structured_json_str = json.dumps(structured_data)
    
    # Step 3: Local Pre-Scoring (Jaccard skill overlap)
    local_overlap = calculate_jaccard_similarity(cleaned_text, job_description)
    local_score = int(local_overlap * 100)
    
    # Step 4: Cost Optimization - Irrelevance Bypass
    # If the candidate has less than 2% vocabulary overlap, bypass the AI completely
    if local_overlap <= 0.02:
        return CandidateProfile(
            name=resume_filename.replace(".pdf", ""),
            email="Not Available",
            phone="Not Available",
            score=local_score,
            summary="Candidate profile has zero relevance to the job description (Automatically bypassed by local pre-scoring).",
            strong_areas=[],
            missing_skills=["Core technical requirements match is extremely weak"],
            recommended_role="Hold"
        )
        
    # Step 5: Cache Lookup
    cache_key = None
    if settings.ENABLE_CACHING:
        # Generate cache key based on the structured resume and the targeted JD
        cache_key = generate_sha256_hash(structured_json_str + job_description)
        if cache_key in _analysis_cache:
            return _analysis_cache[cache_key]

    # Step 6: Groq LLM Analysis (Cache Miss)
    def _call_groq_api():
        client = get_groq_client()
        
        # Optimize prompt to be concise (reduces input tokens by ~30%)
        system_prompt = """
You are a professional technical recruiter. Compare the candidate's structured resume against the Job Description (JD).
You MUST return a JSON object with:
1. "name": String name (e.g. "Full Name"). If not found, use "Unknown Candidate".
2. "email": String email. If not found, return "Not Available".
3. "phone": String phone. If not found, return "Not Available".
4. "score": Integer 0-100.
5. "summary": Concise 2-3 sentence overview.
6. "strong_areas": List of strings (strengths).
7. "missing_skills": List of strings (gaps).
   * CRITICAL: Compare the candidate's total years of professional experience against any experience requirements in the JD (e.g., "5+ years of experience"). If the candidate's years of experience is less than required, you MUST explicitly include a clear entry in "missing_skills" (e.g., "Experience Gap: Has X years of experience, but JD requires Y years"). Do not add this if they meet or exceed the requirement.
8. "recommended_role": "Interview", "Shortlist", or "Hold".

Respond ONLY with valid, raw JSON.
"""
        
        user_prompt = f"""
Job Description:
{job_description}

Structured Resume Data:
{structured_json_str}
"""
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        
        response_content = chat_completion.choices[0].message.content
        parsed_data = json.loads(response_content)
        
        # Enforce/enrich score using local matching metrics
        # E.g., Combine local Jaccard scoring (30% weight) with Groq's cognitive score (70% weight)
        groq_score = parsed_data.get("score", 0)
        final_score = int((0.3 * local_score) + (0.7 * groq_score))
        parsed_data["score"] = min(max(final_score, 0), 100) # Keep within 0-100 bounds
        
        profile = CandidateProfile(**parsed_data)
        
        # Save to global memory cache if caching is active
        if settings.ENABLE_CACHING and cache_key:
            _analysis_cache[cache_key] = profile
            
        return profile

    # Offload the blocking Groq HTTP request to a background thread
    loop = asyncio.get_running_loop()
    try:
        profile = await loop.run_in_executor(None, _call_groq_api)
        return profile
    except Exception as e:
        # Fallback profile in case of API failure for a single file, preserving other analyses
        return CandidateProfile(
            name=resume_filename.replace(".pdf", ""),
            email="Not Available",
            phone="Not Available",
            score=local_score,
            summary=f"Analysis failed for this file: {str(e)}",
            strong_areas=[],
            missing_skills=["N/A"],
            recommended_role="Hold"
        )

async def analyze_batch_resumes(
    resumes: List[Dict[str, str]], 
    job_description: str
) -> List[CandidateProfile]:
    """
    Coordinates dynamic concurrent analysis for a batch of resumes.
    """
    count = len(resumes)
    
    # 1. Resolve Concurrency Limit
    if settings.CONCURRENCY_LIMIT is not None:
        concurrency = settings.CONCURRENCY_LIMIT
    else:
        # Dynamic concurrency based on batch size
        if count <= 2:
            concurrency = 2
        elif count <= 5:
            concurrency = 3
        else:
            concurrency = 4
            
    sem = asyncio.Semaphore(concurrency)
    
    async def _dampened_analyze(res, index):
        async with sem:
            # Stagger startup calls (1.0 second per index offset)
            await asyncio.sleep(index * 1.0)
            return await analyze_single_candidate(
                resume_filename=res["filename"],
                raw_text=res["text"],
                job_description=job_description
            )
            
    tasks = [_dampened_analyze(res, idx) for idx, res in enumerate(resumes)]
    results = await asyncio.gather(*tasks)
    
    # Sort candidates by score descending
    results.sort(key=lambda x: x.score, reverse=True)
    return results
