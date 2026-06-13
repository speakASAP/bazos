# GOAL-06 Validation Report

## Artifact Validated

Landing, admin, and client UI for `bazos-service`.

## Validation Scope

Validation of the Bazos landing page, administrator UI shell, customer UI shell, Auth microservice login bridge, guarded data access wiring, and static asset rendering.

## Commands Run

- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix services/aukro-service run build'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service/services/aukro-service && node ... dist/ui/ui.assets.js checks'`
- Temporary service startup on `BAZOS_SERVICE_PORT=3919`
- Playwright static-render screenshots from compiled UI assets.

## Gate Evidence

| Gate | Result | Evidence |
|---|---|---|
| TypeScript build | pass | `npm --prefix services/aukro-service run build` completed. |
| Shared tests | pass | `npm test` completed: 5 suites, 79 tests passed. |
| Whitespace diff | pass | `git diff --check` completed with no output. |
| Route registration | pass | Temporary startup logs mapped `/`, `/admin`, `/client`, `/ui/app.css`, `/ui/app.js`, `/ui/auth/login`, and `/ui/auth/me`. |
| Live route smoke | limited | Startup could not complete outside Kubernetes because Prisma could not reach cluster hostname `db-server-postgres:5432`. No production route smoke was attempted because deployment approval was not requested. |
| Static render smoke | pass | Compiled assets returned expected landing/admin/client strings and auth endpoints. |
| Visual QA | pass | Screenshots captured at `/private/tmp/bazos-ui-work/landing-desktop.png`, `/private/tmp/bazos-ui-work/landing-mobile.png`, `/private/tmp/bazos-ui-work/admin-desktop.png`, `/private/tmp/bazos-ui-work/client-desktop.png`. No horizontal overflow detected. |

## Invariant Evidence

The implementation does not modify publishing policy, publisher queue, browser submitter, identity verification, challenge handling, duplicate checking, category cadence, active-ad caps, or session encryption. UI copy explicitly states that the service does not replace Bazos verification or bypass platform controls.

## Sensitive-Data Scan Evidence

Scan command:

```bash
grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist -E "cookie|verification code|password|payment|captcha|bypass|raw" services/aukro-service/src/ui implementation-goals/GOAL-06-landing-admin-client-ui.md reports/validation/GOAL-06-*
```

Findings were expected and acceptable:

- Login form has a `password` field.
- Documentation and UI use `bypass` only to state that bypassing Bazos controls is not allowed.
- Readiness report states no cookies, verification codes, payment details, or raw session values are displayed.

## Contract Evidence

Added routes:

- `GET /`
- `GET /admin`
- `GET /client`
- `GET /ui/app.css`
- `GET /ui/app.js`
- `POST /ui/auth/login`
- `GET /ui/auth/me`

The admin and client app shells authenticate through `/ui/auth/login`, store the returned JWT in browser localStorage, verify it through guarded `/ui/auth/me`, and call existing guarded data endpoints with `Authorization: Bearer <token>`.

## Replay And Determinism Evidence

Not applicable. This goal does not enqueue, claim, submit, retry, reconcile, or schedule publish attempts.

## Passed Criteria

- Root landing HTML is implemented.
- Admin and client app shells are implemented.
- Auth microservice login bridge is implemented through existing `AuthService`.
- Guarded `/ui/auth/me` route validates JWT with `JwtAuthGuard`.
- Build and tests pass.
- Static visual QA passed desktop and mobile landing screenshots and desktop admin/client screenshots.

## Failed Criteria

None.

## Deviations

- Admin section is JWT-protected at the data layer, but not role-restricted, because this repository has no admin RBAC claim contract or admin guard.
- Live local route smoke could not complete on the remote host because Prisma startup requires the Kubernetes database DNS name. Static compiled asset checks and route registration logs were used as substitute evidence.

## Recommendation

Accept source implementation. Do not deploy until owner gives deployment-readiness approval.

## Next Action

Review and deploy only after explicit owner approval.
