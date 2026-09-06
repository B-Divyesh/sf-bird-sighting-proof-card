# Review 5 — Make a private bird-sighting record

Date: 2026-09-06  
Work order: `bird-sighting-proof-card-review-5`  
Live URL: <https://bird-sighting-proof-card.sociobot.in/>  
Implementation candidate: `164b4e80f3b8f28d213d529e1907614e4187c239`  
Documentation revision reviewed: `c872d4de6ff6d35a4bc2a23aa28bd2538641db86`

## Verdict

**PASS — 0 findings and 0 untested public claims.**

The job is to make a private bird-sighting record. It is for birders who need
another person to review uncertain evidence without exposing an exact nest
location. In fresh desktop and phone browsers, the first action before
scrolling was **Try it with sample data**. Its adjacent text says it opens a
filled record that can be exported.

## Candidate and live runtime

Commits after `164b4e8` change only `.factory/claims.json` and documentation.
The production build from documentation SHA `c872d4d` matched the live site
byte for byte for `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`,
`/offline.html`, `sw.js`, `manifest.webmanifest`, the main JavaScript, and the
main CSS. This confirms that `164b4e8` is the implementation under review.

| Runtime file | SHA-256 | Local/live |
| --- | --- | --- |
| `assets/main-nA-710Ne.js` | `b3f2f01eb9ca33291202ec37ea4c04f7a6521c19e256fe83ff286d34fea59032` | Match |
| `assets/main-CnHR0kD9.css` | `15017ae1f7eef02ccd3a052cab10ac0d51c7c1c9541d04122bef57a0b5a1b6a0` | Match |
| `sw.js` | `35eab47c1291ba6792efd2b38002d0c625af358503c5ddbe970d611c01168e91` | Match |
| `manifest.webmanifest` | `a22ea2ca3abbafc249d339492dff824dd0f899c460ebc8e19d91885924e5d957` | Match |

## Fresh desktop and phone review

Fresh 1440 × 900 and 390 × 844 contexts showed the H1 “Make a private
bird-sighting record,” the audience sentence, and the sample action in the
initial viewport. Both had zero horizontal overflow, console errors, and page
errors.

The one-click sample opened `/demo/` and immediately showed:

- the sticky label “Demo — sample data, nothing is saved to your records”;
- “Distant wader at Deerness,” two evidence files, and two candidates;
- observation time, broad place, rounded coordinates, field marks, notes,
  confidence, and a sensitive-site warning; and
- enabled PDF and JSON export actions.

The PDF began `%PDF-1.4` and contained both evidence names. The JSON contained
two embedded attachments. After changing and resetting the sample, the
original sample returned. A separately saved real record was absent from the
demo and returned after **Start for real**. These checks used disposable fresh
browser contexts and did not read or alter a visitor's data.

## Normal, invalid, boundary, and recovery paths

- A normal sample saved, reloaded, previewed, and exported as populated PDF
  and JSON.
- A blank export listed the four required items and focused its error summary.
- Coordinates `91, 181` were blocked with latitude, longitude, and recovery
  guidance.
- A malformed JSON import displayed and announced the plain recovery message.
- A 12,000,000-byte evidence file exported to a 16,001,211-byte JSON file and
  imported again as a saved record.
- Ten evidence files were accepted; an eleventh produced the stated limit
  message.
- A text file produced the supported-format message. Denied location access
  suggested broad-place or manual-coordinate entry.
- DMS text and a JPEG comment containing exact coordinates were absent from
  the default preview/export. Rounded and exact-location consent paths also
  passed their declared claim test.
- The storage dialog received focus, closed with Escape, and restored focus to
  its trigger.

## Claims

The registry contains 13 entries. Each id appears in exactly one tagged test.
Every exact command below passed independently in the clean checkout on both
desktop and phone projects.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS |
| `local-only-network` | `npm run test:e2e -- --grep @claim:local-only-network` | PASS |
| `safe-default-export` | `npm run test:e2e -- --grep @claim:safe-default-export` | PASS |
| `photo-time-prefill` | `npm run test:e2e -- --grep @claim:photo-time-prefill` | PASS |
| `geolocation-on-click` | `npm run test:e2e -- --grep @claim:geolocation-on-click` | PASS |
| `portable-exports` | `npm run test:e2e -- --grep @claim:portable-exports` | PASS |
| `no-identification-or-publishing` | `npm run test:e2e -- --grep @claim:no-identification-or-publishing` | PASS |
| `free-no-account` | `npm run test:e2e -- --grep @claim:free-no-account` | PASS |
| `original-art-provenance` | `npm run test:e2e -- --grep @claim:original-art-provenance` | PASS |
| `no-api-or-backend` | `npm run test:e2e -- --grep @claim:no-api-or-backend` | PASS |
| `app-update` | `npm run test:e2e -- --grep @claim:app-update` | PASS |
| `site-data-removal` | `npm run test:e2e -- --grep @claim:site-data-removal` | PASS |

I cross-checked the landing page, builder, storage dialog, Privacy, Terms,
offline page, README, and metadata against this registry. The statements about
demo isolation, offline use, local storage and network behavior, redaction,
location access, exports, limits, update behavior, account/cost, product
limits, and artwork provenance all have declared executable proof. There are
no unlisted, false, incomplete, or untested public claims.

