# GOAL-04 Catalog Sell Button

## Purpose

Add catalog-side Bazos selling integration only after guarded Bazos publishing exists.

## Intent Trace

Source: `PLAN.md` Goal 4 and `TASKS.md` catalog integration backlog item.

## Goal Impact

This goal exposes Bazos publishing to users without bypassing bazos-service policy gates. Catalog creates a draft and requests queueing only through bazos-service guardrails.

## Scope

- Add product-level action to create a Bazos draft.
- Show selected identity, category mapping, active-ad count, and policy status.
- Require explicit user confirmation before queueing publish.
- Poll publish status and show human-action failure reasons.

## Out Of Scope

- Direct catalog posting to Bazos.
- Bypassing bazos-service.
- Production deployment unless separately approved.

## Acceptance Criteria

- Catalog cannot publish directly.
- UI/API shows policy status before queueing.
- User confirmation is required.
- Failure reasons preserve human-review states.

## Required Reading

```text
AGENTS.md
PLAN.md
TASKS.md
docs/BAZOS_COMPLIANCE.md
implementation-goals/GOAL-03-publisher-queue-browser-submitter.md
```

## Pre-Coding Gate

Coding is blocked until cross-service contract impact, auth expectations, and rollback plan are documented.

## Execution Steps

1. Review Bazos publisher contract.
2. Create execution plan and pre-coding gate report.
3. Implement only guarded integration.
4. Validate blocked states and confirmation flow.
5. Update state and report.

## Validation

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Completion Report

Use the Intent Compliance Report shape in `implementation-goals/README.md`.
