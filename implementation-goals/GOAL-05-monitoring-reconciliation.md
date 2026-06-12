# GOAL-05 Monitoring And Reconciliation

## Purpose

Make Bazos compliance state visible in production operations.

## Intent Trace

Source: `PLAN.md` Goal 5, `SYSTEM.md` operations section, and `docs/BAZOS_COMPLIANCE.md`.

## Goal Impact

This goal ensures operators can see policy gate failures, challenge states, active-ad reconciliation, blocked identities, and publish attempt behavior without exposing secrets.

## Scope

- Add logs and metrics for publish attempts, blocked attempts, policy failures, and challenge states.
- Add admin visibility for identities needing review.
- Add reconciliation job for active Bazos ad counts and expired ads.
- Add smoke tests that prove blocked policy gates cannot publish.

## Out Of Scope

- Logging secrets, cookies, verification codes, or payment details.
- Deployment without approval.
- Weakening policy gates for observability.

## Acceptance Criteria

- Compliance events are observable.
- Active-ad count reconciliation is documented and tested.
- Smoke tests prove blocked gates cannot publish.
- Logs avoid sensitive data.

## Required Reading

```text
AGENTS.md
SYSTEM.md
docs/BAZOS_COMPLIANCE.md
implementation-goals/GOAL-03-publisher-queue-browser-submitter.md
```

## Pre-Coding Gate

Coding is blocked until log redaction, metrics names, reconciliation safety, and smoke validation are documented.

## Execution Steps

1. Review existing logging and reconciliation code.
2. Create execution plan and pre-coding gate report.
3. Implement observability/reconciliation changes.
4. Validate secret hygiene and blocked-gate smoke tests.
5. Update state and report.

## Validation

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Completion Report

Use the Intent Compliance Report shape in `implementation-goals/README.md`.
