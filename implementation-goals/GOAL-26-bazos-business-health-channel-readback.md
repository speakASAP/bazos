# GOAL-26 Bazos Business Health Channel Readback

## Purpose

Add a Bazos service-owned, read-only/source-only business-health envelope for channel readback without claiming live provider proof.

## Intent Trace

Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation

- Vision: `BUSINESS.md` keeps Bazos compliance first.
- Goal Impact: Bazos can expose source-level channel readback evidence to orchestration without live calls or mutation.
- System: `SYSTEM.md` Bazos core service on port 3900.
- Feature: `bazos.channel_readback_business_health.v1` envelope.
- Task: add endpoint, module wiring, verifier, handoff, validation report, and state update.
- Execution Plan: this file and `docs/orchestrator/2026-07-06-bazos-business-health-handoff.md`.
- Coding Prompt: Codex prompt 2026-07-06 Bazos service-owned business-health channel readback envelope.
- Code: `services/bazos-service/src/business-health/*`, `services/bazos-service/src/app.module.ts`, `package.json`.
- Validation: verifier, service build, `git diff --check`.

## Goal Impact

The new endpoint lets coordination systems read Bazos source-owned readiness and blockers for `stock-order-marketplace-business-health.v1`. It intentionally returns `status: warn` and keeps live runtime pass blocked until an approved live Bazos readback packet, target listing/account, provider-backed order/status source, and reconciliation policy exist.

## Scope

- Create `GET /bazos/business-health/channel-readback`.
- Return contract `bazos.channel_readback_business_health.v1`.
- Preserve business process contract `stock-order-marketplace-business-health.v1`.
- Add a static verifier that checks required source snippets and forbidden live/runtime patterns.
- Add handoff and validation docs.
- Wire the Nest module and root package script.

## Out Of Scope

- No live Bazos/provider calls.
- No DB query or mutation.
- No marketplace mutation.
- No import, sync, or order ingestion.
- No Warehouse, Catalog, Orders, payments, suppliers, or provider service calls.
- No env, secret, Kubernetes, or deploy changes.
- no deploy.
- No BPCP repo edits.

## Pre-Coding Gate

- Required context read: `AGENTS.md`, `README.md`, `BUSINESS.md`, `SPEC.md`, `SYSTEM.md`, `PLAN.md`, `TASKS.md`, `docs/BAZOS_COMPLIANCE.md`, `docs/IMPLEMENTATION_STATE.md`, process docs, and implementation goal index.
- Remote state: `main...origin/main`, clean before edits at commit `64946ba`.
- Sensitive data: no secrets, tokens, customer payloads, provider payloads, or raw runtime data accessed.
- Contract impact: additive read-only endpoint and source-only envelope.
- Replay/determinism impact: none; endpoint generates timestamp only and does not replay, ingest, queue, publish, or mutate.
- Blockers preserved with `[MISSING: ...]` and `[UNKNOWN: ...]`.

## Execution Steps

1. Inspect Bazos route conventions and Aukro/Heureka/Allegro business-health analogs.
2. Add `BusinessHealthModule`, controller, service, and types under the Bazos core service source tree.
3. Wire `BusinessHealthModule` into `AppModule`.
4. Add `verify:business-health-bazos-channel-contract`.
5. Add handoff and validation artifacts.
6. Run verifier, service build, and `git diff --check`.
7. Commit and push `origin main`.

## Validation

- `npm run verify:business-health-bazos-channel-contract`
- `npm --prefix services/bazos-service run build`
- `git diff --check`

## Parallel Execution

| Workstream | Status | Owner | Scope | Forbidden | Validation | Handoff |
|---|---|---|---|---|---|---|
| Bazos business-health envelope | ready now | Bazos worker | Bazos endpoint/source/docs/verifier/package script/app wiring | BPCP, other repos, DB, providers, Warehouse, Catalog, Orders, env, secrets, deploy | verifier, service build, diff check | commit on `main` |
| BPCP consumption | dependency-gated | BPCP owner | consume Bazos envelope after commit | Bazos source edits by BPCP worker | BPCP verifier | requires this commit hash |
| Live readback runtime packet | blocked | Bazos/provider owner | approved target listing/account/provider packet | unapproved live calls or mutation | future live packet validation | blockers preserved |

Integration owner: this Bazos worker. Validation owner: this Bazos worker. Merge order: Bazos source commit first, then any downstream BPCP consumer.

## Completion Report

Completion evidence is recorded in `reports/validation/2026-07-06-bazos-business-health-channel-readback.md`.
