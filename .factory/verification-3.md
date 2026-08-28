# Independent verification 3 — FAIL

Date: 2026-08-28

Work order: `bird-sighting-proof-card-verify-3`

Candidate commit: `d3e7e227590ac04b1a1e1230f80f098a0246966e`

Live URL: <https://bird-sighting-proof-card.sociobot.in/>

Verdict: **FAIL**

The deployment is the candidate and the repaired build/cache configuration is
live. However, exact coordinates still leave default, non-exact exports through
common text and attachment-metadata paths. This violates the researched brief's
explicit success condition: no exported card may include exact coordinates
unless the user opts in.

## Defects

### P1 — Exact coordinates in common non-decimal text formats bypass redaction

On the live deployment, with the default **Region only — no coordinates**
selection and no exact-location acknowledgement, I entered this place label:

```text
Nest at 58°57'04.4"N 2°45'04.4"W
```

The share-safe preview retained both exact DMS coordinates. The downloaded JSON
also retained them while its structured location was explicitly `null`:

```json
{
  "placeLabel": "Nest at 58°57'04.4\"N 2°45'04.4\"W",
  "location": null
}
```

The PDF retained the same coordinate values (its basic PDF encoder substituted
`?` for the degree symbols) while separately saying `Shared location:
Coordinates withheld`. The redactor handles adjacent decimal pairs but not DMS
or separately labelled latitude/longitude, both ordinary ways birders record a
location. The preview therefore gives false assurance before sharing.

### P1 — Default exports retain exact GPS text in accepted evidence metadata

I generated a valid 2 × 2 JPEG with a standard JPEG comment property containing:

```text
GPSLatitude=58.951234;GPSLongitude=-2.751234
```

ImageMagick identified the comment on the valid JPEG. I attached it on the live
site and exported JSON with Region only selected. The input JPEG was 208 bytes;
the decoded exported JPEG was also 208 bytes and still contained that exact GPS
string byte-for-byte, while `card.location` was `null`.

This directly contradicts `/privacy/`, which says JPEG textual metadata
containers are removed. The sanitizer removes JPEG APP1 and APP13 segments but
preserves the standard COM text segment.

The same broader contract failure exists for audio. I created a valid 0.1-second
PCM WAV with a standard RIFF `LIST/INFO/ICMT` comment holding the same GPS text;
Chromium decoded it successfully. The accepted 910-byte WAV exported unchanged,
still contained both exact values, and had `card.location: null`. The product
discloses that audio is unchanged, but the acceptance contract does not exempt
attachment metadata from the exact-coordinate opt-in guarantee.

### P2 — A valid export can exceed the app's own import limit

The app accepted three 20,000,000-byte MP3 attachments (each below the 25 MB
per-file limit and well below the 10-file count limit). Its export was a valid
80,001,240-byte Proof Card JSON with all three attachments. A clean browser
context immediately rejected that same file with:

```text
That import is over the 80 MB safety limit.
```

This breaks the promised export/import ownership path for valid cards. A normal
small export imported successfully, including its place, candidate, and media.

### P2 — Keyboard focus is invisible on both file pickers

In a keyboard-only 390 px run, Tab reached `#evidence-files` as the sixth focus
stop and `#import-file` as the 38th. In each case the active element was clipped
to 1 × 1 CSS px and both the input and its visible label had `outline: none`.
There is no label focus treatment. The controls can receive keyboard focus but
the user cannot see where focus is, violating the accessibility contract.

### P3 — Some mobile link targets are smaller than 44 × 44 CSS px

At 390 px, the header brand was 36 px high and footer links were about 20 px
high (the Terms link was about 38 × 20 px). These miss the stated touch-target
minimum. Form controls and primary actions otherwise met the target size.

### P3 — Browser policy hardening is incomplete

HTTPS redirection, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and
`X-Content-Type-Options: nosniff` are present. Content-Security-Policy,
Permissions-Policy, and a framing restriction are absent. This is not the
release blocker, but it should be hardened for an app handling sensitive local
observation data.

## Candidate and deployment identity

