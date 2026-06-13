# Bazos-Service Implementation State

```yaml
id: BAZOS-IMPLEMENTATION-STATE
status: approved
owner: project owner
created: 2026-06-12
last_updated: 2026-06-13
completeness_level: complete
```

## Current Status

- Active goal: none
- Active branch: `codex/bazos-goal-05-monitoring-reconciliation`
- Current wave: Wave 1 - Bazos Compliance Backend
- Completed goals: compliance-model recorded in `TASKS.md`; Goal 01 identity/session/compliance review completed; Goal 02 human verification flow completed; Goal 03 publisher queue/browser submitter completed; Goal 04 catalog sell button completed; Goal 05 monitoring/reconciliation completed and deployed to production on 2026-06-13; Goal 06 UI separation refinement deployed; Goal 07 immutable deploy image completed in source
- Running goals: none
- Blocked goals: none
- Remote repository: `alfares:/home/ssf/Documents/Github/bazos-service`
- Production URL: `https://bazos.alfares.cz`
- Intent preservation profile: `docs/process/INTENT_PRESERVATION_SYSTEM.md`
- Project invariants: `docs/governance/PROJECT_INVARIANTS.md`
- Process gates: `docs/process/OPERATIONAL_GATES.md`
- Commit policy: every coding goal must finish with committed changes or a recorded no-commit reason
- Pre-coding policy: coding is blocked until goal impact, execution plan, pre-coding readiness gate, validation path, and invariant/data/contract/replay declarations exist

## Goal Roadmap

| Goal | File | Status | Branch | Depends On |
|---|---|---|---|---|
| 01 | `implementation-goals/GOAL-01-bazos-identity-session-compliance.md` | completed | `codex/bazos-goal-01-identity-session-compliance` | current compliance model review |
| 02 | `implementation-goals/GOAL-02-human-verification-flow.md` | completed | `codex/bazos-goal-02-human-verification-flow` | 01 |
| 03 | `implementation-goals/GOAL-03-publisher-queue-browser-submitter.md` | completed | `codex/bazos-goal-03-publisher-queue` | 01, 02 |
| 04 | `implementation-goals/GOAL-04-catalog-sell-button.md` | completed | `codex/bazos-goal-04-catalog-sell-button` | 01, 03 |
| 05 | `implementation-goals/GOAL-05-monitoring-reconciliation.md` | completed | `codex/bazos-goal-05-monitoring-reconciliation` | 01, 03 |
| 07 | `implementation-goals/GOAL-07-immutable-deploy-image.md` | completed | `codex/bazos-goal-05-monitoring-reconciliation` | Goal 06 deployment evidence |

## State Update Rules

At the end of every implementation, validation, merge, or deployment session, update:

- active goal and branch;
- changed files;
- validation evidence;
- readiness gate evidence;
- blockers and owner decisions;
- commit SHA or no-commit reason;
- next recommended command.

Do not rely on chat history as the source of truth.

## Validation Evidence Log

Newest first:

