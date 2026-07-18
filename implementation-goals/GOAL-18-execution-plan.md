# GOAL-18 Execution Plan - Queued Publish Worker Handoff

```yaml
id: BAZOS-EP-18
status: implemented
source_goal: implementation-goals/GOAL-18-queued-publish-worker-handoff.md
owner: project owner
created: 2026-06-28
last_updated: 2026-06-28
completeness_level: implemented-awaiting-live-bazos-link
```

## Metadata

Implementation goal for queued Bazoš publish worker handoff. Current owner owns docs, backend submission endpoint, UI handoff, validation, deploy, and live publication follow-up.

## Upstream Traceability

- `BUSINESS.md`: Bazoš publishing must support legitimate listings without increasing account or policy risk.
- `SPEC.md`: publishing requires queue, policy, identity/session, pacing, and challenge gates.
- `docs/BAZOS_COMPLIANCE.md`: Bazoš controls must not be bypassed.
- `docs/governance/PROJECT_INVARIANTS.md`: marketplace and user-safety invariants remain mandatory.
- `implementation-goals/GOAL-03-publisher-queue-browser-submitter.md`: earlier queue/browser-submitter intent.
- `implementation-goals/GOAL-09-bazos-compliance-hardening.md`: current compliance hardening baseline.

## Goal

Process queued Bazoš publish attempts after `notBefore` through a compliant worker or human/operator browser handoff, and record `bazosAdId` plus listing URL after success.

## Goal Impact

Reduces stuck queued attempts while preserving Bazoš anti-abuse controls, operator accountability, pacing, and auditability.

## Current State

[UNKNOWN: exact current queue implementation state in shared code; this session was scoped to documentation only.] Existing goal history shows prior queue and compliance work under Goal 03 and Goal 09.

## Project Invariants

- Never bypass SMS, CAPTCHA, session, device, rate, duplicate, category, or content controls.
- Never spoof network origin, rotate proxies, fake browser/device identity, solve CAPTCHA automatically, or handle SMS codes outside authorized operator flow.
- Re-check compliance at claim time, not only at enqueue time.
- Do not process attempts before `notBefore`.
- Serialize or otherwise guard attempts per identity/account to preserve pacing and session safety.
- Persist success evidence with `bazosAdId`, listing URL, attempt ID, timestamp, and completion actor.

## Sensitive-Data Handling

Implementation and validation must not log raw cookies, sessions, phone numbers, SMS codes, CAPTCHA payloads, private listing drafts, or credentials. Test data must be synthetic or sanitized.

## Contract Validation Plan

Before coding, inspect existing queue attempt models, API DTOs, event payloads, and listing/ad persistence. If a storage contract lacks `bazosAdId` or listing URL fields, add the smallest migration or existing-field mapping with explicit tests. Mark any live Bazoš contract facts as `[UNKNOWN: ...]` unless verified.

## Replay/Determinism Plan

Use idempotent attempt claiming. A retry must not submit the same listing twice after a success record exists. `notBefore` and claim timestamps must be deterministic in tests. Replay tests must cover already-completed, blocked, not-yet-due, challenge, and successful attempt states.

## Scope

- Queue polling or claiming for due attempts.
- Claim-time compliance re-checks.
- Worker-to-operator handoff boundary.
- Completion recording with `bazosAdId` and listing URL.
- Focused tests and validation reports.

## Non-Goals

- Keep shared-code changes limited to the Bazoš publish queue, UI handoff, and focused tests.
- No CAPTCHA solving, SMS automation, session/device spoofing, proxy rotation, mass posting, scraping, or rate-limit evasion.
- No unrelated UI redesign, Catalog, Orders, Auth, or Kubernetes changes.

## Files To Inspect

- `shared/bazos/policy/*`
- `shared/bazos/publisher/*`
- `services/bazos-service/src/channel/publishing/*`
- `services/bazos-service/src/ui/*`
- `prisma/schema.prisma`
- existing `GOAL-03`, `GOAL-09`, and validation reports

## Files To Create

- Focused tests for due/not-due/blocked/success attempt behavior.
- Validation report for implementation evidence.

## Files To Modify

[UNKNOWN: depends on inspection.] Expected areas are existing Bazoš queue, policy, publisher, persistence, and test files only.

## Files That Must Not Be Modified

- Unrelated Catalog, Orders, Auth, deployment, Kubernetes, and UI files unless inspection proves they are directly required.
- Any code or docs outside the future implementation scope.

## Implementation Steps

1. Read the required goals, compliance docs, current queue/policy code, and current validation reports.
2. Record current queue state and missing facts in the pre-coding readiness report.
3. Add or tighten due-attempt claiming so `now >= notBefore` is required.
4. Re-run policy and identity/session checks immediately before worker execution or handoff packet creation.
5. Convert challenge/control failures into blocked or operator-required states without submission.
6. On verified success, persist `bazosAdId`, listing URL, completion timestamp, attempt ID, and actor/source.
7. Add tests for due/not-due, blocked controls, retry after success, and successful completion recording.
8. Run validation and write the Intent Compliance Report.

## Test Plan

- Unit tests for claim-time `notBefore` gating.
- Unit or integration tests for compliance failure states.
- Tests proving completed attempts are idempotent and do not resubmit.
- Tests proving success writes `bazosAdId` and listing URL.
- Static scan for forbidden bypass behavior if a suitable repo command exists.

## Validation Plan

Run focused tests first, then broader build/test commands appropriate to touched modules, and always run `git diff --check`.

## Gate Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Documentation Updates

- `implementation-goals/GOAL-18-queued-publish-worker-handoff.md`
- `implementation-goals/GOAL-18-execution-plan.md`
- future implementation validation report under `reports/validation/`

## Rollback Plan

Revert the implementation commit. For this documentation-only pass, remove the new Goal 18 files and validation report if the goal is superseded.

## Parallel Execution

No safe parallel implementation is ready until the current queue and persistence contracts are inspected.

- Workstream A: `ready now` - queue/policy inspection and pre-coding readiness report. Owner: implementation agent. Allowed files: reports and notes only. Validation: remote state and findings.
- Workstream B: `dependency-gated` - code implementation. Depends on Workstream A identifying exact queue and persistence files. Integration owner: implementation agent.
- Workstream C: `final integration` - validation and Intent Compliance Report. Validation owner: separate reviewer or orchestrator. Merge order: A, then B, then C.

## Agent Handoff Prompt

Remote-only Alfares task in `/home/ssf/Documents/Github/bazos-service`. Implement GOAL-18 so queued Bazoš publish attempts are claimed only after `notBefore`, re-check Bazoš compliance before worker execution or operator-browser handoff, fail closed on SMS/CAPTCHA/session/device/rate/duplicate/category/content controls, never add bypass/evasion behavior, and record `bazosAdId` plus listing URL on success. Preserve the chain Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation. Do not touch unrelated shared contracts. Run focused tests, broader relevant tests, and `git diff --check`; write an Intent Compliance Report.

## Completion Checklist

- [x] Required reading for documentation scope completed.
- [x] Goal impact recorded.
- [x] Scope matches selected goal.
- [x] Remote dirty state checked before edits.
- [x] Bazoš invariants declared.
- [x] Sensitive-data handling declared.
- [x] Contract impact declared.
- [x] Replay/determinism impact declared.
- [x] Pre-coding gate passed for implementation.
- [x] Implementation validation evidence recorded.
- [x] Intent Compliance Report produced after implementation.
- [ ] Live Bazoš listing URL recorded after user-browser submission.
