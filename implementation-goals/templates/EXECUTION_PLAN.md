# Execution Plan

```yaml
id: BAZOS-EP-XX
status: draft | reviewed | approved | in-progress | implemented | validated | closed
source_goal: implementation-goals/GOAL-XX-name.md
owner: TBD
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
completeness_level: skeletal | partial | complete | validated
```

## Metadata

[MISSING: add owner, status, source goal, and lifecycle state]

## Upstream Traceability

[MISSING: link to BUSINESS.md, SPEC.md, docs/BAZOS_COMPLIANCE.md, project invariants, selected goal, and goal impact record]

## Goal

[MISSING: state the selected goal]

## Goal Impact

[MISSING: explain the Bazos compliance, product, or operations contribution]

## Current State

[MISSING: summarize remote state relevant to the goal]

## Project Invariants

[MISSING: list applicable Bazos invariants and how implementation will preserve them]

## Sensitive-Data Handling

[MISSING: state how prompts, tests, logs, reports, cookies, sessions, phone numbers, and credentials avoid secrets or raw production data]

## Contract Validation Plan

[MISSING: state API/schema/event/Prisma impact, validation command, and report evidence, or state not applicable]

## Replay/Determinism Plan

[MISSING: state queue idempotency, publish-attempt replay, pacing determinism, or state not applicable]

## Scope

[MISSING: define exact implementation scope]

## Non-Goals

[MISSING: define what must not be done]

## Files To Inspect

[MISSING: list files to read first]

## Files To Create

[MISSING: list new files expected or state none]

## Files To Modify

[MISSING: list existing files allowed to change]

## Files That Must Not Be Modified

[MISSING: list protected files]

## Implementation Steps

1. [MISSING: step]

## Test Plan

[MISSING: describe tests to add or run]

## Validation Plan

[MISSING: describe validation evidence]

## Gate Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Documentation Updates

[MISSING: list documentation files to update]

## Rollback Plan

[MISSING: describe how to revert safely]

## Agent Handoff Prompt

[MISSING: final prompt to coding agent]

## Completion Checklist

- [ ] Required reading completed.
- [ ] Goal impact recorded.
- [ ] Scope matches selected goal.
- [ ] Remote dirty state checked.
- [ ] Bazos invariants checked.
- [ ] Sensitive-data handling declared.
- [ ] Contract impact declared.
- [ ] Replay/determinism impact declared.
- [ ] Pre-coding gate passed or blocking exception recorded.
- [ ] Validation evidence recorded.
- [ ] Implementation state updated.
- [ ] Intent Compliance Report produced.
