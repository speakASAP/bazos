# Bazos-Service Implementation Goals

Use these goals to continue Bazos implementation under the intent-preservation-system workflow.

## Required Workflow For Every Coding Goal

1. Read `AGENTS.md` and the selected goal file.
2. Inspect remote state on AlphaRes.
3. Create or update a goal impact record.
4. Create or update an execution plan.
5. Run and record the pre-coding readiness gate.
6. Make only scoped changes.
7. Run tests and validation gates.
8. Produce an Intent Compliance Report.
9. Update `docs/IMPLEMENTATION_STATE.md`.
10. Commit changes or record why no commit was created.

## Goals

1. `GOAL-01-bazos-identity-session-compliance.md` - review and complete identity/session/compliance backend.
2. `GOAL-02-human-verification-flow.md` - implement human verification session flow without bypassing Bazos controls.
3. `GOAL-03-publisher-queue-browser-submitter.md` - implement guarded publisher queue and browser submitter.
4. `GOAL-04-catalog-sell-button.md` - integrate catalog sell action only through Bazos guardrails.
5. `GOAL-05-monitoring-reconciliation.md` - add operations, monitoring, reconciliation, and smoke evidence.
6. `GOAL-08-hosted-auth-ui.md` - migrate Bazoš UI login/register to hosted Alfares Auth.
7. `GOAL-11-admin-access-separation.md` - restrict `/admin` to administrator users and remove public admin links.
8. `GOAL-12-client-overview-statistics.md` - add complete Bazos statistics to `/client` overview.

## Required Final Report Shape

```markdown
## Intent Compliance Report

### Goal

### Goal Impact

### Implemented

### Not Implemented

### Bazos Compliance Check

### Validation Evidence

### Readiness Gate Evidence

### Risks

### Files Changed

### Commit Or No-Commit Reason

### Next Action
```
