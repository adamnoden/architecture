# Compiler architecture audit — bounded hardening

Date: 2026-10-28. Audit and remaining work: [#923](https://github.com/adamnoden/architecture/issues/923).

## Question and baseline

Can the concrete admission, provenance, identity and test-execution defects be corrected while retaining current valid results and keeping active PLT source/representation work isolated?

Implementation began from main `349b30aeba59d56a0a280e6b1f86930c16e524ef` and reconciled the non-overlapping PLT updates through `cc6dd46337de514b8d42ac56fbbd055e82590152`. No Georgian geometry, drawing renderer, publication source, architectural choice or authority ceiling is changed by this packet.

## Changes and contracts

- Canonical test execution now includes the direct publication-drawing-v2 suite and the new core identity tests.
- `compiler/dpl/target.ts` admits consumed target fields before evaluation: nested space-table values, input arrays, applicability-rule fields, duplicate entity/row identities and source-snapshot references. Extensible metadata and unknown method classes remain intact; unknown methods still evaluate as unsupported. Invalid files receive contextual admission errors.
- Reference House floor-zone and boundary lineage uses actual source fact IDs. Default fixture lineage is unchanged; renamed input facts now retain correct attribution.
- Semantic fingerprints retain the existing canonical bytes for finite plain data, including omitted undefined object properties and authored array order. Unsupported non-plain objects, cyclic data and non-JSON values are rejected rather than silently collapsed. Canonical JSON serialization rejects non-finite numbers. Fingerprinting of controlled failed numeric inputs instead uses the disjoint `HK-NONFINITE-1` hash domain with a fully type-tagged tree. NaN, infinities, null and authored sentinel-shaped data cannot alias. This deliberately changes identities for exceptional numeric inputs while preserving controlled FAIL/UNSUPPORTED compilation and all existing valid fingerprints.
- Dependency checks recurse through runtime subdirectories, exclude tests and parse imports/re-exports/import types/dynamic literal imports using the existing TypeScript dependency. They now cover generic drawing, output and DPL boundaries. Historical Reference House source/coordination dependencies remain deliberate exceptions, not errors to conceal.
- Deployment evaluation lives in `compiler/dpl/evaluate.ts` with explicit Reference House source authority. The existing compile entry point remains a compatibility wrapper. Canonical synthetic-case loading captures an evidence bundle; `evaluateCanonicalReferenceSiteCase()` evaluates that bundle without consulting cwd or rereading authority files. Existing convenience calls preserve their defaults and result identities. Captured hashes attest the loaded evidence; this is not a new external-evidence verification service.

The deployment evaluator was relocated with its existing applicability, evidence, policy and aggregation semantics intact. Other historical readiness/trial modules retain their file-loading wrappers; a bulk rewrite has no earned benefit in this packet.

## Validation

- Typecheck passed.
- All 893 compiler tests passed on the reconciled source, including CH/COA/DRW controls, DPL, ADE, current PLT tests and the previously omitted v2 serializer tests.
- An isolated before/after comparison preserved the complete serialized Reference House result, canonical synthetic DPL result, their fingerprints and all six inspection output contents exactly.
- New regression tests exercise malformed target admission, renamed lineage, exceptional-number identities, unsupported serialization values, dependency syntax and cwd-independent evidence evaluation.
- The local canonical `npm run check` was attempted. The environment disallows tsx CLI IPC, so local execution used a node-import shim outside tracked source. The nomenclature mutation harness then intermittently retained its temporary README probe; its standalone source-regression command passed after restoration. No harness residue is included in the patch. The PR must pass the normal locked CI checks before merge; do not treat the local compiler suite as the complete repository/publication gate.

## Audit dispositions and PLT handoff

1. **Duplicated Georgian source dimensions: deferred under #923 until PLT offers a stable source boundary.** Refactor source-to-view geometry in a PLT-coordinated packet with baseline scene/SVG fixtures. Do not silently migrate frozen technical Reference House or historical mansard views into the exterior successor.
2. DPL target admission: corrected at the loader boundary.
3. Omitted v2 tests: corrected.
4. Hard-coded lineage: corrected.
5. Fingerprint information loss: corrected with the explicit valid/failed-input distinction above.
6. Dependency enforcement: extended to current generic representation/deployment boundaries.
7. DPL loading/evaluation coupling: canonical-case and deployment evaluation boundaries separated; historical owner-specific readiness wrappers retained deliberately.
8. ADE repeated geometric preparation: no implementation change. No measured bottleneck was established; leave active drawing machinery stable. Revisit only when profiling or a concrete maintenance change earns it.
9. Serializer duplication and historical helper locations: no broad move/extraction. Byte compatibility and provenance currently outweigh cosmetic consolidation. Georgian formatting/view decomposition can accompany the deferred geometry packet rather than competing with active PLT edits.

This hardening does not widen supported architecture, physical adequacy, external validation or regulatory claims. Existing status aggregations and proof boundaries remain owned by their domains.
