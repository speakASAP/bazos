# Deployment Report: GOAL-05 Production Rollout

```yaml
id: BAZOS-DEPLOYMENT-2026-06-13
status: pass
artifact: GOAL-05 Monitoring And Reconciliation production deployment
created: 2026-06-13
validator: Codex
completeness_level: complete
```

## Artifact Deployed

Remote repository: `alfares:/home/ssf/Documents/Github/bazos-service`.
Branch: `codex/bazos-goal-05-monitoring-reconciliation`.
Commit deployed: `48c4e9e49b1f04c9bc4e9cf74bea907fd80aa922`.
Image tags pushed: `localhost:5000/bazos-service:48c4e9e` and `localhost:5000/bazos-service:latest`.
Production URL: `https://bazos.alfares.cz`.
Kubernetes namespace: `statex-apps`.

## Owner Approval

Owner approved production deployment in the Codex session on 2026-06-13 after deployment-readiness review.

## Commands Run

| Command | Result | Evidence |
|---|---|---|
| `npm test` | pass | 5 suites, 79 tests passed before deployment. |
| `npm --prefix shared test` | pass | 5 suites, 79 tests passed before deployment. |
| `npm --prefix shared run build` | pass | TypeScript build completed before deployment. |
| `git diff --check` | pass | No whitespace errors before deployment. |
| `./scripts/deploy.sh` | pass | Preflight, image build, push, manifest apply, rollout restart, rollout wait, and post-deploy status passed. Total deploy time: 70.14s. |
| `kubectl get deployment bazos-service -n statex-apps` | pass | Deployment available: 1/1. |
| `curl -I -H Cache-Control: no-cache https://bazos.alfares.cz/health` | pass | HTTP 200. |
| `kubectl logs -n statex-apps -l app=bazos-service --tail=80` | pass | New pod started, database connected, and Nest application started successfully. |

## Deployment Evidence

- Deploy preflight passed.
- Docker image built for commit `48c4e9e`.
- Image pushed to local registry with commit and latest tags.
- Kubernetes manifests applied.
- Deployment rollout completed successfully.
- New pod `bazos-service-fc879cc9c-ft7nk` was `1/1 Running` with 0 restarts immediately after rollout.
- Previous pod was terminating as expected after rollout.

## Smoke Evidence

- Public health endpoint `https://bazos.alfares.cz/health` returned HTTP 200 after deployment.
- Kubernetes deployment reported `READY 1/1`, `UP-TO-DATE 1`, and `AVAILABLE 1`.
- Startup logs showed Prisma database connection and successful Nest application startup.

## Bazos Compliance Check

Pass. Deployment used the approved Goal 05 commit and did not alter Bazos verification, CAPTCHA, bank/micro-payment, device, cookie, session, ban, duplicate, pacing, active-ad, category, or content controls. The deployed changes preserve monitoring-only behavior and do not add a bypass publishing path.

## Sensitive-Data Handling

No secrets, cookies, verification codes, passwords, payment details, raw phone numbers, or session envelopes were printed in this report. Deployment logs reviewed contained application startup and route registration messages only.

## Risks

- Docker build output reported existing npm audit findings: shared install reported 6 vulnerabilities and service install reported 10 vulnerabilities. These did not fail the existing deployment script, but should be triaged in a separate dependency-hardening goal.
- Production root `/` and `/api/accounts` returned HTTP 404 before deployment-readiness approval; `/health` is the configured probe path and returned HTTP 200 before and after deployment.

## Rollback Notes

Rollback path is the documented Kubernetes/image rollback path for this service: restore the prior image or revert the Goal 05 source commit and rerun `./scripts/deploy.sh`. The deploy script preflights Kubernetes health, applies manifests, restarts the deployment, and waits for rollout.

## Recommendation

Accept deployment as successful.

## Next Action

No immediate action required. Create a separate dependency-audit goal if npm audit findings need remediation.
