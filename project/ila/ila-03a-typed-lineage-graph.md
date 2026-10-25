# ILA-03A — Typed intellectual-lineage graph

**Programme:** ILA — Intellectual Lineage and Attribution Audit  
**Packet:** [#789 — ILA-03A — typed lineage graph](https://github.com/adamnoden/architecture/issues/789)  
**Depends on:** ILA-00C contract; frozen ILA-01 families; completed ILA-02B D01–D10  
**Baseline `main`:** `c06696097039be4922c4e747da024ea6981cedd4`  
**State:** canonical internal lineage graph / edge ledger; no reader-facing disposition

---

# 1. Decision

ILA now has enough primary-source depth to construct the intellectual map without inventing genealogy to fill visual gaps.

The resulting graph is **not a family tree**.

It has four distinct kinds of record:

1. **source → Ovid claim edges** using the ILA-00C intellectual-relationship vocabulary;
2. **source → source derivation edges** only where proposition-specific derivation is documented;
3. **project-contact status** recorded separately from intellectual relationship;
4. **provenance/contact notes and explicit non-edges** where historical contact is real but a causal intellectual arrow is not earned.

The most important graph-level result is restraint:

> **Only three source-to-source causal derivation edges are strong enough to belong in the core causal graph. Most of the intellectual field reaches Ovid's claims through antecedence, convergence, counterpoint, evidence or precedent rather than through one continuous genealogy.**

Those three hard derivation edges are:

1. Christopher Alexander's 1967 Berkeley pattern-language teaching → Francis Duffy / John Torrey's pattern-language exposition;
2. Francis Duffy's building-layer schema → Stewart Brand's six-layer building schema;
3. R. V. O'Neill et al.'s ecological rate hierarchy → Stewart Brand's slow/fast hierarchy synthesis.

Everything else below remains typed according to what the evidence actually supports.

This is exactly the graph shape the ILA contract was intended to permit: branching, convergence, discontinuity, counter-traditions and explicit uncertainty.

---

# 2. Graph contract

The ILA-00C contract remains controlling.

## 2.1 Core intellectual edge types

Only these intellectual relationship types are used as authoritative source/claim or source/source edges:

- `DOCUMENTED_DERIVATION`
- `EARLIER_ANTECEDENT`
- `CONVERGENT_PARALLEL`
- `COUNTERPOINT`
- `EVIDENTIAL_SUPPORT`
- `PRECEDENT_EXEMPLAR`
- `INTERPRETIVE_FRAME`
- `METHOD_ANTECEDENT`

One primary type controls each source→claim edge. Additional roles are recorded as qualifiers, not as extra causal arrows.

## 2.2 Project contact is a separate dimension

Project contact uses:

- `DOCUMENTED_FORMATIVE_SOURCE`
- `DOCUMENTED_ADOPTED_SOURCE`
- `CURRENTLY_ACKNOWLEDGED_SOURCE`
- `NO_DOCUMENTED_PROJECT_CONTACT`
- `PROJECT_CONTACT_UNRESOLVED`

A source can therefore be a foundational `EARLIER_ANTECEDENT` while remaining `NO_DOCUMENTED_PROJECT_CONTACT`.

Conversely, a current project source is not automatically an intellectual ancestor.

## 2.3 Provenance/contact lane

Some dossiers establish historical contact or formative context that does not map cleanly onto an ILA-00C intellectual arrow. Those records are retained in a **provenance/contact lane** and do not become causal lineage arrows merely to make the graph look complete.

Examples:

- Van Eyck ↔ Hertzberger direct intellectual / *Forum* contact;
- British Modular Society / Building Research Station ↔ Ezra Ehrenkrantz direct exchange;
- British school-systems experience as documented formative context for SCSD.

## 2.4 Absence is represented explicitly

Where a tempting genealogy was tested and not established, this graph records a **non-edge**. A non-edge is not ignorance to be silently filled later; it is a durable result until new evidence changes it.

---

# 3. Claim nodes

The graph covers the complete fifteen-claim spine:

| Claim | Short name |
|---|---|
| `C01` | Building as a temporal object |
| `C02` | Differential rates and destructive coupling |
| `C03` | Proportional serviceability |
| `C04` | Selective permanence / permanence through transformation |
| `C05` | Architectural platform |
| `C06` | Designed interface |
| `C07` | Failure architecture |
| `C08` | Maintenance geography |
| `C09` | Service topology as architectural ordering |
| `C10` | Ordinary parts, stable interfaces and reproducible assembly |
| `C11` | Intergenerational legibility and stewardship |
| `C12` | Domestic repose / low vigilance |
| `C13` | Passive architecture does the first work |
| `C14` | Technical necessity must become architecture |
| `C15` | Pattern and generative-sequence knowledge |

---

# 4. Core source-to-source causal graph

These are the only source-to-source arrows currently admitted as proposition-specific causal derivations in the core graph.

| Edge | From | To | Type | Confidence | Exact proposition | Owning evidence |
|---|---|---|---|---|---|---|
| `G-01` | Christopher Alexander — Fall 1967 ED 190 / pattern-language teaching | Francis Duffy & John Torrey — *A Progress Report on the Pattern Language* | `DOCUMENTED_DERIVATION` | `DOCUMENTED` | Duffy/Torrey's exposition of patterns and pattern language derives from Alexander's seminar/teaching | D01 |
| `G-02` | Francis Duffy — building layers / longevity schema | Stewart Brand — six shearing layers | `DOCUMENTED_DERIVATION` | `DOCUMENTED` | Brand explicitly takes Duffy's layer schema and expands the four-layer account to six | D04, with D03 chronology |
| `G-03` | R. V. O'Neill et al. — ecological hierarchy organised by process rates | Stewart Brand — slow/fast hierarchy of building layers | `DOCUMENTED_DERIVATION` | `DOCUMENTED` | Brand explicitly uses O'Neill's rate hierarchy to explain slow/fast constraint between building layers | D04 |

## 4.1 What this graph does not say

`G-01` does **not** create an Alexander → Duffy building-layer edge.

`G-02` does **not** mean Duffy originated every physical independence or replacement principle later used by Brand.

`G-03` does **not** create O'Neill → Duffy or Duffy → O'Neill lineage.

The correct Brand topology is convergence:

```text
Duffy / DEGW temporal building layers ───────┐
                                             ├── Brand: six layers + slippage / destructive embedding
O'Neill ecological rate hierarchy ──────────┘
```

The two incoming arrows are independently documented. The two upstream traditions are not made genealogically dependent on one another.

---

# 5. Provenance/contact lane — documented history that is not a core causal arrow

These records matter to chronology and intellectual context but are intentionally kept outside the core causal graph.

| Record | Parties | Status | What is established | What is not established |
|---|---|---|---|---|
| `P-01` | Aldo van Eyck ↔ Herman Hertzberger | documented direct intellectual / *Forum* collaboration context | Hertzberger identifies the *Forum* period and Van Eyck as important to his intellectual development | exact Van Eyck `false neutrality` → Hertzberger `polyvalence` derivation |
| `P-02` | British Modular Society / BRS ↔ Ezra Ehrenkrantz | documented direct contact / intellectual exchange | Ehrenkrantz worked at BRS, presented to the Modular Society and participated in British modular-coordination debate | that Tatton-Brown's specific interchangeability proposition caused SCSD's compatibility rule |
| `P-03` | British school-systems experience → SCSD | documented formative historical context | SCSD was materially shaped by Ehrenkrantz's study of British school-building systems | one neat source text from which all SCSD open-system rules derive |
| `P-04` | Habraken 1961 / 1963 / SAR / later Open Building | documented historical development within one field | original control/independent-dwelling proposition develops into technical support/infill methods and later infrastructure/lifecycle interpretation | permission to back-project every later Open Building technical proposition verbatim into Habraken 1961 |
| `P-05` | Banham → Hawkes environmental-design field | strong terminology / field context | Hawkes's selective-environment theory sits in a field in which Banham's environmental modes are material context | direct Olgyay→Hawkes or Banham→Hawkes derivation of Hawkes's full selective model |

These records may appear in a later explanatory diagram as **contact/context annotations**, but not as unlabeled arrows.

---

# 6. Source → claim edge ledger

This is the authoritative intellectual graph. It records the strongest source nodes needed to understand each claim after discovery saturation and the deep dossiers.

The purpose is **decision accuracy**, not bibliographic completeness. Evidence standards, regulations and minor supporting sources are omitted where they do not change the lineage judgement.

## C01 — Building as a temporal object

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Duffy / Cave / Worthington, *Planning Office Space* (1976) | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` to temporal architecture | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | building understood through change over useful life; long/short design horizons; continuing adaptation |
| Stewart Brand, *How Buildings Learn* (1994) | `EARLIER_ANTECEDENT` | `MAJOR` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | broad building-life synthesis and change through time |
| service-life / whole-life professional practice | `EVIDENTIAL_SUPPORT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | establishes that lifecycle thinking is ordinary professional territory rather than Ovid priority |

**Graph judgement:** the temporal premise is inherited. Ovid's contribution cannot be the discovery that architecture continues after handover.

## C02 — Differential rates and destructive coupling

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Duffy / DEGW | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` to differential rates / independent design levels | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | temporal decomposition, independent levels, services allowing later change |
| Stewart Brand | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | slippage, destructive embedding, fast change damaging slow construction |
| Helmut C. Schulitz / SCAG | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` to physical dependency | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | different lives, independent replacement, minimal physical dependence, no alteration/destruction of other elements |
| Century Housing System / Utida line | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` to damage-sensitive replacement | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | durable-year classes, replacement interfaces, damage to adjacent/longer-lived components |
| Herbert Simon — nearly decomposable systems | `CONVERGENT_PARALLEL` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | bounded systems analogue for keeping ordinary change local |

**Graph judgement:** differential rates, independence, slippage, destructive embedding and replacement-damage testing are all prior territory. Ovid's surviving value is authored compression plus whole-house operational/governance synthesis.

## C03 — Proportional serviceability

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| John Weeks | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | bounded loose fit, differential allocation of adaptability, flexibility/efficiency trade-off, finite infrastructure capacity |
| Schulitz / SCAG | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | homogeneous flexibility is economically wasteful; combine determinate and indeterminate assemblies selectively |
| Habraken / SAR capacity analysis | `EARLIER_ANTECEDENT` | `MAJOR` | `DOCUMENTED_ADOPTED_SOURCE` for Habraken/Open Building generally; original formation unresolved | `DOCUMENTED` | stable support tested against multiple plausible lower-level configurations |
| ISO/RICS whole-life methods | `EVIDENTIAL_SUPPORT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | cost/carbon/service-life burden makes permanent future provision a trade-off |

**Graph judgement:** bounded adaptability and present cost of flexibility are inherited. The live Ovid delta is the explicit frequency × consequence × retrofit-difficulty governance, burden classes, `hold`, co-renewal and integration with other claim families.

## C04 — Selective permanence / permanence through transformation

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Aldo van Eyck | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | false neutrality; flexibility must not erase meaningful architectural commitment |
| Herman Hertzberger | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` to committed adaptable form | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | polyvalence: stable form retains identity while accepting different uses/interpretations |
| John Weeks | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | stable geography + bounded subordinate change; qualifier: institutional indeterminacy is also a counterpoint to Ovid's stronger architectural permanence |
| Habraken / Supports | `EARLIER_ANTECEDENT` | `MAJOR` | `DOCUMENTED_ADOPTED_SOURCE`; original formative role `PROJECT_CONTACT_UNRESOLVED` | `DOCUMENTED` | durable collective/support domain enabling independently changeable dwelling domain |
| Schulitz / SCAG | `EARLIER_ANTECEDENT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | long-lived support plus selectively replaceable shorter-cycle components; rejects universal flexibility |
| Ovid / Heraclitus material | `INTERPRETIVE_FRAME` | `SUPPORTING` | `DOCUMENTED_ADOPTED_SOURCE` | `DOCUMENTED` | identity and persistence across transformation; no technical authority |

**Graph judgement:** Ovid does not own the architectural middle position between rigidity and neutral universal flexibility. Its residual is terminology plus the governed whole-house synthesis of committed architecture and changeable technical layers.

## C05 — Architectural platform

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Habraken / Supports | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` ingredient | `DOCUMENTED_ADOPTED_SOURCE`; original formation unresolved | `DOCUMENTED` | durable support / independent dwelling domain; distributed control |
| SAR | `EARLIER_ANTECEDENT` | `MAJOR` | inherited through documented Habraken/Open Building adoption; proposition-specific original contact unresolved | `DOCUMENTED` | technical support/infill separation, zones/margins, service channels, capacity analysis |
| Kendall / mature Open Building | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` ingredient | `DOCUMENTED_ADOPTED_SOURCE` at Open Building lineage level | `DOCUMENTED` | base building as infrastructure, levels of intervention, separated utilities, subsystem replacement |
| Duffy / DEGW | `EARLIER_ANTECEDENT` | `MAJOR` ingredient | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | coarse long-lived capacity mediated by shorter-lived, more precise scenery / fit-out |
| SCSD open-system model | `EARLIER_ANTECEDENT` | `SUPPORTING` ingredient | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | bounded technical systems plus retained architectural design freedom |

**Graph judgement:** none of the ingredients is Ovid-original. The live project claim is the four-part domestic synthesis—permanent fabric, replaceable systems, designed interfaces and maintenance geography—plus workmanship/failure/stewardship governance.

## C06 — Designed interface

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Schulitz / SCAG | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | physical independence and non-destructive exchange of components |
| Century Housing System | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | interface/dependency logic explicitly tied to damage during renewal |
| mature Open Building | `EARLIER_ANTECEDENT` | `MAJOR` | `DOCUMENTED_ADOPTED_SOURCE` at field level | `DOCUMENTED` | interfaces allowing one technical system to be replaced by another |
| Modular Assembly | `PRECEDENT_EXEMPLAR` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | real multi-manufacturer interfaces expose tolerance, adjustment and jointing problems |
| Frascari / detail-as-locus tradition | `EARLIER_ANTECEDENT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` on current evidence | `STRONG` | joint/detail as an architectural rather than residual locus |
| ISO 20887 / conventional joint, tolerance and bearing practice | `EVIDENTIAL_SUPPORT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | independence, reversible connections, movement/tolerance/maintenance are established practice |

**Graph judgement:** the designed interface as a technical necessity is established. Ovid's residual is the integrated interface ledger—movement, tolerance, multiple boundaries, future work sequence, workmanship and architectural resolution—rather than invention of separable/reversible junctions.

## C07 — Failure architecture

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Hutcheon / Garden — Canadian building-science lineage | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` on current evidence | `DOCUMENTED` | first defence may be imperfect; drainage/drying and secondary control are designed consequences |
| Norwegian water-safe installation / TEK17 practice | `EARLIER_ANTECEDENT` | `MAJOR` | `CURRENTLY_ACKNOWLEDGED_SOURCE` minimum; current project use is explicit | `DOCUMENTED` | replaceability, visible leakage, damage limitation, isolation and access in one domestic subsystem |
| UK G3 visible discharge | `EARLIER_ANTECEDENT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | abnormal state intentionally made visible and safely conveyed |
| fire compartmentation / structural robustness after Ronan Point | `EARLIER_ANTECEDENT` | `MAJOR` | `CURRENTLY_ACKNOWLEDGED_SOURCE` at evidential level | `DOCUMENTED` | local failure should not propagate into disproportionate whole-building failure |
| UK flood-resilient / recoverable design | `EARLIER_ANTECEDENT` | `MAJOR` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | prospective design for damage limitation, drainage, drying, repair and reoccupation |
| Charles Perrow | `COUNTERPOINT` | `MAJOR` boundary source | `CURRENTLY_ACKNOWLEDGED_SOURCE` minimum | `DOCUMENTED` | tight coupling / interactive complexity warns that protective systems can create additional interactions and false confidence |
| McBrearty / fail-safe engineering | `CONVERGENT_PARALLEL` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | post-first-failure behaviour can be a design object |

**Graph judgement:** prevention, containment, observability, isolation, repair and recoverability all have prior traditions. Ovid's residual is cross-domain domestic integration and architectural geography of abnormal/recovery states, especially where failure consumes slow fabric.

## C08 — Maintenance geography

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| VA Hospital Building System | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` at systematic service/maintenance-planning level | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | service bays, interstitial zones, reserved routes, standing access and future modification affect plan/structure from the outset |
| John Weeks | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | stable routes/geography enabling local change and access |
| Ignaz Strebel, `The living building: towards a geography of maintenance work` | `EARLIER_ANTECEDENT` | `MAJOR` terminological/conceptual context | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | maintenance is explicitly spatial practice; phrase-family `geography of maintenance work` predates Ovid |
| IStructE / CIRIA / CIBSE maintainability practice | `EVIDENTIAL_SUPPORT` | `MAJOR` professional prior art | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | approach, work position, galleries/platforms, lifting, removal and replacement paths |
| Salk / institutional service-floor precedent | `PRECEDENT_EXEMPLAR` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | accessible technical territory protects occupied space while supporting changed services |

**Graph judgement:** maintenance as spatial geography is inherited. Ovid's residual is proportional domestic transfer and integration of `where → work → know` with failure, weak stewardship and intervention-sequence governance.

## C09 — Service topology as architectural ordering

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| John Weeks | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | stable communications/service geography generates order while subordinate parts change |
| VA Hospital Building System | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` at institutional systems-planning level | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | service module coordinates function, structure, distribution and future modification |
| Louis Kahn / Salk | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | technical systems receive deliberate spatial/sectional territory; Salk separates accessible service distribution from occupied floors |
| mature Open Building | `EARLIER_ANTECEDENT` | `MAJOR` | `DOCUMENTED_ADOPTED_SOURCE` | `DOCUMENTED` | stable base-building utilities and infrastructure support adaptable downstream systems |
| Alexander — `Duct Space` / service-pattern lineage | `METHOD_ANTECEDENT` | `SUPPORTING` | Alexander is a documented project source generally; proposition-specific C09 formation unresolved | `STRONG` | services receive deliberate accessible architectural territory and pattern representation |

**Graph judgement:** services generating plan/section and stable infrastructure geography are prior art. Ovid's residual is the explicit domestic sequence, proportionality and rewind/governance authority when service topology invalidates upstream decisions.

## C10 — Ordinary parts, stable interfaces and reproducible assembly

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| British Modular Society / Tatton-Brown | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | open closed proprietary systems through interchangeability and shared jointing conventions |
| 1958 Modular Assembly | `PRECEDENT_EXEMPLAR` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | heterogeneous/off-the-shelf components from many manufacturers assembled under common coordination; negative evidence on tolerances/joints |
| SCSD / Ehrenkrantz | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | performance specifications, independent manufacturers, compatibility, standard components producing nonstandard architecture |
| mature Open Building / Kendall | `EARLIER_ANTECEDENT` | `MAJOR` | `DOCUMENTED_ADOPTED_SOURCE` at field level | `DOCUMENTED` | later in-use substitution across designed interfaces and subsystem disentanglement |
| Wachsmann / closed total-system precedent | `COUNTERPOINT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | universal-connector ambition demonstrates both configurational power and fragility of bespoke closed systems |
| RIBA DfMA / ISO 20887 | `EVIDENTIAL_SUPPORT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | current professional prior art for standard interfaces, interoperability, future substitution and anti-lock-in |

**Graph judgement:** open systems, ordinary heterogeneous parts, stable/common interfaces and varied architecture are established. Ovid's residual is century-scale domestic weak-stewardship execution: ordinary tools/trades, remanufacturable architectural covers, full replacement/reinstatement sequence and proportional refusal of unnecessary systemisation.

## C11 — Intergenerational legibility and stewardship

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| ordinary M&E identification / valve charts / O&M practice | `EVIDENTIAL_SUPPORT` | `MAJOR` professional prior art | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | durable field identifiers tied to drawings and isolation are established practice |
| Historic England service guidance | `EVIDENTIAL_SUPPORT` | `MAJOR` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | records may be stale; verify physical reality; use common routes and preserve future access |
| building-information / golden-thread continuity | `EVIDENTIAL_SUPPORT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | lifecycle information, change control and intelligible handover are established obligations in relevant contexts |
| Strebel / maintenance-work lineage | `EARLIER_ANTECEDENT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | maintenance knowledge is enacted spatially and socially rather than existing only in drawings |

**Graph judgement:** labels, records, lifecycle information and field verification are not novel. The live Ovid synthesis is to treat degraded stewardship itself as a normal long-life design case and make geometry, identifiers, isolation and ordinary fixing logic remain partly intelligible when records/suppliers/project memory decay.

## C12 — Domestic repose / low vigilance

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| W. H. Bidlake as reported by A. S. Wainwright (1902) | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | house as haven of rest; domestic not heroic; avoid self-assertive features that seize unwilling attention; phrase `Lamp of Repose` belongs to Wainwright's report unless direct Bidlake text is found |
| Witold Rybczynski, *Home* | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | domestic comfort as compound of privacy, intimacy, ease, light/air, efficiency and well-being |
| Alexander domestic pattern cluster | `EARLIER_ANTECEDENT` | `MAJOR` | `PROJECT_CONTACT_UNRESOLVED` proposition-specifically; Alexander is a documented project source generally | `DOCUMENTED` | entrance transition, intimacy gradient, common centre, personal retreat, graded enclosure |
| Alvar Aalto, `The Humanizing of Architecture` | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | technical functionalism must remain subordinate to human life and occupation |
| Irwin Altman — privacy as boundary regulation | `EARLIER_ANTECEDENT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | privacy is dynamic regulation of access, not maximum seclusion |
| Robin Evans — doors/passages/social relations | `COUNTERPOINT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | privacy/separation can also encode hierarchy, reduce encounter and atomise shared life |
| Weiser / Brown — Calm Technology | `CONVERGENT_PARALLEL` | `MAJOR` to technical-attention subclaim | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | technology can recede from focal attention and fit everyday life rather than demand continuous monitoring |
| London housing guidance — `Home as a Place of Retreat` | `EVIDENTIAL_SUPPORT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` where used as professional evidence | `DOCUMENTED` | contemporary housing guidance already bundles retreat, privacy, noise, daylight and environmental quality |

**Graph judgement:** neither `Repose` as an architectural value nor low-attention domesticity is conceptually isolated. The residual is Ovid's present governance bundle and its explicit evidence ceiling: physical performance, privacy/retreat, comprehensibility, local agency, perceptual settlement and technical subordination are judged together without pretending they form one clinical metric.

## C13 — Passive architecture does the first work

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Victor & Aladár Olgyay / bioclimatic programme | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | climate, comfort, orientation, form, shading, openings, air movement and fabric treated as an architectural environmental-design problem |
| Dean Hawkes — selective environment | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` to Ovid's exact ordering | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | built form/fabric/ambient opportunity as primary control; active heating/cooling/ventilation/lighting supplementary rather than prohibited |
| Reyner Banham | `COUNTERPOINT` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` on current evidence | `DOCUMENTED` | powered environmental systems are legitimate architecture; prevents passive-first becoming anti-machine ideology |
| Alex Wilson — passive survivability | `EARLIER_ANTECEDENT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | passive provision as useful fallback during utility loss |
| CIBSE future-weather / overheating practice | `EVIDENTIAL_SUPPORT` | `SUPPORTING` | `CURRENTLY_ACKNOWLEDGED_SOURCE` | `DOCUMENTED` | future-climate stress testing is established practice |

**Graph judgement:** passive-first-but-not-passive-only is inherited. Ovid's residual is constitutional integration with service-life hierarchy, failure resilience, health/performance authority and explicit rewind of permanent design where evidence requires it.

## C14 — Technical necessity must become architecture

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Louis Kahn | `EARLIER_ANTECEDENT` | `FOUNDATIONAL` / `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | mechanical needs can obscure form; spatial/structural order must harbour services and servant functions |
| Richards Medical Research Laboratories | `PRECEDENT_EXEMPLAR` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | technical necessity becomes explicit architectural mass; qualifier: counterpoint because fast services become monumental |
| Salk Institute | `PRECEDENT_EXEMPLAR` | `MAJOR` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | accessible technical infrastructure receives real sectional territory while occupied architecture remains comparatively calm |
| Frascari / tectonic detail tradition | `EARLIER_ANTECEDENT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `STRONG` | construction/detail/joint is an architectural locus rather than mere residue |
| Banham / technology-as-architecture tradition | `COUNTERPOINT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` | `DOCUMENTED` | technical expression need not be quiet or concealed; prevents Ovid from equating honesty with one aesthetic posture |

**Graph judgement:** technical systems receiving architectural order is established. Ovid's residual is quiet domestic lifecycle integration under Repose, proportionality, replacement and stewardship constraints.

## C15 — Pattern and generative-sequence knowledge

| Source | Primary type | Importance | Project contact | Edge confidence | Scope |
|---|---|---|---|---|---|
| Christopher Alexander — 1967 teaching, `Systems Generating Systems`, *Houses Generated by Patterns*, *A Pattern Language*, *The Timeless Way*, later generative-sequence work | `METHOD_ANTECEDENT` | `FOUNDATIONAL` | `DOCUMENTED_ADOPTED_SOURCE`; narrowly `DOCUMENTED_FORMATIVE_SOURCE` for the later project revision that reduced the corpus-level pattern-language claim; original Ovid pattern formation unresolved | `DOCUMENTED` | pattern anatomy, connected language, context subsets, generative ordering, hypothesis/evidence/confidence, revision, language incompleteness, formal-rule authority limits, feedback/backtracking |
| Kimberly Dovey | `COUNTERPOINT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` before ILA | `DOCUMENTED` | ambiguity between empirical/scientific validation and practical/phenomenological experience |
| Dawes & Ostwald | `COUNTERPOINT` | `SUPPORTING` | `NO_DOCUMENTED_PROJECT_CONTACT` before ILA | `DOCUMENTED` | critical map of testability, evidence, universalising rhetoric and Alexander's own self-correction |

**Graph judgement:** nearly all generic pattern/generative-sequence machinery is inherited. Ovid's residual is the typed governance architecture that prevents evidence strength, project maturity, language maturity, pattern identity, implementation, semantic representation, compiler rules, Reference House occurrences and publication rhetoric from silently upgrading one another.

---

# 7. Cross-claim topology

The fifteen claims do not descend from one lineage. They form several historically distinct streams that Ovid combines.

## 7.1 Time / dependency stream

```text
Duffy temporal decomposition ───────┐
                                    ├─ Brand rate/slippage synthesis ──> C02
O'Neill rate hierarchy ─────────────┘

SCAG physical dependency ────────────────────────────────────────────> C02 / C03 / C06
CHS damage-sensitive replacement ───────────────────────────────────> C02 / C06
```

This stream owns most of the physical mechanism Ovid once appeared able to claim more strongly.

## 7.2 Stable framework / bounded change stream

```text
Habraken / SAR / Open Building ──> C04 / C05 / C06 / C09
Weeks ───────────────────────────> C03 / C04 / C09
Van Eyck + Hertzberger ──────────> C04
```

These sources arrive from different problems: inhabitant control, institutional change and committed architectural form. Their convergence is more important than any invented single ancestry.

## 7.3 Open-system / interface stream

```text
British Modular Society / Modular Assembly ──> C10 (+ C06)
SCSD ────────────────────────────────────────> C10 / C06 / C05
Open Building ───────────────────────────────> C10 / C06 / C05
```

This stream separates procurement-time interoperability from later in-use replacement. They are related problems, not one undifferentiated claim.

## 7.4 Service order / maintenance stream

```text
Kahn / Salk ───────────────> C14 / C09 (+ C08 precedent)
Weeks / VAHBS ─────────────> C08 / C09
Strebel + maintainability ─> C08 / C11
```

Ovid's service topology therefore sits at the intersection of architectural service order and professional maintenance geography rather than originating either field.

## 7.5 Failure / recovery stream

```text
building science + water-safe services + compartmentation + robustness + flood recoverability ──> C07
Perrow / complexity theory ──COUNTERPOINT─────────────────────────────────────────────────────────> C07
```

The significant Ovid move is cross-domain domestic coordination, not invention of fail-safe, containment or recovery.

## 7.6 Domestic occupation / attention stream

```text
Bidlake/Wainwright + Rybczynski + Alexander + Aalto + Altman ──> C12
Evans ──COUNTERPOINT───────────────────────────────────────────> C12
Calm Technology ──CONVERGENT_PARALLEL─────────────────────────> C12
```

This makes Repose a synthesis of older domestic, privacy, humanising and attention traditions rather than a solitary project invention.

## 7.7 Environmental stream

```text
Olgyay ───────> C13
Hawkes ───────> C13
Banham ──COUNTERPOINT──> C13
```

No Olgyay→Hawkes causal arrow is currently justified.

## 7.8 Generative-knowledge stream

```text
Alexander ───────────────────────────────> C15
Alexander ─DOCUMENTED_DERIVATION─> Duffy/Torrey pattern-language exposition
```

The second arrow must never be extended into Duffy's later rate-of-change model without new evidence.

---

# 8. Project-contact graph

Project contact is deliberately much sparser than the antecedent graph.

## 8.1 Strong documented project-contact records

### Alexander

- `DOCUMENTED_ADOPTED_SOURCE` for Alexander-style generativity/composition criteria used in PR-01 R2;
- `DOCUMENTED_FORMATIVE_SOURCE` **only** for the later revision that narrowed the corpus-level pattern-language claim after that test;
- original Ovid pattern-system formation remains unresolved.

### Habraken / Open Building

- `DOCUMENTED_ADOPTED_SOURCE` before ILA;
- original formation of the Ovid platform/selective-permanence proposition remains `PROJECT_CONTACT_UNRESOLVED` because the earliest durable state already contains both claim and source.

## 8.2 Current acknowledgement without formative proof

At minimum, current material already acknowledges or uses:

- Duffy;
- Brand;
- Strebel;
- the professional service-life / maintainability sources;
- relevant Norwegian water-safe / UK regulatory precedents;
- Perrow;
- current evidence/guidance underlying C11/C12/C13.

Unless a proposition-specific durable revision record is identified, these remain no stronger than `CURRENTLY_ACKNOWLEDGED_SOURCE` or `DOCUMENTED_ADOPTED_SOURCE` as already established by their owning dossier/freeze. Current citation is not retroactive formation.

## 8.3 No documented pre-ILA project contact

The deep dossiers establish `NO_DOCUMENTED_PROJECT_CONTACT` for at least:

- Weeks;
- Van Eyck;
- Hertzberger;
- Schulitz / SCAG;
- Century Housing System / Utida line;
- British Modular Society / Modular Assembly;
- SCSD / Ehrenkrantz;
- Kahn;
- Olgyay;
- Hawkes.

The conceptual closeness of several of these sources is therefore **convergence / antecedence**, not evidence of hidden formative influence.

---

# 9. Explicit non-edge / prohibited-genealogy ledger

These constraints are first-class outputs of ILA. Later diagrams, prose and matrix work must preserve them.

| Non-edge | Status | Reason |
|---|---|---|
| Alexander → Duffy building-layer / rate-of-change model | `NO EDGE ESTABLISHED` | Alexander→Duffy is documented only for pattern-language exposition; Duffy's recoverable layer origin lies in office planning / organisational / supply-chain work |
| O'Neill → Duffy | `NO EDGE ESTABLISHED` | Duffy's temporal layer work predates O'Neill's 1986 ecological hierarchy book |
| Duffy → O'Neill | `NO EDGE ESTABLISHED` | no proposition-specific evidence; the two lines converge independently in Brand |
| SCAG / Schulitz → CHS / Utida | `NO EDGE ESTABLISHED` | D05 found convergent physical-dependency logic but no genealogy |
| CHS / Utida → SCAG / Schulitz | `NO EDGE ESTABLISHED` | chronology and source record do not support it |
| Van Eyck → Hertzberger `polyvalence` | `DERIVATION_NOT_PROVEN` | direct intellectual contact is documented, but no source says the specific concept derives from Van Eyck's false-neutrality proposition |
| Tatton-Brown / Modular Society interchangeability → SCSD compatibility rule | `DERIVATION_NOT_PROVEN` | Ehrenkrantz was inside the British field, but the exact proposition transfer is not documented |
| Olgyay → Hawkes selective-environment hierarchy | `DERIVATION_NOT_PROVEN` | same environmental field and related mechanism, no exact causal source recovered |
| Kahn → C02 lifecycle-coupling theory | `NO DIRECT EDGE` | Kahn's governing problem is spatial/service order, not differential service-life coupling |
| Kahn → C05 Open Building/platform theory | `NO DIRECT EDGE` | service-order similarity does not establish support/infill or levels genealogy |
| Habraken 1961 → all later Open Building lifecycle propositions verbatim | `PROHIBITED BACK-PROJECTION` | original work includes durability but is governed by independent dwelling / distributed control; later technical/lifecycle formulations develop over time |
| Brand → physical replacement-destruction mechanism as historical origin | `PROHIBITED PRIORITY SIMPLIFICATION` | SCAG predates Brand and CHS independently formalises damage-sensitive replacement |
| Repose → one clinical / physiological state | `NO SUCH EDGE` | C12 is a project governance bundle across distinct evidence and architectural traditions, not one validated medical construct |

---

# 10. Graph-level Ovid delta

The graph changes the plausible Ovid contribution from a collection of apparently new mechanisms into a much narrower and more coherent proposition.

Across C01–C15, prior work already owns substantial territory in:

- architecture as a temporal object;
- different rates of change;
- separation / slippage / non-destructive replacement;
- bounded adaptability;
- committed form capable of changed use;
- support/infill and base-building infrastructure;
- reversible / interoperable interfaces;
- failure containment, observability and recovery;
- maintenance geography;
- service order;
- standard interfaces and multi-manufacturer systems;
- field identification and lifecycle records;
- domestic repose, privacy, retreat and low-attention technology;
- passive-first environmental ordering;
- architectural treatment of technical necessity;
- patterns and generative sequences.

The strongest recurring Ovid residual is therefore not one new mechanism. It is a **typed, proportional domestic governance synthesis**.

The recurring project-specific structure is:

1. **scope change by burden** — not every possible future earns permanent provision;
2. **judge dependency physically** — access, release, withdrawal, reinstatement and slow-fabric damage matter more than nominal labels;
3. **treat maintenance and failure spatially** — ordinary future work and abnormal states occupy architectural geography;
4. **assume weak stewardship** — suppliers, records and project memory can decay;
5. **protect domestic architectural commitment** — technical serviceability must not dissolve the house into neutral infrastructure or technical theatre;
6. **separate authority types** — source evidence, pattern maturity, one-project occurrence, semantic representation, compiler checks and publication rhetoric do not silently upgrade one another;
7. **permit rewind** — evidence, topology, failure or human factors can invalidate an upstream architectural decision rather than being forced to fit it.

That seven-part result is a **candidate synthesis / operationalisation**. ILA-03A does not claim it is historically original. ILA-03B and ILA-04 must test it claim by claim and decide the exact attribution / priority / treatment consequences.

---

# 11. Demonstrated gaps versus empty graph space

03A does **not** reopen broad research merely because some claims have fewer famous names.

No demonstrated gap currently requires a new ILA-02 dossier.

The following are sufficient for 03B:

- C01/C02 — Duffy / Brand / SCAG / CHS;
- C03/C04/C05 — Weeks / Van Eyck / Hertzberger / Habraken / SAR / Open Building;
- C06/C10/C14 — SCAG / CHS / Modular Society / SCSD / Open Building / Kahn / Frascari counterfield;
- C07 — frozen F04 direct architectural/professional lineages;
- C08/C09/C11 — VAHBS / Weeks / Strebel / maintainability / Kahn / Open Building / professional information practice;
- C12 — frozen F06 domestic, privacy, humanising and attention lineages;
- C13 — Olgyay / Hawkes / Banham;
- C15 — Alexander and bounded criticism.

A new primary-source packet should be opened only if 03B exposes a **decision-changing** ambiguity that cannot be resolved from the existing dossiers/family freezes.

---

# 12. Handoff to ILA-03B

ILA-03B should now build the **claim/source matrix** rather than redraw this graph in a different format.

For each C01–C15 record, 03B must bind:

- strongest antecedent(s);
- direct project source(s), if any;
- project-contact status;
- intellectual relationship type;
- importance;
- edge confidence;
- current reader-facing source/treatment;
- exact inherited territory;
- exact surviving Ovid delta;
- counterpoint / negative evidence;
- unresolved but decision-material questions;
- provisional ILA-04 attribution/treatment pressure.

03B must preserve the non-edge ledger above.

It must **not** convert an empty matrix cell into a research task automatically.

The next question is no longer:

> who else said something similar?

It is:

> **given the now-bounded intellectual topology, what does each Ovid claim inherit, what does it actually add, what does the project demonstrably know or use, and what attribution treatment does intellectual honesty require?**

---

# 13. 03A closeout

### What this record proves

- all fifteen canonical claims are represented in one typed intellectual topology;
- the deep dossiers and frozen families are mutually compatible enough to construct that topology;
- the causal source-to-source graph is sparse and proposition-specific;
- several tempting neat genealogies are positively rejected or remain unproven;
- the recurring Ovid residual is governance / synthesis rather than broad conceptual priority.

### What this record does not prove

- historical priority for the residual Ovid synthesis;
- final importance/treatment of every supporting source;
- that every antecedent belongs in the published book;
- that project contact existed where repository evidence does not show it;
- that one graph replaces technical evidence or architectural judgement;
- that ILA has authorised any reader-facing edit.

### Exact next packet

> **ILA-03B — claim/source matrix.**

No manuscript, doctrine, pattern, Reference House, compiler or reader-facing publication content is changed by ILA-03A.
