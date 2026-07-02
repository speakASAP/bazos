# GOAL-25 Catalog Product Quality Bazos Consumer

## Purpose

Consume the Catalog Goal 25 product quality blocker contract before Bazos catalog sell-action draft preparation and publish-adjacent queueing.

## Intent Trace

Vision: Catalog remains the Statex product truth service for identity, sellable content, media references, pricing records, and product quality readiness.

Goal Impact: Bazos users cannot prepare or queue Bazos drafts from Catalog products while mandatory Catalog quality blockers remain, reducing incomplete marketplace drafts without moving product truth into Bazos.

System: Catalog owns product quality/readiness. Warehouse owns stock. Auth owns login/JWT/RBAC. Bazos owns identities, drafts, compliance checks, pacing, duplicate gates, challenge states, queueing, and publish actions.

Feature: Bazos Catalog sell-action quality preflight.

Task: Integrate Bazos draft-preparation and confirm flows with Catalog `catalog.product_quality.v1` blockers.

Execution Plan: `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`.

Coding Prompt: Delegated worker prompt from Catalog Goal 25 orchestrator thread `019f236a-aa22-7d63-b7d7-4a78357dd3a9`.

Code: Bounded to Catalog client/readiness consumer, Bazos catalog sell-action service/controller, catalog UI blocker display, and focused tests.

Validation: `reports/validation/2026-07-02-goal-25-bazos-product-quality-consumer.md`.

## Goal Impact

Bazos fails closed before creating/updating a Bazos draft or queueing publish when Catalog reports mandatory product quality blockers such as missing SKU, duplicate SKU, missing title, missing description, missing current price, missing/placeholder-only image, archived product, or any future Catalog blocking issue in the same policy family.

## Scope

- Read Catalog Goal 25 product quality contract and implemented Catalog readiness/review behavior.
- Add a Bazos Catalog client/readiness consumer without redefining product quality truth locally.
- Block Bazos catalog sell-action `prepare` before draft mutation when Catalog quality blockers remain or readiness is unavailable.
- Block Bazos catalog sell-action `confirm` before queueing when Catalog quality blockers remain or readiness is unavailable.
- Return/surface sanitized blocker codes/messages in API and UI.
- Preserve Bazos compliance, identity, queue, duplicate, pacing, Warehouse stock, and challenge ownership.
- Add focused unit tests and validation report.

## Out Of Scope

- Catalog schema/API changes.
- Bazos database schema changes.
- Direct Bazos publishing or browser automation changes.
- Production deployment.
- Printing secrets or runtime credentials.

## Acceptance Criteria

- Bazos calls Catalog-owned readiness/quality evidence before draft preparation and confirmation.
- Mandatory Catalog blockers fail closed and no Bazos draft is created/updated during blocked prepare.
- Confirmation does not enqueue while Catalog blockers remain.
- EAN remains optional/non-blocking.
- UI shows Catalog blocker codes/messages and disables Bazos queue confirmation for blocked products.
- `git diff --check`, focused Bazos tests, and build pass or blockers are recorded.

## Required Reading

```text
AGENTS.md
README.md
BUSINESS.md
SPEC.md
SYSTEM.md
PLAN.md
TASKS.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_STATE.md
docs/IMPLEMENTATION_ORCHESTRATOR.md
docs/governance/PROJECT_INVARIANTS.md
docs/process/INTENT_PRESERVATION_SYSTEM.md
docs/process/DOCUMENTATION_COMPLETENESS_STANDARD.md
docs/process/OPERATIONAL_GATES.md
docs/process/AGENT_GAP_FILLING_RULES.md
implementation-goals/README.md
implementation-goals/GOAL-04-catalog-sell-button.md
/home/ssf/Documents/Github/catalog-microservice/docs/contracts/catalog-product-quality-review.md
/home/ssf/Documents/Github/catalog-microservice/reports/validation/VAL-GOAL-25-product-quality-review-admin.md
```

## Pre-Coding Gate

Decision: Accept.

Evidence: `reports/validation/2026-07-02-goal-25-bazos-product-quality-pre-coding.md`.

## Execution Steps

1. Inspect remote worktree and existing Bazos catalog sell-action paths.
2. Inspect Catalog Goal 25 contract and implemented Catalog readiness/review endpoints.
3. Add Catalog readiness consumer to Bazos client.
4. Add fail-closed quality preflight before Bazos draft mutation and queue confirmation.
5. Surface blocker details in API/UI.
6. Add focused tests.
7. Run validation and record results.
8. Update implementation state and report commit/no-commit status.

## Validation

```bash
git diff --check
npm --prefix shared test -- bazos-catalog-sell-action.service.spec.ts
npm --prefix shared run build
npm --prefix services/aukro-service run build
```

## Completion Report

Use `reports/validation/2026-07-02-goal-25-bazos-product-quality-consumer.md` plus the final worker handoff.
