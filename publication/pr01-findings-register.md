# PR-01 — Adversarial Findings Register

**Status:** R0 REVIEW MAP — diagnostic register open  
**Frozen candidate content:** `f6b286e883f24b322f41f85d8d3ad796b103a53d`  
**Freeze control:** `publication/pr00h-candidate-book-freeze.md`  
**Review programme:** `publication/pr01-adversarial-review-programme.md`

This register belongs to the attack phase. It does **not** modify the frozen candidate.

A review surface is not a finding. Findings are created only when a criticism can be stated specifically enough to identify an affected claim, an owning layer and a plausible consequence.

## Finding schema

Each finding must use:

| Field | Meaning |
|---|---|
| ID | Stable `PR01-F###` identity. Never reuse an ID. |
| Dimension | `WRONG / WEAK / DERIVATIVE / NAIVE / OVERSTATED / INCOMPLETE / INCONSISTENT / UNMEMORABLE`. |
| Severity | `S0 / S1 / S2 / S3 / NOTE`. |
| Surface | Review-surface ID below. |
| Claim under attack | The exact proposition being challenged, not merely a chapter name. |
| Strongest fair criticism | Steelmanned criticism stated without rebuttal. |
| Why it matters | Consequence for architectural credibility if sustained. |
| Evidence / counterexample | Source, precedent, internal contradiction or practical constraint supporting the criticism. |
| Owner | Doctrine / principle / pattern / strategy / grammar / Reference House / evidence / publication / computational / other. |
| Class | `PUBLICATION DEFECT / QUALIFICATION / MATERIAL ARCHITECTURAL FINDING / EVIDENCE FINDING / OUTSIDE REVIEW SCOPE`. |
| Provisional consequence | Delete / narrow / evidence / reframe / reopen / no change, pending triage. |
| Disposition | `OPEN / SUSTAINED / PARTLY SUSTAINED / REJECTED / OUTSIDE SCOPE`. |
| Closure | Correction/re-freeze reference or rejection rationale. |

## Active findings

No findings are preloaded. R0 deliberately prevents the review programme from manufacturing criticism to fill a template.

| ID | Dimension | Severity | Surface | Claim under attack | Strongest fair criticism | Why it matters | Evidence / counterexample | Owner | Class | Provisional consequence | Disposition | Closure |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

---

# Review map

## FM — Front matter / framing

### FM-01 — Preface: *The Obvious, Eventually*

Attack questions:

- Does the outsider/first-principles posture earn attention or risk presenting rediscovery as exceptional insight?
- Does “respect convention, scrutinise novelty” remain balanced in the actual book or become a rhetorical licence for preferred traditional forms?
- Does the Ovidian frame illuminate the architectural thesis or merely give it literary glamour?
- Is the voice restrained enough that authorial temperament never substitutes for evidence?

### FM-02 — Reader’s Guide / evidence constitution

Attack questions:

- Are doctrine, pattern, strategy, held candidate, grammar, Reference House and evidence maturity genuinely intelligible to a first reader?
- Does the quantity of epistemic qualification improve trust or make the project appear self-protective?
- Can a reader distinguish “internally controlled” from physical/professional validation without learning the repository’s internal ontology?

---

# Part I — The Proposition

## P1-01 — The house after completion

Core claim surface: practical completion should be treated as the beginning of a building’s long period of change rather than the end of design attention.

Attack questions:

- Is this substantively distinctive or already ordinary lifecycle / facilities / adaptability thinking?
- Does the chapter imply that conventional architecture ignores post-completion life more than current practice actually does?

## P1-02 — Buildings change at different speeds

Core claim surface: differently lived service-life layers should not be unnecessarily coupled.

Attack questions:

- What is genuinely added beyond Habraken, Duffy, Brand, service-life planning and design-for-adaptability literature?
- Does the argument overread theoretical layer separation into a practical rule about physical separability?
- When is coupling beneficial rather than debt?

## P1-03 — Selective permanence

Core claim surface: permanence should be deliberately assigned; what must change should be allowed to change without damaging what should endure.

Attack questions:

- Is “selective permanence” precise enough to guide decisions or only an attractive restatement of durable/adaptable design?
- Does the doctrine contain a robust test for choosing permanence, or can any preferred design be rationalised after the fact?
- Does permanence without stasis survive competing carbon/material arguments?

## P1-04 — The architectural platform

Core claim surface: enduring fabric, changeable systems and designed interfaces form a useful architectural platform model.

Attack questions:

- Is “platform” an illuminating architectural abstraction or imported software/product language?
- Does the model privilege maintainability at the expense of spatial, cultural, environmental or material integration?
- Where does the platform analogy break?

## P1-05 — Eleven governing principles

