# GOAL-02 Compliance Safety Gates

## Purpose

Map Bazos compliance guardrails to explicit implementation checks and fail-closed behavior.

## Intent Trace

Bazos has no public API, requires verified phone/device/account state, limits active non-promoted ads, deletes duplicates, and forbids attempts to bypass verification or rate controls. The service must enforce this intent in code and validation.

## Scope

- Read Goal 01 baseline.
- Identify ad publishing, renewal, scraping, import, account, and category-rate surfaces.
- Add or document gates for verification state, duplicate detection, active-ad caps, rate limits, randomized pacing, and per-phone-identity isolation.
- Add focused tests or validation evidence where feasible.

## Out Of Scope

- Live Bazos account operations.
- New bypass mechanisms.
- Production deployment.

## Acceptance Criteria

- Each compliance guardrail maps to implementation or a documented blocker.
- Fail-closed behavior is explicit.
- Tests or validation evidence cover the highest-risk paths.
- No secrets or real account data are introduced.

## Required Reading

```text
AGENTS.md
README.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_STATE.md
docs/governance/PROJECT_INVARIANTS.md
docs/process/OPERATIONAL_GATES.md
implementation-goals/GOAL-01-baseline-inventory.md
```

## Execution Steps

1. Read Goal 01 baseline report.
2. Create or update `GOAL-02-compliance-safety-gates.execution-plan.md`.
3. Identify compliance-sensitive write ownership.
4. Implement or document checks in bounded files.
5. Run focused validation.
6. Update implementation state and validation report.

## Validation

Run focused non-destructive tests or static checks selected from Goal 01. Do not run live publishing, renewal, or scraping actions.

## Completion Report

Use the required Intent Compliance Report shape from `implementation-goals/README.md`.
