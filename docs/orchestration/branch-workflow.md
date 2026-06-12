# Bazos Branch And Worktree Workflow

## Default Branches

Use `codex/` branches for goal work:

```text
codex/bazos-goal-01-identity-session-compliance
codex/bazos-goal-02-human-verification-flow
codex/bazos-goal-03-publisher-queue
codex/bazos-goal-04-catalog-sell-button
codex/bazos-goal-05-monitoring-reconciliation
```

Use this integration branch for parallel merges:

```text
integration/bazos-merge-goals
```

## Sequential Work

1. Start from `main`.
2. Create or switch to the goal branch.
3. Run `git status --short --branch`.
4. Update or create the goal impact record.
5. Update or create the execution plan.
6. Run the pre-coding readiness gate.
7. Make scoped changes.
8. Run validation and the relevant closure gate.
9. Update `docs/IMPLEMENTATION_STATE.md`.
10. Commit goal changes, or record why no commit was created.

## Remote Work

Remote repository:

```text
alfares:/home/ssf/Documents/Github/bazos-service
```

Before editing remote files:

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
```

## Commit Readiness

Do not commit coding changes until the branch has:

- goal impact evidence;
- execution plan;
- readiness gate report;
- validation report;
- Bazos Compliance Check;
- Intent Compliance Report;
- implementation state update;
- no unresolved execution-critical `[MISSING: ...]` or `[UNKNOWN: ...]` markers.

## Conflict Policy

When conflicts appear, preserve Bazos compliance intent first, then service contracts, then local file style, then the smallest implementation that satisfies the goal.
