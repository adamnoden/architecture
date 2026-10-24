# OCG-04A — Proposition-Level Audit Method

**Programme:** OCG — Occupied Change  
**Parent:** [#593 — OCG-04 existing-doctrine / system audit](https://github.com/adamnoden/architecture/issues/593)  
**Packet:** [#594 — OCG-04A](https://github.com/adamnoden/architecture/issues/594)  
**Depends on:** OCG-03 / PR #592 / merge `e384eacf9cde4be3016268214d507a9c87d4e3c1`  
**Baseline `main`:** `e384eacf9cde4be3016268214d507a9c87d4e3c1`  
**State:** candidate method freeze; becomes the OCG-04A record when merged

## Purpose

Freeze how OCG-04 audits the project’s **existing propositions** before any canonical scenario receives a finding.

OCG-04 is deliberately positioned between two different questions:

1. **Does the project already contain a proposition that should materially bound this intervention consequence, and is that proposition coherent and evidentially supportable at its own level?** — OCG-04.
2. **Does the Reference House actually realise that proposition with sufficient geometry, topology, detail, route and technical performance?** — OCG-05 / owning technical authority.

Conflating those questions would let prose intent masquerade as a physical pass. Keeping them separate also prevents an implementation defect from being misdiagnosed as missing doctrine.

The governing rule is:

> **Audit the claim at the level that owns it; never award a stronger conclusion than that level can prove.**

---

# 1. OCG-04 authority boundary

OCG-04 consumes the authority map frozen in OCG-00A.

Its object is the **existing proposition/system layer**:

- constitutional provisions;
- admitted strategies;
- active patterns;
- current architectural/system propositions already selected by the project;
- supporting development strategies such as manufacturing where they materially qualify those propositions;
- Reference House occurrence records only as evidence that a proposition is selected and to identify its stated outstanding proof.

OCG-04 does not own the permanent architectural response. It does not revise the proposition while auditing it.

## 1.1 OCG-04 may conclude

OCG-04 may determine that:

- an existing proposition is causally directed at a relevant intervention consequence;
- its proposition-level logic is supported, partial, conflicting, unresolved or absent;
- a claimed benefit lies principally outside architecture’s causal ownership;
- a proposition’s benefit is limited by permanent fire/acoustic/moisture/thermal/structural/area/maintenance/architectural burdens already established by project authority or OCG-02;
- a proposition requires OCG-05 physical/model proof before its Reference House occurrence can receive any implementation-level confidence;
- no additional OCG-specific proposition is presently earned.

## 1.2 OCG-04 may not conclude

OCG-04 may not conclude merely from prose/pattern intent that:

- a real component fits through an opening;
- a worker can reach, work on or withdraw it in the Reference House;
- an actual service route is continuous or uncongested;
- a real isolator produces a stated outage scope;
- an external scaffold/tower/MEWP can be deployed on an unknown site;
- a removable closure actually satisfies fire, acoustic, water, air or thermal duties;
- a service wall remains usable after actual furniture/joinery/product packing;
- a floor/wall can be opened and reclosed with a known reinstatement envelope;
- a product-specific replacement sequence works;
- an unrepresented fact is favourable.

Those are OCG-05 or owning-authority proof questions.

---

# 2. The unit of audit

A **scenario is not given one overall OCG-04 status**.

The atomic audit unit is:

> **canonical scenario × existing proposition × claimed consequence mechanism**

This prevents a positive finding in one dimension from cancelling a failure or unknown in another.

For example, one bathroom intervention may legitimately contain all of the following at once:

- dry-side component access — `ADDRESSED`;
- local isolation — `PARTIAL`;
- dust containment — `NOT_ARCHITECTURE_OWNED` by default;
- actual withdrawal clearance — proposition valid but `OCG05_REQUIRED`;
- acoustic consequence of the access wall — `UNRESOLVED` or `CONFLICT` depending on current authority.

The scenario-level record is therefore a **synthesis of claim rows and open routes**, not a pass/fail badge.

No compound OCG-04 score, traffic light or hidden ranking is permitted.

---

# 3. Finding vocabulary

Finding status is attached to a proposition × consequence claim. It is independent of evidence state, causal ownership and next proof route.

## 3.1 `ADDRESSED`

Use only when an **existing selected proposition**:

1. explicitly or unambiguously targets the consequence mechanism under review;
2. contains a plausible causal relationship at its own authority level;
3. has enough support to say the proposition itself is not merely aspirational; and
4. does not contain a known unresolved contradiction that defeats that specific claim.

`ADDRESSED` means **the project already has a credible proposition for this mechanism**.

It does **not** mean:

- the whole scenario is solved;
- the Reference House implementation passes;
- product geometry works;
- the permanent response is free of burden;
- OCG-05 is unnecessary.

## 3.2 `PARTIAL`

Use when an existing proposition credibly addresses a material subset of the mechanism or sequence but leaves a material remainder.

Typical examples:

- access is addressed but withdrawal is not;
- primary route coherence is addressed but room endpoint access is not;
- service isolation is bounded at one topology level but unrelated dependencies remain;
- a service zone reduces destructive access but does not address occupant/privacy consequence of opening it.

The omitted remainder must be named. `PARTIAL` is not shorthand for vague uncertainty.

## 3.3 `CONFLICT`

Use when current selected propositions or obligations materially pull against one another such that the claimed benefit cannot be accepted unqualified at proposition level.

Examples may include:

- access versus fire/acoustic boundary integrity;
- demountability versus weather/air/thermal robustness;
- concentrated serviceability versus domestic repose or area cost;
- future flexibility versus permanent architectural clarity;
- one proposition bounding physical disturbance while materially worsening another consequence dimension.

A tension listed only as a general design force is not automatically a `CONFLICT`. The audit must identify an actual unresolved contradiction in current proposition scope.

## 3.4 `UNRESOLVED`

Use when a relevant selected proposition exists but current proposition-level authority/evidence is insufficient to judge the causal claim.

This is for uncertainty **inside the proposition**, not merely missing Reference House geometry.

If the proposition is clear and supportable but its implementation remains unproved, use `ADDRESSED` or `PARTIAL` plus the separate `OCG05_REQUIRED` proof route.

## 3.5 `UNADDRESSED`

Use when a material **architecture-owned** consequence mechanism has no selected existing proposition that claims to address it, or current project authority explicitly leaves the mechanism outside its selected strategy.

`UNADDRESSED` is diagnostic, not design permission. OCG-04E and later proportionality work may still conclude:

- no permanent response is worth adding;
- disruption should be accepted;
- another existing owner should absorb the question;
- OCG-05 must first establish that the consequence is real in the Reference House.

Held candidates do not prevent `UNADDRESSED`: a held candidate is deliberately **not** selected authority.

## 3.6 `NOT_ARCHITECTURE_OWNED`

Use when the relevant consequence mechanism is principally owned by competent contractor method, delivery, site/project conditions or another non-architectural cause under the OCG-00A / OCG-01C ownership discipline.

Architecture still has a negative duty not to make competent control needlessly impossible. If geometry materially causes that difficulty, audit the **architectural obstruction** as a separate claim rather than reassigning the temporary-work method itself to architecture.

---

# 4. Separate fields that must never collapse into finding status

## 4.1 Causal ownership

Use the OCG-01C ownership vocabulary unchanged:

- `ARCHITECTURE`
- `ASSEMBLY_DETAIL`
- `CONTRACTOR_METHOD`
- `SITE_PROJECT`
- `SHARED`
- `UNRESOLVED`
- `NOT_ARCHITECTURE_OWNED`

A claim status does not replace ownership.

## 4.2 Evidence / knowledge state

Use OCG-01C evidence discipline unchanged where applicable:

- consequence/model state: `PRESENT`, `NONE`, `UNKNOWN`, `NOT_REPRESENTED`, `NOT_APPLICABLE`;
- basis: `OBSERVED`, `CONTROLLED_SOURCE`, `EXTERNAL_EVIDENCE`, `SUPPORTED_INFERENCE`, `ASSUMPTION`, `UNSUPPORTED`.

OCG-04 adds no numerical confidence scale.

## 4.3 Next proof route

Record the next proof requirement separately from finding status.

Permitted route labels:

- `NONE` — no further proof is required for the narrow proposition-level claim being made;
- `OCG05_REQUIRED` — Reference House geometry/topology/detail/model evidence is required before an implementation claim;
- `OWNER_PROOF_REQUIRED` — a non-OCG architectural/technical owner must supply evidence or resolve a detail;
- `SITE_DPL_REQUIRED` — real-site evidence is required;
- `DELIVERY_METHOD_REQUIRED` — consequence depends on competent temporary works / delivery method rather than permanent architecture;
- `MULTIPLE` — more than one explicit route applies.

The exact outstanding facts must still be named; the route label alone is not sufficient.

---

# 5. Source-authority and maturity discipline

OCG-04 must state **what kind of source is being credited**. Different project layers do different evidential work.

| Source class | What OCG-04 may use it for | What it cannot prove |
|---|---|---|
| `CONSTITUTION` | project-level durable proposition and proportionality constraint | reusable physical response or RH implementation |
| `STRATEGY` | selected broad response logic with its stated scope/trade-offs | one mandatory physical form |
| `ACTIVE_PATTERN` | reusable architectural response and explicit forces/requirements/evidence boundary | RH geometry/detail adequacy |
| `DEVELOPMENT_STRATEGY` | manufacturing/assembly/delivery logic that qualifies an architectural proposition | admission as canonical pattern or RH fact |
| `REFERENCE_OCCURRENCE` | that the RH selects a pattern/implementation direction; its stated proof debt | general evidence maturity or completed implementation proof |
| `DELIVERY` | permanent-versus-temporary work ownership, responsibilities and downstream requirements | upstream architectural truth |
| `SITE_DEPLOYMENT` | actual site/project evidence and site-dependent feasibility | site-agnostic RH truth where evidence is absent |
| `RESEARCH` | causal/background evidence and transferability limits | project doctrine by itself |
| `COMPUTATIONAL` | controlled represented relationships within its declared proof boundary | unrepresented adequacy or human/site effects |
| `HELD_CANDIDATE` | evidence that an idea was considered and deliberately not selected | current project support for an intervention claim |

## 5.1 Pattern evidence labels remain visible

Where an active pattern declares evidence such as `established` or `supported`, later audit packets record that label rather than flattening all active patterns into equal maturity.

The label does not itself decide the OCG finding; the claim still has to match the scenario mechanism.

## 5.2 Reference House occurrence is not an evidence upgrade

The occurrence register explicitly states that selection in the Reference House does not raise a pattern’s evidence maturity.

Therefore later OCG-04 packets may use the occurrence register to establish:

- that the house currently selects the pattern;
- its implementation direction;
- its already-declared outstanding proof.

They may not use occurrence alone to convert a `supported` pattern into an `established` claim or an outstanding proof into a pass.

## 5.3 Held candidates are negative controls

Current held candidates include:

- Replaceable Architectural Lining;
- Individually Isolatable Manifold Distribution;
- Local Deep Service Zone;
- Selective Floor Access.

They may be cited when an audit asks whether the project already selected a seemingly convenient solution. Their held status means **no**.

They must not be quietly counted as current Ovid’s House serviceability provision.

---

# 6. Required audit record

Later OCG-04 packets use the following record for each material proposition × consequence claim.

```text
Claim row ID:
Canonical scenario:
Intervention class:
Consequence mechanism / OCG-01C dimension:
Canonical sequence step(s):

Existing proposition:
Source path / authority:
Source class:
Source maturity/evidence label where declared:
Reference House occurrence selected? yes / no / not applicable

Exact causal claim being audited:
Finding status: ADDRESSED / PARTIAL / CONFLICT / UNRESOLVED / UNADDRESSED / NOT_ARCHITECTURE_OWNED
Causal ownership:
Evidence / knowledge state:
Evidence basis:

What this claim actually controls:
What it explicitly does not control:
Permanent-burden / counter-evidence note:
Conflict with other selected proposition(s):

Next proof route:
Exact outstanding fact(s):
Upstream owner if unresolved:
OCG-specific addition earned at this stage: NO
```

## 6.1 Claim-row identity

Use stable row IDs:

`OCG-04<packet>-CI-<scenario>-R<nn>`

For example:

`OCG-04B-CI-03-R01`

Do not recycle row IDs if a later correction supersedes a row; mark the prior row superseded in the durable record.

## 6.2 Scenario synthesis block

After the claim rows for one scenario, record:

- proposition-level strengths already present;
- material gaps/conflicts/unresolved claims;
- consequences principally not architecture-owned;
- OCG-05 physical/model proof queue;
- other-owner proof/routing queue;
- explicit `no OCG-specific addition earned` statement where true.

Do **not** assign one overall scenario status.

---

# 7. Complete-sequence audit rule

A proposition receives credit only for the intervention-sequence steps it actually affects.

Use the OCG-03 common grammar where applicable:

`approach → protect/contain → isolate/make safe → expose/access → work/withdraw → remove/waste route → introduce replacement/material → connect/build → test/commission → close/reinstate → clean/recover → return to use`

Typical overclaim traps:

- `access panel exists` ≠ workable access;
- workable access ≠ withdrawal clearance;
- withdrawal clearance ≠ route to building exit;
- isolation point exists ≠ bounded outage scope;
- removable trim ≠ deterministic reclosure;
- dry-side access ≠ independent waterproofing/fire/acoustic performance;
- coherent service route ≠ spare usable future capacity;
- physical index ≠ physical legibility if the topology itself is incoherent;
- prefabricated component ≠ reduced occupied-work consequence unless onsite operations are actually removed/compressed.

Later packets must therefore cite the exact sequence step(s) credited to each proposition.

---

# 8. Consequence-dimension rule

Use the OCG-01C dimensions without aggregation:

1. access / permanent-fabric disturbance;
2. service consequence;
3. occupancy consequence;
4. worksite / contamination consequence;
5. logistics consequence;
6. reinstatement consequence;
7. recovery consequence.

A proposition may be `ADDRESSED` for one dimension and irrelevant, partial or conflicting for another.

The audit must not write sentences such as “overall this is low disruption” as a substitute for the seven-dimensional record.

---

# 9. Candidate proposition / authority map

This map authorises where 04B/04C/04D should look. It is **not a verdict matrix**.

Constitution references use numbered provisions in `docs/manuscript/governing-principles.md`.

## CI-01 — foul-drainage inspection / clearance

**Candidate architectural/system authority**

- Constitution 4 — foreseeable failure detectable/containable/repairable;
- Constitution 5 — maintenance geography;
- Constitution 10 — intergenerational legibility;
- `docs/patterns/coherent-horizontal-service-route.md`;
- `docs/patterns/accessible-vertical-service-zone.md`;
- `docs/patterns/designed-structural-penetration.md` where foul routes cross structure/boundaries;
- `docs/patterns/physical-service-index.md` for discoverability/stewardship;
- relevant drainage/water provisions in `docs/patterns/service-topology-sequence.md`.

**Ownership-boundary authority**

- delivery/contractor method for hygienic containment, protection and cleaning;
- DPL/site authority for below-ground/site drainage truth.

## CI-02 — roof rainwater inspection / clearance

**Candidate architectural/system authority**

- Constitution 4 and 5;
- `docs/patterns/roof-maintenance-route.md`;
- `docs/patterns/accessible-rainwater-route.md`;
- `docs/patterns/ground-supported-facade-access.md` where temporary external access applies;
- `docs/manuscript/maintenance-geography-external.md`;
- `docs/research/external-maintenance-access.md`.

**Ownership-boundary authority**

- delivery for actual temporary access system selection;
- DPL/site for ground bearing, boundaries, neighbour/highway and staging facts.

## CI-03 — concealed shower control / mixing-valve replacement

**Candidate architectural/system authority**

- Constitution 2–5;
- `docs/patterns/high-service-room-service-wall.md`;
- `docs/patterns/failure-tolerant-wet-service-room.md`;
- `docs/patterns/strategies/fail-safe-water-distribution.md`;
- `docs/patterns/visible-leakage-path.md` where relevant to failure consequence;
- `docs/patterns/physical-service-index.md` where isolation/stewardship is material;
- `docs/development/manufacturing-strategy.md` for bounded replaceable access assemblies/interfaces.

**Negative control**

- `docs/patterns/candidates/individually-isolatable-manifold-distribution.md` is held and cannot be counted as selected provision.

## CI-04 — largest bounded finite-life plant module replacement

**Candidate architectural/system authority**

- Constitution 1, 5, 6 and 10;
- `docs/patterns/plant-room-service-hub.md`;
- `docs/patterns/controlled-utility-entry.md` where external/internal transitions affect replacement;
- `docs/patterns/physical-service-index.md`;
- external maintenance / site-interface authority where the complete replacement route uses exterior territory;
- `docs/development/manufacturing-strategy.md` for replaceable technical components/interfaces.

**Reference occurrence note**

The occurrence register already names product-level packing and withdrawal geometry as outstanding proof. OCG-04 must preserve that debt for OCG-05 rather than infer a pass.

## CI-05 — complete window assembly replacement

**Candidate architectural/system authority**

- Constitution 2, 3, 5, 6, 7 and 11;
- `docs/patterns/permanent-opening-replaceable-window.md`;
- external maintenance/access authority for any exterior working position;
- `docs/development/manufacturing-strategy.md` for tolerance translation, reversible fixing and first-article removal/reinstatement.

**Reference occurrence note**

The current occurrence explicitly leaves fixing/withdrawal and air/water/thermal continuity to proof.

## CI-06 — upper water-supply branch renewal

**Candidate architectural/system authority**

- Constitution 2, 4, 5 and 10;
- `docs/patterns/coherent-horizontal-service-route.md`;
- `docs/patterns/accessible-vertical-service-zone.md`;
- `docs/patterns/high-service-room-service-wall.md`;
- `docs/patterns/designed-structural-penetration.md`;
- `docs/patterns/strategies/fail-safe-water-distribution.md`;
- `docs/patterns/visible-leakage-path.md`;
- `docs/patterns/physical-service-index.md`;
- `docs/patterns/strategies/separate-structural-floor-changeable-layers.md` where the floor/service relationship is material.

**Negative controls**

- Individually Isolatable Manifold Distribution and Selective Floor Access remain held candidates.

## CI-07 — new data branch to occupied bedroom

**Candidate architectural/system authority**

- Constitution 2, 5, 6, 10 and 11;
- `docs/patterns/accessible-room-service-route.md`;
- `docs/patterns/coherent-horizontal-service-route.md`;
- `docs/patterns/accessible-vertical-service-zone.md` where a storey transition is required;
- `docs/patterns/designed-structural-penetration.md` at consequential crossings;
- `docs/patterns/controlled-attachment-plane.md` where the route/interface shares room-edge datums;
- `docs/patterns/physical-service-index.md`;
- `docs/patterns/strategies/separate-structural-floor-changeable-layers.md`.

**Negative controls**

- Replaceable Architectural Lining and Selective Floor Access are held, not selected answers to future data change.

## CI-08 — family-bathroom refit

**Candidate architectural/system authority**

- Constitution 1–5, 6 and 11 where applicable;
- `docs/patterns/high-service-room-service-wall.md`;
- `docs/patterns/failure-tolerant-wet-service-room.md`;
- `docs/patterns/strategies/fail-safe-water-distribution.md`;
- primary horizontal/vertical service patterns where branches cross the room boundary;
- `docs/patterns/source-capture-bathroom-extract.md` for the extract subsystem;
- `docs/development/manufacturing-strategy.md` for replaceable interfaces / off-site preparation where genuinely applicable.

**Ownership-boundary authority**

- delivery/contractor method for temporary containment, sequencing and housekeeping;
- product/wet-build-up technical authority for curing/waterproofing details.

## CI-09 — kitchen refit

**Candidate architectural/system authority**

- Constitution 1–6 and 11 where applicable;
- `docs/patterns/high-service-room-service-wall.md` where the kitchen service edge qualifies;
- `docs/patterns/coherent-horizontal-service-route.md`;
- `docs/patterns/accessible-room-service-route.md` where local dry distribution qualifies;
- `docs/patterns/source-capture-kitchen-extract.md`;
- `docs/patterns/plant-room-service-hub.md` / service topology for concentrated upstream distribution;
- `docs/development/manufacturing-strategy.md` for controlled manufacture versus rational site fabrication.

**Ownership-boundary authority**

- delivery for protection/staging/sequence;
- product/joinery authority for actual cabinet/worktop installation tolerances.

## CI-10 — remote en-suite outside selected wet-service geography

**Candidate architectural/system authority**

- Constitution 1 — foreseeable versus speculative change;
- Constitution 2 — permanent fabric versus faster systems;
- Constitution 5 — maintenance/service geography;
- Constitution 7 — let permanence remain architectural;
- service-topology sequence S4–S7/S9;
- `docs/patterns/accessible-vertical-service-zone.md`;
- `docs/patterns/coherent-horizontal-service-route.md`;
- `docs/patterns/designed-structural-penetration.md`;
- high-service-room / wet-room patterns only if their actual scope legitimately reaches the new setting.

**Negative controls**

- Local Deep Service Zone, Individually Isolatable Manifold Distribution and Selective Floor Access remain held;
- no latent remote soil/wet branch is granted by OCG-03.

This scenario is specifically allowed to establish that the existing targeted-capacity posture coherently **does not** make this future brief cheap/easy.

## CI-11 — primary electrical distribution renewal

**Candidate architectural/system authority**

- Constitution 1, 2, 5, 6, 10 and 11;
- `docs/patterns/controlled-utility-entry.md`;
- `docs/patterns/plant-room-service-hub.md`;
- `docs/patterns/accessible-vertical-service-zone.md`;
- `docs/patterns/coherent-horizontal-service-route.md`;
- `docs/patterns/accessible-room-service-route.md`;
- `docs/patterns/compartmented-service-void.md`;
- `docs/patterns/designed-structural-penetration.md`;
- `docs/patterns/physical-service-index.md`;
- `docs/patterns/strategies/separate-structural-floor-changeable-layers.md`.

**Ownership-boundary authority**

- delivery/electrical competent-person method for temporary power and sequencing;
- OCG-05 for actual route continuity/capacity/access.

## CI-12 — primary space-heating renewal / upgrade

**Candidate architectural/system authority**

- Constitution 1, 2, 4–6 and 10;
- `docs/patterns/plant-room-service-hub.md`;
- `docs/patterns/controlled-utility-entry.md` where source/interface changes require it;
- `docs/patterns/accessible-vertical-service-zone.md`;
- `docs/patterns/coherent-horizontal-service-route.md`;
- `docs/patterns/designed-structural-penetration.md`;
- `docs/patterns/physical-service-index.md`;
- water/failure strategy where hydronic distribution applies;
- `docs/development/manufacturing-strategy.md` for plant/component replacement and controlled interfaces.

**Ownership-boundary authority**

- delivery/commissioning method for duration and temporary provision;
- OCG-05 / system owner for actual retained-versus-renewed branch topology.

## CI-13 — major load-bearing-wall replanning control

**Candidate architectural/system authority**

- Constitution 1 — alteration is expected over building life but provision remains proportional;
- Constitution 3 — interfaces where systems/structure meet;
- Constitution 7 — defining spatial/structural relationships may deliberately endure;
- governing constraint that serviceability is pursued proportionately;
- structural authority for actual alteration/temporary works;
- delivery for containment, protection and temporary works method.

**Deliberate absence**

No active OCG/serviceability pattern is presumed to make arbitrary primary structural replanning low-disruption. Held generic-flexibility ideas cannot be imported to make the control pass.

---

# 10. Anti-overclaim / contamination checks

Every 04B/04C/04D review must run these checks before recording a positive finding.

## 10.1 Prose-intent check

Does the cited source contain an actual causal proposition relevant to the scenario mechanism, or merely a value statement such as “maintainable” or “adaptable”?

If only intent exists, do not use `ADDRESSED`.

## 10.2 Sequence-completeness check

Which exact intervention steps receive benefit? Name them. Do not extend credit beyond them.

## 10.3 Source-maturity check

Is the source constitution, strategy, active pattern, RH occurrence, development strategy or held candidate? Preserve the distinction.

## 10.4 Evidence check

Is the causal claim supported by controlled project/external evidence, or repeated because it sounds plausible? Record the OCG-01C evidence basis.

## 10.5 Ownership check

Would the claimed benefit actually arise from ordinary temporary protection, sequencing, extraction, staging or real-site availability? If so, do not credit permanent architecture for it.

## 10.6 Counter-burden check

Does the proposition create permanent area, boundary, acoustic, fire, moisture, thermal, structural, workmanship, maintenance or architectural burden that qualifies the claim? Use OCG-01D / OCG-02; do not erase the burden.

## 10.7 Held-candidate check

Is the apparent solution actually one of the project’s held candidates? If yes, it is not current support.

## 10.8 RH-proof check

Would accepting the claim require exact Reference House geometry/topology/detail? If yes, preserve the proposition-level finding if justified but set `OCG05_REQUIRED` with exact outstanding facts.

## 10.9 No-design check

Has the audit begun to propose a new panel, route, hatch, manifold, floor access point, reserve or detail? Stop. OCG-04 records the gap; it does not repair it.

---

# 11. Packet concurrency rule

After OCG-04A merges:

- OCG-04B may audit CI-01…CI-07;
- OCG-04C may audit CI-08…CI-10;
- OCG-04D may audit CI-11…CI-13;

in parallel because they share this frozen semantic contract.

They may not change:

- finding vocabulary;
- row schema;
- canonical scenario briefs;
- source-class semantics;
- evidence/ownership semantics.

If a packet discovers the contract itself is inadequate, it must stop and reopen 04A rather than locally invent a new status.

OCG-04E depends on all three and owns cross-scenario reconciliation.

---

# 12. Integrity tests

## 12.1 Layer separation

**PASS.** Proposition adequacy and Reference House implementation adequacy are explicitly separate.

## 12.2 No one-word scenario verdict

**PASS.** Status attaches to proposition × consequence claims, not entire scenarios.

## 12.3 Evidence/status separation

**PASS.** Finding, causal ownership, evidence state/basis and next proof route remain independent fields.

## 12.4 Maturity preservation

**PASS.** Constitution, strategies, active patterns, development strategies, RH occurrences and held candidates cannot silently upgrade one another.

## 12.5 Negative outcomes

**PASS.** `UNADDRESSED` does not authorise design; `NOT_ARCHITECTURE_OWNED` and no-new-OCG-proposition outcomes remain legitimate.

## 12.6 Anti-overclaim

**PASS.** Access, withdrawal, route, reclosure, isolation and physical implementation claims are explicitly bounded.

## 12.7 Parallel restart safety

**PASS.** 04B/04C/04D can work independently under stable row/status semantics and reconcile in 04E.

---

# Result

**OCG-04A PASS — the proposition-level audit contract is frozen.**

The six finding statuses are:

- `ADDRESSED`
- `PARTIAL`
- `CONFLICT`
- `UNRESOLVED`
- `UNADDRESSED`
- `NOT_ARCHITECTURE_OWNED`

They apply to individual proposition × consequence claims, never as a compound scenario score.

Physical/model/site/method proof routing remains separate.

The 13-scenario candidate authority map is frozen without awarding any scenario finding.

After clean merge, **OCG-04B, OCG-04C and OCG-04D may proceed independently under this contract**.