# ADE Reference House migration proof

This specimen proves ADE-07 migration and ADE-08 first-floor/contrast compatibility. It does not freeze publication tokens or record owner physical acceptance.

```sh
node --import tsx publication/specimens/ade07/generate.ts
node --import tsx publication/specimens/ade07/validate.ts
```

Generation uses the existing integrity-pinned Source Sans font fetcher. Output is disposable `.work/` data: ground/first-floor semantic and scene JSON, BOOK 1:100 fields (140 × 155 mm), A2 WALL 1:50 sheets (420 × 594 mm), asymmetric contrast sheets at both scales, protected v1 and failed direct-primitive controls, and the comparison/provenance manifest. Architectural dimensions use true scale; fonts, line weights and markers remain paper quantities.

The 140 mm BOOK field fits the accepted B5 140 mm text width without fit scaling. It is a candidate field, not a new trim or publication-layout release.

`accepted-proof.json` retains the exact reviewed proof identity and comparison ledger. Validation requires deterministic regeneration of that accepted manifest; it is not rewritten by generation.

The manifest accounts for every failed-control primitive as R (representation) or S (source/semantic correction). Unexplained X is rejected. It also records the source entity ledger; controlled source is not silently expanded into selected doors, stair-plan geometry, construction details or adequacy.

See `docs/publication/architectural-drawing-engine-closeout.md` for the acceptance boundary and PLT handoff. The proof workflow regenerates and uploads exact SVGs and manifests. Core scene and atlas fingerprints are retained in version control; generated font payloads are not duplicated into the repository.
