# GOAL-10: Remove Legacy Publishing Stack

```yaml
id: GOAL-10-REMOVE-LEGACY-PUBLISHING
status: completed
owner: codex
created: 2026-06-26
completed: 2026-06-26
upstream:
  - docs/BAZOS_COMPLIANCE.md
  - implementation-goals/GOAL-09-bazos-compliance-hardening.md
downstream:
  - shared/bazos/*
```

## Vision

Keep one authoritative Bazos publishing implementation so compliance gates cannot diverge between legacy and modern routes.

## Goal Impact

The `services/bazos-service/src/channel/publishing/*` stack is removed from source. UI and modules now use the modern `shared/bazos` API surface under `/api/bazos/*`.

## System

Bazoš / bazos-service on `alfares:/home/ssf/Documents/Github/bazos-service`.

## Feature

Modern Bazos publishing, monitoring, identity, ad draft, queue, and catalog sell action APIs in `shared/bazos`.

## Task

- Remove `PublishingModule` from `ChannelModule`.
- Remove publishing service dependencies and legacy publish endpoints from `OffersController`.
- Remove `PublishingModule` from `OffersModule`.
- Route UI monitoring, policy check, publish, and ad-list calls to `/api/bazos/*`.
- Delete `services/bazos-service/src/channel/publishing`.

## Execution Plan

1. Repoint UI to modern shared Bazos endpoints.
2. Remove imports/providers/controllers for the legacy publishing module.
3. Delete the legacy source directory.
4. Validate there are no source references to the removed module.
5. Run tests/builds and deploy.

## Coding Prompt

Replace the legacy publishing stack with the modern shared Bazos implementation and ensure TypeScript build fails if any legacy dependency remains.

## Code

See `reports/validation/GOAL-10-validation-report.md`.

## Validation

See `reports/validation/GOAL-10-validation-report.md`.