Review each principle independently and as a set.

Primary attack surfaces:

1. service exclusion from permanent fabric;
2. selective permanence / lifespan separation;
3. designed interfaces;
4. accessible-not-exposed serviceability;
5. failure architecture;
6. maintenance geography;
7. workmanship robustness / tolerance absorption;
8. repose;
9. passive-first environmental hierarchy;
10. legibility / stewardship;
11. proportionality / whole-life burden.

Cross-principle attack:

- Are any principles duplicates at different rhetorical scales?
- Which pair comes into the sharpest real conflict?
- Which principle would a competent architect remove with least loss to the thesis?

## P1-06 — Repose

Core claim surface: domestic architecture should reduce unnecessary vigilance through coherence, controllability, retreat, physical comfort and perceptual settlement.

Attack questions:

- Is repose a useful architectural criterion or a soft umbrella for conventional domestic preferences?
- Are perceptual structural legibility claims adequately separated from neuroscience / intuitive-physics speculation?
- Does the criterion unfairly pathologise drama, ambiguity or visually expressive structure?
- Is the term actionable enough to survive disagreement in taste?

---

# Part II — Architecture of the Platform

## P2-01 — Designed interface

Core claim surface: support, restraint, movement, sealing, finish and replacement should be consciously decomposed where their functions conflict.

Attack questions:

- Is this distinct from competent detailing and movement-joint design?
- Does decomposition create more interfaces, tolerances, fixings and failure opportunities than it removes?
- Is “brass marks where the building comes apart” architecturally useful or a project dialect being over-romanticised?

## P2-02 — Failure architecture

Core claim surface: design should address both prevention and the harmless path/consequence of credible failure.

Attack questions:

- Is this new architectural territory or safe-to-fail / robustness / drainage good practice?
- Can designing for visible/harmless failure encourage unnecessary redundancy and material use?
- Which failures are rational to accommodate architecturally versus manage through product reliability / maintenance?

## P2-03 — Maintenance geography

Core claim surface: maintenance is spatial and requires approach, working, withdrawal and reinstatement geometry inside and outside the building.

Attack questions:

- Is this architecture or access/FM planning renamed?
- Does maintaining future work zones materially compromise present-day space efficiency?
- How does the proposition scale to terraces, flats, constrained urban plots and ordinary budgets?
- Is the external-maintenance envelope credible once boundaries, neighbours and mature landscape become real?

## P2-04 — Environmental resilience without dependence

Core claim surface: passive-first environmental design and intelligible local control should reduce brittle dependence on active systems.

Attack questions:

- Is “passive-first” too generic to be a distinctive part of Ovid’s House?
- Can manual fallback / local control undermine measured, efficient system operation?
- Are climate-resilience claims underdeveloped without site-specific modelling?

## P2-05 — Boundaries

Core claim surface: access/disassembly creates boundary debt that must be explicitly restored across fire, acoustic, air, water, thermal and other systems.

Attack questions:

- Does this acknowledgment reveal an inherent disadvantage large enough to challenge the replaceability agenda?
- Are proposed separations credible without proprietary or specialist sealing systems?
- Does repeated access realistically preserve boundary performance over decades?

## P2-06 — Replaceable interior

Core claim surface: faster-changing interior layers should use controlled attachment and selective reversibility where proportionate.

Attack questions:

- Does replaceability produce hollow, temporary, joint-heavy or lower-quality rooms?
- Is the doctrine biased toward dry assembly and away from materially integrated craft with long service lives?
- When is destructive renewal actually rational?

## P2-07 — Legibility and stewardship

Core claim surface: physical indexing, records and change control support long-term stewardship.

Attack questions:

- What survives ownership changes, lost records and indifferent occupiers?
- Does the architecture remain maintainable if the building passport is ignored?
- Is legibility for maintainers compatible with visual calm for occupants?

---

# Part III — Pattern Language

## P3-00 — Pattern-language legitimacy

Core claim surface: the 21 active patterns form a reusable architectural language rather than a checklist/catalogue.

Attack questions:

- Is there enough generative relation and morphology independence to justify “pattern language”?
- Are pattern IDs useful stability or unnecessary systems-engineering theatre?
- Does the language overrepresent services and maintenance relative to other architectural concerns?

## P3-A — Service geography patterns

Surfaces:

- PAT-001 Controlled Utility Entry;
- PAT-002 Plant Room as Service Hub;
- PAT-014 Accessible Vertical Service Zone;
- PAT-003 Coherent Horizontal Service Route;
- PAT-015 Accessible Room Service Route;
- PAT-004 High-Service-Room Service Wall;
- PAT-005 Designed Structural Penetration;
- PAT-016 Compartmented Service Void.

