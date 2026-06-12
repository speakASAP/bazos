# Bazos Agent Orchestration

## Purpose

Define how the master orchestrator coordinates exploration, coding, validation, and merge work for bazos-service.

## Master Agent Responsibilities

The master agent owns:

- goal selection;
- goal impact and intent traceability;
- task boundaries;
- branch/worktree decisions;
- final file integration;
- Bazos compliance checks;
- readiness gate evidence;
- validation evidence;
- `docs/IMPLEMENTATION_STATE.md` updates;
- final user reporting.

The master agent may delegate implementation work, but accountability remains with the master agent.

## Runtime Agent Boundary

This project has no autonomous runtime AI agents for ad management or scraping. Marketplace actions remain rule-based and compliance-gated.

Implementation subagents are allowed only for development workflow tasks. They must not operate production Bazos accounts, publish ads, renew ads, scrape in production, or bypass guardrails.

## Worker Types

| Worker | Use When | Output |
|---|---|---|
| Explorer | Repository state or service boundaries are unclear. | Constraints, file ownership map, risks, suggested next task. |
| Implementer | A bounded file set can be changed independently after pre-coding gate evidence exists. | Changed files, acceptance criteria coverage, tests run, compliance evidence. |
| Validator | A goal needs independent verification. | Validation commands, readiness gate result, compliance defects. |
| Merge Agent | Multiple branches or worker outputs must be integrated. | Merge summary, conflict decisions, integration-readiness evidence, combined validation. |

## Write Ownership

Each worker must receive a disjoint write set. Examples:

- `services/api-gateway/**` only;
- `services/aukro-service/**` only until service naming is corrected;
- `shared/**` only;
- `prisma/**` only;
- `k8s/**` only;
- `docs/**` only;
- `reports/validation/**` only.

Workers must not edit files outside their assigned ownership without returning to the master agent for approval.

## Required Worker Report

```markdown
## Worker Report

### Goal

### Goal Impact

### Assigned Write Set

### Implemented

### Not Implemented

### Bazos Compliance Check

### Validation

### Readiness Gate Evidence

### Risks

### Files Changed

### Next Action
```

## Coordination Rules

- Do not use workers to bypass product-intent, validation, compliance, or deployment gates.
- Do not start implementer workers until goal impact, execution plan, and pre-coding readiness gate evidence exist.
- Keep production deployment as a master-agent action unless the owner explicitly approves a deployment worker.
- Record compressed worker summaries in `docs/IMPLEMENTATION_STATE.md`.
