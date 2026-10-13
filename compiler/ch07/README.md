# CH-07 — toolchain and developer ergonomics

**Gate:** CH-07  
**Status:** PASS  
**Starting main:** `41b2e4f6dbed42c117db964ec54423997fd77c39`  
**Issue:** #69  
**Computational maturity:** M3  
**Reference House capability:** RH-C0 through RH-C5 remain closed; no RH-C6

## Question

Is the compiler boring and obvious to maintain: can a clean checkout establish repository health and generated-artefact integrity through a small, explicit command/toolchain surface without adding maintenance machinery or changing architectural semantics?

## Audit

The repository already had most of the necessary machinery, but the developer contract was implicit:

- `npm test` ran the complete typecheck/repository/compiler/publication-validation test stack;
- PR CI separately ran `npm test` and then `npm run docs:build`;
- main CI repeated those commands before building both PDFs and deploying Pages;
- CH-00 already proved exact reproducibility of all six committed Reference House SVGs;
- CH-05 already linked those artefact identities to canonical source/compile identity;
- C1/C2 generation required `PASS`, while C3/C4 permitted `REVIEW` because they rejected only `FAIL`;
- CI selected Node 24 directly, while local development had no matching runtime file;
- dependency installation was already deterministic through committed `package-lock.json` and `npm ci`;
- there was no demonstrated formatter/linter failure worth introducing another tool for.

The correct CH-07 move is therefore to expose and align existing controls rather than build a new toolchain.

### Baseline reconciliation

The first CH-07 PR validation reached the new health command but exposed an unrelated defect already present on its starting `main`: the newly added publication credibility/release programme was substantive published Markdown but absent from curated navigation. That prerequisite was repaired separately in PR #73 and merged as `294ed4f6ec3c28a2be248feaaa4486d7b2924d06`. It is not part of the CH-07 diff or claim.

## Implemented contract

### One health command

`npm run check` is the canonical normal repository-health command:

```text
npm test && npm run docs:build
```

`npm test` remains the underlying complete test suite and remains useful independently. Both PR and main CI now call `npm run check`, so local and CI health do not have separate definitions.

### Check-only artefact verification

`npm run artifacts:check` composes the existing CH-00 and CH-05 tests:

```text
npm run test:ch00 && npm run test:ch05
```

It does not run a generator or write tracked files. CH-00 re-renders all six canonical SVGs in memory, compares their bytes with the committed files and verifies their frozen Git-blob SHA-1 identities. CH-05 binds the same artefact set to canonical source/compile identity. No competing manifest or verification framework is introduced.

### Explicit generation path

`npm run artifacts:generate` composes the existing RH-C1 through RH-C4 generators. The historical per-gate generation commands remain available.

A small shared policy function, `assertCanonicalArtefactGenerationAllowed`, now requires **overall gate `PASS`** before canonical generation. C1/C2 retain their established PASS-only policy; C3/C4 are tightened from “not FAIL” to PASS-only and now use the whole gate status rather than only a downstream slice status.

This changes when tooling is willing to overwrite a canonical file. It does not change compiler status semantics, canonical source, rendered bytes or proof boundaries.

### Runtime and install policy

`.nvmrc` now selects Node 24, matching CI. GitHub Actions reads that file instead of duplicating the version literal.

`package-lock.json` remains the dependency authority and `npm ci --no-audit --no-fund` remains the clean-install command. The existing `engines.node` field remains a broader compatibility floor; `.nvmrc` is the canonical development/CI runtime.

No package-manager wrapper or package-manager switch is introduced.

### CI ergonomics

Both workflows enable setup-node's npm cache; `node_modules` is not cached.

PR validation now cancels superseded runs for the same pull request. Main/Pages deployment keeps `cancel-in-progress: false`: deployment reliability is preferred over interrupting a release already in progress.

The main workflow uses `npm run check`, then performs the two publication PDF builds and Pages assembly/deployment. Publication behaviour is otherwise unchanged.

### Formatter/linter decision

No formatter or linter is added. TypeScript checking, repository validation, dependency-law tests and the existing gate suites already enforce the correctness-sensitive conventions identified in the audit. No concrete defect class was found that justified another dependency, configuration surface or mass reformat.

This is a deliberate non-move, not a claim that formatting/linting tools are generally useless.

## Developer documentation

`compiler/README.md` now records the install, health, targeted-test, artefact-check, artefact-generation, CI and proof-boundary workflow close to the compiler itself.

## Mechanical contracts

`compiler/ch07/ch07.test.ts` protects the developer/toolchain contract:

- PASS-only canonical artefact generation;
- all four canonical generators use the shared policy against overall gate status;
- exact health/check/generation command composition;
- CI consumes `npm run check` and `.nvmrc` with npm caching;
- PR supersession cancellation remains enabled;
- artefact verification remains explicitly non-generating;
- local canonical Node major remains 24.

## Validation

PR #72 exact-head validation reached the complete CH-07 command surface and passed in run `38476274466` after the unrelated navigation prerequisite was repaired. The full suite preserved CH-00 through CH-06, CF-01, RH-C2 through RH-C5, publication validation and all six frozen SVG identities. No compiler semantic, proof-boundary, canonical source or drawing-renderer change was required.

## Preservation boundary

CH-07 preserves:

- `createReferenceHouseSource()` source authority;
- `compileReferenceHouseSystem(source)` as canonical production path;
- CH-00 semantic/proof/artefact baseline and six exact SVG identities;
- CH-01 fail-closed behaviour;
- CH-02 dependency-boundary enforcement;
- CH-03 single-pass/equivalence contract;
- CH-04 nominal-ID/unit/tolerance/readonly/immutability contracts;
- CH-05 source/method/result/compile identity, manifests, lineage and artefact linkage;
- CH-06 deterministic law/property/metamorphic evidence;
- CF-01 and RH-C2 through RH-C5 historical meanings;
- generated drawings as downstream projections;
- runtime numeric values and selected calculation outcomes;
- computational maturity M3;
- no RH-C6.

## Result

**PASS.** A clean checkout now has one obvious repository-health command, one explicit non-mutating artefact-verification path, one explicit canonical generation path, one local/CI Node authority and a concise compiler developer workflow. Canonical generation is consistently PASS-only. CI reuses the same health contract rather than duplicating it. No new tooling dependency, compiler capability, architectural claim or maturity promotion was introduced.

**Next:** CH-08 — distillation and deletion.
