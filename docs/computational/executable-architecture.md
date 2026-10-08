# Executable Architecture — Computational Expression of House Systems Architecture

**Status:** conceptual foundation; core semantic mechanisms exercised by P0 and `PAT-XW-01`, not a product specification  
**Purpose:** define the computational proposition, its proof boundary and its relationship to the architectural project  
**Scope:** conceptual architecture. P0 is a minimal executable falsification kernel; no general CAD system, solver, regulations engine or product architecture is established here.

> **The program should compile a habitat.**

## 1. The proposition

House Systems Architecture already has several human-readable layers: doctrine, strategies, patterns, reference implementations, delivery requirements and tests. A computational expression adds another layer, but only for the subset that can be formalised honestly.

The intuitive model is “draw a house, then run checks”. The stronger proposal reverses that order.

The user works with meaningful architectural objects and relationships inside a deliberately bounded system. A wall is not merely geometry: it may know that it is load-bearing, forms part of several environmental boundaries, contains openings, supports a floor and permits only controlled service penetrations. A window knows that it crosses those layers. A maintenance route knows that a person and replacement component need real space to move through it.

Compilation derives the consequences of those relationships and asks whether the resulting obligations have been discharged.

Within its supported domain, a release-grade compile should therefore mean something stronger than “the geometry is drawable”:

> **The required relationships, supported structural conditions and selected compliance obligations are either discharged by the system or backed by explicit evidence within a declared proof boundary.**

The phrase **supported domain** matters more than the slogan. Stronger guarantees are possible because the system refuses to claim competence over arbitrary architecture.

## 2. Relationship to the architectural doctrine

Executable architecture is **not a governing principle** and does not replace the architectural project. The doctrine remains meaningful if no software is ever written.

The architectural chain is:

```text
Doctrine
   ↓
Strategy
   ↓
Pattern
   ↓
Reference implementation
   ↓
Delivery requirement
   ↓
Test
```

The computational chain is:

```text
Architectural / project intent
   ↓
Formal architectural model
   ↓
Semantic relationships + invariants
   ↓
Derived obligations
   ↓
Evidence / determination
   ↓
Validity + diagnostics
```

The core intellectual task is to formalise enough architectural meaning that important propositions can be represented and tested without pretending that geometry is the whole building.

The architect-facing implementation brief remains the human translation from HSA into a commission. Computational work may formalise part of that translation; it does not supersede architectural authorship, competent technical design or statutory process.

## 3. Compiler rather than checker

Conventional digital workflows allow a great deal of source geometry and then analyse structure, energy, code, quantities and coordination downstream. That is useful, but the source model can still encode nonsense.

The compiler proposal is closer to **correct-by-construction authoring**. Some invalid states should be impossible to express; others should fail compilation with an intelligible reason.

Move a wall 400 mm and the consequence is not merely a translated surface. The move may change room proportion, an elevation bay, floor span, beam bearing, stair clearance, service route, boundary, quantity and maintenance path.

A useful diagnostic might be:

```text
Cannot move Wall W17 +400 mm.

Failed obligations:
- structural bay S4 exceeds supported span for assembly F02;
- stair landing clearance falls below target rule M.STAIR.014;
- west elevation leaves grammar range G.WEST.BAY.03.

Maximum valid movement under current configuration: +265 mm.
```

The software analogy is type safety. A short-lived service should not attach to a forbidden permanent zone without an explicit interface. A removable lining should not silently carry a boundary required to survive its removal. A load-bearing opening should not exist without support obligations.

When the system can identify such relationships, invalidity becomes a compile error instead of latent design debt.

## 4. Semantic building primitives

The system should operate on **semantic building primitives**, not generic meshes.

An illustrative wall record might be:

```text
ExternalWall
  role: load-bearing
  construction-family: masonry-cavity-01
  supported-by: foundation-F03
  supports: upper-floor-F17
  exposure: west
  openings: [W12, W13]
  boundaries: [thermal-envelope, air-boundary]
  service-policy: controlled-penetrations-only
```

This is not proposed syntax. It shows the level of meaning required.

A room should know that it is a room. A structural member should participate in a load path rather than merely occupy space. Geometry remains essential, but it is one representation of the building rather than the definition of the building.

## 5. Authoring experience and product form

The long-term interface ambition is simple to state: **move complexity into the system rather than demanding it from every author**.

A provocative test remains useful: could someone comfortable manipulating a house in *The Sims* explore the design without first learning BIM, structural analysis and every dimensional rule? This does not make that user legally competent. It describes the desired division of labour between interface and system.

