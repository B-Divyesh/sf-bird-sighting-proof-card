# Adversarial first-read review 2 — FAIL

Date: 2026-08-28
Live URL: <https://bird-sighting-proof-card.sociobot.in/>
Reviewed commit: `d4d5a7a2d3eb2cd8acad2e64b1102930ee3de3b2`

## Verdict

**FAIL.** The product passes the cold-read and demo checks, and all ten
declared claims pass. Two visitor-facing promises are not in the claims
ledger; route focus, two document shells, and one piece of storage copy also
remain incomplete.

## Cold first read

Fresh, empty Chromium contexts at 390 × 844 and 1440 × 900 showed the same
answer before scrolling: this makes a private bird-sighting record for birders
who want review without sharing an exact nest location. The obvious first
action is **“Try it with sample data”**; adjacent copy says **“Opens a filled
record you can export.”** The 390 px viewport had no horizontal overflow. This
passes the what / who / first-click test.

## Findings

### F-2-1 — BLOCKING — two operational promises have no claims entry or test

**Quote/location:** README: “No API key or backend is needed.” Landing update
toast: “An app update is ready.”

`.factory/claims.json` has no `no-api-or-backend` or `app-update` claim, and
no test is tagged for either. A visitor can rely on both. Nearby privacy and
offline tests do not make either an explicitly listed, observable promise.

**Fix:** delete these statements or add one claim/test each. The first must
intercept a fresh demo save/export and prove no credential or backend request
is required. The second must install a changed service-worker fixture, expose
the toast, activate **“Reload the updated app”**, and prove the new controlled
page loads. Add the locations to `where`.

### F-2-2 — minor — route changes leave focus on body and make no announcement

**Quote/location:** Home header link “Privacy” → `/privacy/`.

Live browser evidence after following the link: URL was `/privacy/`,
`document.activeElement` was `BODY`, the destination h1 had no `tabindex`, and
there was no `[aria-live]` route message. Terms and 404 use the same document
pattern. A keyboard/screen-reader visitor has no reliable cue that content
changed.

**Fix:** on every document route, give h1 `tabindex="-1"`, focus it on load,
and announce the page title through one polite live region. Test Home → Privacy
→ Back and unknown URL → 404.

### F-2-3 — minor — 404 and offline pages lack complete metadata and shell

**Location:** `/404.html`, `/offline.html`.

Both live pages have a title, description, and h1 but lack canonical, OG,
Twitter, and manifest tags. `/offline.html` also has a separate bare header and
footer instead of the wordmark, main navigation, and shared product footer.
The offline fallback is a real user-facing route.

**Fix:** add route-specific canonical/social metadata, favicon/apple icon, and
manifest to both. Give offline the shared wordmark, skip link, navigation,
Privacy/Terms, factory attribution, and build id while retaining its offline
h1/action.

### F-2-4 — minor — storage copy uses jargon and a topic-named button

**Quote/location:** Evidence hint: “Files stay on this device. JSON exports
remove known location metadata from supported files.” Button: “How storage
works”.

“JSON” and “metadata” ask a first-time birder to know storage vocabulary before
attaching evidence. The button describes a topic instead of its result.

**Fix:** write “Backup exports remove known location details from supported
files.” Rename the button **“Show storage details”**. Keep “JSON” beside the
download control where it identifies the actual file type.

## Demo, privacy, claims, and structure

`/demo/` opened directly into a filled builder, not an empty form. At 390 px it
showed the required banner, **Reset demo**, **Start for real**, “Distant wader
at Deerness”, two local evidence files, two possible species, broad place,
rounded location, notes, and enabled PDF/JSON actions. There were no console
errors. Initial requests were same-origin GETs plus a same-origin blob preview.

The demo isolation test saved a real record, changed/reset the demo, left it,
and confirmed the real record returned. Code selects `demo:bird-proof-card`
before its first database read/write. Offline reload waited for the service
worker, made the context offline, reloaded, and found the filled sample plus
“Offline now”. Local-only interception accepted only same-origin GETs during
demo save/export. The demo sandbox passes.

