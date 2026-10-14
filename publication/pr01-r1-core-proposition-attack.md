# PR-01 R1 — Core Proposition Attack

**Status:** COMPLETE — diagnostic findings recorded; frozen candidate unchanged  
**Date:** 2026-10-14  
**Programme:** `publication/pr01-adversarial-review-programme.md`  
**Review map:** `publication/pr01-findings-register.md`  
**Frozen candidate content:** `f6b286e883f24b322f41f85d8d3ad796b103a53d`

R1 attacks Parts I–II and the eleven governing principles without allowing the later pattern language, Reference House or compiler to rescue them.

The purpose is not to prove that the thesis is bad. It is to identify the points at which a competent architect can still reject the thesis **even after granting the book its strongest existing qualifications**.

No candidate manuscript, figure, principle, pattern or architectural source is changed in R1.

---

## 1. Adversarial baseline: the excellent conventional house

The correct comparator is not a badly coordinated house with inaccessible valves, random service chasing and undersized plant-room doors.

A strong conventional UK project can already combine:

- CDM designer duties concerning foreseeable maintenance, repair and cleaning risk;
- CIBSE maintainability guidance, economic life, documentation and replacement planning;
- explicit tolerance and accuracy management under BS 5606;
- workmanship and trade-interface control under the BS 8000 family;
- ordinary drained-envelope, movement-joint, access, commissioning and isolation practice;
- service-life planning and life-cycle costing;
- selective use of accessible voids, risers, removable panels and replacement routes;
- durable integrated construction where separation adds no value.

Such a house can be simple, materially lean and architecturally excellent without adopting Ovid’s House vocabulary or its platform hierarchy.

R1 therefore asks a harder question:

> **What does Ovid’s House improve relative to excellent conventional practice once its extra space, layers, joints, documentation, coordination, material and future-maintenance burdens are counted?**

That baseline produces the most important R1 findings.

---

# 2. Findings

## PR01-F001 — the thesis lacks an excellent-conventional comparator

- **Dimension:** `INCOMPLETE`
- **Severity:** **S1 — material**
- **Surface:** `P1-01 / P1-04 / P1-05`
- **Claim under attack:** Ovid’s House turns established lifecycle concerns into a materially stronger architectural proposition for the ordinary house.
- **Strongest fair criticism:** Parts I–II demonstrate the doctrine primarily against failures of ordinary coordination—chased masonry, inaccessible valves, replacement paths that were never considered, brittle junctions and maintenance left until late. Those are legitimate problems, but current professional practice already contains substantial maintainability, tolerance, lifecycle and designer-duty machinery. The book does not yet compare its platform against an **excellent conventional house** that uses that machinery well while remaining materially and spatially lean.
- **Why it matters:** Without the stronger baseline, the project risks proving that good whole-life design is better than bad detailing rather than showing which additional Ovid’s House commitments earn their cost.
- **Evidence / counterexample:** CIBSE *Guide M* and M1 explicitly place full-life safe/economic maintainability within design responsibility; HSE CDM designer duties include foreseeable maintenance/refurbishment risk; BS 5606:2022 treats accuracy/tolerance as a design-management problem; BS 8000 addresses tolerance, fit and trade interdependencies; ISO 20887 already codifies adaptability/disassembly principles.
- **Owner:** publication / doctrine / evidence
- **Class:** `EVIDENCE FINDING`
- **Provisional consequence:** In R8, establish a named lean conventional baseline and show which Ovid’s House moves exceed it, which merely restate it, and where the conventional answer is preferable.
- **Disposition:** `OPEN`

### R1 judgement

This is not a novelty accusation. The manuscript already acknowledges its lineage unusually well. The defect is comparative: the reader cannot yet see the **delta** between excellent current practice and the additional platform proposition.

---

## PR01-F002 — proportional serviceability is not yet operational enough to discipline the project

- **Dimension:** `WEAK`
- **Severity:** **S1 — material**
- **Surface:** `P1-03 / P2-03 / P5-01`
- **Claim under attack:** `frequency × consequence × retrofit difficulty`, bounded by whole-life cost/carbon, is sufficient to prevent serviceability becoming over-provision.
- **Strongest fair criticism:** The manuscript correctly states that future provision has immediate material, spatial and embodied cost, but it does not yet demonstrate a repeatable decision method for comparing those burdens. The heuristic can rank future interventions qualitatively while still leaving the designer free to justify deeper floors, more voids, extra interfaces, reserve capacity or dedicated access whenever the future sounds consequential.
- **Why it matters:** Proportionality is the internal brake on the entire platform agenda. If the brake is rhetorical rather than operational, the doctrine can accumulate exactly the speculative infrastructure it says it rejects.
- **Evidence / counterexample:** Adaptability research finds non-linear trade-offs and diminishing returns. Research on structural adaptability explicitly warns against blanket overdesign and calls for element-specific comparison of adaptability benefit against upfront carbon. A 2025 study quantifies materially different upfront carbon costs for adaptability strategies rather than assuming more adaptability is better. The 2023 review *What should an adaptable building look like?* likewise emphasises balancing upfront embodied carbon with long-term adaptability and discourages blanket reserve capacity.
- **Owner:** doctrine / evidence
- **Class:** `EVIDENCE FINDING`
- **Provisional consequence:** R8 should add at least one explicit decision protocol and worked comparison in which an attractive serviceability provision is rejected because its present burden exceeds its credible future value. A universal formula is not required; a falsifiable decision discipline is.
- **Disposition:** `OPEN`

