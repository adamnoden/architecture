# PR-01 R2 — Pattern / Method Attack

**Status:** COMPLETE — diagnostic findings recorded; frozen candidate unchanged  
**Date:** 2026-10-14  
**Programme:** `publication/pr01-adversarial-review-programme.md`  
**Review map:** `publication/pr01-findings-register.md`  
**Frozen candidate content:** `f6b286e883f24b322f41f85d8d3ad796b103a53d`

R2 attacks Part III, all twenty-one active patterns, the three canonical strategies and the four held candidates as a reusable architectural language.

The test is deliberately stricter than usefulness. A proposition can be correct, useful and well evidenced while still belonging as a principle, strategy, rule, specification obligation or implementation family rather than a canonical pattern.

No pattern status, manuscript source, evidence rating or candidate state is changed in R2.

---

## 1. Adversarial baseline: what earns the word “language”

The project’s own authoring contract distinguishes a pattern language from a catalogue by two properties:

1. **relationships** — patterns depend on, complete, compete with or stand in tension with other patterns;
2. **generation** — sequences use those relationships to produce consequential design decisions in a useful order.

That is consistent with the Alexander tradition. Pattern-language descriptions characterise patterns as recurring problem/solution relationships that compose hierarchically, reference other patterns and act generatively; a pattern language is a network whose patterns call upon one another, while a sequence describes the order in which design decisions are made.

The correct R2 question is therefore not “are there enough patterns?” It is:

> **Does the current set behave as a language strongly enough that the term describes its operation rather than its aspiration?**

Pattern count is not a target and R2 does not author missing patterns to make the graph look fuller.

---

# 2. Findings

## PR01-F008 — the current “pattern language” is only strongly generative in service topology

- **Dimension:** `OVERSTATED`
- **Severity:** **S1 — material**
- **Surface:** `P3-00`
- **Claim under attack:** The twenty-one active patterns form a generative architectural language rather than an evidence-qualified catalogue.
- **Strongest fair criticism:** The frozen Part III makes a convincing generative case for one family: utility entry → service hub → vertical distribution → high-service rooms → horizontal routes → boundary/structural crossings → water-failure logic → room routes → stewardship. Outside that service-topology chain, most active patterns stand largely alone. The language model provides `requires`, `completes`, `alternative-to` and `tension-with`, but the active corpus uses the richer relations sparsely; the strong compositional graph is concentrated in the service family. One demonstrated sequence is not yet enough to show that the whole twenty-one-pattern set behaves as a language in the same strong sense.
- **Why it matters:** “Pattern language” is not decorative terminology. Part III explicitly claims generation as the property that separates the work from a catalogue. If most patterns are useful standalone entries but not part of a generative network, the publication overstates the maturity of the layer.
- **Evidence / counterexample:** The project’s own `language-model.md` says relationships and generation are the two additions a language makes over a catalogue. Part III itself presents only the service-topology sequence and explicitly notes that other families enter by their own logic. Alexander-derived pattern-language descriptions emphasise generativity, hierarchical composition and patterns calling upon other patterns.
- **Owner:** pattern language / publication
- **Class:** `MATERIAL ARCHITECTURAL FINDING`
- **Provisional consequence:** R8 should either (a) demonstrate additional **earned** generative relations/sequences among the existing patterns, derived from actual architectural cases rather than graph completion, or (b) narrow the publication claim from a full pattern language to a controlled pattern set/catalogue until that generative structure exists. Do not create patterns or edges merely to defend the name.
- **Disposition:** `OPEN`

### R2 judgement

This is a finding about the **language-level claim**, not a judgement that the individual patterns are poor. Indeed, much of the corpus is stronger because it refuses artificial relationships.

---

## PR01-F009 — the language is substantially a technical/lifecycle language while being presented as the project’s architectural pattern language

