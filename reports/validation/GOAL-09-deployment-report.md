# GOAL-09 Deployment Report

```yaml
id: GOAL-09-DEPLOYMENT
status: passed
date: 2026-06-26
deployed_commit: 030b99e
image: localhost:5000/bazos-service:030b99e
image_digest: sha256:2ea493c2164e4bdc589d92e3e624975c40896ae05c574bb33278303b8440a8d9
namespace: statex-apps
```

## Deployment Command

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && ./scripts/deploy.sh'
```

## Deployment Evidence

- Preflight passed.
- Docker build passed for image `localhost:5000/bazos-service:030b99e`.
- Image push passed for tag `030b99e` and `latest`, digest `sha256:2ea493c2164e4bdc589d92e3e624975c40896ae05c574bb33278303b8440a8d9`.
- Kubernetes manifests applied with immutable image `localhost:5000/bazos-service:030b99e`.
- Rollout completed successfully.
- New pod `bazos-service-6fddbb94b-6rdr5` reached `READY 1/1`, `Running`, `0` restarts.
- Old pod `bazos-service-6648954f7f-4hdvp` was still `Terminating` during the immediate post-deploy check; rollout was already successful and production smoke passed.

## Production Smoke

- `https://bazos.alfares.cz/health`: HTTP 200.
- `https://bazos.alfares.cz/`: HTTP 200.
- `https://bazos.alfares.cz/client`: HTTP 200.
- `https://bazos.alfares.cz/ui/auth/me` without auth: HTTP 401 expected.

## Startup Evidence

New deployment logs showed route mapping, Prisma Client database connection, Prisma pool warm-up, and `Nest application successfully started`.
