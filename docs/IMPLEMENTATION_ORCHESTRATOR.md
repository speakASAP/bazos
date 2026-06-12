# Bazos-Service Implementation Orchestrator

## Mission

Coordinate Bazos-service implementation through explicit goals, intent-preserving plans, readiness gates, validation reports, state updates, and commit records.

The orchestrator must preserve Bazos compliance intent from `BUSINESS.md`, `SPEC.md`, and `docs/BAZOS_COMPLIANCE.md` through every code change.

## Continuation Commands

```text
BAZOS ORCHESTRATOR: continue implementation
BAZOS ORCHESTRATOR: implement goal number 1
```

## Required First Steps

1. Read the required context listed in `AGENTS.md`.
2. Run local or remote `git status --short --branch`.
3. Inspect remote state before editing remote files:

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
```

4. Select the next goal from `docs/IMPLEMENTATION_STATE.md`.
5. Create or update goal impact and execution plan artifacts before coding.
6. Run and record the pre-coding readiness gate.
7. Make only scoped changes.
8. Run validation and update state.

## Product Intent Contract

```text
Bazos compliance policy
-> Project invariants
-> Goal impact
-> Execution plan
-> Pre-coding gate
-> Implementation
-> Validation
-> Intent Compliance Report
```

Fail closed when product intent, compliance guardrails, validation scope, or deployment permission is unclear.

## Goal Completion Gate

Before marking a goal complete, verify:

- goal impact is documented;
- execution plan is complete;
- pre-coding readiness gate passed or a blocking exception is recorded;
- tests and validation reports exist;
- Bazos compliance invariants are preserved;
- `docs/IMPLEMENTATION_STATE.md` is updated;
- commit SHA or no-commit reason is recorded.
