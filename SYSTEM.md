# System: bazos-service

## Architecture

NestJS + PostgreSQL. Bazos.cz automation via web scraping/API.

- Multi-account ad management
- Ad renewal scheduler
- Subscribes to stock.updated → update/pause ads

## Integrations

| Service | Usage |
|---------|-------|
| database-server:5432 | PostgreSQL |
| logging-microservice:3367 | Logs |
| catalog-microservice:3200 | Product data |
| warehouse-microservice:3201 | Stock events |
| orders-microservice:3203 | Order forward |

## Current State
<!-- AI-maintained -->
Stage: production

## Known Issues
<!-- AI-maintained -->
- None
