# GOAL-12 - Client Overview Bazos Statistics

## Purpose

Make `/client` `Přehled` show complete user-facing Bazos status and capacity statistics for the signed-in customer.

## Intent Trace

- Owner request on 2026-06-26: the client dashboard overview must show Bazos statistics, login status, phone verification/session readiness, remaining posting capacity, current-month counts, and links to the user's ads.
- Bazos compliance invariants: do not bypass Bazos verification, rate controls, active-ad caps, duplicate checks, category cadence, content controls, or challenge stops.
- Existing source contracts: `/api/bazos/ads`, `/api/bazos/identities`, and `/api/bazos/publish-queue` remain guarded by Auth/JWT and user scoping.

## Goal Impact

The customer overview now explains whether the Alfares session is active, which Bazos identities are ready, how much of the verified-identity active-ad capacity remains, how many ads were created/published this month, and which ads can be opened from the overview. The change is read-only UI aggregation; backend publish gates remain authoritative.

## Scope

- Update only the client UI overview rendering and related CSS/helpers.
- Use existing guarded endpoints and existing Bazos identity/ad fields.
- Add public Bazos links only when a stored `bazosAdId` exists.
- Mask phone details in the overview by showing verification status, not raw phone numbers.

## Out Of Scope

- No Bazos publishing automation change.
- No backend schema or API contract change.
- No Auth role or account mutation.
- No production data edit.

## Acceptance Criteria

- `/client` `Přehled` shows login status, verified identity readiness, remaining capacity, current-month counts, total/published/active/risk/queue counts.
- `/client` `Přehled` lists Bazos identities with phone verification state and per-identity remaining capacity.
- `/client` `Přehled` lists recent user ads with a Bazos link when `bazosAdId` is present, otherwise a link to the local ads list.
- Build, tests, and diff check pass.

## Parallel Execution

- Workstream: Overview UI aggregation - status `ready now`; owner role `integration implementer`; files `services/aukro-service/src/ui/ui.assets.ts`; validation owner `original thread`.
- Workstream: Backend/API changes - status `blocked`; reason `not needed for requested overview because existing guarded endpoints expose the required fields`.
- Workstream: Deploy/smoke - status `final integration`; dependency `source validation pass and commit`.
- Shared contracts: existing Bazos ad and identity DTO shapes; integration owner: original thread; merge order: UI patch, validation, report/state update, commit, deploy.

## Validation

- `npm --prefix services/aukro-service run build`
- `npm --prefix shared run build`
- `npm test`
- `git diff --check`

## Completion Report

See `reports/validation/GOAL-12-client-overview-statistics-report.md`.