Attack questions:

- Which are genuinely architectural patterns rather than MEP coordination/specification advice?
- Are any redundant with a more general service-topology pattern?
- Do their invariants survive small houses, flats, terraces and retrofit?

## P3-B — Water / failure patterns

Surfaces:

- PAT-017 Visible Leakage Path;
- PAT-018 Failure-Tolerant Wet Service Room;
- PAT-009 Accessible Rainwater Route.

Attack questions:

- Are these proportionate to actual domestic failure probabilities?
- Does visible leakage conflict with acoustic/fire/thermal/finish requirements?
- Does failure tolerance displace rather than reduce risk?

## P3-C — Openings / movement / attachment patterns

Surfaces:

- PAT-007 Permanent Opening / Replaceable Window;
- PAT-019 Permanent Opening / Replaceable Door;
- PAT-020 Designed Threshold;
- PAT-008 Movement / Slip Junction;
- PAT-022 Controlled Attachment Plane.

Attack questions:

- Are these patterns or normal detail-design principles?
- Does preserving a permanent opening meaningfully improve whole-life outcomes once façade renewal and evolving performance requirements are considered?
- Is controlled attachment compatible with ordinary finishes and workmanship?

## P3-D — Environmental / maintenance patterns

Surfaces:

- PAT-010 Source-Capture Kitchen Extract;
- PAT-021 Source-Capture Bathroom Extract;
- PAT-011 Roof Maintenance Route;
- PAT-013 Ground-Supported Façade Access.

Attack questions:

- Are source-capture extract patterns too obvious / regulatory / services-specific to deserve pattern status?
- Does permanent roof/façade access provision earn its spatial and architectural cost in low-rise houses?

## P3-E — Stewardship

Surface: PAT-012 Physical Service Index.

Attack questions:

- Is physical indexing robust to later undocumented changes?
- Is it still useful when digital/building records are available?

## P3-S — Strategies

Surfaces:

- Fail-Safe Water Distribution;
- Decompose Structural Interface Functions;
- Separate Structural Floor from Changeable Layers Where Proportionate.

Attack questions:

- Do these occupy a coherent conceptual layer?
- Why are they not principles, patterns or ordinary design heuristics?

## P3-H — Held candidates

Surfaces:

- Replaceable Architectural Lining;
- Individually Isolatable Manifold Distribution;
- Local Deep Service Zone;
- Selective Floor Access.

Attack questions:

- Is each genuinely held because evidence is unresolved, or because it is attractive but currently disproportionate?
- Would deleting rather than holding any candidate make the research programme clearer?

---

# Part IV — Reference House

## P4-01 — Site and type

Core claim surface: a compact detached courtyard house is a useful worked integration vehicle.

Attack questions:

- Does the courtyard morphology conveniently make the doctrine easier by increasing perimeter/access opportunities?
- Is there enough site reality for maintenance/environmental claims to mean anything?
- Does detached-house privilege undermine broader relevance?

## P4-02 — Architectural order / repose / tectonics

Core claim surface: G-01, courtyard morphology, repose and project tectonic language can coexist without contaminating general doctrine.

Attack questions:

- Has Georgian/classical preference leaked upstream despite formal disclaimers?
- Does G-01 conformance produce architectural quality or merely rule compliance?
- Would the thesis be equally persuasive through a materially different grammar?

## P4-03 — Material / structure / assembly

Core claim surface: the current pre-engineering family demonstrates architectural coordination without claiming adequacy.

Attack questions:

- Are unresolved structural / junction questions too central for the architectural integration to count as meaningful?
- Does “ordinary workmanship” survive bespoke interfaces and tolerance systems?
- Does dense/permanent fabric plus replaceable interiors create an unacknowledged material premium?

## P4-04 — Maintenance geography

Core claim surface: the house spatially reserves credible routes and working conditions for future interventions.

Attack questions:

- Are routes credible after landscape, furniture, ownership boundaries and real access equipment are introduced?
- Is too much present-day architecture being spent on hypothetical future work?

## P4-05 — Water / environmental systems

Core claim surface: outward drainage, passive-first hierarchy and selected service families demonstrate coherent failure geography at current scope.

Attack questions:

- Are risks reduced or merely relocated?
- Are environmental claims meaningful absent a commissioned site and specialist models?

## P4-06 — Future maintenance scenarios

Core claim surface: representative scenarios can expose where work stops and where architectural rewind is required.

Attack questions:

- Are scenarios selected because the house handles them well?
- Which credible high-consequence intervention would be most awkward?
- Are replacement assumptions realistic for whole components, access equipment and occupied rooms?

---

# Part V — Making and Testing

## P5-01 — Whole-life value / proportionality

