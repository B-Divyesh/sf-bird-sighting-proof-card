# Review handoff — FAIL

Work order: `bird-sighting-proof-card-review-1`
Date: 2026-08-28
Reviewed commit: `a64f19727fa00bb1faf4e967b34b034d2788395e`
Live URL: <https://bird-sighting-proof-card.sociobot.in/>

No product code was changed. The review report is
[`.factory/review-1.md`](review-1.md). It records a **FAIL**.

Completed: fresh 390 px/desktop live checks, route/link/metadata crawl,
one-click-demo check, manual keyboard checks, offline reload/network-origin
check, axe scans, fresh-clone `npm ci` / `npm test` / `npm run build`, complete
prior verification history review, and direct reproduction of DMS and JPEG COM
GPS leaks.

Primary blockers: no isolated sample demo; no `.factory/claims.json`; default
share-safe preview leaves DMS coordinates visible; default JSON preserves GPS
text in a valid JPEG comment; export capacity can exceed import capacity; and
file-picker focus is invisible. A real 404 is also absent.

Local checks that completed successfully:

```sh
npm ci
npm test
npm run build
```

Re-run the review after the fixes with the above plus:

```sh
npm run test:e2e
```
