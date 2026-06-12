# GOAL-01 Baseline Inventory

## Purpose

Establish the current bazos-service state before implementation work begins.

## Intent Trace

The project needs one orchestrator master agent that checks all jobs, sets goals, splits plans, coordinates tasks, and resumes from state. This goal creates the baseline needed for safe continuation.

## Scope

- Inspect repository status, branches, and uncommitted changes.
- Inventory services, scripts, package files, Prisma schema, Kubernetes manifests, and docs.
- Identify current validation commands.
- Record current compliance-sensitive surfaces.
- Update `docs/IMPLEMENTATION_STATE.md`.
- Create `reports/validation/goal-01-baseline-inventory.md`.

## Out Of Scope

- Service implementation changes.
- Production deployment.
- Live Bazos account operations.

## Acceptance Criteria

- Branch and dirty status are recorded.
- Service/file ownership map is recorded.
- Current validation commands are recorded with pass/fail status.
- Compliance-sensitive surfaces are listed.
- Next goal readiness is clear.

## Required Reading

```text
AGENTS.md
README.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_ORCHESTRATOR.md
docs/IMPLEMENTATION_STATE.md
docs/governance/PROJECT_INVARIANTS.md
docs/process/OPERATIONAL_GATES.md
implementation-goals/README.md
```

## Execution Steps

1. Run `git status --short --branch`.
2. Run `rg --files`.
3. Inspect package files, scripts, Prisma schema, service directories, and Kubernetes manifests.
4. Identify available validation commands.
5. Run only non-destructive validation commands.
6. Write a concise validation report.
7. Update implementation state.

## Validation

Use the narrowest non-destructive checks available after inventory. Do not run production account actions.

## Completion Report

Use the required Intent Compliance Report shape from `implementation-goals/README.md`.
