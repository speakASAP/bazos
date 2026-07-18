# GOAL-11 Admin Access Separation Report

## Intent Compliance Report

### Goal

Separate Bazoš customer and business-owner administration access so `/client` is the normal user section and `/admin` is restricted to administrator users.

### Goal Impact

The change aligns the UI with the owner request: public visitors and regular users are not directed to the admin panel; regular users keep their ads and actions in `/client`; admin users can reach `/admin` only after Auth validation and admin authorization.

### Implemented

- Removed the public landing-page card linking to `/admin`.
- Added server-side admin authorization for `/ui/auth/me?mode=admin`.
- Added Auth role recognition for `global:superadmin`, `global:platform_admin`, and `app:bazos-service:admin` style roles.
- Added fallback non-secret email allowlist env `BAZOS_ADMIN_EMAILS`.
- Added a hidden `/admin` link in the client topbar that appears only when `access.admin` is true.

### Not Implemented

- Auth role assignment was updated after explicit owner approval: `test@example.com` now has `app:bazos-service:admin` in addition to existing `global:superadmin`.
- Live logged-in admin smoke passed for `test@example.com`; no token values, refresh tokens, passwords, or secret values were printed.
- No user password, contact data, Bazos session data, or production ad data was changed.

### Bazos Compliance Check

Pass by scope. No Bazos publishing, browser automation, identity verification, encrypted session, duplicate, active-ad, category, pacing, content-policy, or challenge-stop behavior changed.

### Validation Evidence

- `npm --prefix services/bazos-service run build`: pass.
- `npm --prefix shared run build`: pass.
- `npm test`: pass, 5 suites and 82 tests.
- `git diff --check`: pass.
- Static source check: pass, no public landing-page `/admin` href remains outside the hidden authenticated client `#admin-link`.
- Deploy: pass, `./scripts/deploy.sh` deployed image `localhost:5000/bazos-service:2fdd564`, digest `sha256:5e7ea6839f7ae42cbd67b2ed7e49cb414b91c2e22648aaf9b33b1e2eb1ed8258`.
- Kubernetes: pass, pod `bazos-service-5fdbb6bc-ppjfh` Ready 1/1, Running, 0 restarts.
- Production smoke: pass for `/health`, `/`, `/client`, `/admin`, `/ui/app.js`, unauthenticated `/ui/auth/me?mode=admin` returning 401, no public landing `/admin` href, and live JS admin-gate markers.
- Auth RBAC mutation: pass, idempotent SQL inserted one `user_roles` assignment for `test@example.com` -> `app:bazos-service:admin`; verification rows show `global:superadmin` and `app:bazos-service:admin`.
- Logged-in admin smoke: pass, Auth `/auth/validate` returned roles `app:bazos-service:admin,global:superadmin`; live Bazoš `/ui/auth/me?mode=admin` returned HTTP 200 with `access.admin=true` for `test@example.com`.

### Readiness Gate Evidence

- Owner request supplied concrete access behavior on 2026-06-26.
- Auth contract inspected in `/home/ssf/Documents/Github/auth-microservice/docs/UNIFIED_AUTH_CONTRACT.md`; Auth owns RBAC and `/auth/validate` returns `roles`.
- Sensitive data boundary: no token values, decoded JWTs, secrets, passwords, raw production user records, or database rows were read or recorded.

### Risks

- Auth role assignment is now present for `test@example.com`; `BAZOS_ADMIN_EMAILS` can remain empty unless another fallback admin is needed.
- The monitoring endpoints remain user-scoped behind existing backend guards; this change restricts the UI entry and UI session gate, not the underlying Auth role model in shared Bazos API controllers.

### Files Changed

- `.env.example`
- `k8s/configmap.yaml`
- `services/bazos-service/src/ui/ui.assets.ts`
- `services/bazos-service/src/ui/ui.controller.ts`
- `implementation-goals/GOAL-11-admin-access-separation.md`
- `reports/validation/GOAL-11-admin-access-separation-report.md`
- `implementation-goals/README.md`
- `docs/IMPLEMENTATION_STATE.md`

### Commit Or No-Commit Reason

Committed after validation in this session; commit SHA recorded in final response.

### Next Action

No further action required for `test@example.com`; add additional admin users through Auth RBAC when needed.
