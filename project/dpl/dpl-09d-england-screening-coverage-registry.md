# DPL-09D — England SCREENING Family Coverage Registry

**Issue:** [#429 — DPL-09D — England SCREENING family coverage registry](https://github.com/adamnoden/architecture/issues/429)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [DPL-E / #426](dpl-e-post-13a-review.md)  
**Baseline `main`:** `541766736ff491feb5c025cb7a55b5680d6e6ab1`  
**Disposition:** **PASS — England technical/process family coverage is machine-readable at SCREENING without pretending that family coverage is technical discharge**

## 1. Question

> **Can the deployment system know exhaustively which England technical/process families exist for the declared project class, how each is classified at SCREENING, what source/applicability authority owns it, and whether it is currently represented natively, externally or not yet implemented?**

**Yes.**

DPL-09D converts the already-developed DPL-09 inventory/source spine into a controlled family-level coverage registry.

It deliberately does **not** build a complete Building Regulations rules engine.

The controlling distinction is:

> **Family coverage now is not substantive compliance now.**

At SCREENING the system can know that a technical/process family exists, how it is normally timed, how it can be accelerated, and which authority must eventually resolve it without pretending that every detailed design calculation is already due or machine-solvable.

---

## 2. Controlled artefacts

### Registry

`project/dpl/coverage/dpl-09-england-screening-coverage-v1.json`

Schema:

`dpl.englandScreeningCoverageRegistry.v1`

Identity:

`DPL-09-ENGLAND-SCREENING-COVERAGE-v1`

### Loader / validator

`compiler/dpl/england-coverage.ts`

### Regression proof

`compiler/dpl/dpl09d.test.ts`

---

## 3. Controlled family universe

The registry contains **23** controlled coverage families for the declared ordinary England new-dwelling project class.

### Source / applicability

- source selection and transition applicability.

### Technical requirement families

- Part A — structure;
- Part B — fire safety;
- Part C — site preparation / contaminants / moisture;
- Part D — toxic substances where triggered;
- Part E — resistance to sound;
- Part F — ventilation;
- Part G — sanitation / hot-water safety / water efficiency;
- Part H — drainage / waste disposal;
- Part J — combustion appliances / fuel storage where triggered;
- Part K — falling / collision / impact;
- Part L — conservation of fuel and power;
- Part M — access to and use of buildings;
- Part O — overheating;
- Part P — electrical safety in dwellings;
- Part Q — security of dwellings;
- Part R — electronic-communications infrastructure / connection;
- Part S — EV-charging infrastructure where triggered;
- Regulation 7 — materials and workmanship.

### Process families

- building-control process;
- dutyholder / competence process;
- completion / certification / information / inspection process;
- higher-risk-building regime applicability.

The higher-risk-building family is explicitly project-class excluded for the controlled ordinary low-rise detached Reference House fixture.

That exclusion is not portable to another project class.

---

## 4. Coverage timing at SCREENING

DPL-04 already established the stage principle:

> **What is due now depends on the requested assurance profile; later evidence must remain visible rather than being treated as missing current evidence.**

DPL-09D applies that principle at family level.

### `DUE_NOW_REPRESENTED`

The source-selection / transition family is due now.

A technical result is meaningless if the system cannot state which source edition / transition basis governs the case.

This due-now family does **not** discharge any substantive Part.

### `FUTURE_DUE`

Most detailed technical/process families are normally future-due at SCREENING.

This does not remove them from the coverage universe.

It means:

- the family is known;
- its later evidence route is known;
- it does not automatically block a SCREENING conclusion merely because detailed design evidence is not yet due;
- once due or accelerated, unresolved evidence becomes blocking.

### acceleration triggers

The registry records bounded family-level trigger descriptions for known decision-critical conditions.

Examples include:

- an obvious structural/load-path conflict;
- fire access/escape issue;
- contamination/groundwater/moisture red flag;
- sewer/outfall/infiltration constraint;
- stair/guarding/level-change conflict;
- access-category feasibility issue;
- overheating/orientation/noise interaction;
- network/easement condition.

The registry does **not** self-activate these triggers.

A later case/profile composer must apply them only from admitted facts/evidence.

---

## 5. Existing target slices remain partial

### DPL-09B

Target:

`ENG-BC-STRUCTURE-GROUND-MOISTURE-MATERIALS-2026-10-20`

Registry-mapped families include:

- Part A;
- Part C;
- conditional Part D slice;
- Regulation 7 slice.

Each is marked:

`TARGET_SLICE_PARTIAL`

The mapping means only that current runtime represents selected obligations from that family.

It does not mean:

`family complete = true`

or:

`compliance = PASS`.

### DPL-09C

Target:

`ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21`

Mapped family:

- Part H.

Again:

`TARGET_SLICE_PARTIAL`

The slice preserves H1-H5 authority/method classes but does not select a lawful discharge strategy or prove hydraulic/network adequacy.

---

## 6. RH-C5 remains quarantined correctly

Part K is marked:

`SELECTED_METHOD_ONLY`

because RH-C5 already implements one bounded selected private-stair numeric guidance-method correspondence.

The registry explicitly refuses to turn that into:

- complete Part K coverage;
- Requirement K1 compliance;
- generic stair compliance;
- whole-building technical adequacy.

The family therefore remains visible as a broader future technical obligation.

This is an important anti-laundering lock between the mature bounded Reference House compiler and the deployment target layer.

---

## 7. Conditional families remain conditional

The registry treats Parts D, J and S as conditional families.

They cannot become:

`NOT_APPLICABLE_PROVED`

because an input/fact is absent.

Applicability requires admitted project/candidate facts.

Examples:

- no explicit cavity-insulation condition → Part D applicability can remain unresolved;
- current heat-pump Reference House baseline does not mean Part J is universally irrelevant to all future candidates;
- Part S requires its actual parking/project applicability conditions.

Missing evidence is never a negative applicability proof.

---

## 8. Unimplemented families remain visible

Parts B/E/F/G/L/M/O/P/Q/R and other currently unimplemented families remain present as coverage entries.

Their current implementation state is:

`NO_TARGET_SLICE`

This is materially better than either bad alternative:

1. pretending the compiler covers them because the regulations exist;
2. making them disappear because no runtime method exists yet.

The registry therefore supports a future statement such as:

> this family exists and is future-due / externally resolvable, but no substantive target slice is implemented yet.

That is the information DPL-F needs.

---

## 9. Process families remain external/process authority

DPL-09D preserves building-control process, dutyholder/competence and completion/certification as explicit families.

They remain:

`REGISTRY_ONLY`

at current runtime scope.

The compiler cannot:

- grant approval;
- make statutory appointments;
- certify competence;
- issue notices;
- perform inspections;
- issue completion certificates.

It can only know that these families exist and when their evidence/process state becomes due.

---

## 10. Project-class exclusion is narrow

The higher-risk-building regime is represented because applicability/exclusion is itself part of source coverage.

For the controlled ordinary low-rise detached Reference House fixture it is:

```text
applicabilityClass = PROJECT_CLASS_EXCLUDED
defaultScreeningDisposition = NOT_APPLICABLE_PROVED
```

The proof is explicitly tied to the controlled project class.

If the project class changes, that exclusion is invalidated.

This is very different from using missing facts to assert non-applicability.

---

## 11. Identity / drift proof

The registry canonicalises before fingerprinting:

- entry order;
- authority-source order;
- trigger order;
- target-id order;
- resolution-authority order.

Those syntactic order changes do not alter identity.

Material semantic changes do.

Changing:

- profile disposition;
- applicability class;
- implementation mapping;
- source/authority posture;

changes the registry fingerprint.

The authority source set is independently fingerprinted as well.

---

## 12. Handoff to DPL-F

A generic SCREENING coverage composer may safely assume from DPL-09D that:

1. the current England technical/process family universe for the controlled project class is explicit and machine-readable;
2. source/transition selection is due-now coverage but not technical discharge;
3. most detailed technical/process work is future-due at SCREENING unless accelerated by case facts;
4. conditional family non-applicability requires proof;
5. DPL-09B/C are bounded partial slices only;
6. RH-C5 is one selected Part K method only;
7. unimplemented families remain visible as coverage rather than disappearing;
8. external professional/calculation/process evidence remains external;
9. later due families block positive compatibility once they become due/unresolved;
10. registry presence is not a compliance result.

DPL-F must compose this with DPL-02C and DPL-11B rather than requiring every family to become native code before a conservative SCREENING conclusion is possible.

---

## 13. Closeout

**DPL-09D PASS.**

England deployment coverage is now representable at family level without turning Ovid's House into a general Building Regulations expert system.

The useful result is exactly the restraint DPL-E sought:

> **The system can know which technical/process questions belong to the case, when they become due, and who must resolve them even where it cannot—and should not—solve them itself.**