### R1 judgement

The current prose contains the right warning. What it lacks is evidence that the warning can actually defeat the project’s own preferences.

---

## PR01-F003 — applicability to compact and ordinary housing remains unproved

- **Dimension:** `NAIVE`
- **Severity:** **S1 — material**
- **Surface:** `P2-03`
- **Claim under attack:** Maintenance geography can operate as a general domestic architectural principle without demanding disproportionate technical space.
- **Strongest fair criticism:** The manuscript says a compact house can let corridors, cupboards and ordinary stairs do double duty, but it has not demonstrated the doctrine in a genuinely space-starved domestic morphology. The current worked house is detached and courtyard-based. A terrace, small urban house or flat has much less perimeter, plant area, floor depth, external access and freedom to cluster wet/service rooms. The most persuasive maintenance-geography examples may therefore depend on a hidden subsidy of area, ownership control and budget.
- **Why it matters:** If the central spatial proposition works mainly where space is generous, it is not yet an ordinary-house doctrine at the breadth implied by the book.
- **Evidence / counterexample:** Current maintainability guidance can be met selectively without creating a whole-house service topology. Design-for-disassembly research also shows built examples skew toward prototypes and smaller structures, with unresolved adoption barriers; evidence of a strategy in one morphology does not establish morphology-neutral value.
- **Owner:** doctrine / evidence
- **Class:** `QUALIFICATION`
- **Provisional consequence:** Either validate the proposition against at least one compact/constrained domestic counter-morphology, or narrow the publication claim so the reader is not asked to assume morphology neutrality.
- **Disposition:** `OPEN`

### R1 judgement

This does not refute maintenance geography. It challenges its claimed **generality**.

---

## PR01-F004 — repeated access creates a lifecycle reliability problem of its own

- **Dimension:** `INCOMPLETE`
- **Severity:** **S2 — significant**
- **Surface:** `P2-05 / P2-06`
- **Claim under attack:** Access, removability and replacement can be provided while primary fire, acoustic, air, water, thermal and security boundaries remain reliably reinstatable across the life of the house.
- **Strongest fair criticism:** The book is unusually explicit about “boundary debt”, but this may be more than a detailing caveat. Every removable panel, opening, gasket, seal, fire stop, acoustic seat or demountable interface creates a future operation in which performance must be restored correctly. A highly serviceable house can therefore trade rare destructive interventions for a larger number of precision-dependent reassembly events. The manuscript does not yet establish that this lifecycle reliability burden is lower.
- **Why it matters:** If the platform multiplies joints and reinstatement obligations faster than it reduces destructive work, maintainability may worsen whole-life robustness.
- **Evidence / counterexample:** The 2024 systematic review of design for disassembly reports persistent barriers around connection technology, skills, deconstruction time, data, recertification and implementation; almost half of reviewed studies identify undeveloped DfD technology as a barrier. Conventional drained-envelope and boundary practice also succeeds partly through continuity and deliberate limitation of joints.
- **Owner:** evidence / pattern / doctrine
- **Class:** `EVIDENCE FINDING`
- **Provisional consequence:** R8 should distinguish interfaces that are genuinely expected to cycle repeatedly from those that are merely replaceable in principle, and require proof/inspection strategy proportionate to the boundary consequence. Do not present reversibility itself as a reliability gain.
- **Disposition:** `OPEN`

---

## PR01-F005 — the structural-equilibrium clause in Repose still carries more normative force than its evidence earns

