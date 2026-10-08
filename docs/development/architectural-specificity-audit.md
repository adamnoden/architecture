# Architectural Specificity Audit — Programme Control

**Status:** planned; no repo-wide migration authorised yet  
**Purpose:** audit House Systems Architecture for architectural, morphological and construction assumptions that have migrated beyond the layer that legitimately owns them, then correct those dependencies without stripping useful specificity from G-01, the Reference House, implementation families or research.

This document controls the work. The governing placement rule is [Architectural Specificity Boundary](architectural-specificity-boundary.md).

## 1. Objective

The objective is not to remove Georgian architecture from the project.

It is to make every architectural opinion answer to the correct authority.

House Systems Architecture should remain strongly opinionated about the long life of a house: permanence, change, interfaces, maintenance, failure, workmanship, repose, passive-first environmental design and architectural resolution of technology. It should not silently require one historical style, one house morphology or one construction family merely because the Reference House does.

The target dependency is:

```text
HSA doctrine
    ↓
strategies / pattern language
    ↓
computational semantics + supported technical domain
    ↓
selected architectural grammar
    ↓
project + site configuration
    ↓
implementation families / details
    ↓
Reference House occurrence
```

This is a scope hierarchy, not a rigid chronological design sequence.

## 2. What counts as contamination

Contamination is a dependency error, not the presence of a particular word.

Examples:

- **explicit stylistic leakage** — Georgian, Palladian or classical requirements presented as HSA doctrine;
- **compositional leakage** — symmetry, axiality, hierarchical façades, vertically proportioned openings or classical room rank treated as universal architectural quality;
- **morphological leakage** — courtyard, detached form, two storeys, central hall, compact rectangular plan or particular garden relationship treated as generally required;
- **construction leakage** — cavity masonry, red brick, dense inner leaf, timber joists or pitched roof treated as doctrine rather than implementation/domain scope;
- **tectonic leakage** — cornice, skirting, picture rail, brass/bronze or traditional joinery treated as the only legitimate expression of an otherwise general interface principle;
- **programme/social leakage** — inherited principal/secondary room relationships or historical domestic hierarchies treated as universal household organisation;
- **evidence leakage** — a Reference House aesthetic success used as evidence for a general pattern, or a G-01 precedent used to establish a style-neutral principle without independent justification;
- **compiler leakage** — one grammar or project fixture silently becoming the default semantics of architectural validity.

The opposite error also matters: do not erase legitimate specificity merely to make a document look neutral.

## 3. Scope classes

Audit claims using the smallest class that legitimately owns them.

### A — HSA general

Expected to survive materially different architectural languages, sites and implementation families.

Examples: maintenance geography, lifespan separation, designed interfaces, failure containment, proportional serviceability, passive-first hierarchy.

### B — reusable but scoped

A strategy or pattern that recurs across projects but has an explicit context, building type or technical condition.

### C — supported technical domain

A competence boundary for analysis or compilation. A cavity-masonry wall or simple pitched roof may belong here without becoming an architectural value.

### D — architectural grammar

A selected design language. G-01 may legitimately constrain Georgian-derived hierarchy, proportion, ordering, element families and composition.

### E — project / site

A Reference House decision: courtyard morphology, chosen massing, orientation response, room programme, selected grammar, local dialect.

### F — implementation / prototype

A particular assembly, product family, material or detail used to realise a higher-level proposition.

### G — research / precedent / provenance

Material retained to investigate, evidence or explain a proposition without itself becoming a requirement. Frozen source documents and development history may preserve superseded assumptions.

## 4. Claim dispositions

Each suspect claim receives one disposition.

- **KEEP** — already at the correct scope.
- **GENERALISE** — preserve the underlying reason upstream; remove the accidental stylistic/project implementation from the general statement.
- **SCOPE** — retain the claim but make its grammar/domain/project authority explicit.
- **MOVE** — relocate the proposition to the layer that owns it.
- **SPLIT** — separate a general proposition from a grammar/project-specific expression or acceptance criterion.
- **ARCHIVE** — retain only as provenance; do not rewrite history to resemble the current architecture.
- **REJECT** — remove an unsupported assumption that survives neither generalisation nor legitimate downstream scoping.

A keyword occurrence is not itself a claim and receives no disposition until read in context.

## 5. Audit ledger

The durable audit artefact will be a claim-level ledger, not a giant rewrite diff.

For every material finding record:

| Field | Meaning |
|---|---|
| document | source path |
| location | heading / identifiable passage |
| current claim | concise statement of what the text currently implies |
| current authority | where the document/claim presently sits |
| suspected proper scope | A–G |
| contamination type | style / composition / morphology / construction / tectonic / programme / evidence / compiler |
| disposition | KEEP / GENERALISE / SCOPE / MOVE / SPLIT / ARCHIVE / REJECT |
| destination | target document/layer if moving or splitting |
| reason | why the dependency is or is not valid |
| status | open / changed / verified |

