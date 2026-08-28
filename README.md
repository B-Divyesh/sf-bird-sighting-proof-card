# Bird Sighting Proof Card

An offline, local-first evidence packet builder for birders who are unsure what they observed. It brings photos, recordings, observation time, deliberately generalized location, field marks, and candidate confidence into one reviewable card without sending evidence to a server.

Live product: [bird-sighting-proof-card.sociobot.in](https://bird-sighting-proof-card.sociobot.in)

## What it does

- Keeps drafts, coordinates, photos, and audio in browser IndexedDB.
- Accepts up to 10 JPEG, PNG, WebP, M4A, MP3, or WAV files (25 MB each).
- Reads `DateTimeOriginal` from ordinary JPEG EXIF metadata when present and otherwise suggests the file date.
- Withholds coordinates by default. Optional 10 km, 1 km, and 100 m settings snap to geographic grids; exact coordinates require a separate acknowledgement.
- Records field marks, free-form notes, multiple candidate species, and a low/medium/high confidence for each.
- Produces a compact PDF review sheet or a portable JSON backup containing original evidence files.
- Imports its own v1 JSON format and works after the first visit without a network connection.

It does not identify birds, publish sightings, submit to eBird, or make an observation authoritative.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Then open the URL printed by Vite. No API keys or backend are required.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

`npm run build` is the production build command. It writes the static site to `dist/`, with `dist/index.html` at the root. End-to-end tests use Playwright 1.58.2 and cover desktop, a 390 px-class mobile layout, export safety, IndexedDB persistence, axe accessibility checks in both color schemes, and a real offline reload.

To inspect the production build:

```sh
npm run preview
```

## Privacy and data ownership

There is no account, analytics, tracking, third-party runtime script, or CDN font. Data leaves the device only through a file the user explicitly exports. JSON exports contain original evidence and may reveal their embedded metadata; they should be handled like the source files. See `/privacy/` and `/terms/` in the built site.

Clearing browser site data or uninstalling the PWA can remove local drafts. Export JSON for a portable backup.

## Deployment

Deploy the contents of `dist/` as a static site with clean-directory routes enabled for `/privacy/` and `/terms/`. Serve `sw.js` with revalidation (`Cache-Control: no-cache`) so update checks work; hashed files under `assets/` can be immutable.

## Design and provenance

The topographic-cartography visual system and original illustration prompt/provenance are documented in [`.factory/design.md`](.factory/design.md). The source illustration is kept under `assets/src/`; optimized AVIF and WebP renditions ship in the PWA.

## License

MIT — see [LICENSE](LICENSE).
