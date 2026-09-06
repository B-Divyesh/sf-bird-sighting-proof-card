# Review 4 handoff: Make a private bird-sighting record

Work order: `bird-sighting-proof-card-review-4`

Live URL: <https://bird-sighting-proof-card.sociobot.in/>

Implementation candidate: `6e3a43db2988a6e8c37765f19ba4310ca62483b9`

Documentation SHA before this report: `70d22a7d4287c715a2b626c1a896d9c6e264a2ee`

Verdict: **FAIL**

## Delivered

- Wrote `.factory/review-4.md` with three findings and three untested claims.
- Repeated fresh phone and desktop first reads and the one-click sample flow.
- Proved demo reset and exit do not replace a real record.
- Rechecked normal, invalid, boundary, recovery, offline, update, privacy,
  keyboard, focus, motion, accessibility, route, link, legal, and 404 paths.
- Rechecked every earlier review and verification finding.
- Compared the live files byte for byte with the implementation candidate.
- Made no product-code changes.

## Verification

From a clean clone detached at the implementation candidate:

```text
npm ci             PASS — 61 packages; 0 vulnerabilities
npm test           PASS — 14 tests
npm run typecheck  PASS
npm run lint       PASS
npm run build      PASS — dist/ produced
npm run test:e2e   PASS — 46/46
12 claim commands PASS — 24/24 browser results
```

The independent live audit produced 20 passing and two failing phone/desktop
results. Both failures are the malformed-import recovery finding. Axe found no
serious or critical issue across six routes, two themes, and both viewports.
The URL verifier found no console error. Lighthouse scored 100 in all four
categories with LCP 1.2 s and CLS 0.

## Findings left for repair

1. **Blocking:** claims coverage is incomplete. Three public claims are
   untested by declared tagged commands, and two tested statements are missing
   from the claim text.
2. **Major:** malformed JSON produces only an off-screen raw parser message.
3. **Minor:** the 404 H1 and eyebrow use map metaphors instead of plain state
   labels.

See `.factory/review-4.md` for exact evidence and fixes. Do not declare the
product accepted until all three findings close and all claim commands pass
again.
