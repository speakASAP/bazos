# Bazos-Service Project Invariants

```yaml
id: BAZOS-PROJECT-INVARIANTS
status: approved
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - BUSINESS.md
  - SPEC.md
  - docs/BAZOS_COMPLIANCE.md
downstream:
  - docs/process/INTENT_PRESERVATION_SYSTEM.md
  - implementation-goals/README.md
```

## Non-Negotiable Rules

1. Service name is `bazos-service`.
2. Bazos.cz has no public posting API; publishing may only use compliant browser/form flows with verified sessions.
3. The service must never bypass SMS, bank/micro-payment, CAPTCHA, device, cookie, session, ban, duplicate, rate, category, active-ad, or content controls.
4. If Bazos presents a challenge or block, automation stops for that identity or draft and requires human review.
5. Every Bazos phone identity must be manually authorized and verified.
6. Multiple phone identities must never be used to evade Bazos restrictions.
7. Enforce fewer than 50 active non-promoted ads per verified identity before publish.
8. Enforce randomized 60-180 second per-identity publish pacing, never below 60 seconds.
9. Enforce at most one ad per 24 hours per verified identity per Bazos category.
10. Check local and public Bazos duplicates before publish.
11. Store cookies/session state encrypted at rest and do not log raw secrets, cookies, passwords, verification codes, or payment details.
12. Production deployment requires explicit owner intent and deployment-readiness evidence.

## Acceptance Standard

A change is acceptable only when it preserves these invariants, satisfies the selected goal, includes validation evidence, and records readiness gate evidence.