A user might add or resize a room, move an opening, add a bay, change roof family or storey height, or choose among supported construction families. The system derives consequences where it has authority and exposes unresolved obligations where it does not.

If developed as a product, the conceptual stack is:

**interactive authoring environment + semantic building model + compiler + versioned targets/rule packs + evidence/production outputs.**

The 3D model is one view and one artefact, not the product itself. No decision is made here about web/desktop delivery, modelling kernel, implementation language, storage model or commercial form.

## 6. Architectural grammar without pretending to prove beauty

The system is intentionally opinionated. It may encode a declared architectural grammar governing relationships among rooms, heights, openings, axes, bays, circulation, hierarchy and façade composition.

Three rule classes should remain distinct.

### Hard invariants

Conditions required for compilation within the supported domain: load-path continuity, clearances, boundary continuity, supported span ranges, non-negotiable regulatory conditions and project constraints the system explicitly claims to enforce.

### Grammar constraints

Conditions required by a selected architectural language: room proportion ranges, storey-height relationships, bay rhythms, opening families, alignments and hierarchy.

These are architectural commitments, not laws of nature. Another grammar may choose differently.

### Objectives and preferences

Conditions that can be ranked or warned about without becoming binary truth: daylight quality, circulation efficiency, symmetry, economy, material use, maintenance effort, views or degree of proportional fit.

The system may be opinionated. It must not disguise taste as structure, regulation or evidence.

## 7. Structural semantics and the supported envelope

Structure belongs in the semantic model rather than appearing only as a late check.

At minimum, load-bearing objects participate in an explicit graph:

```text
roof
  ↓
rafter / truss
  ↓
beam / bearing wall
  ↓
wall / column
  ↓
foundation
  ↓
ground
```

An unresolved load path is a compile failure.

The system need not solve arbitrary structural engineering. A more credible approach is a closed library of supported systems and parameter ranges backed by declared calculation methods, engineering evidence and tests.

Outside that envelope, the correct result is:

```text
OUTSIDE SUPPORTED DOMAIN
External structural proof required.
```

Unsupported is not invalid. It is also not proven.

## 8. Compiler targets

A house never compiles against “the Building Regulations” in the abstract. Compilation is relative to an explicit, versioned **target**.

A target may bind:

- jurisdiction;
- regulatory date / transition regime;
- building category and use;
- selected compliance routes;
- referenced standards and national parameters.

The supported domain, architectural grammar and project configuration remain separate inputs. They can all affect a compile without acquiring the same authority.

The first jurisdictional research target is **England**, not “the UK”. The four UK nations have distinct regulatory systems. Any implemented target should narrow further to a declared building type, technical family and project basis.

Restriction is how the system earns stronger claims.

### Keep normative sources distinct

A target must distinguish:

1. **legal requirements** — applicable law and Building Regulations;
2. **statutory guidance / accepted compliance routes** — for example Approved Documents;
3. **technical standards** — British Standards, adopted European standards, Eurocodes and National Annexes where applicable;
4. **product evidence** — declarations, certification, manufacturer data and tested systems;
5. **project requirements** — client or HSA-derived commitments.

Approved Documents are not the legal requirements themselves. A compiler must say which compliance route it implements rather than silently treating guidance as law.

Standards also create licensing and provenance issues. An executable standards layer cannot simply copy copyrighted text into the repository.

## 9. Compilation as obligation discharge

The central computational model is an **obligation graph**.

An opening might create:

```text
opening W12
  ├─ architectural grammar obligation
  ├─ structural support obligation
  ├─ thermal continuity obligation
  ├─ water-management obligation
  ├─ ventilation consequence
  ├─ quantity/material consequence
  └─ replacement/access obligation
```

An obligation may be discharged by a deterministic rule, calculation, geometry query, tested library assembly, product evidence or accepted external professional evidence.

If it cannot be discharged, it remains visible. The system fails closed rather than translating uncertainty into a green tick.

A mature result should distinguish:

- **passed** — resolved within supported system authority;
- **externally discharged** — resolved by scoped evidence outside native authority;
- **warning / preference deviation** — valid but outside a preferred condition;
- **failed** — known applicable requirement violated;
- **unsupported / unresolved** — the system cannot establish the condition.

A release-grade compile contains no hidden unresolved obligations.

## 10. Evidence and outputs

The output is not merely geometry. Another person should be able to inspect **why** the system considers the design resolved.

Potential outputs include:

