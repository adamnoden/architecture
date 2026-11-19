# Ovid’s House — Primer publication contract

The Primer gives a technically literate reader the project’s complete architectural model in one sitting: the home being developed, the problem it addresses, the governing principles, the pattern language, one current house and the evidence still needed. The house is the principal outcome; writing and computation support it.

## Editorial standard

Keep the argument dense, concrete and readable. Define a concept once, retain qualifications that change its meaning, and remove repeated hierarchies, process explanation and self-description. Shorten content before reducing type. Page count is an editorial signal, not a build invariant; the compact edition should not grow simply because the project’s internal machinery grows.

All eleven canonical governing rules remain, in order. Supporting sentences are selected deliberately from the same source; changed or ambiguous selection anchors fail the build. Every doctrine change therefore requires a semantic coverage review as well as the mechanical count. The complete active pattern set remains present, with six examples showing service entry, crossings, wet-room failure, windows, exterior access and stewardship. Evidence labels come from canonical metadata.

## Source ownership

| Material | Owner |
| --- | --- |
| Opening, closing and editorial framing | The Markdown fragments in this directory |
| Eleven rules and selected explanations | `docs/manuscript/governing-principles.md` |
| Active pattern identities, statements, qualifications and evidence labels | Canonical files under `docs/patterns/` and their declared reader order |
| Current house description and technical limits | `docs/reference-house/README.md` and `current-house-basis.md` |
| Current owner requirements | `project/owner-house-charter.md` |
| House dimensions and drawing geometry | Current `layout-revision.ts` / `layout-family.ts` sources |
| Figure placement and caption | `reference-house.md`, `figure.ts` and `theme.css` here |

`publication/adapters.ts` selects source material and fills explicit composition slots. It must not become an independent author of architectural prose. Dependencies are declared for preparation, source identity and editorial discovery. The whole active pattern inventory must match its reader order and appear exactly once in the map; a growing list must not silently disappear beyond a fixed slice.

## Visual and print contract

Keep a visual only when it explains a spatial relationship, operation or comparison more efficiently than prose. The Primer uses one current ground-floor plan and a compact complete pattern index. It has no decorative process ladders or invented quantitative charts.

The plan is generated during composition from the current house model. `figure.ts` changes page placement only: all architectural primitives, physical linework and source identity survive. At A4, the 12 m shell must print 120 mm wide at 1:100. The entire door swing, dimensions and caption must fit. The drawing records current reservations; it does not certify assemblies, engineering, plant fit or a real site. Historical orientation graphics remain historical evidence elsewhere.

Title and contents share one page. Keep each governing rule with its explanation and each pattern with its evidence label and qualification. Inspect every rendered page after substantive revision; a successful source check cannot establish good pagination or an accurate drawing.

Use the same pinned Source Serif 4 / Source Sans 3 font sources as the Working Edition, embedded during preparation. Host font substitutions must not determine the Primer’s pagination or drawing-label fit.

## Publication and assurance

The public title is **Ovid’s House — Primer**, derived from `project/identity.ts`, and the stable download is `/architecture/ovids-house-primer.pdf`. The Working Edition develops the full argument, evidence and detailed design material. Development history, workstream records, procurement detail and operating instructions belong outside the Primer.

Both editions use shared preparation/rendering infrastructure and are built from the same repository commit. The full Working Edition additionally uses the released production typography overlays defined in `publication/vivliostyle.config.js`.

Use the repository’s publication preparation, adapter/figure tests, validation and integrity checks. Reconcile PDF metadata and the generated data plate when pagination changes. A bounded Primer revision does not discharge the later whole-book editorial, physical-print or manufacture gates.
