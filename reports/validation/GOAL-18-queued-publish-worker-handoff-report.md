# GOAL-18 Queued Publish Worker Handoff Report

## Intent Compliance Report

### Goal

Implement queued Bazoš publish handling so due attempts move from queue into a compliant operator-browser worker handoff instead of returning raw JSON or pretending that server-side automation can publish directly.

### Goal Impact

The change reduces stuck queued attempts while preserving Bazoš controls: the system waits for `notBefore`, re-checks policy at claim time, prepares a submission packet, and records success only when the operator provides a real Bazoš ID or listing URL.

### Implemented

- Added Goal 18 documentation and execution plan.
- Added an authenticated submission-packet endpoint for active attempts:
  - `GET /api/bazos/publish-queue/attempts/:id/submission`
- Kept queue claiming through the existing compliant claim path:
  - due attempts are claimed only by `claim-next`
  - claim-time policy checks still run
  - claimed attempts move to `submitting`
- Updated the client UI so publishing no longer exposes raw queue JSON.
- Added UI controls for:
  - due queued attempts: `Odeslat přes worker`
  - active submitting attempts: `Dokončit odeslání`
  - result recording by Bazoš ID or listing URL
  - challenge recording for SMS, bank verification, CAPTCHA/manual check, and account review
- Added a browser-side worker prompt that polls for due queued attempts and asks the signed-in user to complete the Bazoš-side submission in an already verified browser.
- Added a focused unit test proving submission packets can be fetched for active attempts without changing attempt status.

### Not Implemented

- No server-side Bazoš form submission.
- No CAPTCHA solving, SMS automation, bank-verification bypass, session/device spoofing, proxy rotation, scraping, or rate-limit evasion.
- No automatic success marking without a real Bazoš ID or listing URL.

### Bazoš Compliance Check

Pass. The implementation stops at operator-browser handoff and explicitly records Bazoš challenges instead of bypassing them. Bazoš-side authentication, SMS, bank checks, CAPTCHA, and final form submission remain in the user's verified browser.

### Validation Evidence

- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'`: pass, no output.
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix shared run build'`: pass.
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix services/aukro-service run build'`: pass.
- `ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test -- --runInBand shared/bazos/publisher/bazos-publisher-queue.service.spec.ts'`: pass, 10 tests.

### Runtime Validation Plan

After deploy:

1. Verify `/health`.
2. Verify `/ui/app.js` contains `Worker připravil ruční odeslání`, `Odeslat přes worker`, `Dokončit odeslání`, and `bazosIdFromInput`.
3. Open `https://bazos.alfares.cz/client`, claim the due queued attempt, complete the Bazoš-side form in the user's verified browser, then paste the real Bazoš ID or listing URL back into the handoff form.
4. Confirm the ad stores `bazosAdId` and exposes a Bazoš listing link.

### Risks

- A real Bazoš listing URL cannot be obtained without completing Bazoš-side controls in the user's browser. If Bazoš requests SMS, bank verification, CAPTCHA, or review, the correct result is a challenge state, not automated bypass.
- The current implementation relies on a signed-in browser worker prompt rather than a server-side bot, by design.

### Files Changed

- `implementation-goals/GOAL-18-queued-publish-worker-handoff.md`
- `implementation-goals/GOAL-18-execution-plan.md`
- `reports/validation/GOAL-18-queued-publish-worker-handoff-report.md`
- `shared/bazos/publisher/bazos-publisher-queue.controller.ts`
- `shared/bazos/publisher/bazos-publisher-queue.service.ts`
- `shared/bazos/publisher/bazos-publisher-queue.service.spec.ts`
- `services/aukro-service/src/ui/ui.assets.ts`

### Commit Or No-Commit Reason

Pending final full validation and deploy gate.

### Next Action

Run full validation, commit, deploy, then complete the live operator-browser handoff to obtain the real Bazoš listing URL.
