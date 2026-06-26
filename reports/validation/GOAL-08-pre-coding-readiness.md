# GOAL-08 Pre-Coding Readiness

Date: 2026-06-26

## Goal

Migrate Basus `/client` login and registration to hosted Alfares Auth.

## Readiness Gate

- Vision: Basus participates in the centralized Alfares identity ecosystem.
- Goal Impact: remove Basus-local credential collection and preserve Auth-owned credential handling.
- System: Basus Nest UI plus Auth Microservice hosted UI contract.
- Feature: hosted login/register redirect and callback token handoff.
- Task: replace local form/proxy flow, add `/auth/callback`, retain `/ui/auth/me` token validation.
- Execution Plan: source-only UI/controller patch, build/test/static validation, then deploy only after readiness evidence.
- Coding Prompt: implement the user-requested Auth-centric login flow without touching Bazos publishing compliance logic.
- Code: pending at gate creation.
- Validation: planned build, tests, diff check, static auth scan, return URL validation.

## Declarations

- Secrets: no runtime secrets, database credentials, raw tokens, passwords, or user data are read or printed.
- Bazos compliance: no publisher policy, queue, identity verification, or automation bypass logic is changed.
- Auth contract: hosted redirect uses `client_id=bazos-service`, `return_url=https://bazos.alfares.cz/auth/callback`, and caller `state`; callback consumes fragment tokens and strips the fragment.
- Transitional debt: browser localStorage token persistence remains until a BFF/httpOnly cookie adapter is designed.

## Blockers

- `[UNKNOWN: live Auth allowlist state until /auth/validate-return-url is checked]`.
