# Bazos Operational Gates

```yaml
id: BAZOS-OPERATIONAL-GATES
status: approved
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Gate Types

| Gate | Timing | Blocks on |
|---|---|---|
| Pre-coding gate | Before code edits. | Missing goal impact, missing execution plan, missing Bazos invariant mapping, unclear validation, missing data/contract/replay declaration, unresolved execution-critical markers. |
| Compliance gate | Before publish-related work is complete. | Any path that bypasses verification, pacing, active-ad cap, category cadence, duplicate checks, stop-on-challenge, or sensitive-data controls. |
| Integration-readiness gate | Before merging branches or worker outputs. | Conflicting ownership, failed tests, missing policy validation, missing readiness evidence. |
| Deployment-readiness gate | Before production deployment. | Missing owner approval, failed tests, missing smoke plan, unresolved blockers, missing rollback notes. |
| Goal-closure gate | Before marking a goal complete. | Missing Intent Compliance Report, missing validation report, missing state update, missing commit/no-commit record. |

## Pre-Coding Checklist

- Required context from `AGENTS.md` has been read.
- Selected goal has `Goal Impact`.
- Execution plan declares allowed and forbidden files.
- Bazos invariants from `docs/governance/PROJECT_INVARIANTS.md` are mapped.
- Sensitive-data handling is declared.
- Contract/API/schema impact is declared.
- Replay, idempotency, queue, and pacing impact is declared.
- Tests and validation commands are declared.
- Remote dirty state is known when remote files will be changed.

## Useful Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && ./scripts/deploy.sh'
curl -I -H 'Cache-Control: no-cache' 'https://bazos.alfares.cz'
```

Run deployment only after deployment-readiness approval.
