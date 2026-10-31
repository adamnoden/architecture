# CH-05 — determinism, identity and provenance

**Gate:** CH-05  
**Baseline:** CH-04 merge `6e35c285b9a6b70a6f1f3873a8faa4cdbf63fb85`  
**Computational maturity:** M3  
**Reference House capability sequence:** closed at RH-C5; no RH-C6 authorised

CH-05 gives the existing canonical compiler stable semantic identity and selected derivation lineage. It does not add architectural facts, technical methods, physical evidence or regulatory authority.

## Result

The gate adopts five bounded changes:

1. explicit canonicalization for Reference House source collections whose order has no architectural meaning;
2. SHA-256 semantic fingerprints for canonical source, the selected calculation method and a compact semantic result manifest;
3. a lightweight compile schema/version and combined compile fingerprint;
4. focused permutation-invariance tests plus an explicit counterexample showing that authored sequence remains identity-bearing;
5. small lineage records from selected outputs to existing source-fact IDs, method IDs and coordination-rule identities.

The CH-00 six-SVG Git blob identities remain the artefact regression authority. CH-05 links those existing hashes to the canonical compile/source identity rather than replacing them with a second rendering authority.

## Ordering policy — classify before canonicalizing

CH-05 does not recursively sort every array.

The following top-level Reference House collections are treated as declarative sets for semantic identity:

- `spaces`;
- `boundaries`;
- `requiredAdjacencies`;
- `openingFamilies`;
- `openings`;
- `qualitativeOpeningRelationships`.

They are canonicalized by semantic `id` before source hashing. The CH-05 contract independently reverses each collection, then reverses them together, and requires both the semantic source fingerprint and complete canonical compile result to remain identical.

Nested arrays are otherwise preserved unless separately classified. This matters because some order is authored meaning. The stair `flightRiseGroups` sequence controls landing accumulation, for example. CH-05 proves that two sources containing the same `[5, 6, 7]` rise groups in different order receive different semantic source fingerprints. Canonicalization therefore describes the existing source language rather than silently redefining it.

This is intentionally narrower than a general permutation/property-testing framework. CH-06 owns broad generated-state testing.

## Stable source identity

`compiler/core/identity.ts` provides two small primitives:

- deterministic JSON serialization with recursively sorted object keys while preserving array order;
- SHA-256 over that serialization.

`compiler/reference-house/identity.ts` adds the Reference-House-specific ordering classification before hashing.

The canonical result now exposes:

```text
identity.source.algorithm = sha256
identity.source.semanticFingerprint = <64 hex chars>
```

This is distinct from the CH-00 `git-blob-sha1` of `compiler/reference-house/fixture.ts`.

The Git blob answers: **are these exact repository file bytes the same?**

The CH-05 semantic fingerprint answers: **does this represented Reference House source have the same controlled meaning under the ordering rules currently declared by the compiler?**

Neither fingerprint proves architectural or physical adequacy.

## Calculation-method identity

The selected private-stair method already had a method ID, implementation version and explicit guidance authority. CH-05 adds a semantic SHA-256 fingerprint of that bounded method definition.

Criterion array order is classified as presentation order rather than calculation meaning, so method fingerprinting sorts criteria by criterion ID. A test proves that reversing criterion order preserves the fingerprint while changing the private-stair pitch limit changes it.

The identity surface therefore carries:

```text
method id
method version
method semantic fingerprint
```

This fingerprint means only that the encoded method definition is the same. It is not evidence that the external guidance was interpreted correctly and does not expand RH-C5's proof boundary.

## Result and compile identity

CH-05 introduces one lightweight schema identifier:

`HK-RH-COMPILE-1`

It versions the meaning of the identity manifest, not the architecture itself.

The semantic result fingerprint is deliberately computed from a compact controlled manifest rather than `JSON.stringify` of the complete runtime object. It includes:

- fixture and aggregate/domain statuses;
- proof boundaries;
- stable diagnostic identities;
- the high-value geometric/count values already controlled by CH-00;
- selected crossing identity;
- boundary coordination quantities;
- selected private-stair method/result identity and criterion observations.

It does not include incidental object insertion order, prose diagnostic messages or the new lineage/identity wrappers themselves.

A combined compile fingerprint hashes:

```text
schema version
+ semantic source fingerprint
+ selected method identity/fingerprint
+ semantic result fingerprint
```

This makes the **declared compact compile summary** inspectable. Equal fingerprints do not establish equality of the complete runtime object, all effective adapter inputs, compiler implementation or rendered artefact bytes.

### Current guarantee clarification — CCR-IDENTITY

