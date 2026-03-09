# Manual QA Report

## Latest Run

- Date: 2026-03-10
- Command: `npm run test:qa`
- Result: pass
- Runtime: Playwright browser flow with the built-in `webServer` from `playwright.config.ts`

## Why This Exists

The earlier ad-hoc manual QA attempt used direct Windows shell process launching and MCP browser setup that produced noisy local errors.

This repo now uses a single repeatable command instead:

```bash
npm run test:qa
```

That path:

- boots the app through Playwright's managed `webServer`
- stays same-origin with the app's cookie and CSRF expectations
- avoids the previous Windows-specific shell spawning issues

## Checklist Covered

The latest run passed these flows:

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

## Coverage Notes

The scripted QA flow currently performs:

1. admin login
2. voucher creation for a valid checkout scenario
3. customer register, logout, and login
4. product search and product detail verification
5. variant selection and cart quantity update
6. checkout with a valid voucher
7. order placement
8. payment proof upload
9. admin payment confirmation
10. manual inventory adjustment
11. settings update and restore

## Limit

This is a scripted browser QA pass, not human exploratory visual QA. It is intended to close the operational checklist and provide a reliable rerun path inside the repo.
