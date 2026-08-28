# Adversarial first-read review 1 — FAIL

Date: 2026-08-28  
Reviewer context: fresh Chromium contexts at 390 × 844 and 1440 × 900; no
existing site data; 30-second first visit.  
Live URL: <https://bird-sighting-proof-card.sociobot.in/>  
Reviewed commit: `a64f19727fa00bb1faf4e967b34b034d2788395e`

## Verdict

**FAIL.** There are blocking findings. In particular, there is no one-click,
isolated sample demo; the stated share-safe location promise is still false for
ordinary DMS text and attachment metadata; and the required claims manifest is
absent. A first-time visitor cannot safely try the product without adding real
evidence.

## Cold first read

Before scrolling, I could infer that this is a bird-observation form that asks
the visitor to keep location vague. I could not answer all required questions:

| Required answer | Result | Evidence |
| --- | --- | --- |
| What does it do? | Partial only | The headline is “Bring the evidence. Blur the coordinates.” It does not name a record, export, or usable result. The supporting sentence says “Package an uncertain bird observation for useful review”, but `proof card` and `package` are undefined. |
| For whom? | No | The first screen never says “birders” or names a person. It says “uncertain bird observation”, which describes data rather than the visitor. |
| What should I click first? | Unsafe / unclear | The only primary control is “Build a proof card ↓”. It scrolls to a blank form and gives no result after clicking. There is no “Try it with sample data” action. |

The 390 px first viewport was visually checked. It is calm, legible, and has no
horizontal overflow, but the visual quality does not repair the missing answer
or the lack of a safe first action. Desktop has the same copy and action.

## Findings

### F-1-1 — BLOCKING — first screen fails the five-second job/action test

**Location/quote:** landing H1, “Bring the evidence. Blur the coordinates.”;
primary link, “Build a proof card ↓”.

**Why this fails:** These are metaphors, not a job in the visitor's words. The
screen does not say who this is for, and the only action opens an empty,
real-data form rather than naming the result or what happens next.

**Concrete fix:** use a ≤9-word job headline, for example **“Make a private
bird-sighting record.”** Follow with **“For birders who need evidence others
can review without sharing an exact nest location.”** Make the primary action
**“Try a sample sighting”** and place **“Opens a filled record you can export”**
beside it. Keep a secondary **“Start a blank record”** action.

### F-1-2 — BLOCKING — no sample demo or sandbox exists

**Location/quote:** landing has no “Try it with sample data”; `/demo` and
`/?demo=1` both return HTTP 200 but render the same blank H1, “Bring the
evidence. Blur the coordinates.” There is no “Demo — sample data, nothing is
saved” banner, “Reset demo”, or “Start for real”.

**Why this fails:** A visitor has to provide a real photo/audio file and
personal observation before seeing an export. There is no way to verify that
demo state is separate from production IndexedDB, no reset, and no offline
sample to exercise. This directly fails the demo and sandbox contract.

**Concrete fix:** add `/demo` (and `?demo=1`) that immediately opens a filled,
realistic sighting: a local sample photo/audio, observation time, broad place,
field marks, candidate, confidence, share-safe preview, and enabled PDF/JSON
actions. Show the persistent required banner and use only a `demo:` storage
namespace. `Reset demo` must reseed only that namespace; `Start for real` must
discard it. Document all three behaviours in `.factory/demo.md` and test that
demo storage never reads/writes real storage, including offline.

### F-1-3 — BLOCKING — no claims registry or executable claim tests

**Location:** `.factory/claims.json` is absent from the repository.

**Why this fails:** There are zero listed claim commands to run from a clean
clone, so required evidence for visitor-facing privacy, offline, storage,
export, and metadata claims does not exist. The clean clone did pass `npm
test` (12 tests) and `npm run build`; this does not substitute for a claims
registry. All of the unlisted claims below are findings, not verified promises.

**Concrete fix:** add one `@claim:<id>` browser test per claim to
`.factory/claims.json`, using only `/demo` and its sample data. Include network
interception for privacy claims and an offline reload for the offline claim.
Delete any sentence that cannot be proved.

