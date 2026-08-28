# Adversarial first-read review 3 — PASS

Date: 2026-08-28
Live URL: <https://bird-sighting-proof-card.sociobot.in/>
Reviewed commit: `25de19f53ac3747c007971186590587ef1b3d8a6`

## Verdict

**PASS.** There are zero findings, no failing claim, and no untested claim.
The cold first screen is clear, the one-click demo is realistic and isolated,
all twelve registered claims pass from a clean clone, and every earlier review
finding is fixed in both the live site and current code.

## Cold first read

Fresh Chromium contexts opened the live root at 390 × 844 and 1440 × 900. I
did not scroll before recording the result.

| Question | Mobile and desktop answer | Exact first-screen evidence |
| --- | --- | --- |
| What does this do? | Makes a private bird-sighting record. | H1: “Make a private bird-sighting record” |
| For whom? | Birders who want another person to review evidence without exposing an exact nest location. | “For birders who need evidence others can review without sharing an exact nest location.” |
| What should I click first? | Open the filled sample. | “Try it with sample data” and “Opens a filled record you can export.” |

The same first-screen answers were present at both sizes. The phone viewport
also showed “Start a blank record” and all three short facts. It had no
horizontal overflow. Neither cold load produced a console or page error.

## Demo and sandbox

The root action opened `/demo/` in one click and scrolled to the working form.
The first resulting phone viewport already showed the product in use: the
persistent **“Demo — sample data, nothing is saved to your records.”** banner,
the filled record heading, and two named evidence files. The full sample had:

- title “Distant wader at Deerness”;
- photo `dawn-marsh-observation.webp` and audio `shore-call-note.wav`;
- “Deerness coast, Orkney,” a time, rounded coordinates, field notes, field
  marks, and sensitive-site status;
- Dunlin at medium confidence and Sanderling at low confidence; and
- enabled PDF and JSON exports.

I first saved “Reviewer retained record” in real mode. In demo mode I changed
the sample title, selected **Reset demo**, and confirmed the original sample
returned. I then selected **Start for real** and confirmed the real title
returned at `/#builder`. Browser database inspection showed
`bird-proof-card` and `demo:bird-proof-card` while the demo was open, then
only `bird-proof-card` after leaving it. This confirms reset and exit remove
the demo namespace without replacing real records.

During live demo save and JSON export, every request was a same-origin GET;
none carried authorization. The exported file contained the two named sample
attachments. After the service worker controlled the page, I blocked the
network and reloaded. The filled sample, demo banner, and **“Offline now”**
status remained. No console or page error occurred.

## Claims

I cloned the repository with `git clone --no-local` into
`/tmp/bird-review3-tBwNWk`. The clone was clean at the reviewed commit before
installation. `npm ci`, `npm test` (14 tests), and `npm run build` all passed;
`dist/` was produced. I then ran every exact command in
`.factory/claims.json` separately.

| Claim id | Exact manifest command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS — desktop + 390 px |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — desktop + 390 px |
| `local-only-network` | `npm run test:e2e -- --grep @claim:local-only-network` | PASS — desktop + 390 px |
| `safe-default-export` | `npm run test:e2e -- --grep @claim:safe-default-export` | PASS — desktop + 390 px |
| `photo-time-prefill` | `npm run test:e2e -- --grep @claim:photo-time-prefill` | PASS — desktop + 390 px |
| `geolocation-on-click` | `npm run test:e2e -- --grep @claim:geolocation-on-click` | PASS — desktop + 390 px |
| `portable-exports` | `npm run test:e2e -- --grep @claim:portable-exports` | PASS — desktop + 390 px |
| `no-identification-or-publishing` | `npm run test:e2e -- --grep @claim:no-identification-or-publishing` | PASS — desktop + 390 px |
| `free-no-account` | `npm run test:e2e -- --grep @claim:free-no-account` | PASS — desktop + 390 px |
| `original-art-provenance` | `npm run test:e2e -- --grep @claim:original-art-provenance` | PASS — desktop + 390 px |
| `no-api-or-backend` | `npm run test:e2e -- --grep @claim:no-api-or-backend` | PASS — desktop + 390 px |
| `app-update` | `npm run test:e2e -- --grep @claim:app-update` | PASS — desktop + 390 px |

