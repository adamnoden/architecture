# S0-A — Conventional Workmanship and Tolerance Route v0.1

**Status:** process-model research draft  
**Applies to:** S0-A conventional-control variant  
**Purpose:** give ordinary construction an explicit workmanship/tolerance/evidence route so the experimental S0-B variant is not unfairly burdened with formal proof while the conventional baseline is treated as self-validating.  
**Numerical status:** no project acceptance tolerances are invented here.

> **Ordinary construction is allowed to be ordinary. It is not allowed to be undefined.**

## 1. Why this document exists

S0 Run 01 produced:

> S0-A workmanship / tolerance — UNRESOLVED.

That was correct.

The project has a mature doctrine of workmanship robustness, but the conventional control had not been translated into the computational research model.

This creates a comparison bias:

~~~text
S0-A
  "normal plaster and normal construction"
  -> implicitly trusted

S0-B
  backplane / panel / adjustment
  -> every tolerance and inspection interrogated
~~~

That is not a fair comparison.

S0-A should have a lighter burden where established construction justifies it, but it still needs:

- declared inputs;
- acceptance criteria;
- workmanship sequence;
- evidence;
- failure/remediation behaviour.

## 2. Authorities

Two independent authorities apply.

### Regulation 7 / Approved Document 7

Building work must use adequate/proper materials and be carried out in a workmanlike manner.

This is the regulatory/material-workmanship baseline.

### Long-Life House workmanship-robustness doctrine

The project asks additional questions:

- what datum controls the result?
- what variation is expected?
- where is it absorbed?
- when does adjustment stop?
- what condition triggers remediation?
- can an error be inspected before concealment?
- does success rely unnecessarily on exceptional craft/supervision?

A conventional detail can satisfy the first authority and still be weak against the second.

## 3. What v0.1 deliberately does not do

It does not invent:

- permissible masonry plumb deviation;
- window packing range;
- hanger setting-out tolerance;
- plaster thickness range;
- cavity dimension tolerance;
- sealant gap range.

Those values must eventually come from:

- design specification;
- relevant standards;
- manufacturer installation data;
- engineering;
- tested/prototyped assembly evidence.

The process model can exist before the exact numbers.

## 4. Common tolerance object

For each consequential S0-A interface record:

~~~text
NOMINAL CONDITION

INCOMING CONDITION
  measured/observed state presented by preceding trade

ACCEPTANCE ENVELOPE
  sourced limit within which normal installation may proceed

ADJUSTMENT METHOD
  supported means of absorbing in-range variation

REMEDIATION METHOD
  action required when outside the envelope

DATUM
  what the installer works from

INSPECTION / EVIDENCE
  how acceptance is demonstrated

HOLD POINT
  last sensible moment before concealment

AUTHORITY / SOURCE
  regulation / design / manufacturer / doctrine
~~~

This is the same conceptual machinery as S0-B.

The difference is the physical implementation.

## 5. WKA-01 — masonry wall field

### Nominal condition

Dense masonry inner leaf forms the structural/permanent room-side substrate.

### Incoming state

Record enough geometry to establish:

- wall location;
- plumb/flatness where relevant to downstream work;
- opening geometry;
- floor/hanger interface geometry;
- cavity condition.

### Acceptance

Must be compared with the eventually selected project/industry specification.

**Current numerical state:** UNRESOLVED

### Adjustment

Minor finish-level irregularity may be accommodated by the conventional finish **within its supported application envelope**.

### Remediation

Do not treat plaster as unlimited correction for:

- misplaced structural wall;
- unacceptable opening geometry;
- defective support/bearing;
- failed cavity;
- damaged boundary layer.

Out-of-envelope background is remediated as a background defect.

### Evidence

- setting-out / survey record where consequential;
- inspection before irreversible downstream work.

## 6. WKA-02 — parge / primary air-control field

The S0 source provisionally places the primary air-control layer at the parged inner masonry face.

### Incoming state

- masonry complete;
- penetrations known;
- surfaces suitable for the chosen system.

### Acceptance

Continuity is the controlling requirement.

The layer cannot be considered adequate merely because it will later be hidden by plaster.

### Adjustment/remediation

- repair voids/discontinuities;
- resolve transitions/penetrations;
- do not rely on decorative finish to conceal unresolved air-path defects.

### Hold point

Before room-side finish conceals critical transitions.

### Evidence

- inspection/record of field;
- window transition;
- service sleeve;
- floor-edge transition.

## 7. WKA-03 — window opening / replacement interface

### Sequence

1. permanent masonry opening constructed;
2. opening surveyed;
3. acceptance against window/interface family;
4. component released/selected to actual supported dimensions;
5. supported packing/fixing;
6. air/weather/thermal transitions completed;
7. inspected before concealment.

### Important distinction

The design must not assume:

> nominal opening on drawing = actual opening on site.

The measured opening is an occurrence-level input.

### Adjustment

Use only adjustment/packing/fixing arrangements inside the selected window/interface evidence envelope.

### Remediation

Outside the envelope:

- correct the opening;
- change the supported window/interface family;
- or obtain explicit redesigned evidence.

Do not solve by unlimited packers/foam/trim.

### Evidence

- opening survey;
- product/fixing identity;
- installation record;
- boundary-transition inspection.

## 8. WKA-04 — floor/hanger to masonry

### Incoming state

- masonry support line;
- bed/joint conditions;
- floor datum;
- opening/head interactions nearby.

### Acceptance

Connection family must be installed inside:

- geometric envelope;
- product/engineering envelope;
- restraint/support route.

### Adjustment

Only supported installation adjustment.

