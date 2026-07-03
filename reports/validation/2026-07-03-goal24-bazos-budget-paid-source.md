# Goal 24 Bazos Budget Paid Multi-Product Source Evidence

Date: 2026-07-03

## Scope

Owner-requested runtime creation of a legitimate Bazos-owned paid multi-product replay source row for Goal 24 validation. This was a source-projection mutation only, not a Catalog publish, Orders create, Warehouse reservation, marketplace publication, or payment-provider operation.

## IPS Chain

Vision -> marketplace purchase history can improve product relation evidence without copying customer, payment, address, or raw marketplace ownership into Catalog.
Goal Impact -> Bazos now has non-empty live replay evidence for the protected paid multi-product replay source.
System -> Bazos owns local paid order projection and replay endpoint; Marketing owns dry-run aggregation and ledger evidence; Catalog owns relation persistence and activation policy.
Feature -> Bazos `marketplace.order_affinity_candidate.v1` paid multi-product replay evidence.
Task -> create a bounded budget paid source row and validate protected endpoint plus Marketing dry-run.
Execution Plan -> Bazos-owned runtime source row only, no raw payload output, no Catalog publish or replace-window, no Orders/Warehouse/Payments side effects.
Coding Prompt -> emit aggregate-only evidence and keep recurring activation blocked until owner activation policy is recorded.
Code -> no source code changes; docs/status/report only.
Validation -> runtime source projection check, protected endpoint aggregate probe, Marketing dry-run, `git diff --check`.

## Runtime Mutation

Created or updated one synthetic/internal Bazos replay source projection row with:

```text
status=completed
paymentStatus=paid
currency=CZK
total=2
itemCount=2
distinctProducts=2
forwarded=false
hasCentralOrderId=false
```

The row contains only bounded item snapshots with Catalog product IDs, optional SKU, quantity, unit price, total price, and currency.

## Aggregate Validation

Protected Bazos endpoint from the Marketing pod:

```text
httpStatus=200
success=true
sourceOwner=bazos-service
contract=marketplace.order_affinity_candidate.v1
channel=bazos
count=1
eventCount=1
eventTypes=[marketplace.order_affinity_candidate.v1]
eventVersions=[1]
skippedRecords=0
failClosed=false
blockers=[]
minItemCount=2
maxItemCount=2
```

Marketing dry-run:

```text
runId=goal24-bazos-budget-paid-source-20260703-001
mode=dry-run
inputRecords=1
acceptedCreatedEvents=1
rejectedRecords=0
skippedEvents=0
aggregatePairs=2
totalPairEvidence=2
byChannel.bazos=1
rejectionReasons={}
candidateCount=2
ledgerStatus=recorded
published=false
```

## Result

- `[RESOLVED: live Bazos paid multi-product order replay evidence]`
- `[MISSING: owner approval to activate recurring Bazos affinity publish after live dry-run evidence]`

## Boundary

No customer, address, payment-provider, token, cookie, raw marketplace payload, Bazos verification data, central Orders create, Warehouse reservation, Catalog publish, replace-window call, product relation mutation, deployment, or marketplace publication occurred.
