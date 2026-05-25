import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text from raw PDF bytes.
    """
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text_content = []
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
                
        full_text = "\n".join(text_content).strip()
        if not full_text:
            raise ValueError("No text could be extracted from the PDF file. It might be scanned or empty.")
            
        return full_text
    except Exception as e:
        raise ValueError(f"Error parsing PDF file: {str(e)}")
