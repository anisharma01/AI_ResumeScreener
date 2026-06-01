import groq
from app.config import settings

# Global reusable Groq client instance
_client = None

def init_groq_client(api_key: str = None) -> groq.Groq:
    """
    Initializes the global reusable Groq client during FastAPI application startup.
    """
    global _client
    key = api_key or settings.GROQ_API_KEY
    if not key:
        raise ValueError("Groq API Key is missing. Please set the GROQ_API_KEY environment variable.")
    
    # Initialize the client once globally, resolving the internal httpx proxies conflicts
    _client = groq.Groq(api_key=key)
    return _client

def get_groq_client() -> groq.Groq:
    """
    Retrieves the active global Groq client, performing lazy initialization if needed.
    """
    if _client is None:
        init_groq_client()
    return _client
