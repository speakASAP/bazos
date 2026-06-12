# GOAL-01 Execution Plan: Bazos Identity Session Compliance

```yaml
id: BAZOS-EP-01
status: approved
source_goal: implementation-goals/GOAL-01-bazos-identity-session-compliance.md
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Metadata

Goal 01 implementation plan for reviewing and completing identity/session/compliance backend foundations on remote branch `codex/bazos-goal-01-identity-session-compliance`.

## Upstream Traceability

- `BUSINESS.md`: compliant Bazos automation, no bypass of verification, CAPTCHA, rate limits, duplicate controls, active-ad caps, or content rules.
- `SPEC.md`: backend gates before publishing and stop-on-challenge behavior.
- `docs/BAZOS_COMPLIANCE.md`: ten required backend gates plus challenge states.
- `docs/governance/PROJECT_INVARIANTS.md`: Bazos invariants 2-12.
- `implementation-goals/GOAL-01-bazos-identity-session-compliance.md`: selected goal.
- Goal impact record: embedded in the selected goal and expanded below.

## Goal

Review and complete the compliant Bazos identity/session backend model and policy enforcement foundation.

## Goal Impact

This goal prevents publish flows from treating an identity as usable unless it is verified, in clear review state, backed by an active session, below active-ad limits, outside pacing/category cooldown windows, clear of local and public duplicate evidence, and backed by passing content-policy evidence.

## Current State

Remote repository inspected on 2026-06-12:

- Branch before work: `main`.
- Goal branch: `codex/bazos-goal-01-identity-session-compliance`.
- Dirty state before branch creation: clean.
- Existing implementation: `shared/bazos/identity/*`, `shared/bazos/policy/*`, `shared/bazos/ad/*`, and Prisma models for identities, category cadences, publish attempts, verification sessions, and ad challenge state.
- Gap found: policy service covered identity status, review state, verification expiry, active-ad cap, pacing, category cadence, local duplicate, and category mapping, but did not fail closed for active session state, public duplicate evidence, or content-policy evidence.

## Project Invariants

- Invariants 2-3: no public posting API and no bypass paths; this goal adds blocking gates only.
- Invariant 4: challenge states stop automation through non-clear `reviewState`.
- Invariant 5: only manually verified identities can pass status and session gates.
- Invariant 6: no multiple-identity evasion logic is added.
- Invariant 7: active-ad count remains capped at fewer than 50.
- Invariant 8: 60-180 second randomized pacing remains enforced by policy delay selection and persisted publish slots.
- Invariant 9: 24h per-identity per-Bazos-category cadence remains enforced.
- Invariant 10: local duplicate check remains enforced; public duplicate evidence becomes mandatory.
- Invariant 11: raw cookies, verification codes, passwords, payment details, and raw phone logs are not added.
- Invariant 12: no production deployment is part of this goal.

## Sensitive-Data Handling

No real secrets, cookies, payment details, verification codes, or production session data are used. Tests use synthetic IDs and dates. Identity creation logging omits the raw phone number. Reports reference file paths and gate names only.

## Contract Validation Plan

Policy service input contract changes by adding optional public duplicate and content-policy evidence fields and failing closed when evidence is absent. Root `npm test` is mapped to shared Jest tests so the documented validation command works. Prisma schema is inspected but not modified.

## Replay/Determinism Plan

Pacing remains deterministic after reservation because `reservePublishSlot` persists `notBefore` before worker sleep. The policy service only selects a random delay after all gates pass. Missing public/content evidence blocks instead of creating replay-sensitive side effects.

## Scope

- Complete missing policy gates for active session, public duplicate evidence, and content-policy evidence.
- Expand tests for the added gates and all challenge states.
- Remove raw phone number from identity creation logs.
- Add validation and readiness reports required by the IPS workflow.
- Add a root `npm test` script that runs shared tests.

## Non-Goals

- No browser submitter.
- No CAPTCHA, SMS, bank-verification, device, cookie, or session bypass.
- No production deployment.
- No catalog sell button.
- No public Bazos scraping implementation in this goal; evidence is required as input and implemented by later goals.

## Files To Inspect

- `AGENTS.md`
- `README.md`
- `BUSINESS.md`
- `SPEC.md`
- `SYSTEM.md`
- `PLAN.md`
- `TASKS.md`
- `docs/BAZOS_COMPLIANCE.md`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/governance/PROJECT_INVARIANTS.md`
- `docs/process/INTENT_PRESERVATION_SYSTEM.md`
- `docs/process/DOCUMENTATION_COMPLETENESS_STANDARD.md`
- `docs/process/OPERATIONAL_GATES.md`
- `docs/process/AGENT_GAP_FILLING_RULES.md`
- `implementation-goals/README.md`
- `implementation-goals/GOAL-01-bazos-identity-session-compliance.md`
- `prisma/schema.prisma`
- `shared/bazos/identity/*`
- `shared/bazos/policy/*`
- `shared/bazos/ad/*`
- `shared/package.json`
- `shared/jest.config.js`

## Files To Create

- `implementation-goals/GOAL-01-execution-plan.md`
- `reports/validation/GOAL-01-pre-coding-readiness.md`
- `reports/validation/GOAL-01-validation-report.md`
- `reports/validation/GOAL-01-intent-compliance-report.md`

## Files To Modify

- `package.json`
- `shared/bazos/identity/bazos-identity.service.ts`
- `shared/bazos/identity/bazos-identity.service.spec.ts`
- `shared/bazos/policy/publish-policy.types.ts`
- `shared/bazos/policy/publish-policy.service.ts`
- `shared/bazos/policy/publish-policy.service.spec.ts`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

## Files That Must Not Be Modified

- `BUSINESS.md`
- `SPEC.md`
- `docs/BAZOS_COMPLIANCE.md`
- `docs/governance/PROJECT_INVARIANTS.md`
- `.env*`
- `k8s/*`
- `scripts/deploy.sh`

## Implementation Steps

1. Create Goal 01 branch and confirm remote status.
2. Record execution plan and pre-coding readiness evidence.
3. Add missing policy gates and tests.
4. Run root and shared validation commands.
5. Record validation and Intent Compliance Report.
6. Update implementation state and task record.
7. Commit or record no-commit reason.

## Test Plan

Run:

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix shared test'
```

## Validation Plan

Validation report records command outcomes, invariant mapping, sensitive-data evidence, contract evidence, and replay/determinism evidence in `reports/validation/GOAL-01-validation-report.md`.

## Gate Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Documentation Updates

Update `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and Goal 01 validation reports only.

## Rollback Plan

Revert the Goal 01 commit or apply the inverse patch on the Goal 01 branch. No deployment or database migration is performed by this plan.

## Agent Handoff Prompt

Implement Goal 01 only. Preserve Bazos compliance gates, add missing fail-closed policy checks, run validation, update state, and do not deploy.

## Completion Checklist

- [x] Required reading completed.
- [x] Goal impact recorded.
- [x] Scope matches selected goal.
- [x] Remote dirty state checked.
- [x] Bazos invariants checked.
- [x] Sensitive-data handling declared.
- [x] Contract impact declared.
- [x] Replay/determinism impact declared.
- [x] Pre-coding gate passed or blocking exception recorded.
- [x] Validation evidence recorded.
- [x] Implementation state updated.
- [x] Intent Compliance Report produced.
