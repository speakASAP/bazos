# GOAL-08 - Hosted Alfares Auth UI Migration

## Purpose

Replace the Basus-local client login and registration credential form with the centralized Alfares Auth hosted login and registration flow.

## Intent Trace

- User request on 2026-06-26: `/client` must use the standard Alfares ecosystem login/registration surface instead of collecting credentials in Basus.
- Auth microservice `docs/HOSTED_AUTH_CONSUMER_STANDARD.md`: consumers redirect to hosted Auth with `client_id`, `return_url`, and `state`, then parse token handoff from the callback fragment.
- `docs/BAZOS_COMPLIANCE.md`: UI changes must not weaken Bazos verification, session, duplicate, rate, category, active-ad, content, or challenge stop-state controls.
- `docs/process/INTENT_PRESERVATION_SYSTEM.md`: preserve Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation.

## Goal Impact

Basus becomes an Auth consumer instead of a local credential collector. Human users sign in or register through `https://auth.alfares.cz`, then return to `https://bazos.alfares.cz/auth/callback`; Basus continues to validate Auth-issued access tokens through `/ui/auth/me` and existing AuthService validation.

## Scope

- Add Basus `/auth/callback` UI route.
- Replace `/client` and `/admin` credential forms with hosted Auth redirect actions.
- Generate and validate callback `state`.
- Parse only URL fragment token handoff, strip the fragment, and redirect back to `/client` or `/admin`.
- Remove local UI credential proxy endpoints `/ui/auth/login` and `/ui/auth/register` from the controller.

## Out Of Scope

- No change to Bazos publisher policy, queueing, identity verification, browser automation, or compliance stop states.
- No production credential smoke with real user data.
- No BFF/httpOnly cookie adapter; the browser token storage remains the already-existing transitional model.
- No Auth microservice runtime allowlist mutation in this Basus goal.

## Parallel Execution

- Workstream: Basus hosted Auth UI migration - status `ready now`; owner role `integration implementer`; files `services/aukro-service/src/ui/ui.assets.ts`, `services/aukro-service/src/ui/ui.controller.ts`.
- Workstream: Auth runtime allowlist verification - status `validation owner`; owner role `validator`; expected evidence `GET /auth/validate-return-url?return_url=https://bazos.alfares.cz/auth/callback`.
- Workstream: live deploy/smoke - status `final integration`; owner role `integration owner`; dependency `build/test/static checks pass and deployment-readiness evidence recorded`.

## Validation

- `npm --prefix services/aukro-service run build`
- `npm test`
- `git diff --check`
- Static scan that active source UI has no local password form or `/ui/auth/login|register` credential posts.
- Hosted Auth return URL validation before production deployment.
