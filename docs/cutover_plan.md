# Cutover Plan

This document defines when `ecommercestarter/` is no longer needed in the active workspace and can be archived or deleted.

## Decision

`ecommercestarter/` may be archived after all of the following conditions are true:

1. Final verification is green on the root Next.js app:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run test:e2e`
   - `npm run build`
2. Route and endpoint parity remain documented in [parity_checklist.md](./parity_checklist.md).
3. Manual QA is signed off for:
   - auth
   - catalog
   - variant select
   - cart
   - checkout
   - voucher
   - order placement
   - payment upload
   - admin review
   - inventory adjustment
   - settings update
4. There is no remaining blocker in `to_dos.md` that still depends on reading code from `ecommercestarter/`.

## Current blockers before archive

- `FREE_PRODUCT` promotion support is still open.

## Archive action

When the conditions above are satisfied:

1. Remove `ecommercestarter/` from the active repo workspace.
2. If historical reference is still wanted, store it outside the active app repo or in a release artifact.
3. Re-run the final verification commands once more after removal.

## Current status

As of 2026-03-10:

- root Next.js app is the source of truth
- parity documentation exists
- automated verification is available
- manual QA checklist has been executed and signed off via `npm run test:qa`
- audit log schema has been normalized with typed entity/context fields and request trace support
- `ecommercestarter/` should still stay as temporary reference until the remaining blockers are closed