```text
2026-06-13: Goal 07 immutable deploy image completed in source. Updated `scripts/deploy.sh` to render the deployment manifest with the selected immutable image tag and set the rollout image to `$IMAGE` instead of `$IMAGE_LATEST`; `latest` remains build/push compatibility only. Validation: `bash -n scripts/deploy.sh` pass; `git diff --check` pass; static no-latest-rollout check pass. No production deployment performed for this tooling-only implementation. Reports: implementation-goals/GOAL-07-immutable-deploy-image.md, implementation-goals/GOAL-07-execution-plan.md, reports/validation/GOAL-07-pre-coding-readiness.md, reports/validation/GOAL-07-validation-report.md, reports/validation/GOAL-07-intent-compliance-report.md. Commit SHA: pending.
2026-06-13: Goal 06 UI separation refinement deployed to production. Pushed branch `codex/bazos-goal-05-monitoring-reconciliation` through commit `ecac66c`; deploy script built and pushed image `localhost:5000/bazos-service:ecac66c` with digest `sha256:a75792885b49ad4dbe2ee04148a9f62fc6be9efe8137889510fc4f71e13bed93`. The script rollout against mutable `latest` timed out, then deployment was corrected by pinning Kubernetes to `localhost:5000/bazos-service:ecac66c`; pinned rollout completed. Final pod `bazos-service-6998f98c5c-v798d` 1/1 Running with 0 restarts. Production smoke passed for `/` pricing copy, `/admin`, `/client`, `/ui/app.css`, `/ui/auth/me` HTTP 401 without token, and `/health`. Report: reports/validation/GOAL-06-deployment-report.md. Follow-up: implement immutable-image deployment in `scripts/deploy.sh`.
2026-06-13: Goal 06 UI separation refinement completed in source on branch codex/bazos-goal-05-monitoring-reconciliation. Landing page now presents 49 Kc/month customer pricing; `/admin` and `/client` render separate dashboard shells without cross-dashboard admin/client navigation; client auth supports sign-in or registration via existing AuthService; added `POST /ui/auth/register`. Validation: `npm --prefix services/aukro-service run build` pass; `npm test` pass (5 suites, 79 tests); `git diff --check` pass; compiled asset smoke checks pass for pricing, separated navigation, client register tab, and register endpoint script path. Production deployment not performed. Reports: implementation-goals/GOAL-06-landing-admin-client-ui.md, reports/validation/GOAL-06-pre-coding-readiness.md, reports/validation/GOAL-06-validation-report.md, reports/validation/GOAL-06-intent-compliance-report.md. Commit SHA: recorded in final session response.
2026-06-13: Goal 06 production deployment completed on branch codex/bazos-goal-05-monitoring-reconciliation. Owner explicitly approved deployment. Initial deploy script completed but production smoke showed cached `latest` image content, so deployment was pinned to immutable image tags. Added follow-up commit `545b990` to make `/ui/auth/me` return clean HTTP 401 through AuthService token validation. Final deployment image: `localhost:5000/bazos-service:545b990`; final pod `bazos-service-5ffbc94797-hqbxn` 1/1 Running with 0 restarts. Production smoke passed: `/` HTTP 200 landing content, `/admin` HTTP 200 admin shell, `/client` HTTP 200 client shell, `/ui/app.css` HTTP 200, `/ui/auth/me` without token HTTP 401, `/health` HTTP 200. Report: reports/validation/GOAL-06-deployment-report.md. Follow-ups: avoid cached `latest` deploys with immutable tags or imagePullPolicy changes; add admin RBAC when Auth role claims are defined.
2026-06-13: Goal 06 landing/admin/client UI implemented on branch codex/bazos-goal-05-monitoring-reconciliation. Added public landing page, authenticated admin and client app shells, Auth microservice login bridge, guarded JWT `/ui/auth/me`, static CSS/JS UI assets, and AppModule wiring. Validation: npm --prefix services/aukro-service run build pass; npm test pass (5 suites, 79 tests); git diff --check pass; compiled asset checks pass; static Playwright visual QA pass for landing desktop/mobile and admin/client desktop with no horizontal overflow. Temporary service startup mapped the new routes, but live local route smoke could not complete outside Kubernetes because Prisma could not reach cluster DNS `db-server-postgres:5432`. Production deployment not performed. Reports: implementation-goals/GOAL-06-landing-admin-client-ui.md, reports/validation/GOAL-06-pre-coding-readiness.md, reports/validation/GOAL-06-validation-report.md, reports/validation/GOAL-06-intent-compliance-report.md. Commit SHA: recorded in final session response.
2026-06-13: Goal 05 production deployment completed on branch codex/bazos-goal-05-monitoring-reconciliation. Owner approved deployment after deployment-readiness review. Deployed commit 48c4e9e49b1f04c9bc4e9cf74bea907fd80aa922 using ./scripts/deploy.sh. Deployment evidence: preflight pass, image build/push pass, Kubernetes manifests applied, rollout completed, new pod bazos-service-fc879cc9c-ft7nk 1/1 Running with 0 restarts, deployment available 1/1, production health endpoint https://bazos.alfares.cz/health returned HTTP 200, startup logs showed database connection and successful Nest application startup. Report: reports/validation/GOAL-05-deployment-report.md. Blockers: none. Follow-up: triage npm audit findings in a separate dependency-hardening goal if required.
2026-06-12: Goal 05 monitoring/reconciliation completed on branch codex/bazos-goal-05-monitoring-reconciliation. Verified docs-rag JWT token from the Bazos pod with HTTP 200 before implementation. Added sanitized monitoring endpoints for summary metrics, blocked attempts, review identities, active-ad count reconciliation, and stale submission expiry; added safe policy-block logs; added smoke/redaction/reconciliation tests. Validation: targeted monitoring test pass (1 suite, 7 tests), npm test pass (5 suites, 79 tests), npm --prefix shared test pass (5 suites, 79 tests), npm --prefix shared run build pass, git diff --check pass. Reports: implementation-goals/GOAL-05-execution-plan.md, reports/validation/GOAL-05-pre-coding-readiness.md, reports/validation/GOAL-05-validation-report.md, reports/validation/GOAL-05-intent-compliance-report.md. Production deployment for Goal 05 source changes not performed. Commit SHA: 103e2bd.
2026-06-12: Goal 04 catalog sell button completed on branch codex/bazos-goal-04-catalog-sell-button. Added authenticated catalog sell action endpoints for draft prepare, explicit confirm, and status polling; reused active product/identity drafts; returned identity/category/policy context; required confirmation before queueing; delegated publish only to guarded publisher queue; surfaced policy and challenge states for human action. Validation: targeted catalog sell action test pass (1 suite, 6 tests), npm test pass (4 suites, 72 tests), npm --prefix shared test pass (4 suites, 72 tests), npm --prefix shared run build pass, git diff --check pass. Reports: implementation-goals/GOAL-04-execution-plan.md, reports/validation/GOAL-04-pre-coding-readiness.md, reports/validation/GOAL-04-validation-report.md, reports/validation/GOAL-04-intent-compliance-report.md. Production deployment not performed. Commit SHA: d09eba4. Unrelated dirty files observed and excluded from Goal 04: .env.example, k8s/external-secret.yaml.
2026-06-12: Goal 03 publisher queue/browser submitter completed on branch codex/bazos-goal-03-publisher-queue. Added guarded publisher queue DTOs/service/controller, draft-from-catalog endpoint, POST publish endpoints, idempotent enqueue, persisted randomized notBefore reservation, claim-time policy re-check, per-identity submission serialization, challenge stop-state recording, success metadata storage, and policy self-duplicate exclusion for the current draft. Validation: npm test pass (3 suites, 66 tests), npm --prefix shared test pass (3 suites, 66 tests), npm --prefix shared run build pass, git diff --check pass. Reports: implementation-goals/GOAL-03-execution-plan.md, reports/validation/GOAL-03-pre-coding-readiness.md, reports/validation/GOAL-03-validation-report.md, reports/validation/GOAL-03-intent-compliance-report.md. Production deployment not performed. Commit SHA: a9bd367.
2026-06-12: Goal 02 human verification flow completed on branch codex/bazos-goal-02-human-verification-flow. Added identity-scoped verification-session lifecycle endpoints, human confirmation plus encrypted session envelope requirement, raw secret field rejection, challenge/expiry stop states, and ownership check on manual challenge marking. Validation: npm test pass (2 suites, 56 tests), npm --prefix shared test pass (2 suites, 56 tests), npm --prefix shared run build pass, git diff --check pass. Reports: implementation-goals/GOAL-02-execution-plan.md, reports/validation/GOAL-02-pre-coding-readiness.md, reports/validation/GOAL-02-validation-report.md, reports/validation/GOAL-02-intent-compliance-report.md. Production deployment not performed. Commit SHA: 8dad663.
2026-06-12: Goal 01 identity/session/compliance completed on branch codex/bazos-goal-01-identity-session-compliance. Changed policy gates to fail closed for inactive sessions, missing/stale public duplicate evidence, likely public duplicates, missing/stale content-policy evidence, and content-policy failures. Expanded challenge handling to all documented stop states and removed raw phone number from identity creation logs. Validation: npm test pass (2 suites, 48 tests), npm --prefix shared test pass (2 suites, 48 tests), npm --prefix shared run build pass. Reports: implementation-goals/GOAL-01-execution-plan.md, reports/validation/GOAL-01-pre-coding-readiness.md, reports/validation/GOAL-01-validation-report.md, reports/validation/GOAL-01-intent-compliance-report.md. Production deployment not performed. Commit SHA: recorded in session response after commit creation.
2026-06-12: Added Bazos-service intent-preservation-system documentation profile, project invariants, gates, implementation goals, templates, and validation report. Validation: reports/validation/bazos-intent-preservation-system-doc-update.md. No product code or production deployment changed.
```

