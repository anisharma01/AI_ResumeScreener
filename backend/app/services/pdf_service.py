import io
import re
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts raw plain text from binary PDF byte stream.
    """
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text_content = []
        
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
                
        full_text = "\n".join(text_content).strip()
        if not full_text:
            raise ValueError("No text could be extracted from the PDF file. It might be scanned or empty.")
            
        return full_text
    except Exception as e:
        raise ValueError(f"Error parsing PDF file: {str(e)}")

def clean_resume_text(text: str) -> str:
    """
    Strips irrelevant content, excess spaces, duplicate sections,
    and boilerplate references to minimize token size.
    """
    # 1. Strip redundant whitespace and carriage returns
    text = text.replace("\r", "")
    text = re.sub(r"[ \t]+", " ", text)  # multiple horizontal spaces -> single space
    text = re.sub(r"\n\s*\n+", "\n", text)  # multiple newlines -> single newline
    
    # 2. Heuristically strip common footer and reference boilerplates
    # e.g., "Page 1 of 3", "References available upon request", "Declaration: I hereby..."
    boilerplate_patterns = [
        r"page\s+\d+\s+of\s+\d+",
        r"references?\s+available\s+upon\s+request",
        r"declaration:\s*i\s+hereby\s+declare.*",
        r"i\s+hereby\s+declare\s+that\s+the\s+above\s+information.*"
    ]
    for pattern in boilerplate_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)
        
    return text.strip()

def segment_resume_into_structured_data(cleaned_text: str) -> dict:
    """
    Heuristically segments a cleaned resume string into structured sections using Regex headings.
    Saves massive amounts of tokens by omitting unstructured noise.
    """
    sections = {
        "contact_info": [],
        "skills": [],
        "experience": [],
        "education": [],
        "certifications": [],
        "projects": []
    }
    
    # Define standard headings for resume sections (without (?i), we pass re.IGNORECASE below)
    patterns = {
        "skills": r"\b(?:skills|technical\s+skills|expertise|key\s+competencies|proficiencies|technologies)\b",
        "experience": r"\b(?:experience|work\s+experience|employment|professional\s+experience|career\s+history)\b",
        "education": r"\b(?:education|academic\s+background|academic\s+profile|qualification|university)\b",
        "certifications": r"\b(?:certifications|certs|credentials|licenses)\b",
        "projects": r"\b(?:projects|personal\s+projects|academic\s+projects|portfolio)\b"
    }
    
    # Create unified regex pattern to split text based on these section indicators
    combined_pattern = "|".join(f"(?P<{key}>{val})" for key, val in patterns.items())
    
    # Split text while tracking where headers match (enforce case-insensitivity here!)
    matches = list(re.finditer(combined_pattern, cleaned_text, flags=re.IGNORECASE))
    
    if not matches:
        # Fallback: if no clear headers found, push all cleaned text into experience to avoid data loss
        sections["experience"].append(cleaned_text)
        return sections

    # Capture the header/contact segment (from index 0 to the first match start)
    first_match_start = matches[0].start()
    header_content = cleaned_text[0:first_match_start].strip()
    if header_content:
        sections["contact_info"].extend([line.strip() for line in header_content.split("\n") if line.strip()])

    # Segment text between match positions
    for idx, match in enumerate(matches):
        start_idx = match.end()
        end_idx = matches[idx + 1].start() if idx + 1 < len(matches) else len(cleaned_text)
        
        section_content = cleaned_text[start_idx:end_idx].strip()
        
        # Identify which named group matched
        for key in sections.keys():
            if key != "contact_info" and match.group(key):
                # Clean and append split content
                cleaned_lines = [line.strip() for line in section_content.split("\n") if line.strip()]
                sections[key].extend(cleaned_lines)
                break
                
    return sections
