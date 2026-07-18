# GOAL-12 Client Overview Bazos Statistics Report

## Intent Compliance Report

### Goal

Add complete Bazos account/ad statistics to the signed-in `/client` `Přehled` view.

### Goal Impact

The customer can now see whether they are signed in, whether Bazos identities are ready, how many active-ad slots remain under the 50-active-ad verified-identity cap, how many ads were created and published this month, and direct links to their Bazos ads when a platform ad ID is known.

### Implemented

- Added overview stat cards for Alfares login, verified/ready Bazos identities, remaining capacity, current-month created/published counts, total/published count, active count, risk count, and queued count.
- Added identity readiness table with phone verification state and per-identity remaining capacity.
- Added recent user ads table in `Přehled`.
- Added Bazos public links for ads with `bazosAdId`; ads without a Bazos ID link back to `Moje inzeráty`.
- Added links in the `Moje inzeráty` table.
- Kept raw phone numbers out of the overview statistics.

### Not Implemented

- No new backend endpoint; existing user-scoped endpoints already provide the required data.
- No live production user data was read or changed.
- No publish policy, queue, browser automation, identity verification, or Auth behavior was changed.

### Bazos Compliance Check

Pass by scope. The change is read-only UI aggregation over existing guarded data. It does not bypass or weaken Bazos verification, session, active-ad cap, duplicate, category cadence, content, or challenge controls. The displayed capacity uses the existing 50 active non-promoted ads per verified identity rule.

### Validation Evidence

- `npm --prefix services/bazos-service run build`: pass.
- `npm --prefix shared run build`: pass.
- `npm test`: pass, 5 suites and 83 tests.
- `git diff --check`: pass.
- Deploy: pass, `./scripts/deploy.sh` built and deployed image `localhost:5000/bazos-service:0cabc0c`, digest `sha256:53562aa9d4c5960195b8898b832b86993a6ca26791af7993c11363e8971a824c`.
- Kubernetes: pass, deployment image `localhost:5000/bazos-service:0cabc0c`, ready replicas `1/1`, pod `bazos-service-5d94ff7cfb-xgrdg` Running with 0 restarts.
- Production smoke: pass for `https://bazos.alfares.cz/health`, `/client` HTTP 200 with `client-overview-stats-20260626`, and `/ui/app.js` containing `Zbývá vložit`, `bazosAdUrl`, and `Moje inzeráty v přehledu` markers.

### Readiness Gate Evidence

- Owner request supplied concrete UI behavior on 2026-06-26.
- Remote state inspected on `main`; current source commit containing the UI patch is `f38ac3d Restore catalog preview approval flow`.
- Existing guarded contracts inspected: Bazos ads, identities, monitoring/publish queue, and UI app shell.
- Sensitive data boundary: the overview shows verification/session/capacity status and does not display raw phone numbers.

### Risks

- Public Bazos ad URLs are derived from stored `bazosAdId` using the standard `/inzerat/<id>/` shape. If Bazos changes its public URL format, links may need adjustment.
- Current-month counts are based on local stored `createdAt` and `lastPublishedAt` fields, not a live scrape of Bazos.

### Files Changed

- `services/bazos-service/src/ui/ui.assets.ts`
- `implementation-goals/GOAL-12-client-overview-statistics.md`
- `reports/validation/GOAL-12-client-overview-statistics-report.md`
- `implementation-goals/README.md`
- `docs/IMPLEMENTATION_STATE.md`

### Commit Or No-Commit Reason

Source UI patch deployed in image `localhost:5000/bazos-service:0cabc0c`; this report update is docs-only.

### Next Action

No further action required unless live signed-in browser QA finds account-specific data issues.
