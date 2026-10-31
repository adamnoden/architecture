# SWE publication result

Owner-directed 31 October 2026; parent issue [#1174](https://github.com/adamnoden/architecture/issues/1174). This packet addresses accepted audit findings 2, 6 and 8. Implementation began from main `1378e249`, preserving the separately merged Primer revision and its current drawing, source selections, fonts and ten-page metadata.

## Changes and measured result

| Finding | Owning repair | Evidence |
| --- | --- | --- |
| PDF links retained obsolete source paths | Publication links leaving the book use the existing site route and source-exclusion resolver. Internal book links and non-page asset handling retain their existing roles. | Prepared output contains all 21 Primer pattern-index links and 10 Working Edition occurrences at their canonical routes, with zero obsolete `/architecture/docs/` URLs. The Working Edition occurrences address eight distinct targets. Excluded records resolve to their GitHub source. |
| Pinned fonts were redownloaded on every preparation | The seven pinned font/licence files are cached by their existing Git blob identities outside disposable `.work` directories. Every cache read is verified; corrupt/partial data is refetched and verified before atomic replacement. Staged files and upstream evidence are unchanged. | A cold run made seven requests in 190 ms; after deleting its output directory, a warm run made zero requests in 11 ms. All seven staged asset hashes and the provenance JSON matched. The preceding implementation made seven requests on both runs (218 ms and 150 ms). These are one executor's measurements, not a CI speed guarantee. |
| Mermaid rendering could discard adapted content | The render seam writes transformed Markdown before handing its path to Mermaid. The renderer result then feeds the remaining link preparation. | A regression starts with frontmatter/provenance and a Mermaid fence, applies adaptation and an inserted figure, and verifies the renderer receives that exact transformed text and preserves the changes. Current full/Primer entries have no Mermaid fences; this repairs a latent path, not demonstrated current book corruption. |

The same persistent font cache serves Working Edition, Primer and current PLT consumers. PDF-producing workflows restore it after `npm ci`; cached bytes never establish their own authority. Five font faces, upstream commit pins, licences and generated provenance remain unchanged. Repeated preparation in one job and warm CI caches can avoid the downloads; a cold cache still uses the verified network path.

## Validation and representation boundary

Local validation passed typecheck, all 17 publication unit tests, publication manifest/figure composition validation, publication integrity, both full and Primer preparation, workflow syntax/shape checks and diff hygiene. New regressions cover all Primer index routes, the eight Working Edition targets, excluded-source links, fragments/query strings, cold/warm/corrupt cache behaviour, network/integrity failure, Mermaid input ordering and URI extraction from a real PDF fixture.

The existing `publication:metadata:check` now requests PDF URI annotations from the shared cached inspector and rejects obsolete website-source routes in the **finished PDF**, not just prepared Markdown. Its ordinary full/Primer builds and metadata comparisons therefore exercise the delivered link boundary in native PR validation. The inspector cache schema is advanced for the optional annotation data; it remains disposable derived state.

Local finished-PDF rendering was not established: the local Vivliostyle server returned HTTP 200 to a direct loopback probe, while the installed browser received HTTP 503 for that same local viewer despite explicit localhost bypass settings. Remote proxy configuration and TLS remained intact. No font, drawing, layout or validation rule was weakened to force a pass. Exact-head native PR health, PDF/metadata checks and production typography proof remain the required merge gates and own the finished-output results; their run/merge identities belong to the PR.

No publication page counts were hand-edited. The existing metadata checks must confirm the current full and Primer pagination. No architectural claim, source geometry, typeface selection, print metric or historical proof baseline is promoted by this software repair.

## Durable ownership and closeout

- Link/render seams: [preparation helpers](../../publication/preparation.ts) and [preparation entry point](../../publication/scripts/prepare.ts).
- Font identity/cache: [shared pinned font loader](../../publication/fonts.ts).
- Final-PDF link check: [PDF inspector](../../publication/pdf-inspector.ts) and [metadata entry point](../../publication/scripts/metadata.ts).
- Regressions remain in the ordinary publication test command, including the recently added Primer figure tests.

SWE-PUBLICATION is complete only through its validated integration. The parent programme remains open for the independently leased control, automation and identity packets. Runtime claims, native-run evidence and branch cleanup remain operational closeout responsibilities; this result is not a lease or an alternative status source.
