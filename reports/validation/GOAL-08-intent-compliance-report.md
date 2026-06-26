# GOAL-08 Intent Compliance Report

## Goal

Migrate Basus client/admin login entry to centralized hosted Alfares Auth.

## Goal Impact

Basus no longer collects registration/login passwords in its own UI. Users are sent to Auth-hosted `/login` or `/register`, return through `/auth/callback`, and Basus validates Auth-issued tokens with existing server-side AuthService validation.

## Implemented

- Added `/auth/callback` route.
- Added callback fragment parser with `state` validation, fragment stripping, token storage, and safe return to `/client` or `/admin`.
- Replaced the local `/client` credential registration/login block with hosted Auth action buttons.
- Removed UI controller POST endpoints for `/ui/auth/login` and `/ui/auth/register`.
- Kept `/ui/auth/me` as server-side Auth token validation.

## Not Implemented

- BFF/httpOnly cookie session adapter. Current storage is the documented transitional browser token model.
- Live credential smoke with a real user.
- Auth runtime allowlist mutation.

## Bazos Compliance Check

No Bazos publishing policy, identity verification, browser automation, session envelope, duplicate, category, active-ad, content, or challenge stop-state logic changed.

## Validation Evidence

See `reports/validation/GOAL-08-validation-report.md`.

## Readiness Gate Evidence

See `reports/validation/GOAL-08-pre-coding-readiness.md`.

## Risks

- Production deployment smoke is still pending until deploy completes.
- `[PENDING: live post-deploy smoke without exposing token fragments]`.
- `[PENDING: future BFF/httpOnly cookie adapter]`.

## Files Changed

- `services/aukro-service/src/ui/ui.assets.ts`
- `services/aukro-service/src/ui/ui.controller.ts`
- `implementation-goals/GOAL-08-hosted-auth-ui.md`
- `reports/validation/GOAL-08-pre-coding-readiness.md`
- `reports/validation/GOAL-08-validation-report.md`
- `reports/validation/GOAL-08-intent-compliance-report.md`
- `docs/IMPLEMENTATION_STATE.md`

## Commit Or No-Commit Reason

Pending commit in this session before deployment.

## Next Action

Commit the source/docs update, deploy if deployment-readiness evidence remains clean, then run production smoke.
