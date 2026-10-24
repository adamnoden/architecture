# OCG-02D — Counter-Evidence and Precedents

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#576 — OCG-02D — counter-evidence and precedents](https://github.com/adamnoden/architecture/issues/576)  
**Depends on:** OCG-02C / PR #588 / merge `0165f609cfee71583fd076151835e9f94d92b4c8`  
**Baseline `main`:** `0165f609cfee71583fd076151835e9f94d92b4c8`  
**State:** candidate research closeout; becomes the OCG-02D record when merged

## Purpose

Close the OCG evidence phase by attacking the intervention-friendly strategies that survived OCG-02A–C.

The programme has now found credible value in:

- lifespan separation;
- bounded replaceability;
- local service geography and isolation;
- complete withdrawal/replacement planning;
- temporary containment;
- selective off-site preparation;
- physical legibility and stewardship.

None is free.

This packet asks:

> **What permanent penalties, technical duties, failure modes and architectural compromises can make an apparently maintainable/reversible strategy worse than ordinary construction?**

It also ranks precedents by what they actually prove for Ovid’s House rather than by novelty.

---

## Evidence posture

Counter-evidence is deliberately drawn from several scales:

- standards/guidance on fire, cavities and tested access interfaces;
- acoustic guidance on movable/demountable partitions;
- systematic DfD literature reviews;
- recent housing evidence of adaptable systems in use;
- mature low-tech domestic precedent;
- experimental Open Building and prefabricated-house precedents.

Not every source is directly transferable to an English detached house. The point is to expose **duties and failure mechanisms** that OCG must not erase merely because an access strategy sounds elegant.

---

# 1. Source register

## S1 — ISO 20887:2020

Source: <https://www.iso.org/standard/69370.html>

Type: international DfD/adaptability standard; confirmed current in 2025.

Counter-evidence value:

- DfD/A is a set of potential strategies/options rather than a universal performance maxim;
- adoption is contextual;
- selected strategies bring their own implementation requirements.

## S2 — Ostapska et al., 2024, systematic scoping review of Design for Disassembly

Source: <https://www.sciencedirect.com/science/article/pii/S235255092400143X>

Type: peer-reviewed review of almost 470 publications and 151 built DfD structures.

Counter-evidence value:

- DfD definitions/practice remain heterogeneous;
- nearly half of reviewed literature cited undeveloped technology as a barrier and substantial literature cited missing skills, recertification, data continuity, slower deconstruction and aesthetic/social concerns;
- many built examples remain small/experimental;
- no universal effective DfD construction method has emerged.

## S3 — Tarpio & Huuhka, 2026, adaptable housing in Finland

Source: <https://link.springer.com/article/10.1007/s10901-026-10293-7>

Type: peer-reviewed housing stakeholder study.

Counter-evidence value:

- implemented relocatable partitions suffered connector/material damage, visual degradation, tolerance difficulties and poor sound insulation;
- residents rarely relocated them;
- the developer abandoned the system and returned to standard drywall;
- building services, fire and acoustic obligations can become barriers to adaptability;
- limited ordinary provisions can outperform maximum transformability.

## S4 — ASFP guidance on access panels in fire-resisting systems

Source: <https://asfp.org.uk/knowledge/ask-the-expert>

Type: UK passive-fire industry technical guidance.

Counter-evidence value:

- an access panel in a fire-resisting system is not a neutral hole;
- the panel, frame, fixings and seals need demonstrated performance as part of the relevant system;
- panel size/use is bounded by tested evidence.

Transferability: direct principle even though example guidance often concerns ductwork.

## S5 — Scottish domestic building standards, cavities

Source: <https://www.gov.scot/publications/building-standards-technical-handbook-2022-domestic/2-fire/2-4-cavities/>

Type: official domestic building guidance; jurisdictional context differs from England but fire mechanism is transferable.

Counter-evidence value:

- hidden cavities can permit rapid, unseen smoke/fire spread;
- cavity size/surfaces and barriers require explicit design;
- a service riser or other service void is a cavity with real fire duties.

## S6 — UK Government research on volumetric modular construction / fire

Source: <https://www.gov.uk/government/publications/volumetric-modular-construction-research/volumetric-modular-construction-research>

