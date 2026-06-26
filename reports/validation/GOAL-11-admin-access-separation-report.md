# GOAL-11 Admin Access Separation Report

## Intent Compliance Report

### Goal

Separate Basus customer and business-owner administration access so `/client` is the normal user section and `/admin` is restricted to administrator users.

### Goal Impact

The change aligns the UI with the owner request: public visitors and regular users are not directed to the admin panel; regular users keep their ads and actions in `/client`; admin users can reach `/admin` only after Auth validation and admin authorization.

### Implemented

- Removed the public landing-page card linking to `/admin`.
- Added server-side admin authorization for `/ui/auth/me?mode=admin`.
- Added Auth role recognition for `global:superadmin`, `global:platform_admin`, and `app:bazos-service:admin` style roles.
- Added fallback non-secret email allowlist env `BAZOS_ADMIN_EMAILS`.
- Added a hidden `/admin` link in the client topbar that appears only when `access.admin` is true.

### Not Implemented

- No Auth role assignment was mutated.
- `[MISSING: owner/test admin email if Auth roles do not already mark that user as admin]`.
- No live credential smoke with a real/test admin user was run; production smoke was unauthenticated/static only.

### Bazos Compliance Check

Pass by scope. No Bazos publishing, browser automation, identity verification, encrypted session, duplicate, active-ad, category, pacing, content-policy, or challenge-stop behavior changed.

### Validation Evidence

- `npm --prefix services/aukro-service run build`: pass.
- `npm --prefix shared run build`: pass.
- `npm test`: pass, 5 suites and 82 tests.
- `git diff --check`: pass.
- Static source check: pass, no public landing-page `/admin` href remains outside the hidden authenticated client `#admin-link`.
- Deploy: pass, `./scripts/deploy.sh` deployed image `localhost:5000/bazos-service:2fdd564`, digest `sha256:5e7ea6839f7ae42cbd67b2ed7e49cb414b91c2e22648aaf9b33b1e2eb1ed8258`.
- Kubernetes: pass, pod `bazos-service-5fdbb6bc-ppjfh` Ready 1/1, Running, 0 restarts.
- Production smoke: pass for `/health`, `/`, `/client`, `/admin`, `/ui/app.js`, unauthenticated `/ui/auth/me?mode=admin` returning 401, no public landing `/admin` href, and live JS admin-gate markers.

### Readiness Gate Evidence

- Owner request supplied concrete access behavior on 2026-06-26.
- Auth contract inspected in `/home/ssf/Documents/Github/auth-microservice/docs/UNIFIED_AUTH_CONTRACT.md`; Auth owns RBAC and `/auth/validate` returns `roles`.
- Sensitive data boundary: no token values, decoded JWTs, secrets, passwords, raw production user records, or database rows were read or recorded.

### Risks

- If the test user has no Auth admin role and `BAZOS_ADMIN_EMAILS` remains empty, `/admin` will fail closed for that user until the runtime allowlist or Auth role assignment is configured.
- The monitoring endpoints remain user-scoped behind existing backend guards; this change restricts the UI entry and UI session gate, not the underlying Auth role model in shared Bazos API controllers.

### Files Changed

- `.env.example`
- `k8s/configmap.yaml`
- `services/aukro-service/src/ui/ui.assets.ts`
- `services/aukro-service/src/ui/ui.controller.ts`
- `implementation-goals/GOAL-11-admin-access-separation.md`
- `reports/validation/GOAL-11-admin-access-separation-report.md`
- `implementation-goals/README.md`
- `docs/IMPLEMENTATION_STATE.md`

### Commit Or No-Commit Reason

Committed after validation in this session; commit SHA recorded in final response.

### Next Action

Confirm the test/owner Auth account has `app:bazos-service:admin` or configure `BAZOS_ADMIN_EMAILS`; then run an approved logged-in admin smoke if needed.
