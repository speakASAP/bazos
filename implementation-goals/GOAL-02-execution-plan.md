# GOAL-02 Execution Plan: Human Verification Flow

```yaml
id: BAZOS-EP-02
status: approved
source_goal: implementation-goals/GOAL-02-human-verification-flow.md
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Metadata

Goal 02 implementation plan for human-completed Bazos verification sessions on remote branch `codex/bazos-goal-02-human-verification-flow`.

## Upstream Traceability

- `BUSINESS.md`: every Bazos phone identity must be manually authorized and verified; no bypass of SMS, bank, CAPTCHA, device, cookie, ban, or rate controls.
- `SPEC.md`: identity setup must stop on Bazos challenges and require human review.
- `docs/BAZOS_COMPLIANCE.md`: verification and sensitive-data handling rules.
- `docs/governance/PROJECT_INVARIANTS.md`: invariants 2-5, 11, and 12.
- `implementation-goals/GOAL-02-human-verification-flow.md`: selected goal.

## Goal

Implement a human verification session flow that lets users connect Bazos identities only after manually completing Bazos verification steps.

## Goal Impact

This goal prevents a verified identity from being activated by API assertion alone. Verification activation requires a recorded human session, explicit human confirmation, and a sanitized encrypted session envelope; challenge and expiry paths move the identity back to non-publishable manual-review states.

## Current State

Remote repository inspected on 2026-06-12:

- Branch before work: `codex/bazos-goal-01-identity-session-compliance`.
- Goal branch: `codex/bazos-goal-02-human-verification-flow`.
- Dirty state before edits: clean.
- Existing schema includes `BazosVerificationSession` and identity `encryptedSession`, `sessionState`, `status`, and `reviewState` fields.
- Existing service has identity CRUD, mark-verified, and mark-challenge methods, but no verification-session lifecycle and no requirement to store an allowed session envelope before verification.

## Project Invariants

- Invariants 2-3: no public posting API and no bypass path; the flow records human work only and never solves verification automatically.
- Invariant 4: challenge and expiry states stop automation by setting non-clear review/session states.
- Invariant 5: identities become verified only after human confirmation.
- Invariant 11: raw cookies, verification codes, passwords, and payment details are forbidden in logs and DTO envelopes.
- Invariant 12: no production deployment is part of this goal.

## Sensitive-Data Handling

The implementation accepts only an encrypted session envelope with metadata (`ciphertext`, `iv`, `authTag`, `algorithm`, `keyRef`, `capturedAt`) and rejects common raw secret fields such as `cookies`, `rawCookies`, `password`, `verificationCode`, `smsCode`, and `paymentDetails`. Logs include identity/session IDs and states only. Tests use synthetic encrypted values.

## Contract Validation Plan

API contract adds identity-scoped endpoints for starting, completing, challenging, and expiring verification sessions. Prisma schema is already present and is not changed. Validation runs `npm test`, `npm --prefix shared test`, and `npm --prefix shared run build`.

## Replay/Determinism Plan

Verification session completion is idempotency-sensitive: only `awaiting_human` sessions can complete or move to challenge/expired. Completed, challenged, or expired sessions cannot be completed later. No publisher queue, pacing, or Bazos submission is added.

## Scope

- Add verification-session state/session-envelope types.
- Add DTOs and controller endpoints for verification lifecycle.
- Require encrypted session envelope and human confirmation before identity activation.
- Move identity into blocked states on session challenge or expiry.
- Add focused unit tests and reports.

## Non-Goals

- No SMS, bank/micro-payment, CAPTCHA, or device-check automation.
- No browser submitter or publisher queue.
- No public duplicate scraping implementation.
- No production deployment.
- No real cookies, verification codes, credentials, or payment details in tests or docs.

## Files To Inspect

- `implementation-goals/GOAL-02-human-verification-flow.md`
- `prisma/schema.prisma`
- `shared/bazos/identity/bazos-identity.*`
- `shared/bazos/bazos.module.ts`
- `shared/index.ts`
- `shared/package.json`

## Files To Create

- `implementation-goals/GOAL-02-execution-plan.md`
- `reports/validation/GOAL-02-pre-coding-readiness.md`
- `reports/validation/GOAL-02-validation-report.md`
- `reports/validation/GOAL-02-intent-compliance-report.md`

## Files To Modify

- `shared/bazos/identity/bazos-identity.controller.ts`
- `shared/bazos/identity/bazos-identity.dto.ts`
- `shared/bazos/identity/bazos-identity.service.ts`
- `shared/bazos/identity/bazos-identity.service.spec.ts`
- `shared/bazos/identity/bazos-identity.types.ts`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

## Files That Must Not Be Modified

- `BUSINESS.md`
- `SPEC.md`
- `docs/BAZOS_COMPLIANCE.md`
- `docs/governance/PROJECT_INVARIANTS.md`
- `.env*`
- `k8s/*`
- `scripts/deploy.sh`

## Implementation Steps

1. Record execution plan and pre-coding readiness evidence.
2. Add verification lifecycle DTOs, types, service methods, and controller routes.
3. Require human confirmation and encrypted session envelope before verification.
4. Add tests for start, complete, raw-secret rejection, challenge, expiry, and ownership-sensitive challenge handling.
5. Run validation commands and record reports.
6. Update implementation state and tasks.
7. Commit or record no-commit reason.

## Test Plan

Run:

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix shared test'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix shared run build'
```

## Validation Plan

Validation report records command outcomes, invariant mapping, sensitive-data evidence, API contract evidence, and replay/determinism evidence in `reports/validation/GOAL-02-validation-report.md`.

## Gate Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Documentation Updates

Update `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and Goal 02 validation reports only.

## Rollback Plan

Revert the Goal 02 commit or apply the inverse patch on the Goal 02 branch. No deployment or database migration is performed by this plan.

## Agent Handoff Prompt

Implement Goal 02 only. Add human verification session lifecycle controls, preserve Bazos compliance guardrails, reject raw secret/session data, run validation, update state, and do not deploy.

## Completion Checklist

- [x] Required reading completed.
- [x] Goal impact recorded.
- [x] Scope matches selected goal.
- [x] Remote dirty state checked.
- [x] Bazos invariants checked.
- [x] Sensitive-data handling declared.
- [x] Contract impact declared.
- [x] Replay/determinism impact declared.
- [x] Pre-coding gate passed or blocking exception recorded.
- [x] Validation evidence recorded.
- [x] Implementation state updated.
- [x] Intent Compliance Report produced.