- coordinated semantic model;
- 3D geometry and open exchange formats such as IFC where useful;
- plans, sections, elevations and details;
- structural calculations and load-path records;
- compliance matrix and rule-by-rule evidence trace;
- assumptions and source-version registers;
- boundary and interface registers;
- tolerance/workmanship requirements;
- quantity take-off, material schedules and cost-plan inputs;
- embodied-carbon quantities where datasets permit;
- component/product schedules;
- assembly, inspection, maintenance and replacement information;
- handover/building-record data;
- machine-readable compilation manifest.

A manifest should eventually identify source-model version or hash, compiler and target versions, rule packs, datasets, warnings, external evidence and generated artefacts.

The useful outcome is a reproducible building release, not an unexplained pass badge.

## 11. Proof boundary

Compilation can prove propositions about **the model, under declared assumptions, inside the supported domain**. It cannot prove that the physical building matches the model simply because the model compiled.

Ground conditions, substitutions, workmanship, installation quality, concealed changes, construction damage, commissioning results and later alteration may remain external facts.

```text
DESIGN CONFORMANCE
      │
      │ compiler + evidence
      ▼
RESOLVED DIGITAL BUILDING
      │
      │ procurement + construction + inspection + commissioning
      ▼
PHYSICAL CONFORMANCE
```

Construction records, inspection, testing and commissioning establish whether reality corresponds sufficiently to the resolved design. Building control and professional responsibility remain real-world processes.

The opportunity is not to compile them away, but to give them a more explicit and traceable evidence base.

## 12. Mapping the doctrine into computation

Many HSA principles concern relationships that are plausible candidates for formalisation.

| Architectural doctrine | Possible computational expression |
|---|---|
| Build for time | lifecycle state and future-change scenarios are part of the model |
| Preserve permanent fabric | attachment and penetration rules distinguish lifespan layers |
| Design the interface | interfaces become explicit typed relationships |
| Failure architecture | failure paths and consequence zones become checkable obligations |
| Maintenance geography | approach, working and withdrawal volumes become spatial constraints |
| Ordinary parts in extraordinary arrangements | finite standard libraries and stable interfaces |
| Let permanence be architectural | permanent spatial order becomes a first-class constraint |
| Passive architecture does the first work | passive strategies precede active-system elaboration |
| Legibility across generations | compiled records preserve semantic intent and provenance |
| Resolve technology as architecture | technical elements remain subject to architectural resolution |

Workmanship robustness maps similarly: incoming tolerance becomes data; controlling datums become relationships; adjustment ranges and remediation thresholds become constraints; inspection points become explicit requirements.

This compatibility is a research opportunity, not proof that every doctrine proposition should become machine-enforceable.

## 13. Patterns as authoring provenance

The Phase-8 crosswalk tested whether the canonical pattern language required a pattern ontology or pattern-specific compiler. It did not.

A selected pattern may explain **why** a project requirement exists and may group a useful report over source facts and obligations. It does not replace those facts, emit a duplicate technical checklist or acquire technical authority merely by being selected.

The useful chain is:

```text
selected architectural intent
        ↓
project requirement / provenance
        ↓
ordinary source-model entities + relationships
        ↓
shared derived graphs
        ↓
canonical obligations
        ↓
evidence / determination
        ↓
validity + diagnostics
```

There is deliberately no universal whole-pattern machine `PASS`. Formal project commitments, induced technical obligations and architectural judgement remain separate. `PAT-XW-01` exercised that separation in software for `HSA-P-003` and `HSA-P-005` without adding a core pattern entity.

See [Architectural Pattern → Computational Crosswalk](pattern-crosswalk-model.md) and [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md).

## 14. Closed world by design

A trustworthy compiler should **not** support arbitrary architecture by default.

A bounded language may support only a handful of house topologies, one jurisdiction, finite structural/span families, tested wall/floor/roof assemblies, known opening types, explicit service strategies, limited architectural grammars and predefined interfaces.

Outside that language the legitimate options are to choose another supported solution, introduce external evidence, extend the language after research or leave the system.

Unsupported ideas should never acquire confidence merely because the software can draw them.

## 15. A versionable building

The same semantic source can outlive first construction.

A future alteration could expose which permanent fabric, interfaces, boundaries and structural relationships change; which target applies; which components become obsolete; and what new evidence is required.

The building record then becomes more than a set of drawings. It retains a versioned account of **what the building is and why**.

## 16. Trust architecture

If the system makes safety or compliance claims, its own behaviour must be inspectable.

Prefer deterministic checks for hard obligations, explicit provenance, versioned targets and datasets, conformance tests, inspectable calculations, audit logs, stable identifiers, declared assumptions, visible external proof obligations and open exchange formats where practical.

AI may help interpret intent, suggest arrangements, explain failures, navigate standards or generate alternatives. It should not become an opaque authority whose assertion is treated as structural or regulatory proof.