Type: government research.

Counter-evidence value:

- modular/void-rich construction can create concealed pathways requiring careful fire stopping, inspection and maintenance;
- additional interfaces and inaccessible cavities create system-level obligations;
- drilling/additional services can undermine compartmentation if not anticipated.

Transferability: mechanism-level, not a claim that all modular/reversible construction is unsafe.

## S7 — UK government acoustic design guidance on movable partitions

Source: current court/tribunal design guidance and conventional acoustic references.

Counter-evidence value:

- movable partitions generally provide less reliable sound insulation than conventional fixed partitions;
- installed performance depends on seals, junctions and repeated deployment;
- flexibility can require explicit compromise in privacy/acoustic quality.

Transferability: not domestic authority, but consistent with the Finnish residential evidence and general acoustic mechanics.

## S8 — Historic England, older-window repair

Source: <https://historicengland.org.uk/advice/your-home/maintain-repair/windows/>

Type: UK official domestic heritage guidance.

Precedent value:

- minimum intervention;
- long-life host retained;
- individual sashes commonly removable for repair without damage;
- character/solidity do not depend on the assembly advertising its maintainability.

## S9 — NEXT21, Osaka

Source: <https://www.councilonopenbuilding.org/projects/next21>

Type: long-running experimental residential support/infill precedent.

Precedent value:

- proves deep support/infill separation and adaptable utility infrastructure can support repeated residential change;
- also demonstrates the amount of permanent infrastructure/system coordination required.

## S10 — KieranTimberlake, Loblolly House

Source: <https://kierantimberlake.com/work/loblolly-house/>

Type: experimental single-family precedent.

Precedent value:

- proves a house can be conceived as integrated off-site assemblies with simple-tool connections;
- simultaneously illustrates the bespoke system, documentation and interface dependence created by high-system reversibility.

---

# 2. Counter-evidence — every access provision becomes a technical assembly

A recurring false simplification is:

> add an access panel → improve maintainability.

The moment an access opening crosses a technical boundary, the panel becomes part of that boundary.

Possible duties include:

- fire resistance / smoke control;
- acoustic isolation;
- air tightness;
- vapour control;
- waterproofing / water shedding;
- thermal continuity;
- structural restraint;
- security;
- impact robustness;
- appearance and repeated alignment.

ASFP guidance makes this especially explicit for fire-resisting systems: panel, frame, fixings and seals must perform together.

### OCG conclusion

**Access is not a subtraction of architecture. It is another assembly that must perform.**

Therefore a permanent access interface only earns itself where the intervention consequence it removes is strong enough to pay for these additional duties.

This is a direct application of OCG-01D.

---

# 3. Counter-evidence — cavities are not free service territory

Accessible voids, risers, raised floors and removable linings are attractive because they separate services from slow fabric.

But cavities can create:

- hidden fire/smoke pathways;
- additional cavity barriers/fire stopping;
- acoustic flanking;
- pest/dust accumulation;
- moisture/condensation inspection problems;
- loss of room depth/height;
- additional linings/supports;
- concealed workmanship defects;
- future unauthorised service additions.

Domestic fire guidance explicitly treats service risers/voids as cavities whose spread must be controlled.

### OCG conclusion

A service cavity can be the right answer, but its value must be concentrated enough to justify its permanent technical duties.

This strongly favours:

- **few deliberate high-value service zones**

over
- **ubiquitous technical cavities everywhere**.

No universal access floor/wall lining is earned by the research.

---

# 4. Counter-evidence — repeated removability can degrade the interface

The intuitive model of a demountable joint assumes repeated cycles leave it unchanged.

Real systems encounter:

- paint bridging;
- worn screw holes;
- distorted clips;
- lost fixings;
- damaged edges;
- gasket/seal ageing;
- dirt accumulation;
- differential movement;
- tolerance drift;
- replacement parts that differ slightly from originals;
- trades reassembling parts incorrectly.

The Finnish relocatable-partition evidence is direct: repeated screw/unscrew cycles caused visible damage, while real slab variation complicated reused fitting pieces.

### OCG conclusion

**First-cycle removability is not enough.**

Any repeatedly accessed custom interface should eventually prove:

1. opening;
2. actual work/withdrawal;
3. reclosure;
4. retained technical performance;
5. retained visual quality;
6. repeatability after realistic ageing/tolerance.

This aligns with the existing manufacturing strategy’s first-article removal/reinstatement posture and does not create a new OCG manufacturing doctrine.

---

# 5. Counter-evidence — acoustic solidity is a real everyday value

Flexible/demountable partitions often pay for movement through lighter construction, more joints and seals, and greater sensitivity to installation.

Acoustic guidance and the Finnish housing evidence both identify reduced/reliability-sensitive sound insulation as a real consequence.

For a dwelling, that penalty is experienced every day; reconfiguration may happen once or never.

### OCG conclusion

A quiet solid conventional wall may be more proportionate than a demountable wall where no recurrent intervention needs to pass through it.

This supports the existing Reference House presumption of conventional direct quiet finishes/walls in principal rooms unless a canonical scenario later proves a material conflict.

**Do not let hypothetical flexibility silently outrank ordinary acoustic life.**

---

# 6. Counter-evidence — fire robustness can be weakened by flexibility theatre

More interfaces can mean more opportunities for:

- gaps;
- incorrect reassembly;
- missing seals;
- penetrations added later;
- cavity barrier discontinuity;
- inaccessible inspection;
- incompatible replacement products.

Government modular/fire research shows that void/interface-rich systems need integrated fire thinking and can be difficult to inspect after assembly.

### OCG conclusion

Any candidate serviceability system must show that repeated intervention does not turn fire safety into a maintenance-sensitive hidden dependency.

Where a conventional monolithic or simple assembly provides robust passive protection with little intervention need, **simplicity may be the better maintainability strategy**.

---

# 7. Counter-evidence — airtightness, moisture and weather layers dislike casual reopening

An access strategy near the envelope or wet construction can create recurring risk at:

- membranes;
- seals;
- tapes;
- flashings;
- drainage planes;
- wet-room waterproofing;
- insulation continuity;
- vapour-control layers.

A technically `removable` panel that requires expert resealing each time may simply move destructive risk from plaster to a more consequential boundary.

### OCG conclusion

OCG should prefer, where possible:

- access from the dry/service side;
- technical boundaries that remain untouched by routine access;
- replaceable assemblies mounted within deliberate permanent openings/interfaces.

This is a research-supported reason for the existing `Accessible ≠ exposed` posture and dry-side wet-room access interest.

No specific detail is authorised here.

---

# 8. Counter-evidence — generic flexibility can consume useful domestic area

Loose-fit rooms, double floors, oversized circulation, spare riser capacity and universal working clearances all cost space.

The Finnish study directly identifies cases where loose-fit flexibility conflicts with project economics because the larger area does not necessarily produce proportionate value.

For Ovid’s House the issue is broader than economics: permanent area devoted to hypothetical intervention capacity can reduce room generosity or increase building size/embodied material.

### OCG conclusion

Reserve permanent intervention space only where:

- the task is credible;
- the clearance cannot be provided temporarily;
- several interventions benefit from the same provision; or
- failure to reserve it would force disproportionate destruction.

A plant room can earn working space differently from every bedroom wall reserving access clearances.

---

# 9. Counter-evidence — proprietary flexibility can age worse than ordinary construction

High-system reversible architectures can depend on:

- unique clips;
- proprietary rails;
- bespoke cartridges;
- manufacturer-specific seals;
- digital information;
- exact modules;
- specialist tooling or fabrication.

The original system may disappear long before the permanent building.

### OCG conclusion

Where performance is otherwise adequate, OCG should favour:

- ordinary mechanical fasteners;
- intelligible geometry;
- replaceable commodity parts;
- tolerance that can be recreated by future fabricators;
- records that help but are not the only source of truth.

A future worker should be able to understand the interface even if the original supplier and cloud account are gone.

---

# 10. Counter-evidence — deconstruction success depends on an ecosystem outside the building

The DfD review identifies barriers well beyond physical joints:

- professional skills;
- component recertification;
- material/component data;
- deconstruction time;
- storage/logistics;
- reuse demand;
- aesthetics/social perception.

This means even a technically perfect disassembly system may not deliver its intended circular outcome.

