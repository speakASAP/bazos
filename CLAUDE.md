# CLAUDE.md (bazos-service)

Reading order: BUSINESS.md -> SYSTEM.md -> AGENTS.md -> TASKS.md -> STATE.json

## Knowledge Retrieval - docs-rag-microservice (MANDATORY, query before reading files)

Query the RAG before reading source files when working on implementation.

Command template:

kubectl -n statex-apps exec deployment/bazos-service -- curl -s -X POST http://docs-rag-microservice:3397/retrieval/agent-context -H Content-Type:application/json -H Authorization:Bearer_TOKEN -d QUERY_JSON

## bazos-service

Purpose: Bazos.cz classifieds automation - create/update ads, manage multiple accounts, handle ad renewal and expiration.
Domain: https://bazos.alfares.cz
Stack: NestJS, PostgreSQL

### Key constraints

- Bazos anti-spam: max 1 ad per 24h per account per category - strictly enforced.
- Bazos active ad cap: max 50 active non-promoted ads per verified user identity.
- Publisher pacing: random delay between publish attempts, minimum 60 seconds and maximum 180 seconds per verified identity.
- Every phone identity must be manually registered and verified with Bazos before use; support several verified phone identities per user, but never use them to evade bans, duplicate limits, category limits, or active-ad caps.
- Never post duplicate ads - check existence before creating.
- Ad content must comply with Bazos category rules.
- No external API - Bazos uses scraping/form submission; be careful with session management.
- Never bypass SMS, bank/micro-payment verification, CAPTCHA, device checks, cookies, bans, or rate limits. If Bazos blocks or challenges the session, stop and require human review.
- Treat docs/BAZOS_COMPLIANCE.md, SPEC.md, and PLAN.md as mandatory before changing publisher behavior.

### Events consumed

- stock.updated from warehouse-microservice -> removes/updates ads for out-of-stock items

### Secrets

All secrets are in Vault at secret/prod/bazos-service. See ../shared/docs/VAULT.md.

Ops: kubectl logs -n statex-apps -l app=bazos-service -f; kubectl rollout restart deployment/bazos-service -n statex-apps; ./scripts/deploy.sh