The landing page, Privacy page, and README claims map to these entries. The
feature descriptions are exercised by the associated field, boundary,
export, privacy, offline, or no-publishing tests. There is no claim-like
sentence without an entry.

## Earlier findings rechecked

I read review 1, review 2, polish 1, polish 2, both verification reports, and
the previous handoff. The following checks were repeated rather than inferred
from the polish reports.

| Earlier id | Live and code confirmation | Status |
| --- | --- | --- |
| F-1-1 | The live H1 names the job, the lede names birders, and the sample action names its result; `src/main.ts` contains the same copy. | Fixed |
| F-1-2 | Live `/demo/` is filled and has banner/reset/exit controls; `src/db.ts` selects `demo:bird-proof-card`. | Fixed |
| F-1-3 | `.factory/claims.json` contains twelve entries and every exact command passed. | Fixed |
| F-1-4 | `@claim:safe-default-export` passes DMS and labelled-coordinate cases; `src/privacy.ts` covers decimal, DMS, compact, and labelled pairs. | Fixed |
| F-1-5 | The same claim decodes JPEG, PNG, WebP, WAV, and MP3 outputs; `src/media.ts` removes their known metadata containers. | Fixed |
| F-1-6 | The default-redaction promise is registered and the decoded export assertion passes. | Fixed |
| F-1-7 | A 12 MB export round-trips; `src/limits.ts` enforces a 12 MB evidence budget and 20 MB import ceiling. | Fixed |
| F-1-8 | Live focus gives both visible file labels a 3 px outline; `src/polish.css` and `src/styles.css` provide the focus rules. | Fixed |
| F-1-9 | A random live URL returns HTTP 404 with “This trail ends off the map”; the response override points to the designed page. | Fixed |
| F-1-10 | Home, demo, Privacy, Terms, 404, and offline have route titles, descriptions, canonicals, OG/Twitter data, SVG favicon, and Apple icon. | Fixed |
| F-1-11 | Every checked route has one shared-style header and footer with Privacy, Terms, factory credit, and build id. | Fixed |
| F-1-12 | At 390 px, the brand and all footer links measured at least 44 px high. | Fixed |
| F-1-13 | The visitor-facing workflow consistently calls the saved object a record and explains candidates as possible species. | Fixed |
| F-1-14 | Primary and workflow controls name results, including sample, save, PDF, JSON, reset, exit, and update actions. | Fixed |
| F-1-15 | The fresh copy audit below has no sentence over 22 words and no banned marketing word. | Fixed |
| F-2-1 | `no-api-or-backend` and `app-update` now have manifest entries and passing observable tests. | Fixed |
| F-2-2 | Live Privacy navigation and browser Back focus the destination H1 and update the polite route announcement; route scripts implement this. | Fixed |
| F-2-3 | Live 404 and offline pages have complete metadata and the shared shell; their source documents match. | Fixed |
| F-2-4 | Live copy says “Backup exports remove known location details from supported files” and the control says “Show storage details.” | Fixed |

The earlier verification defects are also closed: coordinate-range validation,
text and attachment redaction, export/import sizing, file-picker focus, mobile
targets, immutable hashed-asset caching, service-worker revalidation, CSP,
permissions policy, framing policy, nosniff, and referrer policy were all
confirmed in current code or live responses.

## Structure, links, and accessibility

- `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, and `/offline.html`
  each have English language, one H1, one main landmark, a route-specific
  title no longer than 53 characters, description, canonical, OG/Twitter
  fields, favicon, Apple icon, header, and footer.
- A random deep link returns the designed page with HTTP 404. The 404 action
  returns to `/#builder`. Privacy navigation and browser Back preserve the
  correct URL, focus the H1, and announce the title.
