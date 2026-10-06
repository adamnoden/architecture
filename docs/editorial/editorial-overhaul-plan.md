# Editorial Overhaul Plan

**Status:** migration plan v0.1  
**Branch:** `editorial-overhaul`  
**Semantic baseline:** `07459d0a580f0c0c4fdc494e592ff29864635571`  
**Governing standard:** [Editorial Doctrine](editorial-doctrine.md)

---

## 1. Purpose

This plan controls the repo-wide prose overhaul.

The objective is not to make every file sound literary, nor to make every file sound alike. It is to improve communication without changing architectural substance, evidence status, technical meaning or research provenance.

The repo contains several different kinds of writing: public manuscript prose, pattern language, reference-house design material, technical explanations, evidence syntheses, implementation documents, prototype records and a large computational research trail. They should not receive the same editorial treatment.

The overhaul therefore works by **surface class**, **prose mode** and **provenance risk**.

---

## 2. Non-negotiable preservation rules

The baseline commit above is the semantic reference for every rewritten file.

A style pass must preserve:

- the proposition being made;
- claim strength and modality;
- evidence status and uncertainty;
- stated exceptions and limits;
- definitions and controlled terminology;
- technical sequences, boundary conditions and failure modes;
- doctrine / strategy / pattern / reference-implementation distinctions;
- citations, evidence anchors and source attributions;
- current-versus-historical status in the computational track.

No global search-and-replace operation should be used to remove words, punctuation or rhetorical forms. The editorial doctrine treats density and misuse as the problem, not the mere existence of a device.

`docs/source/house-design-doctrine-v7.md` is immutable source material for this migration.

Frozen research runs, historical programme versions, source packages and evidence records are provenance. They are not to be rewritten merely because their prose could be smoother.

---

## 3. Surface classes

### Class A — full editorial rewrite

These are reader-facing or concept-defining documents whose prose materially determines how the project is understood.

#### Manuscript

- `docs/manuscript/governing-principles.md`
- `docs/manuscript/part-i.md`
- `docs/manuscript/part-ii.md`
- `docs/manuscript/part-v.md`
- `docs/manuscript/principle-08-repose.md`
- `docs/manuscript/maintenance-geography-external.md`
- `docs/manuscript/preface.md` — **last major manuscript rewrite**

#### Pattern catalogue

- `docs/patterns/core-12.md`
- `docs/patterns/ground-supported-facade-access.md`
- `docs/patterns/reversible-assembly-candidates.md`

#### Reference house

- `docs/reference-house/tectonic-architectural-language.md`
- `docs/reference-house/vertical-bay-coordination.md`
- `docs/reference-house/vertical-bay-options.md`
- `docs/reference-house/external-access-maintenance-plan.md`

#### Current explanatory development material

- `docs/development/manufacturing-strategy.md`
- `docs/development/tectonic-honesty.md`

These development documents are not the publication, but they contain explanatory prose that is repeatedly reused downstream and should not remain stylistically out of step with the public argument.

#### Canonical computational explainers

The computational track is large. Only the current concept-defining explainers belong in the full prose migration:

- `docs/computational/README.md`
- `docs/computational/executable-architecture.md`
- `docs/computational/formal-architectural-model.md`
- `docs/computational/architectural-grammar-and-proportion.md`
- `docs/computational/validity-and-obligations.md`
- `docs/computational/evidence-and-provenance.md`
- `docs/computational/compiler-targets.md`
- `docs/computational/structural-semantics.md`
- `docs/computational/boundary-semantics.md`
- `docs/computational/supported-domain.md`

These should use the technical-explanation mode strongly: intuitive model → contradiction → better model; concrete example before abstraction; jargon only where it buys precision.

---

### Class B — controlled light pass

These documents should become clearer and more economical, but their primary function is navigation, coordination or implementation rather than authored argument.

- `README.md`
- `STATUS.md`
- `docs/manuscript/publication-architecture.md`
- `docs/delivery/riba-implementation-brief-template.md`
- `docs/delivery/external-maintenance-access-requirements.md`
- `docs/development/tectonic-prototype-programme.md`
- `docs/prototypes/w2-wall-bay-build-pack.md`

