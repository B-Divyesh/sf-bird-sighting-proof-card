# Repair 2 handoff — Make a private bird-sighting record

Work order: `bird-sighting-proof-card-repair-2`
Live URL: <https://bird-sighting-proof-card.sociobot.in/>

Implementation SHA: `164b4e80f3b8f28d213d529e1907614e4187c239`
Previous report/documentation SHA: `4ed31c774f9e4ed199fb55228d559985488a2c06`
Documentation handoff SHA: `1ed4ece723ea6921744952d9437e33974d877d2f` (documentation only)

## Result

**PASS.** The three Review 4 findings are repaired and the full public-claim
ledger now has an executable demo-sandbox proof for every statement.

The product makes a private bird-sighting record for birders who need another
person to review uncertain evidence without sharing an exact nest location.
The first action is **Try it with sample data**, which opens a filled record.

## What changed

- Completed the claims ledger. `safe-default-export` now proves a selected
  rounded coordinate in both the preview and JSON, plus acknowledgement before
  exact-coordinate export. `portable-exports` now proves populated PDF
  evidence names and the ten-file limit.
- Expanded `demo-isolation` to cover saving an incomplete record. Added the
  `site-data-removal` claim, which saves an unexported demo record, clears the
  origin's browser storage, reloads, and proves the record is gone.
- Replaced raw malformed-JSON parser output with a visible and announced
  recovery message: “This JSON file could not be read. Choose a Bird Sighting
  Proof Card JSON export and try again.”
- Replaced the 404 eyebrow and heading with plain state labels: “Error 404”
  and “Page not found.”
- Updated the copy audit and copied the verb-first 81-character catalog
  description to `/work/.evidence/catalog-description.txt`.

## Verification

Clean checkout: `/tmp/bird-proof-card-clean-xbaU1O`, detached at the
implementation SHA above.

```text
npm ci             PASS — 61 packages, 0 vulnerabilities
npm test           PASS — 3 files, 14 tests
npm run typecheck  PASS
npm run lint       PASS
npm run build      PASS — dist/ produced
npm run test:e2e   PASS — 50 browser tests
13 claim commands  PASS — each exact command in .factory/claims.json
```

Every claim ran independently against the isolated `/demo/` sandbox on both
desktop and phone projects. The registry has exactly one matching
`@claim:<id>` browser test per entry.

Live verification after deployment:

- The deployed JavaScript and CSS hashes match `dist/`:
  `main-nA-710Ne.js` is `b3f2f01e…fea59032`; `main-CnHR0kD9.css` is
  `15017ae1…b5a1b6a0`. The deployed service worker also matches the build.
- Fresh 1440 × 900 and 390 × 844 contexts found the job, audience, and first
  action above before scrolling. Both had no horizontal overflow or console
  error before the deliberate 404 request.
- The one-click sample showed its persistent demo label, two evidence files,
  two candidates, and enabled PDF/JSON actions. Its PDF began `%PDF-1.4` and
  listed both evidence names; JSON held two embedded sample attachments.
- In a disposable browser context, demo reset restored the shipped sample and
  leaving demo restored an independently saved real record. No real visitor
  data was used.
- Live malformed JSON displayed and announced the plain recovery message.
  A random URL returned the designed **HTTP 404** page headed “Page not
  found”; that intentional 404 is expected, not an error.
- A service-worker-controlled `/demo/` reloaded offline with the filled sample
  and “Offline now.”
- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, title, English language,
  one H1, main landmark, no missing image alt text, no unlabeled buttons, and
  no console errors.
- Axe found zero violations on `/`, `/demo/`, `/privacy/`, `/terms/`,
  `/404.html`, and `/offline.html` in light and dark modes.
- Lighthouse 13.4.1: performance 100, accessibility 100, best practices 100,
  SEO 100; FCP 1.0 s, LCP 1.1 s, CLS 0.

The built main JavaScript is 41,169 bytes raw (14.15 kB gzip); CSS is 19,578
bytes raw (5.30 kB gzip); the mobile AVIF hero is 22,353 bytes. Hashed assets
return immutable one-year caching and `sw.js` revalidates on every check.

## Earlier findings

| Earlier scope | Current disposition |
| --- | --- |
| F-1-1 to F-1-3 | Plain first screen, filled isolated demo, and complete claims ledger are verified. |
| F-1-4 to F-1-7; Verify-2 privacy/export issues | Coordinate text and known media metadata redact by default; coordinate validation and 12 MB export/import round trip pass. |
| F-1-8 to F-1-15 | Visible file-picker focus, designed 404, route metadata/shells, 44 px mobile targets, plain terminology/actions, and copy limits pass. |
| F-2-1 to F-2-4 | Backend/update claims, route focus announcements, offline/404 shells, and plain storage copy pass. |
| Verify-3 | Media boundary, keyboard focus, mobile layout, cache policy, and security-header checks remain passing. |
| Review-4 F-4-1 | Fixed by the expanded rounded-location, populated-PDF, incomplete-record, ten-file, and site-data claim evidence. |
| Review-4 F-4-2 | Fixed by the visible, plain malformed-import error and regression test. |
| Review-4 F-4-3 | Fixed by the plain 404 heading and eyebrow. |

## Deployment and scope

Built `dist/` was deployed with the existing product static-app configuration
to the existing `sf-bird-sighting-proof-card` app. The product remains a
static local-first PWA; backend tenant checks, rate limits, and external
integration checks do not apply. The brief is free, so no paid offer or
billing metadata is required.

## Known gaps and next steps

No known product gaps remain. User records and evidence remain browser-local
until a user exports a file; clearing browser site data still removes records
without an exported backup, as documented and tested.
