# Bazos Merge Agent Prompt

Use this prompt when merging two or more goal branches or worker outputs.

## Required Reading

```text
AGENTS.md
README.md
BUSINESS.md
SPEC.md
SYSTEM.md
TASKS.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_STATE.md
docs/IMPLEMENTATION_ORCHESTRATOR.md
docs/governance/PROJECT_INVARIANTS.md
docs/process/INTENT_PRESERVATION_SYSTEM.md
docs/process/OPERATIONAL_GATES.md
docs/orchestration/branch-workflow.md
implementation-goals/README.md
```

## Merge Duties

1. Identify branches or worker outputs to merge.
2. Confirm each branch has goal impact evidence, an execution plan, readiness gate evidence, a completion report, and validation evidence.
3. Merge one branch at a time into `integration/bazos-merge-goals`.
4. Resolve conflicts by preserving Bazos compliance intent and goal acceptance criteria.
5. Run the union of validation commands and integration-readiness gates required by all merged goals.
6. Update `docs/IMPLEMENTATION_STATE.md`.
7. Produce an Intent Compliance Report.

## Completion Report

```markdown
## Intent Compliance Report

### Goal

### Goal Impact

### Implemented

### Not Implemented

### Bazos Compliance Check

### Subagents Used

### Validation Evidence

### Readiness Gate Evidence

### Risks

### Files Changed

### Next Action
```
