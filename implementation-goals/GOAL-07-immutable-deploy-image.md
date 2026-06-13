# GOAL-07 - Immutable Deploy Image

## Purpose

Make Bazos production deployment use immutable commit-tagged images by default so Kubernetes does not reuse stale `latest` images.

## Intent Trace

- `SYSTEM.md`: Bazos-service deploys to Kubernetes in namespace `statex-apps`.
- `docs/IMPLEMENTATION_STATE.md`: Goal 06 deployment required manual immutable image pinning after the script rollout against `latest` timed out.
- `docs/governance/PROJECT_INVARIANTS.md`: production deployment requires explicit owner intent and deployment-readiness evidence.

## Goal Impact

This goal improves deployment determinism and operational safety. It does not change Bazos publishing behavior, authentication behavior, data contracts, queue behavior, or compliance policy gates.

## Scope

- Update `scripts/deploy.sh` to apply the Kubernetes deployment with the immutable image built from the selected deploy tag.
- Keep pushing `latest` as a compatibility tag, but do not deploy it.
- Add validation and intent compliance evidence.
- Update implementation state.

## Out Of Scope

- No Bazos runtime feature changes.
- No Kubernetes namespace, secret, ingress, service, or database changes.
- No production deployment unless separately approved.

## Acceptance Criteria

- Deploy script no longer sets the running deployment image to `localhost:5000/bazos-service:latest`.
- The deployment manifest applied by the script uses `localhost:5000/bazos-service:<commit-or-argument-tag>`.
- Static validation confirms `kubectl set image` uses `$IMAGE`.
- Shell syntax validation passes.
- Documentation and state are updated.

## Required Reading

- `AGENTS.md`
- `SYSTEM.md`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/process/INTENT_PRESERVATION_SYSTEM.md`
- `docs/process/OPERATIONAL_GATES.md`
- `docs/governance/PROJECT_INVARIANTS.md`

## Pre-Coding Gate

See `reports/validation/GOAL-07-pre-coding-readiness.md`.

## Execution Steps

1. Inspect current deployment script and Kubernetes deployment manifest.
2. Render deployment manifest with immutable `$IMAGE` during deployment.
3. Ensure rollout uses `$IMAGE`, not `$IMAGE_LATEST`.
4. Run shell syntax and static deployment checks.
5. Record validation, intent compliance, and implementation state updates.

## Validation

- `bash -n scripts/deploy.sh`
- Static grep checks for `$IMAGE_LATEST` deployment usage.
- `git diff --check`

## Completion Report

See `reports/validation/GOAL-07-intent-compliance-report.md`.