- **Dimension:** `INCOMPLETE`
- **Severity:** **S2 — significant**
- **Surface:** `P3-00 / P3-A / P3-B / P3-C / P3-D / P3-E`
- **Claim under attack:** Part III operationalises Ovid’s House broadly enough to function as its architectural pattern language.
- **Strongest fair criticism:** The active corpus is heavily concentrated on service distribution, leakage, maintenance access, technical interfaces, extract routes and stewardship. Those are central to Ovid’s House, but other doctrine-level architectural concerns—spatial hierarchy, room compatibility, passive form, privacy/retreat, repose, daylight/shading relationships and the positive conditions that make permanence worth preserving—do not appear at comparable pattern depth. The result reads more like a **long-life technical/maintenance pattern language** embedded within a wider architectural thesis than a language capable of generating the wider house.
- **Why it matters:** The imbalance can make the project appear to claim that technical maintainability is the architecture rather than one deliberately strong layer within it. It also explains why the one mature generative sequence is service topology.
- **Evidence / counterexample:** Part III’s five fields are service geography, water/failure, openings/movement/attachment, environment/external maintenance and stewardship. The governing principles themselves are broader. G-01 separately owns architectural language/grammar, but Part III does not make sufficiently explicit that its pattern layer is intentionally partial rather than a total house-generating language.
- **Owner:** pattern language / publication
- **Class:** `QUALIFICATION`
- **Provisional consequence:** R8 should decide the intended scope explicitly. The correction may be a narrower claim and clearer division of labour between doctrine, pattern language and grammar—not expansion of the corpus. Only add non-technical patterns if independent recurrence/admission work earns them.
- **Disposition:** `OPEN`

### R2 judgement

A thinner honest technical/lifecycle language is preferable to filling the book with weak “architectural” patterns for balance.

---

## PR01-F010 — at least one active pattern appears to fail the project’s own pattern-versus-rule admission test

- **Dimension:** `INCONSISTENT`
- **Severity:** **S2 — significant**
- **Surface:** `P3-A`, strongest case `HSA-P-005 — Designed Structural Penetration`
- **Claim under attack:** Every active `HSA-P-*` entry resolves a recurring architectural relationship rather than merely encoding a desirable rule/coordination obligation.
- **Strongest fair criticism:** `HSA-P-005 — Designed Structural Penetration` is unquestionably useful, but its invariant is essentially: required crossings should be coordinated in advance, structurally owned, and have applicable boundaries reinstated. That is close to competent interdisciplinary design obligation rather than a generative architectural pattern. Its implementation variation lies mainly in the technical form of the penetration, not in materially different architectural realisations of a recurring spatial relationship. The project’s own admission contract warns that a proposition which effectively says “always do X” is more likely a rule or doctrine proposition.
- **Why it matters:** Keeping correct professional obligations inside the pattern count weakens the distinction between pattern, rule, strategy and competent practice—the exact distinction Part III asks the reader to trust.
- **Evidence / counterexample:** `language-model.md` requires relationship, variation, composition and a recurring physical response, and distinguishes rules/obligations as checkable propositions. `HSA-P-005` itself says movement/fire-stopping/structural-opening coordination is ordinary professional practice and that formal consequences such as permissible opening geometry/boundary roles are strong candidates for rules.
- **Owner:** pattern language
- **Class:** `MATERIAL ARCHITECTURAL FINDING`
- **Provisional consequence:** R8 should rerun the admission test on `HSA-P-005` without presuming its active status. If the recurring architectural relationship cannot be stated more strongly than “coordinate the penetration properly”, retire/reclassify the pattern while preserving its content as obligations under service-route/interface patterns. No new ID should be invented merely to preserve count.
- **Disposition:** `OPEN`

### Secondary challengers, not yet findings

`HSA-P-010 — Source-Capture Kitchen Extract`, `HSA-P-021 — Source-Capture Bathroom Extract` and `HSA-P-012 — Physical Service Index` were also challenged as possible specification/operational advice. They survive R2 provisionally:

- kitchen and bathroom extract have materially different pollutant/moisture, geometry, transfer-air, grease/condensate and occupation forces, and each creates architectural route/terminal relationships;
- the Physical Service Index defines a physical asset/steward relationship and is explicitly `proposed`, with limited scope.

R4/R5 may still reopen them.

---