Do not introduce claim metadata into every Markdown document. The ledger is an audit instrument, not a second ontology.

## 6. Phase 0 — freeze and baseline

**Goal:** establish what is canonical before judging it.

Tasks:

1. snapshot the active repository tree and current project status;
2. classify document families as canonical, scoped-current, research, development or provenance;
3. record the existing dependency rule from `architectural-specificity-boundary.md`;
4. explicitly exclude frozen source/history from cosmetic rewriting;
5. establish the audit ledger and issue vocabulary above.

**Gate 0:** every active document family has a known role; no rewriting begins while canonicality is ambiguous.

## 7. Phase 1 — upstream purity audit

**Target:** the material with the greatest authority.

Review in order:

1. root `README.md`;
2. `docs/manuscript/governing-principles.md`;
3. current publication architecture and manuscript Parts I/II/V;
4. pattern-language authoring contract;
5. all 21 active canonical patterns and three strategies;
6. held candidates where they might be mistaken for general HSA direction.

Method:

- line-by-line claim review, not search-and-replace;
- test every architectural-value statement against a materially different style;
- distinguish examples from requirements;
- challenge latent assumptions even when no historical style is named;
- preserve examples where they clarify a general principle and are labelled as examples.

Questions:

- would HSA still defend this claim in a contemporary, Arts and Crafts, Mediterranean vernacular or Japanese-derived house?
- if not, is it a pattern with a legitimate explicit context, or has it leaked too far upstream?
- is a material or form presented as an architectural value when the actual value is durability, legibility, tolerance, repairability or repose?

**Gate 1:** no general doctrine/pattern requirement depends on G-01, Reference House morphology or an implementation family unless its scope says so.

## 8. Phase 2 — computational authority audit

**Target:** prevent computational convenience from becoming architecture by accident.

Review:

- formal architectural model;
- validity/obligation model;
- grammar framework;
- G-01 research corpus and candidate rules;
- supported domain / H1;
- structural, boundary, service, roof, opening, heating, ventilation, wet-room and fire families;
- paper fixtures and executable fixtures where project geometry may masquerade as general semantics;
- diagnostics and compiler language.

Tests:

1. **semantic neutrality** — core entities/relationships must not require G-01 concepts merely to represent a house;
2. **domain honesty** — technical-family restrictions must report `unsupported`, not `bad architecture`;
3. **grammar honesty** — G-01 failure means “not a member of G-01”, not architectural invalidity in general;
4. **fixture honesty** — Reference House or G-01 fixtures prove the machinery can represent those cases, not that those cases are canonical architecture;
5. **evidence authority** — corpus frequency and historical precedent do not create HSA obligations.

**Gate 2:** doctrine, technical validity, grammar validity and project validity remain independently reportable.

## 9. Phase 3 — implementation, prototype and evidence audit

**Target:** separate general system evidence from Reference House fit.

This is likely to contain subtle contamination because one physical prototype may answer two different questions.

Example:

```text
GENERAL QUESTION
Can a replaceable lining achieve excellent domestic solidity, durability,
installer robustness and reversible access?

REFERENCE HOUSE QUESTION
Can this particular implementation also belong convincingly in the
selected Georgian-derived architectural language?
```

Both questions are legitimate. Their evidence must not be pooled without labels.

Review:

- prototype programme;
- W2 wall-bay build pack and evidence protocol;
- floor/interface prototypes;
- research implementation families;
- product-evidence trials;
- delivery requirements derived from experimental systems.

For each experiment identify:

- **general acceptance criteria** required for pattern/strategy promotion;
- **grammar/project acceptance criteria** required only for Reference House selection;
- **technical evidence** that can travel between styles;
- **architectural judgement** that cannot be generalised from one target language.

**Gate 3:** no pattern or general implementation-family promotion relies on a Georgian-specific aesthetic success criterion; project-specific acceptance remains available for the Reference House.

## 10. Phase 4 — Reference House and G-01 audit

**Target:** make downstream specificity stronger, not weaker.

Do not neutralise these documents.

Instead:

- make G-01 constraints more explicit where they are currently implicit;
- identify Reference House choices that are **G-01**, **project morphology**, **site response**, **technical-domain choice** or **tectonic dialect**;
- stop project choices leaking back into the definition of G-01;
- stop G-01 from absorbing courtyard/Andalusian or HSA tectonic features merely because the Reference House combines them;
- record deviations/extensions rather than stretching the base grammar until every Reference House choice appears canonical.

A useful conceptual composition is:

```text
HSA doctrine
+ supported technical families
+ G-01 grammar
+ Reference House site/programme
+ project morphology
+ tectonic dialect
= Reference House
```

**Gate 4:** the Reference House can remain unmistakably specific while every major constraint has a named source of authority.

## 11. Phase 5 — cross-layer repair

Only after Phases 1–4 produce a complete ledger should repo-wide edits begin.