A detached worktree was clean before installation and resolved to the exact
candidate SHA. Fresh production build files matched live responses byte for
byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `85841bad74caeffe27023193edcd6dd6f6f9f5690d697509e0959a53234fb91a` |
| `assets/main-BgWrjoba.js` | `cdb97f93ea479cbab474711e4af10a0421c76b6474a87376bccaa51d8fbd26fb` |
| `assets/main-CGWSNuYd.css` | `3cfcd8fdae677828f1d473fbd982cca0938c6c61060f58aa01133e2378f5e645` |
| `sw.js` | `33ef61bcc3cafedd000f10d5b3736fcd179bf954307b2bc790aaf2d0b52f6f92` |
| `manifest.webmanifest` | `31c762d5c08fd4da319776d6ff558e1ca89470ce7b96438cad46987670f5473f` |
| `privacy/index.html` | `3ba5d790e3b8a7e6b4eef2a2742d2bf1f5154a6750c24a8ab520f7f21fdbd56a` |
| `terms/index.html` | `8702cec747bfc5f13ec99acdd4524d186448cfc11dcd9011fc89be07dba86f1b` |

The live hashed asset policy is `public, max-age=31536000, immutable`; `sw.js`
and the manifest use `no-cache, must-revalidate`. Conditional requests returned
304 and JS was Brotli-compressed. HTTP redirects to HTTPS. The live root,
privacy, terms, manifest, service worker, offline page, robots file, and sitemap
all returned 200.

## Local gates from the clean candidate

```text
npm ci                 PASS — 61 packages; 0 audit vulnerabilities
npm test               PASS — 3 files, 12 tests
npm run typecheck      PASS
npm run lint           PASS — repository's TypeScript no-emit lint gate
npm run build          PASS — exact tsc --noEmit && vite build; dist/ produced
npm run test:e2e       PASS — 14/14, desktop and 390 px mobile
```

Production bundle sizes met the supplied budgets:

- Initial JS: 34,689 bytes raw / 12.26 kB gzip (budget 200 kB).
- Main CSS: 17,609 bytes raw / 4.90 kB gzip (budget 50 kB).
- Mobile AVIF hero: 22,353 bytes (budget 300 kB).
- Web fonts: none.

Fresh Lighthouse 13.0.1 against the live URL scored performance 95,
accessibility 100, best practices 100, and SEO 100. Lab metrics were FCP 1.0 s,
LCP 1.2 s, total blocking time 250 ms, CLS 0, and Speed Index 1.0 s; Lighthouse
reported no run warnings.

## Browser and product evidence

The following passed independently on the live deployment:

- Desktop 1440 px and mobile 390 × 844 rendered without normal-scale horizontal
  overflow; the mobile builder was a deliberate one-column layout. Full-page
  screenshots were visually inspected.
- Root semantics: English `lang`, descriptive title, exactly one `h1`, exactly
  one `main`, and no image missing `alt`.
- Axe found zero violations in both light and dark schemes on the builder, and
  zero violations on privacy, terms, and the offline page. The invisible file
  input focus defect above requires manual keyboard testing and is not detected
  by axe.
- The first Tab focused the skip link with a visible 3 px outline. Ordinary
  fields/actions had visible focus treatment. The native storage dialog focused
  its close button, closed with Escape, and restored focus to its trigger.
- Reduced-motion emulation produced `0s` transition/animation durations.
- Required-field export recovery named all four missing proof elements and
  moved focus to the error summary. A half-entered coordinate pair was blocked.
- Unsupported text evidence, a 25,000,001-byte file, and an 11th attachment were
  rejected with actionable messages. A file exactly 25,000,000 bytes was
  accepted. Exact boundary coordinates `-90, 180` exported only after selecting
  Exact and acknowledging the warning. About-1-km coordinates were rounded.
- A representative card saved to IndexedDB, survived reload, exported, and a
  small JSON packet round-tripped through import. Invalid-format JSON and remote
  attachment references were rejected cleanly.
- Denied geolocation permission produced a recovery message directing manual
  entry; permission was requested only after the location button was pressed.
- No console errors, uncaught page errors, cross-origin runtime requests, or
  non-GET/upload requests occurred. Saving and exporting generated no network
  request. No analytics, third-party scripts, or CDN fonts were present.
- Chromium found no manifest parsing or installability errors. Icons are the
  declared 192 × 192 and 512 × 512 sizes.
- The live service worker controlled the page, used cache `proof-card-v5`, and
  reloaded the full builder while offline with `Offline now`. An independent
  local update simulation served changed service-worker bytes: the in-app
  “An app update is ready” toast appeared and its Reload action loaded the app.
- The normal PDF began with `%PDF-1.4`, downloaded with the expected name, and
  included the card content. The DMS defect above was confirmed in its raw text.

## Release decision

Do not promote this candidate. Redaction must cover realistic exact-location
representations and all metadata-bearing exported evidence, or the UI must
block/strip those paths unless exact-location consent is active. Align export
and import size limits, add a visible focus treatment for both file-picker
labels, and add regression tests using valid image/audio fixtures rather than
only a synthetic APP1 marker.
