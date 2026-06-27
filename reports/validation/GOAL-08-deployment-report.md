# GOAL-08 Deployment Report

Date: 2026-06-26

## Deployment

- First deployment commit: `43a2f7d Use hosted Auth for Bazoš UI login`.
- First deployed image: `localhost:5000/bazos-service:43a2f7d`, digest `sha256:ce3822a9e80fbe7799ea7d9c75a89e542604ec362a2af0e653bb353eca0698d0`.
- Follow-up cache fix commit: `468a42f Bust Bazoš UI auth script cache`.
- Final deployed image: `localhost:5000/bazos-service:468a42f`, digest `sha256:90311f93d048fc41ac50e83786b611fb24842bbbc398a15094eccce929fd36dc`.
- Deploy command: `./scripts/deploy.sh`.
- Final rollout: deployment `bazos-service` successfully rolled out.
- Final pod evidence: `bazos-service-7f9b7d6b5c-bvvrg` Ready `1/1`, Running, 0 restarts.

## Production Smoke

- `GET https://bazos.alfares.cz/client`: HTTP 200.
- `GET https://bazos.alfares.cz/auth/callback`: HTTP 200.
- `GET https://bazos.alfares.cz/ui/app.js?v=hosted-auth-20260626`: HTTP 200.
- `GET https://bazos.alfares.cz/health`: HTTP 200, `status=ok`, `service=bazos-service`.
- `GET https://bazos.alfares.cz/ui/auth/me` without token: HTTP 401.
- `POST https://bazos.alfares.cz/ui/auth/login`: HTTP 404.
- `POST https://bazos.alfares.cz/ui/auth/register`: HTTP 404.
- Live app JS headers: `Cache-Control: no-store, max-age=0`, Cloudflare `cf-cache-status: BYPASS`.
- Live `/client` headers: `Cache-Control: no-store, max-age=0`, Cloudflare `cf-cache-status: DYNAMIC`.

## Live Content Checks

- `/client` contains hosted Auth actions: `Přihlásit se přes Alfares Auth` and `Registrovat v Alfares Auth`.
- `/client` uses `/ui/app.js?v=hosted-auth-20260626`.
- Live app JS contains `https://auth.alfares.cz`, `https://bazos.alfares.cz/auth/callback`, `client_id`, `return_url`, and `bazosAuthState`.
- Live app JS does not contain `/ui/auth/login`, `/ui/auth/register`, old `authMode`, old `login-form`, or `auth-submit`.

## Browser QA

- Browser target: `https://bazos.alfares.cz/client`.
- Page title: `Klientský panel Bazoš`.
- Login button count: 1.
- Register button count: 1.
- Password input present: false.
- Legacy form present: false.
- Script source: `/ui/app.js?v=hosted-auth-20260626`.
- Console warnings/errors before click: none.
- Console warnings/errors after click: none.
- Interaction: clicking hosted login navigated to `https://auth.alfares.cz/login` with `client_id=bazos-service`, `return_url=https://bazos.alfares.cz/auth/callback`, and generated state length 32.

## Not Run

- No real credential submission or token-fragment callback smoke was run.
- No production user data, passwords, contact codes, database records, or token values were read or printed.

## Result

Goal 08 source and production deployment are complete for hosted Auth entry and callback readiness.