### F-1-4 — BLOCKING — previously reported DMS exact-location leak remains

**History:** `.factory/verification-3.md`, P1 “Exact coordinates in common
non-decimal text formats bypass redaction”. There are no prior `review-*.md` or
`polish-*.md` files with F-ids; this is therefore retained under this review's
id while preserving the prior P1 reference.

**Live confirmation:** With default **“Region only — no coordinates”**, one
PNG, a time, a candidate, and place label
`Nest at 58°57'04.4"N 2°45'04.4"W`, the live **SHARE-SAFE PREVIEW** displayed
that exact text verbatim while separately saying **“COORDINATES Withheld”**.

**Code confirmation:** `src/privacy.ts` only recognises decimal degree pairs;
its `coordinatePair` regexp does not match degree-minute-second notation.

**Why this fails:** The preview gives a false safety signal before a sensitive
nest record is shared. The brief explicitly requires that no export include
exact coordinates without opt-in.

**Concrete fix:** redact (or block until explicit exact-location consent) DMS,
degrees-and-decimal-minutes, labelled `lat`/`lon`, and common GPS notation in
every free-text and filename field before preview, PDF, and JSON. Add fixtures
and tests for each representation.

### F-1-5 — BLOCKING — previously reported attachment-metadata GPS leak remains

**History:** `.factory/verification-3.md`, P1 “Default exports retain exact GPS
text in accepted evidence metadata”.

**Live confirmation:** A valid 2 × 2 JPEG with a standard JPEG COM comment
`GPSLatitude=58.951234;GPSLongitude=-2.751234` was accepted with Region only.
The decoded JSON attachment was 333 bytes and still contained that exact text;
the JSON simultaneously had `"location": null`.

**Code confirmation:** `src/media.ts` strips JPEG APP1 and APP13 but preserves
the COM (`0xFE`) segment. `metadataSafeBlob` returns every non-image blob,
including audio, unchanged.

**Why this fails:** `/privacy/` says “JPEG, PNG, and WebP images are copied into
JSON exports with EXIF, XMP, and textual metadata containers removed.” A
visitor can rely on that statement and disclose an exact nesting location.

**Concrete fix:** safely remove JPEG COM and every relevant JPEG/PNG/WebP text
container, or reject the file without exact-location consent. For audio, either
remove location-bearing metadata or block/export only after explicit consent.
Test valid JPEG COM and WAV/other accepted audio metadata fixtures by decoding
the exported attachment, not by searching the base64 JSON text.

### F-1-6 — BLOCKING — the claimed default-export redaction is false

**Location/quote:** README, “Default exports redact coordinate-looking text;
exact coordinates require the explicit exact-location acknowledgement.”

**Why this fails:** F-1-4 proves a normal DMS coordinate survives default
preview/export paths; F-1-5 proves exact GPS text survives an attachment. This
is an unlisted, false privacy claim.

**Concrete fix:** repair F-1-4 and F-1-5, then add a matching claim entry and
test. Until then, replace this with an honest warning that the tool cannot
guarantee removal of location information from free text or audio.

### F-1-7 — BLOCKING — previously reported export/import round-trip limit remains

**History/code confirmation:** `.factory/verification-3.md`, P2. `src/main.ts`
accepts ten 25 MB evidence files but rejects imports over 80 MB. `src/export.ts`
base64-encodes attachments, increasing their size.

**Why this fails:** A valid card can be exported and then rejected by the same
product. This breaks the advertised portable backup path.

**Concrete fix:** set a single safe total attachment budget that guarantees the
encoded export imports, enforce it before attachment acceptance/export, and add
a round-trip boundary test.

### F-1-8 — BLOCKING — previously reported invisible keyboard focus remains

**History/live confirmation:** `.factory/verification-3.md`, P2. In a fresh
390 px keyboard run, Tab 6 focuses `#evidence-files` at 1 × 1 px with
`outline: none`; Tab 38 does the same for `#import-file`. Their visible labels
do not receive focus styling.