### OCG conclusion

End-of-life reuse claims must not be used to subsidise an occupied-change response unless those claims are separately evidenced.

For OCG, the strongest justification remains immediate and building-life-specific:

> **Does this interface reduce a credible intervention consequence in the house itself?**

---

# 11. Counter-evidence — maintainability infrastructure becomes part of the maintenance burden

A sophisticated serviceability system can introduce:

- more seals;
- access catches;
- removable trims;
- gaskets;
- labels;
- inspection doors;
- cavity barriers;
- removable floor supports;
- proprietary panels;
- extra isolation valves.

Each can fail, loosen, seize, leak, rattle or become obsolete.

### OCG conclusion

The programme must count the maintenance of maintainability.

A response is suspect where:

> the permanent apparatus required to make a rare intervention easier creates more recurrent upkeep than the original problem.

This is not anti-serviceability. It is the proportionality test applied honestly to the response itself.

---

# 12. Counter-evidence — visual/institutional character is not a cosmetic afterthought

Grid ceilings, repeated access hatches, removable wall seams, exposed service rails and technical labels can make a domestic interior read as temporary or institutional.

That cost is real even when no regulation prohibits it.

Ovid’s House explicitly values calm, solidity, load-path legibility and low nervous-system demand.

### OCG conclusion

A serviceability strategy that turns principal rooms into visible maintenance infrastructure must carry a very high burden of proof.

The preferred order is:

1. hide complexity in deliberate service geography;
2. make the access interface architectural where it must enter occupied space;
3. preserve ordinary domestic surfaces elsewhere.

`Accessible ≠ exposed` survives the research phase intact.

---

# 13. Precedent hierarchy

The research phase now contains three particularly useful precedents. They should **not** be treated as equally transferable.

## Tier 1 — mature bounded domestic precedent: traditional sash window

What it proves:

- a durable host opening can coexist with removable/repairable faster-life components;
- intervention can be local;
- the assembly remains fully domestic and culturally ordinary;
- replaceability need not advertise technicality;
- maintenance can preserve rather than replace the whole assembly.

What it does not prove:

- every building layer should work like a sash window.

### OCG assessment

**Strongest Ovidian precedent.**

Its value lies less in historical style than in the relationship:

> permanent opening + replaceable assembly/subcomponents + local access + retained surrounding fabric.

## Tier 2 — systematic support/infill precedent: NEXT21

What it proves:

- deep structural/infill separation can support repeated residential reconfiguration;
- service infrastructure can be designed for future alteration rather than buried ad hoc;
- repeated occupied change can be an explicit building-system objective.

What limits transferability:

- multi-unit economics;
- experimental programme/management;
- double floors and centralised service infrastructure;
- substantial permanent spatial/system provision.

### OCG assessment

**Proof of possibility, not default house template.**

Use to challenge claims that support/infill cannot work; do not use to bypass proportionality.

## Tier 3 — maximal integrated prefabrication/reversibility precedent: Loblolly House

What it proves:

- off-site integrated assemblies and simple-tool connections can reorganise house construction radically;
- high-system reversible assembly can be architecturally intentional rather than an afterthought.

What limits transferability:

- bespoke system;
- experimental/private-house context;
- strong dependence on original assembly logic and fabrication knowledge;
- technological expression itself is part of the architectural project.

### OCG assessment

**Upper-bound technical challenger.**

It demonstrates possibility but does not earn a comparable systems architecture for Ovid’s House.

---

# 14. Surviving principles after the red team

The following survive OCG-02A–D strongly enough to carry into scenario selection.

## 14.1 Bounded replaceability

A faster-changing object should, where proportionate, be removable without unbuilding materially slower host fabric.

Survives because:

- mature domestic precedent exists;
- it targets a specific intervention mechanism;
- it does not require universal flexibility.

## 14.2 Complete intervention envelope

Access alone is not enough. The design must consider isolation, working clearance, withdrawal, transport, replacement, reclosure and return to use.

Survives because:

- reversible connection evidence alone is insufficient;
- logistics/withdrawal repeatedly emerge as separate constraints.

## 14.3 Temporary containment first

Competent temporary containment/sequencing is the default owner for construction-site control.

