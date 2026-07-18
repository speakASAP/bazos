# GOAL-09: Bazos Compliance Hardening

```yaml
id: GOAL-09-BAZOS-COMPLIANCE-HARDENING
status: completed
owner: codex
created: 2026-06-26
completed: 2026-06-26
upstream:
  - BUSINESS.md
  - SPEC.md
  - docs/BAZOS_COMPLIANCE.md
  - docs/governance/PROJECT_INVARIANTS.md
downstream:
  - shared/bazos/policy/publish-policy.service.ts
  - shared/bazos/publisher/bazos-publisher-queue.service.ts
  - services/bazos-service/src/channel/publishing/*
```

## Vision

Keep Bazos publishing useful for the owner while reducing the risk of policy conflicts, account blocks, duplicate spam, and accidental bypass paths.

## Goal Impact

The service now treats Bazos publishing as a gated operator-browser handoff by default. Backend routes prepare, queue, audit, and record outcomes, but they do not create a server-side posting path or stealth/evasion path.

## System

Bazoš / bazos-service remote repository on `alfares:/home/ssf/Documents/Github/bazos-service`.

## Feature

Compliance gates for Bazos identity/session state, public duplicate evidence, content policy evidence, category mapping, queue claiming, and challenge handling.

## Task

- Refresh Bazos compliance policy with current API/import/robots constraints.
- Require trusted/manual evidence for public duplicate and content-policy gates.
- Harden legacy `services/bazos-service/src/channel/publishing/*` so it cannot bypass shared policy semantics.
- Scope legacy publishing queue operations to the authenticated user.
- Treat all Bazos challenges as blocking states.
- Add explicit handoff metadata that forbids server-side Bazos requests, network-origin spoofing, proxy rotation, and device/fingerprint spoofing.

## Execution Plan

1. Update compliance documentation without adding a hard dependency on a written agreement for normal operator-browser handoff.
2. Fail closed when evidence is missing, stale, invalid, or caller self-attested.
3. Re-check policy at claim time before returning a submission packet.
4. Remove legacy ready-session and challenge-clear behavior.
5. Validate with shared tests, shared build, service build, static stale-marker scan, and `git diff --check`.

## Coding Prompt

Implement conservative Bazos publishing hardening while avoiding any code that helps evade Bazos anti-abuse systems or disguise automated requests as human traffic.

## Code

Changed files are listed in `reports/validation/GOAL-09-validation-report.md`.

## Validation

See `reports/validation/GOAL-09-validation-report.md`.
