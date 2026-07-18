# GOAL-06 - Landing, Admin, And Client UI

## Purpose

Create a public landing page for `https://bazos.alfares.cz` and authenticated Bazos service UI surfaces for administrators and customers.

## Intent Trace

- `BUSINESS.md`: Bazos-service supports compliant Bazos.cz classifieds operations.
- `SPEC.md`: UI must make Bazos limitations visible before publish features are enabled.
- `docs/BAZOS_COMPLIANCE.md`: publishing must not bypass SMS, CAPTCHA, device, session, duplicate, rate, category, active-ad, or content controls.
- `docs/governance/PROJECT_INVARIANTS.md`: UI changes must preserve all Bazos compliance invariants.

## Goal Impact

This goal improves discoverability and operability only. It does not add new publishing capability, weaken policy gates, create Bazos identities, or deploy production changes without owner approval.

The public landing page explains why AlfaRes Bazos Service is useful compared with manual native Bazos usage: catalog-to-draft preparation, status visibility, policy checks, queue transparency, duplicate/category/rate protection, and operational review.

The admin and client sections use Auth microservice JWTs through the existing shared auth contract. Data access remains protected by existing guarded backend endpoints.

## Scope

- Add a Bazos UI module to the deployed NestJS service.
- Serve a public landing page at `/`.
- Serve app shells at `/admin` and `/client`.
- Add `/ui/auth/login`, `/ui/auth/register`, and `/ui/auth/me` for Auth microservice-backed session handling.
- Add static CSS and JavaScript routes under `/ui/*`.
- Wire the UI module into `services/bazos-service/src/app.module.ts`.

## Out Of Scope

- No production deployment in this goal without deployment-readiness approval.
- No changes to Bazos publisher policy, queue, browser automation, or verification behavior.
- No new Bazos posting API claim.
- No role-based admin authorization beyond current JWT validation because no admin RBAC contract exists in this repository.

## Acceptance Criteria

- Root `/` returns a landing page instead of `Cannot GET /`.
- Landing copy states compliance constraints, 49 Kc/month customer pricing, and benefits without implying bypasses.
- `/admin` and `/client` render separate authenticated UI shells without cross-dashboard mixing.
- Admin data calls require an Auth microservice JWT and use existing monitoring endpoints.
- Client offer calls require an Auth microservice JWT and use existing offer endpoints.
- Client auth supports sign-in or registration through the Auth microservice.
- Build and tests pass.

## Required Reading

Completed before coding:

- `AGENTS.md`
- `README.md`
- `BUSINESS.md`
- `SPEC.md`
- `SYSTEM.md`
- `PLAN.md`
- `TASKS.md`
- `docs/BAZOS_COMPLIANCE.md`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/governance/PROJECT_INVARIANTS.md`
- `docs/process/INTENT_PRESERVATION_SYSTEM.md`
- `docs/process/DOCUMENTATION_COMPLETENESS_STANDARD.md`
- `docs/process/OPERATIONAL_GATES.md`
- `docs/process/AGENT_GAP_FILLING_RULES.md`
- `implementation-goals/README.md`

## Pre-Coding Gate

See `reports/validation/GOAL-06-pre-coding-readiness.md`.

## Execution Steps

1. Create UI module/controller/static assets in `services/bazos-service/src/ui`.
2. Register UI module in `AppModule`.
3. Validate TypeScript build and shared tests.
4. Verify root and UI routes locally or against a started service when available.
5. Record validation and intent compliance reports.
6. Update implementation state and commit or record no-commit reason.

## Validation

- `npm --prefix services/bazos-service run build`
- `npm test`
- `git diff --check`
- Route smoke checks when the service can be started safely.

## Completion Report

To be completed after validation.
