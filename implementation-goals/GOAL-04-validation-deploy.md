# GOAL-04 Validation And Deploy

## Purpose

Run final validation for completed Bazos work and deploy only when deployment is clearly approved by the selected goal and owner intent.

## Intent Trace

Deployment must be controlled by the orchestrator, backed by validation evidence, and recorded in state so future sessions can resume correctly.

## Scope

- Review completed goal reports.
- Run non-destructive validation commands.
- Confirm compliance gate evidence.
- Deploy only with explicit owner approval.
- Record deployment output summary and smoke evidence.
- Update `docs/IMPLEMENTATION_STATE.md`.

## Out Of Scope

- New product changes.
- Architecture replacement.
- Live Bazos account actions unless explicitly approved.

## Acceptance Criteria

- All prior goals have completion reports.
- Validation passes or failures are documented.
- Deployment is performed only with clear approval.
- Post-deploy smoke evidence is recorded when deployment occurs.
- Next action is explicit.

## Required Reading

```text
AGENTS.md
README.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_STATE.md
docs/process/OPERATIONAL_GATES.md
reports/validation/
```

## Execution Steps

1. Confirm Goal 01-03 status.
2. Run final validation commands.
3. Confirm deployment approval is in scope.
4. If approved, run the documented deployment command.
5. Run post-deploy smoke checks.
6. Record evidence and state.

## Validation

Use deployment commands documented by Goal 01. Do not infer production approval.

## Completion Report

Use the required Intent Compliance Report shape from `implementation-goals/README.md`.
