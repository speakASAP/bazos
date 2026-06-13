# GOAL-07 Validation Report

## Artifact Validated

Immutable deploy image hardening.

## Validation Scope

Validated `scripts/deploy.sh` syntax and static image-selection behavior. No production deployment was run for this goal.

## Commands Run

- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && bash -n scripts/deploy.sh'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && rg "IMAGE_LATEST|kubectl set image|RENDERED_DEPLOYMENT|sed -E" -n scripts/deploy.sh'`
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && if rg "kubectl set image .*IMAGE_LATEST|app=\"\$IMAGE_LATEST\"" scripts/deploy.sh; then exit 1; else echo PASS no-latest-rollout; fi'`

## Gate Evidence

| Gate | Result | Evidence |
|---|---|---|
| Shell syntax | pass | `bash -n scripts/deploy.sh` completed. |
| Whitespace diff | pass | `git diff --check` completed with no output. |
| No latest rollout | pass | Static check returned `PASS no-latest-rollout`. |
| Immutable image rollout | pass | `kubectl set image` now uses `app="$IMAGE"`. |
| Rendered deployment image | pass | Deployment manifest is rendered with `image: ${IMAGE}` before apply. |

## Invariant Evidence

No Bazos publishing or compliance runtime code changed.

## Sensitive-Data Scan Evidence

No sensitive data handling introduced. The script does not print or read secrets beyond applying existing Kubernetes manifests.

## Contract Evidence

No API/schema/event/Prisma contracts changed.

## Replay And Determinism Evidence

Deployment image determinism improved by using the selected immutable image tag in the rendered deployment and rollout command. Bazos queue replay, publish pacing, and idempotency are not affected.

## Passed Criteria

- Deploy script no longer sets the running deployment image to `localhost:5000/bazos-service:latest`.
- The deployment manifest applied by the script is rendered with the selected immutable image.
- `latest` is still pushed as a compatibility tag but is not selected for rollout.
- Syntax and static validation passed.

## Failed Criteria

None.

## Deviations

No live deployment was run for this tooling-only implementation because production had already been deployed and smoke-checked immediately before this task.

## Recommendation

Accept and use this script for the next approved production deployment.