## Accessibility, privacy, PWA, and site structure

- `/opt/fleet/lib/verify-url.sh` passed the live root: HTTPS 200, title,
  English language, one H1, one main landmark, alt text, named buttons, and no
  console error.
- Axe reported zero violations in 28 checks: seven routes, two viewports, and
  light/dark color schemes.
- Keyboard checks found 3 px focus rings on the skip link and both visible file
  controls. Route navigation focused the destination H1 and announced its
  title. Radio controls worked with arrow keys; no trap appeared.
- Reduced-motion mode left no non-zero animation or transition durations.
  At 200% root text size the 390 px page retained its content and had no
  horizontal overflow. Effective radio and field-mark label targets were at
  least 48 px high.
- A service-worker-controlled filled demo reloaded offline and showed
  “Offline now.” A replacement-worker fixture showed “An app update is ready”
  and controlled the reloaded page after the update action.
- The browser parsed the manifest without errors. It includes standalone
  display, a versioned start URL, theme/background colors, 192 px and 512 px
  icons, and a maskable icon.
- During live real/demo save, reset, PDF, and JSON work, all 28 observed
  requests were same-origin GET requests without authorization. There were no
  uploads, analytics, third-party scripts, or CDN fonts.
- Home, demo, Privacy, Terms, 404, and offline have distinct titles, one H1,
  one main landmark, English language, canonical/social metadata, and the
  shared navigation/footer. All 12 discovered links returned HTTP 200.
- A random live path returned deliberate HTTP 404 and the designed page headed
  “Page not found.” The expected status is not a defect.
- Live headers include CSP, HSTS, frame denial, permissions policy, nosniff,
  and a strict referrer policy. Hashed assets are immutable; `sw.js`
  revalidates.

This is a static local-first PWA. Backend tenant isolation, restart
persistence, health, 429/`Retry-After`, and API allowance checks do not apply.
CLI, library, and desktop-installed-consumer checks do not apply.

## Performance and clean-checkout gates

Lighthouse 13.4.1 scored 98 performance, 100 accessibility, 100 best
practices, and 100 SEO. FCP was 1.0 s, LCP 1.3 s, total blocking time 160 ms,
and CLS 0. The built main JavaScript is 41,169 bytes raw (14.15 kB gzip), CSS
is 19,578 bytes raw (5.30 kB gzip), and the mobile AVIF hero is 22,353 bytes.

Fresh clone: `/tmp/bird-proof-card-review5-RUr89T/repo`, detached at
`c872d4d` before installing dependencies.

```text
npm ci                         PASS — 61 packages, 0 vulnerabilities
npm test                       PASS — 3 files, 14 tests
npm run typecheck              PASS
npm run lint                   PASS
npm run build                  PASS — dist/ produced
npm run test:e2e -- --workers=1 PASS — 50 browser tests
13 exact claim commands        PASS — 26 browser results
```

Three aggregate two-worker runs of `npm run test:e2e` each reached 49 passing
tests before the preinstalled Chromium 1208 headless-shell process terminated
with native `SIGSEGV`; no product assertion failed. The affected tests passed
alone, every exact claim command passed with its default two workers, and the
complete 50-test suite passed with one worker. This is classified as runner
instability, not a product finding.

## Earlier findings

I read reviews 1–4, polish reports 1–2, verification reports 2–4, and the prior
handoff. I repeated the relevant checks against the current live runtime and
clean candidate.

| Earlier scope | Fresh disposition |
| --- | --- |
| Verification 2: exact-coordinate prose/photo leaks, invalid ranges, cache policy | Fixed. Live DMS/JPEG checks redact; invalid ranges block; runtime cache headers pass. |
| Verification 3: DMS and five-format metadata, 12 MB round trip, picker focus, phone targets, security headers | Fixed. Exact commands and live boundary, focus, target, and header checks pass. |
| F-1-1 through F-1-3 | Fixed. The first screen names the job/audience/action; the one-click isolated demo and complete claims registry are present. |
| F-1-4 through F-1-7 | Fixed. Default redaction, supported media sanitation, numeric validation, and export/import limits pass. |
| F-1-8 through F-1-12 | Fixed. File focus, designed 404, route metadata, shared shell, and mobile targets pass. |
| F-1-13 through F-1-15 | Fixed. Terminology, action labels, README, and the copy audit are plain and within limits. |
| F-2-1 through F-2-4 | Fixed. Backend/update claims, route focus, offline/404 shells, and storage wording pass. |
| Review 3 | Remains PASS; its demo, claim, route, accessibility, copy, and leverage checks still pass. |
| F-4-1 | Fixed. Rounded output, populated PDF, site-data removal, ten-file limit, and incomplete-save promises are in declared passing tests. |
| F-4-2 | Fixed. Malformed JSON has visible and announced recovery text. |
| F-4-3 | Fixed. The 404 heading is “Page not found” with the plain label “Error 404.” |

## Missed leverage

No finding. Importable JSON and reviewable PDF cover the obvious handoff and
backup needs. Sync would weaken the stated local-only model. Automated species
identification would conflict with the brief's purpose of recording evidence
and uncertainty for human review.

## Final counts

`finding_count: 0`  
`untested_claim_count: 0`