Fresh clone used: `/tmp/bird-review-2-DhaebI`, created with
`git clone --no-local /work/repo`, clean before `npm ci`.

| Claim id | Result from exact manifest command |
| --- | --- |
| `demo-isolation` | PASS, desktop + 390 px |
| `offline-reload` | PASS, desktop + 390 px |
| `local-only-network` | PASS, desktop + 390 px |
| `safe-default-export` | PASS, desktop + 390 px; DMS and JPEG/PNG/WebP/WAV/MP3 fixtures |
| `photo-time-prefill` | PASS, desktop + 390 px |
| `geolocation-on-click` | PASS, desktop + 390 px |
| `portable-exports` | PASS, desktop + 390 px; PDF header and 12 MB round trip |
| `no-identification-or-publishing` | PASS, desktop + 390 px |
| `free-no-account` | PASS, desktop + 390 px |
| `original-art-provenance` | PASS, desktop + 390 px |

`npm test` passed 14 tests. `npm run build` passed and produced `dist/`. No
declared claim failed. No AI runtime feature is needed: the product explicitly
does not identify birds, and the brief does not imply an AI step. Import/export
is present; sync would conflict with the local-first promise.

Home, demo, Privacy, and Terms have titles, descriptions, canonicals, social
cards, favicon/apple icon, and one h1. `/no-such-page` returns the designed
page, “This trail ends off the map”, with HTTP 404. `robots.txt` and
`sitemap.xml` exist. Crawling every link across home, demo, Privacy, Terms,
404, and offline returned 200 for internal targets and the external source.
The cartographic field-notebook identity is distinct and not a generic SaaS
template.

## Earlier findings rechecked

| Earlier finding(s) | Current live/code confirmation | Status |
| --- | --- | --- |
| F-1-1, F-1-2 | Plain first screen and filled isolated demo are present. | Fixed |
| F-1-3 | Ten-entry claims registry and tagged browser tests exist. | Fixed |
| F-1-4, F-1-5, F-1-6 | DMS/text and metadata redaction fixture claim passes. | Fixed |
| F-1-7 | 12 MB total evidence JSON round-trips under CSP. | Fixed |
| F-1-8 | Both file labels expose 3 px focus outlines. | Fixed |
| F-1-9 | Unknown path returns designed HTTP 404. | Fixed |
| F-1-10 | Audited primary routes have complete metadata; F-2-3 is a new 404/offline exception. | Fixed on original scope |
| F-1-11, F-1-12 | Privacy/Terms share shell and mobile targets meet 44 px. | Fixed |
| F-1-13, F-1-14 | Record terminology and outcome-named main controls are clear; F-2-4 is remaining storage control. | Fixed on original scope |
| F-1-15 | README has no sentence over 22 words. | Fixed |
| Verify-2, Verify-3 | Range validation, cache, privacy, import, focus, targets, and security checks pass. | Fixed |

## Copy audit

Whitespace word counts; short labels/headings are in the last table. No
sentence exceeds 22 words or uses a banned marketing adjective. F-2-4 flags
the sole jargon/control issue.

### Landing sentences

