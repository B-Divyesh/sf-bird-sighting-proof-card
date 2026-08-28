# Independent verification — FAIL

Date: 2026-08-28  
Work order: `bird-sighting-proof-card-verify-2`  
Candidate commit: `9261d9f29c902221bdaef0a45bff984234ea1138`  
Live URL: <https://bird-sighting-proof-card.sociobot.in/>  
Verdict: **FAIL**

This is an independent clean-checkout verification. The live document, JS,
CSS, and service worker each matched the candidate production build byte for
byte, so live findings apply to the stated candidate.

## Blocking defects

### P1 — Exact coordinates can be exported without the exact-location opt-in

The brief's success measure is explicit: no exported card may include exact
coordinates unless the user opts in. On the live site, I completed a valid
card with the default **Region only — no coordinates** selection, no latitude
or longitude fields, and this place label:

`Nest location 58.951234, -2.751234`

The downloaded JSON contained:

```json
{
  "placeLabel": "Nest location 58.951234, -2.751234",
  "location": null
}
```

The precise coordinate string was therefore exported despite no exact-location
acknowledgement. The same unfiltered `placeLabel` is put on the PDF's `Place:`
line. The UI only provides advisory copy saying not to put coordinates there;
it does not detect, block, redact, or require acknowledgement for them.

### P1 — Default JSON export retains GPS metadata in original photos

The JSON exporter encodes every evidence blob unchanged as a data URL
(`src/export.ts`, `jsonBlob`); it does not strip or inspect image metadata.
Consequently, a JPEG with EXIF GPS is exported with its exact coordinates even
when the UI's exported `location` is `null` and exact location was never
acknowledged. The candidate README confirms that the JSON contains original
media and may reveal embedded metadata. This independently violates the same
no-exact-coordinates-without-opt-in measure for a core photo-evidence flow.

### P2 — Invalid latitude/longitude values export as exact locations

The form uses `novalidate` and export validation does not test coordinate
ranges. On the live candidate I entered latitude `91` and longitude `181`,
selected Exact, acknowledged the warning, and exported a valid JSON file. It
contained:

```json
{"latitude":91,"longitude":181,"precision":"Exact coordinates — sensitive"}
```

The product should reject or clearly recover from values outside latitude
`[-90, 90]` and longitude `[-180, 180]`; accepting impossible location data
undermines an evidence packet's review value.

### P2 — Live hashed assets are not long-lived immutable cached

The deployed JS and CSS response headers use `Cache-Control: public,
must-revalidate, max-age=30`, rather than immutable long-lived caching for
hashed assets. `/sw.js` has the same 30-second policy rather than the
documented revalidation policy. The local service-worker cache makes offline
reload work, but this misses the PWA performance/caching contract for the
actual deployment.

## Checks that passed

### Clean candidate checkout and build

A fresh clone was detached at exactly
`9261d9f29c902221bdaef0a45bff984234ea1138`; it was clean before installation.

```sh
npm ci                 # 0 audit vulnerabilities
npm test               # 2 files, 5 tests passed
npm run build          # TypeScript check + Vite build passed; dist/ produced
npm run test:e2e       # 8 Playwright tests passed (desktop and Pixel 5)
```

There is no separate lint script. Type checking is part of the exact
production build command.

Build output met the static payload budgets: main JS was 31,065 bytes
(11,080 gzip), CSS 17,609 bytes (4,900 gzip), and the mobile AVIF hero was
22,353 bytes. No third-party runtime request, CDN font, analytics, or tracking
request was observed.

### Representative end-to-end browser checks on the live deployment

- Created, saved, reloaded, and exported a normal card with JPEG evidence,
  date/time, place, field mark, candidate, and medium confidence. Default
  export had `location: null`.
- Unsupported file recovery: a text file produced
  `not-a-photo.txt is not a supported photo or audio format.`
- Boundary recovery: a 25,000,001-byte JPEG produced
  `too-large.jpg is over the 25 MB per-file limit.`
- Remote-reference import recovery: an otherwise-shaped import containing
  `https://example.com/remote.jpg` was rejected with
  `Imported evidence must be embedded in the JSON file.`
- Live page console errors: 0. Page errors: 0. Cross-origin runtime requests:
  0.
- Axe scan of the live page: 0 serious/critical findings in both light and
  dark schemes (in fact 0 violations in either scan).
- Desktop keyboard smoke check: first Tab focused the visible “Skip to
  builder” link with a 3px amber outline. Main page had exactly one `h1` and
  one `main`; interactive primary control focus had a 3px visible outline.
- At 390px the page's document/body scroll width was exactly 390px, primary
  button min-height was 46px, and the builder used one column. Under reduced
  motion the primary button transition duration was `0s`.
- PWA: live registration controlled the page at `/sw.js`; after first load,
  setting the context offline and reloading still rendered the H1 and showed
  `Offline now`, with no errors.

### Candidate/live identity and response policies

`dist/index.html`, `assets/main-DHDHK17j.js`,
`assets/main-CGWSNuYd.css`, and `sw.js` had identical SHA-256 values to the
live responses. The live root, privacy, terms, manifest, and service worker
all returned HTTP 200. HTTPS, HSTS, `Referrer-Policy:
strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff` were
present. Content-Security-Policy and Permissions-Policy were absent (recorded
as hardening gaps, not counted separately from the failure above).

## Measurement note

An independent Lighthouse CLI run could not be completed in this container:
the Playwright Chromium executable caused Lighthouse 13.4.1 to report a
browser-tab crash. This report does not rely on the candidate handoff's
Lighthouse figures; bundle measurements and browser accessibility/mobile
checks above are fresh evidence.

## Required next steps

Do not promote this candidate. Before re-verification, ensure default exports
cannot include coordinate-looking values in place/free-text fields without
explicit exact-location consent, and strip GPS (or exclude/require explicit
metadata consent for) exported original media. Add full numeric coordinate
validation and deploy immutable hashed-asset caching with a revalidating
service-worker policy. Add regression coverage for each privacy path.