- **Dimension:** `OVERSTATED`
- **Severity:** **S2 — significant**
- **Surface:** `P1-06`
- **Claim under attack:** Principal domestic spaces should normally present a plausible visual account of support/equilibrium as part of designing for repose.
- **Strongest fair criticism:** The evidence securely supports perception of stability, and the manuscript correctly labels the comfort inference as a doctrine hypothesis. But placing “apparent equilibrium” inside a canonical governing principle still gives a preference-dependent architectural inference normative force by association with much stronger evidence on heat, air, noise, privacy and control. A sceptic can reasonably see a conservative aesthetic preference entering doctrine through a carefully caveated neuroscientific side door.
- **Why it matters:** Repose is potentially one of the project’s strongest human-centred constraints on technical overexpression. Its credibility is reduced if its weakest aesthetic hypothesis appears co-equal with its well-supported environmental and agency claims.
- **Evidence / counterexample:** Environmental-psychology research supports coherence as one factor in interior preference but also demonstrates individual differences and a distinct role for fascination. Current neuroarchitecture reviews continue to describe the field as methodologically heterogeneous and weakly translated into direct design prescriptions. The project’s own Repose Evidence Audit already states that apparent structural equilibrium contributing to domestic repose is a **doctrine hypothesis**, not demonstrated domestic evidence.
- **Owner:** principle / evidence
- **Class:** `QUALIFICATION`
- **Provisional consequence:** In R8, consider demoting apparent equilibrium from the normative core of Principle 8 to an explicitly project-dependent architectural hypothesis/review prompt, unless stronger direct evidence emerges.
- **Disposition:** `OPEN`

### R1 judgement

The broader Repose principle survives R1 strongly. This finding is deliberately narrow.

---

## PR01-F006 — the eleven-principle set does not yet discriminate sharply enough between Ovid’s House and competent practice

- **Dimension:** `DERIVATIVE`
- **Severity:** **S2 — significant**
- **Surface:** `P1-05`
- **Claim under attack:** The eleven governing principles together form the durable defining doctrine of Ovid’s House.
- **Strongest fair criticism:** Several principles are unusually well stated but substantially overlap established professional competence: deliberate interface design, tolerance management, maintainability, passive-first environmental design, commissioning/records and lifecycle stewardship. Treating each at the same constitutional level as selective permanence and maintenance geography risks making the doctrine look like a comprehensive checklist of good practice rather than a small set of propositions that distinctly generate Ovid’s House.
- **Why it matters:** A doctrine that contains everything admirable becomes difficult to falsify and less memorable. The project’s intellectual contribution becomes harder to identify precisely because the surrounding competence layer is so extensive.
- **Evidence / counterexample:** CIBSE Guide M, HSE CDM, BS 5606 and BS 8000 already allocate many of these responsibilities within established practice. The manuscript itself repeatedly admits that underlying techniques are conventional.
- **Owner:** doctrine / publication
- **Class:** `PUBLICATION DEFECT`
- **Provisional consequence:** R8 should test whether some principles belong as governing constraints/implementation disciplines beneath a smaller constitutive doctrine rather than as co-equal principles. Do not merge merely for elegance; merge only where removing a principle does not remove a distinct architectural proposition.
- **Disposition:** `OPEN`

---

## PR01-F007 — selective permanence is more explicit about change than about what earns permanence

- **Dimension:** `WEAK`
- **Severity:** **S2 — significant**
- **Surface:** `P1-03`
- **Claim under attack:** Selective permanence provides a sufficiently disciplined way to decide which architectural relationships should endure.
- **Strongest fair criticism:** The doctrine gives increasingly concrete tests for where change should be accommodated, but the positive side of the decision—why a room order, facade, stair, structural family or material relationship **deserves** permanence—remains intentionally architectural and project-specific. That is legitimate judgement, but it means the central term can be used after the fact to protect almost any favoured architectural commitment.
- **Why it matters:** If permanence choices cannot be challenged except as taste, selective permanence risks becoming asymmetrical: technical change must justify itself rigorously, while architectural permanence is presumed valuable once the architect names it.
- **Evidence / counterexample:** The frozen manuscript itself says persistence conditions may be spatial, structural, material, legal or cultural and “need not be machine-readable”. That honesty prevents a false-precision criticism but leaves the discriminant test open.
- **Owner:** doctrine
- **Class:** `QUALIFICATION`
- **Provisional consequence:** R8 should make the burden of proof symmetrical: permanence should be justified by durable architectural, social, environmental or cultural value and by the future constraints it creates—not simply by design intent.
- **Disposition:** `OPEN`

---

# 3. Attacks that did not earn findings

R1 also records criticisms that were tested and rejected so they are not repeatedly rediscovered later.

## R1-RJ01 — “No service may ever enter permanent fabric”

**Rejected as an attack on the frozen candidate.**

The earlier project slogan is no longer the published doctrine. The frozen text states:

> Permanent fabric should not be used as the **routine** distribution or attachment zone for shorter-lived systems; unavoidable crossings and attachments may be sparse, deliberate, limited and documented.

That is materially different from an absolute ban. R1 should not attack a historical formulation the book has already corrected.

## R1-RJ02 — “The book presents layer separation as a novel discovery”

**Rejected.**

Part I explicitly names Habraken, Duffy, Brand, Gordon, Open Building, ISO 20887 and contemporary adaptability literature. It states that the ideas belong to an established body of knowledge. The legitimate derivative question is therefore the narrower PR01-F001/F006 question: what is the added value and which principles truly define this project?

