import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

# Resolve the backend directory (parent of app/ folder) and load .env safely
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=backend_dir / ".env")

from app.config import settings
from app.services.groq_service import init_groq_client
from app.api.routes import router

# 1. Production Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("app.main")

# 2. Reusable Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Events
    logger.info("Initializing application startup sequence...")
    try:
        # Pre-initialize the reusable global Groq client once
        init_groq_client()
        logger.info("Groq API client successfully initialized globally.")
    except Exception as e:
        logger.warning(f"Groq API client initialization failed: {str(e)}. (Make sure to set GROQ_API_KEY in production)")
        
    yield
    
    # Shutdown Events
    logger.info("Shutting down application resources...")

# 3. Instantiate FastAPI
app = FastAPI(
    title="TalentLens AI Screener API",
    description="Refactored and optimized FastAPI backend powered by Groq and Llama-3.3-70b-versatile.",
    version="2.0.0",
    lifespan=lifespan
)

# 4. Configurable CORS Whitelisting
# Loads custom allowed domains from env ALLOWED_ORIGINS to secure API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Production Readiness Placeholders
# ==============================================================================
# - Rate Limiting: For production, import 'slowapi' and add rate limiter limits
#   to routes.py, or rate limit directly inside Nginx reverse proxy.
# - Request Tracing: Integrate OpenTelemetry middleware or add custom Request IDs
#   to headers to trace requests across microservices.
# - Log Rotation: Configure a RotatingFileHandler to write logs safely to disk
#   without bloating storage.
# ==============================================================================

# 6. Include API Routers
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting uvicorn server locally...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