## PR01-F011 — stable HSA identifiers carry unnecessary publication weight

- **Dimension:** `UNMEMORABLE`
- **Severity:** **S3 — minor**
- **Surface:** `P3-00` and all Part III pattern entries
- **Claim under attack:** Displaying stable `HSA-P-*` IDs prominently alongside every pattern improves the reader-facing language without material cost.
- **Strongest fair criticism:** The stable IDs are useful repository/provenance identities but are legacy systems notation from an earlier project name. In a book whose strongest concepts work through ordinary architectural language, repeated `HSA-P-014`, `HSA-P-022` etc. can make Part III read like a standards manual or software schema. The publication already tells the reader that the numbers encode neither sequence, importance nor maturity, which is evidence that their primary value is internal stability rather than architectural meaning.
- **Why it matters:** The pattern names are the memorable transmission units. Administrative identity should not compete with them visually or rhetorically in the private critical object.
- **Evidence / counterexample:** Stable IDs remain necessary for provenance and internal cross-reference, but Part III already separates identity from meaning. Alexander-style pattern names function as the primary compositional vocabulary rather than opaque numbers.
- **Owner:** publication / pattern language
- **Class:** `PUBLICATION DEFECT`
- **Provisional consequence:** In R8, retain IDs durably in metadata/index/cross-reference but test demoting them typographically or omitting them from primary running titles. Do not renumber or break stable identity.
- **Disposition:** `OPEN`

---

# 3. Attacks that did not earn findings

## R2-RJ01 — “P003 horizontal, P014 vertical and P015 room service routes are one duplicated pattern”

**Rejected.**

They share a family but resolve different forces and scales. Vertical service concentration interacts strongly with stack continuity, storey boundaries and fire/acoustic transmission; horizontal routes negotiate falls, branch topology and circulation/section; room routes negotiate visual integration, ordinary fixing and local service classes. Their separation is conceptually defensible.

## R2-RJ02 — “Window and door replacement patterns should be merged”

**Rejected.**

Both use enduring-opening/replaceable-assembly logic, but doors carry materially different repeated-impact, privacy, security, fire, accessibility and threshold forces. The split survives the admission test better than an abstract combined opening pattern would.

## R2-RJ03 — “Kitchen and bathroom source-capture extract are duplicates”

**Rejected provisionally.**

Current England ventilation guidance treats kitchens and bathrooms as distinct extract conditions, and the actual design forces differ: cooking plume capture, grease and replacement air are not the same problem as short-duration moisture, transfer air and condensate. The deeper R2 concern is whether either belongs as a pattern at all; on the current pages, both still meet enough of the project’s spatial/relationship test to remain active pending later attacks.

## R2-RJ04 — “The strategy layer is incoherent and should be abolished”

**Rejected.**

The three strategies are broad precisely because materially different physical patterns/implementation families can satisfy them. `Fail-Safe Water Distribution` demonstrates the distinction especially well: the retired monolithic water pattern was decomposed into one strategy plus narrower physical patterns. `Decompose Structural Interface Functions` is explicitly analytical, and the floor strategy deliberately refuses to promote a removable floor system. The layer is heterogeneous in subject but coherent in abstraction.

## R2-RJ05 — “Held candidates are indecision disguised as rigour”

**Rejected.**

The four held propositions have unusually explicit admission gates and strong conventional comparators. `Replaceable Architectural Lining` must beat first-rate plaster/drylining on solidity and whole-life value; manifold distribution must prove architectural value rather than merely technical maturity; Local Deep Service Zone admits it may be ordinary coordination; Selective Floor Access must beat conventional local access/inaccessible layered construction. This is one of the language’s strongest controls against self-expansion.

---

# 4. Pattern-by-pattern R2 disposition

R2 does **not** change status. This table records diagnostic pressure only.

