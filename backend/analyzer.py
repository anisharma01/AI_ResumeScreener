import os
import json
import asyncio
from typing import List, Dict
import groq
from schemas import CandidateProfile

async def analyze_single_resume(
    resume_filename: str, 
    resume_text: str, 
    job_description: str, 
    api_key: str
) -> CandidateProfile:
    """
    Analyzes a single resume against a job description using Groq AI.
    Runs asynchronously in an executor pool to prevent blocking the event loop.
    """
    def _call_groq():
        # Initialize Groq client
        client = groq.Groq(api_key=api_key)
        
        # Use llama-3.3-70b-versatile for high intelligence, reasoning and structured JSON output
        model_name = "llama-3.3-70b-versatile"
        
        system_prompt = """
You are an expert technical recruiter and HR screener.
You will receive a candidate's resume text and a Job Description (JD). 
Your task is to analyze the candidate's alignment with the JD and return a structured JSON response.

You MUST strictly return a JSON object with the following fields:
1. "name": Full name of the candidate extracted from the resume. If not found, use a reasonable name derived from the text, or "Unknown Candidate".
2. "email": Email address extracted from the resume. If not found, return an empty string "".
3. "phone": Phone number extracted from the resume. If not found, return an empty string "".
4. "score": An integer from 0 to 100 indicating how well the candidate fits the job description.
5. "summary": A concise summary (2-3 sentences) of the candidate's profile and alignment with the job description.
6. "strong_areas": A JSON array of strings detailing 3 to 5 key strengths, skills, or experiences that align strongly with the job description.
7. "missing_skills": A JSON array of strings detailing 3 to 5 critical or nice-to-have requirements from the job description that are missing or weak in the resume.
8. "recommended_role": Recommended fit or action, strictly one of: "Interview", "Shortlist", or "Hold".

Your response MUST be a single raw JSON object and nothing else. Do not include any markdown wrappers (like ```json) or trailing conversational text.
"""
        
        user_prompt = f"""
Job Description:
\"\"\"
{job_description}
\"\"\"

Resume Text:
\"\"\"
{resume_text}
\"\"\"
"""
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=model_name,
            # Enforce JSON mode on Groq
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        
        # Parse the JSON string from Groq completion
        content = chat_completion.choices[0].message.content
        data = json.loads(content)
        
        # Parse into type-safe Pydantic schema
        return CandidateProfile(**data)

    # Wrap the blocking sync call in a run_in_executor to make it non-blocking
    loop = asyncio.get_running_loop()
    try:
        profile = await loop.run_in_executor(None, _call_groq)
        return profile
    except Exception as e:
        # Fallback profile in case of API failure for a single file, preserving other analyses
        return CandidateProfile(
            name=resume_filename.replace(".pdf", ""),
            email="",
            phone="",
            score=0,
            summary=f"Analysis failed for this file: {str(e)}",
            strong_areas=[],
            missing_skills=["N/A"],
            recommended_role="Hold"
        )

async def analyze_multiple_resumes(
    resumes: List[Dict[str, str]], 
    job_description: str, 
    api_key: str
) -> List[CandidateProfile]:
    """
    Runs concurrent analysis tasks for multiple resumes against the JD with rate-limit dampening.
    """
    # Use a Semaphore to limit concurrency to 2 parallel calls (prevents rate limits on Groq)
    sem = asyncio.Semaphore(2)
    
    async def _dampened_analyze(res, index):
        async with sem:
            # Stagger startup calls slightly (1.5 seconds per index offset)
            await asyncio.sleep(index * 1.5)
            return await analyze_single_resume(
                resume_filename=res["filename"],
                resume_text=res["text"],
                job_description=job_description,
                api_key=api_key
            )
            
    tasks = [_dampened_analyze(res, idx) for idx, res in enumerate(resumes)]
    
    # Wait for all concurrent Groq calls to complete
    results = await asyncio.gather(*tasks)
    
    # Sort candidates by score in descending order
    results.sort(key=lambda x: x.score, reverse=True)
    return results