`HK-RH-COMPILE-1` retains its historical meaning. The source fingerprint covers the supplied Reference House source under the declared ordering rules; it does not independently hash the structural, service or boundary declarations constructed by adapters. The selected method fingerprint covers the encoded method definition, not executable implementation bytes or external authority validity. The result fingerprint covers the fields listed above, including controlled diagnostic codes/statuses/subjects, and excludes detailed service-route endpoints, much detailed runtime geometry/topology, diagnostic prose and lineage wrappers.

A controlled endpoint perturbation with source, statuses and compact fields held fixed therefore preserves the compile fingerprint. It changes the actual generated service register and its separate SHA-256 content identity. This is an explicit coverage boundary, not a cryptographic collision or an admitted altered design. A compile stamp alone must not be used as a cache key, equality certificate or current-applicability claim for the full result or an output.

The output manifest pairs that association with renderer metadata and actual per-output byte hashes; `outputs:check` regenerates and compares the committed outputs and manifest. Historical candidate consumers additionally need their own exact source/evidence pins and applicable replay. The [CCR identity result](../../project/ccr/ccr-identity-result.md) inventories those consumers and records the integrated repair boundary. No actual consumer requires a new whole-runtime identity in this packet.

## Lightweight lineage

The canonical result now exposes a deliberately small `lineage` surface.

Selected examples:

- floor-zone depth → `RHCF-CEIL-G`, `RHCF-FFL-1` + `RH-FLOOR-ZONE-DEPTH`;
- roof catchment total → shell/courtyard source facts + `RH-C4-ROOF-CATCHMENT-GEOMETRY`;
- courtyard open-sky area → `RHCF-COURT-SIZE` + its RH-C4 coordination rule;
- wall planning stress thickness → `RHCF-WALL-STRESS`;
- each private-stair criterion → the existing criterion `sourceIds` plus `ADK-2013-PRIVATE-STAIR-GEOMETRY`.

The source fact IDs already existed as authority/provenance anchors. CH-05 references them rather than wrapping every scalar or arithmetic operation in metadata.

This is a trace index, not a provenance graph framework.

## Artefact identity integration

CH-00 remains authoritative for the exact Git blob SHA-1 identities of the six committed SVG projections.

CH-05 does not duplicate those hashes in production source. `linkReferenceHouseArtefacts()` associates the caller-supplied CH-00 artefact map with a compact compile fingerprint and semantic source fingerprint. It reads no artefact bytes, verifies no supplied pin and does not prove that the map was generated by that compile. The CH-05 contract reads the CH-00 machine baseline, requires all six controlled artefacts to remain present and demonstrates the link to the same compile identity.

Drawings remain downstream projections, never source authority.

## Determinism evidence

The canonical source is compiled repeatedly and must produce identical identity.

More importantly, the gate tests semantic permutation rather than only byte repetition. For every declared unordered Reference House collection, reordering must preserve:

- semantic source fingerprint;
- the complete canonical `compileReferenceHouseSystem()` result, including identity and lineage.

A deliberately ordered source sequence is tested in the opposite direction so the canonicalizer cannot gain false confidence by sorting everything.

The first implementation PR head passed the complete repository test stack and docs build. CH-05 then strengthened the metamorphic test from one combined reversal to independent reversals for every declared unordered collection plus the combined case before closeout.

## Deliberate non-moves

CH-05 does not:

- introduce a general property-testing or random-generation framework;
- hash every domain object or arithmetic intermediate;
- create Merkle trees, signatures, event logs, databases or distributed content addressing;
- make Git/blob identity compete with semantic source identity;
- reorder authored sequences merely to improve determinism;
- change CH-04 nominal-ID/unit/readonly policy;
- change any Reference House fixture fact, technical method outcome, diagnostic meaning or proof boundary;
- add a new technical calculation family;
- increase computational maturity;
- create RH-C6.

## Preservation contract

CH-05 passes only if:

- CH-00 semantic values, diagnostic sets, proof boundaries and six SVG identities remain exact;
- CH-01 fail-closed behaviour remains green;
- CH-02 dependency boundaries remain green;
- CH-03 single-pass/equivalence behaviour remains green;
- CH-04 nominal-ID, unit, tolerance, readonly and source-immutability contracts remain green;
- CF-01 and every historical RH-C gate remain green;
- runtime numeric values and selected calculation outcomes remain unchanged;
- semantic permutations classified as unordered compile identically;
- authored sequence remains identity-bearing;
- M3 remains unchanged and no RH-C6 appears.

## Historical handoff

CH-05 handed the question of broader property/mutation testing to [CH-06 — strengthen the kinds of tests](../ch06/README.md). That gate records the bounded law tests adopted and frameworks declined. The [CH programme](../../docs/computational/compiler-hardening-programme.md) is complete; this historical handoff creates no further test-infrastructure work.
