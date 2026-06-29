# Bazos Compliance Policy

This service must publish to Bazos.cz only in ways that respect Bazos rules and user verification requirements. These rules are product requirements, not implementation suggestions.

## Current Bazos Constraints

Observed on 2026-06-26:

- Bazos.cz does not provide a public API for general third-party ad publishing.
- Bazos terms say direct API integrations require Bazos.cz consent; the public help page only describes bulk automatic import for selected real-estate systems in Reality.Bazos.cz.
- Posting is performed through Bazos web forms on category subdomains.
- Before adding an ad, Bazos requires mobile phone verification by SMS.
- Bazos states that verified devices are stored in cookies for up to one year.
- Bazos states that the verified phone must be connected with a bank account by a 1 CZK micro-payment when required.
- Bazos publishes non-promoted ads for a limited period and states a maximum of 50 non-promoted ads per user.
- Bazos deletes duplicate ads and may delete ads that violate category/content rules.
- Bazos says it is not a product catalog and restricts repeated advertising of the same new goods.
- Bazos robots.txt disallows automated use of search/filter URLs and sensitive endpoints such as phone, mail, rating, report, recovery, and payment paths.

Because Bazos can change these rules, the implementation must be conservative. If a live Bazos page is stricter than this document, the live stricter rule wins and automation must stop until the policy is updated.

## Hard Service Rules

### Verification

- A Bazos identity may publish only after the seller manually completes Bazos verification for that phone/session.
- The service must not bypass SMS, bank/micro-payment, CAPTCHA, cookie/device verification, bans, or other Bazos controls.
- The service must not use third-party CAPTCHA solving or phone-number rental to create publishing capacity.
- If Bazos presents a challenge, verification prompt, blocked page, or unexpected anti-abuse page, the publisher must stop and mark the identity for human review.

### Multiple Phone Numbers

- A single AlfaRes user may register several Bazos phone identities.
- Each phone identity must be explicitly authorized and verified.
- Limits are enforced per identity and across the users known identities where duplicate or evasion risk exists.
- Multiple phones must not be used to repost duplicates, bypass bans, exceed category cadence, or avoid the 50 active-ad cap.

### Network Origin And Automation Boundary

- The backend must not send direct server-side posting requests to Bazos unless a separate owner-approved integration contract exists.
- The supported default flow is operator-browser handoff: the verified seller operates their own browser/session and the backend only prepares, gates, queues, audits, and records outcomes.
- The service must not use proxy rotation, fingerprint spoofing, device spoofing, user-agent spoofing, CAPTCHA solving, rented phone numbers, or any other anti-detection or evasion mechanism.
- Client-side handoff must not be used to hide server-origin automation; if a human challenge appears, the workflow stops and records a challenge state.

### Posting Pace

- The minimum delay between publish attempts for the same identity is 60 seconds.
- The maximum normal delay is 180 seconds.
- The delay must be randomly selected for each attempt in the inclusive range 60..180 seconds.
- The system must store the selected notBefore timestamp before a worker starts waiting, so restarts cannot accidentally publish early.
- Workers must serialize publish attempts per identity.

### Posting Volume

- The service must refuse to publish when a Bazos identity has 50 or more active non-promoted ads.
- The service must reconcile active ad counts with local state and Bazos-visible state when possible.
- Expired, deleted, or rejected ads must not be counted as active after reconciliation.

### Category Cadence

- The service must refuse to publish more than one ad per Bazos category per identity within 24 hours.
- Category cadence is based on the Bazos category that will receive the ad, not the internal catalog category.
- If category mapping is missing or ambiguous, publishing must require human review.

### Duplicate Prevention

- The service must check for an existing local active ad for the same product and identity.
- The service must search public Bazos listings for likely duplicates before submitting, but must not use Bazos-disallowed automated search/filter endpoints without a separate approved integration path.
- Duplicate detection should compare title, normalized product identifiers, seller phone/name, location, and image/product metadata where available.
- If a duplicate is likely, publishing must stop and request human review.

### Content Rules

- Ads must be in Czech or Slovak.
- Ads must describe one concrete item/offer, not a generic product catalog or company advertisement.
- Business sellers must include required business identity information when Bazos rules require it.
- Forbidden goods and forbidden categories must be blocked before submission.
- Images must be owned or authorized for use by the seller and must not contain prohibited logos, frames, excessive marks, or copied photos from other sellers.

## Backend Enforcement Requirements

UI warnings are not enough. The backend must enforce every rule because other services can call the API directly.

Required backend gates before publish:

1. identity.status == verified.
2. identity.reviewState == clear.
3. identity.verificationExpiresAt > now when known.
4. identity.activeAdCount < 50.
5. now >= identity.nextPublishNotBefore.
6. now - category.lastPublishedAt >= 24h.
7. No local active duplicate for product/identity.
8. Warehouse availability and route evidence exists for the linked Catalog product, and available stock is greater than zero.
9. No likely public Bazos duplicate.
10. Category mapping exists and is allowed.
11. Content policy validation passes.

The publish endpoint must return a policy failure response instead of attempting browser submission when any gate fails.
Warehouse is the stock authority. Bazos draft `stockQuantity` is display/cache state only and must not be used as sellable truth for queueing or publishing.

## Required Challenge States

Use explicit states so automation cannot silently continue:

- verification_required
- bank_verification_required
- captcha_or_human_check_required
- session_expired
- blocked_by_bazos
- duplicate_rejected
- content_policy_rejected
- category_review_required

Any of these states must pause publishing for the affected identity or draft until a human resolves it.

## Implementation Notes

- Store Bazos cookies/session data encrypted at rest.
- Do not log raw phone verification codes, cookies, passwords, or payment details.
- Log policy decisions, selected random delays, and challenge states.
- Public duplicate and content-policy evidence must come from manual review or a trusted backend validator; caller self-attestation is not sufficient.
- Keep publish attempts idempotent with a stable attempt ID.
- Prefer a queue with per-identity locking over synchronous HTTP publishing.
- Re-check policy gates immediately before browser submission, not only when the job is queued.

## References

- Bazos add-ad landing page: https://www.bazos.cz/pridat-inzerat.php
- Example category add-ad page: https://elektro.bazos.cz/pridat-inzerat.php
- Bazos terms: https://www.bazos.cz/podminky.php
