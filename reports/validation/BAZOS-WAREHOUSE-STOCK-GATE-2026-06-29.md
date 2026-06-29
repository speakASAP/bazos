# Bazos Warehouse Stock Gate Validation

Date: 2026-06-29
Status: validated

## Intent Preservation Chain

- Vision: Warehouse remains the stock authority across channel publish flows.
- Goal Impact: Bazos must not queue or publish sellable listings from caller-provided stock values when Warehouse evidence is missing or unavailable.
- System: `bazos-service` on `alfares:/home/ssf/Documents/Github/bazos-service`.
- Feature: Bazos guarded publisher queue and Catalog sell action publish policy.
- Task: Add the smallest Bazos-side fail-closed stock safety gate.
- Execution Plan: Gate publish policy evaluation because enqueue and claim both call `PublishPolicyService`.
- Coding Prompt: Delegated remote-only Bazos stock safety task from stock orchestrator.
- Code: `shared/bazos/policy/publish-policy.service.ts`, `shared/bazos/policy/publish-policy.types.ts`, `shared/bazos/policy/publish-policy.service.spec.ts`, `docs/BAZOS_COMPLIANCE.md`, `docs/IMPLEMENTATION_STATE.md`.
- Validation: focused policy spec passed; `git diff --check`, shared build, shared tests, and root tests passed.

## Known Facts

- Warehouse availability and route evidence are required before Bazos publish queueing/claiming.
- Local `BazosAd.stockQuantity` is not sellable truth.
- [UNKNOWN: live Warehouse response shape beyond existing `getStockByProduct` and `getTotalAvailable` clients]


## Validation Commands

- `npm --prefix shared test -- --runTestsByPath bazos/policy/publish-policy.service.spec.ts` - PASS, 1 suite, 38 tests.
- `git status --short --branch` - PASS, intended files only before commit.
- `git diff --check` - PASS, no whitespace errors.
- `npm --prefix shared run build` - PASS.
- `npm --prefix shared test` - PASS, 6 suites, 104 tests.
- `npm test` - PASS, 6 suites, 104 tests.
