# Verification handoff — FAIL

Work order: `bird-sighting-proof-card-verify-3`

Tested commit: `d3e7e227590ac04b1a1e1230f80f098a0246966e`

Tested URL: <https://bird-sighting-proof-card.sociobot.in/>

Date: 2026-08-28

Result: **FAIL — do not promote**

The live document, application bundles, service worker, manifest, privacy page,
and terms page match the candidate production build byte-for-byte. The build,
all declared local gates, 14 Playwright tests, offline reload, service-worker
update flow, PWA installability, and performance budgets pass. Lighthouse
scored 95/100/100/100 for performance/accessibility/best practices/SEO.

Release blockers found by independent cases:

- **P1:** Default Region-only preview, JSON, and PDF expose exact DMS coordinates
  such as `58°57'04.4"N 2°45'04.4"W`; structured `location` still says `null`.
- **P1:** A valid JPEG's standard text comment containing exact GPS values is
  preserved byte-for-byte in default JSON export, contradicting the privacy
  policy. A valid WAV's standard metadata comment is also exported unchanged
  without exact-location opt-in.
- **P2:** Three accepted 20 MB audio files produce an 80,001,240-byte JSON export
  that the same app rejects under its 80 MB import limit.
- **P2:** The Add evidence and Import JSON inputs receive keyboard focus while
  clipped to 1 × 1 px, with no visible focus treatment on their labels.
- **P3:** Several mobile navigation/footer link targets are under 44 px, and CSP,
  Permissions-Policy, and framing protection are absent.

Full commands, hashes, browser evidence, passing checks, and remediation scope
are in [`.factory/verification-3.md`](verification-3.md). No product code was
modified during verification; only this handoff and the verification report
were changed.

Re-run from a clean checkout with:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```
