# Bazos Branch And Worktree Workflow

## Default Branches

Use `codex/` branches for goal work:

```text
codex/bazos-goal-01-baseline-inventory
codex/bazos-goal-02-compliance-safety-gates
codex/bazos-goal-03-service-contracts
codex/bazos-goal-04-validation-deploy
```

Use this integration branch for merging parallel goal work:

```text
integration/bazos-merge-goals
```

## Sequential Work

1. Start from the current main branch.
2. Create or switch to the goal branch.
3. Run `git status --short --branch`.
4. Update or create the execution plan.
5. Make scoped changes.
6. Run validation.
7. Update `docs/IMPLEMENTATION_STATE.md`.
8. Commit goal changes, or record why no commit was created.

## Parallel Work

Parallel workers require:

- separate branches or worktrees;
- disjoint write ownership;
- a merge plan before changes start;
- validation evidence from each branch.

## Conflict Policy

When conflicts appear, preserve documented Bazos compliance first, then public service contracts, then local file style, then the smallest implementation that satisfies the goal.