## R1-RJ03 — “Designed interface is presented as a new technical invention”

**Rejected.**

The manuscript says movement joints, drained facade interfaces and reversible connections are established practice and locates the project’s claim in architectural orchestration. R1 does not require false novelty to criticise whether that orchestration earns constitutional status.

## R1-RJ04 — “Failure architecture claims invention of safe-to-fail design”

**Rejected.**

The manuscript uses Norwegian water practice, British hot-water observation, ordinary drainage logic and Perrow explicitly as antecedents. The useful claim is the cross-system domestic question “if the first defence fails, what happens next?” The unresolved problem is proportionality, captured in PR01-F002, not provenance.

## R1-RJ05 — “Repose is pseudoscientific neuroarchitecture”

**Rejected in its broad form.**

The frozen text and evidence audit are careful: Repose is a doctrine term, not a clinical construct; measurable environmental performance comes first; privacy/control evidence is bounded; and neuroarchitecture is not used as a direct rule generator. Only the apparent-equilibrium subclaim remains vulnerable enough to earn PR01-F005.

---

# 4. R1 result

R1 produces **seven open findings**:

| Finding | Severity | Core issue |
|---|---:|---|
| PR01-F001 | S1 | no excellent-conventional comparator |
| PR01-F002 | S1 | proportionality lacks a falsifiable worked decision discipline |
| PR01-F003 | S1 | compact/ordinary-housing generality unproved |
| PR01-F004 | S2 | access/removability creates lifecycle boundary-reinstatement risk |
| PR01-F005 | S2 | apparent structural equilibrium exceeds evidence within Repose |
| PR01-F006 | S2 | doctrine set mixes distinctive propositions with baseline competence |
| PR01-F007 | S2 | criteria for what earns permanence remain asymmetrically weak |

There is **no S0 finding** in R1. The central proposition survives first contact: buildings change, coupling matters, future work occupies architecture, and deliberate locality of change is a coherent thesis.

But the burden of proof has moved. The project now has to show that it beats **excellent lean conventional practice**, not bad practice; that its proportionality test can reject its own attractive infrastructure; and that its spatial/material premiums are not being hidden by the Reference House morphology.

These findings remain diagnostic and `OPEN`. R2–R6 may strengthen, merge, narrow or reject them. They are not corrected until R7 freezes the adversarial register.

---

# 5. External adversarial evidence used in R1

The following sources were used as counterpressure, not as new manuscript authority:

- CIBSE, *Guide M: Maintenance engineering and management* (2023), especially M1 Guidance for designers: https://www.cibse.org/knowledge-research/knowledge-portal/guide-m-maintenance-engineering-and-management-2023
- CIBSE, *Guide M1: Guidance for designers* (2023): https://www.cibse.org/knowledge-research/knowledge-portal/guide-m1-guidance-for-designers-2023/
- HSE, CDM 2015 designer duties: https://www.hse.gov.uk/construction/cdm/2015/designers.htm
- BSI, BS 5606:2022, *Accuracy and tolerance in design and construction*: https://knowledge.bsigroup.com/products/accuracy-and-tolerance-in-design-and-construction-guide
- BSI, BS 8000-0, *Workmanship on construction sites — Introduction and general principles*: https://knowledge.bsigroup.com/products/workmanship-on-construction-sites-introduction-and-general-principles-1
- ISO 20887:2020, *Design for disassembly and adaptability*: https://www.iso.org/standard/69370.html
- Open Building, principles / support–infill / shearing layers: https://www.openbuilding.co/manifesto
- Brütting et al. / systematic scoping review, *Design for Disassembly: A systematic scoping review and analysis of built structures*, *Sustainable Production and Consumption* 48 (2024): https://doi.org/10.1016/j.spc.2024.05.014
- Dunant et al., *What should an adaptable building look like?*, *Resources, Conservation & Recycling Advances* 18 (2023), 200158: https://doi.org/10.1016/j.rcradv.2023.200158
- *Assessing the upfront carbon cost of structural adaptability*, *Structures* 71 (2025), 108066: https://doi.org/10.1016/j.istruc.2024.108066
- Coburn et al. / related interior-preference work showing coherence, fascination and individual differences: https://doi.org/10.1016/j.jenvp.2021.101668
- Yılmaz, Akkam & Sedes, *Toward evidence-based neuroarchitecture* (2026): https://doi.org/10.3389/fpsyg.2026.1919278

---

## Next gate

**R2 — Pattern / Method Attack.**

R2 must not assume a pattern is legitimate because it is useful in the Reference House. It will test whether the 21 active patterns are genuinely reusable architectural patterns, whether the language is generative rather than catalogic, whether services dominate the ontology, and whether any pattern is merely good specification or an implementation choice wearing a pattern ID.