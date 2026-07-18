# VAL-GOAL-25: Catalog Manual Review Metadata Adoption for Bazos

```yaml
id: VAL-GOAL-25-bazos
status: passed
created: 2026-07-02
scope: read-only Catalog preview metadata surface
sensitive_data_classification: none
```

## Summary

Bazos consumes Catalog Goal 25 manual/stale/review metadata through the existing client catalog content-preview endpoint and surfaces it in the Catalog publish flow preview source area.

## Criteria Checked

| Criterion | Result | Evidence |
|---|---|---|
| Manual override signal visible | Pass | `services/bazos-service/src/ui/ui.assets.ts` renders `Manual override` when preview/profile/fields indicate manual overrides. |
| Canonical source changed signal visible | Pass | The UI renders `Source changed` when preview propagation status, stale flags, or stale manual fields indicate source drift. |
| Review required warning visible | Pass | The UI renders `Review required` and stale field names before publishing. |
| Publish behavior unchanged | Pass | No Bazos publish queue, policy, confirmation, identity, Orders, Warehouse, or Catalog mutation path changed. |

## Validation Evidence

- `git diff --check`: PASS.
- `LOGGING_SERVICE_URL=http://logging-microservice:3367 npm --prefix services/bazos-service run build`: PASS.


## Runtime Deploy Evidence

- `./scripts/deploy.sh`: PASS, built and pushed `localhost:5000/bazos-service:eb3543c`.
- `kubectl rollout status deployment/bazos-service -n statex-apps`: PASS through deploy script.
- `kubectl get deployment bazos-service -n statex-apps -o wide`: `1/1` on `localhost:5000/bazos-service:eb3543c`.
- `curl -i -sS -m 15 https://bazos.alfares.cz/health`: HTTP 200, `{"status":"ok","service":"bazos-service"}`.
- `curl -i -sS -m 15 https://bazos.alfares.cz/client`: HTTP 200, client SPA shell served.
- `curl -sS -m 15 https://bazos.alfares.cz/ui/app.js`: deployed script contains `Manual override`, `Source changed`, `Review required`, and `Catalog source changed` markers.

## Boundary Decision

This change is UI metadata-only. It does not disable confirm, enqueue publish work, bypass policy gates, call external Bazos endpoints, mutate Catalog, mutate Orders, mutate Warehouse, run migrations, or print secrets.