Survives because:

- high-control occupied settings prove temporary controls can be powerful;
- permanent clinical infrastructure is disproportionate for ordinary housing by default.

## 14.4 Specific latent capacity over generic flexibility

Where a future change is credible, provision the difficult irreversible relationship rather than making the entire building generic.

Survives because:

- adaptable housing evidence supports limited targeted provisions;
- generic flexible systems can suffer low use and permanent performance penalties.

## 14.5 Permanent performance remains primary

Acoustic, fire, moisture, structure, airtightness, thermal performance, solidity and architectural calm are not secondary to maintainability.

Survives because:

- real flexible systems can fail these duties;
- access/voids create technical obligations of their own.

---

# 15. Rejected hypotheses after the full research phase

## R1 — Universal demountability

**REJECTED.**

No evidence warrants making the whole house removable/panelised.

## R2 — Permanent clean/dirty contractor zoning

**REJECTED by default.**

Temporary works are capable and more proportionate for ordinary domestic interventions.

## R3 — Dedicated second contractor circulation

**REJECTED by default.**

Trace routes; solve actual geometric blockers; do not duplicate circulation speculatively.

## R4 — Quiet/dust-free renovation promise

**REJECTED.**

Some construction noise/dirt is intrinsic. Target avoidable operations and spread.

## R5 — Prefabrication as universal good

**REJECTED.**

It earns value only when it deletes/compresses real onsite consequence without creating larger dependency/logistics burdens.

## R6 — Every service independently isolatable

**REJECTED as universal rule.**

Isolation granularity must be tested against recurrent consequence and fitting/space/maintenance burden.

## R7 — More cavities = more maintainability

**REJECTED.**

Cavities create fire/acoustic/moisture/inspection/area duties.

## R8 — Flexible partitions as general adaptability answer

**REJECTED.**

Real housing evidence demonstrates low use and permanent acoustic/visual/tolerance penalties.

---

# 16. Questions intentionally left for OCG-03 / 04 / 05

Research cannot answer these without applying the method to defined interventions and the actual project architecture:

- Which 10–15 interventions best cover the surviving causal mechanisms?
- Does the current Reference House already bound most IC1–IC3 interventions sufficiently?
- Are direct plaster walls actually implicated once service routes are kept out of them?
- Do conventional principal-room floors create any recurrent intervention problem serious enough to reopen the held access-floor idea?
- Does dry-side bathroom access genuinely reduce total consequence rather than move it into the gallery?
- Is the current isolation granularity enough?
- Can windows/doors actually withdraw through their intended interfaces with real products/tolerances?
- Does the plant/service geography produce a genuinely bounded work zone?
- Does any canonical scenario earn a new pattern or Reference House change?

Those are now testable questions rather than intuitions.

---

# 17. Publication implication — still large internally, small externally

The research has produced useful machinery, but almost none belongs verbatim in the book.

If the later audits uphold the idea, the public doctrine may need only a small argument:

- small foreseeable changes should not gratuitously propagate through unrelated fabric and domestic life;
- shorter-life components should be separable from slower hosts where the whole-life case is proportionate;
- access should be architectural but not conspicuous;
- temporary works remain temporary;
- some major alterations honestly remain disruptive.

The evidence matrix, intervention classes, consequence ledger and proportionality machinery should remain internal credibility infrastructure unless a later editorial decision specifically earns them.

No publication prose is authorised here.

---

# Result

**OCG-02D PASS — the research phase closes with a narrower, more credible occupied-change position than the original renovation frustration.**

The strongest synthesis is:

> **Every reversible interface must pay rent twice: first by materially reducing a credible intervention consequence, and again by preserving the permanent building’s ordinary performance and architectural quality.**

The research does **not** support a demountable house, permanent construction-site infrastructure, generic flexibility or zero-disruption renovation.

It does support testing for bounded replaceability, complete intervention envelopes, targeted lifespan separation, local isolation where earned, and geometry that permits competent temporary containment.

No architectural correction is authorised by OCG-02.

The next authorised phase after clean merge is **OCG-03 — canonical intervention suite**, where roughly 10–15 deliberately chosen interventions will test these findings without yet judging the Reference House.
