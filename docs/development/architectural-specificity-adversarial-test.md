# Architectural Specificity Audit — Adversarial Verification

**Status:** PASS v0.1  
**Purpose:** test whether House Systems Architecture remains coherent outside the Georgian-derived Reference House and whether downstream specificity remains meaningful.

This is an abstraction test, not a proposal to design a second house.

## Test A — materially different architectural language

### Counterfactual house

Assume a contemporary Arts-and-Crafts-derived domestic grammar with:

- deliberate asymmetry rather than a principal symmetrical front;
- low, sheltering roof geometry;
- irregular opening sizes tied strongly to room use;
- a more picturesque circulation sequence;
- expressed timber/joinery where appropriate;
- no classical cornice hierarchy;
- no requirement for sash-window composition;
- no Georgian principal-storey hierarchy;
- no brass/bronze interface language by default.

### HSA doctrine test

The house can still satisfy all eleven governing principles.

It can:

- build for maintenance and change;
- preserve long-lived fabric from routine service damage;
- design interfaces deliberately;
- make failure detectable/containable/repairable;
- establish maintenance geography;
- use ordinary parts in robust arrangements;
- retain selective permanence;
- pursue repose through comfort, privacy, comprehensibility and perceptual settlement;
- use passive architecture first;
- preserve building information;
- resolve technology architecturally.

No principle requires Georgian composition.

**Result: PASS.**

### Pattern-language test

The active patterns remain usable without G-01:

- utility entry and service hubs can sit in secondary/service architecture;
- vertical and horizontal service routes can follow non-axial plans;
- permanent openings can receive replaceable windows/doors of a different architectural family;
- movement joints may be expressed through timber cover, shadow gap or quiet overlap rather than brass/cornice;
- attachment planes can support joinery or plain wall finishes rather than Georgian panel fields;
- roof/facade maintenance patterns apply independently of picturesque/asymmetric composition.

Reference House application paragraphs cease to apply; pattern invariants do not.

**Result: PASS.**

### Grammar-framework test

The style-neutral grammar framework can represent:

- asymmetric ordering domains;
- non-classical hierarchy;
- topology/sequence;
- dimensional families;
- plan/section/elevation coupling;
- grammar-specific element families;
- preferences, invariants and explicit deviations.

It does not require symmetry, sash windows, classical axes, cornices, masonry or a courtyard.

**Result: PASS.**

### G-01 diagnostic

The same house would probably fail numerous G-01 rules once those rules exist.

That is correct behaviour.

```text
HSA DOCTRINE      PASS
HSA PATTERNS      APPLICABLE AS SELECTED
GRAMMAR G-01      FAIL / NOT SELECTED
OTHER GRAMMAR     MAY PASS
```

A G-01 failure does not propagate into general architectural invalidity.

**Result: PASS.**

---

## Test B — materially different technical family

### Counterfactual house

Assume a restrained contemporary house using:

- timber-frame or another non-masonry primary wall system;
- a low-slope/flat roof family;
- a different upper-floor family;
- the same HSA long-life objectives.

### Doctrine test

Nothing in HSA doctrine inherently requires cavity masonry, I-joists or a duo-pitched trussed roof.

The doctrine instead asks the new construction to establish its own:

- long-lived versus replaceable layers;
- interface logic;
- failure modes;
- maintenance geography;
- passive/environmental strategy;
- workmanship/tolerance model;
- evidence.

**Result: PASS.**

### Compiler-domain test

The current H1 compiler domain may not support those families.

Correct result:

```text
HSA DOCTRINE          POSSIBLE / PROJECT-TESTED SEPARATELY
ARCHITECTURAL GRAMMAR INDEPENDENT
H1 SUPPORTED DOMAIN   UNSUPPORTED
TECHNICAL ADEQUACY    EXTERNAL / UNPROVED IN H1
```

Incorrect result would be `bad architecture`, `doctrine fail` or silent coercion back to cavity masonry.

Current H1 documents explicitly define domain exit as a proof-system boundary rather than an architectural failure.

**Result: PASS.**

---

## Test C — Reference House specificity

Ask the inverse question: if Georgian-derived language is removed from the current Reference House, does the project materially change?

Yes.

The Reference House currently selects or investigates:

- G-01 Georgian-derived ordering/proportion/hierarchy;
- red-brick / substantial masonry architectural character;
- traditional joinery as part of the visible room language;
- skirting, dado/picture-rail/cornice/architrave as available architectural elements;
- restrained brass/bronze as a functional tectonic cue;
- a central front-to-courtyard-to-garden ordering sequence;
- a courtyard morphology that must negotiate with, rather than redefine, G-01;
- a possible local Andalusian courtyard dialect.

Remove those and the same HSA patterns could inhabit another house, but it would no longer be this Reference House.

That is the intended architecture: downstream grammar and project choice are consequential rather than decorative metadata.

**Result: PASS.**

---

## Test D — authority diagnostics

Representative conditions should report different authorities.

### D1 — inaccessible plant replacement

```text
HSA maintenance commitment    FAIL
TECHNICAL OPERATION            MAY PASS
G-01                           UNCHANGED
REGULATION                     CONTEXT DEPENDENT
```

### D2 — principal facade opening leaves G-01 bay rule

```text
HSA DOCTRINE                   UNCHANGED
TECHNICAL VALIDITY             MAY PASS
GRAMMAR G-01                   FAIL / DEVIATION
PROJECT REQUIREMENT            DEPENDS ON SELECTED GRAMMAR
```

### D3 — timber frame used outside H1

```text
HSA DOCTRINE                   NOT FAILED BY MATERIAL CHOICE
GRAMMAR                        INDEPENDENT
H1 SUPPORTED DOMAIN            UNSUPPORTED
TECHNICAL EVIDENCE             EXTERNAL / NEW FAMILY REQUIRED
```

### D4 — brass strip added only as decoration

For a non-G-01 house:

```text
HSA                             NO GENERIC METAL REQUIREMENT
ARCHITECTURAL JUDGEMENT         PROJECT / GRAMMAR SPECIFIC
```

For the Reference House, if the tectonic dialect claims visible metal normally signals movement, opening, wear, protection or disassembly:

```text
REFERENCE HOUSE DIALECT         FAIL / REVIEW
HSA DOCTRINE                    NOT AUTOMATICALLY FAILED
```

### D5 — W2 wall is technically excellent but looks wrong in G-01 room

```text
GENERAL W2 EVIDENCE             MAY PASS
REFERENCE HOUSE SELECTION       FAIL
G-01 / PROJECT FIT              FAIL
CANDIDATE GENERAL VIABILITY     REMAINS OPEN
```

### D6 — W2 wall looks perfect in G-01 but rattles and degrades after cycling

```text
REFERENCE HOUSE VISUAL FIT      PASS
GENERAL HSA EVIDENCE            FAIL
REFERENCE HOUSE TECHNICAL USE   REJECT / HOLD
PATTERN PROMOTION               NOT EARNED
```

The two W2 cases are the strongest practical test of the new evidence firewall.

**Result: PASS.**

---

## Test E — upstream-promotion challenge

Take several current Reference House preferences and try to promote them upstream.

| Downstream preference | Proposed false generalisation | Audit result |
|---|---|---|
| Georgian cornice covering movement | HSA requires cornices at wall/ceiling interfaces | REJECT — general reason is designed movement/tolerance interface |
| brass slip line | HSA requires visible metal at disassembly points | REJECT — functional/architectural signalling is optional and grammar/project-specific |
| red-brick masonry | HSA permanent architecture should be masonry | REJECT — permanence is lifecycle/architectural role, not material prescription |
| courtyard | HSA houses should have internal courts | REJECT — project morphology |
| symmetry / axial order | repose requires symmetry | REJECT — evidence does not support this; G-01 may use scoped ordering rules |
| sash-like opening hierarchy | HSA requires vertically proportioned openings | REJECT — G-01 territory |
| traditional skirting as service route | HSA requires service skirtings | REJECT — general pattern is accessible room-side service routing |

**Result: PASS.**

---

## Final verdict

The abstraction survives a materially different architectural language and a materially different technical family.

The strongest residual risk is no longer current doctrine contamination. It is **future dependency drift**: because the Reference House is the project's main worked example, repeated use may gradually make its assumptions feel inevitable.

The permanent controls are therefore:

1. the [Architectural Specificity Boundary](architectural-specificity-boundary.md);
2. the claim ledger for this audit;
3. independent validity/authority dimensions in the computational model;
4. explicit Reference House composition/authority stack;
5. separate general versus selected-grammar verdicts in prototype work;
6. a future second real grammar as the eventual strongest empirical test of framework neutrality.

**Gate 6: PASS.**
