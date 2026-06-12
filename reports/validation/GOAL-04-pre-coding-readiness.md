# GOAL-04 Pre-Coding Readiness Gate

```yaml
id: BAZOS-GATE-04-PRE-CODING
status: pass
target: implementation-goals/GOAL-04-execution-plan.md
gate_type: pre-coding
created: 2026-06-12
validator: Codex
completeness_level: complete
```

## Summary

Goal 04 is ready for coding. Required context has been read, the execution plan documents goal impact, cross-service contract impact, auth expectations, allowed/forbidden file sets, sensitive-data handling, replay/idempotency, validation commands, and rollback. The new integration must remain an API orchestration layer over existing guarded draft/policy/queue services.

## Decision

- Accept

## Commands

| Command | Result | Evidence |
|---|---|---|
| `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'` | pass | Branch `codex/bazos-goal-04-catalog-sell-button`; unrelated dirty `k8s/external-secret.yaml` observed and excluded. |
| Required context reads from `AGENTS.md` list | pass | Read AGENTS, README, BUSINESS, SPEC, SYSTEM, PLAN, TASKS, compliance, state, orchestrator, invariants, process gates, gap rules, goal README, and Goal 04. |

## Required Files

Checked: `AGENTS.md`, `README.md`, `BUSINESS.md`, `SPEC.md`, `SYSTEM.md`, `PLAN.md`, `TASKS.md`, `docs/BAZOS_COMPLIANCE.md`, `docs/IMPLEMENTATION_STATE.md`, `docs/IMPLEMENTATION_ORCHESTRATOR.md`, `docs/governance/PROJECT_INVARIANTS.md`, `docs/process/INTENT_PRESERVATION_SYSTEM.md`, `docs/process/DOCUMENTATION_COMPLETENESS_STANDARD.md`, `docs/process/OPERATIONAL_GATES.md`, `docs/process/AGENT_GAP_FILLING_RULES.md`, `implementation-goals/README.md`, `implementation-goals/GOAL-04-catalog-sell-button.md`, and Goal 03 publisher contract files.

## Traceability Evidence

- Upstream intent traces to `BUSINESS.md`, `SPEC.md`, `PLAN.md`, `TASKS.md`, and `docs/BAZOS_COMPLIANCE.md`.
- Goal impact is recorded in `implementation-goals/GOAL-04-execution-plan.md`.
- Execution plan created before code edits.
- Validation report path: `reports/validation/GOAL-04-validation-report.md`.
- Intent compliance report path: `reports/validation/GOAL-04-intent-compliance-report.md`.

## Invariant Evidence

- No direct catalog posting to Bazos is allowed.
- Draft creation remains local only.
- Publish queueing must call `BazosPublisherQueueService.enqueueDraft`.
- Policy gates remain enforced in backend and rechecked by publisher queue.
- Confirmation is required before queueing.
- Challenge states are surfaced for human action.
- Sensitive session/cookie/payment data is neither accepted nor logged.

## Sensitive-Data Evidence

The planned DTOs accept catalog product ad fields and policy evidence only. No raw cookie, password, SMS, bank, payment, or encrypted session data is introduced. Test data will be synthetic.

## Contract Evidence

The goal changes the bazos-service API contract by adding catalog-action endpoints under authenticated `api/bazos/catalog/products/:productId/sell-action`. Auth remains `JwtAuthGuard` using `req.user.id`; ownership is enforced by existing identity/draft queries and new service checks.

## Replay And Determinism Evidence

Draft creation will reuse an existing active draft for the same product and identity when present. Publish queue idempotency, randomized pacing, and claim-time rechecks remain owned by Goal 03 publisher queue code.

## Missing Or Unknown Markers

None execution-critical.

## Next Action

Implement the scoped catalog sell action API and tests.
