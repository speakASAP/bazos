# Bazos Agent Orchestration

## Purpose

This document defines how the master orchestrator coordinates implementation work across exploration, coding, validation, and merge tasks.

## Master Agent Responsibilities

The master agent owns:

- goal selection;
- task boundaries;
- branch/worktree decisions;
- final file integration;
- validation evidence;
- Bazos compliance checks;
- `docs/IMPLEMENTATION_STATE.md` updates;
- final user reporting.

The master agent may delegate implementation work, but accountability remains with the master agent.

## Runtime Agent Boundary

This project currently has no autonomous runtime AI agents for ad management or scraping. Marketplace actions remain rule-based and compliance-gated.

Implementation subagents are allowed only for development workflow tasks. They must not operate production Bazos accounts, publish ads, renew ads, scrape in production, or bypass guardrails.

## Worker Types

| Worker | Use When | Output |
|---|---|---|
| Explorer | The repository state or service boundary is unclear. | Constraints, file ownership map, risks, suggested next task. |
| Implementer | A bounded file set can be changed independently. | Changed files, acceptance criteria coverage, tests run. |
| Validator | A goal needs independent verification. | Validation commands, screenshots or smoke evidence, defects. |
| Merge Agent | Multiple branches or worker outputs must be integrated. | Merge summary, conflict decisions, combined validation. |

## Write Ownership

Each worker must receive a disjoint write set. Examples:

- `services/bazos/**` only;
- `services/imports/**` only;
- `services/settings/**` only;
- `shared/**` only;
- `prisma/**` only;
- `web/**` or frontend files only;
- `docs/**` only;
- `reports/validation/**` only.

Workers must not edit files outside their assigned ownership without returning to the master agent for approval.

## Required Worker Report

```markdown
## Worker Report

### Goal

### Assigned Write Set

### Implemented

### Not Implemented

### Compliance Check

### Validation

### Risks

### Files Changed

### Next Action
```
