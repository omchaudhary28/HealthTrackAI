# Folder Structure

```text
mindtrack-ai/
|-- frontend/
|   |-- angular.json
|   |-- package.json
|   |-- tsconfig.json
|   |-- tsconfig.app.json
|   |-- .postcssrc.json
|   `-- src/
|       |-- index.html
|       |-- main.ts
|       |-- styles.css
|       `-- app/
|           |-- app.component.ts
|           |-- app.config.ts
|           |-- app.routes.ts
|           |-- core/services/
|           |   |-- auth.service.ts
|           |   `-- chatbot.service.ts
|           |-- shared/components/
|           |   |-- floating-chatbot.component.ts
|           |   |-- mood-heatmap.component.ts
|           |   |-- progress-chart.component.ts
|           |   |-- side-nav.component.ts
|           |   |-- stat-card.component.ts
|           |   `-- top-nav.component.ts
|           `-- features/
|               |-- auth/
|               |-- community/
|               |-- dashboard/
|               |-- exercises/
|               |-- journal/
|               |-- landing/
|               |-- mental-state/
|               |-- mood-calendar/
|               |-- profile/
|               |-- progress/
|               `-- tests/
|-- backend/
|   |-- Dockerfile
|   |-- package.json
|   |-- .env.example
|   `-- src/
|       |-- app.js
|       |-- server.js
|       |-- config/
|       |-- controllers/
|       |-- data/
|       |-- middleware/
|       |-- models/
|       |-- routes/
|       |-- services/
|       `-- utils/
|-- ai-service/
|   |-- Dockerfile
|   |-- requirements.txt
|   |-- .env.example
|   `-- app/
|       |-- main.py
|       |-- schemas.py
|       `-- services/
|           |-- classifier.py
|           |-- journal_analyzer.py
|           `-- recommendations.py
|-- docs/
|   |-- api-endpoints.md
|   |-- architecture.md
|   `-- folder-structure.md
|-- docker-compose.yml
`-- README.md
```
