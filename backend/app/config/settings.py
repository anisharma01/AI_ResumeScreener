import os

# 1. Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# 2. Security & CORS Whitelist
# ALLOWED_ORIGINS should be a comma-separated list in env: e.g. "https://myfrontend.com,http://localhost:3000"
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [
    origin.strip().rstrip("/") 
    for origin in allowed_origins_raw.split(",") 
    if origin.strip()
]
# Fallback default if not specified (crucial for out-of-the-box dev experience)
if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = ["http://localhost:3000"]

# 3. File Bounds & Validation
MAX_FILE_SIZE_MB = float(os.getenv("MAX_FILE_SIZE_MB", "5.0"))
ALLOWED_MIME_TYPES = ["application/pdf"]

# 4. Pipeline & Optimization
# Concurrency limit (if specified in env). Otherwise, will scale dynamically
concurrency_limit_raw = os.getenv("CONCURRENCY_LIMIT")
CONCURRENCY_LIMIT = int(concurrency_limit_raw) if concurrency_limit_raw else None

# Optional Cache Activation
ENABLE_CACHING = os.getenv("ENABLE_CACHING", "true").lower() in ("true", "1", "yes")
