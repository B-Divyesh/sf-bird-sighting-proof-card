# Polish round 2 — finding closure

Date: 2026-08-28

Reviewed candidate: `d4d5a7a2d3eb2cd8acad2e64b1102930ee3de3b2`  
Review report: `f462796c72ae49c679d63390920872a67d47fe51`

| Finding id | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the plain five-word job headline, named birders, and result-naming sample action. | `builds, saves and exports a useful bird record`; local `/` first-screen check. |
| F-1-2 | Retained isolated `/demo/` and `?demo=1` sample storage, banner, reset, start-real, and offline sample. | `@claim:demo-isolation`, `@claim:offline-reload`; local `/demo/` check. |
| F-1-3 | Expanded the ledger from ten to twelve executable claims. | Every command in `.factory/claims.json`; clean-clone evidence recorded in handoff. |
| F-1-4, F-1-5, F-1-6 | Retained coordinate-text and attachment-container redaction. | `@claim:safe-default-export`; privacy/export unit tests. |
| F-1-7 | Retained the 12 MB portable-export boundary and import path. | `@claim:portable-exports`. |
| F-1-8 | Retained the visible file-picker label focus rings. | `keeps keyboard focus visible and the phone layout within its viewport`. |
| F-1-9 | Retained the styled 404 and added its complete metadata, heading focus, and route announcement. | `gives 404 and offline their complete route metadata and shared shell`; `moves focus and announces every document route`. |
| F-1-10 | Retained primary route metadata and completed 404/offline canonical, manifest, favicon, Apple icon, Open Graph, and Twitter fields. | `gives 404 and offline their complete route metadata and shared shell`. |
| F-1-11, F-1-12 | Retained shared shell and 44 px route/footer targets; offline now uses the same wordmark, navigation, footer, and mobile treatment. | mobile branch of the keyboard/layout test; offline route-shell test. |
| F-1-13, F-1-14 | Retained record terminology and result-naming controls; renamed the storage action to “Show storage details.” | local copy audit and browser route check. |
| F-1-15 | Updated the audit for the revised evidence hint and storage control; no changed sentence exceeds 22 words. | `.factory/copy-audit.md`. |
| F-2-1 | Added `no-api-or-backend` and `app-update` claims with isolated observable tests. | `@claim:no-api-or-backend`; `@claim:app-update`. |
| F-2-2 | Each document route focuses its `h1` and announces its title in a polite live region after load/back navigation. | `moves focus and announces every document route`. |
| F-2-3 | Completed 404/offline metadata; rebuilt the offline page with the shared site shell and route-focus script. | `gives 404 and offline their complete route metadata and shared shell`; axe route scan. |
| F-2-4 | Rewrote the attachment hint in plain words and renamed the topic button by its result. | `.factory/copy-audit.md`; `builds, saves and exports a useful bird record`. |

## Evidence

- Local unit/type/build: `npm test` (14), `npm run typecheck`, `npm run lint`, and `npm run build` passed.
- Browser: `tests/e2e/app.spec.ts --workers=1` passed 22 checks and `tests/e2e/claims.spec.ts --workers=1` passed 24 checks across desktop and 390 px mobile.
- Local screenshots: `.factory/evidence/polish-2/local/screenshot-desktop.png`
  and `.factory/evidence/polish-2/local/screenshot-mobile.png`. Final live
  cold checks are recorded in `.factory/handoff.md` after deployment.