| Words | Sentence |
| ---: | --- |
| 14 | For birders who need evidence others can review without sharing an exact nest location. |
| 7 | Opens a filled record you can export. |
| 3 | Free to use. |
| 7 | Works offline after your first visit. |
| 9 | Your evidence stays on this device until you export. |
| 8 | Put certainty in your notes, not the picture. |
| 7 | Photos, audio, and saved records stay in this browser. |
| 10 | Add a time, broad place, evidence file, and possible species. |
| 6 | You can save an incomplete record. |
| 6 | Files stay on this device. |
| 10 | JSON exports remove known location metadata from supported files. |
| 5 | When did you observe it? |
| 10 | We’ll use photo metadata when available; you can correct it. |
| 5 | Use a broad, recognizable name. |
| 6 | Never put coordinates in this field. |
| 10 | Location permission is only requested when you press this button. |
| 3 | Exact means exact. |
| 11 | This can expose a nest, roost, private property or your home. |
| 7 | The unrounded coordinates will appear in exports. |
| 8 | I understand and choose to include exact coordinates. |
| 6 | These are possibilities for review—not identifications. |
| 3 | Not saved yet. |
| 4 | No evidence attached yet. |
| 3 | None recorded yet. |
| 4 | No observation notes yet. |
| 4 | No candidates added yet. |
| 4 | No files attached yet. |
| 4 | This record supports review. |
| 6 | It is not an authoritative identification. |
| 6 | Check the visible place before sharing. |
| 8 | JSON includes sanitized copies of your evidence files. |
| 9 | A record appears here after you save it on this device. |
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
| 6 | Read a JPEG capture time when available. |
| 6 | You can correct the suggested time. |
| 6 | Keep coordinates hidden by default. |
| 5 | Rounded choices share an area instead. |
| 8 | Add field marks, notes, possible species, and confidence. |
| 9 | Download a PDF review sheet or an importable JSON backup. |
| 10 | Remove known location metadata containers from supported JSON evidence copies. |
| 7 | The free tool needs no account. |
| 9 | Records use private browser storage and are never uploaded. |
| 5 | Open `/demo/` or `/?demo=1`. |
| 14 | The filled sample includes a photo, sound, place, notes, and two possible species. |
| 8 | The demo uses the separate `demo:bird-proof-card` browser database. |
| 8 | Resetting or leaving it deletes only demo records. |
| 11 | See `.factory/demo.md` for the exact sample and reset behavior. |
| 6 | Use Node.js 20 or newer. |
| 9 | Open the local address printed by Vite. |
| 7 | No API key or backend is needed. |
| 7 | The claim registry is `.factory/claims.json`. |
| 12 | Each listed command runs one browser test against the isolated demo. |
| 10 | The production build writes the static product to `dist/`. |
| 11 | JavaScript, accessibility, mobile layout, privacy, exports, and offline reload have automated checks. |
| 12 | The app has no analytics, advertising, third-party scripts, or remote data store. |
| 8 | Runtime requests stay on the product’s origin. |
| 9 | Default exports redact common coordinate formats in names and notes. |
| 7 | Exact coordinates need a separate acknowledgement. |
| 10 | JSON copies remove known metadata containers from supported files. |
| 13 | Always inspect an export for visual or uncommon location clues before sharing. |
| 10 | Deleting browser site data also deletes records without an exported backup. |
| 9 | Use JSON export when you need a portable copy. |
| 8 | Read the shipped privacy and terms pages. |
| 4 | Deploy the contents of `dist/`. |
| 13 | The supplied Azure Static Web Apps config sets route, cache, content, framing, and permission policies. |
| 9 | The service worker caches the main routes and sample. |
| 9 | It reloads the filled demo after the first online visit. |
| 9 | The cartographic field-notebook system is documented in `.factory/design.md`. |
| 11 | The source illustration and generation details live under `assets/src/`. |
| 4 | MIT — see `LICENSE`. |

### Landing headings and controls

| Type | Text | Words |
| --- | --- | ---: |
| Headline | Make a private bird-sighting record | 5 |
| Heading | Record what another birder needs | 6 |
| Heading | Add what you captured | 4 |
| Heading | Share the place, not the nest | 7 |
| Heading | Describe what you saw and heard | 7 |
| Heading | Keep uncertainty visible | 3 |
| Heading | Name this bird record | 4 |
| Heading | Make evidence easier to review | 6 |
| Heading | What this record never does | 5 |
| Button | Try it with sample data | 5 |
| Button | Start a blank record | 5 |
| Button | Add photo or audio | 5 |
| Button | Use my current location | 5 |
| Button | Save on this device | 5 |
| Button | Download PDF | 2 |
| Button | Export JSON + media | 4 |
| Button (flagged) | How storage works | 3 |

## What would make this perfect

Register/test the two remaining promises, complete route focus/announcements,
bring 404/offline into the route shell, and replace the storage jargon. Then a
fresh visitor would have a clear, safe, test-backed and accessible path with no
remaining finding.
