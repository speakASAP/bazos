# bazos-service

Bazos.cz classifieds automation. See BUSINESS.md for goals/SLA and SYSTEM.md for stack/ports/deploy.

## Sub-services

| Container | Port | Purpose |
|-----------|------|---------|
| bazos | 3900 | Core ad management + scraping |
| api-gateway | 3901 | Auth proxy + routing |
| imports | 3902 | CSV import service |
| settings | 3903 | Account settings |
| gateway-proxy | 3904 | Nginx reverse proxy |
| frontend | 3905 | UI |

## Database

Database: bazos_db. Prisma schema: prisma/schema.prisma.

Tables: bazos_accounts, bazos_ads, bazos_orders.

## Secrets

All secrets are in Vault at secret/prod/bazos-service and are synced to Kubernetes through bazos-service-secret. See ../shared/docs/VAULT.md.

## API

Base: https://bazos.alfares.cz/api (dev: http://localhost:3901/api)

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/accounts | List accounts |
| POST | /api/accounts | Add account |
| GET | /api/ads | List ads |
| POST | /api/ads | Create ad |
| POST | /api/ads/sync | Sync from catalog |
| POST | /api/ads/:id/renew | Renew ad |
| GET | /api/categories | Category mappings |

## Bazos Compliance Guardrails

Publishing must follow docs/BAZOS_COMPLIANCE.md. The short version: Bazos has no public API, requires verified phone/device/account state, limits active non-promoted ads, deletes duplicates, and forbids attempts to bypass verification or rate controls.

The service design supports several verified phone identities per ecosystem user, but each identity is governed independently by active-ad caps, category rate limits, duplicate checks, and randomized pacing. Multiple phone identities are for legitimate seller operations only, not for evading Bazos rules.
