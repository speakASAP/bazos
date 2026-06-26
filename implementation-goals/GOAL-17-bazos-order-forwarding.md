# GOAL-17 Bazos Order Forwarding

## Intent Preservation Chain

- Vision: Keep Bazos channel behavior compatible with product-level Catalog and Orders statistics without inventing sales.
- Goal Impact: Bazos must never report a central order unless every forwarded item is mapped to a Catalog product through a local Bazos ad.
- System: `bazos-service` remote repository on Alfares.
- Feature: Bazos order ingestion and central Orders forwarding.
- Task: Replace empty-item forwarding with product-mapped forwarding or a defensive unavailable result.
- Execution Plan: Inspect current order stub, map incoming Bazos ad line identifiers to `BazosAd.productId`, fail closed when the item ingestion contract is missing, and add focused validation.
- Coding Prompt: Catalog Goal 17 / Bazos channel workstream.
- Code: `services/aukro-service/src/aukro/orders/orders.service.ts`.
- Validation: See `reports/validation/GOAL-17-bazos-order-forwarding-report.md`.

## Scope

Allowed:

- Bazos order ingestion and forwarding.
- Focused tests and status documentation.

Forbidden:

- Catalog and Orders repo edits.
- Publishing, CAPTCHA/SMS/bank/session/challenge flows.
- Listing mutation, deploy, payment, refund, stock, or customer-data exposure.

## Parallel Execution

- Workstream: Bazos order forwarding guard - status `ready now`; owner role `Bazos channel sub-agent`; files `services/aukro-service/src/aukro/orders/*`; validation owner same session.
- Workstream: true Bazos order ingestion contract - status `blocked`; blocker `[MISSING: Bazos order item ingestion contract]`; requires owner/API contract input before another agent can safely implement webhook ingestion.
- Final integration: original Catalog Goal 17 orchestrator; merge order `Bazos guard commit -> Catalog/Orders validator rerun`.

