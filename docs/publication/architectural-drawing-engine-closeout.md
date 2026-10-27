<!-- nav-exclude: redirect -->
# Architectural Drawing Engine — migration and closeout

**Scope:** ADE-07 / #820 and ADE-08 / #821; parent #812.  
**Starting main:** `7b7bfa2074c55e18dca840c45246f376de1ae448`.  
**Result:** accepted internal representation capability; owner physical review remains with PLT.

## Result and authority

The Reference House ground plan now composes through a generic architectural plan compiler, rather than the failed PLT direct-primitives implementation. The same adapter/compiler produces the first-floor compatibility candidate. A six-sided asymmetric non-Reference-House fixture uses the same API, without Reference House IDs or special cases in the engine.

The protected `drawing-publication-v1` SVG remains byte-identical. The old PLT candidate remains a comparison control. This work does not replace the frozen publication corpus, select technical construction, increase maturity or record physical acceptance.

The new candidates are exact BOOK 1:100 fields of 140 × 155 mm and exact A2 WALL 1:50 sheets of 420 × 594 mm. The BOOK field fits the accepted B5 text width without reduction. Architecture scales; strokes, text, ticks, uncertainty markers and annotation clearances remain physical paper quantities.

## Source and representation decisions

- RH-10 owns the coordination-level layered envelope. Its approximately 410–435 mm geometric family and the existing 400–425 mm planning allowance remain distinct. The drawing uses 417.5 mm overall: about 102.5 mm weathering masonry, a represented 160 mm cavity, about 140 mm structural masonry comparator and about 15 mm finish. That choice fits both ranges and selects no construction specification or performance.
- ADE-05A owns physical dry-framed non-loadbearing partitions, with a provisional 100–150 mm range. The drawing represents 125 mm; it does not revive the old publication-only thickness as source nominal. Partitions remain service-free and boundedly rebuildable; no proprietary system, fixing, rating or doorset is chosen.
- Shell lines remain outer faces; courtyard lines remain void faces; partition lines remain planning datums with a centred representative body. Same-family authored junctions share nodes. Physical partitions stop geometrically at envelope material through explicit assembly abutments; paint order does not hide overlaps.
- Approximate openings cut their authored nominal aperture. Ranges cut only the guaranteed minimum and retain the full range in external notation. Known-centre/unknown-width and host-only relationships create no plausible aperture. All required shared-edge adjacencies remain obligations; no internal door location, leaf or swing is invented.
- Planning-room boxes remain reservations. This representation does not turn their areas into finished clear areas, fill missing boundaries or certify circulation/structural/acoustic adequacy.

## Shared defects found during composition

Opening annotations previously applied a paper-plane left normal while calculating material depth in model-plane left/right. The plan projection reflects the vertical axis, so the leader could stop at the wrong physical face. The engine now preserves architectural left/right through projection. Regressions cover all four wall directions at both scales. The affected ADE-06 atlas outputs were regenerated, inspected and fingerprinted; the old atlas artifact remains historical evidence.

Vertical composed dimensions previously left their labels horizontal. The book field exposed clipping at the left margin. Labels now follow the measured direction, with upright normalisation. The horizontal capability remains unchanged. Adjacency bracket ends now withdraw from junction material while preserving the complete source candidate edges in semantic data; the shortened bracket does not select an aperture. Candidate fragments too short to clear the represented junction are omitted graphically while remaining in semantic data; regression checks require every adjacency obligation to retain a visible bracket at both scales.

## Comparison accounting

The generated manifest accounts for every primitive of the failed current-authority control:

| Class | Account |
|---|---|
| R | room/court label layout and bounded abbreviation; composed overall dimensions; retained stair-topology annotation; retained north, bay-axis and scale notation |
| S | independent wall bodies become joined assemblies; planning-boundary strokes become source-owned partitions; white aperture masks/dashed pseudo-jambs become real subtraction/external uncertainty; host traces become possibility bands; shared edges become adjacency brackets |
| X | empty; an unrecognised control family stops generation |

The protected v1 comparison is a deliberate source-authority rewind: publication-only doors, stair-plan geometry and other unsupported specifics remain omitted, as already required by the ADE-00/current-authority gate. No new C-class geometry is admitted. Source entity ledgers, opening precision states, represented thicknesses and control hashes are machine-inspectable in the specimen manifest.

## Screen review

The final ground/first-floor candidates at both scales and the asymmetric contrast pair were rendered with the pinned Source Sans faces. Joined outer and courtyard corners, material subtraction, cavity continuity, provisional partition hierarchy and external uncertainty remain legible. The 1:100 field retains quiet layer separation; the 1:50 candidate gives the same facts more physical space. The vertical dimension no longer clips. Narrow gallery labels rotate; the dressing label is abbreviated without changing room intent. Brackets and possibility bands remain identified as obligations in the review key below.

