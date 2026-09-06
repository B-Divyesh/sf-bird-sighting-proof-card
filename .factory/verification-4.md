# Verification 4 — Make a private bird-sighting record

Date: 2026-09-06
Work order: `bird-sighting-proof-card-verify-4`
Live URL: <https://bird-sighting-proof-card.sociobot.in/>
Implementation candidate: `164b4e80f3b8f28d213d529e1907614e4187c239`
Documentation revision: `4c7b22165b98e676edc8349b814623523d7cd365`

## Verdict

**PASS — 0 findings and 0 untested public claims.**

The job is to make a private bird-sighting record. It is for birders seeking
review of uncertain evidence without exposing an exact nest location. On a
fresh desktop and phone visit, before scrolling, the first action was **Try it
with sample data**; it opens a filled record.

## Candidate and deployment

The live runtime is the implementation candidate. Fresh production builds and
live responses matched byte for byte for the home, demo, Privacy, Terms, 404,
offline, service-worker, manifest, main JavaScript, and main CSS files.

| File | SHA-256 |
| --- | --- |
| `assets/main-nA-710Ne.js` | `b3f2f01eb9ca33291202ec37ea4c04f7a6521c19e256fe83ff286d34fea59032` |
| `assets/main-CnHR0kD9.css` | `15017ae1f7eef02ccd3a052cab10ac0d51c7c1c9541d04122bef57a0b5a1b6a0` |
| `sw.js` | `35eab47c1291ba6792efd2b38002d0c625af358503c5ddbe970d611c01168e91` |

`4c7b221` changes only `.factory/claims.json` wording and the handoff. Its
added exact-location acknowledgement is already asserted by the same
`@claim:safe-default-export` test. No post-candidate runtime image was needed.

## Live product checks

- Fresh 1440 × 900 and 390 × 844 contexts loaded with no console or page
  errors and no horizontal overflow. The root has English language metadata,
  one H1, and one main landmark.
- The one-click sample had the persistent “Demo — sample data, nothing is
  saved to your records” label, two evidence files, two candidates, and
  enabled PDF and JSON exports. Its PDF began `%PDF-1.4` and contained both
  sample evidence names. Its JSON contained two attachments.
- Reset restored the shipped sample after the asynchronous storage operation.
  A separately saved real record was absent in demo and returned after
  **Start for real**. The check used a disposable browser context only.
- Invalid `91, 181` coordinates were blocked with four specific recovery
  items, including valid ranges and the exact-location acknowledgement. A
  malformed JSON file showed: “This JSON file could not be read. Choose a Bird
  Sighting Proof Card JSON export and try again.”
- A service-worker-controlled `/demo/` reloaded offline with the filled sample
  and the visible “Offline now” state. The update claim also passed against its
  replacement-worker fixture.
- A random live path returned deliberate HTTP 404 and the styled page headed
  “Page not found.” This expected 404 is not a defect.
- All 12 discovered links returned HTTP 200, including the product routes and
  the disclosed GitHub source link. Home, demo, Privacy, Terms, 404, and
  offline routes returned 200. Privacy and Terms are live.
- Keyboard Tab reached both visually-hidden file inputs; their visible labels
  received the designed 3 px focus outline. Reduced-motion mode had zero
  transition and animation durations. The browser dialog and route focus paths
  are covered by the full browser suite.
- The live headers provide CSP, HSTS, `X-Frame-Options: DENY`,
  `Permissions-Policy`, `X-Content-Type-Options`, and a strict referrer
  policy. The app is a static local-first PWA, so backend tenant, persistence
  restart, health, and 429 checks do not apply.

`verify-url.sh` passed against the live root: HTTPS 200, title, `lang`, H1,
main landmark, no missing image alt text, no unlabeled button, and no console
errors. Axe reported zero violations across home, demo, Privacy, Terms, 404,
and offline pages on desktop and phone in light and dark schemes (24 route /
viewport / theme checks).

An independent Lighthouse 13.0.1 run produced 99 performance, 100
accessibility, 100 best practices, and 100 SEO. Its target ended during the
full-page screenshot artifact after the scored audits; the emitted report is
valid and all measured categories meet the required thresholds. The app does
not make a public 100-score claim. Built main JavaScript is 41,169 bytes raw
(14.15 kB gzip), CSS is 19,578 bytes raw (5.30 kB gzip), and the mobile AVIF
hero is 22,353 bytes.

