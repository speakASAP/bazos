# GOAL-06 Pre-Coding Readiness

## Artifact Validated

Landing, admin, and client UI implementation plan for `bazos-service`.

## Validation Scope

Pre-coding gate for adding public and authenticated UI surfaces to the existing Bazos NestJS service.

## Commands Run

- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch && git log --oneline -5'`
- Required context read from `AGENTS.md` list.
- Auth and controller patterns inspected in `shared/auth/*`, `services/aukro-service/src/app.module.ts`, and existing Bazos controllers.

## Gate Evidence

| Check | Result | Evidence |
|---|---|---|
| Required context read | pass | All files listed in `AGENTS.md` were read before coding. |
| Remote state inspected | pass | Branch `codex/bazos-goal-05-monitoring-reconciliation` inspected. |
| Goal impact exists | pass | `implementation-goals/GOAL-06-landing-admin-client-ui.md`. |
| Execution scope explicit | pass | UI module, app module wiring, reports, and state only. |
| Bazos invariants mapped | pass | Goal does not alter publishing controls and preserves stop-on-challenge messaging. |
| Sensitive data handling declared | pass | UI stores only JWT in browser localStorage at user action; no cookies, verification codes, payment details, or sessions are logged. |
| Contract impact declared | pass | Adds UI routes and auth bridge; reuses existing guarded data endpoints. |
| Replay/determinism declared | pass | No queue, worker, pacing, or publish replay behavior changes. |
| Validation commands declared | pass | Build, tests, diff check, route smoke checks. |

## Invariant Evidence

The work is presentation and management UI only. It does not modify publisher queue, publish policy gates, identity verification, CAPTCHA handling, duplicate checks, active-ad caps, category cadence, or session encryption.

## Sensitive-Data Scan Evidence

No production secrets are required. UI must not display raw cookies, verification codes, payment details, passwords, or encrypted session payloads.

## Contract Evidence

New routes:

- `GET /`
- `GET /admin`
- `GET /client`
- `GET /ui/app.css`
- `GET /ui/app.js`
- `POST /ui/auth/login`
- `POST /ui/auth/register`
- `GET /ui/auth/me`

Existing guarded data endpoints are reused.

## Replay And Determinism Evidence

Not applicable to this goal. The UI does not claim, enqueue, submit, retry, or reconcile publish attempts automatically.

## Passed Criteria

- Pre-coding evidence exists.
- Scope is bounded.
- No Bazos compliance bypass is introduced by the plan.

## Failed Criteria

None.

## Deviations

Admin role authorization is limited to the existing JWT contract because this repository does not define admin RBAC claims or an admin guard.

## Recommendation

Proceed with scoped UI implementation.

## Next Action

Implement UI module and validation reports.
