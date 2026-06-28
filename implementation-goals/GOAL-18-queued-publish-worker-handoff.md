# GOAL-18 Queued Publish Worker Handoff

```yaml
id: GOAL-18-QUEUED-PUBLISH-WORKER-HANDOFF
status: draft
owner: codex
created: 2026-06-28
upstream:
  - BUSINESS.md
  - SPEC.md
  - docs/BAZOS_COMPLIANCE.md
  - docs/governance/PROJECT_INVARIANTS.md
  - implementation-goals/GOAL-03-publisher-queue-browser-submitter.md
  - implementation-goals/GOAL-09-bazos-compliance-hardening.md
downstream:
  - implementation-goals/GOAL-18-execution-plan.md
  - reports/validation/GOAL-18-queued-publish-worker-handoff-report.md
```

## Vision

Bazoš publishing should be reliable for queued drafts while preserving marketplace trust, account safety, and operator control.

## Goal Impact

Queued Bazoš attempts are processed only after their `notBefore` time by either a compliant worker or a human/operator browser handoff. Processing must never bypass SMS, CAPTCHA, session, device, rate, duplicate, content, or category controls. Successful completion must persist both the platform `bazosAdId` and the public listing URL.

## System

Bazoš / `bazos-service` remote repository on `alfares:/home/ssf/Documents/Github/bazos-service`.

## Feature

Queued publish attempt execution and completion recording for Bazoš listings.

## Task

- Inspect the existing queue, policy, identity/session, and browser-handoff paths.
- Define the claim-time guard so attempts are not processed before `notBefore`.
- Route every attempt through existing compliance checks before worker execution or operator handoff.
- Fail closed on SMS, CAPTCHA, session, device, rate, duplicate, content, category, or unknown challenge states.
- Record successful completion with `bazosAdId` and listing URL in the existing listing/attempt records.
- Produce validation evidence without using live credentials, raw sessions, SMS codes, CAPTCHA solving, proxy rotation, device spoofing, or policy bypass tooling.

## Execution Plan

Use `implementation-goals/GOAL-18-execution-plan.md`.

## Coding Prompt

Implement the smallest compliant queued-publish execution path that processes eligible attempts after `notBefore`, uses existing worker or operator-browser handoff boundaries, fails closed on all Bazoš controls, and records `bazosAdId` plus listing URL on success. Do not add bypass, evasion, scraping, proxy, CAPTCHA-solving, SMS-handling, or fake-device behavior.

## Code

[MISSING: implementation not started. This documentation-only goal creates the handoff and does not change shared code.]

## Validation

This planning pass is validated by `git diff --check` and the report at `reports/validation/GOAL-18-queued-publish-worker-handoff-report.md`.
