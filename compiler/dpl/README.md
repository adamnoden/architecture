# Deployment orchestration

This directory contains the first **bounded executable deployment-orchestration slice** admitted by the DPL programme.

Its authority begins at DPL-12A / issue #398 and is intentionally narrower than the eventual deployment compiler.

## What this layer does

DPL-12A composes already-controlled inputs:

- the current Reference House source identity;
- an admitted DPL site record and its explicit screening unknowns;
- controlled site-interface contract identity;
- the first England technical target slice;
- the first London strategic-planning target slice;
- explicit proposal facts supplied for a compile;
- explicit evidence items supplied for a compile.

It then produces a deterministic **obligation/evidence ledger** preserving:

- target authority class;
- applicability state;
- method class;
- obligation result;
- evidence lifecycle independently of result;
- missing inputs;
- cross-target edges;
- semantic fingerprints for the deployment case and resulting ledger.

The loader intentionally reads the controlled `project/dpl/` artefacts from disk. JSON imports are not used and unsupported schemas fail closed.

## What this layer does not do

DPL-12A does not:

- author or optimise architecture;
- select a deployment candidate or site adaptation;
- infer missing site facts;
- perform structural, geotechnical, drainage or planning judgement;
- grant or predict statutory/planning approval;
- implement the full England or London rule corpus;
- rank land;
- compute an aggregate compliance/confidence score;
- emit whole-site `COMPATIBLE` or `INCOMPATIBLE`.

A green ledger means only that the obligations currently represented by this slice have the shown states. It is **not** a site-deployability conclusion.

## Current native method authority

The first slice implements only deterministic methods already earned by B2:

- explicit fact-gated applicability where the target artefact defines the rule;
- London Plan D6 Table 3.1 GIA/storage arithmetic;
- the bounded D6 finished-height coverage check;
- the bounded D6 private-outside-space baseline where its applicability is itself resolved.

External-evidence and planning/design-judgement methods remain external. Accepted evidence may discharge an obligation only when the compile input explicitly identifies that evidence as discharging that obligation.

## Tests

Run:

```sh
npm run test:dpl
```

The DPL-12A regression suite uses the actual controlled B2 target/site artefacts and proves, among other things, deterministic identity, target-order independence, unresolved fact gating, native D6 PASS/FAIL behaviour, external-evidence discharge and the explicit absence of a whole-site compatibility output.
