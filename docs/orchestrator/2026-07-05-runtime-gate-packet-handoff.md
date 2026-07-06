# Bazos Provider Runtime Gate Packet Handoff

status: source-handoff-provider-packet-gated
created_at: 2026-07-05
repository: /home/ssf/Documents/Github/bazos
orders_packet_contract: /home/ssf/Documents/Github/orders-microservice/docs/orchestrator/2026-07-05-runtime-gate-packet-contracts.md
orders_packet_contract_commit: 6f0332c
workstream: W8 Bazos provider-backed order lifecycle proof

## Intent Preservation Chain

Vision -> Every sellable order is error-free and every buyer/admin surface reflects canonical Orders lifecycle.

Goal Impact -> Bazos provider-backed order/status evidence must not be asserted until provider support, item identity, and Warehouse ownership are explicit.

System -> Bazos owns channel UI/provider-adapter evidence. Orders owns canonical lifecycle. Warehouse owns warehouseId and stock ownership. Provider facts remain external.

Feature -> Bazos provider-backed lifecycle proof packet boundary.

Task -> Consume the Orders runtime packet contract for Bazos provider proof and preserve provider gates without inventing webhook/provider contracts.

Execution Plan -> Treat Orders commit 6f0332c as the source of truth for runtime gate packet shape; keep this repo source-only until exactly one owner decision option exists, and require provider evidence only if `provider_backed_supported` is selected; preserve missing facts as [MISSING: ...] or [UNKNOWN: ...].

Coding Prompt -> Remote-only Alfares workflow. Do not deploy, mutate orders, mutate Warehouse stock/fulfillment, call providers, print tokens, print raw customer/order/payment/provider/tracking data, print raw DB rows, or capture screenshots from this handoff.

Code -> Documentation handoff only. Runtime implementation/smoke remains gated.

Validation -> git diff --check; npm run verify:bazos-product-decision-intake; npm run verify:bazos-provider-proof-gate; npm run verify:bazos-provider-proof-boundary; Orders npm run verify:runtime-gate-packets at commit 6f0332c.

## Required Packet

Packet section: W8 Bazos Provider-Backed Proof Packet in Orders runtime gate packet contract.

Required owner decision before runtime proof:

- [MISSING: Bazos owner must select exactly one allowed product decision option]
- [UNKNOWN: live Bazos marketplace webhook support]
- Allowed options: `provider_backed_supported`, `provider_backed_not_supported`, `provider_backed_out_of_scope`, or `bounded_synthetic_accepted_for_now`.

Required non-secret fields if `provider_backed_supported` is selected:

- [MISSING: approved provider-backed non-secret fixture or live provider smoke packet]
- Provider order item/status ingestion contract.
- Provider status transition sample with raw provider payload redacted.
- Item identity mapping from provider item to Catalog/Orders/Warehouse product identifiers.
- Warehouse-owned warehouseId for every provider-backed item.
- Orders lifecycle and buyer/admin readback boundary.

Scope-only options `provider_backed_not_supported`, `provider_backed_out_of_scope`, or `bounded_synthetic_accepted_for_now` do not prove provider-backed lifecycle support.

## Abort Conditions

- No product decision exists.
- `provider_backed_supported` is selected while provider item identity or Warehouse ownership is missing.
- Scope-only options are relabeled as provider-backed proof.
- Proof requires raw provider payload output.

## Current Decision

This repo is aligned to the central Orders runtime packet contract at commit `6f0332c`, but this handoff does not authorize live mutation, provider calls, deploys, DB writes, bearer/session capture, token output, raw payload output, or screenshots. Provider-backed proof is blocked until one allowed product option is owner-selected. Runtime provider-backed proof remains blocked until the required packet for the selected option is supplied and validated.
