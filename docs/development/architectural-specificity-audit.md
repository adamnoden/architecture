# Architectural Specificity Audit — Programme Control

**Status:** complete — Gates 0–7 PASS  
**Purpose:** prevent architectural, morphological or construction assumptions from migrating beyond the layer that legitimately owns them, without stripping useful specificity from G-01, the Reference House, implementation families or research.  
**Claim record:** [Architectural Specificity Audit — Claim Ledger](architectural-specificity-ledger.md)  
**Verification:** [Architectural Specificity Audit — Adversarial Verification](architectural-specificity-adversarial-test.md)

The governing placement rule is [Architectural Specificity Boundary](architectural-specificity-boundary.md).

## 1. Objective

The objective was not to remove Georgian architecture from the project.

It was to make every architectural opinion answer to the correct authority.

House Systems Architecture remains strongly opinionated about the long life of a house: permanence, change, interfaces, maintenance, failure, workmanship, repose, passive-first environmental design and architectural resolution of technology. It does not silently require one historical style, one house morphology or one construction family merely because the Reference House does.

The controlling dependency is:

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

## 2. What counted as contamination

Contamination was treated as a dependency error, not the presence of a particular word.

The audit challenged:

- **explicit stylistic leakage** — Georgian, Palladian or classical requirements presented as HSA doctrine;
- **compositional leakage** — symmetry, axiality, hierarchical façades, vertically proportioned openings or classical room rank treated as universal architectural quality;
- **morphological leakage** — courtyard, detached form, two storeys, central hall, compact rectangular plan or garden relationship treated as generally required;
- **construction leakage** — cavity masonry, red brick, dense inner leaf, timber joists or pitched roof treated as doctrine rather than implementation/domain scope;
- **tectonic leakage** — cornice, skirting, picture rail, brass/bronze or traditional joinery treated as the only legitimate expression of a general interface principle;
- **programme/social leakage** — inherited principal/secondary room relationships or historical domestic hierarchies treated as universal household organisation;
- **evidence leakage** — Reference House aesthetic success used as evidence for a general pattern, or G-01 precedent used to establish a style-neutral principle without independent justification;
- **compiler leakage** — one grammar or project fixture silently becoming the default semantics of architectural validity.

The opposite error was also controlled: legitimate specificity was not erased merely to make documents look neutral.

## 3. Scope classes and dispositions

Claims were tested against the smallest layer that legitimately owns them:

- **A — HSA general** — expected to survive materially different architectural languages, sites and implementation families;
- **B — reusable but scoped** — strategy/pattern with explicit context;
- **C — supported technical domain** — competence boundary for analysis/compilation;
- **D — architectural grammar** — selected design language such as G-01;
- **E — project / site** — Reference House morphology, programme, orientation or local dialect;
- **F — implementation / prototype** — particular assembly, product family, material or detail;
- **G — research / precedent / provenance** — evidence or historical material without normative authority.

Material findings received one of:

`KEEP / GENERALISE / SCOPE / MOVE / SPLIT / ARCHIVE / REJECT`

The durable record is the [claim ledger](architectural-specificity-ledger.md), not metadata added to every Markdown file.

## 4. Gate results

### Gate 0 — baseline / canonicality: PASS

The repository already has a strong documentation model. Current doctrine, patterns, Reference House work, computational research, development records, research and frozen source/provenance can be distinguished.

`docs/source/house-design-doctrine-v7.md` was explicitly excluded from cosmetic rewriting. Its historical Georgian leakage is useful provenance.

### Gate 1 — upstream purity: PASS

Reviewed:

- root README;
- governing principles;
- manuscript Parts I, II and V plus Preface/repose material;
- pattern authoring contract;
- all 21 active pattern pages;
- all three canonical strategies;
- held candidates.

Main result: the canonical pattern language is substantially cleaner than the old source doctrine. Pattern invariants remain portable; specific Georgian/material/morphological references generally occur as examples, variants or explicitly scoped Reference House applications.

Repairs were therefore narrow rather than lexical. Part V now defines permanent construction material-neutrally and treats brass/bronze as a Reference House example of a more general signalling/tectonic question. `docs/manuscript/README.md` now states the manuscript-wide specificity rule.

### Gate 2 — computational authority: PASS

Reviewed:

- formal architectural model;
- validity/obligation architecture;
- style-neutral grammar framework;
- G-01 derivation work;
- supported domain / H1 capability;
- executable P0 model;
- G-01-derived modelling corrections.

The computational architecture already distinguishes:

- model integrity;
- supported-domain status;
- technical validity;
- doctrine conformance;
- grammar conformance;
- project requirements;
- evidence state.

H1 masonry/roof/storey restrictions are technical competence boundaries, not architectural values. `UNSUPPORTED` is epistemic, not normative.

The one residual naming problem was G-01's legacy identity as a “Long-Life House grammar”. [G-01 — Georgian-Derived Domestic Grammar Charter](../computational/g01-grammar-charter.md) now controls grammar identity/authority independently of HSA; the existing research brief remains active for corpus and derivation work until its next substantive editorial revision.

### Gate 3 — prototype / evidence authority: PASS

