# CCR — Compiler Correctness Repair

**State:** bounded correctness repairs and integrated identity-contract review complete; no expanded physical or regulatory proof.
**Audit baseline:** `a31efba595449295ef8b19cd55c7d2d49d7cb129` (29 October 2026).  
**Execution authority:** the registered CCR workstream and its canonical PCO nodes.

## Purpose

Repair the specific correctness and claim-boundary defects admitted by the whole-project audit. Establish that represented geometry, topology and provenance agree within the compiler's stated domain. Preserve explicit uncertainty and the distinction between a checked declaration and physical performance.

CCR is a finite successor to the completed compiler work. It does not reopen CH by implication, erase historical evidence, broaden the supported architectural domain, or create a permanent hardening queue.

Issue [#923](https://github.com/adamnoden/architecture/issues/923) retains its separate output-preserving Georgian source-to-view refactoring scope. CCR may intentionally change defective behaviour, diagnostics and consequent artefact identities; those changes must be recorded and validated, not concealed under an output-preservation claim. Current Georgian roof/layout selection and its migration remain with their architectural owners.

## Current results

- [CCR-PLAN — rectangle unions and plate closure](ccr-plan-result.md): complete at represented orthogonal-region scope; canonical and contrast outputs unchanged.

- [CCR-STAIR — relative datums and discrete topology](ccr-stair-result.md): complete at arithmetic/source-provenance scope.
- [CCR-DRAINAGE — source truth and bounded declarations](ccr-drainage-result.md): complete at authored topology scope; physical rainwater selection remains with RWT.
- [CCR-IDENTITY — tested compact identity guarantee and integration](ccr-identity-result.md): complete; existing schema retained, output byte identity remains separate.

## Audit finding allocation

| Audit observation | Canonical packet | Required disposition |
|---|---|---|
| Summed rectangle areas can falsely establish complete floor coverage | `CCR-PLAN` | Truthful region area and plate closure, with adversarial regression |
| Stair rise depends on elevation origin rather than floor-to-floor difference | `CCR-STAIR` | Correct derivation, datum invariance and controlling-input provenance |
| Fractional riser counts and inconsistent rise/going counts pass | `CCR-STAIR` | Explicit discrete topology constraints and controlled rejection |
| Source roof direction contradicts hard-coded drainage routes; blank or superficially different destinations pass | `CCR-DRAINAGE` | Source/route consistency, meaningful declaration validation and bounded independence claims |
| Compact compile fingerprint omits some runtime semantics | `CCR-IDENTITY` | Documented and tested identity guarantee, with versioned strengthening only where a consumer requires it |

The two stair observations share one execution node because their owning source, validation and derivation boundaries overlap. No implementation agent needs to recreate the audit before starting: reproduce the relevant counterexample, confirm current authority, then repair its owning layer.

## Execution and parallelism

| Node | Hard dependencies | Dispatch | Source boundary |
|---|---|---|---|
| `CCR-PLAN` | None | self-service | Shared plan-region derivation and validation |
| `CCR-STAIR` | None | self-service | Reference House stair source validation, arithmetic and method-input provenance |
| `CCR-DRAINAGE` | None | self-service | Reference House boundary adapter and bounded drainage declaration checks |
| `CCR-IDENTITY` | `CCR-PLAN`, `CCR-STAIR`, `CCR-DRAINAGE` | self-service | Identity contract, affected consumers and integrated reconciliation |

Use the canonical ACO lease for each node. Read the current owning files and existing gate results before changing them. Distinct source boundaries permit parallel investigation and implementation, but do not imply that all downstream artefacts are independent.

**Shared-output collision rule:** generated inspection outputs, manifests, fingerprints, frozen-baseline projections and some regression fixtures are shared. Integrate source packets one at a time. After another packet merges, reconcile against current `main`, regenerate affected outputs from the combined source, rerun relevant validation, and verify the exact head being merged. Never hand-edit generated output or carry a stale manifest forward to settle a merge conflict. Coordinate any necessary shared identity-file edit with its owning packet; do not overwrite another packet's provenance correction.

Each packet owns its implementation, focused regressions and durable result record. Record packet results under `project/ccr/` using the canonical packet identity. The final identity packet also records integrated closeout; a separate orchestration-only closeout node is not required.

## CCR-PLAN — truthful region area and plate closure

### Question and starting evidence

Can overlapping rectangles inside one semantic region conceal missing plate coverage?

The shared-plan contract describes spaces as unions of rectangles and promises non-overlap and per-level plate closure (`docs/computational/compiler-generality-assurance-cf01.md`, shared plan-semantic kernel). On the audit baseline, a 100 m² shell containing one room represented by the same 50 m² rectangle twice returns `PASS`, reports 100 m², and emits no diagnostics. The actual union covers only 50 m².

### Owning implementation

- `compiler/plan-slice/derive.ts`: `deriveRegion` sums component areas.
- `compiler/plan-slice/compile.ts`: region validation, inter-space overlap and plate closure.
- Existing shared-plan/CF-01 regression surfaces and their supported-domain documentation.

### Bounded change

Establish true union semantics, or explicitly require disjoint rectangle interiors and reject violations before summed area can establish closure. Prefer the smaller correct solution for the existing domain. Apply the chosen rule consistently to spaces and voids; do not add a general polygon/CAD kernel.

### Acceptance and closure evidence

- Duplicate and partially overlapping same-region components cannot conceal uncovered area.
- Valid disjoint decompositions retain their results; shared edges remain valid.
- Overlap, missing coverage, void exclusion and containment failures remain controlled diagnostics.
- Tests include both the original counterexample and a valid decomposition control; they do not merely repeat the chosen implementation's arithmetic.
- Recheck canonical and contrast fixtures. Record whether accepted current geometry changes; regenerate genuinely affected outputs from source.

This packet establishes geometric consistency at the declared orthogonal-region scope. It does not establish usable floor area, finished-wall construction, room quality or regulatory area compliance.

## CCR-STAIR — datum arithmetic and discrete topology

### Question and starting evidence

Do the encoded stair values describe a coherent discrete stair independently of the arbitrary elevation origin?

Observed counterexamples:

- Translating all floor/ceiling datums upward by 1,000 mm leaves floor-to-floor height unchanged but changes the full compile from `PASS` at 183.333 mm rise to `FAIL` at 238.889 mm.
- Raising only ground FFL by 1,000 mm retains `PASS` at 183.333 mm; the represented floor-to-floor difference instead implies 127.778 mm.
- Flight-rise groups `[5.5, 6, 6.5]` pass.
- Three six-rise flights with `goingsPerFlight = 100` pass and produce a 30,000 mm flight run.

### Owning implementation

- `compiler/reference-house/derive.ts`: rise, flight run and landing datums.
- `compiler/reference-house/compile.ts`: source topology and level prerequisites.
- `compiler/reference-house/model.ts`, only if a justified representation correction is needed.
- `compiler/rhc5/method.ts`: controlling-input provenance.
- Existing Reference House/RH-C5 tests and relevant lineage tests.

### Bounded change

Derive rise from `firstFfl - groundFfl`; derive landing elevations from their starting datum. Validate necessary finite and ordered inputs. Include both controlling floor facts in the relevant numeric provenance.

Require finite positive integer counts and an explicit checked relationship between flight rises and goings. If one `goingsPerFlight` value supports only a narrower arrangement, enforce that boundary or make the smallest justified representation correction. Do not fill absent stair geometry with assumed values merely to pass the check.

### Acceptance and closure evidence

- Common elevation translation preserves rise, pitch, 2R+G and calculation status; absolute landing elevations translate equally.
- Fractional, non-finite and inconsistent counts cannot pass.
- The unchanged canonical stair retains its correct arithmetic.
- Regressions exercise the canonical system path as well as any relevant isolated helper.
- Source-fact lineage identifies the actual controlling inputs, including ground FFL where it contributes.
- Record the admitted stair topology and its exclusions; reconcile affected outputs and identities.

The 30 m counterexample demonstrates missing internal relationships, not a pre-existing promise of complete stair-fit verification. Full landing geometry, headroom, guarding, access, fire strategy and construction tolerance remain outside this packet.

**CCR-STAIR result:** [relative datums, discrete flights and provenance](ccr-stair-result.md) repairs the admitted counterexamples without changing fixture geometry or the numeric method. Current output identities are rederived; spatial and technical adequacy remain outside this packet.

## CCR-DRAINAGE — source truth and bounded drainage declarations

Owning repair result: [CCR-DRAINAGE — source consistency and bounded declarations](ccr-drainage-result.md). This result closes its compiler counterexamples without selecting the current house's rainwater system.

### Question and starting evidence

Can the compiler report drainage declarations that contradict its own roof source or mistake weak text distinctions for physical independence?

Observed counterexamples:

- Set the valid typed input `source.roof.value.drainageDirection = 'inward'`: the full system returns `PASS`; the derived roof falls inward while all four boundary routes report outward drainage, with no diagnostics.
- Blank route endpoints pass the current declaration checks.
- Set the emergency destination to the primary destination plus a trailing space: the literal-inequality independence check passes.

### Owning implementation

- `compiler/rhc4/fixture.ts`: hard-coded drainage route declarations and their source adapter.
- `compiler/rhc4/hardening.ts`: selected route count and courtyard emergency-route checks.
- `compiler/boundary-slice/compile.ts` and `model.ts`: bounded declaration validation.
- `compiler/reference-house/derive.ts`: roof direction represented alongside those declarations.
- `compiler/rhc4/rhc4.test.ts`, applicable output/proof-boundary descriptions and supported-domain claims.

### Bounded change

Make the adapter consume the controlling source, or reject unsupported source conditions explicitly. Preserve the historical outward-roof contract; do not silently admit a new physical roof system to remove a diagnostic.

Require meaningful endpoint declarations. Normalise superficial whitespace when comparing textual declarations. State precisely what these checks prove: required endpoints and declared route separation. Neither unequal strings nor `visibleFailure: true` proves a physically independent overflow, a safe discharge, gravity continuity, hydraulic adequacy or visible failure in the actual building.

If a stronger existing claim cannot be earned from represented inputs, narrow it and retain an explicit unresolved obligation. Do not invent network geometry or a hydraulic solver to preserve the claim.

### Acceptance and closure evidence

- Inward source input cannot produce a passing outward drainage representation.
- The unchanged outward canonical fixture retains its correct result.
- Blank/whitespace-only endpoints cannot pass.
- Superficial text differences cannot establish declared destination distinction.
- Tests and result language distinguish source consistency, declaration completeness, declared separation and unproved physical independence.
- Unsupported roof cases fail closed at the stated boundary; source errors remain visible through canonical compilation and output generation.

**No RWT dependency:** correcting these existing compiler assertions requires no selected future rainwater system. RWT-00 records the inherited limitation; RWT-03/05/07 and ROF-RWT-GATE continue to own the selected current-house network, physical failure paths and courtyard consequences. CCR does not select outlets, size pipes, migrate current Georgian roof geometry, or establish real-site discharge acceptance.

## CCR-IDENTITY — an explicit, tested fingerprint guarantee

### Question and starting evidence

What equivalence does the compile fingerprint actually establish, and do its consumers claim more?

The compact manifest can remain unchanged when a runtime service-route endpoint changes while the source, statuses, counts and selected fields stay the same. Recomputing identity then returns the same compile fingerprint. This is omitted semantic coverage, not a SHA-256 collision.

CH-05 already documents a compact controlled manifest. Therefore omission alone is not grounds to require whole-object hashing. The packet must establish whether actual consumers or public claims exceed that bounded guarantee.

### Owning implementation and contracts

- `compiler/reference-house/identity.ts`.
- `compiler/ch05/README.md` and identity/lineage tests.
- `compiler/reference-house/output/build.ts`, `contract.ts`, manifests and consumer documentation.
- Effective source adapters under `rhc2/`, `rhc3/` and `rhc4/` only where necessary to establish the real provenance boundary.

### Bounded change

Inventory included and excluded semantics; trace the consumers of source, result and compile identity. Narrow names or claims where the compact summary is sufficient. If an actual consumer requires a stronger guarantee, add the smallest explicitly versioned identity covering the required effective inputs, results or implementation provenance.

Preserve the historical meaning of `HK-RH-COMPILE-1` and frozen evidence. Do not silently reinterpret existing fingerprints or rewrite historical identities. Keep intentionally excluded incidental ordering and diagnostic prose excluded unless a concrete contract change earns their inclusion.

### Acceptance and integrated closure evidence

- Documented guarantees match controlled semantic perturbation tests.
- Changes inside a claimed guarantee alter the relevant identity; deliberately excluded incidental changes do not.
- Historical and successor identities are distinguishable if a successor is required.
- Integrate all three prerequisite repair results on current `main`; reconcile generated outputs, manifests, provenance and their tests coherently.
- Reassess affected computational maturity evidence explicitly. Completion does not automatically promote maturity or establish physical validation.
- Record the disposition of every audit observation, remaining exclusions, final validation and repository hygiene.

## Common validation and exit

Every packet reproduces its counterexample before changing production behaviour, adds a meaningful regression and valid control, runs the relevant focused suites, and runs `npm run check` for its integrated head. Use the existing output verification/generation workflow when outputs are affected. Physical/rendered inspection is required when representation changes materially alter drawings; a hash comparison alone does not establish graphical correctness.

Closeout must identify what changed, what remains unchanged, what the result proves, what it does not prove, and the exact resulting source/validation identity. Preserve historical fixtures and accepted evidence unless a separately justified correction requires a versioned successor.

CCR is complete when all four packets have durable closure evidence, relevant defects no longer reproduce as false passes, identity claims match their tested scope, dependent outputs agree, and routine issue/branch/artefact cleanup has been reconciled. Report any genuine cleanup residue explicitly. No new generic hardening packet follows automatically.