**KEEP** the migration and the shared API. **Do not freeze print micro-tokens from screen review.** Actual tint, marker and bracket balance remains subject to PLT physical review.

## Regression and reproduction

Local focused validation passed 49 architectural/migration tests, four v2 terminal tests, both specimen validators and the protected v1 regeneration check. The repository health run progressed through the semantic suites and publication checks, then its Chromium figure-validation subprocess hit this workspace’s browser-launch restriction. The clean-environment full-health check, v2 terminal contracts, atlas regeneration and migrated-plan proof all passed in PR #884. Its dedicated workflow additionally retains the exact proof artifacts; the PR checks identify the validated head and final run.

- `npm run check` is the repository-wide health gate.
- `npm run test:architectural-drawing` proves existing topology, assembly, opening, partition, dimension and scale contracts plus generic composition/contrast negatives.
- `npm run test:rh-c1` includes complete ground/first-floor source coverage and four deterministic core-scene fingerprints.
- `node --import tsx --test compiler/publication-drawing-v2/*.test.ts` protects terminal byte compatibility.
- ADE-06's validator now checks accepted atlas fingerprints as well as physical scale and provenance.
- `publication/specimens/ade07/accepted-proof.json` retains the exact reviewed proof identities and full R/S/X ledger.
- `publication/specimens/ade07/generate.ts` and `validate.ts` regenerate and verify six exact vector candidates, the controls and complete R/S/X accounting. They use integrity-pinned fonts and no raster content or fit scaling.
- `.github/workflows/ade-reference-house-proof.yml` retains this as a repeatable regression/inspection job, with read-only repository permission and uploaded proof artifacts. It is not a one-shot release helper.

Fingerprints lock reviewed representations, not architectural adequacy. Changing an accepted fingerprint requires inspection and an explained owning-source change; updating a digest alone is insufficient.

## Stable downstream contract

| Shared downstream capability | Domain boundary |
|---|---|
| authority, precision, provenance and distance resolution | reusable across plan, section, elevation and axonometric work; source remains authoritative |
| paper units, physical tokens, composed labels/dimensions and deterministic vector backend | shared; each view still needs its own justified projection and layout |
| rectilinear joined wall networks and layered assembly bands | plan cut geometry; not an elevation or a volumetric/structural model |
| hosted opening subtraction | rectilinear plan hosts with aperture wholly inside a host segment; endpoint/junction-spanning openings remain unsupported |
| opening uncertainty, partition-datum and adjacency semantics | meanings shared; graphic placement is view-specific and must be proved where transferred |
| generic plan composer | supports the accepted plan capabilities; not a general 3D building compiler |

PLT-04 onward may consume `createReferenceHouseAdePlan`, `createReferenceHouseAdePlanScene` and the generic compiler as appropriate. Later elevations/sections must not be forced through plan-only topology. No further low-level backend extension was earned here; the existing v2 path capability is sufficient.

Non-orthogonal walls, ranged opening positions and endpoint-touching apertures continue to reject. Internal doors, stair-plan geometry, lintels, frame positions, ties, insulation products, technical closures and performance remain outside this release.

## PLT handoff and physical review

ADE's internal capability/migration work is complete. PLT-03 can restart review from the new ground plan; the earlier failed candidate cannot be used for token extraction. The prior A2 1:50 scale finding remains a precedent only.

Print the A2 candidate at **100% / actual size**. Review outer/courtyard joins, the white cavity, quiet inner-leaf distinction, aperture subtraction, the opening range spans, the two courtyard point markers, host possibility bands, partition abutments, adjacency brackets, dimensions, text and scale bar. Review the book candidate at actual 1:100 alongside it. The review key is: external span = approximate/ranged aperture; diamond = centre known/width unknown; faint host band = occurrence without position; offset bracket = required connectivity without chosen door.

**Owner physical verdict: UNREVIEWED. Print tokens: NOT FROZEN. Final manufacture: still gated by independent PLT drawing freeze.** These obligations remain open under PLT #422; they are not converted into an ADE completion claim.

## Closeout hygiene

No temporary release helper, write permission, calibration fixture or unearned backend extension was added. The asymmetric fixture and read-only proof workflow remain because they enforce the accepted generality/regeneration contract. Local specimen work directories are disposable and excluded or removed; accepted evidence remains in the source/proof manifests and workflow artifacts.

**Cleanup: clean.** The two pre-existing orphan refs, `ade-04a-opening-subtraction-replay` and `ade-07-reference-house-ground-plan`, were absorbed into the existing `delete-me` disposal branch through PR #886 and PR #885 respectively. Both PRs were merged and both source refs were verified absent afterwards. Their original tips remain preserved by main's accepted history. The implementation branch was also automatically deleted after PR #884. The disposal branch is intentionally retained as the established cleanup sink.
