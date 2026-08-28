# Repair handoff — PASS

Work order: `bird-sighting-proof-card-polish-1`

Date: 2026-08-28

Live URL: <https://bird-sighting-proof-card.sociobot.in/>

Demo URL: <https://bird-sighting-proof-card.sociobot.in/demo/>

Deployed product commit: `92804ca`

## Completed

All F-1-1 through F-1-15 findings are fixed. Retained verification findings for location leakage, attachment metadata, import size, keyboard focus, mobile targets, and browser policies are also fixed.

The first screen now names the birding job, visitor, sample action, result, and three concrete facts. The cartographic field-notebook identity remains intact.

The demo has realistic photo and audio evidence. It uses `demo:bird-proof-card`, supports reset and start-real actions, and reloads offline.

Default exports redact common coordinate formats. Known metadata containers are removed from JPEG, PNG, WebP, MP3, and WAV evidence copies.

Every visitor claim is registered in `.factory/claims.json`. Each claim has one tagged browser test against the demo.

Home, demo, privacy, terms, offline, and 404 use complete semantic shells. Known routes have distinct metadata; unknown paths return the designed 404 with HTTP 404.

## Verification

From a fresh detached clone:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Results:

- 14 unit tests passed.
- 10 claim commands passed independently on desktop and mobile.
- 38 full Playwright tests passed on desktop and 390 px mobile.
- `dist/` was produced with `index.html` at its root.
- Initial JS is 41.38 kB raw and 14.32 kB gzip.
- Initial CSS is 19.54 kB raw and 5.29 kB gzip.
- Local Lighthouse: 98 performance, 100 accessibility, 100 best practices, 100 SEO.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO.
- Live FCP 0.9 s, LCP 1.2 s, TBT 20 ms, and CLS 0.
- Live route axe checks found no serious or critical violations.
- Live verify-url found no console errors or semantic failures.
- Live offline reload retained the filled demo.
- Live requests during save/export were same-origin GET requests only.
- Live `/no-such-page` returned HTTP 404.
- Live 12 MB JSON boundary exported to 16,001,211 bytes and imported successfully under CSP.

Full evidence and finding mappings are in [`.factory/polish-1.md`](polish-1.md). Screenshots and Lighthouse reports are under `.factory/evidence/`.

## Deployment

Static deployment used:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh bird-sighting-proof-card /work/repo/dist
```

Final product deployment id: `80102ec1-23ce-425c-9654-cb6f5ef8f06a`. It delivered the CSP-safe import build from `92804ca`.

## Known gaps and next steps

No reviewed finding or required acceptance item remains open. No follow-up is required for this perfection-loop round.
