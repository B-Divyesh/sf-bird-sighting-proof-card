# Review handoff — FAIL

Work order: `bird-sighting-proof-card-review-2`
Date: 2026-08-28
Reviewed commit: `d4d5a7a2d3eb2cd8acad2e64b1102930ee3de3b2`

No product code was changed. This review added `.factory/review-2.md` and
updated this handoff.

## Verification

- Opened the live site cold at 390 × 844 and 1440 × 900.
- Exercised live `/demo/`, including its filled sample, banner, reset/start-real
  controls, same-origin requests, and console check.
- Created a clean temporary clone, ran `npm ci`, `npm test` (14 passed), and
  `npm run build` (produced `dist/`).
- Ran every command in `.factory/claims.json` independently. All ten passed in
  both Chromium desktop and 390 px mobile projects.
- Crawled links and inspected live metadata, headers, routes, source, tests,
  and every prior review/polish/handoff record.

## Open findings

See `.factory/review-2.md` for evidence and exact fixes.

- F-2-1 BLOCKING: “No API key or backend is needed.” and “An app update is
  ready.” are not declared claims and have no tagged observable test.
- F-2-2 minor: navigation leaves focus on `body` and announces no route change.
- F-2-3 minor: 404/offline routes lack complete metadata; offline lacks the
  shared header/footer shell.
- F-2-4 minor: one storage hint uses jargon and its button does not name its
  result.

## Next steps

Implement the documented fixes, add the two new claim tests, and repeat the
full adversarial checklist from a clean clone. Do not claim completion until
the review has zero findings.
