# Bazos Documentation Completeness Standard

```yaml
id: BAZOS-DOC-COMPLETENESS-STANDARD
status: approved
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Required Sections For Goal Files

- Purpose
- Intent Trace
- Goal Impact
- Scope
- Out Of Scope
- Acceptance Criteria
- Required Reading
- Pre-Coding Gate
- Execution Steps
- Validation
- Completion Report

## Required Sections For Execution Plans

- Metadata
- Upstream Traceability
- Goal
- Goal Impact
- Current State
- Project Invariants
- Sensitive-Data Handling
- Contract Validation Plan
- Replay/Determinism Plan
- Scope
- Non-Goals
- Files To Inspect
- Files To Create
- Files To Modify
- Files That Must Not Be Modified
- Implementation Steps
- Test Plan
- Validation Plan
- Gate Commands
- Documentation Updates
- Rollback Plan
- Agent Handoff Prompt
- Completion Checklist

## Required Sections For Validation Reports

- Artifact Validated
- Validation Scope
- Commands Run
- Gate Evidence
- Invariant Evidence
- Sensitive-Data Scan Evidence
- Contract Evidence
- Replay And Determinism Evidence
- Passed Criteria
- Failed Criteria
- Deviations
- Recommendation
- Next Action

## Missing Information Policy

Use exact markers:

```text
[MISSING: describe what is missing and who should provide it]
[UNKNOWN: describe what is unknown and how to discover it]
```

Any unresolved execution-critical marker blocks coding, deployment, and goal completion unless the owner approves a recorded exception.