Do not treat a connector as a magical adapter between arbitrarily misaligned structure.

### Hold point

Before floor/ceiling edge is concealed.

### Evidence

- connection/product identity;
- occurrence/spacing check;
- required restraint/support observations.

## 9. WKA-05 — conventional wet room-side finish

S0-A uses a conventional direct mineral/plaster room-side finish.

### Role

The finish may:

- produce final room surface;
- absorb minor supported substrate variation;
- contribute to room-side robustness/air performance depending selected system.

It must not silently become responsible for:

- structural correction;
- cavity correction;
- unlimited geometric correction;
- fixing a broken primary air transition;
- hiding out-of-range window installation.

### Datum

Finished room plane / architectural datum eventually needs explicit definition.

### Acceptance / adjustment

Exact material/application envelope remains product/specification dependent.

### Evidence

Ordinary workmanship evidence should be proportionate.

The compiler does not need a photo per square metre.

It does need enough process/evidence to support the claims actually being made.

## 10. WKA-06 — cavity / concealed weather work

Before concealment verify as applicable:

- residual cavity condition;
- insulation placement;
- wall ties;
- opening closure;
- trays/weep paths;
- penetration treatment;
- debris/bridging conditions.

This is not a finish tolerance problem.

It is hidden performance work.

A beautiful plaster finish cannot cure it later.

## 11. Status model for S0-A

The conventional control can now distinguish:

### PROCESS MODEL — PASS

The sequence, datum, acceptance/remediation concept and evidence phases are explicit enough for S0 research.

### NUMERICAL ACCEPTANCE ENVELOPES — UNRESOLVED

Exact tolerances remain to be sourced from the selected technical systems/specification.

### MATERIAL / PRODUCT SUITABILITY — UNRESOLVED BY FAMILY

Resolved later by selected materials/products and evidence.

### PHYSICAL WORKMANSHIP — FUTURE EVIDENCE

Cannot exist at design stage.

This is a much better result than either:

- PASS because conventional;
- FAIL because no prototype yet.

## 12. Fair comparison with S0-B

| Question | S0-A conventional | S0-B candidate |
|---|---|---|
| controlling datum | required | required |
| incoming substrate acceptance | required | required |
| adjustment mechanism | conventional finish/product-dependent | explicit backplane mechanism |
| numeric envelope | to source | test envelope exists only provisionally |
| out-of-range remediation | required | required |
| hidden-boundary inspection | required | required |
| product evidence | ordinary systems | candidate systems |
| prototype burden | lower | materially higher |
| removability | low | high |
| additional cavity/fire/acoustic debt | lower | higher |

This makes the comparison fairer.

S0-B must earn its extra complexity through lifecycle/serviceability value.

S0-A must earn its “ordinary” status through known construction routes, not vagueness.

## 13. Regulation 7 versus doctrine example

Suppose an installer uses a normal accepted plaster build-up on a competent masonry background.

That may be entirely satisfactory under ordinary materials/workmanship expectations.

The Long-Life House doctrine may still prefer S0-B for:

- dry removal;
- service access;
- reversible interfaces.

The compiler should report:

~~~text
REGULATION 7 / WORKMANSHIP      PASS / EVIDENCED
LLH REVERSIBILITY               BASELINE / NO SPECIAL PROVISION
~~~

not:

~~~text
CONVENTIONAL = FAIL
~~~

This distinction prevents the doctrine from masquerading as law.

## 14. Mutation tests

### A-M1 — substrate outside eventual acceptance envelope

Expected:

- finish installation blocked;
- remediation obligation;
- no automatic increase in plaster correction depth.

### A-M2 — window opening out of interface range

Expected:

- window release blocked or redesign required;
- boundary/product evidence not allowed to pass.

### A-M3 — damaged air layer hidden by finish

Expected:

- AIR boundary fails;
- decorative completion cannot discharge it.

### A-M4 — hanger installed outside supported condition

Expected:

- structure/restraint evidence fails or becomes unresolved;
- ceiling closure blocked at hold point.

These are equivalent in spirit to S0-B's out-of-range backplane mutation.

## 15. Computational implication

The workmanship model should not require every assembly to contain the same numerical fields.

It requires every **critical variability interface** to answer the same semantic questions.

That allows:

- wet-trade conventional construction;
- dry adjustable assemblies;
- manufactured components;

to be evaluated using one higher-order model without pretending their tolerances behave identically.

## 16. S0-A V8 revision for future run

For a future S0 Run 02, before exact technical envelopes are selected:

~~~text
V8 WORKMANSHIP / TOLERANCE

process architecture            PASS
critical interfaces identified PASS
hold points                     PASS
numeric envelopes               UNRESOLVED
product-specific adjustment     UNRESOLVED
physical workmanship evidence   PLANNED

overall                         PARTIAL / COHERENT
~~~

Do not upgrade to release PASS until the missing parameters/evidence are real.

## 17. Next work

- attach real acceptance envelopes when supported construction/product families are selected;
- map relevant BS 5606/project tolerance strategy without reproducing copyrighted standards text;
- instantiate the same framework on the actual window and hanger families;
- compare evidence burden between A and B after both are technically specified.

No further conceptual S0-A workmanship document is needed before Run 02.

---

## Related project sources

- [Workmanship Robustness](../research/workmanship-robustness.md)
- [S0 Paper Compilation Run 01](s0-paper-compile-run-01.md)
- [S0 Run 01 Red Team](s0-red-team-run-01.md)
- [S0 Target Snapshot v0.2](s0-target-snapshot-v02.md)
- Regulation 7 / Approved Document 7: https://www.gov.uk/government/publications/material-and-workmanship-approved-document-7