- Every discovered internal link, the source link, icons, social image,
  `robots.txt`, and `sitemap.xml` returned 200. The sitemap lists all
  indexable routes.
- Live axe checks found zero serious or critical violations on all six real
  documents. Root and demo cold loads had no console errors. The phone layout
  was exactly 390 CSS pixels wide, and reduced motion produced a `0s`
  transition duration.
- The original cartographic field-notebook art, contour texture, survey
  accents, paper/ink palette, serif/sans pairing, and linear waypoint form are
  visibly specific to this product. It does not resemble a generic centered
  SaaS hero or feature-card template.
- The production build emits 40.77 kB of JavaScript raw (14.06 kB gzip), well
  inside the static-product budget. The social image is 1200 × 630 and the
  Apple icon is 180 × 180.

## Copy audit

Counts use whitespace-separated words. This is a fresh ledger of every
sentence in the initially rendered landing document, including conditional
dialogs/toasts, followed by every README prose sentence.

### Landing page sentences

| Words | Sentence |
| ---: | --- |
| 14 | For birders who need evidence others can review without sharing an exact nest location. |
| 7 | Opens a filled record you can export. |
| 3 | Free to use. |
| 6 | Works offline after your first visit. |
| 9 | Your evidence stays on this device until you export. |
| 8 | Put certainty in your notes, not the picture. |
| 9 | Photos, audio, and saved records stay in this browser. |
| 5 | Record what another birder needs. |
| 10 | Add a time, broad place, evidence file, and possible species. |
| 6 | You can save an incomplete record. |
| 5 | Files stay on this device. |
| 9 | Backup exports remove known location details from supported files. |
| 4 | No evidence attached yet. |
| 5 | When did you observe it? |
| 10 | We’ll use photo metadata when available; you can correct it. |
| 5 | Use a broad, recognizable name. |
| 6 | Never put coordinates in this field. |
| 10 | Location permission is only requested when you press this button. |
| 5 | Adds a visible share-with-care warning. |
| 3 | Exact means exact. |
| 11 | This can expose a nest, roost, private property or your home. |
| 7 | The unrounded coordinates will appear in exports. |
| 8 | I understand and choose to include exact coordinates. |
| 6 | These are possibilities for review—not identifications. |
| 3 | Not saved yet. |
| 3 | None recorded yet. |
| 4 | No observation notes yet. |
| 4 | No candidates added yet. |
| 4 | No files attached yet. |
| 4 | This record supports review. |
| 6 | It is not an authoritative identification. |
| 6 | Check the visible place before sharing. |
| 8 | JSON includes sanitized copies of your evidence files. |
| 11 | A record appears here after you save it on this device. |
| 2 | Add evidence. |
| 9 | Attach a photo or recording and check the time. |
| 4 | Choose what to share. |
| 8 | Keep coordinates hidden or choose a rounded area. |
| 3 | Export the record. |
| 9 | Download a PDF to review or JSON to keep. |
| 13 | It does not identify a bird, publish a sighting, or prove a species. |
| 3 | Nothing is uploaded. |
| 7 | Records and evidence stay in this browser. |
| 7 | Export JSON if you need a backup. |
| 4 | PDF lists evidence names. |
| 7 | JSON includes sanitized copies of supported files. |
| 5 | An app update is ready. |
| 7 | Make a reviewable record without publishing it. |
| 7 | Original field illustration created with AI assistance. |

### README sentences