**Code confirmation:** `.visually-hidden` clips both inputs to 1 × 1 px;
`src/styles.css` has no `#evidence-files:focus-visible + .file-drop` or
equivalent label rule.

**Why this fails:** Keyboard users cannot see where focus is before opening
either file picker.

**Concrete fix:** either make the inputs visibly focusable or apply the
designed 3 px focus outline to each associated visible label with `:focus` /
`:focus-visible` sibling styling. Add a keyboard geometry/visible-outline test.

### F-1-9 — BLOCKING — no designed 404; arbitrary deep links masquerade as home

**Live confirmation:** `/no-such-page` returns HTTP 200, the home title, and
the home H1 rather than a not-found page. Its `Builder` link becomes
`/no-such-page#builder`.

**Why this fails:** A bad/shared URL looks like a valid landing page, and its
internal anchors are tied to the wrong path. The required designed 404 and
honest routing behaviour do not exist.

**Concrete fix:** create a real styled `/404` with a “Return to the builder”
link, configure unknown paths to return it with a 404 status, and ensure known
routes have correct titles, focus movement, and back-button behaviour.

### F-1-10 — minor — metadata is incomplete on all audited routes

**Live confirmation:** `/` has description and canonical but no OG/Twitter
metadata or Apple touch icon. `/privacy/` and `/terms/` have neither meta
description nor canonical/OG/Twitter metadata. The root title,
“Bird Sighting Proof Card — private, offline evidence packets”, is not a
plain-language “what it does” title.

**Concrete fix:** add per-route descriptions, canonicals, OG/Twitter title +
description + locally hosted 1200 × 630 product artwork, and the declared
180px Apple touch icon. Use, for example, **“Bird Sighting Proof Card — make a
private bird record”** for `/`.

### F-1-11 — minor — shared header/footer contract is not met

**Location:** `/privacy/` and `/terms/` use a different header and a footer
containing only the opposite legal link. They omit the consistent product
one-liner, both Privacy and Terms links, factory attribution, and build id.

**Concrete fix:** render the same compact header (wordmark/home, up to four
links, skip link) and complete footer on every route.

### F-1-12 — minor — mobile touch targets remain below the stated minimum

**History/live confirmation:** `.factory/verification-3.md`, P3. At 390 px the
brand is 147.9 × 36 px; footer Privacy is 46.3 × 19.8 px, Terms is 37.7 × 19.8
px, and Source is 44.0 × 19.8 px.

**Concrete fix:** give all header/footer links a 44 × 44 px hit area without
removing the visible text/link affordance.

### F-1-13 — minor — headings and terminology require context or use jargon

**Location/quotes:** “LOCAL FIELD UTILITY · NO ACCOUNT”, “Plate 01”, “New
evidence route”, “Share-safe preview”, “File and finish”, “Local archive”, and
“Proof Card”.

**Why this fails:** A first-time birder must infer that a `proof card` means a
bird-sighting record. Several headings are decorative or internal workflow
terms, so a screen-reader heading list does not explain the task.

**Concrete fix:** use one term consistently: **record**. Rewrite to “Private
bird record · no account”, “Field illustration”, “Make a bird record”, “Safe
to share preview”, “Save or export this record”, and “Saved records”.

### F-1-14 — minor — non-result-naming controls remain

**Location/quotes:** “Build a proof card ↓”, “Start above”, “Got it”,
“Reload”, and external “Source”.

**Concrete fix:** use “Try a sample sighting” / “Start a blank record”, “Return
to the record”, “Close storage details”, “Reload the updated app”, and “View
source on GitHub (external)”.

### F-1-15 — minor — README has overlong and jargon-heavy sentences

**Location/quotes:** the 24-word introduction (“It brings photos … server.”),
the 29-word test-coverage sentence, the 23-word image-metadata sentence, and
the 25-word deployment-cache sentence exceed the 22-word cap. “local-first”,
“evidence packet”, “IndexedDB”, “EXIF/XMP”, “PWA”, and “clean-directory
routes” are unexplained jargon in visitor-facing prose.

