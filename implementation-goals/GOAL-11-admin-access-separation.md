# GOAL-11 - Admin Access Separation

## Purpose

Make `/admin` a business-owner administration surface, not a general customer dashboard, while keeping every normal user's Bazos ads and publish workflow in `/client`.

## Intent Trace

- Owner request on 2026-06-26: `/admin` must be available only to the owner's/test administrator user and must not be linked from the public landing page.
- Auth `docs/UNIFIED_AUTH_CONTRACT.md`: Auth owns RBAC role claims and `POST /auth/validate` returns current user roles.
- Bazoš remote-only workflow: changes are made only in `alfares:/home/ssf/Documents/Github/bazos-service`.
- Bazos compliance invariants: no publishing, verification, duplicate, rate, category, session, or challenge controls are weakened.

## Goal Impact

The UI and server-side UI session gate now separate customer and administrator access. Normal users keep `/client` for their own ads. Admin entry is no longer advertised on the public landing page and is exposed inside the client section only when Auth roles or the configured fallback allowlist mark the signed-in user as an administrator.

## Scope

- Remove the public landing-page `/admin` card.
- Add server-side admin access evaluation to `/ui/auth/me?mode=admin`.
- Return `access.admin` to the browser after Auth token validation.
- Show the `/admin` link inside `/client` only for admin users.
- Add non-secret config placeholder `BAZOS_ADMIN_EMAILS` for the test/admin user if Auth roles are not yet assigned.

## Out Of Scope

- No Auth database role mutation.
- No production user data inspection.
- No Bazos publishing, queue, identity, browser automation, or compliance policy change.
- No billing/subscription enforcement change.

## Acceptance Criteria

- `/` no longer contains a clickable public `/admin` link.
- `/client` remains the customer section for each user's own ads.
- `/ui/auth/me?mode=admin` returns 401 without a token and 403 for valid non-admin users.
- Admin users are recognized through Auth role claims such as `global:superadmin`, `global:platform_admin`, or `app:bazos-service:admin`, with `BAZOS_ADMIN_EMAILS` as a fallback allowlist.
- Build, tests, diff check, and static source checks pass.

## Parallel Execution

- Workstream: UI/admin access patch - status `ready now`; owner role `integration implementer`; files `services/bazos-service/src/ui/ui.controller.ts`, `services/bazos-service/src/ui/ui.assets.ts`, `k8s/configmap.yaml`, `.env.example`.
- Workstream: Auth role assignment verification - status `dependency-gated`; owner role `Auth/admin operator`; expected evidence `[MISSING: confirm test user has app:bazos-service:admin or configure BAZOS_ADMIN_EMAILS]`; forbidden files `services/bazos-service/src/**`.
- Workstream: deploy/smoke - status `final integration`; owner role `integration owner`; dependency `validation pass and admin identity configured`.
- Shared contracts: Auth role strings from `POST /auth/validate`; integration owner: original thread; validation owner: original thread; merge order: source patch, config/identity verification, deploy.

## Validation

- `npm --prefix services/bazos-service run build`
- `npm test`
- `git diff --check`
- Static source checks for public admin link removal and admin access guard.

## Completion Report

See `reports/validation/GOAL-11-admin-access-separation-report.md`.