The pass/fail path must remain auditable.

## 17. Prior art and the actual research question

Computational design, BIM semantics and automated compliance checking are not new. Relevant directions include IFC/openBIM, IDS, rule-based BIM compliance and generative design, platforms such as Hypar, and increasingly structured digital building-control processes.

The project should therefore make no novelty claim without a serious prior-art review.

Its narrower research question is:

> **Can an architecturally opinionated, deliberately bounded domestic design language unify spatial grammar, tectonics, long-life doctrine, structure, selected regulatory obligations, quantities and evidence strongly enough that compilation produces a genuinely buildable house rather than merely a plausible model?**

## 18. Anti-drift rules

The following interpretations are rejected.

- **“This is just BIM.”** BIM may be an interchange/output technology; the proposition is semantic constraint and compilation from a controlled architectural language.
- **“This is generative AI for houses.”** Generation may assist exploration; validity comes from explicit constraints, calculations and evidence.
- **“The compiler replaces architects and engineers.”** It formalises repeatable knowledge. Competent judgement remains necessary outside the supported domain and wherever professional responsibility requires it.
- **“A green compile means building-control approval.”** Compilation can assemble evidence against a target; statutory approval remains a legal process.
- **“Approved Documents are the Building Regulations.”** The target must preserve the distinction between legal requirement and compliance route.
- **“Beauty can be reduced to equations.”** The system can implement a declared grammar; it should not pretend to prove beauty.
- **“Any geometry should be supported.”** The closed domain is what makes strong guarantees plausible.
- **“Unsupported means probably fine.”** Unsupported produces an explicit proof obligation or failure.
- **“The 3D model is the product.”** The product is the semantic building plus production information and evidence.
- **“P0 success authorises general compiler growth.”** P0 falsified a small core mechanism. It did not earn CAD, solver, regulatory or product expansion.

## 19. Current authority and companion documents

For present computational status, start with:

- [Computational Track index](README.md);
- [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md) — current executable authority;
- [Formal Architectural Model](formal-architectural-model.md) — entities and relationships;
- [Validity and Obligations](validity-and-obligations.md) — status and obligation semantics;
- [Evidence and Provenance Architecture](evidence-and-provenance.md) — evidence scope and invalidation;
- [Compiler Targets](compiler-targets.md) — versioned normative environments;
- [Supported Domain](supported-domain.md) — bounded competence;
- [Architectural Grammar and Proportion](architectural-grammar-and-proportion.md) — design-language model;
- [Architectural Pattern → Computational Crosswalk](pattern-crosswalk-model.md) — pattern-authoring boundary;
- [Prior Art Map](prior-art-map.md) — reconnaissance and unanswered questions.

Paper-compilation runs and research-programme versions remain research provenance. They do not outrank the executable gate result.

## 20. Research sequence and stop rule

The research sequence progressed through prior art, supported-domain definition, semantic/obligation/evidence modelling, S0→S1→S2→H1 paper compilation, Phase-8 crosswalk, P0 and `PAT-XW-01`.

P0 reached the first useful software milestone: a small but real semantic model in which invalid source relationships, obligation changes and evidence-scope failures produce deterministic, intelligible results.

That is enough to stop generic expansion. The next executable fixture must be selected by a real unresolved architectural, physical or professional-review question. Candidate fixtures are recorded in the [Computational Track index](README.md); they are not a standing automation backlog.

## 21. Repository position

This document remains the canonical statement of the computational concept. It is not a governing principle or numbered manuscript part.

Whether executable architecture eventually belongs in the monograph, a companion research volume, a software/product specification or some combination should be decided only after external review, physical evidence and further earned executable work justify it.

The architectural project remains primary.

---

## Initial reference points

Starting points for later research, not an exhaustive literature review:

- buildingSMART International, **Industry Foundation Classes (IFC)** and openBIM standards: https://www.buildingsmart.org/standards/
- buildingSMART International, **Information Delivery Specification (IDS)**: https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/
- Christoph Sydora and Eleni Stroulia, **Rule-based compliance checking and generative design for building interiors using BIM**, *Automation in Construction* 120 (2020), 103368: https://doi.org/10.1016/j.autcon.2020.103368
- Hypar, **Documentation / computational building planning platform**: https://docs.hypar.io/
- UK Government, **Approved Documents — Building Regulations guidance for England**: https://www.gov.uk/government/collections/approved-documents
- UK Government, **Preparing information for a building control approval application**: https://www.gov.uk/guidance/preparing-information-for-a-building-control-approval-application
- BSI, **Intellectual property in standards**: https://standardsdevelopment.bsigroup.com/home/IntellectualProperty