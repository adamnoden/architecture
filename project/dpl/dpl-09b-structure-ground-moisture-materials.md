# DPL-09B — Structure, Ground, Moisture and Materials Target Slice

**Issue:** [#377 — DPL-09B — structure, ground, moisture and materials target slice](https://github.com/adamnoden/architecture/issues/377)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Parent inventory:** [DPL-09](dpl-09-england-regulatory-target-inventory.md)  
**Source/applicability spine:** [DPL-09A](dpl-09a-england-source-applicability-spine.md)  
**Ground-interface contract:** [DPL-08B](dpl-08b-ground-datum-plinth-approach-interface.md)  
**Research date:** 2026-10-20  
**Baseline `main`:** `5ee084e93ff268c7e29b5e14fbad51585a917e11`  
**Jurisdiction:** England  
**Reference work class:** new low-rise detached dwelling; non-HRB test class  
**Structured slice:** [`targets/england-structure-ground-moisture-materials-v1.json`](targets/england-structure-ground-moisture-materials-v1.json)  
**Status:** first substantive England technical target slice; **not** structural/geotechnical/building-physics design and **not** a compliance certificate

## Question

> **Which structure, ground, moisture and materials obligations can the deployment system represent honestly now, which can be determined natively, and which must remain dependent on competent external evidence?**

This packet is intentionally the first **vertical slice**, not the beginning of a giant regulations engine.

---

# 1. Result

The central result is a refusal to equate **being able to represent an obligation** with **being able to prove it**.

For the current England new-low-rise-detached-dwelling test class:

```text
SOURCE / APPLICABILITY                      METHOD / EVIDENCE

A1 — loading / transmission to ground   →  external structural engineering
A2 — ground movement                    →  external structural + geotechnical evidence
A3 — disproportionate collapse          →  external structural robustness evidence

C1(1) — site preparation                →  external site / ground evidence
C1(2) — contaminants                    →  external site / environmental evidence
C1(3) — sub-soil drainage if needed     →  fact-gated applicability + external design
C2 — harmful effects of moisture        →  external building-physics / envelope evidence

D1 — cavity-insulation toxic fumes      →  native applicability gate + external product/assembly evidence

Regulation 7(1)                         →  external product/specification/installation/inspection evidence
```

The target can therefore become concrete **without claiming native engineering**.

The first stable native method earned by this packet is deliberately narrow:

> **A deterministic applicability gate may decide whether D1 applies from an admitted fact recording whether insulating material is inserted into a cavity wall.**

It may return:

```text
true     → APPLIES
false    → NOT_APPLICABLE
unknown  → UNRESOLVED
```

It cannot decide that the selected insulation/installation satisfies D1.

This distinction is the model to carry into later technical packets.

---

# 2. Current official source state

The packet uses primary/current official sources rather than a secondary compliance summary.

## 2.1 Legal requirements

### Schedule 1 Parts A, C and D

Source:

- **The Building Regulations 2010 — S.I. 2010/2214, Schedule 1**;
- exact point-in-time source used for the slice: **20 July 2026**;
- canonical official source: `https://www.legislation.gov.uk/uksi/2010/2214/schedule/1/2026-07-20?wrap=true`.

At that point-in-time the relevant requirements include:

- `A1` — loading and safe transmission to ground;
- `A2` — foreseeable ground movement;
- `A3` — disproportionate collapse;
- `C1(1)` — site preparation / material capable of damaging building or stability;
- `C1(2)` — contaminants;
- `C1(3)` — sub-soil drainage where needed;
- `C2` — protection from harmful effects of ground moisture, precipitation, condensation and specified water spillage;
- `D1` — precautions against toxic fumes from cavity insulation.

DPL records those requirement identities. It does not replace them with Approved Document paragraph numbers.

### Regulation 7

Source:

- **The Building Regulations 2010 — regulation 7**, England extent/version;
- official revised source: `https://www.legislation.gov.uk/uksi/2010/2214/regulation/7`;
- research/retrieval date: **20 October 2026**.

This slice owns the general `regulation 7(1)` materials/workmanship requirement.

The external-wall fire/material prohibitions in regulation 7(1A)/(2) are retained in the source model but routed to the later fire/product evidence packet so they are not duplicated across two owners.

That routing is an ownership choice; it does not make those provisions disappear from the England target.

## 2.2 Official compliance guidance

Current GOV.UK source pages recovered at the research date:

- Approved Document A — Structure: `https://www.gov.uk/government/publications/structure-approved-document-a`;
- Approved Document C — Site preparation and resistance to contaminants and moisture: `https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c`;
- Approved Document D — Toxic substances: `https://www.gov.uk/government/publications/toxic-substances-approved-document-d`;
- Approved Document 7 — Materials and workmanship: `https://www.gov.uk/government/publications/material-and-workmanship-approved-document-7`.

These remain **official compliance guidance**, not the source of the legal requirement itself.

The source model therefore keeps:

```text
LEGAL REQUIREMENT
        ≠
APPROVED DOCUMENT GUIDANCE
        ≠
REFERENCED STANDARD / TECHNICAL METHOD
        ≠
ENGINEER / SPECIALIST EVIDENCE
        ≠
BUILDING-CONTROL DECISION
```

---

# 3. Structured target slice

This packet adds one deliberately small machine-readable artefact:

`project/dpl/targets/england-structure-ground-moisture-materials-v1.json`

It is **not** a release-grade DPL compiler schema.

Its purpose is to prove that a real target slice can preserve, in structured form:

- exact source identity;
- source class;
- exact legal provision;
- work-class applicability;
- conditional applicability;
- admitted method/evidence class;
- current default result under available evidence;
- required input/evidence families;
- explicit proof/non-claim boundary;
- sibling-domain routing.

No shared deployment runtime types are created by 09B. B2 still exists partly to discover the shape those types actually need.

---

# 4. Method classes

09B admits five method/evidence classes for this slice.

## `APPLICABILITY_FACT_GATE`

A native deterministic method may evaluate a **settled applicability relation** from admitted project/site/product facts.

Example:

```text
D1
  if cavityInsulationInserted = true     → applies
  if cavityInsulationInserted = false    → not applicable
  if fact is unknown                     → unresolved
```

The method does not assess technical adequacy after the obligation applies.

## `EXTERNAL_STRUCTURAL_ENGINEERING`

Competent structural/geotechnical design/calculation/evidence is required.

House Kernel may contribute bounded deterministic evidence where it already has an authorised proof contract, but partial computational evidence does not silently become a statutory structural proof.

## `EXTERNAL_SITE_GROUND_ASSESSMENT`

Competent site/geotechnical/environmental evidence is required to establish ground conditions, contaminants, groundwater and related site-response questions.

The site manifest supplies claims/evidence; it does not become the professional assessment merely because the claims are structured.

## `EXTERNAL_BUILDING_PHYSICS_ENVELOPE`

Moisture/weather/condensation adequacy requires technical assembly/site/product evidence at the appropriate maturity.

DPL-08B identifies the interface duties but does not close C2.

## `EXTERNAL_PRODUCT_SPECIFICATION_INSPECTION`

Product suitability, preparation/application/fixing, workmanship and completed-installation evidence remain external to a simple model check.

This class can consume product/specification/test/inspection evidence without claiming that one certificate proves every Regulation 7 duty.

---

# 5. Part A — Structure

## 5.1 `A1 — Loading`

### Legal proposition represented

The building must sustain/transmit the relevant dead, imposed and wind loads to ground safely and without specified destabilising deformation/movement effects.

### Applicability

For the current new-dwelling test class:

```text
APPLIES
```

### Admitted evidence route

```text
EXTERNAL_STRUCTURAL_ENGINEERING
```

Required evidence will eventually include, at suitable scope:

- competent actions/load definition;
- material/system properties;
- member/wall/floor/roof/foundation design;
- stability/lateral-load design;
- bearing/support details;
- ground/foundation interaction;
- design basis and calculations;
- later construction/product/inspection evidence as the claim matures.

### Existing compiler evidence is partial only

The controlled Reference House already has useful deterministic structural correspondence evidence, including selected geometry, support geography and bounded span/load-path checks.

That evidence may be referenced in an A1 evidence package where relevant.

It does **not** establish:

- material capacities;
- design actions in full;
- connection design;
- masonry stability;
- lateral stability;
- foundation adequacy;
- whole-building A1 compliance.

Therefore current DPL result:

```text
A1: UNRESOLVED
method: EXTERNAL_STRUCTURAL_ENGINEERING
```

This is not a compiler weakness. It is the correct proof boundary.

## 5.2 `A2 — Ground movement`

### Applicability

For the current new-dwelling test class:

```text
APPLIES
```

### Required evidence

As relevant to the actual site:

- soil/ground profile;
- shrink/swell susceptibility;
- freezing where material;
- subsidence/land-slip risk;
- trees/root interactions;
- groundwater;
- adjacent excavation/foundation conditions;
- selected foundation/ground response.

DPL-RS-01 deliberately lacks this evidence.

DPL-14B screening plots will also normally lack enough evidence to discharge A2.

Therefore:

```text
A2: UNRESOLVED
method: EXTERNAL_STRUCTURAL_ENGINEERING
```

A low-risk-looking plot is not a native `PASS`.

## 5.3 `A3 — Disproportionate collapse`

### Applicability

The legal requirement exists for the work class, but the practical robustness route depends on actual building classification and the admitted structural guidance/method.

DPL-09B does **not** reproduce or independently reimplement copyrighted structural standards or robustness tables merely to make this obligation machine-native.

Required input includes:

- actual building/consequence classification under the selected technical route;
- competent structural robustness design/evidence;
- exact method/source provenance.

Therefore:

```text
A3: UNRESOLVED
method: EXTERNAL_STRUCTURAL_ENGINEERING
```

A later packet may admit a bounded native method only after lawful source access, exact edition/national-annex/method identity and authoritative validation cases exist.

---

# 6. Part C — Site, contaminants and moisture

## 6.1 `C1(1) — site preparation`

The site-manifest consequence is direct:

```text
absence of an observed problem
        ≠
proof that the ground is reasonably free from harmful material
```

Typical evidence may include:

- intrusive or other competent ground investigation proportionate to risk;
- evidence of topsoil/vegetation/pre-existing foundations where material;
- site preparation/remediation specification;
- inspection/as-built evidence later.

Current Reference Site result:

```text
C1(1): UNRESOLVED
```

Real screening sites should carry known red flags and unknowns, not infer a pass from a property listing.

## 6.2 `C1(2) — contaminants`

The obligation requires evidence proportional to actual site risk.

Potential evidence domains include:

- land-use/site-history evidence;
- contamination investigation;
- ground gas / radon evidence where relevant;
- groundwater/chemical conditions;
- competent remediation/mitigation design where required.

DPL does not create a universal contaminant checklist that claims to replace environmental/geotechnical competence.

Current result without site evidence:

```text
C1(2): UNRESOLVED
```

## 6.3 `C1(3) — sub-soil drainage where needed`

This is a useful example of a **conditional legal duty**.

The law does not justify:

```text
all houses require perimeter sub-soil drainage
```

Nor does silence justify:

```text
no sub-soil drainage required
```

09B therefore models:

```text
applicability / need
    determined from admitted site/ground/moisture evidence

if needed
    competent drainage/foundation/site response required

if evidence insufficient
    UNRESOLVED
```

This directly reinforces DPL-08B's rejection of a universal gravel/French-drain perimeter.

## 6.4 `C2 — resistance to moisture`

C2 spans more than ground damp.

The target slice retains the legal categories without pretending one method closes all of them:

- ground moisture;
- precipitation including wind-driven spray;
- interstitial/surface condensation;
- specified water spillage.

A future evidence package may therefore require different methods and specialists for different assembly conditions.

DPL-08B's wall-base/threshold contract supplies useful interface inputs but is not itself a C2 compliance route.

Current result:

```text
C2: UNRESOLVED
method: EXTERNAL_BUILDING_PHYSICS_ENVELOPE
```

---

# 7. Part D — Toxic substances

## `D1 — cavity insulation`

D1 is narrow enough that 09B can prove the applicability boundary directly.

### Applicability fact

```text
cavityInsulationInserted
```

### Deterministic rule

```text
true     → D1 APPLIES
false    → D1 NOT_APPLICABLE
unknown  → D1 UNRESOLVED
```

### Technical discharge

Where D1 applies, product/assembly/installation evidence must support the reasonable-precautions duty concerning toxic fumes.

The applicability check does not prove that duty.

### Current Reference House

The Reference House has a masonry cavity-wall baseline, but DPL-09B does not elevate that architectural family into a final cavity-insulation product/installation fact.

Unless the exact relevant insulation condition is already controlled elsewhere at the required authority, the correct DPL result remains:

```text
D1 applicability: UNRESOLVED
```

This is a concrete example of a future compiler method where unknown does useful work rather than being inconvenient data loss.

---

# 8. Regulation 7 — Materials and workmanship

## 8.1 `Regulation 7(1)`

For building work in the current reference class, the general materials/workmanship duty applies.

The model records the obligation but does not attempt to reduce it to:

```text
product has marking = PASS
```

or:

```text
specified by architect = PASS
```

A credible evidence chain may later include, as applicable:

- intended function/use circumstance;
- product/manufacturer data;
- relevant declaration/certification/test evidence;
- specification;
- storage/preparation requirements;
- installation/fixing requirements;
- installer/inspection/quality evidence;
- commissioning where material to performance.

The exact evidence varies by product and duty.

Current generic target result:

```text
Regulation 7(1): UNRESOLVED
method: EXTERNAL_PRODUCT_SPECIFICATION_INSPECTION
```

## 8.2 Regulation 7 fire/material provisions

Regulation 7 also contains fire-related external-wall material restrictions.

DPL-09B does **not** duplicate those rules.

They are explicitly routed to the later fire/product-evidence target packet because:

- their purpose/evidence relationship is closely coupled to the Part B/fire domain;
- the `relevant building` definition and external-wall product classification need one authoritative owner;
- the current low-rise detached Reference House test class is below the relevant-building height threshold, but actual future cases must still evaluate source applicability rather than deleting the provisions from the target.

The general 7(1) workmanship/material suitability duty remains owned here.

---

# 9. Relationship with DPL-08B

09B and 08B deliberately touch the same physical ground junction from different authority directions.

```text
DPL-09B
  tells us WHAT external technical obligation exists
  and what method/evidence class may discharge it

DPL-08B
  tells us WHERE / HOW that obligation meets the
  controlled architecture and site-conditioned response boundary
```

Examples:

| Physical question | DPL-09B authority | DPL-08B authority |
|---|---|---|
| loads reach ground safely | A1 obligation + structural evidence class | support handoff / rewind boundary |
| shrink/swell / subsidence | A2 obligation + ground evidence | site-interface response must preserve architecture |
| sub-soil drainage | C1(3) conditional obligation | no universal perimeter-drain solution; coordinate site response |
| wall-base moisture | C2 obligation | wall-base/threshold duties and evidence handoff |
| material at wall base | Regulation 7 evidence duty | selected interface may later supply product circumstance |

Neither packet gets to impersonate the other.

---

# 10. Relationship with the existing Reference House compiler

Existing Reference House compiler checks remain valuable but bounded.

They can provide evidence such as:

- exact source geometry identity;
- support geography;
- span relationships;
- deterministic dimensions;
- controlled interfaces already encoded.

They must not be relabelled as:

```text
Part A compliant
Part C compliant
Regulation 7 compliant
```

unless a later explicit proof contract actually earns those claims.

The 09B structured target artefact therefore references `partialNativeEvidence` rather than assigning statutory `PASS` from existing RH-C checks.

---

# 11. Standards / copyrighted technical methods

Part A and technical moisture/material routes may rely on standards or other technical publications.

DPL-09B freezes the following implementation gate:

Before a standard-derived method becomes native, its child packet must establish:

1. lawful source/access;
2. exact edition and national annex where applicable;
3. exact scope/applicability;
4. that the required rule can be lawfully/independently implemented rather than copied as protected text;
5. authoritative validation cases;
6. method-version provenance;
7. a regression strategy adequate to the consequence of error.

Where those conditions are not satisfied:

> **represent the obligation and external evidence route; leave the native technical method unsupported.**

This rule is especially important for structural calculations. DPL does not gain credibility by writing amateur substitutes for competent structural standards.

---

# 12. Assurance-profile behaviour

## `SCREENING`

Expected output is primarily blocker/unknown discovery.

Examples:

- known severe ground movement history → A2 escalated now;
- contamination red flag → C1(2) escalated now;
- no ground evidence → unresolved, not safe;
- a listing showing ordinary flat grass → no geotechnical conclusion.

## `FEASIBILITY`

Ground/site evidence becomes materially more due where foundation type/cost/viability or contamination can overturn the land decision.

A1 may still remain external engineering while enough preliminary work exists to show no obvious architectural/site incompatibility.

## `TECHNICAL_DESIGN`

A1/A2/A3/C1/C2/Regulation 7 obligations relevant to the constructed solution require their competent evidence before a positive technical-design conclusion can be justified.

D1 similarly requires final applicability and product/assembly evidence where applicable.

No assurance profile changes the authority of the method itself.

---

# 13. Test flows

## Flow T1 — A1 on the Reference House

```text
SOURCE
  BR2010 Schedule 1 A1

APPLICABILITY
  new detached dwelling → APPLIES

KNOWN NATIVE EVIDENCE
  controlled geometry / support / spans at bounded RH-C scope

MISSING EVIDENCE
  full structural design + capacities + connections + foundations + ground interaction

METHOD
  EXTERNAL_STRUCTURAL_ENGINEERING

RESULT
  UNRESOLVED
```

Correct conclusion:

> The project knows exactly what obligation is open and what evidence family is required; it does not claim A1 compliance.

## Flow T2 — D1 with unknown cavity-insulation fact

```text
SOURCE
  BR2010 Schedule 1 D1

FACT
  cavityInsulationInserted = UNKNOWN

NATIVE APPLICABILITY METHOD
  APPLICABILITY_FACT_GATE

RESULT
  UNRESOLVED
```

No arbitrary default is permitted.

## Flow T3 — D1 with no cavity insulation

```text
FACT
  cavityInsulationInserted = false

RESULT
  NOT_APPLICABLE
```

That result is bounded only to D1. It says nothing about C2, Part L or the adequacy of the wall.

## Flow T4 — C1(3) on a screening plot

```text
SOURCE
  BR2010 Schedule 1 C1(3)

SITE EVIDENCE
  groundwater / subsoil-drainage need not established

APPLICABILITY / NEED
  unresolved

RESULT
  UNRESOLVED
```

A future site investigation may prove drainage necessary or unnecessary.

## Flow T5 — Regulation 7(1) with a selected product

```text
SOURCE
  BR2010 regulation 7(1)

FACT
  product selected

EVIDENCE
  product data present
  installation / workmanship evidence not yet present

RESULT
  UNRESOLVED at technical/construction assurance as appropriate
```

A product-data sheet alone does not close workmanship.

---

# 14. Red-team

## Failure mode — “Approved Document says X, therefore X is the law”

Rejected.

Legal requirements and guidance route remain separately identified.

## Failure mode — “The compiler checked the span, therefore A1 passes”

Rejected.

Existing RH-C span/geometry evidence is partial evidence only.

## Failure mode — “No bad ground is visible, therefore A2/C1 pass”

Rejected.

Missing ground evidence remains unknown/unresolved.

## Failure mode — “All houses need a French drain because C1 mentions drainage”

Rejected.

C1(3) is conditional: adequate sub-soil drainage is required **if needed** for the stated purposes.

## Failure mode — “D is a broad toxic-materials chapter”

Rejected.

D1 is narrowly about cavity insulation and toxic fumes.

## Failure mode — “Regulation 7 is just product certification”

Rejected.

The obligation includes adequacy/propriety of materials in their circumstances and workmanlike execution.

## Failure mode — duplicate fire/material ownership

Rejected.

Regulation 7 fire-related external-wall restrictions are retained in source coverage but delegated to DPL-09C for substantive implementation.

## Failure mode — import a standard into code because its rule looks simple

Rejected.

Native standard-derived methods require lawful source identity, exact method/version and authoritative validation first.

---

# 15. Consequences for DPL-14B

The three real-site pilot should now be able to surface, without answering them:

- obvious ground/slope/subsidence/adjacent-foundation red flags relevant to A2;
- contamination/ground-gas/radon clues where public evidence exists, while retaining unknown otherwise;
- water/groundwater/flood/drainage clues relevant to C1/C2;
- title/listing/map silence as **not evidence** of ground adequacy.

DPL-14B must not perform geotechnical or contamination diagnosis from marketing material.

The target slice gives the pilot a reason to record the unknowns.

---

# 16. Consequences for later DPL-12

09B earns several concrete orchestration needs:

- source snapshots are independently identified;
- one obligation can be unconditionally applicable while another is fact-gated;
- applicability may itself be unresolved;
- method class is distinct from result;
- partial native evidence may support but not discharge an external-evidence obligation;
- one legal source may have provisions owned by different technical-domain packets;
- assurance profile affects when evidence is due, not whether the law/source exists;
- target results must expose missing evidence and proof boundary.

These are now concrete requirements rather than ontology speculation.

DPL-12 remains held until the B2 gate compares them against the planning and real-site slices.

---

# 17. Explicit non-claims

DPL-09B does **not** establish that:

- the Reference House satisfies A1, A2 or A3;
- `DPL-RS-01` has suitable ground;
- foundations have been selected or sized;
- the site is free from contaminants/radon/ground gas;
- sub-soil drainage is or is not required;
- the envelope satisfies C2;
- any cavity insulation satisfies D1;
- any material/product/installation satisfies Regulation 7;
- Approved Documents are legal requirements;
- a standard-derived structural method has been implemented;
- building-control approval is predictable or granted;
- the complete Parts A/C/D/Regulation 7 target is finished beyond the obligations/method boundaries recorded here.

---

# 18. Closeout

DPL-09B proves the first substantive England technical vertical slice without crossing the engineering boundary.

Its governing result is:

> **A deployment compiler can know exactly which technical obligation is open, why it applies, what evidence would discharge it and what bounded native evidence already exists—while still returning `UNRESOLVED`. That is more rigorous than a fabricated compliance check.**

The structured target artefact now gives B2 one concrete normative object to place beside DPL-08B's concrete site-interface contract, DPL-10B's planning slice and DPL-14B's real-site records.
