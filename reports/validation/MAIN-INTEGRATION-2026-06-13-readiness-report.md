# Main Integration Readiness And Merge Report - 2026-06-13

## Artifact Validated

Integration of completed Bazos service branches into main.

## Branch And Worktree Map

- Source branch: codex/bazos-goal-05-monitoring-reconciliation at c58d8b7.
- Target branch: main at ad883ba before merge.
- Included local branches: codex/bazos-goal-01-identity-session-compliance, codex/bazos-goal-02-human-verification-flow, codex/bazos-goal-03-publisher-queue, codex/bazos-goal-04-catalog-sell-button, codex/bazos-goal-05-monitoring-reconciliation.
- Remote branches present: origin/main, origin/codex/bazos-goal-04-catalog-sell-button, origin/codex/bazos-goal-05-monitoring-reconciliation.
- Worktree state before merge: clean on main and up to date with origin/main.

## Ownership Map

- Goal 01: identity, session, policy compliance backend.
- Goal 02: human verification lifecycle and challenge states.
- Goal 03: guarded publisher queue and browser submitter boundary.
- Goal 04: catalog sell action API and policy-driven status surfaces.
- Goal 05: monitoring, reconciliation, safe metrics, and operational visibility.
- Goal 06: landing/admin/client UI separation on the same integration branch.
- Goal 07: immutable deploy image script hardening on the same integration branch.

## Prior Validation Reports

- reports/validation/GOAL-01-validation-report.md
- reports/validation/GOAL-02-validation-report.md
- reports/validation/GOAL-03-validation-report.md
- reports/validation/GOAL-04-validation-report.md
- reports/validation/GOAL-05-validation-report.md
- reports/validation/GOAL-06-validation-report.md
- reports/validation/GOAL-07-validation-report.md
- reports/validation/GOAL-05-deployment-report.md
- reports/validation/GOAL-06-deployment-report.md

## Gate Evidence

- Required context from AGENTS.md was read before branch orchestration.
- git status --short --branch showed a clean remote worktree before switching to main.
- git fetch origin --prune completed before merge.
- Each local goal branch was verified as an ancestor of codex/bazos-goal-05-monitoring-reconciliation.
- main..codex/bazos-goal-05-monitoring-reconciliation contained 20 commits; codex/bazos-goal-05-monitoring-reconciliation..main contained 0 commits.
- git merge --no-ff --no-commit codex/bazos-goal-05-monitoring-reconciliation completed without conflicts.

## Validation Commands

- npm test
- npm --prefix shared run build
- git diff --check main..codex/bazos-goal-05-monitoring-reconciliation

## Validation Results

- npm test: pass, 5 test suites and 79 tests.
- npm --prefix shared run build: pass.
- git diff --check main..codex/bazos-goal-05-monitoring-reconciliation: pass.

## Invariant Evidence

The merge carries previously completed compliance goals and their validation reports. No merge conflict required manual behavior changes. No Bazos verification, CAPTCHA, device, session, duplicate, rate, category, active-ad, content, or sensitive-data invariant was weakened by the integration step.

## Sensitive-Data Scan Evidence

The integration step did not inspect or expose secrets. Existing branch reports include redaction and safe logging evidence for publish policy, monitoring, and UI auth surfaces.

## Contract Evidence

The integrated branch includes API/controller/service changes validated by the shared Jest suite. No target-branch-only commits existed that required contract reconciliation.

## Replay And Determinism Evidence

Goal 07 hardens deployment determinism by pinning rollouts to immutable image tags. No queue pacing, idempotency, or publish scheduling logic was changed by the merge operation itself.

## Decision

Accept. The completed branch stack is linear, validated, and ready to commit to main as an explicit merge commit.

## Next Action

Commit the paused merge on main, push main, and record the resulting commit SHA in the final session response.
