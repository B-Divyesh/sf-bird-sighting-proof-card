# Visual thesis — The field map becomes the evidence envelope

## Direction

**Topographic cartography, not an outdoor-brand mood board.** The interface should feel like opening a careful field notebook over an Ordnance Survey sheet: contour lines establish place, pin marks establish evidence, and a single amber survey flag identifies the next action. The map language supports the actual job—recording useful spatial evidence while revealing only the precision the birder chooses.

The form is the product. Decoration stays at the edges: a generated dawn marsh plate introduces the workflow, while fine contour rules and coordinate ticks organize evidence. Cards are used only for independent saved sightings and the live proof preview. Form sections remain open, linear notebook entries.

## Palette

Light mode is the primary, paper-in-daylight treatment; dark mode is an ink-at-night field treatment selected by the device.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#F4F0E4` | `#16211D` | page / map paper |
| `--surface` | `#FFFDF6` | `#202D28` | raised sheets |
| `--ink` | `#18312B` | `#F4F0E4` | primary text |
| `--muted` | `#52645D` | `#B9C8C0` | supporting text |
| `--moss` | `#315C49` | `#82B79C` | controls / routes |
| `--amber` | `#C05B24` | `#F0A26C` | primary action / survey flag |
| `--line` | `#BAC3B5` | `#4F6259` | contour and field rules |
| `--safe` | `#2F684D` | `#8BC8A7` | safely rounded location |
| `--warning` | `#86530E` | `#F1C46F` | exact-coordinate warning |
| `--danger` | `#A33D32` | `#FF998E` | validation / destructive action |

All text and controls target WCAG AA. The amber is used as a filled button with deep ink text rather than as small text on paper.

## Type and spacing

- Headings: Georgia, Charter, `Times New Roman`, serif—map-title authority without a font download.
- Interface and body: system sans (`Inter`-like platform stack), chosen to keep the offline payload small and field-legible.
- Scale: 14px annotations, 16px body, 20px section title, 28px card title, clamp(38px–64px) page title. Body leading 1.55; prose max width 68ch. Coordinate values use tabular numerals.
- Spacing follows a 4px base: 4, 8, 12, 16, 24, 32, 48, 72. Touch targets are at least 44px and adjacent controls have at least 8px separation.

## Interaction grammar

- The builder reads as a surveyed route with six numbered waypoints: evidence, time, place, field marks, candidates, review.
- A sticky desktop proof sheet mirrors the share-safe export. On phones it follows the form so the recording path stays linear.
- Location is always coarse by default. The precision selector states the consequence in distance and plain language. Exact coordinates require a second, explicit acknowledgement before export.
- Attachment tiles show type, local-only status, file size, and removal. The application never uploads or identifies media.
- Saved drafts are distinct sheets with last-edited time and explicit resume/delete actions. Destructive deletion names the draft and requires confirmation.
- Feedback is immediate and textual: a persistent offline/local status strip, save confirmation, validation summary, and export result live region.

## Depth and motion

Surfaces use a 1px ink-tinted edge and small paper shadow. Waypoints reveal with a 180ms opacity/translate transition and the proof sheet updates with a 160ms ink-fade. No looping animation. Under `prefers-reduced-motion: reduce`, transforms, smooth scrolling, and transitions are removed; hierarchy remains through line weight, spacing, and tone.

## Original asset plan and provenance

- Hero: one wide editorial field illustration of a distant shorebird at dawn, viewed through layered translucent contour-map lines and a paper observation frame. It communicates “evidence plus privacy,” not automated identification. Delivered as responsive WebP/AVIF plus PNG source; mobile rendition ≤300 KB.
- Product mark and PWA icons: hand-authored SVG-like geometric map pin/feather motif rendered locally into PNG sizes. No stock icons.
- Topographic texture: authored in CSS using repeating radial/linear contours; decorative and hidden from assistive technology.

### Prompt sheet

Use case: `illustration-story`  
Asset type: responsive landing-page field illustration  
Primary request: an editorial natural-history illustration about documenting an uncertain bird sighting without exposing its exact location  
Scene/backdrop: quiet northern coastal marsh at first light, layered low headlands and reeds, a distant small shorebird seen in profile  
Subject: the bird is intentionally too distant for certain species identification; a paper evidence-frame corner and subtle unlabeled topographic contour lines overlay the landscape  
Style/medium: restrained gouache and colored-pencil field-guide plate on lightly fibrous paper, precise but human, contemporary cartographic editorial art  
Composition/framing: wide 3:2 landscape, bird in the right-middle distance, generous calm negative space on the left, no UI mockup  
Lighting/mood: cool misty dawn with one warm amber horizon edge; attentive, quiet, trustworthy  
Color palette: lichen paper, deep pine ink, moss green, muted slate water, restrained survey amber  
Materials/textures: dry gouache, graphite contour strokes, subtle paper tooth  
Constraints: scientifically plausible bird anatomy; contour lines are abstract and contain no coordinates; no implication of AI identification  
Avoid: text, letters, numbers, labels, logos, watermarks, brands, people, binocular-view circles, neon color, gradients, glossy 3D, photorealism, fantasy anatomy, extra birds

Generated with the factory Azure image deployment on 2026-08-28. The selected output is original for this product. The exact prompt and generation metadata are retained beside the source in `assets/src/hero-field-map.json`. The footer discloses AI-assisted imagery.

## Responsive intent

- At 390px the utility rail becomes a compact status row, the two-column builder becomes a single recording route, and the preview moves after the fields. Nothing relies on hover.
- At ≥960px the form and proof preview form a 7/5 split; preview is sticky but never covers navigation or actions.
- At 200% text zoom, columns collapse and controls wrap instead of clipping.
