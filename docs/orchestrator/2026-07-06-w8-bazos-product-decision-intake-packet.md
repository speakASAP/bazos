# W8 Bazos Product Decision Intake Packet

Date: 2026-07-06
Repo: `/home/ssf/Documents/Github/bazos`
Status: scope-decision-selected-provider-proof-unclaimed
Workstream: W8 Bazos provider-backed order lifecycle proof

## Intent Preservation Chain

Vision -> Every sellable order is error-free and every buyer/admin surface reflects canonical Orders lifecycle without claiming provider-backed marketplace evidence from synthetic/internal data.

Goal Impact -> The current release records one explicit scope-only product/provider decision without inventing provider semantics, while keeping provider-backed proof unclaimed until future non-secret evidence exists.

System -> Bazos owns local channel intake and source-only proof boundaries; Orders owns canonical lifecycle; Warehouse owns `warehouseId` and stock/reservation/fulfillment; provider facts remain external until an owner-approved non-secret packet exists.

Feature -> Bazos W8 product/provider decision intake boundary.

Task -> Mirror the Orders W8 intake boundary locally by recording one allowed scope-only decision option while preserving unknown provider support and missing provider packet fields.

Execution Plan -> Keep this as documentation and static validation only; do not deploy, change runtime source/schema, read/write databases, call providers, use browser sessions, or output raw tokens/IDs/customer/payment/provider/tracking data.

Coding Prompt -> Do not invent Bazos provider webhook/status semantics. Accept only one owner-selected option from the allowed list below and keep provider-backed proof blocked until the matching packet evidence exists.

Code -> `docs/orchestrator/2026-07-06-w8-bazos-product-decision-intake-packet.md`, `reports/validation/2026-07-06-W8-bazos-product-decision-intake.md`, `scripts/verify-bazos-product-decision-intake.js`, `package.json`.

Validation -> `npm run verify:bazos-product-decision-intake`; existing W8/source gates remain `npm run verify:bazos-provider-proof-gate`, `npm run verify:bazos-provider-proof-boundary`, `npm run verify:orders-lifecycle-ui`, and `git diff --check`.

## Decision Rule

Exactly one product decision option is now recorded for the current release. Bazos W8 provider-backed proof remains intentionally unclaimed and blocked from provider-backed status without future non-secret evidence.

Selection state:

```yaml
selected_option: "bounded_synthetic_accepted_for_now"
allowed_options:
  - provider_backed_supported
  - provider_backed_not_supported
  - provider_backed_out_of_scope
  - bounded_synthetic_accepted_for_now
```

## Allowed Product Decision Options

| Option | Owner meaning | What it permits now | What it does not permit |
|---|---|---|---|
| `provider_backed_supported` | Bazos has or will supply a real provider-backed order/status source. | Prepare a provider-backed packet after non-secret contract evidence is supplied. | Does not prove support by itself and does not authorize provider calls, DB mutation, deploy, Orders create, or Warehouse mutation. |
| `provider_backed_not_supported` | Bazos has no provider-backed marketplace order/status source for this W8 lane. | Update acceptance criteria to treat provider-backed proof as intentionally unavailable after owner approval. | Does not allow synthetic/internal evidence to be relabeled provider-backed. |
| `provider_backed_out_of_scope` | Provider-backed marketplace order/status proof is outside the current Bazos product scope. | Keep W8 closed or parked as product out-of-scope after owner approval. | Does not define webhook/status semantics or future provider support. |
| `bounded_synthetic_accepted_for_now` | Current bounded synthetic/internal Bazos evidence is accepted only as interim source/UI evidence. | Continue using source/UI proof with explicit labeling and blocker preservation. | Does not satisfy provider-backed proof and does not remove missing provider packet fields. |

## Preserved Unknowns And Missing Provider Packet Fields

- `[UNKNOWN: live Bazos marketplace webhook support]`
- `[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]`
- `[MISSING: provider-backed Bazos order item/status ingestion contract]`
- `[MISSING: provider-backed Bazos order status transition sample]`
- `[MISSING: provider-backed Bazos order item identity mapping sample]`
- `[MISSING: Warehouse-owned warehouseId for provider-backed Bazos order items]`
- `[MISSING: approved live Bazos buyer bearer/session packet for /ui/orders customer cabinet smoke]`
- `[MISSING: approved live Bazos admin bearer/session packet for /ui/orders?scope=admin cabinet smoke]`

## Fail-Closed Boundaries

- Provider-backed proof is blocked until one allowed product option is owner-selected and the required evidence for that option exists.
- `provider_backed_supported` still requires a non-secret provider packet before runtime validation.
- `bounded_synthetic_accepted_for_now` can only describe synthetic/internal source or UI read-model evidence.
- No option authorizes raw provider payload output, customer/payment/tracking data output, token/session output, browser/session work, live provider calls, DB reads/writes, schema changes, runtime source changes, deploy, Orders mutation, Warehouse mutation, payment action, or screenshots.
- Provider-backed completion, verification, pass, resolved, or production-ready language is forbidden until a future owner-approved provider packet is validated.

## Parallel Execution

| Workstream | Status | Owner role | Objective | Dependencies/blockers | Validation evidence | Handoff notes |
|---|---|---|---|---|---|---|
| W8-D Bazos decision intake | complete-source-validated | Bazos documentation/validation owner | Provide local exactly-one product decision packet | none for source packet | `verify:bazos-product-decision-intake` | This packet now records a scope-only decision for the current release while preserving provider-backed blockers |
| W8-E Scope decision recorded | complete | Orchestrator under standing owner delegation | Record exactly one allowed current-release option | none for source decision | current packet plus verifier | Selected `bounded_synthetic_accepted_for_now`; must not invent provider semantics |
| W8-F Provider evidence packet | future product-gated | Bazos/provider owner | Supply non-secret provider packet only if product later reopens `provider_backed_supported` | `[UNKNOWN: live Bazos marketplace webhook support]`, missing provider packet fields above | future provider packet verifier | Required before any provider-backed proof claim |
| W8-G Final integration | final-integration | Validation owner | Reconcile Bazos local decision with Orders W8 intake boundary | owner decision plus relevant packet evidence | future validation report | Merge after owner decision and evidence are explicit |

## Current Status Link

This packet is a local Bazos intake artifact linked to `docs/orchestrator/2026-07-05-runtime-gate-packet-handoff.md`, which remains aligned to the Orders runtime gate contract commit `6f0332c` and now records the selected scope-only option `bounded_synthetic_accepted_for_now`.
