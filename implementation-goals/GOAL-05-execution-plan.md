# GOAL-05 Execution Plan - Monitoring And Reconciliation

```yaml
id: BAZOS-EP-05
status: approved
source_goal: implementation-goals/GOAL-05-monitoring-reconciliation.md
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Metadata

- Goal: GOAL-05 Monitoring And Reconciliation.
- Branch: `codex/bazos-goal-05-monitoring-reconciliation`.
- Remote repository: `alfares:/home/ssf/Documents/Github/bazos-service`.
- Docs-rag evidence: authenticated query from Bazos pod using `JWT_TOKEN` returned HTTP 200.
- Production deployment: not part of this coding goal unless separately approved.

## Upstream Traceability

- `BUSINESS.md`: compliance-first Bazos operations with verified identities, active-ad caps, pacing, category limits, duplicate checks, and human-review stops.
- `SYSTEM.md`: production operations require logs and Kubernetes observability.
- `docs/BAZOS_COMPLIANCE.md`: log policy decisions, selected delays, and challenge states without raw secrets.
- `docs/governance/PROJECT_INVARIANTS.md`: no weakening of verification, pacing, active-ad, category, duplicate, content, or challenge controls.
- Selected goal: `implementation-goals/GOAL-05-monitoring-reconciliation.md`.

## Goal

Make Bazos compliance state visible through sanitized monitoring endpoints and reconciliation helpers, without exposing secrets or creating any publish bypass path.

## Goal Impact

Operators can inspect policy gate failures, challenge states, blocked attempts, identities needing review, active-ad count drift, stale submissions, and smoke-test evidence that blocked gates remain blocked.

## Current State

- Goal 01 through Goal 04 are complete.
- Publisher queue records policy-blocked, challenge-required, failed, submitted, queued, and submitting attempt states.
- Older monitoring code exists under `services/aukro-service/src/aukro/publishing`, but it returns full ad/identity records and is not registered in the current shared Bazos module.
- Shared Bazos module has no monitoring API yet.

## Project Invariants

- Monitoring is read-mostly and must not publish to Bazos.
- Reconciliation updates only local tracked active-ad counts from local Bazos ad records.
- Expiring stale submissions changes stale local attempts to failed; it does not retry or bypass Bazos.
- Responses must redact phone numbers, encrypted sessions, cookies, passwords, verification codes, and payment details.
- Logs may include IDs, statuses, counts, gate names, and challenge states only.

## Sensitive-Data Handling

- Return sanitized identity/ad/attempt summaries only.
- Never include `phoneNumber`, `contactPhone`, `encryptedSession`, cookies, passwords, verification codes, or payment details in monitoring responses.
- Tests assert redaction of sensitive identity fields.
- Logs use counts and IDs only.

## Metric Names

- `bazos_publish_attempts_total`
- `bazos_policy_gate_failures_total`
- `bazos_challenge_states_total`
- `bazos_identities_needing_review`
- `bazos_active_ads_tracked`
- `bazos_stale_submitting_attempts`
- `bazos_reconciled_identity_counts_total`
- `bazos_expired_stale_submissions_total`

## Contract Validation Plan

Add authenticated endpoints under `api/bazos/monitoring`:

- `GET /summary`
- `GET /blocked-attempts`
- `GET /review-identities`
- `POST /reconcile-identity-counts`
- `POST /expire-stale-submissions`

Endpoints remain guarded by `JwtAuthGuard` and scoped to `req.user.id` because no admin-role contract exists in this repository.

## Replay/Determinism Plan

- Summary, blocked attempts, and review identities are read-only.
- Reconciliation is idempotent because it sets `activeAdCount` to the current local count.
- Stale submission expiry is idempotent for already terminal/non-submitting attempts.
- No queue claiming, no submission, and no pacing changes are introduced.

## Scope

- Add monitoring DTO, service, controller, and tests under `shared/bazos/monitoring/`.
- Register monitoring service/controller in `shared/bazos/bazos.module.ts`.
- Add logs for policy-blocked queue paths where missing.
- Add validation and intent reports.
- Update implementation state and task ledger.

## Non-Goals

- No production deployment.
- No public Bazos scraping reconciliation.
- No retrying or publishing from monitoring endpoints.
- No RBAC invention beyond existing `JwtAuthGuard`.
- No raw secret/identity contact data in responses.

## Files To Inspect

- `shared/bazos/publisher/bazos-publisher-queue.service.ts`
- `shared/bazos/policy/publish-policy.service.ts`
- `shared/bazos/identity/bazos-identity.types.ts`
- `prisma/schema.prisma`
- `services/aukro-service/src/aukro/publishing/monitoring.service.ts`
- `services/aukro-service/src/aukro/publishing/monitoring.controller.ts`

## Files To Create

- `shared/bazos/monitoring/bazos-monitoring.dto.ts`
- `shared/bazos/monitoring/bazos-monitoring.service.ts`
- `shared/bazos/monitoring/bazos-monitoring.controller.ts`
- `shared/bazos/monitoring/bazos-monitoring.service.spec.ts`
- `reports/validation/GOAL-05-pre-coding-readiness.md`
- `reports/validation/GOAL-05-validation-report.md`
- `reports/validation/GOAL-05-intent-compliance-report.md`

## Files To Modify

- `shared/bazos/bazos.module.ts`
- `shared/bazos/publisher/bazos-publisher-queue.service.ts`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

## Files That Must Not Be Modified

- `docs/BAZOS_COMPLIANCE.md`
- `docs/governance/PROJECT_INVARIANTS.md`
- `BUSINESS.md`
- `SPEC.md`
- Production secrets or raw `.env` files.

## Implementation Steps

1. Add monitoring DTOs and sanitized service methods.
2. Add authenticated monitoring controller endpoints.
3. Register monitoring module pieces in `BazosModule`.
4. Add missing policy-blocked queue logs with safe metadata only.
5. Add tests for summary metrics, redaction, review identities, reconciliation, stale expiry, and blocked-gate smoke evidence.
6. Run validation commands.
7. Update reports, state, and task ledger.
8. Commit and push Goal 05.

## Test Plan

- `npm --prefix shared test -- --runTestsByPath bazos/monitoring/bazos-monitoring.service.spec.ts`
- `npm test`
- `npm --prefix shared test`
- `npm --prefix shared run build`
- `git diff --check`

## Validation Plan

Record validation evidence in `reports/validation/GOAL-05-validation-report.md` and compliance evidence in `reports/validation/GOAL-05-intent-compliance-report.md`.

## Gate Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix shared run build'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'
```

## Documentation Updates

- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `reports/validation/GOAL-05-validation-report.md`
- `reports/validation/GOAL-05-intent-compliance-report.md`

## Rollback Plan

Revert the Goal 05 commit. No database migration or production deployment is required for source rollback.

## Agent Handoff Prompt

Implement Goal 05 in the shared Bazos module only. Add sanitized monitoring and reconciliation endpoints, preserve all Bazos compliance gates, add smoke tests proving blocked policy gates remain blocked, run validation, update state, commit, and push.

## Completion Checklist

- [x] Required reading completed.
- [x] Docs-rag token verified.
- [x] Goal impact recorded.
- [x] Scope matches selected goal.
- [x] Remote state checked.
- [x] Log redaction declared.
- [x] Metrics names declared.
- [x] Reconciliation safety declared.
- [x] Smoke validation declared.
- [x] Pre-coding gate passed or blocking exception recorded.
- [ ] Validation evidence recorded.
- [ ] Implementation state updated.
- [ ] Intent Compliance Report produced.
