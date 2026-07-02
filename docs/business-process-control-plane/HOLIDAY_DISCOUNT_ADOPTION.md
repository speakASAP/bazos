# BPCP Holiday Discount Adoption

Status: service-local adoption contract
Date: 2026-07-02
Service: `bazos`
Central contract pack: `statex-ecosystem/docs/business-process-control-plane/`

## Role

Channel/storefront consumer for BPCP slots in Bazos-related sale/listing/customer flows if applicable.

## Responsibilities

- Render approved campaign messages only in supported UI surfaces.
- Keep listing protocol and compliance rules authoritative in Bazos service.

## Required interfaces

- Slot decision mapping for supported surfaces.
- Optional product badge or campaign message.

## Boundaries

- This service must not become the global owner of BPCP process definitions.
- This service must fail closed on invalid or unknown BPCP process versions.
- This service must keep existing domain ownership and invariants.
- This service must expose or document dry-run behavior before live execution.
- This service must not overwrite existing service contracts without an
  explicit integration owner and validation owner.

## Holiday Discount pilot expectations

- Recognize `holiday-discount-2026` only through versioned BPCP contracts.
- Preserve `processId`, `processVersion`, and `policyId` in every relevant
  decision, event, snapshot, log, or rendered experience.
- Support rollback by respecting BPCP pause and retired states.
- Keep process display and process execution separate where applicable.

## Blockers and unknowns

- [MISSING: whether Bazos channel exposes a relevant customer-facing holiday slot]

## Validation evidence required before implementation is accepted

- Unsupported slots fail closed.
- Bazos compliance docs remain authoritative.

## Parallel handoff

This adoption doc is safe for a focused service owner to implement in parallel
after the central BPCP schemas are accepted. The service owner must not edit
shared BPCP schemas directly; schema changes go through the BPCP integration
owner.
