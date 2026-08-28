# Polish round 2 handoff

Work order: `bird-sighting-proof-card-polish-2`
Base reviewed: `d4d5a7a2d3eb2cd8acad2e64b1102930ee3de3b2`

## Delivered

- Closed every finding in review 1 and review 2. The detailed finding map is
  `.factory/polish-2.md`.
- Added two missing tested promises: no API key/backend is required, and the
  update toast reloads under the replacement service worker.
- Document routes now focus their main heading and announce their title.
- Completed 404 and offline metadata. The offline fallback now has the same
  wordmark, navigation, legal footer, build id, and cartographic visual system.
- Rewrote the storage hint and action in plain language.
- Updated the catalog line: it begins with “Make” and is 79 characters.

## Verification before deployment

```text
npm ci                         PASS — 61 packages, 0 vulnerabilities
npm test                       PASS — 3 files, 14 tests
npm run typecheck              PASS
npm run lint                   PASS
npm run build                  PASS — dist/ produced
app browser suite              PASS — 22 checks, desktop + 390 px mobile
claim browser suite            PASS — 24 checks, desktop + 390 px mobile
```

The browser suite includes axe scans for every route, explicit mobile layout,
keyboard focus, reduced motion, offline reload, privacy/network interception,
demo isolation, export/import boundaries, and the service-worker update flow.
`/opt/fleet/lib/verify-url.sh` also passed locally with zero console errors;
its desktop and mobile captures are
`.factory/evidence/polish-2/local/screenshot-desktop.png` and
`.factory/evidence/polish-2/local/screenshot-mobile.png`.
The initial JavaScript bundle is 40.77 kB raw / 14.06 kB gzip and main CSS is
19.54 kB raw / 5.29 kB gzip. The 768 px AVIF hero remains 22.4 kB.

## Clean-clone and live evidence

After the repair commit is pushed, repeat the commands in every entry of
`.factory/claims.json` from a fresh clone, deploy the static `dist/` output,
and record the final live cold check below.

Known gaps: none.
