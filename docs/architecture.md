# MindTrack AI Architecture

## Disclaimer

MindTrack AI is **not a medical diagnostic system**. It supports self-reflection, mental wellness guidance, and habit improvement.

## System Layers

### 1. Angular frontend

- Standalone Angular 17 application
- TailwindCSS styling with calm, rounded UI patterns
- Feature pages for dashboard, tests, mental state, mood calendar, journal, community, and profile
- JWT-aware services for API communication

### 2. Node.js REST API

- Express application with modular routes and controllers
- JWT auth and bcrypt password hashing
- Mongoose models for all core collections
- Assessment scoring, dashboard aggregation, forum workflows, and chatbot orchestration

### 3. Python AI microservice

- FastAPI service
- Rule-based mental-state classification
- Recommendation engine for wellness activities
- Lightweight journal NLP pattern analysis

### 4. MongoDB

- Primary persistence layer
- Stores user profiles, results, logs, journals, community data, and population benchmarks

## Primary Request Flow

```text
Angular UI -> Express REST API -> MongoDB
                         |
                         -> FastAPI AI service
```

## Domain Modules

- `auth`: signup, login, profile, JWT lifecycle
- `assessment`: baseline wellness scoring, additional tests, population comparison
- `mental-state`: classification snapshots and recommendations
- `check-ins`: daily mood, stress, sleep, energy tracking
- `journal`: entries, prompts, mood tags, AI pattern analysis
- `exercises`: structured activity catalog and recommendation matching
- `community`: anonymous posts, comments, reactions, moderation-ready fields
- `dashboard`: aggregated progress and trend payloads
- `admin`: seed endpoints, moderation, catalog management, platform stats

## Collections

- `Users`
- `TestResults`
- `MentalStates`
- `Exercises`
- `MoodLogs`
- `JournalEntries`
- `ForumPosts`
- `PopulationStats`
