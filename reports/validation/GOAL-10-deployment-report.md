# GOAL-10 Deployment Report

```yaml
id: GOAL-10-DEPLOYMENT
status: passed
date: 2026-06-26
repo: /home/ssf/Documents/Github/bazos-service
branch: main
production_url: https://bazos.alfares.cz
```

## Goal

Remove the legacy Aukro publishing implementation from the service and make modern `shared/bazos` APIs the active publishing surface.

## Source Deployment

- Deployed commit: `f7a60e6` (`Remove legacy Aukro publishing stack`).
- Image: `localhost:5000/bazos-service:f7a60e6`.
- Image digest: `sha256:9d5f833c5c72b6dd7524b19a8ae272aabc3ac92ec9c432cc7b49e1b3b8dcef53`.
- Runtime pod after rollout: `bazos-service-66f7859c6f-7ph6p`, `1/1 Running`, `0` restarts.
- Final deployment image after follow-up: `localhost:5000/bazos-service:dbef1a9`.
- Final image digest: `sha256:6dd8d543bbe3d7cc38a212376af7551fc64be1e918ea0b3b04a419dc7f724350`.
- Final runtime pod: `bazos-service-6f6d654948-qndtd`, `1/1 Running`, `0` restarts.

## Production Smoke

```text
200 /health
200 /
200 /client
200 /ui/app.js
404 /publishing/limits
404 /publisher-queue
404 /verification-sessions
404 /publishing-monitoring/summary
```

The legacy public publishing routes are no longer exposed in production. UI calls were moved to modern `/api/bazos/*` endpoints in source.

## Follow-up Auth Guard Fix

During the first production smoke, unauthenticated modern API routes returned `500` instead of `401` because the shared `JwtAuthGuard` exception crossed a package boundary incorrectly:

```text
500 /api/bazos/ads
500 /api/bazos/monitoring/summary
```

Follow-up commit `67097bf` (`Return 401 from shared auth guard`) was implemented, validated, pushed, and built as `localhost:5000/bazos-service:67097bf` with digest `sha256:6dd8d543bbe3d7cc38a212376af7551fc64be1e918ea0b3b04a419dc7f724350`.

Validation for `67097bf`:

- `git diff --check`: pass.
- `npm test`: pass, 5 suites, 82 tests.
- `npm --prefix shared run build`: pass.
- `npm --prefix services/aukro-service run build`: pass.

The first `67097bf` rollout was not completed because Kubernetes pod creation became blocked before container startup:

- `bazos-service-5c86656c8c-*`: `ContainerCreating`, no pod IP, `PodReadyToStartContainers=False`.
- Other unrelated pods on the same node were also stuck in `ContainerCreating` (`domain-research-migrate-*`, `warehouse-reservation-expiry-*`), so the evidence points to node/runtime pod sandbox creation, not the Bazoš application image.
- Node conditions reported `Ready=True`, `MemoryPressure=False`, `DiskPressure=False`, `PIDPressure=False`; the image was present in the local registry.

To keep production stable during the temporary runtime issue, the Kubernetes deployment was rolled back to the last ready image `f7a60e6`. After pod creation recovered, current `main` commit `dbef1a9` was deployed successfully and includes the auth guard fix.

Final production smoke:

```text
200 /health
200 /
200 /client
200 /ui/app.js
404 /publishing/limits
404 /publisher-queue
404 /verification-sessions
404 /publishing-monitoring/summary
401 /api/bazos/ads
401 /api/bazos/monitoring/summary
```

## Residual Risk

- `[UNKNOWN: Whether any external client still calls removed legacy routes directly.]`
- Modern protected API unauthenticated responses now return `401` in production after the successful `dbef1a9` rollout.

## Next Command

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch && kubectl get deploy,pods -n statex-apps -l app=bazos-service -o wide'
```