## Clean-checkout verification

I made a fresh `git clone --no-local`, detached it at the implementation
candidate, installed the documented Node prerequisites with `npm ci`, and ran:

```text
npm test           PASS — 3 files, 14 tests
npm run typecheck  PASS
npm run lint       PASS
npm run build      PASS — dist/ produced
npm run test:e2e   PASS — 50 browser tests
```

Every declared command ran separately from the isolated demo sandbox. Each
ran desktop and phone projects and passed.

| Claim | Exact command | Result and observable proof |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS — real and demo storage remain separate; incomplete demo record saves. |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — filled demo reloads offline. |
| `local-only-network` | `npm run test:e2e -- --grep @claim:local-only-network` | PASS — demo save/export requests are same-origin GET only. |
| `safe-default-export` | `npm run test:e2e -- --grep @claim:safe-default-export` | PASS — DMS/text and JPEG/PNG/WebP/WAV/MP3 metadata redact; rounded output and exact acknowledgement assert. |
| `photo-time-prefill` | `npm run test:e2e -- --grep @claim:photo-time-prefill` | PASS — JPEG capture time pre-fills and remains editable. |
| `geolocation-on-click` | `npm run test:e2e -- --grep @claim:geolocation-on-click` | PASS — permission request happens only after its named action. |
| `portable-exports` | `npm run test:e2e -- --grep @claim:portable-exports` | PASS — PDF names, 12 MB import/export boundary, ten-file limit. |
| `no-identification-or-publishing` | `npm run test:e2e -- --grep @claim:no-identification-or-publishing` | PASS — unverified state and no identification/publishing action. |
| `free-no-account` | `npm run test:e2e -- --grep @claim:free-no-account` | PASS — no sign-in or payment path. |
| `original-art-provenance` | `npm run test:e2e -- --grep @claim:original-art-provenance` | PASS — shipped art matches its source and provenance record. |
| `no-api-or-backend` | `npm run test:e2e -- --grep @claim:no-api-or-backend` | PASS — save/export without credentials, remote origin, or non-GET request. |
| `app-update` | `npm run test:e2e -- --grep @claim:app-update` | PASS — update notice reloads under replacement worker. |
| `site-data-removal` | `npm run test:e2e -- --grep @claim:site-data-removal` | PASS — clearing origin data removes an unexported record. |

There are 13 registry entries and exactly one matching `@claim:` test tag for
each. I also reviewed landing, legal, demo, and README copy against the
registry. Their testable public promises are represented by the ledger; no
unlisted or incomplete public claim remains.

## Earlier finding disposition

| Earlier findings | Current disposition and new evidence |
| --- | --- |
| Verification P1 exact opt-in, P1 photo GPS, P2 invalid coordinates, P2 caching | Fixed. The safe-export and portable-export commands pass; live invalid recovery is specific; candidate/live hashes and cache policy match. |
| Verification 3 P1 DMS, P1 media metadata, P2 import/export size, P2 picker focus, P3 targets, P3 headers | Fixed. Fixture redaction covers common text plus five media formats; 12 MB boundary passes; live 3 px focus labels, phone layout, and response headers pass. |
| F-1-1 through F-1-15 | Fixed. First-screen job/action, demo isolation, full claim ledger, privacy redaction, import/export boundary, keyboard focus, 404, metadata, shared shell, 44 px mobile controls, terminology, named actions, and copy audit all pass. |
| F-2-1 through F-2-4 | Fixed. Backend-free/update claims, route focus and announcements, complete 404/offline shells, and plain storage wording pass. |
| F-4-1 | Fixed. The ledger includes complete rounded/exact-location, PDF-name, incomplete-save, file-limit, and site-data-removal coverage. |
| F-4-2 | Fixed. Live malformed JSON has a visible, announced plain recovery message. |
| F-4-3 | Fixed. The live 404 uses “Error 404” and “Page not found.” |

No missed leverage finding applies: portable JSON/PDF export is present, and
sync or automated identification would conflict with the local-first,
uncertainty-recording scope.
