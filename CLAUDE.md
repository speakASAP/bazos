# CLAUDE.md (bazos-service)

→ Ecosystem: [../shared/CLAUDE.md](../shared/CLAUDE.md) | Reading order: `BUSINESS.md` → `SYSTEM.md` → `AGENTS.md` → `TASKS.md` → `STATE.json`

---

## Knowledge Retrieval — docs-rag-microservice (MANDATORY, query before reading files)

**Query the RAG before reading source files** — saves 2000-5000 tokens per answer.

```bash
kubectl -n statex-apps exec deployment/business-orchestrator -- curl -s -X POST http://docs-rag-microservice:3397/retrieval/agent-context \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat ~/.claude/rag-token)" \
  -d '{"query": "YOUR QUESTION HERE", "maxTokens": 3000}'
```


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

### Secrets
All secrets in Vault at `secret/prod/bazos-service`. → [../shared/docs/VAULT.md](../shared/docs/VAULT.md)

**Ops**: `kubectl logs -n statex-apps -l app=bazos-service -f` · `kubectl rollout restart deployment/bazos-service -n statex-apps` · `./scripts/deploy.sh`