**Concrete fix:** split each long sentence. For example: “Add photos, sound,
time, place, field marks, and candidate notes to one record. Nothing is sent
to a server.” Explain technical terms only in a developer section.

## Claim inventory — every claim currently lacks `claims.json` evidence

Each row is an unlisted-claim finding under F-1-3. The required test column is
the concrete addition needed before the sentence can remain. `FAIL` means the
sentence is disproved by F-1-4/F-1-5; `untested` means no declared claim test
exists, even where a manual spot check happened to pass.

| Status | Location and exact claim | Required sandbox assertion |
| --- | --- | --- |
| untested | Landing: “Ready offline” | First-visit `/demo`, then `setOffline(true)` reload renders its filled sample. |
| untested | Landing: “Evidence stays in this browser until you export.” | Whole `/demo` flow records only same-origin GET requests and no evidence upload. |
| FAIL | Landing: “Photos and audio stay on this device. JSON exports include metadata-sanitized image copies and original audio; PDF exports list file names.” | Decode all exported fixture attachments; prove no exact location unless exact consent. |
| untested | Landing: “We’ll use photo metadata when available; you can correct it.” | Sample JPEG EXIF date pre-fills time; editing it changes the record. |
| untested | Landing: “Location permission is only requested when you press this button.” | Deny permission; assert no prompt before click and recovery after it. |
| untested | Landing: “Your first locally saved field card will appear here.” | Save a demo card; assert it appears only in `demo:` storage. |
| untested | Landing: “JSON may be large because it contains your evidence files.” | Export a sample attachment and assert embedded media exists; ideally state/test a safe total limit. |
| untested | Landing: “Original field illustration created with AI assistance · No tracking” | Provenance record plus a no-third-party/no-analytics request test. |
| untested | README: “An offline, local-first evidence packet builder … without sending evidence to a server.” | Offline demo and complete network-interception test. |
| untested | README: “Keeps drafts, coordinates, photos, and audio in browser IndexedDB.” | Inspect saved sample keys/data in the declared namespace. |
| untested | README: “Accepts up to 10 … files (25 MB each).” | Accept exact boundaries and reject 11th/25,000,001st byte in demo. |
| untested | README: “Reads `DateTimeOriginal` … otherwise suggests the file date.” | EXIF and no-EXIF fixture assertions. |
| FAIL | README: “Withholds coordinates by default … exact coordinates require a separate acknowledgement.” | Test decimal, DMS, labelled, metadata, filename, PDF, JSON, and preview paths. |
| untested | README: “Records field marks … confidence for each.” | Edit each sample field and inspect PDF/JSON output. |
| untested | README: “Produces a compact PDF review sheet or a portable JSON backup.” | Download parseable PDF/JSON and import the same valid maximum-sized export. |
| FAIL | README: “Exported JPEG, PNG, and WebP evidence has EXIF/XMP/text metadata removed; audio remains original.” | Decode valid metadata fixtures; the current JPEG COM case fails. |
| untested | README: “Imports its own v1 JSON format and works after the first visit without a network connection.” | Demo export/import round trip plus offline reload. |
| untested | README: “It does not identify birds, publish sightings, submit to eBird …” | Network interception and UI assertion that no identification/publishing endpoint or result exists. |
| untested | README: “No API keys or backend are required.” | Fresh install/build/run smoke test. |
| untested | README: “There is no account, analytics, tracking, third-party runtime script, or CDN font.” | Whole demo-flow request-origin assertion and DOM scan. |
| untested | README: “Data leaves the device only through a file the user explicitly exports.” | Intercept entire demo flow; assert no evidence-bearing request. |
| FAIL | README: “Default exports redact coordinate-looking text …” | Same exhaustive redaction test as above. |
| untested | README: “Clearing browser site data or uninstalling the PWA can remove local drafts.” | Test site-data clear behaviour or remove this implementation detail. |

## Copy audit

Word counts use whitespace-separated words. This ledger contains every
syntactic sentence in the initially rendered landing content and README prose;
short labels, headings, and controls are audited after it. No landing sentence
exceeds 22 words. README has the four over-cap items identified in F-1-15.

