# Bazos-Service Intent Preservation System

```yaml
id: BAZOS-INTENT-PRESERVATION-SYSTEM
status: approved
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - AGENTS.md
  - BUSINESS.md
  - SPEC.md
  - docs/BAZOS_COMPLIANCE.md
  - /Users/Sergej.Stasok/Documents/Gitlab/intent-preservation-system/README.md
downstream:
  - docs/governance/PROJECT_INVARIANTS.md
  - docs/process/DOCUMENTATION_COMPLETENESS_STANDARD.md
  - docs/process/OPERATIONAL_GATES.md
  - implementation-goals/README.md
```

## Purpose

This document adapts the company intent-preservation-system approach to bazos-service without replacing the current service documentation.

Bazos work must preserve original intent from `BUSINESS.md`, `SPEC.md`, `SYSTEM.md`, `PLAN.md`, `TASKS.md`, and `docs/BAZOS_COMPLIANCE.md` through planning, implementation, validation, reporting, deployment, and commit decisions.

## Original Intent

Bazos-service automates compliant Bazos.cz classifieds operations for the AlfaRes ecosystem.

The original intent is compliance first: publishing must respect Bazos verification, pacing, duplicate, category, active-ad, content, and challenge controls. No implementation may bypass or weaken those controls.

Production deployment is never inferred from coding success. Deployment requires explicit scope, validation evidence, and owner intent.

## Preservation Chain

Every implementation must preserve this chain:

```text
Original Bazos Compliance Intent
-> Project Invariants
-> Goal Roadmap
-> Goal Impact Record
-> Execution Plan
-> Context Package
-> Coding Prompt
-> Code or Documentation Change
-> Validation Report
-> Readiness Gate Report
-> Intent Compliance Report
-> Implementation State Update
-> Commit or No-Commit Record
```

If any execution-critical link is missing, the task is blocked until the missing artifact is created or the owner approves a recorded exception.

## Required Artifacts By Work Type

| Work type | Required before work starts | Required before completion |
|---|---|---|
| Documentation-only process update | Goal or owner request, intent trace, changed-doc scope | Validation report or audit note, state update when orchestration behavior changes |
| Local or remote coding | Goal file, goal impact record, execution plan, pre-coding readiness gate, context package or coding prompt | Validation report, readiness gate result, Intent Compliance Report, state update, commit or no-commit record |
| Parallel worker task | Parent goal, disjoint write ownership, worker prompt, pre-coding gate evidence | Worker report, validation evidence, integration-readiness gate before merge |
| Merge or integration | Branch/worktree map, ownership map, prior validation reports | Integration-readiness report, merge report, combined validation evidence |
| Deployment | Completed goal reports, deployment-readiness gate, explicit owner approval | Deploy evidence, smoke evidence, production URL evidence, state update |

## Pre-Coding Requirements

Before coding, the orchestrator must confirm:

- selected goal is active or ready;
- upstream intent is linked to `BUSINESS.md`, `SPEC.md`, `docs/BAZOS_COMPLIANCE.md`, and `docs/governance/PROJECT_INVARIANTS.md`;
- a goal impact record exists or is embedded in the execution plan;
- execution plan uses `implementation-goals/templates/EXECUTION_PLAN.md`;
- allowed and forbidden file sets are explicit;
- validation commands and evidence paths are known;
- data, contract, and replay/determinism impact are declared, even when not applicable;
- unresolved `[MISSING: ...]` and `[UNKNOWN: ...]` markers do not affect execution-critical decisions;
- Bazos compliance impact is declared;
- remote state has been inspected when remote files will be changed.

## Gate Decisions

Operational gates use three decisions:

- `Accept`: the work may proceed to the next phase.
- `Accept with follow-up`: the work may proceed, but the follow-up is recorded in `docs/IMPLEMENTATION_STATE.md`.
- `Block`: the work must not proceed.

The default decision is `Block` when evidence is unavailable for execution-critical checks.

## Missing Information Policy

Use the exact markers:

```text
[MISSING: describe what is missing and who should provide it]
[UNKNOWN: describe what is unknown and how to discover it]
```

Agents may fill missing information only when it is derivable from approved upstream documents and the source path is cited. Agents must not invent product intent, deployment permission, compliance exceptions, credentials, or acceptance of invariant violations.

## Commit Policy

Before any coding commit, the committed diff must have:

- execution plan;
- pre-coding gate evidence;
- validation report;
- Intent Compliance Report;
- implementation state update;
- no unresolved execution-critical missing markers.

If no commit is created, the reason must be recorded in `docs/IMPLEMENTATION_STATE.md`.
