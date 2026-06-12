# Business: bazos-service
>
> ⚠️ IMMUTABLE BY AI.

## Goal

Bazos.cz classifieds automation: create/update ads, manage multiple accounts, handle ad renewal/expiration.

## Constraints

- Bazos has no public posting API; all publishing must use compliant browser/form automation with verified sessions only.
- Every Bazos phone number used by this service must be explicitly registered, SMS verified, bank/micro-payment verified when Bazos requires it, and owned or authorized by the seller.
- The service must never bypass, automate around, outsource, or spoof SMS, bank verification, CAPTCHA, device verification, cookies, bans, rate limits, or any other Bazos control.
- Each user may manage several verified Bazos phone identities, but posting capacity is limited by the identity, category, duplicate, and account limits below. Multiple phone numbers must not be used to evade Bazos restrictions.
- Hard platform limit: no more than 50 active non-promoted Bazos ads per verified user identity.
- Local safety limit: at most 1 publish attempt per verified identity every 60-180 seconds, selected randomly per attempt. The interval must never be below 60 seconds.
- Category anti-spam limit: at most 1 ad per 24h per verified identity per Bazos category unless Bazos explicitly allows a stricter/manual exception.
- AI must never post duplicate ads. Check local records and public Bazos search before publishing.
- Ad content must comply with Bazos category rules, forbidden goods rules, language rules, image rules, and business seller disclosure requirements.
- Failed verification, blocked account, deleted ad, or suspected policy conflict must stop automation and require human review.

Detailed policy: [docs/BAZOS_COMPLIANCE.md](docs/BAZOS_COMPLIANCE.md)

## Consumers

flipflop-service.

## SLA

- Production: <https://bazos.alfares.cz>
- Events: subscribes to stock.updated