For these files, prefer deletion of repetition, clearer ordering and tighter labels. Do not import the more literary manuscript voice.

---

### Class C — preserve as research/control record

These files are excluded from stylistic rewriting except for an obvious typo, broken link or ambiguity that risks misinterpretation.

#### Source

- all of `docs/source/**`

#### Evidence and research

- all of `docs/research/**`

Research syntheses may later feed rewritten publication prose, but the source research record should remain a stable evidence layer.

#### Development provenance / control

- `docs/development/preface-architecture.md`
- `docs/development/repose-integration-register.md`
- `docs/development/tectonic-integration-register.md`
- `docs/development/tectonic-migration-plan.md`

#### Computational provenance and frozen runs

Preserve versioned and historical artefacts, including:

- `research-programme.md` and historical/current versioned programme files;
- capability matrices;
- S0/S1/S2/H1 source packages and compile runs;
- red-team records;
- target snapshots;
- external review packs;
- doctrine-delta records;
- evidence trials;
- family specifications;
- interface bundles;
- G-01 source/corpus/case records;
- current control matrices and frozen research outputs.

The wording of these files is part of the research trail. Their concepts may be explained more elegantly in Class A documents without rewriting the records themselves.

#### Figures and SVGs

No prose-style migration. Captions embedded in manuscript prose may be edited where needed, but diagram geometry or technical annotation is a separate workstream.

---

## 4. Audit findings by surface

### Governing principles — low-to-medium style risk, high semantic risk

The principles are already compact and relatively disciplined. The main opportunities are cadence, unnecessary qualification repetition and occasional abstract phrasing.

**Treatment:** light rewrite inside Class A. Do not chase word-count reduction aggressively. The principles define the vocabulary used elsewhere.

### Principle 8 — calibration document

The pilot established the current target register: concrete, calm, explanatory and slightly leaner than the first rewrite instinct.

Two explicit calibration lessons apply repo-wide:

1. stop enumerating examples once the category is clear;
2. after a competent rewrite, perform a final modest compression pass — roughly 5% where substance permits.

This file should be completed first and used as the first whole-file calibration check.

### Part I — high style risk, very high semantic importance

The substance is strong but the draft repeatedly uses:

- one-sentence rhetorical paragraphs;
- explicit significance announcements;
- thesis restatements in increasingly compressed form;
- long enumerations of examples after the category is already clear;
- aphoristic propositions close together;
- repeated `not X / but Y` framing.

The strongest opportunity is explanatory sequencing. Part I should feel as though the reader is being shown how the house behaves over time, then given the concepts needed to describe that behaviour.

**Primary model:** Brand + Scott + McKenzie, with Huxtable acting as editor.

### Part II — medium-to-high style risk, highest technical-fidelity risk

Part II contains some of the best material in the repo, but also the densest accumulation of named concepts, lists and manifesto-like rules.

Examples include interface functions, boundary ledgers, tolerance strategies, workmanship robustness, structural/perceptual legibility and tectonic honesty. Several lists are real taxonomies and must survive; others can be shortened once the mechanism is established.

The rewrite should make the **mechanism of an interface** easier to understand before introducing the full taxonomy.

**Primary model:** McKenzie for sequencing; Brand for physical consequence; Huxtable for compression.

### Part V — medium style risk

Part V is structurally clear but often staccato. It contains many one-line declarations, repeated headings, bullet sequences and deliberate slogans.

The underlying decision logic is good. The rewrite should let that logic carry more of the prose without converting each transition into a principle statement.

### Maintenance Geography — low conceptual risk, medium verbosity risk

This is already concrete and physically intelligible. Its main weakness is **enumeration creep**: many scenarios, lists and examples continue after the category has become obvious.

This file should become a model for how to compress without becoming abstract.

### Pattern catalogue — medium style risk, high repetition risk

The structured pattern format is useful and should remain. The main issue is repeated boilerplate and prose that re-explains the same doctrine inside each pattern.

Do not remove fields merely for elegance. Instead:

- keep each field functionally distinct;
- shorten examples within fields;
- avoid repeating universal doctrine where a cross-reference will do;
- preserve `Evidence`, `Does not prove`, `Failure modes` and `Reference-house direction` as epistemic controls.

### Reference house — medium-to-high style risk

The reference-house material contains many strong architectural ideas but often reads as a sequence of manifesto rules and long example lists.

It should become more project-specific: what this house does, how the detail works, and why that choice was made. General doctrine should be cross-referenced rather than repeatedly re-preached.

### Preface — highest rhetorical risk; rewrite last

The preface contains excellent material and the strongest existing authorial voice. It is also the place where over-shaped prose is most concentrated: dramatic paragraph stepping, aphoristic compression, antithesis and repeated paragraph morals.

Do not flatten it into technical prose. The aim is fewer rhetorical peaks so the surviving ones regain force.

Its final rewrite must wait until the rest of the book has established the natural house voice.

### Computational explainers — high opportunity, high semantic risk

The computational documents are a particularly good fit for the Patrick McKenzie influence.

The strongest version should repeatedly answer:

- what does a reader probably think this system is doing?
- what is it actually doing?
- why does that distinction matter?
- what does the system guarantee, and what remains external?

`executable-architecture.md` already has a strong core proposition but contains repeated manifesto statements and lists. The rewrite should make the compiler/checker distinction, bounded-domain argument, semantic model and proof boundary feel technically inevitable rather than rhetorically asserted.

Historical computational records remain untouched.

### README / STATUS — already relatively strong

These are operational maps, not publication prose. They should be touched last and lightly, mostly to reflect the final naming and remove duplication introduced by the migration.

---

## 5. Rewrite sequence

The order is deliberately dependency-aware.

### Phase 0 — calibration

1. complete `principle-08-repose.md` using the approved pilot register;
2. compare against baseline for claim fidelity;
3. update `editorial-doctrine.md` only if the full-file test reveals a new general rule.

### Phase 1 — canonical doctrine

1. `governing-principles.md`
2. re-check Principle 8 against the governing-principles wording

This locks the vocabulary before longer chapters are rewritten.

### Phase 2 — main manuscript

1. `part-i.md`
2. `part-ii.md`
3. `maintenance-geography-external.md`
4. `part-v.md`

Each large file should be handled section-by-section, but committed as coherent editorial units rather than dozens of micro-commits.

### Phase 3 — patterns

1. `core-12.md`
2. `ground-supported-facade-access.md`
3. `reversible-assembly-candidates.md`

The pattern pass should follow the manuscript so it inherits final terminology rather than creating competing wording.

### Phase 4 — reference house and explanatory development material

1. `tectonic-architectural-language.md`
2. `vertical-bay-coordination.md`
3. `vertical-bay-options.md`
4. `external-access-maintenance-plan.md`
5. `manufacturing-strategy.md`
6. `tectonic-honesty.md`

### Phase 5 — delivery documents

Apply the operational voice to the architect-facing brief and requirements documents.

### Phase 6 — computational canonical explainers

Recommended internal order:

1. `README.md`
2. `executable-architecture.md`
3. `formal-architectural-model.md`
4. `validity-and-obligations.md`
5. `evidence-and-provenance.md`
6. `structural-semantics.md`
7. `boundary-semantics.md`
8. `compiler-targets.md`
9. `supported-domain.md`
10. `architectural-grammar-and-proportion.md`

This order moves from the reader's high-level mental model toward the deeper formal machinery.

### Phase 7 — preface

Rewrite `preface.md` against the now-established voice of the book.

Retain first person, historical narrative and selected rhetorical compression. Remove enough visible craft that the prose stops sounding continuously composed for quotation.

### Phase 8 — cold-read consistency pass

Read the new public surfaces in publication order without consulting the old prose.

Inspect for:

- repeated explanations;
- terminology drift;
- cross-domain analogies used more than once without need;
- uneven assumed reader knowledge;
- sections that suddenly sound academic, promotional or LLM-shaped;
- excessive example density;
- repeated aphoristic cadence;
- abrupt transitions caused by local compression;
- concepts introduced after they are already used.

