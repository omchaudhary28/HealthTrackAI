# MindTrack AI REST API

Base URL: `http://localhost:4000/api/v1`

Important disclaimer: All endpoints are designed for wellness support and self-reflection only, not clinical diagnosis.

## Authentication

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

## Assessment and Mental State

- `GET /tests`
- `GET /tests/:testKey`
- `POST /tests/:testKey/submissions`
- `POST /assessment/baseline`
- `GET /assessment/comparison/:metric/:score`
- `GET /assessment/state/latest`

## Dashboard and Progress

- `GET /dashboard/summary`
- `GET /mood-logs`
- `POST /mood-logs`

## Journaling

- `GET /journal`
- `POST /journal`
- `POST /journal/:entryId/analyze`

## Exercises

- `GET /exercises`

## Community

- `GET /forum-posts`
- `POST /forum-posts`
- `POST /forum-posts/:postId/comments`
- `POST /forum-posts/:postId/reactions`

## Chatbot

- `POST /chatbot/message`

Example request:

```json
{
  "message": "I feel overwhelmed today and can't focus."
}
```

Example response:

```json
{
  "reply": "It sounds heavy. Would you like a 5 minute breathing exercise or a short grounding prompt?",
  "disclaimer": "MindTrack AI provides wellness support only and does not diagnose medical conditions."
}
```

## Admin

- `POST /admin/seed/exercises`
- `GET /admin/stats`
