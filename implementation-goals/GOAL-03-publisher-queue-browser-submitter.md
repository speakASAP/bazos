# GOAL-03 Publisher Queue And Browser Submitter

## Purpose

Publish Bazos drafts only through policy-gated queue processing and compliant browser/form submission.

## Intent Trace

Source: `PLAN.md` Goal 3, `SPEC.md` Required Gates Before Publishing, and `docs/BAZOS_COMPLIANCE.md`.

## Goal Impact

This goal ensures publishing cannot occur unless all Bazos policy gates pass immediately before submission, attempts are serialized per identity, randomized pacing is respected, and challenge states stop automation.

## Scope

- Add local draft publishing queue if missing.
- Serialize attempts per identity.
- Store `notBefore` before waiting.
- Re-check policy gates before browser submission.
- Record Bazos ad ID and expiration after success.
- Stop on verification, CAPTCHA, duplicate, deletion, content, or policy challenge.

## Out Of Scope

- Verification bypass.
- Mass reposting.
- Catalog UI.
- Production deployment.

## Acceptance Criteria

- Publish below 60 seconds per identity is impossible.
- Active-ad cap and category cadence are enforced.
- Duplicate checks run before submit.
- Challenge states pause affected identity or draft.
- Idempotent attempt IDs prevent duplicate submission on retry.

## Required Reading

```text
AGENTS.md
SPEC.md
docs/BAZOS_COMPLIANCE.md
implementation-goals/GOAL-01-bazos-identity-session-compliance.md
implementation-goals/GOAL-02-human-verification-flow.md
```

## Pre-Coding Gate

Coding is blocked until queue idempotency, replay/determinism, policy gates, browser submit boundaries, and validation commands are documented.

## Execution Steps

1. Review prior goal reports.
2. Create execution plan and pre-coding gate report.
3. Implement queue/submitter changes.
4. Run unit and integration validation.
5. Update state and report.

## Validation

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Completion Report

Use the Intent Compliance Report shape in `implementation-goals/README.md`.
