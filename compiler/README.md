# Compiler developer workflow

The compiler is a bounded internal model of architectural relationships already authorised elsewhere in the project. A green compiler establishes software consistency at its stated proof boundaries; it does not establish structural adequacy, Building Regulations compliance, building-physics performance or whole-building technical adequacy.

## Install

Use the repository's canonical Node major:

```sh
nvm use
npm ci --no-audit --no-fund
```

`.nvmrc` is the local/CI runtime authority and currently selects Node 24. `package-lock.json` is committed; use `npm ci` for a clean deterministic install. The broader `engines.node` range in `package.json` is a compatibility floor, not the canonical CI runtime.

## Repository health

Run:

```sh
npm run check
```

This is the normal answer to “is the repository healthy?” It runs the complete test/typecheck/publication-validation suite through `npm test`, then builds the documentation site. Pull-request CI uses this same command rather than maintaining a second definition of repository health.

`npm test` remains useful when only the test suite is required. Historical and specialist gates remain individually addressable through commands such as `npm run test:rh-c4`, `npm run test:ch06` and `npm run test:ch07`.

## Canonical Reference House artefacts

To verify committed generated SVGs without rewriting them:

```sh
npm run artifacts:check
```

The command reuses the CH-00 and CH-05 contracts. CH-00 checks that all six committed SVGs exactly reproduce from the canonical model and retain their frozen Git-blob identities; CH-05 binds those artefact identities to the canonical source/compile identity. This is the check-only path.

To deliberately regenerate the canonical SVGs:

```sh
npm run artifacts:generate
```

Generation composes the existing RH-C1 through RH-C4 generators. Every canonical generator requires the **overall gate status to be `PASS`**. `REVIEW` and `FAIL` states are inspectable compiler results but are not permitted to overwrite canonical artefacts.

The historical per-gate generation commands remain available when a narrower operation is needed:

```text
npm run rh-c1:generate
npm run rh-c2:generate
npm run rh-c3:generate
npm run rh-c4:generate
```

Generated drawings remain downstream projections. They are not source authority.

## CI contract

Pull requests install locked dependencies and run `npm run check`. Superseded runs for the same pull request are cancelled.

`main` uses the same Node runtime, npm cache and `npm run check`, then builds the Working Edition and Primer PDFs and deploys the documentation site. Pages deployment itself remains non-cancelling so a release already in progress is not deliberately interrupted.

## Tooling decisions

CH-07 does not add a formatter, linter, task runner or package-manager wrapper. The repository already has TypeScript checking, dependency-boundary tests, repository validation and deterministic compiler gates; no concrete correctness or maintenance failure was identified that justified another tool or a mass formatting pass.

The npm cache is enabled in CI because it is a low-risk optimisation over the locked install. `node_modules` is not cached.

## Authority and proof boundaries

The main computational authorities are:

- `compiler/reference-house/fixture.ts` — canonical Reference House source fixture;
- `compiler/reference-house/system-compile.ts` — canonical single-pass Reference House compilation;
- `compiler/ch00/reference-house-baseline.json` — frozen semantic/proof/artefact baseline;
- `docs/computational/compiler-hardening-programme.md` — hardening programme and preservation boundary.

When a toolchain change appears to require changing architectural output, proof boundaries, canonical artefact bytes or compiler semantics, stop treating it as developer ergonomics and investigate the semantic change explicitly.