## Last Session Report

```text
Goal: GOAL-07 immutable deploy image
Goal Impact: Hardened deployment determinism by removing mutable `latest` from rollout selection without changing Bazos runtime behavior.
Branch: codex/bazos-goal-05-monitoring-reconciliation
Changed files: implementation-goals/GOAL-07-immutable-deploy-image.md; implementation-goals/GOAL-07-execution-plan.md; reports/validation/GOAL-07-pre-coding-readiness.md; reports/validation/GOAL-07-validation-report.md; reports/validation/GOAL-07-intent-compliance-report.md; scripts/deploy.sh; docs/IMPLEMENTATION_STATE.md.
Intent Compliance Report: reports/validation/GOAL-07-intent-compliance-report.md
Validation: bash -n pass; git diff --check pass; static no-latest-rollout check pass.
Readiness Gate Evidence: reports/validation/GOAL-07-pre-coding-readiness.md.
Blockers: none.
Commit or no-commit reason: commit pending.
Next command: Commit and push Goal 07.
```

## Required Session Report

Every implementation, merge, validation, or deployment session must finish with:

```text
Goal:
Goal Impact:
Branch:
Changed files:
Intent Compliance Report:
Validation:
Readiness Gate Evidence:
Blockers:
Commit or no-commit reason:
Next command:
```

## Next Action

Goal 07 immutable deploy image is complete in source and awaits commit.

```text
Commit and push Goal 07.
```

Source documents:

```text
AGENTS.md
BUSINESS.md
SPEC.md
SYSTEM.md
PLAN.md
TASKS.md
docs/BAZOS_COMPLIANCE.md
docs/process/INTENT_PRESERVATION_SYSTEM.md
docs/process/OPERATIONAL_GATES.md
implementation-goals/GOAL-05-monitoring-reconciliation.md
```
