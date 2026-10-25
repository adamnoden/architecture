# ILA-01C-F04 — Failure, robustness and recoverability: adversarial saturation / family freeze

**Programme:** [#630 — ILA — intellectual lineage and attribution audit](https://github.com/adamnoden/architecture/issues/630)  
**Packet:** [#667 — ILA-01C-F04 — adversarial saturation and family freeze](https://github.com/adamnoden/architecture/issues/667)  
**Depends on:** ILA-01B-F04 / PR #665 / merge `527ad930356540703787c6490718daef1f7052fd`  
**Baseline `main`:** `527ad930356540703787c6490718daef1f7052fd`  
**Family:** ILA-F04 — Failure, robustness and recoverability  
**Primary claim:** ILA-C07  
**Disposition:** **FROZEN FOR DISCOVERY**  
**Meaning of freeze:** broad source discovery is saturated enough to stop. Final importance classes, project-attribution findings, Ovid-delta judgement and reader-facing treatment remain reserved for ILA-02/03/04.

---

# 1. Decision

F04 is **FROZEN** at discovery stage.

The adversarial pass materially narrows the residual Ovid claim.

ILA-01B had already established that most of the mechanisms inside `Failure Architecture` are established prior art. ILA-01C successfully falsified two remaining tempting novelty stories:

1. **Ovid does not originate `complete recovery` as an extension beyond containment.** Established maintainability and water-damage practice already spans access, replacement, drying, monitoring, repair, reinstatement and return to service.
2. **Ovid does not originate prospective `design for recoverability`.** UK flood-resilient design explicitly accepts that a known hazard may breach the first defence and then configures materials, services, drainage and access so cleaning, drying, repair and reoccupation are faster and less destructive.

The strongest bounded conclusion is therefore:

> **Architecture and engineering already contain mature traditions of fail-safe behaviour, local containment, observable abnormal states, isolation, drainage, drying, repair, replacement and prospective recoverability. Ovid's House inherits those traditions. Its remaining candidate contribution is much narrower: applying consequence-and-recovery reasoning systematically across ordinary domestic failure modes, judging those failures partly by how much slow/permanent fabric they consume before detection and repair, giving the abnormal/recovery path architectural geography, and enforcing that reasoning through the wider project machinery.**

That is enough to stop broad discovery.

F04 should not become a history of safety engineering, resilience theory or disaster-resistant design.

---

# 2. The correct intellectual object

F04 is not best understood as a generic `resilience` family.

The current Ovid proposition is deliberately bounded to **credible failure**:

> **Design credible failures to reveal themselves early, remain safely managed and locally containable where practical, and be reachable for repair before they consume long-lived fabric.**

Its recurring sequence is:

`prevent → limit → reveal → isolate → reach → repair → drain/dry → recover`

The discovery-saturated interpretation is:

- **robustness** for known / credible abnormal conditions;
- not a claim that every future combination has been enumerated;
- not a claim that the house can be made failure-proof;
- not a promise of universal resilience to surprise;
- not a mandate to add redundant safety devices wherever imaginable.

Resilience-engineering literature is most useful here as a **boundary**: robustness against anticipated modes is different from adaptive capacity under unforeseen disturbance.

The word `resilience` should therefore remain tightly controlled in any later reader-facing integration.

---

# 3. What the adversarial pass changed

## 3.1 Maintainability already continues through repair and replacement

The discovery packet left open whether Ovid's sequence became materially distinctive because it continued beyond containment to diagnosis, repair and recovery.

That proposition does not survive intact.

CIBSE maintenance guidance already makes the designer responsible for thinking through installations that can be maintained safely and economically over their service life.

Current CIBSE Guide M describes itself as guidance not only for operators but also for **services designers**, so that installations are capable of satisfactory performance through their full lifespan.

Source:

- CIBSE, *Guide M: Maintenance engineering and management* (2023): https://www.cibse.org/guidem

Earlier Guide M material and associated design-stage guidance explicitly covers:

- maintainability;
- access;
- manufacturers / available alternatives;
- availability of spares and services;
- plant identification;
- access for maintenance / replacement;
- O&M documentation;
- standardisation;
- risk / contingency thinking.

The Institution of Structural Engineers likewise frames maintenance as a design problem and gives direct examples of:

- inspectability;
- access hatches;
- replacement routes;
- routes capable of carrying replacement plant;
- lifting / handling provision;
- life-care information.

Source:

- Institution of Structural Engineers, `Designing for maintenance`: https://www.istructe.org/resources/guidance/designing-for-maintenance/

### Consequence

`reach → diagnose → repair / replace` is not an Ovid innovation.

It is established maintainability practice.

The Ovid question must therefore be narrower:

> **is that maintainability integrated with lifespan coupling, failure propagation and the architectural survival of permanent fabric?**

That remains a candidate synthesis only.

---

## 3.2 Water-damage practice already owns drying, monitoring, repair and reinstatement

The discovery packet also left `drain/dry/recover` as a possible project extension beyond conventional failure containment.

The adversarial pass rejects that broad claim.

British water-damage recovery guidance already treats recovery as a complete process.

BSI PAS 64:2013 concerns mitigation and recovery after water damage and covers the sequence from initial response through drying, monitoring, verification, repair and reinstatement.

Source:

- BSI, PAS 64:2013, *Mitigation and recovery of water damaged buildings*: https://knowledge.bsigroup.com/products/mitigation-and-recovery-of-water-damaged-buildings-code-of-practice

Property Care Association / related industry codes likewise treat drying and recovery as a managed process rather than a final afterthought.

### Consequence

Ovid must not imply novelty for the general proposition that a failure strategy should continue through:

- drying;
- monitoring;
- repair;
- reinstatement;
- return to use.

Those are established recovery disciplines.

The surviving project question concerns **pre-failure architectural arrangement**, not recovery practice itself.

---

## 3.3 Prospective design for recoverability is also established prior art

This was the most important adversarial correction.

It would have been tempting to argue that Ovid differs because it asks architects to design the building **before the event** so that recovery after a known failure is fast and local.

UK flood-resilient design already does exactly this.

Current government guidance distinguishes resistance from **recoverability / resilience**: where water entry cannot or should not be excluded completely, the building can be designed so that damage is limited and cleaning, drying, repair and reoccupation are easier and quicker.

Relevant measures include:

- water-compatible / recoverable materials;
- raised electrical systems and sensitive services;
- routes for drainage;
- access to voids / spaces for cleaning and drying;
- forms of construction chosen to reduce the recovery burden.

Sources include:

- GOV.UK, flood-resilient construction and recovery guidance;
- Historic England guidance on flood resilience and recovery for buildings;
- UK guidance derived from *Improving the Flood Performance of New Buildings* (2007) and subsequent updates.

### Consequence

The broad proposition:

> **design a building in advance so that a known failure/hazard can occur with less damage and faster recovery**

is established architectural prior art.

Ovid does not originate `design for recoverability`.

The remaining difference is the **scope of application**: Ovid applies similar reasoning to ordinary, repeated domestic failures that are often treated as mere maintenance incidents rather than as architectural design states.

---

# 4. Frozen F04 topology

F04 is frozen as five interacting streams.

## Stream A — fail-safe / damage-tolerant engineering

### Core proposition

A credible first failure need not immediately become catastrophic if residual behaviour, detection and intervention are designed deliberately.

### Representative antecedent

J. F. McBrearty, `Fatigue and Fail-Safe Airframe Design` (1956), distinguishes safe-life from fail-safe design and treats post-failure behaviour as part of safety design.

Source:

- https://saemobilus.sae.org/papers/fatigue-fail-safe-airframe-design-560039

### F04 role

`EARLIER_ANTECEDENT / CROSS-DOMAIN ANALOGUE`.

This stream closes novelty for the basic question:

> **what happens after the first defence fails?**

It is not a domestic architecture recipe.

High-control aviation maintenance regimes are importantly unlike weak domestic stewardship.

---

## Stream B — defence-in-depth / explicit failure analysis

### Defence in depth

Nuclear safety provides a mature tradition of multiple independent / redundant safety layers so that no one defence is relied on exclusively.

NRC historical and glossary sources:

- https://www.nrc.gov/education-regulatory-research/history-101/defense-in-depth---a-war-for-safety
- https://www.nrc.gov/education-regulatory-research/glossary/defense-in-depth

### FMEA

Failure Modes and Effects Analysis formalises the discipline of asking:

- what can fail;
- what the effect will be;
- what causes the failure;
- what prevents it;
- what detects it;
- what action is required.

Its formal lineage reaches at least to US military procedure MIL-P-1629 (1949), with later aerospace and industrial adoption.

### F04 role

These are `CONTEXTUAL / CROSS-DOMAIN` sources.

They explain why the Ovid question is methodologically sensible, but direct building precedents now make them unnecessary as public intellectual foundations.

### Freeze consequence

Do **not** build a reader-facing F04 genealogy around nuclear safety or FMEA.

They should remain internal unless a later dossier demonstrates a real direct project inheritance.

---

## Stream C — building-envelope controlled-failure design

### Hutcheon / Garden / Canadian building science

The Canadian Building Digests of the early 1960s provide direct architectural prior art for thinking in terms of multiple environmental defences and controlled failure paths.

N. B. Hutcheon:

- `Requirements for Exterior Walls`, CBD-48, 1963.

G. K. Garden:

- `Rain Penetration and its Control`, CBD-40, 1963.

NRC archive:

- https://nrc-publications.canada.ca/

The important proposition is not simply the technical history of the rainscreen.

It is:

> **the outermost line need not be imagined as permanently perfect; incidental penetration can be anticipated and given a controlled path for drainage and drying.**

### F04 role

`EARLIER_ANTECEDENT` — direct architectural lineage.

### Freeze consequence

Ovid cannot claim novelty for:

- admitting first-line imperfection;
- secondary water-control layers;
- drainage behind cladding;
- drying capacity;
- passive moisture-failure limitation.

This direct building lineage should outrank glamorous safety-engineering analogies wherever the claim concerns envelope moisture.

---

## Stream D — building-specific containment, visibility and recoverability

This stream contains the closest prior art to C07.

### Norwegian water-safe installation

Current TEK17 §15-5 requires internal water installations to be arranged so that:

- future maintenance is possible;
- installations are readily replaceable;
- leakage is easily detected;
- leakage does not damage installations / building elements;
- isolation is accessible and identifiable.

Primary legal source:

- https://lovdata.no/dokument/SF/forskrift/2017-06-19-840/KAPITTEL_13-6

Norwegian pipe-in-pipe / drained-cabinet practice operationalises the same proposition physically.

`EXPLICIT_PROJECT_SOURCE + EARLIER_ANTECEDENT`.

This one subsystem already contains much of the Ovid sequence:

`replaceable → visible leakage → damage limitation → isolation → access`.

### UK hot-water visible discharge

Building Regulation G3 requires safety-device discharge to be safely conveyed to a place where it is visible and does not endanger people.

Primary legislation:

- https://www.legislation.gov.uk/uksi/2010/2214/schedules/

Approved Document G:

- https://www.gov.uk/government/publications/sanitation-hot-water-safety-and-water-efficiency-approved-document-g

`EARLIER_ANTECEDENT / REGULATED PRECEDENT`.

This closes novelty for the principle that an abnormal state should become observable rather than accumulate invisibly.

### Fire compartmentation

Compartmentation gives architecture a longstanding direct model of:

> **local failure must not be given an uncontrolled path to become whole-building failure.**

Approved Document B:

- https://www.gov.uk/government/publications/fire-safety-approved-document-b

`EARLIER_ANTECEDENT / BOUNDED ARCHITECTURAL ANALOGUE`.

### Ronan Point / structural robustness

The 1968 Ronan Point collapse demonstrated how a local event could propagate through a structurally coupled system.

The inquiry and later robustness provisions emphasised tying, alternate load paths and the requirement that local damage should not produce disproportionate collapse.

Historical parliamentary record:

- https://api.parliament.uk/historic-hansard/commons/1968/nov/06/ronan-point-flats-report

Current Building Regulation A3:

- https://www.legislation.gov.uk/uksi/2010/2214/schedules/

`EARLIER_ANTECEDENT / DIRECT ARCHITECTURAL PRECEDENT`.

### Flood-resilient / recoverable design

UK flood-resilient construction makes prospective recoverability explicit.

The relevant architectural idea is:

- known hazard may breach the first line;
- use recoverable materials / assemblies;
- locate vulnerable systems strategically;
- provide drainage;
- make spaces accessible for cleaning / drying;
- reduce the repair / reoccupation burden.

`EARLIER_ANTECEDENT` to prospective architecture-for-recovery.

### Freeze consequence

This stream closes broad Ovid novelty for:

- local consequence containment;
- visibility;
- isolation;
- maintenance / replacement;
- disproportionate-propagation control;
- prospective recoverability.

---

## Stream E — complexity / coupling / resilience counter-traditions

### Charles Perrow

Perrow's value is not as an origin of building failure detailing.

He matters because interactive complexity and tight coupling can make accidents propagate in ways not obvious from the nominal component list, and because additional safety devices can themselves create interactions and false confidence.

Current project relation:

`EXPLICIT_PROJECT_SOURCE + COUNTERPOINT`.

Ovid should retain Perrow as a brake on safety-system accretion, not as prestige genealogy.

### Richard Cook

`How Complex Systems Fail` emphasises:

- heavily defended systems can still fail;
- catastrophe often arises from combinations rather than one root cause;
- latent failures coexist with successful operation;
- human adaptation / recovery pathways matter.

Source:

- https://how.complexsystems.fail/

`COUNTERPOINT`.

### Resilience engineering

Useful principally for the robustness boundary:

- anticipated failure modes → robustness;
- unforeseen disturbance / surprise → resilience / adaptive capacity.

`COUNTERPOINT / TERMINOLOGICAL BOUNDARY`.

### Freeze consequence

Ovid's failure catalogue is a **design discipline**, not proof of completeness.

---

# 5. Adversarial tests resolved

## Test A — does building science already generalise `first defence fails → controlled consequence → recovery`?

**YES, within important domains.**

Envelope science, flood-resilient design and water-safe services all do this directly.

### Effect on Ovid delta

The general mechanism is inherited.

Only cross-domain whole-house integration remains a hypothesis.

---

## Test B — is Norwegian water-safe practice nearly a complete domestic antecedent?

**YES, for one major subsystem.**

It combines:

- maintainability;
- replacement;
- leak visibility;
- damage limitation;
- isolation;
- practical access.

### Effect on Ovid delta

Ovid cannot claim the sequence itself as original.

Its possible contribution is using equivalent reasoning consistently across **many domestic systems**, not just water.

---

## Test C — does maintainability literature collapse `complete recovery`?

**LARGELY YES.**

CIBSE / structural-maintenance guidance owns access, inspection, repair and replacement.

Water-damage recovery owns drying, monitoring, repair and reinstatement.

Flood resilience owns prospective recovery design.

### Effect on Ovid delta

`Complete recovery` as a concept is rejected as project-original.

The narrower surviving hypothesis is:

> **pre-arrange ordinary domestic architecture so that frequent foreseeable failures can be recovered from locally without consuming slower fabric.**

---

## Test D — is local propagation control already generic architectural prior art?

**YES.**

Fire compartmentation and structural robustness make this unmistakable.

### Effect on public attribution

The final manuscript probably does **not** need a long intellectual history to justify `local containment`.

It is conventional architectural safety logic being deliberately generalised.

---

## Test E — is `passive first, active second` original?

**NO.**

Direct antecedents include:

- drained envelope geometry;
- passive fire compartmentation;
- structural robustness;
- flood-resistant / recoverable form and materials;
- physical water leakage routes plus active shutoff / alarm where proportionate;
- defence-in-depth's longstanding passive / active layering.

### Freeze consequence

Treat `passive first, active second` as an inherited hierarchy / project preference, not priority.

---

## Test F — do Perrow / Cook support the hierarchy, or mainly challenge it?

**BOTH, but their most valuable role is adversarial.**

They support:

- lower coupling;
- local autonomy;
- early detection;
- recovery pathways.

They challenge:

- excessive protective machinery;
- belief that every failure path has been enumerated;
- one-root-cause thinking;
- tightly integrated safety systems.

### Freeze consequence

Keep them as counterpoints and scope controls.

---

## Test G — do FMEA / defence-in-depth add necessary public architectural lineage once direct building sources are admitted?

**NO.**

They remain useful internal conceptual parallels.

The direct building sources are closer, safer and more architecturally honest.

---

# 6. Claim-by-claim frozen disposition for C07

## `Assume the first defence can fail`

Prior art:
- fail-safe engineering;
- defence-in-depth;
- rainscreen / drained-envelope construction;
- flood recoverability.

Disposition:
**INHERITED / NOT ORIGINAL.**

## `Limit the first consequence`

Prior art:
- compartmentation;
- robust structure;
- drained envelope;
- water-safe service arrangements;
- flood-resilient materials / service location.

Disposition:
**INHERITED / NOT ORIGINAL.**

## `Make abnormal conditions visible`

Prior art:
- damage-tolerance inspection;
- FMEA detection controls;
- Norwegian leakage visibility;
- G3 visible safety discharge.

Disposition:
**INHERITED / NOT ORIGINAL.**

## `Provide isolation`

Prior art:
- ordinary service isolation;
- Norwegian accessible stopcock requirement;
- fire / system compartmentation analogues.

Disposition:
**INHERITED / NOT ORIGINAL.**

## `Provide access for diagnosis / repair / replacement`

Prior art:
- maintainability guidance;
- CIBSE;
- structural maintenance design;
- Norwegian water rules.

Disposition:
**INHERITED / NOT ORIGINAL.**

## `Drain / dry / reinstate / recover`

Prior art:
- building-envelope moisture design;
- water-damage recovery;
- flood-resilient recoverability design.

Disposition:
**INHERITED / NOT ORIGINAL.**

## `Prevent the fast-system failure from consuming long-lived fabric`

Prior art:
- generic damage limitation is established;
- F01 already establishes destructive coupling between short-/long-life layers.

Disposition:
**CANDIDATE CROSS-FAMILY SYNTHESIS**, not originality.

The narrower Ovid formulation may matter because it explicitly joins the F01 lifecycle test to F04 failure consequences.

## `Treat the abnormal/recovery path as architecture`

Prior art:
- domain-specific architecture already does this for fire, water, envelope and flood.

Disposition:
**CANDIDATE WHOLE-HOUSE GENERALISATION / SYNTHESIS**.

---

# 7. What Ovid must not claim to have invented in F04

The later attribution audit must prevent any implication that Ovid's House invented:

- fail-safe design;
- post-first-failure design;
- residual capacity;
- damage tolerance;
- inspection before catastrophic propagation;
- defence in depth;
- multiple lines of defence;
- systematic failure-mode analysis;
- passive consequence containment;
- active warning / shutdown added to passive safety;
- leak visibility;
- visible safety discharge;
- local isolation;
- maintainability / replacement access;
- drainage behind an imperfect outer weather layer;
- drying after wetting;
- repair and reinstatement as part of recovery;
- prospective flood recoverability;
- fire compartmentation;
- prevention of disproportionate structural collapse;
- alternate load paths;
- low coupling as a safety advantage;
- the possibility that added safety machinery creates new complexity;
- robustness against known failures;
- the distinction between robustness and resilience to surprise.

This is not a weak result. It tells the project exactly where not to waste credibility.

---

# 8. Residual Ovid-delta hypotheses after saturation

Only four hypotheses remain worth carrying forward.

## 8.1 Whole-house generalisation to ordinary domestic failures

The strongest candidate delta is scale and integration rather than mechanism.

Architecture already applies failure/recovery logic to major specialist domains:

- fire;
- structure;
- flood;
- envelope moisture;
- hot-water safety;
- water services.

Ovid may differ in treating the same questions as routine **whole-house architectural review** for mundane failures such as:

- leaking valve;
- failed pipe branch;
- blocked roof outlet;
- failed glazing seal;
- condensate problem;
- pump / fan failure;
- damaged shower waste;
- service component replacement.

The proposition is:

> **ordinary failure modes deserve designed architectural consequence paths too.**

This is a synthesis hypothesis, not a priority claim.

## 8.2 Slow-fabric consequence test

The most characteristically Ovid formulation may be the link between F01 and F04:

> **For a credible failure of a fast system, how much slower / permanent fabric is consumed before the failure becomes visible, isolated and repairable?**

This combines:

- differential lifetimes / coupling;
- failure propagation;
- maintenance access;
- recoverability.

Each ingredient is prior art.

The integrated test may still be project-specific enough to deserve a clear Ovid-delta statement later.

## 8.3 Failure / recovery path as architectural geography

Ovid may distinguish itself by requiring the abnormal path to be represented prospectively through:

- plan;
- section;
- service topology;
- interface detail;
- outward overflow direction;
- visible outlet;
- dry-side access;
- isolation geography;
- withdrawal / replacement route;
- drainage / drying opening;
- occupied-change consequence envelope.

Again, flood/fire/water traditions already do this in their own domains.

The possible project contribution is **cross-system consistency**.

## 8.4 Verification and rewind

The most defensible distinctive contribution may be procedural:

- every important strategy asks what happens in abnormal state;
- Reference House exercises the path;
- evidence state remains explicit;
- modelable conditions may become compiler checks;
- downstream failure can force an upstream architectural rewind.

ILA-04 will need to decide whether this is materially original or simply unusually disciplined implementation of established practice.

---

# 9. Counterpoints retained

## Safety-layer accretion

More valves, sensors, drains, alarms and barriers are not automatically better.

Every safety component creates:

- its own service life;
- inspection burden;
- false-positive / false-negative modes;
- dependencies;
- failure modes.

Perrow and Cook remain useful constraints.

## Hidden containment

Containment without observation can worsen long-term damage.

A tray or cavity that catches leakage but hides it and prevents drying may merely delay discovery.

Therefore C07's important inherited combination is:

`limit + reveal + access + recover`

rather than containment alone.

## False catalogue completeness

No finite failure register proves that future combinations are exhausted.

C07 should remain tied to **credible / foreseeable failure** and explicit uncertainty.

## High-hazard domain transfer

A nuclear plant or aircraft has institutional inspection and trained operators.

A house does not.

F04 must therefore avoid importing safety systems whose success depends on governance that domestic buildings cannot sustain.

## Recovery provisions can become burdens

Flood-resilient examples often justify significant measures because the hazard consequence is high.

Ovid must still apply F02 proportionality before giving low-probability domestic failure permanent space or machinery.

---

# 10. Dossier candidates after freeze

## Likely MAJOR / shared dossiers

### Garden / Hutcheon / Canadian building-envelope performance tradition

Why:
- direct architectural lineage;
- close to the actual failure-path mechanism;
- important to moisture / envelope / drainage logic;
- useful antidote to cross-domain citation theatre.

Prefer one shared source-family dossier rather than separate great-man histories.

### Norwegian water-safe installation tradition

Why:
- exceptionally close domestic prior art;
- already an explicit project source family;
- combines access, replacement, visibility, damage limitation and isolation;
- likely central to correct attribution of several existing water patterns.

Treat as a regulatory / practice tradition, not a single-author story.

### Perrow — shared F01/F04 dossier

Why:
- explicit current project source;
- materially relevant to coupling and protection-system complexity;
- important mainly as a bounded counterpoint.

Do not duplicate the dossier between families.

## Contextual / internal-only candidates

- McBrearty / fail-safe engineering;
- defence-in-depth history;
- FMEA;
- G3 visible discharge;
- fire compartmentation;
- Ronan Point / A3 robustness;
- flood recoverability guidance;
- CIBSE maintainability;
- Cook / resilience engineering.

These may support the matrix without each earning a standalone reader-facing note.

---

# 11. Leads now blocked from further discovery

Unless later ILA mapping exposes a specific gap, do not reopen F04 merely to research:

- Swiss-cheese models;
- high-reliability organisations;
- STAMP / STPA;
- fault-tree / event-tree histories;
- probabilistic risk assessment;
- reliability-centred maintenance;
- aviation safety as a whole;
- nuclear safety as a whole;
- earthquake engineering as a whole;
- blast engineering;
- cybersecurity defence-in-depth;
- software fault tolerance;
- antifragility;
- generic architectural resilience literature.

These would now increase bibliography without changing an architectural decision.

---

# 12. Saturation test

## Earliest/material antecedent understanding

Stable enough to stop.

F04 no longer depends on finding the earliest person who said `fail-safe`; direct building-source families are more material to Ovid.

## Relationship classification

Stable:

- direct building traditions = antecedent / evidence;
- fail-safe / defence-in-depth / FMEA = contextual cross-domain analogues;
- Perrow / Cook / resilience engineering = counterpoints / boundaries;
- Norwegian water tradition = explicit project source + antecedent.

## Important counterpoint set

Stable:

- protective-system complexity;
- false catalogue completeness;
- hidden containment;
- institutional-maintenance dependence;
- disproportional permanent burden.

## Ovid-delta hypothesis

Narrowed materially by adversarial work.

No broad failure/recovery novelty remains.

The only surviving hypotheses are:

- cross-system domestic generalisation;
- slow-fabric consequence;
- failure/recovery geography;
- verification / rewind machinery.

## Likely reader-facing disposition

Not yet authorised, but stable enough to stop discovery:

- no safety-engineering history chapter;
- probably no need to name every conventional building precedent;
- strong internal attribution around Norwegian water practice and building-envelope science;
- Perrow kept tightly bounded if retained;
- public prose should present `Failure Architecture` as a project synthesis / organising discipline, not a novel safety theory.

**F04 satisfies decision saturation.**

---

# 13. Handoff to later ILA stages

ILA-02 should deepen only promoted sources where primary context matters.

ILA-03 should keep the source streams branching rather than drawing a linear genealogy.

ILA-04 should test the current manuscript especially for two risks:

1. whether the heading / confident prose `Failure Architecture` accidentally implies invention of mechanisms that are thoroughly established; and
2. whether the true project delta — whole-house domestic synthesis + slow-fabric consequence + verification — is currently stated clearly enough.

No manuscript change is authorised here.

---

# 14. Closeout

`ILA-01C-F04 → baseline 527ad930356540703787c6490718daef1f7052fd → C07 → adversarial pass proves maintainability already owns access/repair/replacement, water-damage practice owns drying/repair/reinstatement, and flood-resilient architecture explicitly owns prospective recoverability → direct building traditions outrank safety-engineering analogies → broad novelty for fail-safe / containment / visibility / isolation / repair / drying / recoverability rejected → residual Ovid delta narrowed to whole-house ordinary-failure generalisation, slow-fabric consequence, failure/recovery geography and verification/rewind → FROZEN FOR DISCOVERY → no doctrine/manuscript/RH/compiler change → exact next family: ILA-F05 — Maintenance, services and stewardship geography.`