Repair order:

1. establish missing downstream homes before deleting upstream specificity;
2. correct the highest-authority statement first;
3. update dependent pattern/computational language;
4. split mixed prototype acceptance criteria;
5. strengthen scope statements in G-01 / Reference House / implementation records;
6. repair links and publication navigation;
7. update examples only where the old example now misstates authority;
8. leave provenance/history intact and link to the new canonical location where useful.

Prefer small coherent commits by dependency boundary over one enormous lexical rewrite.

**Gate 5:** every ledger item is changed or deliberately KEEP/ARCHIVE, and no moved concept has been lost.

## 12. Phase 6 — adversarial verification

Run the repository against deliberately different hypothetical houses.

### Test A — materially different architectural language

Ask whether an HSA house using, for example, an Arts and Crafts or restrained contemporary grammar can satisfy all general doctrine/pattern requirements without pretending to be G-01.

### Test B — materially different technical family

Ask whether HSA remains conceptually valid if the house is not cavity masonry or does not use the H1 roof/floor families, while correctly falling outside current compiler support where applicable.

### Test C — Reference House specificity

Ask whether removing Georgian-derived language from the Reference House would materially change the house. It should. If it would not, the downstream grammar is too weak.

### Test D — authority diagnostics

For representative failures confirm that the project can distinguish:

```text
HSA DOCTRINE          PASS / FAIL
PATTERN COMMITMENT    PASS / FAIL
SUPPORTED DOMAIN      SUPPORTED / EXTERNAL / UNSUPPORTED
TECHNICAL VALIDITY    PASS / FAIL / UNRESOLVED
GRAMMAR G-01          PASS / FAIL / DEVIATION
PROJECT REQUIREMENT   PASS / FAIL
```

**Gate 6:** a second architectural language can use the same general HSA and grammar framework without special pleading, while G-01 remains strongly opinionated.

## 13. Phase 7 — publication and status reconciliation

After verification:

- update `STATUS.md` with the completed audit and any material architectural consequences;
- update publication architecture if the doctrine/grammar/reference-house distinction changes book structure;
- update root README only if project explanation materially improves;
- add a concise permanent rule to contributor/authoring guidance where future leakage would otherwise recur;
- close this programme with a final review recording surviving watch items.

Do not turn the audit ledger into permanent reader-facing bureaucracy once it has served its purpose.

## 14. Priority order

The work should proceed by **authority × contamination risk**, not filename order.

### Priority 1 — highest authority

- governing principles;
- manuscript claims;
- canonical pattern statements;
- generic grammar/semantic model.

### Priority 2 — likely leakage multipliers

- G-01/general grammar boundary;
- H1/domain language;
- implementation-family records that are linked from multiple layers;
- prototype promotion criteria;
- publication architecture.

### Priority 3 — downstream specificity

- Reference House;
- G-01 details;
- tectonic dialect;
- individual prototype/build records.

### Priority 4 — provenance

- frozen source;
- old development logs;
- superseded paper records.

These are reviewed for interpretive risk but normally not rewritten.

## 15. Stop rules

Stop and reconsider if the work begins to:

- remove useful architectural opinion merely because it is not universal;
- create a new taxonomy more complicated than the dependency problem;
- rename every historical example into abstract prose;
- rewrite frozen provenance to match current thinking;
- require every pattern to be valid for every imaginable house;
- convert technical-domain limitations into doctrine;
- make the Reference House stylistically generic;
- use a hypothetical second grammar as an excuse to design a second house before the abstraction needs testing.

The goal is correct authority, not neutrality for its own sake.

## 16. Expected outputs

The audit should finish with:

1. a complete claim-level specificity ledger;
2. a clean style-neutral HSA doctrine and pattern layer;
3. a style-neutral grammar framework;
4. G-01 isolated as the first selectable grammar;
5. explicit separation of supported-domain restrictions from architectural values;
6. prototype evidence separated into general and Reference House-specific acceptance where required;
7. a more explicit Reference House composition of doctrine + grammar + project + implementation;
8. an adversarial second-language test proving that the abstraction survives outside G-01;
9. updated project status and publication structure only where warranted.

## 17. Resume protocol

If this work is interrupted, resume in this order:

1. read this document;
2. read `architectural-specificity-boundary.md`;
3. read `STATUS.md`;
4. inspect the audit ledger and identify the first open phase/gate;
5. do not infer completion from rewritten prose alone—check the gate record;
6. do not restart completed phases unless a later finding invalidates them.

## 18. Current state

**Phase 0:** planned, baseline not yet executed.  
**Phase 1:** not started.  
**Phase 2:** not started, apart from the earlier style-neutral grammar-framework correction.  
**Phase 3:** not started.  
**Phase 4:** not started.  
**Phase 5:** not started.  
**Phase 6:** not started.  
**Phase 7:** not started.

The earlier boundary correction is a prerequisite, not a substitute for this audit.