### Landing sentences

| Words | Exact sentence |
| ---: | --- |
| 15 | Package an uncertain bird observation for useful review—with photo, sound, field marks and honest confidence. |
| 7 | You decide how much location to reveal. |
| 8 | Certainty belongs in the notes, not the picture. |
| 8 | Evidence stays in this browser until you export. |
| 16 | Required for a useful card: time, share-safe place, one evidence file and one candidate with confidence. |
| 4 | Drafts can be incomplete. |
| 7 | Photos and audio stay on this device. |
| 14 | JSON exports include metadata-sanitized image copies and original audio; PDF exports list file names. |
| 10 | We’ll use photo metadata when available; you can correct it. |
| 5 | Use a broad, recognizable name. |
| 6 | Never put coordinates in this field. |
| 10 | Location permission is only requested when you press this button. |
| 5 | Adds a visible share-with-care warning. |
| 6 | These are possibilities for review—not identifications. |
| 3 | Not saved yet. |
| 4 | This packet supports review. |
| 6 | It is not an authoritative identification. |
| 8 | Review the visible place and precision before sharing. |
| 10 | JSON may be large because it contains your evidence files. |
| 9 | Your first locally saved field card will appear here. |
| 6 | Evidence for review, not an identification. |
| 10 | Original field illustration created with AI assistance · No tracking. |

Landing non-sentence copy needing the F-1-1/F-1-13/F-1-14 rewrites: “LOCAL
FIELD UTILITY · NO ACCOUNT” (5), “Bring the evidence.” (3), “Blur the
coordinates.” (3), “Build a proof card” (4), “Plate 01” (2), “New evidence
route” (3), “Share-safe preview” (2), “File and finish” (3), “Local archive”
(2), “Start above” (2), “Got it” (2), “Reload” (1), and “Source” (1).

### README sentences

| Words | Exact sentence |
| ---: | --- |
| 14 | An offline, local-first evidence packet builder for birders who are unsure what they observed. |
| 24 | It brings photos, recordings, observation time, deliberately generalized location, field marks, and candidate confidence into one reviewable card without sending evidence to a server. |
| 9 | Keeps drafts, coordinates, photos, and audio in browser IndexedDB. |
| 15 | Accepts up to 10 JPEG, PNG, WebP, M4A, MP3, or WAV files (25 MB each). |
| 15 | Reads `DateTimeOriginal` from ordinary JPEG EXIF metadata when present and otherwise suggests the file date. |
| 4 | Withholds coordinates by default. |
| 19 | Optional 10 km, 1 km, and 100 m settings snap to geographic grids; exact coordinates require a separate acknowledgement. |
| 14 | Records field marks, free-form notes, multiple candidate species, and a low/medium/high confidence for each. |
| 11 | Produces a compact PDF review sheet or a portable JSON backup. |
| 13 | Exported JPEG, PNG, and WebP evidence has EXIF/XMP/text metadata removed; audio remains original. |
| 16 | Imports its own v1 JSON format and works after the first visit without a network connection. |
| 15 | It does not identify birds, publish sightings, submit to eBird, or make an observation authoritative. |
| 5 | Requires Node.js 20 or newer. |
| 7 | Then open the URL printed by Vite. |
| 7 | No API keys or backend are required. |
| 8 | `npm run build` is the production build command. |
| 12 | It writes the static site to `dist/`, with `dist/index.html` at the root. |
| 29 | End-to-end tests use Playwright 1.58.2 and cover desktop, a 390 px-class mobile layout, export safety, IndexedDB persistence, axe accessibility checks in both color schemes, and a real offline reload. |
| 5 | To inspect the production build: |
| 12 | There is no account, analytics, tracking, third-party runtime script, or CDN font. |
| 12 | Data leaves the device only through a file the user explicitly exports. |
| 12 | Default exports redact coordinate-looking text; exact coordinates require the explicit exact-location acknowledgement. |
| 23 | Exported JPEG, PNG, and WebP files have location-capable metadata containers removed, while audio stays original and should be handled like the source file. |
| 8 | See `/privacy/` and `/terms/` in the built site. |
| 12 | Clearing browser site data or uninstalling the PWA can remove local drafts. |
| 6 | Export JSON for a portable backup. |
| 17 | Deploy the contents of `dist/` as a static site with clean-directory routes enabled for `/privacy/` and `/terms/`. |
| 25 | The shipped `staticwebapp.config.json` configures Azure Static Web Apps to revalidate `sw.js` and the manifest while caching hashed files under `assets/` for one year as immutable. |
| 12 | The topographic-cartography visual system and original illustration prompt/provenance are documented in [`.factory/design.md`](.factory/design.md). |
| 16 | The source illustration is kept under `assets/src/`; optimized AVIF and WebP renditions ship in the PWA. |
| 4 | MIT — see [LICENSE](LICENSE). |

