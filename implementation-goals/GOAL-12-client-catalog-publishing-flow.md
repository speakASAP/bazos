# GOAL-12 Client Catalog Publishing Flow

## Purpose

Expose the existing guarded catalog-to-Bazoš publishing contract inside `/client` so a user can select a catalog product, form a local classified ad draft, preview it, explicitly approve it, and send it to the guarded Bazoš publish queue.

## Intent Trace

Source: owner request on 2026-06-26 for `https://bazos.alfares.cz/client`.

## Goal Impact

Client users can prepare Bazoš ads from Catalog Microservice products without bypassing Bazoš policy, identity, duplicate, content, category, active-ad, or challenge gates.

## System

- Bazoš UI remains hosted by `bazos-service`.
- Product search is proxied through authenticated `/ui/catalog/products`.
- Draft creation and approval use existing guarded endpoints under `/api/bazos/catalog/products/:productId/sell-action`.
- Actual publishing is still delegated to the Bazoš guarded publish queue.

## Feature

- New `/client` catalog tab and sidebar entry.
- Product search and product selection from Catalog Microservice data.
- Identity selection and editable title, description, price, category, and location.
- `Sformovat inzerát` action that creates/reuses a Bazoš draft and evaluates policy.
- Preview card showing Bazoš-facing title, price, description, category mapping, identity active-ad count, next action, and human-action state.
- Explicit approve/post action that sends manual-review evidence to the guarded queue.

## Task

Implement only the client-side user flow and read-only catalog proxy. Do not add a direct Bazoš posting bypass.

## Execution Plan

1. Add authenticated UI catalog product proxy.
2. Extend `/client` navigation and tab layout with a Catalog flow.
3. Search and select catalog products.
4. Generate a Bazoš draft/preview through the existing sell-action endpoint.
5. Confirm only with explicit user approval and required manual-review evidence.
6. Validate build, JS parse, Jest, whitespace, deploy, and live smoke.

## Coding Prompt

Add the requested catalog-to-Bazoš publishing flow inside the Bazoš client UI while preserving backend publishing guardrails and traceability.

## Code

- `services/bazos-service/src/ui/ui.controller.ts`
- `services/bazos-service/src/ui/ui.module.ts`
- `services/bazos-service/src/ui/ui.assets.ts`

## Validation

See `reports/validation/GOAL-12-validation-report.md`.

## Parallel Execution

- Workstream: client UI flow - status `ready now`; owner role `implementation owner`; files `services/bazos-service/src/ui/ui.assets.ts`; validation owner `implementation owner`.
- Workstream: UI catalog proxy - status `ready now`; owner role `implementation owner`; files `services/bazos-service/src/ui/ui.controller.ts`, `services/bazos-service/src/ui/ui.module.ts`; validation owner `implementation owner`.
- Workstream: deploy/live smoke - status `final integration`; owner role `integration owner`; dependency `build/test/static checks pass and source is committed`; merge order `proxy -> UI flow -> deploy`.
- Shared contract: existing `/api/bazos/catalog/products/:productId/sell-action` prepare/confirm/status API.
- Forbidden files: production secrets, compliance policy gates, publisher queue bypasses.
