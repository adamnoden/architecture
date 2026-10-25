# ILA-01B-F04 — Failure, robustness and recoverability discovery

**Programme:** [#630 — ILA — intellectual lineage and attribution audit](https://github.com/adamnoden/architecture/issues/630)  
**Packet:** [#664 — ILA-01B-F04 — failure, robustness and recoverability discovery](https://github.com/adamnoden/architecture/issues/664)  
**Depends on:** ILA-01C-F03 / PR #662 / merge `a374e5d93d9d3463123b261837acc9530adbfe1c`  
**Baseline `main`:** `a374e5d93d9d3463123b261837acc9530adbfe1c`  
**Family:** ILA-F04 — Failure, robustness and recoverability  
**Primary claim:** ILA-C07  
**State:** bounded discovery register; provisional relationships only; no final importance, attribution, originality or publication verdicts

---

# 1. Question

ILA-C07 currently states:

> **Design credible failures to reveal themselves early, remain safely managed and locally containable where practical, and be reachable for repair before they consume long-lived fabric.**

Part II makes the design question memorable:

> **If the first defence fails, what happens next?**

The current Ovid sequence is approximately:

1. remove avoidable sources of failure;
2. use geometry and passive physics to reduce failure probability;
3. contain or limit credible failures where proportionate;
4. make abnormal conditions detectable;
5. provide rapid isolation;
6. provide access for diagnosis and repair;
7. provide a route for drainage, drying and recovery.

The family question is therefore:

> **What prior architectural and cross-domain traditions already treat foreseeable failure as a design input, seek to arrest propagation, reveal abnormal states, preserve residual function, isolate the fault and make recovery possible — and what, if anything, does Ovid materially add by generalising those ideas across ordinary domestic architecture?**

The discovery must resist one tempting but misleading narrative: that `failure architecture` descends from one safety-science theory.

It does not.

The current evidence points instead to several **convergent traditions** that developed similar control moves for different reasons and at different scales.

---

# 2. Boundary: robustness, not universal resilience

The word `resilience` is especially dangerous in this family because it is used differently across ecology, engineering, organisations and architecture.

Ovid's C07 is deliberately about **credible failures**.

That makes its centre of gravity closer to **robustness**:

> design against identifiable failure modes and preserve acceptable behaviour when they occur.

Resilience engineering commonly distinguishes this from adaptation to disturbances that the designer did **not** foresee.

The Resilience Engineering Association's introductory synthesis, following David Woods, states the distinction directly:

- robustness handles known failure modes;
- resilience concerns trouble that was not foreseeable by the designer.

Source:

- Resilience Engineering Association, `Resilience engineering: Where do I start?`: https://www.resilience-engineering-association.org/resources/where-do-i-start/

### Consequence for F04

F04 should not turn C07 into a promise that Ovid's House is `resilient` to everything.

The defensible claim is narrower:

- identify credible domestic failure modes;
- make their first consequences bounded where practical;
- avoid hidden accumulation;
- provide detection / isolation / access / recovery;
- avoid unnecessary coupling that lets one defect consume unrelated slow fabric.

Unforeseeable combinations remain a boundary condition and an adversarial test, not a solved class.

---

# 3. Current project posture before new discovery

The current manuscript already treats failure as architectural rather than purely technical.

Part II asks:

> **If the first defence fails, what happens next?**

The current reader-facing argument already uses several direct precedents:

- Norwegian water-installation practice, where concealed leakage should become detectable and should not damage unrelated building fabric;
- UK hot-water safety discharge / tundish visibility;
- roof and drainage design in which blockage or overflow should produce an observable outward consequence rather than concealed inward damage;
- conservation / building-physics logic around wetting, drainage and drying;
- Charles Perrow only as a bounded cross-domain warning about tight coupling and propagation.

The existing project therefore **does not present Perrow as the origin of failure architecture**. That is a good baseline to preserve.

The discovery task is to determine how deep the architectural prior art actually runs and whether the phrase `Failure Architecture` describes a materially distinct synthesis or merely gathers established safety / durability practices under one title.

---

# 4. Discovery topology

The bounded search produced five source streams.

They should not be collapsed into one genealogy.

1. **fail-safe / damage-tolerant engineering**;
2. **defence-in-depth and explicit failure-analysis methods**;
3. **building-envelope controlled-failure design**;
4. **building-specific containment, visibility and disproportionate-propagation control**;
5. **complex-systems / resilience counter-traditions**.

The streams overlap conceptually but answer different questions.

---

# 5. Stream A — fail-safe / damage-tolerant engineering

## 5.1 J. F. McBrearty — fail-safe airframe design, 1956

J. F. McBrearty's 1956 SAE paper `Fatigue and Fail-Safe Airframe Design` explicitly contrasts two safety philosophies:

- **safe-life** — prevent failure during a defined life;
- **fail-safe** — assume a structural failure may occur and design so that the failure does not immediately become catastrophic.

Primary source metadata / abstract:

- J. F. McBrearty, `Fatigue and Fail-Safe Airframe Design`, SAE Technical Paper 560039, 1956: https://saemobilus.sae.org/papers/fatigue-fail-safe-airframe-design-560039

The source is aircraft-specific and must not be imported wholesale into domestic architecture.

Its relevance is conceptual:

> **safety may depend not only on preventing the first failure, but on designing the system's behaviour after that failure has occurred.**

That is a direct parallel to Ovid's `if the first defence fails` question.

### Relationship to Ovid

`EARLIER_ANTECEDENT` / cross-domain conceptual analogue.

No documented project contact before ILA.

### What it closes

Ovid cannot claim to originate the general move from:

`prevent failure`

to:

`assume a credible failure occurs and design the post-failure condition`.

That move is established engineering prior art.

## 5.2 Damage tolerance / inspectability

Later damage-tolerance practice strengthens the same family by binding residual capacity to:

- crack / defect growth;
- inspection;
- detection before critical propagation;
- repair or retirement before catastrophic loss.

F04 does not need a complete history of aviation structural safety. The useful boundary has already been established:

> **post-failure residual behaviour + detectability + intervention before catastrophe is not an Ovid invention.**

### Limits of transfer

Aircraft structure is:

- safety-critical;
- tightly controlled;
- professionally inspected;
- subject to known certification and maintenance regimes.

A house is normally none of these things.

The transfer is therefore conceptual only. The domestic question is precisely how far a useful fail-safe posture can survive **weak stewardship**, decades of ownership change and ordinary trades.

That weak-stewardship condition belongs to the possible Ovid delta, not the aerospace source.

---

# 6. Stream B — defence-in-depth and failure-analysis methods

## 6.1 Nuclear defence in depth

The US Nuclear Regulatory Commission traces the nuclear use of multiple `lines of defence` back to the Manhattan Project / Hanford period and notes that the phrase `defense in depth` appears in nuclear-safety usage by 1958.

The historical model included:

- inherently safer features;
- static / physical barriers;
- active shutdown / cooling systems;
- backup systems;
- emergency response.

NRC historical source:

- `Defense in Depth — A War for Safety`: https://www.nrc.gov/education-regulatory-research/history-101/defense-in-depth---a-war-for-safety

NRC glossary:

- https://www.nrc.gov/education-regulatory-research/glossary/defense-in-depth

The contemporary NRC definition is explicit that no single layer, however robust, should be exclusively relied upon.

### Relationship to Ovid

`EARLIER_ANTECEDENT` / cross-domain parallel.

No documented project contact before ILA.

### Relevant overlap

The overlap is with Ovid's layered sequence:

- prevention;
- passive consequence limitation;
- active detection / intervention;
- recovery.

The overlap is **not** a warrant to design houses like nuclear facilities.

### Important boundary

Defence-in-depth can easily become:

- redundant safety machinery;
- excessive complexity;
- additional maintenance burden;
- opaque interaction between safety layers.

F02 proportionality and the Perrow/Cook counterpoints therefore prevent F04 from turning `more layers` into a universal good.

## 6.2 Failure Modes and Effects Analysis — FMEA

FMEA is relevant because it makes one part of the Ovid procedure explicit:

> take the system apart conceptually, identify how each part or step can fail, record the consequence, ask how the failure is prevented or detected, and specify corrective action.

Historical literature places the first formal FMEA standard at US military procedure **MIL-P-1629 (1949)**, followed by aerospace adoption.

The exact historical genealogy should be verified in ILA-02 if FMEA is promoted beyond contextual status.

Current UK government guidance demonstrates the method's enduring logic. The Forensic Science Regulator's accessible guidance describes process FMEA as identifying:

- what could go wrong;
- how failure affects function;
- causes;
- current controls that prevent or detect the failure;
- actions required.

Source:

- GOV.UK, `Forensic science providers: validation`, section 7.4: https://www.gov.uk/government/publications/forensic-science-providers-validation/forensic-science-providers-validation-accessible

### Relationship to Ovid

`CONVERGENT / PARALLEL` method family unless direct project influence is later evidenced.

### Relevant overlap

Ovid already runs failure questions at component / interface / strategy level. FMEA proves that systematic failure-mode enumeration, effects, detection and controls are long-established methods.

### Important non-overlap

Ovid should not inherit:

- one numerical risk-priority score;
- a bureaucratic worksheet as architecture;
- pseudo-precision around failure probability;
- industrial process assumptions.

Its useful intellectual inheritance is the **discipline of asking what happens when each important thing fails**, not the spreadsheet form.

## 6.3 Fault-tree / probabilistic methods — bounded out

Fault-tree analysis and related high-hazard risk methods could broaden this family indefinitely.

They are not needed to understand C07 at discovery stage.

The house doctrine currently does not claim probabilistic risk modelling and should not acquire it merely because such tools exist.

Disposition:

`CONTEXTUAL / DO NOT DEEPEN WITHOUT A LATER GAP`.

---

# 7. Stream C — building-envelope controlled-failure design

This is one of the most important findings of F04 because it provides **direct architectural prior art**, not analogy from another industry.

## 7.1 N. B. Hutcheon — performance requirements for exterior walls

The National Research Council of Canada's Building Research Division developed a systematic performance approach to exterior wall design in the early 1960s.

N. B. Hutcheon's `Requirements for Exterior Walls` (CBD-48, December 1963) argues for treating wall design systematically against required functions and environmental actions rather than relying on inherited assemblies by habit.

Primary archive:

- NRC Canada, CBD-48, `Requirements for Exterior Walls`, N. B. Hutcheon, December 1963: https://nrc-publications.canada.ca/eng/view/accepted/?id=6e20b761-6642-4b3d-9eb6-971b534c64e4

Hutcheon matters to F04 because the exterior wall becomes a set of **performance defences and controlled relationships**, not one supposedly perfect material barrier.

## 7.2 G. K. Garden — rain penetration and control

G. K. Garden's `Rain Penetration and its Control` (CBD-40, 1963) belongs even more directly in F04.

Primary source identity:

- G. K. Garden, `Rain Penetration and its Control`, Canadian Building Digest CBD-40, National Research Council Canada, 1963.

NRC archive / bibliographic records:

- https://nrc-publications.canada.ca/
- WorldCat record: https://search.worldcat.org/title/Rain-penetration-and-its-control/oclc/35351546

The important intellectual move is not merely the invention or naming of a rainscreen.

It is the architectural acceptance that:

> **rain control need not depend on pretending the outermost line will remain perfectly impermeable for the whole life of the building.**

Modern drained / screened wall practice makes the same logic explicit:

- exterior cladding reduces exposure;
- some water penetration is anticipated;
- a secondary water-control layer limits inward travel;
- drainage removes water;
- drying capacity limits the consequences of residual wetting.

### Relationship to Ovid

`EARLIER_ANTECEDENT` — direct architectural lineage.

No documented project contact before ILA unless later repository chronology proves otherwise.

### Why this source matters more than a generic `fail-safe` analogy

The building-envelope tradition already contains the exact architectural move:

`first line may fail → provide a controlled second condition → direct water somewhere harmless → permit drying / recovery`.

This is extremely close to Ovid's water and roof-failure logic.

The project therefore **must not imply that it invented passive secondary failure paths in architecture**.

## 7.3 Drainage and drying as recovery

This stream also closes another possible novelty claim.

Building science has long treated water control as a sequence involving:

- shedding;
- drainage;
- storage / redistribution where unavoidable;
- drying.

Ovid's insistence that `waterproof` is not a complete durability strategy is therefore well within established building-physics thought.

What remains potentially distinctive is the generalisation of the same failure-path logic from envelope moisture to multiple domestic systems.

---

# 8. Stream D — building-specific containment, visibility and propagation control

This stream contains the **closest domain-specific prior art** to C07.

It is more important to Ovid than the glamour of aerospace or nuclear analogies.

## 8.1 Norwegian water-safe installation rules

Norwegian building regulation provides a remarkably direct statement of the Ovid water-failure problem.

Current TEK17 §15-5 requires that internal water installations:

- are arranged for future maintenance;
- are readily replaceable;
- make leakage easy to detect;
- prevent leakage from damaging installations and building elements;
- provide satisfactory isolation with an accessible and marked stopcock.

Primary legal source:

- Lovdata, TEK17 §15-5: https://lovdata.no/dokument/SF/forskrift/2017-06-19-840/KAPITTEL_13-6

The predecessor TEK10 carried materially similar requirements.

### Relationship to Ovid

`EARLIER_ANTECEDENT` + `EVIDENTIAL_SUPPORT`.

The current manuscript already uses Norwegian water-installation guidance, so the **project contact is explicit** at the source-family level.

### Consequence

For water-bearing domestic systems, Ovid cannot claim novelty for the combined proposition:

- accessible maintenance;
- replaceability;
- easy leakage detection;
- damage limitation;
- accessible isolation.

That bundle already exists in building regulation.

This is probably the single strongest reason F04 should not be presented as an imported safety-engineering idea.

## 8.2 Pipe-in-pipe / visible-leak practice

Norwegian practice around pipe-in-pipe distribution and drained cabinets embodies the same principle physically:

- concealed service is permissible;
- leakage should be guided to a place where it becomes visible rather than allowed to wet hidden construction;
- shorter-lived water distribution should remain replaceable.

This is close prior art for:

- `Visible Leakage Path`;
- `Fail-Safe Water Distribution`;
- dry-side service access.

ILA should later determine the correct reader-facing source level; the current discovery only establishes that the mechanism is inherited.

## 8.3 UK hot-water safety discharge — G3

The Building Regulations in England provide another very direct architectural precedent.

Requirement G3 states that a hot-water system with a storage vessel must ensure that discharge from safety devices is:

- safely conveyed;
- taken to where it is **visible**;
- not dangerous to persons.

Primary legislation:

- Building Regulations 2010, Schedule 1, Requirement G3: https://www.legislation.gov.uk/uksi/2010/2214/schedules/

Current Approved Document G gives acceptable arrangements in which the discharge termination remains visible.

Source:

- GOV.UK, Approved Document G: https://www.gov.uk/government/publications/sanitation-hot-water-safety-and-water-efficiency-approved-document-g

### Relationship to Ovid

`EARLIER_ANTECEDENT` / specific regulated precedent.

### Significance

The architectural idea that an abnormal system state should become **observable before it becomes hidden damage** is directly codified in ordinary UK building practice.

Ovid may generalise that idea, but it does not originate it.

## 8.4 Fire compartmentation

Fire safety supplies perhaps architecture's clearest longstanding example of **local consequence containment**.

Current Approved Document B requires compartment construction to form a complete barrier to fire between compartments and controls service penetrations that could transmit spread.

Source:

- GOV.UK, Approved Document B: https://www.gov.uk/government/publications/fire-safety-approved-document-b

The principle is broader than a particular detail:

> **a local fire should not be given an uncontrolled route to become a whole-building fire.**

### Relationship to Ovid

`EARLIER_ANTECEDENT` / bounded architectural analogue.

### Boundary

Fire compartmentation has a life-safety and regulatory burden far beyond ordinary domestic component failure.

It should therefore not be used as a rhetorical ancestor for every Ovid detail.

Its value is narrower: architecture already has a deep tradition of **designing boundaries specifically to arrest failure propagation**.

## 8.5 Ronan Point and disproportionate collapse

Ronan Point gives another direct building-sector precedent for the same propagation question.

In 1968 a local gas explosion removed load-bearing panels in one flat and triggered progressive collapse of a much larger part of the tower.

The inquiry concluded that the behaviour was inherent in the design rather than faulty workmanship and identified:

- effective tying;
- alternative load paths;

as means of preventing local failure from becoming progressive collapse.

Primary historical record:

- UK Parliament, Hansard, `Ronan Point Flats (Report)`, 6 November 1968: https://api.parliament.uk/historic-hansard/commons/1968/nov/06/ronan-point-flats-report

The contemporary Building Regulations retain the principle in Requirement A3:

> the building must not suffer collapse to an extent disproportionate to the cause.

Source:

- Building Regulations 2010, Schedule 1, A3: https://www.legislation.gov.uk/uksi/2010/2214/schedules/

### Relationship to Ovid

`EARLIER_ANTECEDENT` / direct architectural precedent for local-failure propagation control.

### Significance

Again, Ovid cannot claim to discover the proposition:

> **a local initial failure should not be allowed to propagate disproportionately through the building.**

The project's distinctive question, if any, is the generalisation of this posture beyond structure/fire into ordinary maintenance-scale failure.

---

# 9. Stream E — complexity / coupling counter-traditions

These sources matter primarily because they **limit** a simplistic failure-control doctrine.

## 9.1 Charles Perrow — Normal Accidents

Perrow's central concepts are:

- interactive complexity;
- tight coupling;
- accident sequences that may be difficult to foresee or understand in time;
- limited slack and substitution;
- the possibility that safety devices / redundancy do not eliminate systemic vulnerability.

Later Perrow work argues for reducing vulnerability through decomposition into units connected by monitored links and through designs that may be `inelegant and robust` rather than elegant and sensitive.

Sources:

- Charles Perrow, *Normal Accidents: Living with High-Risk Technologies* (1984; revised 1999).
- `Organizing to Reduce the Vulnerabilities of Complexity`, *Journal of Contingencies and Crisis Management*: https://onlinelibrary.wiley.com/doi/abs/10.1111/1468-5973.00108

### Relationship to Ovid

Current project posture: `EXPLICIT_PROJECT_SOURCE` only as a **bounded transfer / counterpoint**.

### Relevant contribution

Perrow strengthens Ovid's instinct to prefer:

- local autonomy;
- lower coupling;
- visible / comprehensible interactions;
- slack and substitution where proportionate;
- avoidance of safety machinery that itself creates tightly coupled complexity.

### Important limit

Perrow does **not** provide a recipe for domestic failure detailing.

He is most useful as an adversarial warning against the naive equation:

`more safety systems = more safety`.

That is especially important for Ovid because the doctrine could otherwise accrete:

- sensors;
- valves;
- trays;
- interlocks;
- access systems;
- warning devices;

until the maintenance system itself becomes complex and failure-prone.

## 9.2 Richard Cook — complex systems fail through combinations

Richard Cook's `How Complex Systems Fail` is a later systems-safety counterpoint.

It argues that:

- complex systems are heavily defended;
- catastrophe generally requires combinations of failures rather than one simple root cause;
- latent failures coexist with successful operation;
- humans are active defenders and sources of adaptation;
- recovery pathways and early detection matter.

Source:

- Richard I. Cook, `How Complex Systems Fail`: https://how.complexsystems.fail/

### Relationship to Ovid

`COUNTERPOINT` / cross-domain systems source.

No documented formative project contact currently established.

### Why it matters

C07's credible-failure catalogue can become overconfident if it assumes:

- every important failure has one root cause;
- every failure path is isolated;
- every defence behaves independently;
- every abnormal condition will present as the designer predicted.

Cook therefore supplies a useful **epistemic limit** to Ovid's failure sequence.

The sequence is a design discipline, not a proof that every future accident has been anticipated.

## 9.3 Resilience engineering — robustness boundary

As established above, resilience engineering makes a useful distinction between:

- robustness against known / anticipated failure modes;
- adaptation to surprise / unforeseen conditions.

### Relationship to Ovid

`COUNTERPOINT / TERMINOLOGICAL BOUNDARY`.

### Consequence

The later manuscript should avoid unearned claims such as:

- `the house is resilient`;
- `failure is designed out`;
- `all credible faults remain local`;

unless tightly scoped.

Ovid's defensible claim is that it gives **foreseeable / credible failures architectural consequence paths where proportionate**.

---

# 10. Passive first, active second — prior art, not project novelty

The current manuscript prefers physical damage limitation as the base layer, with sensors / automation added where consequence warrants them.

This is sensible but not novel.

Several prior traditions already establish versions of the hierarchy:

- defence-in-depth combines inherent / passive barriers with active safety systems;
- rainscreen / drained-wall construction uses physical geometry and drainage rather than sensors to control ordinary wetting;
- fire compartmentation is passive containment;
- structural robustness relies on physical continuity / alternate paths;
- Norwegian water-safe practice combines physical routing / replaceability / visibility with active shutoff where warranted;
- G3 makes safety discharge physically visible rather than relying only on electronic indication.

### Discovery disposition

`PASSIVE FIRST, ACTIVE SECOND` should be treated as:

- an **inherited engineering / architectural hierarchy**;
- possibly a useful Ovid synthesis across domestic systems;
- **not** an originality claim.

---

# 11. Claim-by-claim overlap with ILA-C07

C07 contains several sub-propositions. Discovery disposition should keep them separate.

## 11.1 `Assume the first defence can fail`

Strong antecedents:

- fail-safe engineering;
- defence-in-depth;
- rainscreen / drained-envelope design;
- fire / structural robustness.

**Not Ovid-original.**

## 11.2 `Keep the first failure local / contain propagation`

Strong antecedents:

- fire compartmentation;
- disproportionate-collapse design;
- fail-safe structural design;
- defence-in-depth / containment;
- Perrow's loose-coupling warning.

**Not Ovid-original.**

## 11.3 `Make abnormal states visible / detectable`

Strong antecedents:

- damage-tolerance inspection;
- FMEA detection controls;
- Norwegian leak-detection requirements;
- UK G3 visible discharge.

**Not Ovid-original.**

## 11.4 `Provide rapid isolation`

Strong antecedents:

- Norwegian accessible / marked stopcock requirement;
- safety-critical isolation practice generally;
- fire / service compartmentation where applicable.

**Not Ovid-original.**

## 11.5 `Make the failure reachable for diagnosis and repair`

Strong antecedents:

- damage-tolerance inspection / maintenance;
- Norwegian maintainability / replaceability requirements;
- maintainability literature, which F05 will own more directly.

**Not Ovid-original.**

## 11.6 `Drain / dry / recover`

Strong antecedents:

- building-envelope moisture design;
- drained / ventilated assemblies;
- wet-service practice.

**Not Ovid-original.**

## 11.7 `Prevent failure from consuming long-lived fabric`

This formulation is where F04 reconnects materially to F01.

Earlier sources clearly seek damage limitation, but Ovid explicitly evaluates failure by whether a fast-system defect silently consumes a slower architectural layer before detection and repair.

Possible relationship:

`SYNTHESIS OF F01 COUPLING + F04 FAILURE CONTROL`.

This is a candidate Ovid delta, not yet a priority claim.

---

# 12. Provisional source relationship table

| Source / tradition | Relevant claim | Provisional relationship | Project contact before ILA | Main significance |
| --- | --- | --- | --- | --- |
| McBrearty / fail-safe airframe design | C07 | EARLIER_ANTECEDENT / cross-domain analogue | no evidence | post-first-failure behaviour designed explicitly |
| damage-tolerance engineering | C07 | EARLIER_ANTECEDENT / cross-domain analogue | no evidence | detect / inspect / repair before catastrophe |
| nuclear defence-in-depth | C07 | EARLIER_ANTECEDENT / cross-domain analogue | no evidence | multiple prevention / containment / active layers |
| FMEA | C07 | CONVERGENT / PARALLEL method | no evidence | enumerate failure modes, effects, prevention/detection controls |
| Hutcheon / NRC wall-performance tradition | C07 | EARLIER_ANTECEDENT | no evidence yet | building as multiple performance defences |
| Garden / rainscreen tradition | C07 | EARLIER_ANTECEDENT | no evidence yet | first line need not be perfect; drain/dry secondary penetration |
| Norwegian water-safe regulation / practice | C07 | EXPLICIT_PROJECT_SOURCE + EARLIER_ANTECEDENT | yes | replacement, leak visibility, damage limitation, isolation |
| UK G3 visible discharge | C07 | EARLIER_ANTECEDENT / regulated precedent | current manuscript family | abnormal condition visibly discharged |
| fire compartmentation | C07 | EARLIER_ANTECEDENT / bounded architectural analogue | conventional | local containment / propagation control |
| Ronan Point / A3 robustness | C07 | EARLIER_ANTECEDENT / direct architectural precedent | no explicit conceptual lineage currently | local damage must not propagate disproportionately |
| Perrow | C07 | EXPLICIT_PROJECT_SOURCE + COUNTERPOINT | yes | tight coupling / complexity; safety-layer limits |
| Cook | C07 | COUNTERPOINT | no evidence | combined / latent failure, no simple root cause |
| resilience engineering / Woods | C07 | COUNTERPOINT / terminology boundary | no evidence | robustness to known failure != adaptation to surprise |

No final importance class is assigned in ILA-01.

---

# 13. What Ovid must not claim to have invented in F04

The later attribution audit must prevent any implication that Ovid's House invented:

- designing for behaviour after the first failure;
- fail-safe design;
- residual capacity after local failure;
- damage tolerance;
- multiple lines of defence;
- passive containment plus active intervention;
- failure-mode enumeration;
- detecting failure before catastrophe;
- local isolation;
- visible abnormal discharge;
- accessible shutoff;
- drainage behind an imperfect outer rain-control layer;
- drying as part of moisture recovery;
- fire compartmentation;
- disproportionate-collapse prevention;
- alternate load paths after local structural damage;
- loose coupling as a safety advantage;
- the fact that added safety machinery can itself create complexity;
- the distinction between robustness to known failures and adaptation to surprise.

The intellectual field is mature and broad.

---

# 14. Residual Ovid-delta hypotheses

Discovery substantially narrows the candidate contribution.

The following are worth carrying into ILA-01C / ILA-02.

## 14.1 Cross-domain domestic architectural synthesis

The strongest hypothesis is not a new failure-control mechanism.

It is the proposition that ordinary house systems can be reviewed using one recurring architectural sequence:

`prevent → limit → reveal → isolate → reach → repair → drain/dry → recover`.

Architecture already contains each move in different domains.

Ovid may contribute by treating the sequence as a **general domestic design object** rather than leaving it fragmented among:

- fire;
- structure;
- plumbing;
- envelope;
- plant;
- roof drainage;
- electrical systems.

This is a synthesis hypothesis only.

## 14.2 Failure consequence measured against slow fabric

F01 established differential lifetimes and destructive coupling.

F04 may add a sharper whole-house test:

> **how much long-lived fabric does this credible fast-system failure consume before it becomes detectable, isolatable and repairable?**

The ingredients are inherited. The integration may be project-specific.

## 14.3 Architecture of the failure path

Ovid's distinctive emphasis may be that the abnormal path itself occupies architectural space:

- overflow location;
- drain route;
- visible outlet;
- containment zone;
- access panel / dry-side route;
- isolation location;
- replacement path;
- drying opening;
- external failure direction.

The claim is not that failure paths are new. It is that they are treated **prospectively as plan/section/interface decisions across the house**.

## 14.4 Complete recovery rather than containment alone

Many safety traditions stop analytically at:

- no catastrophe;
- no spread;
- safe shutdown;
- containment.

Ovid's domestic criterion continues to:

- access;
- repair;
- drying;
- reinstatement;
- return to ordinary occupation.

That extension overlaps heavily with F05 and OCG. ILA-01C must test whether it is genuinely underrepresented in existing maintainability / building-envelope literature before treating it as a delta.

## 14.5 Proportional low-tech failure control

The project may have a distinctive **combination** of:

- passive physical consequence limitation;
- active sensing only where earned;
- low coupling;
- avoidance of maintenance-heavy safety apparatus;
- domestic visual quiet.

Each ingredient is inherited.

The combination may be characteristic, but F02 already owns proportionality and C14/Repose own visual treatment. F04 should not duplicate those deltas.

## 14.6 Verification / rewind machinery

As with F03, the most plausible project contribution may eventually be **enforcement**, not concept invention:

- explicit failure-state review;
- architectural patterns;
- Reference House adverse-state tests;
- evidence state;
- compiler checks where relationships are deterministic;
- rewind when a downstream failure path proves the upstream architecture weak.

ILA-04 must later determine whether that methodological integration is materially distinctive.

---

# 15. Counterpoints retained

## 15.1 More defence is not automatically safer

Perrow and Cook both matter because complex systems can accumulate:

- interacting defences;
- latent failure;
- automation dependence;
- opaque abnormal states.

Ovid should therefore prefer **simple passive consequence paths** where they perform the job, not safety theatre.

## 15.2 Catalogue completeness is impossible

FMEA-like methods are useful for disciplined imagination but cannot prove all future combinations have been enumerated.

C07 should remain scoped to **credible** failure rather than `all failure`.

## 15.3 Containment can hide deterioration

A tray, cavity or barrier that contains a defect but prevents detection/drying can convert a visible local problem into hidden long-term decay.

This is why C07's combination of:

`containment + detectability + access + recovery`

is important.

The individual moves are established; their interaction must be designed.

## 15.4 Redundancy creates maintenance

Every added sensor, valve, overflow, secondary drain or warning device is itself:

- a component;
- a service-life obligation;
- a possible hidden failure;
- an inspection burden.

F02 proportionality therefore constrains F04.

## 15.5 Weak stewardship changes the safety case

High-hazard systems assume professional operation and periodic inspection.

A house may pass through decades of:

- ownership change;
- missing records;
- deferred maintenance;
- ordinary contractors;
- altered systems.

The project must therefore be cautious when importing engineering concepts whose success depends on institutional maintenance.

This may ultimately strengthen the case for **physical visibility and simple passive paths** rather than high-maintenance safeguards.

---

# 16. Sources promoted for ILA-02 consideration

Not every source requires its own dossier.

## Likely MAJOR / shared-dossier candidates

### Garden / Hutcheon / Canadian building-envelope performance tradition

Why:
- direct architectural antecedent;
- early systematic building-science treatment;
- first-line imperfection / controlled rain path / performance-layer logic;
- close overlap with Ovid roof/window/moisture failure architecture.

Likely treatment:
- one shared dossier rather than separate biographies.

### Norwegian water-safe installation tradition

Why:
- extremely close domestic prior art;
- existing project source family;
- combines maintenance, replaceability, leakage detection, damage limitation and isolation;
- likely central to correct attribution of Ovid's water-failure patterns.

Likely treatment:
- source-family dossier spanning regulatory history / pipe-in-pipe guidance, not one famous person.

### Perrow

Why:
- already explicit project source;
- important mainly as boundary / coupling counterpoint;
- prevents failure architecture becoming a redundancy doctrine.

Likely treatment:
- bounded dossier, probably shared with F01 coupling rather than duplicated.

## Strong contextual candidates

### McBrearty / fail-safe engineering

Useful to establish the older cross-domain post-first-failure idea. Probably contextual unless later ILA mapping shows stronger project dependence.

### Defence-in-depth

Contextual. Strong conceptual overlap but high-hazard domain; likely internal only.

### FMEA

Methodological context. Deep dossier unnecessary unless Ovid later adopts explicit failure-ledger machinery derived from it.

### Ronan Point / structural robustness

Direct architectural precedent for propagation control; likely a concise shared record, not a major intellectual dossier.

### UK G3

Specific regulated precedent; evidence/reference apparatus rather than intellectual-history prose.

### Fire compartmentation

Established architectural field; probably no dossier unless needed to clarify the general local-containment proposition.

### Cook / resilience engineering

Counterpoint / boundary. Useful internally; public prominence unlikely unless a claim becomes overbroad.

---

# 17. Leads deliberately not broadened

The following could produce very large literatures but do not currently change F04 decisions.

- high-reliability organisations;
- Swiss-cheese / Reason model;
- STAMP / STPA;
- full fault-tree / event-tree history;
- probabilistic risk assessment;
- reliability-centred maintenance;
- military survivability engineering;
- earthquake performance-based design as a whole;
- blast-resistant design as a whole;
- hospital patient-safety literature;
- cybersecurity defence-in-depth;
- software fault tolerance;
- antifragility;
- generic architectural `resilience` discourse.

These are blocked from discovery unless ILA-01C demonstrates a specific gap they alone can fill.

---

# 18. Discovery-stage Ovid position

The bounded result is deliberately modest.

> **Failure architecture is not a new safety concept. Architecture and engineering have long designed for imperfect first defences, local damage, residual capacity, multiple lines of defence, observable abnormal states, isolation, drainage, drying, compartmentation and disproportionate-propagation control. Ovid's House may nevertheless contain a meaningful synthesis if it consistently treats the full failure-and-recovery path as an architectural object across ordinary domestic systems, judges that path against long-lived fabric, and carries the reasoning through to maintenance geography and verification.**

That is the hypothesis F04 should now attack.

---

# 19. Discovery saturation status

**NOT YET FROZEN.**

The discovery register is bounded enough to stop ordinary source expansion, but ILA-01C must still attack several material questions:

1. Does Garden / building-envelope science already generalise the `first defence fails → controlled consequence → drying/recovery` idea far enough that the cross-system Ovid synthesis is less distinct than it appears?
2. Does Norwegian water-safe practice already contain nearly the full Ovid sequence within one domestic subsystem?
3. Does established maintainability literature already extend containment through repair/recovery, collapsing the candidate `complete recovery` delta?
4. Does fire/structural robustness make local propagation control such generic architectural prior art that it needs no conceptual attribution at all?
5. Does Perrow actually support Ovid's current failure hierarchy, or mainly **oppose** adding tightly coupled safety mechanisms?
6. Should defence-in-depth / FMEA remain internal analogies because direct building precedents make them unnecessary publicly?
7. Can `passive first, active second` survive as anything more than established practice?
8. Is the only material Ovid delta ultimately **cross-domain integration + slow-fabric consequence + complete domestic recovery + enforcement**?

If those tests no longer alter the result, F04 should freeze.

---

# 20. Closeout handoff

`ILA-01B-F04 → baseline a374e5d93d9d3463123b261837acc9530adbfe1c → C07 → five source streams recovered → direct building prior art proves local containment, visibility, replaceability, drainage/drying and disproportionate-propagation control are established → fail-safe / defence-in-depth / FMEA retained only as bounded cross-domain analogues → Perrow / Cook / resilience engineering retained as counterpoints → generic failure-control novelty rejected → residual Ovid hypotheses narrowed to cross-system domestic failure-path synthesis, slow-fabric consequence, complete recovery and project enforcement → no doctrine/manuscript/RH/compiler change → next packet ILA-01C-F04 adversarial saturation / family freeze.`
