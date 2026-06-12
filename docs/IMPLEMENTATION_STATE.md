# Bazos-Service Implementation State

```yaml
id: BAZOS-IMPLEMENTATION-STATE
status: approved
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Current Status

- Active goal: none
- Active branch: `main`
- Current wave: Wave 0 - Intent Preservation Bootstrap
- Completed goals: compliance-model recorded in `TASKS.md`
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
| 01 | `implementation-goals/GOAL-01-bazos-identity-session-compliance.md` | ready | `codex/bazos-goal-01-identity-session-compliance` | current compliance model review |
| 02 | `implementation-goals/GOAL-02-human-verification-flow.md` | ready | `codex/bazos-goal-02-human-verification-flow` | 01 |
| 03 | `implementation-goals/GOAL-03-publisher-queue-browser-submitter.md` | ready | `codex/bazos-goal-03-publisher-queue` | 01, 02 |
| 04 | `implementation-goals/GOAL-04-catalog-sell-button.md` | ready | `codex/bazos-goal-04-catalog-sell-button` | 01, 03 |
| 05 | `implementation-goals/GOAL-05-monitoring-reconciliation.md` | ready | `codex/bazos-goal-05-monitoring-reconciliation` | 01, 03 |

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
2026-06-12: Added Bazos-service intent-preservation-system documentation profile, project invariants, gates, implementation goals, templates, and validation report. Validation: reports/validation/bazos-intent-preservation-system-doc-update.md. No product code or production deployment changed.
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

Review the already completed compliance model against the IPS gates before starting new product code:

```text
BAZOS ORCHESTRATOR: implement goal number 1
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
implementation-goals/GOAL-01-bazos-identity-session-compliance.md
```
