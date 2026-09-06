# Review 4: Make a private bird-sighting record — FAIL

Date: 2026-09-06

Live URL: <https://bird-sighting-proof-card.sociobot.in/>

Implementation candidate: `6e3a43db2988a6e8c37765f19ba4310ca62483b9`

Documentation reviewed: `70d22a7d4287c715a2b626c1a896d9c6e264a2ee`

## Verdict

**FAIL.** There are three findings: one blocking, one major, and one minor.
Three public claims lack adequate declared claim tests. The verdict has
`finding_count: 3` and `untested_claim_count: 3`.

The main job works. The first screen is clear, the sample is realistic and
isolated, normal PDF and JSON exports work, offline reload works, and every
declared claim command passes. The product still cannot pass this review
because the claims record is incomplete, malformed JSON gives an invisible
technical error, and the 404 heading uses a metaphor.

## Job, audience, and first action

I opened fresh Chromium contexts at 390 × 844 and 1440 × 900. I recorded this
before scrolling.

| Question | Answer from the first screen | Exact evidence |
| --- | --- | --- |
| What is the job? | Make a private bird-sighting record. | H1: “Make a private bird-sighting record” |
| Who is it for? | Birders who need another person to review uncertain evidence without exposing an exact nest location. | “For birders who need evidence others can review without sharing an exact nest location.” |
| What should I do first? | Open the filled sample. | “Try it with sample data” and “Opens a filled record you can export.” |

The phone and desktop screens showed all three facts before scrolling. Both
had no horizontal overflow and no console or page error.

## Findings

### F-4-1 — BLOCKING — the public claims record is incomplete

All twelve commands in `.factory/claims.json` pass. That does not cover every
public promise. The claims contract requires each promise to appear in the
registry and have one tagged sandbox test that proves the stated outcome.

| Public promise | Location | Current evidence | Result |
| --- | --- | --- | --- |
| “Rounded choices share an area instead” and “Coordinates are rounded to the precision you choose.” | README and Privacy | An untagged unit test checks rounding. `@claim:safe-default-export` only checks that the original coordinate disappears; it does not assert a useful rounded coordinate. | Untested public claim |
| “PDF lists evidence names.” | storage dialog and Privacy | `@claim:portable-exports` checks only the `%PDF-1.4` header. This review independently found both sample names in the live PDF, but the declared command does not prove the public promise. | Untested public claim |
| “Deleting site data also deletes records without an exported backup.” | README and Privacy | No registry entry or tagged test clears site data and proves that the record is gone. | Untested public claim |
| “A record can hold ten files” | README | The portable-export test accepts ten and rejects an eleventh, but the registry claim mentions only the 12 MB limit. | Tested but missing from claim text |
| “You can save an incomplete record.” | landing builder | Demo isolation happens to save and restore a title-only record, but the registry does not state this promise. | Tested but missing from claim text |

The three rows marked “Untested public claim” produce the report's
`untested_claim_count: 3`.

Fix this by adding or expanding claim entries and tagged tests. The rounding
test must assert the displayed and exported rounded value. The PDF test must
assert populated content. The site-data test must save a record, clear the
site's storage in a fresh context, reload, and prove the record is gone.

### F-4-2 — MAJOR — malformed JSON gives no visible recovery message

On both phone and desktop, I selected a file named `broken.json` containing
`{bad`. Nothing visible changed. The off-screen polite live region received:

```text
Expected property name or '}' in JSON at position 1 (line 1 column 2)
```

This is a raw browser parser message. A sighted user receives no error, and a
screen-reader user receives technical text with no next step. The source
passes `JSON.parse` errors directly to the live region in the import handler.

Show a visible error beside Import JSON and announce the same plain message,
for example: “This JSON file could not be read. Choose a Bird Sighting Proof
Card JSON export and try again.” Keep parser details out of user-facing copy.

### F-4-3 — MINOR — the 404 page uses a metaphor as its main heading

A random URL correctly returns HTTP 404 and a designed page. The deliberate
404 response is not the defect. Its eyebrow is “Map edge · 404” and its H1 is
“This trail ends off the map.” These are metaphor and decorative copy, not a
plain heading that names the page state.

Use “Page not found” as the H1. Use “Error 404” or remove the eyebrow. Keep the
existing explanation and return action.

## Sample and real-data isolation

The first-screen sample action opened `/demo/` in one click. The resulting
screen already showed the product in use and retained the sticky label
“Demo — sample data, nothing is saved to your records.” It included:

- “Distant wader at Deerness”;
- `dawn-marsh-observation.webp` and `shore-call-note.wav`;
- 24 August 2026 at 06:42, Deerness coast, rounded coordinates, field marks,
  notes, and a sensitive-site warning;
- Dunlin at medium confidence and Sanderling at low confidence; and
- enabled PDF and JSON actions.

