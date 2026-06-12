# Spec: Compliant Bazos Publishing

## Intent

Allow catalog products to be prepared and published to Bazos.cz through bazos-service without bypassing Bazos controls or creating spam or duplicate behavior.

## Non-Negotiable Rules

- Bazos.cz has no public posting API. The service may only publish through ordinary browser/form flows using verified sessions.
- The service must never bypass or work around SMS verification, bank/micro-payment verification, CAPTCHA, device checks, cookies, blocked sessions, account bans, or Bazos rate controls.
- If Bazos asks for verification or blocks a session, automation must stop for that identity and require human review.
- Every Bazos phone identity must be manually registered and verified with Bazos before publishing.
- A user may have several verified phone identities, but they must not be used to evade category limits, duplicate detection, active-ad caps, deleted-ad state, or bans.
- The service must enforce a maximum of 50 active non-promoted ads per verified Bazos identity unless a future verified Bazos rule says otherwise.
- The service must enforce at most one publish attempt per verified identity every 60-180 seconds. The exact delay must be random per attempt and never below 60 seconds.
- The service must enforce at most one ad per 24 hours per verified identity per Bazos category unless a future verified Bazos rule is stricter.
- The service must check for duplicates locally and against public Bazos search before publishing.
- New goods, business seller content, images, forbidden goods, and category selection must comply with Bazos terms.

## Core Concepts

### Ecosystem User

The authenticated AlfaRes user who initiates publishing from catalog or Bazos service UI.

### Bazos Identity

A verified publishing identity consisting of owner user ID, phone number, seller display name, contact phone shown in ads, default ZIP/location, encrypted Bazos cookies/session state, verification status and expiry, blocked/review status, active ad count, last publish attempt timestamp, and per-category last publish timestamp.

### Bazos Draft

A local ad draft derived from a catalog product. Drafts can exist without being published.

### Publish Attempt

One queued attempt to submit a draft to Bazos. Attempts are serialized per identity and governed by pacing and policy gates.

## Required Gates Before Publishing

1. Identity is active, verified, not expired, not blocked, and not awaiting human review.
2. Identity has fewer than 50 active non-promoted ads tracked locally, reconciled with Bazos when possible.
3. No active local ad exists for the same product and identity.
4. Public duplicate search does not find a matching active Bazos ad for the same product/seller.
5. Category mapping is present and allowed.
6. Last publish attempt for the identity was at least a random 60-180 seconds ago.
7. Last publish in the same Bazos category for the identity was more than 24 hours ago.
8. Content policy validation passes.
9. Required images are available and owned or authorized.

## Required Behavior On Bazos Challenges

- SMS prompt: stop, mark identity verification_required, notify user.
- Bank/micro-payment prompt: stop, mark identity bank_verification_required, notify user.
- CAPTCHA or anti-bot challenge: stop, mark identity human_review_required, notify user.
- Login/session expiration: stop, mark identity session_expired, notify user.
- Deleted/duplicate/policy rejection: stop publishing this draft, record reason, notify user.
- Banned/blocked phone or identity: disable identity until manually reviewed.

## Out Of Scope For This Goal

- Circumventing any Bazos protection.
- Buying or renting phone numbers.
- CAPTCHA solving services.
- Mass reposting of the same goods.
- Automatically creating Bazos-verified identities without human participation.

## Acceptance Criteria

- Docs and UI make the Bazos limitations visible before any publish feature is enabled.
- Backend enforces the limits even if UI is bypassed.
- Publisher queue cannot submit below the 60-second minimum interval per identity.
- Publisher queue never exceeds 50 active ads per identity.
- Category gate prevents repeated same-category posting within 24 hours per identity.
- Challenge states stop automation and require human action.
