# GOAL-07 Execution Plan - Immutable Deploy Image

```yaml
id: BAZOS-EP-07
status: approved
source_goal: implementation-goals/GOAL-07-immutable-deploy-image.md
owner: project owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
```

## Metadata

Goal 07 follows the Goal 06 deployment finding that mutable `latest` required manual immutable image pinning.

## Upstream Traceability

- `SYSTEM.md`: Kubernetes deployment model.
- `docs/IMPLEMENTATION_STATE.md`: records the Goal 06 deployment issue and follow-up.
- `docs/governance/PROJECT_INVARIANTS.md`: deployment requires explicit owner intent and validation.
- `docs/process/OPERATIONAL_GATES.md`: deployment-readiness and validation evidence requirements.

## Goal

Make `scripts/deploy.sh` deploy the immutable commit image selected by `IMAGE_TAG`.

## Goal Impact

Improves deployment repeatability. No Bazos compliance gates or product behavior change.

## Current State

The script builds and pushes `localhost:5000/bazos-service:<tag>` and `localhost:5000/bazos-service:latest`, applies `k8s/deployment.yaml`, then sets the deployment image to `latest`. Kubernetes can reuse a stale `latest` image.

## Project Invariants

All Bazos publishing invariants are preserved because the change is deployment tooling only.

## Sensitive-Data Handling

No secrets, cookies, verification codes, payment data, or raw sessions are read or logged. The deploy script continues to rely on Kubernetes secrets already configured in manifests.

## Contract Validation Plan

No API, schema, event, or Prisma contract changes. Validate shell syntax and static image-selection behavior.

## Replay/Determinism Plan

Deployment determinism improves because the image tag maps to the Git commit or explicit argument tag. No queue or publish replay behavior changes.

## Scope

- `scripts/deploy.sh`
- Goal and validation docs.
- `docs/IMPLEMENTATION_STATE.md`

## Non-Goals

- No production deployment in this goal unless separately requested.
- No runtime service behavior changes.
- No Kubernetes secret or ingress changes.

## Files To Inspect

- `scripts/deploy.sh`
- `k8s/deployment.yaml`
- `docs/IMPLEMENTATION_STATE.md`

## Files To Create

- `implementation-goals/GOAL-07-immutable-deploy-image.md`
- `implementation-goals/GOAL-07-execution-plan.md`
- `reports/validation/GOAL-07-pre-coding-readiness.md`
- `reports/validation/GOAL-07-validation-report.md`
- `reports/validation/GOAL-07-intent-compliance-report.md`

## Files To Modify

- `scripts/deploy.sh`
- `docs/IMPLEMENTATION_STATE.md`

## Files That Must Not Be Modified

- Bazos publisher policy, queue, identity, verification, catalog sell action, Prisma schema, Kubernetes secrets, and runtime controllers.

## Implementation Steps

1. Render deployment manifest with `$IMAGE` substituted for the container image.
2. Apply non-deployment manifests normally.
3. Apply the rendered deployment manifest.
4. Use `kubectl set image ... app="$IMAGE"` for rollout consistency.
5. Validate syntax and static behavior.

## Test Plan

- `bash -n scripts/deploy.sh`
- Static checks that no rollout step sets `app="$IMAGE_LATEST"`.
- `git diff --check`

## Validation Plan

Record commands and evidence in `reports/validation/GOAL-07-validation-report.md`.

## Gate Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && bash -n scripts/deploy.sh'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'
```

## Documentation Updates

Update implementation state and validation reports.

## Rollback Plan

Revert the commit to restore prior deployment behavior. Existing production deployment remains pinned to its current image until a future deployment changes it.

## Agent Handoff Prompt

Implement immutable-image deployment for Bazos by changing only deployment tooling and required reports.

## Completion Checklist

- [x] Required reading completed.
- [x] Goal impact recorded.
- [x] Scope matches selected goal.
- [x] Remote dirty state checked.
- [x] Bazos invariants checked.
- [x] Sensitive-data handling declared.
- [x] Contract impact declared.
- [x] Replay/determinism impact declared.
- [x] Pre-coding gate passed.
- [ ] Validation evidence recorded.
- [ ] Implementation state updated.
- [ ] Intent Compliance Report produced.