This was the most important live correction.

The P01-W2 evidence protocol was already style-neutral, but the development programme/build pack use a visibly Georgian-derived specimen and previously mixed “does this work generally?” with “does this look right in our Georgian Reference House?”.

The programme now requires separate verdicts:

```text
GENERAL HSA EVIDENCE
performance / solidity / reversibility / tolerance / workmanship / proportionality

REFERENCE HOUSE / G-01 FIT
selected grammar / project dialect / composition / visible material language
```

A Reference House fit pass cannot promote a general HSA proposition. A general evidence pass does not require Reference House selection.

P04 is likewise explicitly a Reference House wall/ceiling tectonic prototype. Cornice and brass/bronze remain legitimate there without becoming HSA requirements.

### Gate 4 — Reference House and G-01: PASS

The downstream documents were not neutralised.

Instead the Reference House now names its composition explicitly:

```text
HSA doctrine
+ selected HSA patterns / strategies
+ supported technical families where used
+ G-01 Georgian-derived grammar
+ site + contemporary family programme
+ courtyard project morphology
+ local courtyard dialect where selected
+ Reference House tectonic dialect
= Reference House
```

G-01 already keeps the courtyard out of generic Georgian definition and treats the slight Andalusian courtyard influence as a local dialect. The tectonic-language document already states that HSA does not require Georgian architecture, brass details or visible joints; the Reference House does.

### Gate 5 — cross-layer repair: PASS

Every material finding in the ledger is now one of:

- changed;
- explicitly scoped;
- deliberately kept as a valid example;
- archived as provenance.

No downstream concept was lost merely to make upstream prose neutral.

### Gate 6 — adversarial verification: PASS

The [adversarial test](architectural-specificity-adversarial-test.md) checked four directions:

1. an asymmetric Arts-and-Crafts-derived house can satisfy HSA without selecting G-01;
2. a timber-frame / different-roof technical family can remain conceptually HSA while correctly falling outside H1 support;
3. removing Georgian-derived language materially changes the Reference House, proving downstream grammar is consequential;
4. representative failure states retain separate doctrine, grammar, technical, domain and project authority.

The W2 counterfactuals were particularly useful:

- technically excellent but wrong for G-01 → general evidence may pass while Reference House selection fails;
- visually perfect for G-01 but rattly/destructive → Reference House visual fit may pass while general evidence and project technical use fail.

### Gate 7 — publication / status reconciliation: PASS

No book-structure rewrite was needed. The existing publication architecture already treats the Reference House as one interpretation rather than proof.

Durable controls now exist at repository, manuscript, computational, prototype and Reference House levels. `STATUS.md` records the audit as closed rather than creating a new continuing taxonomy workstream.

## 5. Important negative finding

The audit did **not** find a need to reopen the canonical pattern migration or generic compiler work.

That matters.

The current 21-pattern language, strategies/candidates, semantic model and validity architecture already contain the right separations. Rewriting them merely to remove specific nouns would reduce clarity and create bureaucracy without correcting authority.

The project had less active Georgian contamination than its frozen source suggested.

The highest residual risk is future **dependency drift through the worked example**: because one Georgian-derived Reference House is the dominant concrete case, repetition can make its choices begin to feel inevitable.

## 6. Permanent controls

Future work should preserve these rules:

1. **Doctrine survives a change of style.**
2. **Pattern invariants do not acquire evidence from Reference House use.**
3. **Supported-domain restrictions are competence boundaries, not architectural values.**
4. **A grammar failure means failure of the selected grammar, not bad architecture in general.**
5. **Project morphology and local dialect do not redefine the base grammar merely because one house combines them.**
6. **Prototype target-fit evidence and general-system evidence remain separate.**
7. **Historical/style precedent may expose a general principle, but only the independently justified general reason moves upstream.**
8. **Specific examples are allowed in publication prose; their noun does not establish their authority.**

> **Generalise the reason; localise the taste.**

## 7. Reopen conditions

Do not reopen this audit for routine Georgian/Reference House work.

Reopen only if one of these occurs:

- a new governing principle or canonical pattern appears to depend on G-01/project form;
- a compiler/domain rule starts reporting a style or technical-family preference as general architectural invalidity;
- prototype evidence is promoted without separating selected-grammar fit;
- a future second grammar requires special pleading in the supposedly style-neutral framework;
- a major publication rewrite collapses doctrine, grammar and Reference House authority again.

Otherwise the architectural-specificity boundary becomes an ordinary authoring/design rule rather than a continuing workstream.

## 8. Final state

**Phase 0:** PASS — baseline/canonicality established.  
**Phase 1:** PASS — upstream doctrine/pattern/manuscript audit complete.  
**Phase 2:** PASS — computational authority audit complete.  
**Phase 3:** PASS — prototype/evidence authority split implemented.  
**Phase 4:** PASS — Reference House/G-01 authority made explicit.  
**Phase 5:** PASS — material repairs complete.  
**Phase 6:** PASS — adversarial verification complete.  
**Phase 7:** PASS — publication/status reconciliation complete.

**Programme state: CLOSED.**