The JSON contained both embedded sample files. The PDF began with `%PDF-1.4`
and contained both evidence names.

In a fresh context, I saved “Review four retained record” in real mode. I
changed the demo title, reset the demo, and saw the original sample return.
After “Start for real,” the real title returned. IndexedDB contained
`bird-proof-card` and no `demo:bird-proof-card` after exit. The browser context
was disposable, so this check did not change any visitor's real data.

## Declared claims

I cloned the repository with `git clone --no-local`, detached at the
implementation candidate, installed the documented Node dependencies, and ran
each exact command separately.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS — desktop + phone |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — desktop + phone |
| `local-only-network` | `npm run test:e2e -- --grep @claim:local-only-network` | PASS — desktop + phone |
| `safe-default-export` | `npm run test:e2e -- --grep @claim:safe-default-export` | PASS — desktop + phone |
| `photo-time-prefill` | `npm run test:e2e -- --grep @claim:photo-time-prefill` | PASS — desktop + phone |
| `geolocation-on-click` | `npm run test:e2e -- --grep @claim:geolocation-on-click` | PASS — desktop + phone |
| `portable-exports` | `npm run test:e2e -- --grep @claim:portable-exports` | PASS — desktop + phone |
| `no-identification-or-publishing` | `npm run test:e2e -- --grep @claim:no-identification-or-publishing` | PASS — desktop + phone |
| `free-no-account` | `npm run test:e2e -- --grep @claim:free-no-account` | PASS — desktop + phone |
| `original-art-provenance` | `npm run test:e2e -- --grep @claim:original-art-provenance` | PASS — desktop + phone |
| `no-api-or-backend` | `npm run test:e2e -- --grep @claim:no-api-or-backend` | PASS — desktop + phone |
| `app-update` | `npm run test:e2e -- --grep @claim:app-update` | PASS — desktop + phone |

Each claim tag occurs exactly once in the repository. F-4-1 records the public
promises missing from this otherwise passing list.

## Normal, invalid, boundary, and recovery checks

The following live checks passed on both viewports:

- normal sample PDF and JSON downloads with populated content;
- blank export names all four required items and focuses the error summary;
- unsupported text evidence gives the supported-format recovery message;
- impossible coordinates `91, 181` are blocked;
- exact boundary coordinates `-90, 180` export after explicit acknowledgement;
- a 12,000,000-byte file is accepted and a 12,000,001-byte file is rejected;
- ten files are accepted and an eleventh is rejected;
- denied location permission gives a manual-entry recovery message;
- demo reset, exit, and real-record restoration;
- valid JSON export and import at the 12 MB boundary through the declared claim;
- coordinate text and JPEG, PNG, WebP, WAV, and MP3 metadata redaction through
  the declared claim; and
- JPEG capture-time prefill remains editable.

Malformed JSON recovery is the exception recorded as F-4-2.

## Offline, privacy, accessibility, and routes

- The live service worker controlled `/demo/`. With the context offline, a
  reload kept the filled sample, demo banner, and “Offline now” status.
- The update fixture claim showed “An app update is ready,” reloaded, and
  confirmed the replacement worker controlled the page.
- Live demo save and export produced same-origin GET requests only. No request
  carried authorization. There were no analytics, uploads, remote scripts, or
  CDN fonts.
- Tab traversal reached both hidden file inputs and gave their visible labels
  a 3 px focus outline. Dialog focus entered, Escape closed it, and focus
  returned to “Show storage details.” No keyboard trap appeared.
- Reduced-motion mode left no non-zero transition or animation duration.
- At 390 px there was no horizontal overflow. A 720 px viewport reflow check
  represented 200% desktop zoom and also had no horizontal overflow.
- Axe found zero serious or critical violations on home, demo, Privacy, Terms,
  404, and offline pages in light and dark modes on phone and desktop.
- `/opt/fleet/lib/verify-url.sh` passed: title, English language, one H1, one
  main, zero missing alt attributes, zero unlabeled buttons, and zero console
  errors.
- Privacy navigation and browser Back focused the destination H1 and announced
  its route title. All discovered links returned below HTTP 400.
- Home, demo, Privacy, Terms, and offline return 200. A random URL returns the
  expected HTTP 404 with a way back. Route titles and metadata are present.

Lighthouse 13.0.1 scored 100 for performance, accessibility, best practices,
and SEO. FCP was 0.9 s, LCP 1.2 s, total blocking time 0 ms, CLS 0, and Speed
Index 0.9 s.

This is a static PWA. Backend tenant isolation, restart persistence, health,
429 handling, and live API allowances do not apply. CLI, library, and desktop
consumer-install checks also do not apply.

## Earlier findings checked again

I read reviews 1–3, polish reports 1–2, both independent verification reports,
and the previous handoff. I repeated the checks below against the live site and
candidate rather than relying on closure notes.