README headings are also not independently meaningful in a screen-reader list:
“What it does”, “Run locally”, “Test and build”, and “Privacy and data
ownership”. Prefix them with “Bird Sighting Proof Card:” or use concrete
subjects, such as “Save a bird-sighting record locally”.

## History confirmation

I read every prior applicable document in `.factory`: `handoff.md`,
`verification.md`, and `verification-3.md`. There are no earlier
`review-*.md` or `polish-*.md` files. The prior P1/P2/P3 findings were checked
against both live behaviour and source, not accepted as fixed merely because
some local regression tests pass:

| Earlier finding | Current state |
| --- | --- |
| Verify-2 P1: decimal place-label leak | Fixed for the tested adjacent decimal-pair case only; current DMS bypass is F-1-4. |
| Verify-2 P1: EXIF GPS in JSON | Partially repaired for APP1, but ordinary JPEG COM and unchanged audio remain: F-1-5. |
| Verify-2 P2: invalid coordinates | Fixed: `validCoordinates` and export validation reject the tested out-of-range values. |
| Verify-2 P2: cache headers | Fixed in configuration/live prior evidence; not a current finding. |
| Verify-3 P1: DMS bypass | Unfixed: F-1-4. |
| Verify-3 P1: image/audio metadata | Unfixed: F-1-5. |
| Verify-3 P2: export larger than import | Unfixed in source: F-1-7. |
| Verify-3 P2: hidden picker focus | Unfixed live: F-1-8. |
| Verify-3 P3: small link targets | Unfixed live: F-1-12. |
| Verify-3 P3: CSP/Permissions-Policy/framing | Still absent from `staticwebapp.config.json`; add CSP, `Permissions-Policy`, and `frame-ancestors`/framing protection as hardening. |

## Checks completed

- Fresh live browser contexts at 390 px and desktop; no console/page errors;
  normal-scale mobile page width equals 390 px.
- `/`, `/privacy/`, `/terms/`, `/demo`, `/no-such-page`, manifest, offline
  page, robots, and sitemap returned HTTP 200. All discovered first-party and
  GitHub source links resolved.
- First-visit service-worker offline reload succeeded and only the site origin
  was requested. This is a manual result, not a declared claim test.
- Axe on `/`, `/privacy/`, and `/terms/` at mobile width returned no
  serious/critical violations. Manual keyboard testing found F-1-8.
- Fresh local clone at `a64f197`: `npm ci`, `npm test` (12/12), and `npm run
  build` passed. The full E2E command was started twice; its initial cases
  passed, but the verifier runner terminated each 30-second captured command
  before a final summary, so it is not recorded as a complete pass.
- The topographic cartographic surface is specific to the product and does not
  present as a generic gradient/SaaS template. This is not a substitute for the
  blocked functional and trust requirements.

## What would make this perfect

Ship a one-click, resettable, offline sample record that cannot touch real
storage; make all location and attachment exports genuinely safe by default;
back every remaining visitor promise with a clean-demo claim test; then replace
the metaphoric first screen with a plain birding job, person, and outcome.
Complete the 404, per-route metadata, consistent legal skeleton, keyboard file
picker focus, touch targets, and export/import capacity before requesting a
new first-read review.
