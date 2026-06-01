# ReScore AI — Intelligent AI Resume Screener & Candidate Ranker

ReScore AI is a modern, high-fidelity web application built to intelligently parse, evaluate, and rank up to **10 PDF resume files** against a provided Job Description (JD). It is powered by asynchronous FastAPI endpoints, Groq Llama-3.3 structured JSON outputs, JWT session authentication, sliding window rate limits, and an animated React dashboard with GPU-accelerated canvas wave particle graphics.

---

## ⚡ Key Features

*   **Parallel AI Screening**: Upload up to 10 resume PDFs simultaneously. Evaluates candidate profiles concurrently using Groq Llama-3.3.
*   **JWT Stateless Authentication**: User registration and login utilizing signed HMAC-SHA256 (`HS256`) tokens, secure PBKDF2 password hashing (100k iterations + random salts), and a local SQLite (`users.db`) data repository.
*   **Unified Nginx Reverse Proxy Gateway**: Configured a multi-container Docker compose environment using Nginx as a reverse proxy gateway (exposing port `3000` for both frontend assets and proxying `/api` internally), completely bypassing CORS issues.
*   **Thread-Safe Sliding-Window Rate Limiter**: custom-built middleware limiting request bounds (max 60 requests/minute per client IP) to block cost drain and brute-forcing.
*   **High-Speed Cost Optimizations**:
    *   *Jaccard Irrelevance Bypass*: Local Jaccard similarity baselining that automatically bypasses LLM calls completely for resumes with `<2% overlap`.
    *   *Near-0ms Response Caching*: Custom SHA-256 dual-hash memory cache targeting JD + Structured Resume values, delivering immediate local cache hits on repeated uploads.
    *   *Szymkiewicz-Simpson Overlap Coefficient*: Evaluates candidates using containment formulas to eliminate vocabulary-length bias.
    *   *PDF Boilerplate Stripper*: Cleans footers, duplicate sections, and warnings to reduce input tokens by 40%.
*   **Aesthetic Greyscale Dark Theme**: Premium dark-slate theme featuring drifting wave nodes and soft ambient particles running on HTML5 Canvas.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS v4, HTML5 Canvas API (GPU wave particles), Lucide Icons.
*   **Backend**: FastAPI (Python 3.11), PyPDF, Uvicorn, PyJWT, SQLite (`users.db`).
*   **AI/LLM Integration**: Groq Llama-3.3-70b-versatile, JSON Schema Structured Output Mode.
*   **Deployment**: Docker Compose, Nginx, Kubernetes Manifests.

---

## 🚀 Single-Command Docker Deployment

ReScore AI is fully dockerized and ready to deploy locally in a single command.

### 1. Configure Secrets
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_32_char_hex_secret_here
```

### 2. Launch the Platform
```bash
docker-compose up --build -d
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application!

*   **Frontend & Proxy Gateway**: `http://localhost:3000`
*   **FastAPI Backend Server**: `http://localhost:8000`
*   **Swagger API Docs**: `http://localhost:8000/docs`