| Earlier finding | Current evidence | Disposition |
| --- | --- | --- |
| F-1-1 first-screen job, audience, action | Fresh phone and desktop first reads pass. | Fixed |
| F-1-2 demo and sandbox | Filled live demo, sticky label, reset, exit, and separate IndexedDB pass. | Fixed |
| F-1-3 missing claims registry | Twelve entries and twelve exact passing commands now exist. F-4-1 is a new completeness finding. | Fixed on original scope |
| F-1-4 DMS and labelled-coordinate leak | `safe-default-export` passes DMS and labelled fixtures. | Fixed |
| F-1-5 attachment metadata leak | The claim decodes and checks JPEG, PNG, WebP, WAV, and MP3 output. | Fixed |
| F-1-6 false default-redaction promise | Tagged redaction claim passes preview and decoded export checks. | Fixed |
| F-1-7 export/import size mismatch | A 12 MB file exports below 20 MB and imports. | Fixed |
| F-1-8 invisible file-picker focus | Actual Tab traversal shows a 3 px outline on both visible labels. | Fixed |
| F-1-9 missing designed 404 | Unknown live URL returns the designed HTTP 404 and return link. F-4-3 is only about its new wording. | Fixed structurally |
| F-1-10 incomplete metadata | All six documents have route metadata, icons, and social fields. | Fixed |
| F-1-11 inconsistent header/footer | All six documents use the shared shell and build id. | Fixed |
| F-1-12 small mobile targets | Repeated 390 px checks pass the 44 px audited targets. | Fixed |
| F-1-13 unclear terminology | The workflow consistently uses record, evidence file, and candidate. | Fixed |
| F-1-14 vague controls | Main actions name their results. | Fixed |
| F-1-15 long or jargon-heavy README copy | Existing sentence audit remains within 22 words. F-4-3 is a separate heading issue. | Fixed on original scope |
| F-2-1 missing backend/update claims | Both entries exist and their exact commands pass. | Fixed |
| F-2-2 missing route focus/announcement | Privacy, Back, 404, and offline route focus scripts pass. | Fixed |
| F-2-3 incomplete 404/offline shell and metadata | Both documents have the shared shell and complete metadata. | Fixed |
| F-2-4 storage jargon and topic button | Live copy says “Backup exports…” and “Show storage details.” | Fixed |
| Verify-2 exact-coordinate prose leak | Decimal, DMS, compact, and labelled text fixtures are redacted. | Fixed |
| Verify-2 original-photo metadata leak | Known image and audio metadata containers are removed. | Fixed |
| Verify-2 invalid coordinate ranges | Invalid values are blocked; valid extrema export with consent. | Fixed |
| Verify-2 cache policy | Hashed assets are immutable; `sw.js` revalidates. | Fixed |
| Verify-3 export/import limit | The shared 12 MB evidence budget round-trips. | Fixed |
| Verify-3 hidden file-input focus | Actual Tab traversal reaches both controls with visible label focus. | Fixed |
| Verify-3 mobile targets | Rechecked at 390 px. | Fixed |
| Verify-3 security headers | CSP, permissions policy, frame denial, nosniff, referrer policy, and HSTS are live. | Fixed |

## Candidate and live deployment

The implementation candidate is `6e3a43d`. Later commits through documentation
SHA `70d22a7` contain reports and evidence only. The live build matches the
candidate byte for byte for:

- root, demo, Privacy, Terms, 404, and offline HTML;
- `sw.js` and `manifest.webmanifest`; and
- `assets/main-DihjSQPw.js` and `assets/main-iZnEG6FL.css`.

The production output is 40.77 kB JavaScript raw, 19.54 kB CSS raw, and 22.35
kB for the mobile AVIF hero. Hashed assets return
`public, max-age=31536000, immutable`; the service worker returns
`no-cache, must-revalidate`.

## Clean-checkout results

Fresh clone: `/tmp/bird-review4-7hyWLs` at the implementation candidate.

```text
npm ci             PASS — 61 packages; 0 vulnerabilities
npm test           PASS — 3 files; 14 tests
npm run typecheck  PASS
npm run lint       PASS
npm run build      PASS — dist/ produced
npm run test:e2e   PASS — 46/46
12 claim commands PASS — 24/24 browser results
```

The independent live audit ran 22 phone/desktop browser results. Twenty
passed. Two failed on the same malformed-import message recorded as F-4-2.

## Missed leverage

No finding. Import and export are present. Sync would conflict with the stated
local-only model unless the privacy contract changed. Automated species
identification would work against the product's purpose of recording evidence
and uncertainty for human review.

## Required next steps

1. Complete the claims registry and tagged proof for the five public statements
   listed in F-4-1.
2. Add a visible, plain recovery message for malformed JSON.
3. Replace the 404 metaphor with “Page not found” and rerun the copy audit.
4. Rerun every claim command and the live phone/desktop review before declaring
   PASS.
