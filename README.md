# TalentLens AI — Intelligent Resume Screener & Candidate Ranker

TalentLens AI is a modern, high-fidelity web application built to intelligently parse, evaluate, and rank up to **10 PDF resume files** against a provided Job Description (JD). It leverages asynchronous FastAPI endpoints, Groq's high-speed Llama-3.3 AI structured JSON output generation, an animated React dashboard styled with Tailwind CSS v4, Docker, and Kubernetes manifests.

---

## ⚡ Key Features
- **Parallel AI Screening**: Upload up to 10 resume PDFs simultaneously. Evaluates candidate profiles concurrently using Groq Llama-3.3.
- **Strict PDF Filtering**: Rejects invalid file extensions immediately at both client and server layers.
- **Job Match Ratings**: Generates a reliable score from `0` to `100` representing JD-profile alignment.
- **Detailed Gap Analysis**: Automatically isolates candidate strengths and missing prerequisite skills.
- **Actionable Decisions**: Automatically groups and ranks candidates into **Interview**, **Shortlist**, and **Hold** lists.
- **Secure Key Settings**: Store your Groq API key in local storage via the UI settings modal or load it server-side using the `GROQ_API_KEY` environment variable.

---

## 🛠️ Architecture Stack
1. **Frontend**: React (Vite), Tailwind CSS v4, Lucide React Icons.
2. **Backend**: FastAPI (Python 3.11), Uvicorn, PyPDF text extractor, groq SDK.
3. **Containerization**: Multi-stage Docker builds for production performance.
4. **Orchestration**: Kubernetes Deployment, ClusterIP/NodePort Services, ConfigMaps.
5. **CI/CD**: GitHub Actions workflows validating lint rules, builds, and manifest configurations.

---

## 📂 Project Structure
```text
resume-screener/
├── docker-compose.yml       # Orchestrates local container deployment
├── README.md                # System documentation and manuals
├── frontend/
│   ├── Dockerfile           # Multi-stage production build (Node -> Nginx)
│   ├── nginx.conf           # Custom Nginx path fallback configuration
│   ├── index.html           # Target HTML index with Google font loaders
│   ├── package.json         # Node module settings and dependencies
│   ├── vite.config.js       # Vite build setup with React & Tailwind v4
│   └── src/
│       ├── main.jsx         # React application entrypoint mount
│       ├── index.css        # Tailwind directives & global animations
│       ├── App.jsx          # UI layout coordinator & state manager
│       └── components/      # UI components
│           ├── Header.jsx               # Navigation bar & API Config modal
│           ├── JobDescriptionInput.jsx  # Textarea & JD template presets
│           ├── ResumeUploader.jsx       # Drag & drop PDF file uploader
│           ├── RankedList.jsx           # Sorted list of candidate cards
│           └── CandidateDetail.jsx      # Skill lists & recommendations
├── backend/
│   ├── Dockerfile           # Optimized Python 3.11-slim container
│   ├── requirements.txt     # Python backend dependencies
│   ├── main.py              # FastAPI server, endpoints, and CORS middleware
│   ├── schemas.py           # Pydantic structured output models
│   ├── parser.py            # PDF reader wrapper logic
│   └── analyzer.py          # Groq AI asynchronous client logic
└── k8s/                     # Kubernetes manifests
    ├── configmap.yaml       # Dynamic system variables
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    └── frontend-service.yaml
```

---

## 🚀 Local Development Setup

To run both services natively on your local machine:

### 1. Backend Service
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set your API Key (Optional: Can also be loaded automatically from your backend `.env` file):
   ```bash
   # On Windows (PowerShell):
   $env:GROQ_API_KEY="YOUR_GROQ_API_KEY"
   # On macOS/Linux:
   export GROQ_API_KEY="YOUR_GROQ_API_KEY"
   ```
5. Spin up the FastAPI server:
   ```bash
   python main.py
   # The Swagger documentation is visible at: http://localhost:8000/docs
   ```

### 2. Frontend Service
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Fire up the Vite development server:
   ```bash
   npm run dev
   # Open your browser and navigate to: http://localhost:3000
   ```

---

## 🐳 Docker Compose Deployment (Single Command)

You can launch both services together with Docker Compose. Ensure you have configured your `GROQ_API_KEY` in the root `.env` file.

1. Run the compose environment:
   ```bash
   docker-compose up --build
   ```
2. Open [http://localhost:3000](http://localhost:3000) to view the application!

---

## ☸️ Kubernetes Deployment Guide (Local Cluster / Minikube)

Follow this walkthrough to run the entire TalentLens stack inside a local Minikube cluster:

### 1. Initialize Minikube & Connect Docker Daemon
```bash
minikube start
# Configure terminal environment to build images directly in Minikube's Docker registry
eval $(minikube docker-env)
```

### 2. Build Container Images in Minikube
Ensure your terminal environment is connected (previous step) and run:
```bash
# Build backend
docker build -t resume-screener-backend:latest ./backend

# Build frontend
docker build -t resume-screener-frontend:latest ./frontend
```

### 3. Create the API Key Kubernetes Secret
Store your Groq API Key inside a cluster Secret so the backend pods can mount it securely:
```bash
kubectl create secret generic groq-api-key --from-literal=api-key=YOUR_GROQ_API_KEY
```

### 4. Apply Manifests
Deploy all services, deployments, and configmaps inside the cluster:
```bash
kubectl apply -f k8s/
```

### 5. Access the Web Application
Open your browser and trigger Minikube to bridge access:
```bash
# Expose the frontend service
minikube service resume-screener-frontend-service
# Or access directly via NodePort mapping on: http://<minikube-ip>:30080
```

---

## 🔁 CI/CD Verification
The CI/CD pipeline defined in `.github/workflows/ci-cd.yml` automates four validation layers:
1. **Frontend**: Verifies zero-error production static assets bundling (`npm run build`).
2. **Backend**: Lints and verifies python syntax errors using `flake8`.
3. **Docker**: Dry-runs multi-stage container assembly tests.
4. **Kubernetes**: Verifies syntax configuration rules of all manifests utilizing dry-run tests (`kubectl apply --dry-run=client`).
