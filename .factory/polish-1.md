# Polish round 1 — finding closure

Date: 2026-08-28

Reviewed candidate: `a64f19727fa00bb1faf4e967b34b034d2788395e`

Review report: `97052de659124ae7b34dce2c7b797e20372481b7`

Deployed product code: `92804ca`

Live URL: <https://bird-sighting-proof-card.sociobot.in/>

Every finding in `.factory/review-1.md` and every retained prior verification item is closed.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the metaphor with “Make a private bird-sighting record,” named birders, explained the outcome, and added sample and blank actions. | `serves distinct routes with complete metadata and working history`; [mobile first screen](evidence/live/home-mobile.png); live `/` cold check. |
| F-1-2 | Added `/demo/` and `?demo=1`, a filled photo/audio record, persistent banner, reset, start-real, and the separate `demo:bird-proof-card` database. Pending demo saves are cancelled before deletion. | `@claim:demo-isolation`; `@claim:offline-reload`; [filled mobile demo](evidence/live/demo-mobile.png); live `/demo/` and `/?demo=1`. |
| F-1-3 | Added `.factory/claims.json` with ten claims and exactly one tagged browser test per claim. | All ten manifest commands passed independently from a fresh clone; full Playwright suite passed 38 tests. |
| F-1-4 | Expanded text redaction to DMS, degree-minute, compact hemisphere, labelled latitude/longitude, GPS labels, and decimal pairs. | `@claim:safe-default-export`; unit test `redacts DMS, degree-minute, compact, and labelled GPS notation`; live DMS preview/JSON check. |
| F-1-5 | Stripped JPEG COM and APP metadata, PNG text/EXIF, WebP EXIF/XMP/ICC, WAV non-audio chunks, and MP3 ID3. Removed M4A from accepted safe exports. | `@claim:safe-default-export`; unit test `removes JPEG comments and WAV INFO comments from decoded exports`; live decoded JPEG/WAV check. |
| F-1-6 | Rewrote the export copy precisely and backed the default-redaction promise with decoded attachment tests. | `@claim:safe-default-export`; live default export contained neither coordinate prose nor GPS metadata bytes. |
| F-1-7 | Enforced one 12 MB total evidence budget and a 20 MB import ceiling. Replaced CSP-blocked `fetch(data:)` import with an in-memory decoder. | `@claim:portable-exports` runs under the production CSP; live boundary export was 16,001,211 bytes and imported with its 12 MB attachment. |
| F-1-8 | Applied the designed 3 px amber focus ring to both visible file-picker labels. | `keeps keyboard focus visible and the phone layout within its viewport`; live keyboard Tab produced `3px` outlines on both labels. |
| F-1-9 | Added a cartographic `/404.html`, removed the SPA fallback, and configured a real 404 response override. | `serves distinct routes with complete metadata and working history`; live `/no-such-page` returned HTTP 404 with the not-found title/H1; [404 screenshot](evidence/live/not-found.png). |
| F-1-10 | Added route-specific titles, descriptions, canonicals, Open Graph/Twitter fields, a 1200 × 630 local social image, and a 180 px touch icon. | `serves distinct routes with complete metadata and working history`; live metadata crawl of `/`, `/demo/`, `/privacy/`, and `/terms/`. |
| F-1-11 | Gave home, demo, privacy, terms, and 404 the same compact header/footer contract, legal links, factory credit, and build id. | Route-shell browser test and live route crawl; [desktop first screen](evidence/live/home-desktop.png). |
| F-1-12 | Set at least 44 px height on the brand and every footer link, including phone layouts. | Mobile branch of `keeps keyboard focus visible and the phone layout within its viewport`; live 390 px geometry check. |
| F-1-13 | Standardized the user concept as “record” and rewrote decorative headings in task language. | `.factory/copy-audit.md`; live heading and control inspection. |
| F-1-14 | Replaced vague controls with “Try it with sample data,” “Start a blank record,” “Return to the record,” “Close storage details,” “Reload the updated app,” and the named external source link. | [mobile first screen](evidence/live/home-mobile.png); live UI crawl. |
| F-1-15 | Rewrote README prose and headings. All 43 README sentences are 15 words or fewer. | `.factory/copy-audit.md`; automated sentence extraction. |
| Verify-2 invalid coordinates | Retained numeric range validation for structured coordinates. | `rejects impossible exact coordinates before export`; `never shares impossible coordinates`. |
| Verify-2 cache policy | Retained immutable hashed-asset caching and revalidation for the service worker and manifest. | `ships immutable hashed assets and a revalidating service worker policy`; live response headers. |
| Verify-3 keyboard and touch P2/P3 | Closed by F-1-8 and F-1-12. | Named focus/mobile browser test and live geometry checks. |
| Verify-3 security hardening P3 | Added CSP, Permissions-Policy, `DENY` framing policy, nosniff, and strict referrer policy. | Live headers on `/`; CSP-protected `@claim:portable-exports` round-trip. |

## Evidence summary

- Fresh clone: `npm ci`, `npm test` (14), typecheck, lint, build, ten individual claim commands, and `npm run test:e2e` (38) passed.
- Local Lighthouse: performance 98, accessibility 100, best practices 100, SEO 100.
- Live Lighthouse after final deployment: 100 in all four categories; FCP 0.9 s, LCP 1.2 s, TBT 20 ms, CLS 0.
- Production bundle: initial JS 41.38 kB raw / 14.32 kB gzip; CSS 19.54 kB raw / 5.29 kB gzip.
- `/opt/fleet/lib/verify-url.sh` found zero console errors, one H1, English language, a main landmark, and no missing image alt text.
- Live axe integration found no serious or critical issues on home, demo, privacy, terms, or 404.
- Live screenshots: [home desktop](evidence/live/home-desktop.png), [home mobile](evidence/live/home-mobile.png), [demo mobile](evidence/live/demo-mobile.png), and [404](evidence/live/not-found.png).

Nothing from the review remains deferred.
