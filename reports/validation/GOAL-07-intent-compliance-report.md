# GOAL-07 Intent Compliance Report

## Goal

Make Bazos deployment use immutable image tags by default.

## Goal Impact

Improves operational determinism without changing product or publishing behavior.

## Implemented

- `scripts/deploy.sh` renders `k8s/deployment.yaml` into a temporary manifest with `image: ${IMAGE}`.
- Non-deployment manifests are applied normally.
- Deployment rollout now uses `kubectl set image ... app="$IMAGE"` instead of `app="$IMAGE_LATEST"`.
- Deployment annotations include the selected image tag and restart timestamp to force a rollout even when the same immutable image tag is redeployed.
- `latest` is still built and pushed for compatibility but is no longer the rollout target.

## Not Implemented

- No production deployment was run for this implementation.
- No Kubernetes secret, ingress, service, namespace, or runtime app behavior was changed.

## Bazos Compliance Check

Pass. This is deployment tooling only. Bazos verification, CAPTCHA, device, session, duplicate, pacing, category, active-ad, content, queue, and stop-on-challenge controls are untouched.

## Validation Evidence

- `bash -n scripts/deploy.sh`: pass.
- `git diff --check`: pass.
- Static no-latest-rollout check: pass.
- Static immutable image rollout check: pass.

## Readiness Gate Evidence

`reports/validation/GOAL-07-pre-coding-readiness.md`

## Risks

- The script still pushes `latest`; this is retained only as compatibility and should not be used by rollout.
- A future deployment should confirm the rendered manifest path behaves in a live deploy, though static checks cover the regression seen in Goal 06.

## Files Changed

- `implementation-goals/GOAL-07-immutable-deploy-image.md`
- `implementation-goals/GOAL-07-execution-plan.md`
- `reports/validation/GOAL-07-pre-coding-readiness.md`
- `reports/validation/GOAL-07-validation-report.md`
- `reports/validation/GOAL-07-intent-compliance-report.md`
- `scripts/deploy.sh`
- `docs/IMPLEMENTATION_STATE.md`

## Commit Or No-Commit Reason

Commit pending.

## Next Action

Commit and push Goal 07.
