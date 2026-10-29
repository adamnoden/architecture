# CCR-PLAN — rectangle unions and plate closure

**Result:** complete at represented orthogonal-region consistency scope.
**Observed main:** `f8e0f5a174374b6a7c39e9bbc417392cbd227ac4`, 29 October 2026.
**Authority:** [CCR programme](compiler-correctness-repair-programme.md), issue #1004.

## Reproduction and owning correction

Before changing production code, a direct `compilePlanSlice` call reproduced the audit: one room represented by two identical 5000 × 10000 mm rectangles in a 10000 × 10000 mm shell returned `PASS`, room area100000000 mm², plate area100000000 mm² and no diagnostics. The actual covered area was50000000 mm². The retained regression constructs that source without openings, voids or unrelated obligations.

The shared kernel now implements its already documented union semantics. `compiler/plan-slice/region-area.ts` partitions the declared axis-aligned rectangles at their x edges and measures merged y intervals in each slab. Duplicate, contained and partially overlapping components contribute their covered area once. `deriveRegion` applies it equally to spaces and voids; available plate subtracts each valid void union. It is a small rectangle operation, not a polygon model, geometry migration or inferred architecture.

Distinct semantic regions still cannot overlap. Their overlap diagnostic now measures the union of pairwise intersections, preventing duplicate components from inflating the reported overlap. Existing containment, valid-box, space/void exclusion and plate-closure checks remain authoritative. Numeric tolerances are unchanged; area derivation adds no snapping. Invalid boxes return a non-finite area and retain controlled compiler diagnostics rather than becoming a passing zero-area substitute.

True union semantics were chosen instead of forbidding overlapping components because the public supported-domain contract already calls spaces and voids rectangle unions. This retains valid overlapping descriptions as well as disjoint decompositions. No new input schema or identity version is needed for this bounded correction; CCR-IDENTITY still owns the integrated identity guarantee review.

## Meaningful regressions

`compiler/cf01/region-union.test.ts` adds eight canonical compile-path cases:

- duplicate half-plate false pass now fails with truthful50m² area and `PLATE_CLOSURE_MISMATCH`;
- partial overlaps whose summed100m² concealed a missing strip now report80m² and fail;
- single, disjoint shared-edge, overlapping and nested/reordered descriptions of the full plate all pass with100m²;
- an L-shaped64m² union plus a distinct36m² corner room closes correctly;
- duplicate/partially overlapping void components exclude60m² once, leaving40m²;
- a duplicated25m² void cannot manufacture closure for an incomplete50m² room;
- distinct overlapping spaces and voids still fail, reporting the actual20m² overlap once;
- shell containment, void exclusion and invalid space/void geometry retain controlled failures.

The existing seven CF-01 tests cover both canonical Reference House and contrast fixtures, qualitative/source ownership, deterministic projection, host escape and missing area. All15 pass with the correction. The new fixture deliberately contains only supported orthogonal regions; it is not a new building design or enlarged assurance domain.

## Output and proof boundaries

TypeScript, CF-01 and CH-05 identity/lineage tests pass. `compiler/reference-house/output/verify.ts` confirms all current generated outputs remain current without regeneration or manual edits. The unchanged canonical source's valid decompositions therefore retain its compile/output identities, while defective alternate inputs now produce different truthful results. Historical frozen gate evidence is preserved; the public CF-01 document adds a dated correction instead of rewriting its old seven-test count.

Full repository check and exact-head CI evidence belong to the PR. Shared CCR source packets must integrate serially, verify or regenerate affected outputs from the combined accepted source, and retain their separate leases/results. This packet changes no current house geometry, roof/water selection, physical evidence, maturity level or historical identity contract. It proves geometric consistency within declared orthogonal regions, not usable area, finished wall construction, room quality or regulatory compliance. CCR-STAIR/DRAINAGE and CCR-IDENTITY remain independent work.
