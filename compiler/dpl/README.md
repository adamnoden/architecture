# Deployment orchestration

This directory contains the bounded executable deployment-orchestration layer admitted by the DPL programme.

Its authority currently reaches **DPL-12B**. The layer remains intentionally narrower than the eventual deployment compiler.

## DPL-12A — obligation / evidence orchestration

DPL-12A composes already-controlled inputs:

- the current Reference House source identity;
- an admitted DPL site record and its explicit screening unknowns;
- controlled site-interface contract identity;
- the first England technical target slice;
- the first London strategic-planning target slice;
- explicit proposal facts supplied for a compile;
- explicit evidence items supplied for a compile.

It produces a deterministic **obligation/evidence ledger** preserving:

- target authority class;
- applicability state;
- method class;
- obligation result;
- evidence lifecycle independently of result;
- missing inputs;
- cross-target edges;
- semantic fingerprints for the deployment case and resulting ledger.

The loader intentionally reads controlled `project/dpl/` artefacts from disk. JSON imports are not used and unsupported schemas fail closed.

## DPL-12B — authored candidate / Reference House conformance

DPL-12B adds one optional **authored deployment candidate** to that case.

The candidate is an input, not compiler output. Its identity includes:

- candidate id and revision;
- authored-source id and revision;
- exact Reference House source fingerprint it claims to instantiate;
- explicit candidate facts;
- selected DPL-02 variant routes;
- referenced site-interface / implementation response classes.

Candidate identity is fingerprinted into deployment-case identity. Reordering set-like route references does not change identity; changing a relevant authored candidate input does.

### Native conformance coverage

DPL-12B deliberately implements only clauses for which controlled computational facts already exist:

- `RH-I02` — genuine open-to-sky courtyard;
- `RH-PROT-01` — 12.0 m × 10.8 m shell, centred 3.6 m × 4.0 m courtyard and two-storey gross morphology;
- `RH-PROT-04` — controlled 18-riser / three-flight / 300 mm-going stair facts;
- `RH-PROT-06` — controlled four-bay front field and ranked entrance, including mirror-equivalent entrance handling under `RH-V01`;
- `RH-V01` — coherent whole-house left/right mirror route admission;
- `RH-V02` — rigid site placement / cardinal-orientation route admission.

Every other DPL-02 identity/protected clause remains explicitly `OPEN` unless and until an authoritative representation is earned. Referencing a site-interface or implementation freedom also remains `OPEN`: the existence of the freedom does not prove that one proposed response stays inside its boundary.

The clause findings are architectural findings:

`CONFORMS / NON_CONFORMING / REQUIRES_REFERENCE_HOUSE_REVISION / OPEN`

They are not a replacement for the existing obligation/evidence result lattice and they are never averaged into a score.

## What this layer still does not do

DPL-12A/12B do not:

- author, generate, optimise or rank architecture;
- select a deployment candidate or site adaptation;
- infer missing site or candidate facts;
- make unrepresented DPL-02 clauses pass by omission;
- perform structural, geotechnical, drainage or planning judgement;
- grant or predict statutory/planning approval;
- implement the full England or London rule corpus;
- rank land;
- compute an aggregate compliance/confidence/conformance score;
- prove route exhaustion;
- emit whole-site `COMPATIBLE`, `UNRESOLVED` or `INCOMPATIBLE`.

A non-conforming candidate finding means **that candidate is outside the current Reference House contract**. It does not prove that the site is incompatible. Another already-admitted route may exist, or an explicit Reference House rewind may be warranted.

A green represented subset likewise does not mean the site is deployable: unmodelled conformance clauses and unrepresented external obligations remain visible.

## Current native target-method authority

The target side still implements only deterministic methods already earned by B2:

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

The DPL-12A suite continues to prove the no-candidate obligation/evidence slice unchanged. The DPL-12B suite adds deterministic candidate identity, controlled native conformance checks, whole-house mirror handling, protected-change rewind, identity failure, explicit open/unmodelled handling, stale Reference House revision refusal and the continued absence of whole-site compatibility.