# Handoff — Bird Sighting Proof Card

## Independent verification 2 — **FAIL**

Candidate: `9261d9f29c902221bdaef0a45bff984234ea1138`<br>
Verified URL: <https://bird-sighting-proof-card.sociobot.in/><br>
Report: [`.factory/verification.md`](verification.md)

Do **not** promote this candidate. Fresh clean-checkout and live-deployment
verification found two P1 privacy failures: default PDF/JSON export preserves
an exact coordinate typed in the place label, and JSON includes original photo
bytes unchanged so EXIF GPS can leak without the exact-location opt-in. A P2
also allows impossible `91, 181` coordinates to export, and live hashed assets
have only a 30-second non-immutable cache policy. The report contains exact
reproduction evidence, passing checks, and required remediation.

Work order: `bird-sighting-proof-card-build-1`<br>
Completed: 2026-08-28<br>
Build output: `dist/` (static)

## What shipped

- A complete six-step proof-card workflow for evidence, observation time, privacy-controlled place, field marks, candidates/confidence, and local filing.
- Image/audio attachments stored as blobs in IndexedDB, with preview, file limits, error feedback, deletion, and basic JPEG EXIF `DateTimeOriginal` extraction.
- Safe location export: coordinates are withheld by default; approximate settings snap to 10 km, 1 km, or 100 m geographic grids; exact coordinates require an explicit warning acknowledgement. Sensitive-site cards carry a visible warning.
- Live share-safe preview; validated, downloadable PDF review sheet; portable v1 JSON export/import with embedded original media and remote-reference rejection.
- Local draft archive with autosave, resume, confirmed deletion, and empty/storage-error states.
- Installable PWA manifest, 192/512 maskable icon, versioned service worker, hashed-asset precache, offline navigation fallback, and update toast.
- Responsive topographic-cartography visual system with light/dark treatments and a generated original marsh illustration in AVIF/WebP. Prompt, review, and provenance are in `.factory/design.md` and `assets/src/`.
- Static `/privacy/` and `/terms/` pages, refreshed README, MIT license, robots file, and sitemap.

## Verification

Commands run successfully from the repository root:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

- Unit tests: 5/5 passed (coordinate privacy, required export fields, PDF structure).
- Playwright: 8/8 passed across Chromium desktop and Pixel 5-class mobile. Covered end-to-end save/export/reload, exact-location consent, light/dark axe scans, and `context.setOffline(true)` reload after the first visit.
- Factory `verify-url.sh`: HTTP 200; title and `lang` present; exactly one `h1`; main landmark present; 0 images missing alt; 0 unlabeled buttons; 0 console/page errors.
- Lighthouse 12.8.2 mobile-style local production run: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 1.5 s, TBT 0 ms, CLS 0.
- Production payload: 31.07 KB JS (11.08 KB gzip), 17.61 KB CSS (4.90 KB gzip), 22 KB mobile AVIF hero / 43 KB mobile WebP hero. No runtime fonts or third-party dependencies.
- `npm audit`: 0 vulnerabilities.

## Build/deploy notes

- Exact production command: `npm run build`.
- Publish `dist/`; `dist/index.html` is at its root.
- Serve `sw.js` with `Cache-Control: no-cache`; hashed `/assets/` files can be immutable.
- Lighthouse figures are reproducible lab measurements against `vite preview` in this container, not field telemetry.

## Known gaps and honest boundaries

- The PDF is a compact textual review card and lists evidence filenames; it does not embed photo pixels or audio. The JSON export is the complete packet and includes original media.
- Timestamp extraction covers common, uncompressed JPEG EXIF. Other image/audio formats use the file-modified timestamp as an editable suggestion.
- Browser storage quota varies by device. The UI caps individual evidence at 25 MB and imports at 80 MB, but users should export JSON backups for important observations.
- Grid rounding is an approximate privacy control, not a guarantee against inference from prose, image landmarks, or embedded metadata in original files. The UI asks users to review before sharing.
- Species identification and direct submissions to birding networks remain intentionally out of scope.
