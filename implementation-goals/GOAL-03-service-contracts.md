# GOAL-03 Service Contracts

## Purpose

Document and validate service contracts across API gateway, core Bazos service, imports, settings, frontend, shared modules, and persistence.

## Intent Trace

The project is a multi-service classifieds automation system. Changes must preserve service boundaries, API paths, data contracts, and compliance behavior.

## Scope

- Read Goal 01 and Goal 02 reports.
- Inventory API routes, import contracts, settings/account contracts, frontend expectations, shared modules, and Prisma models.
- Add contract documentation or focused tests where gaps are found.
- Keep changes scoped to documented service boundaries.

## Out Of Scope

- Product redesign.
- Backend architecture replacement.
- Live account operations.
- Production deployment.

## Acceptance Criteria

- Service contracts are documented or linked from validation evidence.
- API/import/settings/frontend contracts are validated where feasible.
- Compliance gates from Goal 02 remain intact.
- No unrelated workflows are removed.

## Required Reading

```text
AGENTS.md
README.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_STATE.md
docs/governance/PROJECT_INVARIANTS.md
docs/process/OPERATIONAL_GATES.md
implementation-goals/GOAL-01-baseline-inventory.md
implementation-goals/GOAL-02-compliance-safety-gates.md
```

## Execution Steps

1. Read prior reports.
2. Create or update `GOAL-03-service-contracts.execution-plan.md`.
3. Identify contract surfaces.
4. Add docs/tests in bounded areas.
5. Run focused validation.
6. Update implementation state and validation report.

## Validation

Run focused non-destructive tests or static checks selected from Goal 01.

## Completion Report

Use the required Intent Compliance Report shape from `implementation-goals/README.md`.
