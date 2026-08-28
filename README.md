# Bird Sighting Proof Card

Make a private bird-sighting record with photos, sound, field marks, and honest confidence. Choose how much location an export reveals.

It is for birders who want another person to review an uncertain sighting. It does not identify or publish birds.

Live product: [bird-sighting-proof-card.sociobot.in](https://bird-sighting-proof-card.sociobot.in)

One-click sample: [bird-sighting-proof-card.sociobot.in/demo/](https://bird-sighting-proof-card.sociobot.in/demo/)

## Make and keep a bird record

- Add JPEG, PNG, WebP, MP3, or WAV evidence. A record can hold ten files and 12 MB total.
- Read a JPEG capture time when available. You can correct the suggested time.
- Keep coordinates hidden by default. Rounded choices share an area instead.
- Add field marks, notes, possible species, and confidence.
- Download a PDF review sheet or an importable JSON backup.
- Remove known location metadata containers from supported JSON evidence copies.

The free tool needs no account. Records use private browser storage and are never uploaded.

## Try the isolated sample

Open `/demo/` or `/?demo=1`. The filled sample includes a photo, sound, place, notes, and two possible species.

The demo uses the separate `demo:bird-proof-card` browser database. Resetting or leaving it deletes only demo records.

See [`.factory/demo.md`](.factory/demo.md) for the exact sample and reset behavior.

## Run the product locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. No API key or backend is needed.

## Verify every product claim

```sh
npm test
npm run build
npm run test:e2e
```

The claim registry is [`.factory/claims.json`](.factory/claims.json). Each listed command runs one browser test against the isolated demo.

The production build writes the static product to `dist/`. JavaScript, accessibility, mobile layout, privacy, exports, and offline reload have automated checks.

## Understand privacy and data ownership

The app has no analytics, advertising, third-party scripts, or remote data store. Runtime requests stay on the product’s origin.

Default exports redact common coordinate formats in names and notes. Exact coordinates need a separate acknowledgement.

JSON copies remove known metadata containers from supported files. Always inspect an export for visual or uncommon location clues before sharing.

Deleting browser site data also deletes records without an exported backup. Use JSON export when you need a portable copy.

Read the shipped [privacy](https://bird-sighting-proof-card.sociobot.in/privacy/) and [terms](https://bird-sighting-proof-card.sociobot.in/terms/) pages.

## Deploy the static build

Deploy the contents of `dist/`. The supplied Azure Static Web Apps config sets route, cache, content, framing, and permission policies.

The service worker caches the main routes and sample. It reloads the filled demo after the first online visit.

## Visual design and asset provenance

The cartographic field-notebook system is documented in [`.factory/design.md`](.factory/design.md). The source illustration and generation details live under `assets/src/`.

## License

MIT — see [LICENSE](LICENSE).
