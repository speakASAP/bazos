# GOAL-02 Human Verification Flow

## Purpose

Allow users to connect verified Bazos phone identities while completing Bazos verification manually.

## Intent Trace

Source: `PLAN.md` Goal 2, `SPEC.md` Required Behavior On Bazos Challenges, and `docs/BAZOS_COMPLIANCE.md`.

## Goal Impact

This goal preserves Bazos verification requirements by allowing human-completed SMS and bank/micro-payment flows while preventing automation from bypassing verification, CAPTCHA, device checks, or blocked sessions.

## Scope

- Add or review identity setup endpoints.
- Support controlled browser/session setup where the user performs verification.
- Store only allowed session state securely.
- Detect expiry/challenges and move identity to manual review.

## Out Of Scope

- Automated SMS handling.
- CAPTCHA solving.
- Buying, renting, or generating phone identities.
- Production deployment.

## Acceptance Criteria

- Verification flow requires human action.
- Challenge states stop automation.
- Secrets and cookies are not logged.
- Tests or validation evidence prove blocked states cannot publish.

## Required Reading

```text
AGENTS.md
BUSINESS.md
SPEC.md
docs/BAZOS_COMPLIANCE.md
implementation-goals/GOAL-01-bazos-identity-session-compliance.md
```

## Pre-Coding Gate

Coding is blocked until the execution plan declares sensitive-data handling, allowed session fields, forbidden logs, and stop-on-challenge behavior.

## Execution Steps

1. Review Goal 01 results.
2. Create execution plan and pre-coding gate report.
3. Implement bounded flow changes.
4. Validate challenge handling and secret hygiene.
5. Update state and report.

## Validation

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
```

## Completion Report

Use the Intent Compliance Report shape in `implementation-goals/README.md`.