| Pattern | R2 diagnostic disposition |
|---|---|
| HSA-P-001 Controlled Utility Entry | survives as building-scale relationship |
| HSA-P-002 Plant Room as Service Hub | survives; strong spatial forces / variants |
| HSA-P-014 Accessible Vertical Service Zone | survives; explicit non-applicability in small/simple cases |
| HSA-P-003 Coherent Horizontal Service Route | survives; not one literal spine |
| HSA-P-015 Accessible Room Service Route | survives provisionally; architecture/detail boundary remains worth later testing |
| HSA-P-004 High-Service-Room Service Wall | survives; recurring room-scale spatial relationship |
| HSA-P-005 Designed Structural Penetration | **challenged by PR01-F010** |
| HSA-P-016 Compartmented Service Void | survives; continuous-service / discontinuous-void relationship is distinct |
| HSA-P-017 Visible Leakage Path | survives as selective passive failure relationship |
| HSA-P-018 Failure-Tolerant Wet Service Room | survives; room-scale response with multiple implementations |
| HSA-P-009 Accessible Rainwater Route | survives; envelope + failure + maintenance relationship |
| HSA-P-007 Permanent Opening / Replaceable Window | survives; bounded by interface/building-physics proof |
| HSA-P-019 Permanent Opening / Replaceable Door | survives separately from window |
| HSA-P-020 Designed Threshold | survives provisionally; conventionality alone does not disqualify a pattern |
| HSA-P-008 Movement / Slip Junction | survives; recurring movement relationship with variants |
| HSA-P-022 Controlled Attachment Plane | survives; strong intermediate-layer relationship and explicit proportionality |
| HSA-P-010 Source-Capture Kitchen Extract | survives provisionally; not novel, but spatially/operationally patterned |
| HSA-P-021 Source-Capture Bathroom Extract | survives provisionally; distinct forces from kitchen extract |
| HSA-P-011 Roof Maintenance Route | survives; route/task/access relationship and temporary-vs-permanent variants |
| HSA-P-013 Ground-Supported Façade Access | survives strongly as site/building maintenance geography |
| HSA-P-012 Physical Service Index | survives provisionally at proposed evidence; stewardship-scale physical relation |

No active pattern is demoted in R2 because R0–R7 are diagnostic.

---

# 5. R2 result

R2 adds **four open findings**:

| Finding | Severity | Core issue |
|---|---:|---|
| PR01-F008 | S1 | “pattern language” generativity is demonstrated mainly in service topology |
| PR01-F009 | S2 | pattern corpus is technically/lifecycle weighted relative to the wider architectural thesis |
| PR01-F010 | S2 | HSA-P-005 may be a rule/obligation rather than a canonical pattern |
| PR01-F011 | S3 | legacy HSA IDs carry too much reader-facing weight |

There is no S0 finding. The pattern corpus is substantially stronger than a checklist of favourite details: many entries contain real context, forces, variants, boundary debt, proportionality and explicit failure modes. The held-candidate and strategy distinctions also survive attack.

The serious issue is the **language-level claim**. The project should not preserve the title “pattern language” by manufacturing relations. R8 must either reveal additional genuine generative structure already latent in the architecture or tell the truth about a narrower pattern-set status.

These findings remain `OPEN`. R3–R6 may strengthen, merge, narrow or reject them before R7 freezes the register.

---

# 6. External adversarial evidence used in R2

- Christopher Alexander / PatternLanguage.com, description of a pattern language as a network of patterns which call upon one another, and sequences as ordered design recipes: https://www.patternlanguage.com/aims/intro.html
- PatternLanguage.com, Alexander introduction discussing pattern encapsulation, generativity and composability: https://www.patternlanguage.com/bios/douglea.htm
- England Approved Document F, current statutory ventilation guidance landing page: https://www.gov.uk/government/publications/approved-document-f-2026
- Earlier Approved Document F Volume 1 detail, used only to confirm the longstanding distinction between kitchen and bathroom extract conditions: https://www.gov.uk/government/publications/ventilation-approved-document-f

---

## Next gate

**R3 — Reference House Attack.**

R3 must now test whether the worked house genuinely accepts the costs of the doctrine or whether its detached courtyard morphology, area and architectural grammar quietly make the propositions easier to satisfy. The house is not allowed to prove a pattern merely by containing it, and a technically rescuable detail is not allowed to hide a deeper plan/morphology problem.