Then do a separate baseline comparison for semantic drift.

### Phase 9 — navigation / status clean-up

Lightly update:

- root `README.md`;
- `STATUS.md`;
- `publication-architecture.md`;
- relevant cross-links and status labels.

No new doctrine should be invented in this phase.

---

## 6. Per-file editing protocol

Every Class A file follows the same sequence.

### 1. Read against the editorial doctrine

Identify the prose mode before editing.

### 2. Extract the semantic skeleton

For each section identify:

- claim;
- mechanism;
- evidence status;
- limits / exception;
- architectural consequence;
- controlled terms.

### 3. Repair explanatory order first

Do not begin with sentence polishing.

Prefer where appropriate:

**physical condition → mechanism → concept → consequence**

or:

**intuitive model → contradiction → better model**.

### 4. Rewrite for the appropriate mode

Do not import preface rhetoric into patterns, research-note caution into doctrine, or manuscript elegance into a control matrix.

### 5. Stop examples early

Examples should continue only while they add a new category, mechanism or boundary case.

### 6. Remove visible rhetoric

Audit negative parallelism, aphorisms, one-line paragraphs, triads, repeated em-dash cadence, importance signalling and paragraph-end morals.

Keep any instance that genuinely improves precision or argument.

### 7. Modest compression pass

After the rewrite is already clear, look for approximately 5% further reduction where no information is lost. This is a bias, not a quota.

### 8. Baseline fidelity check

Compare the rewritten section to baseline commit `07459d0a580f0c0c4fdc494e592ff29864635571`.

Any change in modality, scope, evidence status, definition or technical relationship must be reverted or explicitly treated as substantive work outside this migration.

---

## 7. Commit strategy

Use the `editorial-overhaul` branch throughout.

Recommended commit units:

1. calibration + doctrine;
2. Part I;
3. Part II + developed maintenance insert;
4. Part V;
5. pattern catalogue;
6. reference house;
7. development/delivery explanatory surfaces;
8. computational canonical explainers;
9. preface;
10. final consistency/navigation pass.

Do not combine the entire migration into one commit. Each unit should remain reviewable and reversible.

---

## 8. Acceptance tests

The overhaul is complete only when all of the following are true.

### Semantic

- no intentional architectural proposition has changed;
- no uncertainty has become certainty;
- no hypothesis has become evidence;
- no current computational state has been confused with a historical state;
- no controlled term has silently changed meaning;
- no citation or evidence anchor required by a retained claim has been lost.

### Editorial

- public prose no longer relies heavily on repeated rhetorical antithesis, aphoristic stepping or paragraph-end morals;
- example lists normally stop once the category is established;
- technical explanations usually expose the physical or system mechanism before abstraction accumulates;
- prose density is higher without becoming compressed or academic;
- the manuscript has a recognisable common temperament without a uniform sentence texture;
- strong sentences are sparse enough to remain strong;
- the preface remains recognisably authorial rather than becoming a technical chapter;
- pattern and delivery documents remain inspectable rather than becoming essays.

### Repository

- frozen provenance is intact;
- source doctrine is untouched;
- historical computational records are untouched;
- links and headings remain coherent;
- root navigation accurately reflects the final structure.

---

## 9. Stop rules

Pause the migration and treat the issue as substantive rather than stylistic if any rewrite exposes:

- contradiction between two current doctrine statements;
- unclear evidence status that cannot be preserved honestly;
- a defined term that means materially different things in different files;
- a technical sequence that appears wrong rather than merely badly explained;
- a current/historical computational inconsistency;
- an apparent need to invent new doctrine to make the prose coherent.

The editorial overhaul is allowed to reveal substantive problems. It is not allowed to solve them silently.

---

## 10. Current next action

Begin Phase 0 with a complete rewrite of `docs/manuscript/principle-08-repose.md`, using the four-paragraph pilot and subsequent compression feedback as the calibration target. Commit that file separately, run a claim-fidelity comparison, then proceed to the governing principles only if the calibration survives the whole document.