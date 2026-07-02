# Bazos Central Orders Status Read Model Plan

Date: 2026-07-02
Parent plan: `orders-microservice/docs/orchestrator/2026-07-02-order-lifecycle-warehouse-status-rollout-plan.md`

## Objective

Bazos must forward active orders to central Orders and display central lifecycle state wherever order/customer/admin views exist.

## Current Evidence

- Prior validation found Bazos channel order smoke evidence.
- `[UNKNOWN: true provider-backed Bazos order webhook path.]`
- `[UNKNOWN: buyer-facing cabinet versus operator-only dashboard surface.]`

## Workstream

Owner role: Bazos order read-model owner
Status: partially blocked until provider path discovery

Allowed files:

- Bazos order service/dashboard files identified during discovery
- `docs/**`
- tests and validation reports

Forbidden files:

- provider credentials
- unrelated catalog source work

## Required Work

1. Inspect Bazos order ingestion and provider webhook path.
2. Confirm central Orders id mapping or mark `[MISSING: central Orders id mapping]`.
3. Render lifecycle stage from Orders API or lifecycle events.
4. Show unforwarded/stale orders as actionable.

## Validation

- provider-backed or documented simulator order creates central Orders row
- order dashboard/cabinet shows central lifecycle
- unknown provider path remains explicitly marked, not invented