| Words | Sentence |
| ---: | --- |
| 13 | Make a private bird-sighting record with photos, sound, field marks, and honest confidence. |
| 7 | Choose how much location an export reveals. |
| 13 | It is for birders who want another person to review an uncertain sighting. |
| 7 | It does not identify or publish birds. |
| 8 | Add JPEG, PNG, WebP, MP3, or WAV evidence. |
| 10 | A record can hold ten files and 12 MB total. |
| 7 | Read a JPEG capture time when available. |
| 6 | You can correct the suggested time. |
| 5 | Keep coordinates hidden by default. |
| 6 | Rounded choices share an area instead. |
| 8 | Add field marks, notes, possible species, and confidence. |
| 10 | Download a PDF review sheet or an importable JSON backup. |
| 10 | Remove known location metadata containers from supported JSON evidence copies. |
| 6 | The free tool needs no account. |
| 9 | Records use private browser storage and are never uploaded. |
| 4 | Open `/demo/` or `/?demo=1`. |
| 13 | The filled sample includes a photo, sound, place, notes, and two possible species. |
| 8 | The demo uses the separate `demo:bird-proof-card` browser database. |
| 8 | Resetting or leaving it deletes only demo records. |
| 9 | See `.factory/demo.md` for the exact sample and reset behavior. |
| 5 | Use Node.js 20 or newer. |
| 7 | Open the local address printed by Vite. |
| 7 | No API key or backend is needed. |
| 5 | The claim registry is `.factory/claims.json`. |
| 11 | Each listed command runs one browser test against the isolated demo. |
| 9 | The production build writes the static product to `dist/`. |
| 12 | JavaScript, accessibility, mobile layout, privacy, exports, and offline reload have automated checks. |
| 12 | The app has no analytics, advertising, third-party scripts, or remote data store. |
| 7 | Runtime requests stay on the product’s origin. |
| 10 | Default exports redact common coordinate formats in names and notes. |
| 6 | Exact coordinates need a separate acknowledgement. |
| 9 | JSON copies remove known metadata containers from supported files. |
| 12 | Always inspect an export for visual or uncommon location clues before sharing. |
| 11 | Deleting browser site data also deletes records without an exported backup. |
| 9 | Use JSON export when you need a portable copy. |
| 7 | Read the shipped privacy and terms pages. |
| 5 | Deploy the contents of `dist/`. |
| 15 | The supplied Azure Static Web Apps config sets route, cache, content, framing, and permission policies. |
| 9 | The service worker caches the main routes and sample. |
| 10 | It reloads the filled demo after the first online visit. |
| 8 | The cartographic field-notebook system is documented in `.factory/design.md`. |
| 9 | The source illustration and generation details live under `assets/src/`. |
| 4 | MIT — see `LICENSE`. |

### Headings and actions

The landing headings make sense out of context: “Make a private bird-sighting
record,” “Record what another birder needs,” “Add what you captured,” “When
did you observe it?”, “Share the place, not the nest,” “Describe what you saw
and heard,” “Keep uncertainty visible,” “Name this bird record,” “Uncertain
bird sighting,” “Records on this device,” “Make evidence easier to review,”
“What this record never does,” and “Nothing is uploaded.” README headings also
name their sections directly.

All task controls name their result: **Try it with sample data**, **Start a
blank record**, **Add photo or audio**, **Use my current location**, **Add
another candidate**, **Save on this device**, **Start a new record**,
**Download PDF**, **Export JSON + media**, **Import JSON**, **Show storage
details**, **Close storage details**, **Reset demo**, **Start for real**, and
**Reload the updated app**. Dynamic removal controls include the evidence or
candidate name in their accessible label.

No sentence exceeds 22 words. There is no banned marketing adjective, unclear
heading, inconsistent product term, or non-result-naming task control. JSON,
PDF, JPEG, PNG, WebP, MP3, WAV, IndexedDB, and service worker appear only where
they name a file format, storage implementation, or developer concern.

## Missed leverage

No finding. Import and export are present. Sync would contradict the stated
local-only model unless the product and privacy contract changed. An automated
species suggestion is not implied by the brief and would work against the
tool’s explicit role: recording evidence and uncertainty for human review.
There is no decorative runtime AI feature and no provider key in the product;
the AI-assisted original illustration is build-time art with disclosed
provenance.

## What would make this perfect

Nothing remains to change for this review. Continue rerunning the registered
claims and live cold checks whenever product copy, storage, export sanitation,
or service-worker behavior changes.
