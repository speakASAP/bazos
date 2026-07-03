# GOAL-24 Bazos Bundle Publication Policy

## Purpose

Define the Bazos-owned channel policy for Catalog `catalog.bundle.v1` aggregates before any Bazos catalog sell action, draft mutation, queueing, or external listing publication can treat a Catalog bundle as one sellable Bazos offer.

## IPS Chain

Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation -> State Update

- Vision: Catalog bundles can be surfaced to channel tools only when marketplace ownership and compliance boundaries are explicit.
- Goal Impact: Catalog's broad blocker `[MISSING: channel-specific external marketplace bundle publication policies]` is narrowed for Bazos into a fail-closed channel decision.
- System: Catalog owns `catalog.bundle.v1` identity and metadata; Bazos owns Bazos identities, category/content/duplicate/pacing/challenge gates, drafts, queueing, and external listing state.
- Feature: Bazos Catalog bundle publication source policy.
- Task: block one-listing Bazos publication for Catalog bundle aggregates until an owner-approved Bazos bundle listing contract exists.
- Execution Plan: Bazos-owned docs, verifier, source policy, and focused tests only; no live Bazos publish/queue/confirmation, no Catalog/Orders/Warehouse/Payments/Allegro/Aukro/Kubernetes/secrets/deploy edits.
- Coding Prompt: fail closed if Catalog readiness identifies a bundle; do not infer a concrete Bazos item offer from component products or bundle metadata.
- Code: `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`, `shared/bazos/policy/publish-policy.service.ts`, `shared/bazos/policy/publish-policy.types.ts`, focused specs, and `scripts/verify-bazos-bundle-publication-policy.js`.
- Validation: focused shared Jest specs, static verifier, shared build, and `git diff --check`.
- State Update: Bazos one-listing external publication for `catalog.bundle.v1` remains blocked.

## Policy Decision

Bazos cannot publish a Catalog `catalog.bundle.v1` aggregate as one external Bazos listing under the current channel rules.

Reasoning:

- Bazos listings must describe one concrete item or offer and must pass Bazos category, duplicate, content, active-ad, verification, and pacing gates.
- Catalog `catalog.bundle.v1` is a standalone aggregate over existing products; it is not a Catalog product row, not a SKU, not Warehouse stock, and not a Bazos listing identity.
- Bazos has no approved channel contract that maps a Catalog bundle into a single compliant title, category, price, stock, duplicate check, content review, and post-sale responsibility model.
- Bazos must not infer a safe external offer from bundle components, order-affinity candidates, storefront copy, or checkout metadata.

## Runtime Rule

If Catalog readiness or a future Bazos caller identifies the source as `catalog.bundle.v1`, `bundle`, `catalog_bundle`, or provides `bundleId`, Bazos must fail closed before draft creation/update and before queue confirmation.

Canonical blocker:

```text
bazos_catalog_bundle_external_listing_blocked
```

Policy id:

```text
bazos.catalog_bundle_publication.v1
```

Publish-policy gate:

```text
catalog_bundle_publication_blocked
```

## Current Blockers

- `[MISSING: owner-approved Bazos bundle publication contract]`
- `[MISSING: Catalog integration reconciliation to replace the Bazos part of channel-specific external marketplace bundle publication policies with this evidence]`

## Future Unblock Requirements

Bazos one-listing bundle publication may be reconsidered only after an owner-approved Bazos-specific contract defines all of these facts:

1. Whether Bazos allows the proposed bundle listing form for the seller/account/category.
2. A Bazos category and content policy for one listing representing multiple component products.
3. Duplicate detection rules for bundle components and the aggregate listing.
4. Price, stock, and fulfillment authority across all component products.
5. Human review wording for title/description/media that does not misrepresent availability, price, shipping, or seller responsibility.
6. Queue/pacing behavior that still counts as one Bazos ad without bypassing per-category cadence or active-ad caps.
7. Post-sale order, Warehouse, Payments, and support responsibilities.

Until those facts exist, runtime publication remains blocked.

## Parallel Execution

| Workstream | Status | Owner role | Objective | Allowed files | Forbidden files | Validation | Handoff notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bazos bundle publication policy | ready now | Bazos channel policy worker | Document and enforce fail-closed Bazos policy for `catalog.bundle.v1` one-listing publication | Bazos docs, verifier, catalog sell-action/publish policy source/specs | Catalog, Orders, Warehouse, Payments, other marketplace repos, migrations, secrets, deploy scripts, live publish/queue/confirmation | focused shared Jest specs, verifier, shared build, `git diff --check` | This branch owns Bazos-only blocker semantics. |
| Catalog integration reconciliation | final integration | Catalog commerce integration owner | Replace broad Bazos part of channel-policy blocker with Bazos-specific fail-closed evidence | Catalog docs/status only | Bazos source, runtime marketplace mutation | Catalog docs diff/check after this branch is merged | Depends on Bazos branch commit. |
| Future Bazos bundle contract | blocked | Bazos product/compliance owner | Decide whether Bazos can ever publish a compliant multi-product bundle listing | New owner-approved policy and implementation plan | live publish, bypassing Bazos controls | new pre-coding gate and owner approval | Requires facts listed above. |

Integration owner: Catalog commerce integration owner for cross-repo blocker reconciliation.
Validation owner: this Bazos worker for Bazos source/docs validation.
Merge order: Bazos branch first, then Catalog status reconciliation, then any future implementation only after owner-approved Bazos bundle contract.
