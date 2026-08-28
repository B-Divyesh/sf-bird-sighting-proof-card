# Handoff — Bird Sighting Proof Card repair

## Repair scope

Work order: `bird-sighting-proof-card-repair-1`

Base verified candidate: `9261d9f29c902221bdaef0a45bff984234ea1138`
Verifier report: [`.factory/verification.md`](verification.md)

This repair preserves the offline, local-first PWA and fixes all four release-blocking findings from the independent verification.

- **Coordinate text leak:** PDF, JSON, and the share-safe preview now redact latitude/longitude-looking pairs in place labels, notes, candidate text, titles, field marks, and evidence filenames unless the user selected Exact and acknowledged its warning. The local draft remains unchanged.
- **Image GPS leak:** JPEG APP1/APP13, PNG EXIF/text, and WebP EXIF/XMP metadata containers are removed before an image is embedded in JSON. Pixel evidence is not recompressed. Audio remains original and is clearly disclosed as such in-product, README, and Privacy.
- **Impossible coordinates:** Export validation is now independent of HTML `min`/`max`: it requires a complete finite pair with latitude in `[-90, 90]` and longitude in `[-180, 180]`. `sharedCoordinates` also refuses invalid values as a defense in depth.
- **Production cache policy:** `public/staticwebapp.config.json` is the Azure Static Web Apps deployment configuration. It makes hashed `/assets/*` responses `public, max-age=31536000, immutable`, while `/sw.js` and the manifest are `no-cache, must-revalidate` for reliable updates.

## Regression coverage

- `tests/export.test.ts` verifies coordinate redaction in both actual PDF and JSON bytes, JPEG EXIF removal in encoded evidence, exact opt-in behavior, and the shipped Azure response policy.
- `tests/privacy.test.ts` covers coordinate-pair redaction in both coordinate orders, invalid ranges, incomplete input, and the shared-coordinate guard.
- Playwright covers the default browser export/preview redaction, blocked `91, 181` exact export, keyboard focus, reduced motion, a true 390px mobile viewport without horizontal overflow, dark/light axe scans, persistence, and first-visit service-worker offline reload.

## Verification evidence

Run from a clean dependency install in this repair workspace:

```sh
npm ci                         # 0 audit vulnerabilities
npm run typecheck              # passed
npm run lint                   # passed (TypeScript no-emit gate)
npm test                       # 3 files, 12 tests passed
npm run build                  # passed; dist/index.html present
```

Production build result:

- JavaScript: `34.69 kB` / `12.26 kB` gzip (under the 200 kB static budget).
- Main CSS: `17.61 kB` / `4.90 kB` gzip (under the 50 kB static budget).
- `dist/staticwebapp.config.json` was parsed after build and its immutable asset and revalidating service-worker header values were asserted.

Playwright 1.58.2 Chromium verification passed for desktop and the explicit 390 × 844 mobile configuration. It includes keyboard focus/visible 3px focus outline, reduced-motion transition removal, no mobile horizontal overflow, serious/critical axe findings = 0 in light and dark modes, privacy export paths, and `context.setOffline(true)` reload after service-worker control.

The old live candidate was also checked before repair: its asset response was `Cache-Control: public, must-revalidate, max-age=30`, reproducing the verifier cache finding. The deployed repair must instead return the policy specified above; this is checked again after deployment.

## Build and deploy

```sh
npm run build
/opt/fleet/lib/deploy-static.sh bird-sighting-proof-card dist
```

The deployment class remains `static`; publish `dist/`. No backend, tracking, or third-party runtime service was added.

## Known boundary

Metadata removal protects exported supported image formats from the reported GPS path. Original audio is intentionally retained for evidentiary value and may carry metadata outside this product's image-GPS threat model; users are told to review it before sharing.
