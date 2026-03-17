# MindTrack AI

MindTrack AI is a modular mental wellness platform starter built with Angular, Node.js, MongoDB, and a Python FastAPI microservice.

Important disclaimer: MindTrack AI is **not a medical diagnostic system**. It is intended for self-reflection, mental wellness support, and habit improvement only.

## Workspace Layout

```text
frontend/     Angular 17 + TailwindCSS application
backend/      Express REST API with MongoDB models
ai-service/   FastAPI microservice for classification and journal analysis
docs/         Architecture and REST API documentation
```

## Quick Start

### Backend

```bash
cd backend
npm install
npm run dev
```

### AI service

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

See [docs/architecture.md](/c:/major_project/docs/architecture.md) and [docs/api-endpoints.md](/c:/major_project/docs/api-endpoints.md) for the initial system design.
