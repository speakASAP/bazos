# CLAUDE.md (bazos-service)

Ecosystem defaults: sibling [`../CLAUDE.md`](../CLAUDE.md) and [`../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md`](../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md).

Read this repo's `BUSINESS.md` → `SYSTEM.md` → `AGENTS.md` → `TASKS.md` → `STATE.json` first.

---

## bazos-service

**Purpose**: Bazos.cz classifieds automation — create/update ads, manage multiple accounts, handle ad renewal and expiration.  
**Domain**: https://bazos.alfares.cz  
**Stack**: NestJS · PostgreSQL

### Key constraints
- Bazos anti-spam: max 1 ad per 24h per account per category — strictly enforced
- Never post duplicate ads — check existence before creating
- Ad content must comply with Bazos category rules
- No external API — Bazos uses scraping/form submission; be careful with session management

### Events consumed
- `stock.updated` from warehouse-microservice → removes/updates ads for out-of-stock items

### Quick ops
```bash
docker compose logs -f
./scripts/deploy.sh
```
