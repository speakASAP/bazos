# GOAL-25 Bazos Product Quality Consumer Pre-Coding Gate

```yaml
id: VAL-GOAL-25-BAZOS-PRODUCT-QUALITY-PRE-CODING
status: accepted
created: 2026-07-02
repository: /home/ssf/Documents/Github/bazos
branch: main
```

## Artifact Validated

Pre-coding readiness for Bazos consuming Catalog Goal 25 product quality blockers before catalog sell-action draft preparation and queue confirmation.

## Validation Scope

- Remote-only Alfares repo workflow.
- Catalog contract/readiness source.
- Bazos compliance invariants.
- Bounded files and validation plan.
- No-deploy gate.

## Commands Run

```text
git status --short --branch
# ## main...origin/main

git branch --show-current
# main

git log -1 --oneline
# b6ebb1c docs: record catalog review metadata deploy
```

## Gate Evidence

Required context from `AGENTS.md` and required Bazos project/process docs was read. Catalog contract and validation report were inspected. Existing Bazos sell-action service, controller, DTO, UI, tests, and Catalog client were inspected.

## Invariant Evidence

The planned change does not add direct Bazos posting, does not bypass verification/challenge/rate/duplicate/content gates, does not alter Warehouse stock ownership, and does not log secrets. Bazos queue confirmation remains delegated to the guarded queue.

## Sensitive-Data Scan Evidence

No secret/config values are required. The implementation may pass Authorization to Catalog but must not log or print it. Returned blocker details are sanitized policy codes/messages.

## Contract Evidence

Catalog stable policy: `catalog.product_quality.v1`.

Mandatory blockers include `missing_sku`, `duplicate_sku`, `missing_title`, `missing_description`, `missing_current_price`, `missing_image`, `placeholder_image_only`, and `archived_product`. EAN is optional/non-blocking.

Implemented Catalog exact product readiness endpoint returns the same issue codes for per-product preflight. `GET /api/products/review/quality` does not expose an exact product-id filter in the inspected DTO; using readiness is the bounded exact-product consumer path allowed by the worker prompt.

## Replay And Determinism Evidence

Blocked prepare will not create/update drafts. Confirm will re-check quality before enqueueing. Existing Bazos queue idempotency and pacing are not changed.

## Passed Criteria

- Goal impact exists.
- Execution plan exists.
- Allowed/forbidden files are explicit.
- Validation commands are declared.
- Remote worktree state is known and clean.
- No deployment approval is assumed.

## Failed Criteria

None for pre-coding.

## Deviations

No parallel worker was spawned because the safe scope shares one API response contract and overlapping files. The execution plan documents this as a single-worker final integration.

## Recommendation

Proceed with bounded code changes and focused validation. Do not deploy.

## Next Action

Implement the Catalog quality preflight in Bazos and run validation.
