# GOAL-06 Deployment Report

## Artifact Validated

Production deployment of Bazos landing, admin, and client UI.

## Deployment Scope

Deploy Goal 06 source changes to `https://bazos.alfares.cz` in Kubernetes namespace `statex-apps`.

## Owner Approval

Explicit owner approval received on 2026-06-13 in response: "Yes, I want it. Do it."

## Commands Run

- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && ./scripts/deploy.sh'`
- `ssh alfares 'kubectl set image deployment/bazos-service app=localhost:5000/bazos-service:ed28c56 -n statex-apps && kubectl rollout status deployment/bazos-service -n statex-apps --timeout=180s'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix services/bazos-service run build'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git commit -m "Fix Bazos UI auth status endpoint"'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && ./scripts/deploy.sh 545b990 && kubectl set image deployment/bazos-service app=localhost:5000/bazos-service:545b990 -n statex-apps && kubectl rollout status deployment/bazos-service -n statex-apps --timeout=180s'`

## Deployment Evidence

- Initial deploy script completed successfully and rolled out pod `bazos-service-5c4f8846cb-6rb6r`.
- Initial production smoke showed `/health` HTTP 200, but `/`, `/admin`, and `/ui/auth/me` returned 404 because the pod reused cached `latest` image content.
- Deployment was corrected by pinning the deployment image to immutable tag `localhost:5000/bazos-service:ed28c56`; pod logs then showed `UiController` route registration.
- A follow-up patch changed `/ui/auth/me` from shared `JwtAuthGuard` to `AuthService.validateToken()` plus service-local `UnauthorizedException`, because unauthenticated `/ui/auth/me` returned 500 instead of 401.
- Patch commit: `545b990 Fix Bazos UI auth status endpoint`.
- Final deploy built and pushed `localhost:5000/bazos-service:545b990`, then pinned the deployment image to that tag.
- Final pod: `bazos-service-5ffbc94797-hqbxn`, Ready `1/1`, Running, 0 restarts.
- Final deployment image: `localhost:5000/bazos-service:545b990`.

## Production Smoke Evidence

| URL | Result |
|---|---|
| `https://bazos.alfares.cz/` | HTTP 200 `text/html`, contains `Run Bazos offers from one compliant AlfaRes workspace` |
| `https://bazos.alfares.cz/admin` | HTTP 200 `text/html`, contains `Bazos Admin Console` |
| `https://bazos.alfares.cz/client` | HTTP 200 `text/html`, contains `Bazos Client Offers` |
| `https://bazos.alfares.cz/ui/app.css` | HTTP 200 `text/css`, contains `app-shell` |
| `https://bazos.alfares.cz/ui/auth/me` without token | HTTP 401, `No token provided` |
| `https://bazos.alfares.cz/health` | HTTP 200, `{"status":"ok","service":"bazos-service"}` |

## Log Evidence

Startup logs showed:

- `UiController {/}` route registration.
- `Prisma Client connected to database`.
- `Nest application successfully started`.

No production secrets, cookies, verification codes, passwords, payment details, or raw session payloads were printed in this report.

## Bazos Compliance Evidence

The deployment does not modify publishing policy, publisher queue behavior, verification handling, duplicate checks, active-ad caps, category cadence, or challenge stop behavior.

## Known Follow-Ups

- Update the deploy script or Kubernetes manifest to avoid cached `latest` image rollouts. Prefer immutable image tags or `imagePullPolicy: Always` for `latest`.
- Add admin RBAC once Auth microservice exposes a stable admin-role claim contract.

## Recommendation

Accept deployment.

## Next Action

No action needed.

## 2026-06-13 UI Separation Refinement Deployment

### Artifact Deployed

Goal 06 UI separation refinement, commit `ecac66c`.

### Deployment Scope

Deployed the public landing pricing update, separated `/admin` and `/client` dashboard shells, client sign-in/register UI, and `POST /ui/auth/register`.

### Commands Run

- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git push origin HEAD'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && ./scripts/deploy.sh'`
- `ssh alfares 'kubectl set image deployment/bazos-service app=localhost:5000/bazos-service:ecac66c -n statex-apps && kubectl rollout status deployment/bazos-service -n statex-apps --timeout=180s'`
- Production smoke checks for `/`, `/admin`, `/client`, `/ui/app.css`, `/ui/auth/me`, and `/health`.

### Deployment Evidence

- Git push completed: `b72a14b..ecac66c` to `origin/codex/bazos-goal-05-monitoring-reconciliation`.
- Deploy script preflight passed.
- Docker image built and pushed: `localhost:5000/bazos-service:ecac66c`, digest `sha256:a75792885b49ad4dbe2ee04148a9f62fc6be9efe8137889510fc4f71e13bed93`.
- Initial script rollout against `latest` timed out because Kubernetes reused/pulled the mutable tag path.
- Deployment was corrected by pinning the image to `localhost:5000/bazos-service:ecac66c`.
- Pinned rollout completed successfully.
- Final deployment image: `localhost:5000/bazos-service:ecac66c`.
- Final pod observed: `bazos-service-6998f98c5c-v798d`, 1/1 Running, 0 restarts.

### Smoke Evidence

- `/` returned landing HTML with `49 Kc`, `Simple customer pricing`, and `Client login`.
- `/admin` returned `Bazos Admin Console` and `Admin dashboard`.
- `/client` returned `Sign in or register`, `49 Kc/month`, and `Client dashboard`.
- `/ui/app.css` returned HTTP 200.
- `/ui/auth/me` without token returned HTTP 401.
- `/health` returned `{"status":"ok","service":"bazos-service"}`.
- Startup logs mapped `/ui/auth/register` and showed Prisma connection plus successful Nest startup.

### Compliance Evidence

The deployment changed UI/auth shell behavior only. No Bazos publisher policy, queue, browser submitter, verification handling, duplicate checks, pacing, category cadence, active-ad cap, content checks, or stop-on-challenge behavior was changed.

### Deviations

The deploy script still applies `latest`, which again required manual immutable image pinning. This should be fixed in the next implementation task.

### Recommendation

Accept deployment. Start the next task by making deployment use immutable image tags so manual `kubectl set image` is not needed.