Attack questions:

- Is the `frequency × consequence × retrofit difficulty` heuristic sufficient to discipline the project’s own tendency toward infrastructure?
- Where are cost/carbon/material calculations needed before claims become credible?

## P5-02 — Governance / interface ownership

Attack questions:

- Can fragmented UK appointments realistically sustain the proposed interface ownership?
- Does the model create unusual professional liability / coordination burden?

## P5-03 — Standardisation / manufacture

Attack questions:

- Does remanufacturability conflict with commodity availability and future standards?
- Is off-site precision being overvalued relative to adaptable site craft?

## P5-04 — Prototype / disassembly

Attack questions:

- Are the proposed prototype tests sufficient to validate acoustic, tactile, fire, moisture and ageing performance?
- Which claims must remain unmade until actual prototypes exist?

## P5-05 — Procurement

Attack questions:

- Can “equivalent” substitution control survive ordinary value engineering and contractor procurement?
- Does preventing dilution require a level of bespoke specification/site oversight that conflicts with workmanship robustness?

## P5-06 — Maintainability commissioning

Attack questions:

- Is commissioning intervention realistic in domestic procurement?
- Who pays for and owns repeated intervention tests?

## P5-07 — Failure/change/occupation scenarios

Attack questions:

- Does “rewind before workaround” have operational teeth or remain a good intention once design cost/schedule is committed?
- Are repose/occupation scenarios rigorous enough to produce design decisions rather than subjective discussion?

---

# Back matter / evidence constitution

## BM-01 — Evidence and precedent notes

Attack questions:

- Does the evidence taxonomy genuinely constrain claims or merely explain why stronger evidence is absent?
- Are citations/readings sufficiently specific for contentious claims?

## BM-02 — Legacy doctrine crosswalk

Attack questions:

- Does retaining the 63-item provenance clarify intellectual development or burden the book with repository archaeology?

## BM-03 — Research agenda

Attack questions:

- Does the agenda expose the most threatening unanswered questions, or mostly downstream implementation work?

## BM-04 — Reference House implementation schedule

Attack questions:

- Does the schedule honestly show how much professional design remains before the house could be built?
- Does that remaining work weaken any earlier wording about coordination?

## BM-05 — Glossary

Attack questions:

- Which terms are genuinely useful and which represent unnecessary project dialect?

## BM-06 — Sources and further reading

Attack questions:

- Are the strongest intellectual competitors represented, not only sympathetic lineage?
- Are there major traditions the project ought to confront directly: adaptable housing, repair/conservation, facilities management, circular construction, low-tech design, mass housing, building pathology, post-occupancy research?

---

# Cross-book mandatory attack surfaces

## X-01 — Novelty / lineage

Compare central propositions against Habraken, Duffy, Brand, Gordon, Alexander, design-for-disassembly/adaptability, conservation/repair practice and ordinary building-services coordination.

Question: **what is actually new here, and does the book claim exactly that much?**

## X-02 — Cost / carbon / material burden

Question: **could Ovid’s House save future destructive work while consuming more present-day space, material, labour and carbon than it plausibly avoids?**

## X-03 — Housing generality

Question: **which propositions survive constrained terraces, flats, social/affordable housing, small footprints and ordinary client budgets?**

## X-04 — Construction culture / procurement

Question: **does the system work under ordinary UK procurement and competent-but-imperfect site practice, or only under unusually disciplined design authorship?**

## X-05 — Occupant reality

Question: **does the model assume future owners will inspect, maintain, document and value serviceability in ways real households often do not?**

## X-06 — Boundary debt

Question: **does every new access/reversibility advantage create fire, acoustic, thermal, moisture, pest, security or finish liabilities that collectively erase the benefit?**

## X-07 — Architectural quality

Question: **if all maintenance claims were removed, would the Reference House and the general architectural position still produce desirable architecture?**

## X-08 — Formalisation / compiler confidence

Question: **does computational explicitness ever make weak or incomplete architectural assumptions look more authoritative than they are?**

## X-09 — Style neutrality

Question: **could the doctrine survive an excellent house in a materially different architectural language, or has classical taste shaped the supposedly neutral system more deeply than acknowledged?**

## X-10 — Strongest conventional baseline

Question: **for each non-standard proposition, what would an excellent conventional architect do instead, and is the Ovid’s House answer actually better once all burdens are counted?**

---

# R0 gate

R0 passes when:

- the frozen candidate identity is explicit;
- all major book surfaces are represented above;
- no manuscript correction has occurred;
- later findings can be attached to stable surfaces rather than vague chapter criticism;
- hostile-architect and steelman passes can operate over the same register.

**Next diagnostic gate:** R1 — Core Proposition Attack.