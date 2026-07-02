# Bazos Catalog Source Options Worker Validation

```yaml
id: BAZOS-CATALOG-SOURCE-OPTIONS-WORKER-2026-07-02
status: source-validated-no-deploy
role: worker-agent
repo: alfares:/home/ssf/Documents/Github/bazos
branch: main
parent_plan: docs/orchestrator/2026-07-02-dashboard-catalog-source-options-plan.md
```

## Intent Preservation Chain

Vision -> shared Catalog-backed product sourcing in personal cabinets.
Goal Impact -> Bazos users can manage own Catalog products, use effective Catalog sources, and opt own products into community resale without changing Bazos compliance gates.
System -> Auth/Catalog own product and resale metadata remain owned by Catalog; Bazos remains a guarded channel/draft/publish surface.
Feature -> Catalog Dashboard entry points, effective-source product picker, optional owner resale flag for save-to-Catalog.
Task -> implement the Bazos worker lane without deploy, schema changes, secrets, RabbitMQ/catalog-event edits, or destructive git operations.
Execution Plan -> `docs/orchestrator/2026-07-02-dashboard-catalog-source-options-plan.md` plus `AGENTS.md`.
Coding Prompt -> current worker prompt with allowed files: UI asset, UI controller, `shared/bazos/ad/**`, docs/reports.
Code -> `services/aukro-service/src/ui/ui.assets.ts`, `shared/bazos/ad/bazos-ad.dto.ts`, `shared/bazos/ad/bazos-ad.service.ts`, `shared/bazos/ad/bazos-ad.service.spec.ts`.
Validation -> commands below passed; deployment not run by instruction.

## Requirement Matrix After Fix

| Requirement | Status | Evidence |
|---|---|---|
| R1 User can work with Alfares/company catalog products from personal account | Pass | `/client#catalog` still loads `catalogScope=effective`; added direct Catalog Dashboard source settings link to `https://catalog.alfares.cz/dashboard/settings`. |
| R2 User can upload/manage own product data | Pass | Manual Bazos publish flow still saves to Catalog and now links to Catalog products list/new product dashboard: `/dashboard/products`, `/dashboard/products/new`. |
| R3 User can publish own products for common resale | Partial pass | Manual save-to-Catalog UI adds `resaleEnabled`; Bazos forwards it on Catalog create and on existing-product update only when the returned product owner matches the authenticated user. |
| R4 User can load/select own, other users shared products, and company products | Pass | Existing picker preserves `catalogScope: effective` and keeps source labels for Alfares/private/community resale. No local source filter added. |
| R5 Non-owned products remain read-only in Catalog | Pass for this lane | Bazos does not forward `resaleEnabled` on matched existing products unless ownership is proven from Catalog product fields. |
| R6 Channel publication remains user-owned | Pass | Publish/draft flow remains under the selected Bazos identity and guarded Bazos queue; no global account path was added. |

## Commands Run

```bash
git diff --check
# pass

npm --prefix shared test -- bazos-ad.service.spec.ts
# pass: 1 suite, 14 tests

npm --prefix shared run build
# pass

npm --prefix services/aukro-service run build
# pass
```

## Gate Evidence

- Pre-coding context: read remote `AGENTS.md`, shared Alfares agent profile, cross-agent standard, Bazos required docs, and the parent plan.
- Sensitive data: no secrets, tokens, raw customer data, or production config values inspected or printed.
- Contract/schema impact: no schema or public Catalog contract changes. Existing Catalog client `createProduct`/`updateProduct` payload paths were used.
- Replay/queue/pacing impact: not changed. Bazos guarded publish queue, pacing, duplicate, category, and challenge gates remain untouched.
- Deploy: not run by task instruction.

## Dirty Worktree Caveats

- `services/aukro-service/src/ui/ui.assets.ts` was dirty before this worker. Pre-existing Catalog return-flow changes were preserved.
- During this worker, additional landing-copy changes and `docs/orchestrator/2026-07-02-public-landing-sales-copy-ips.md` appeared in the remote worktree. They were not created by this worker and were left intact.
- Existing untracked plan docs remain: `docs/orchestrator/2026-07-02-dashboard-catalog-source-options-plan.md`, `docs/orchestrator/2026-07-02-related-products-order-affinity-plan.md`.

## Remaining Missing Or Unknown

- `[MISSING: Catalog owner-field contract guarantee for existing product update resale toggles when Catalog omits owner metadata from search results. Bazos only forwards resaleEnabled on existing products when ownerUserId/owner_user_id/ownerId/owner.userId/owner.id proves ownership.]`
- `[UNKNOWN: authenticated runtime browser smoke token for end-to-end Bazos personal cabinet to Catalog Dashboard flow.]`

## Recommendation

Integration owner should review this worker diff together with concurrent `ui.assets.ts` edits, then decide commit order. No deploy was performed.

Next Action: Integration owner review and commit/deploy gate decision.
