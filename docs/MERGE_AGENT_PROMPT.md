# Bazos Merge Agent Prompt

Use this prompt when merging two or more goal branches or worker outputs.

## Required Reading

```text
AGENTS.md
README.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_STATE.md
docs/IMPLEMENTATION_ORCHESTRATOR.md
docs/governance/PROJECT_INVARIANTS.md
docs/process/OPERATIONAL_GATES.md
docs/orchestration/branch-workflow.md
implementation-goals/README.md
```

## Merge Duties

1. Identify branches or worker outputs to merge.
2. Confirm each branch has a completion report and validation evidence.
3. Merge one branch at a time into `integration/bazos-merge-goals`.
4. Resolve conflicts by preserving compliance intent and goal acceptance criteria.
5. Run the union of validation commands required by all merged goals.
6. Update `docs/IMPLEMENTATION_STATE.md`.
7. Produce an Intent Compliance Report.

## Completion Report

```markdown
## Intent Compliance Report

### Goal

### Implemented

### Not Implemented

### Boundary Check

### Subagents Used

### Validation Evidence

### Risks

### Files Changed

### Next Action
```
