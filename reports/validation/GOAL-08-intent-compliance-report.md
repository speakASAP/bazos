# GOAL-08 Intent Compliance Report

## Goal

Migrate Bazoš client/admin login entry to centralized hosted Alfares Auth.

## Goal Impact

Bazoš no longer collects registration/login passwords in its own UI. Users are sent to Auth-hosted `/login` or `/register`, return through `/auth/callback`, and Bazoš validates Auth-issued tokens with existing server-side AuthService validation.

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

- Full credential callback/session smoke remains pending because no approved real/synthetic user credential was used.
- `[PENDING: live post-deploy smoke without exposing token fragments]`.
- `[PENDING: future BFF/httpOnly cookie adapter]`.

## Files Changed

- `services/bazos-service/src/ui/ui.assets.ts`
- `services/bazos-service/src/ui/ui.controller.ts`
- `implementation-goals/GOAL-08-hosted-auth-ui.md`
- `reports/validation/GOAL-08-pre-coding-readiness.md`
- `reports/validation/GOAL-08-validation-report.md`
- `reports/validation/GOAL-08-intent-compliance-report.md`
- `docs/IMPLEMENTATION_STATE.md`

## Commit Or No-Commit Reason

Committed in source commit `43a2f7d`; cache/deploy fix committed in `468a42f`; post-deploy report committed after rollout.

## Next Action

No further action required for hosted Auth entry deployment; future work is BFF/httpOnly session adapter and approved credential callback smoke if needed.
