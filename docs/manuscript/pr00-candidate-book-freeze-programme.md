# PR-00 — Candidate-Book Freeze Execution Programme

**Status:** active publication-completion programme  
**Parent programme:** [`Publication Credibility and Release Programme`](publication-credibility-release-programme.md)  
**Umbrella issue:** #71 — `PUB-01 — publication credibility and release programme`  
**Publication architecture:** [`Ovid’s House — Publication Architecture`](publication-architecture.md)  
**Objective:** turn the current Working Edition into a stable, publication-native candidate book that is coherent enough to enter PR-01 adversarial review without using PR-01 to discover obvious incompleteness.

PR-00 is a **completion and freeze programme**, not another architectural research programme.

It exists to answer one bounded question:

> **Is there now one complete enough, internally coherent enough and truthfully qualified book that can be frozen and attacked as a whole?**

Passing PR-00 does not mean the book is correct, externally validated or ready for public release. It means structural fluidity has been reduced enough that criticism can attach to a stable object.

---

## 1. Why PR-00 needs its own execution programme

The parent release programme already defines the candidate-book gate. The repository also already has a functioning print pipeline and a completed whole-book Working Edition proof.

The remaining problem is no longer principally mechanical. The prior print proof exposed substantive publication gaps, especially:

- Part IV is not yet the intended six-chapter Reference House publication;
- some promised back matter is absent or still exists only as repository/control material;
- figures remain incomplete relative to the publication architecture;
- canonical research and design records have continued to mature after the earlier Working Edition proof, so the manuscript must be reconciled to current authority;
- the current full-book manifest can mechanically include canonical documents that are not yet the best reader-facing form.

PR-00 therefore converts the broad candidate-book definition into a finite execution sequence.

The numbering deliberately remains inside **PR-00A → PR-00H**. The parent programme's **PR-01** is reserved for the later internal adversarial review and must not be consumed by ordinary manuscript completion.

---

## 2. Entry state

PR-00 begins from the following controlled baseline.

### Already established

- publication architecture v0.13 provides the intended book structure;
- Preface, Reader's Guide, Parts I, II and V exist as publication-facing manuscript material;
- Part III is sourced from the canonical M4 pattern language rather than duplicated into `docs/manuscript/`;
- Part IV is sourced from the M3 Reference House, but the current Working Edition still exposes selected coordination records rather than the intended six publication chapters;
- the print pipeline, adapters and Vivliostyle production path have already passed their earlier mechanical/editorial Working Edition gates;
- the publication constitution and later PR-01 → PR-06 release sequence are recorded;
- G-01 v0.1 is now frozen at M4 and the Reference House has been checked against it;
- the bounded Metamorph Compiler remains M4 at its own proof scope and remains outside the main Parts I–V publication structure unless a small explanatory reference is genuinely earned.

### Not yet established

PR-00 does **not** assume that:

- every Part I–V chapter has final reader-facing depth;
- every canonical pattern page is publication-ready merely because the pattern language is M4;
- the Reference House has a finished publication narrative;
- every evidence claim is currently phrased at the correct breadth;
- principal figures are complete;
- all promised back matter exists;
- the current publication manifest is the final candidate-book manifest;
- the current pagination or page count is meaningful for the private object edition.

---

## 3. Authority boundaries

PR-00 is editorially aggressive but architecturally conservative.

### PR-00 may

- restructure reader-facing publication material;
- author missing publication-facing synthesis from canonical project records;
- remove duplication and repository/admin residue from the book path;
- narrow or qualify claims where existing evidence does not support their current wording;
- add figures that explain already-authorised architectural propositions;
- add missing cross-references, evidence notes, glossary material and back matter;
- change the publication manifest and print adapters where that improves reader-facing composition without altering canonical technical authority;
- expose research debt explicitly.

### PR-00 may not silently

- invent new Ovid’s House doctrine;
- promote held pattern candidates;
- create new G-01 rules;
- treat the Reference House as proof of doctrine or patterns;
- raise Reference House, professional-review or prototype maturity;
- broaden compiler claims;
- claim engineering, regulatory, building-physics or product adequacy that has not been earned;
- convert project taste into general architectural requirements;
- hide unresolved evidence gaps because they are inconvenient in a book.

### Reopening upstream work

A manuscript problem does **not** automatically reopen architecture or research.

Reopen an upstream workstream only where PR-00 discovers a concrete contradiction that prevents truthful publication, for example:

- two canonical sources assert materially incompatible architectural positions;
- a governing principle relies on a factual premise shown to be wrong;
- a pattern cannot be described accurately without changing its canonical invariant;
- the Reference House publication narrative exposes an unresolved design contradiction rather than merely an unpolished explanation;
- a figure cannot be made truthful because the underlying project geometry is itself unresolved.

Otherwise record the limitation, narrow the prose or expose the research debt and continue.

---

# 4. Execution sequence

```text
PR-00A  BASELINE + MANUSCRIPT LEDGER
   ↓
PR-00B  STRUCTURAL COMPLETION + PUBLICATION-NATIVE AUTHORSHIP
   ↓
PR-00C  AUTHORITY / CLAIM / EVIDENCE RECONCILIATION
   ↓
PR-00D  FIGURE + VISUAL ARGUMENT COMPLETION
   ↓
PR-00E  WHOLE-BOOK EDITORIAL HARDENING
   ↓
PR-00F  CROSS-REFERENCE / NOMENCLATURE / BACK-MATTER INTEGRITY
   ↓
PR-00G  CANDIDATE PRINT PROOF
   ↓
PR-00H  CANDIDATE-BOOK FREEZE
   ↓
PR-01    INTERNAL ADVERSARIAL REVIEW
```

Do not skip directly to line editing or pagination while material structural gaps remain.

---

# PR-00A — Baseline and manuscript ledger

## Purpose

Establish exactly what the current book contains, what the publication architecture promises, what is publication-native, what remains provisional and where current authority has moved since the last Working Edition proof.

This gate prevents the programme from becoming a vague instruction to “finish the book.”

## Required output

Create one canonical **candidate-book ledger**. For every intended publication unit record at least:

- part / chapter / back-matter identity;
- publication-architecture requirement;
- canonical source authority;
- current publication source / adapter;
- current state: `READY / NEEDS AUTHORSHIP / NEEDS RECONCILIATION / NEEDS FIGURE / NEEDS EVIDENCE HARDENING / REMOVE OR REPLACE`;
- principal claims;
- known research debt;
- figure requirement;
- dependency on unfinished external/physical evidence, if any;
- whether a source is publication-native or merely a development/control document currently exposed by the print adapter.

The ledger must cover:

- front matter;
- Parts I–V;
- all 21 active patterns plus strategies/candidate bench as actually intended for print;
- the six intended Reference House chapters;
- all promised back matter A–G;
- major figures and diagrams;
- the Sources and further reading surface.

## Mandatory comparisons

Reconcile at least:

1. `publication-architecture.md` — editorial intent;
2. `publication/publication.ts` — actual mechanical book manifest;
3. canonical manuscript/pattern/Reference House sources;
4. the maintained Working Edition proof ledger;
5. current maturity / STATUS authority after G-01 completion.

## Key questions

- Does every promised chapter have a real reader-facing source?
- Is any development record being printed merely because it is the best available source rather than because it belongs in the book?
- Are any canonical advances absent from the publication because the book froze an older project state?
- Is anything in the manifest outside the publication architecture without a clear reason?
- Is any promised front/back matter still only a heading in the architecture document?

## Gate

PR-00A passes only when the missing work can be named as a finite set of publication units. Unknown incompleteness is not acceptable after this gate.

---

# PR-00B — Structural completion and publication-native authorship

## Purpose

Fill genuine manuscript holes before polishing existing prose.

The prior Working Edition proof identified Part IV as the most important structural deficit. PR-00B closes that deficit honestly rather than relabelling development records as finished chapters.

## Part IV — mandatory publication-facing synthesis

Author the intended six-chapter Reference House sequence:

13. **Site and type**  
14. **Architectural order, repose and tectonic language**  
15. **Material, structural and assembly system**  
16. **Maintenance geography**  
17. **Water and environmental systems**  
18. **Future maintenance scenarios**

### Ownership model

Prefer a dedicated publication-facing Part IV source or small set of sources under `docs/manuscript/` that **synthesise** the Reference House rather than copying its control records.

The Reference House repository remains the architectural authority. Part IV owns the reader-facing explanation.

This distinction matters:

```text
REFERENCE HOUSE CONTROL RECORDS
  exact project state / gate history / technical boundaries
        ↓ evidence and authority
PART IV PUBLICATION SYNTHESIS
  coherent architectural narrative for the reader
```

The publication source may cite or derive from RH records, but should not inherit their gate headers, status administration, development chronology or repository wayfinding.

### Part IV truth conditions

- The site chapter must distinguish surrogate/assumed site conditions from a real commissioned site.
- G-01 must be described from frozen v0.1 authority, not from superseded “current research” language.
- Courtyard morphology, Andalusian influence and brass/bronze tectonic language remain Reference House choices, not G-01 or Ovid’s House doctrine.
- Low-slope roof selection remains a project water/failure-geography decision, not a Georgian rule.
- Unengineered structural assumptions remain visibly unengineered.
- External review, P03 and P04 remain open evidence obligations.
- Maintenance scenarios are scenarios, not proof that replacement/repair has been physically demonstrated.

## Parts III and V

Part III does not require duplication into manuscript files. It does require a publication-completion audit:

- every active pattern should read as an architectural pattern rather than a repository specification;
- evidence/maturity and `does not prove` material remains where substantively useful;
- pattern relationships and the generative sequence must be legible to a reader encountering them linearly;
- strategies and held candidates remain clearly different from patterns;
- no migration/admin history leaks into the primary reading path unless it has architectural meaning.

Part V should be tested for useful depth across chapters 19–25. Add material only where a chapter is currently a heading-level promise rather than an argument.

## Back matter — mandatory completion decision

For each promised back-matter item A–G, either author a publication-facing source or deliberately change the publication architecture before freeze.

Current intended set:

A. Evidence and precedent notes  
B. 63-item doctrine register mapped to eleven principles  
C. Research agenda  
D. Reference-house implementation schedule  
E. Pattern-language map and generative-sequence notes  
F. Glossary  
G. Sources and further reading

“Still exists elsewhere in the repository” is not enough if the publication architecture promises the reader a book component.

## Gate

PR-00B passes when Parts I–V and the retained back matter all exist in a publication-facing form at useful depth. No major chapter may remain a placeholder disguised by a mechanically successful PDF.

---

# PR-00C — Authority, claim and evidence reconciliation

## Purpose

Make the candidate book describe the project that actually exists now, at the strength actually earned now.

This is not PR-01's hostile intellectual attack. It is a publication-integrity pass against already-established authority.

## Required audits

### Authority audit

For each substantive claim determine its owner:

- Ovid’s House principle / doctrine;
- canonical pattern or strategy;
- held candidate;
- architectural grammar / G-01;
- Reference House;
- technical family;
- computational proof scope;
- precedent / external source;
- open research hypothesis.

Flag language where the book accidentally promotes a narrower owner upward.

### Maturity audit

Reconcile manuscript statements with current maturity, especially:

- G-01 = M4 at bounded internal scope;
- pattern language = M4;
- architectural grammar framework = M3;
- Reference House = M3 virtual-design scope;
- physical prototypes = M2;
- external professional review = M1;
- computational track = M4 at bounded proof scope.

Do not let publication polish erase these boundaries.

### Claim-strength audit

Every technical or evidentially sensitive statement should resolve to one of:

- supported proposition;
- bounded inference;
- project decision;
- hypothesis / research debt;
- illustrative example.

Remove or qualify language that reads as proof where only coordination exists.

### Historical / precedent attribution

Check claims of novelty, lineage and precedent where the book names Habraken, Duffy, Brand, Alexander, Georgian/Palladian traditions or other intellectual/architectural antecedents.

PR-00 need not perform the full “derivative” attack reserved for PR-01, but it must not knowingly misstate provenance.

## Computational boundary

Retain the existing decision that the computational track is **recorded, not promoted to a manuscript part**.

If mentioned in the book, it must be described at its actual bounded scope and never as a finished regulations engine, CAD compiler or proof of buildability.

## Gate

PR-00C passes when a careful reader cannot reasonably infer a stronger authority, maturity or evidence claim than the repository actually supports.

---

# PR-00D — Figure and visual-argument completion

## Purpose

Complete the book's principal visual reasoning without allowing attractive drawings to outrun the evidence.

A figure belongs because it explains an argument that prose alone handles poorly, not because an architectural book is expected to contain pictures.

## Figure inventory

From the PR-00A ledger, classify each needed figure as:

- `ESSENTIAL ARGUMENT` — book is materially weaker without it;
- `USEFUL ORIENTATION` — helps spatial understanding;
- `REFERENCE` — supports pattern or case reading;
- `DECORATIVE / REMOVE` — carries insufficient explanatory load.

Prioritise essential argument figures first.

## Figure standards

Every principal figure must have:

- named publication purpose;
- canonical source or clearly stated analytical derivation;
- scope and uncertainty appropriate to the evidence;
- legible monochrome reproduction at intended trim size;
- publication-native labels rather than repository/gate vocabulary;
- caption that states what the reader should learn without overclaiming;
- consistency between text, caption and geometry;
- deterministic/code-based source where that materially improves maintainability and correctness.

For analytical diagrams, prefer semantic/code-based generation where practical. Do not manufacture measurement precision merely to make a diagram look architectural.

## Mandatory visual families to review

At minimum:

- selective permanence / lifespan separation;
- designed interface / movement / attachment logic;
- failure architecture and water consequence;
- maintenance geography, including exterior access;
- pattern-language relationship / generative sequence map;
- Reference House site/type and plan/section/elevation orientation;
- Reference House service/maintenance geography;
- Reference House future maintenance scenarios where a sequence diagram materially helps;
- evidence/maturity distinctions only if a figure is clearer than the existing legend.

## Gate

PR-00D passes when every chapter that genuinely depends on a figure has one, and every retained figure has been checked as an argument rather than a decoration or false proof.

---

# PR-00E — Whole-book editorial hardening

## Purpose

Make the manuscript read like one serious architectural monograph rather than a sequence of independently competent repository documents.

This gate occurs **after** structural authorship and authority reconciliation so prose effort is not wasted on material that will move or disappear.

## Passes

### 1. Argument continuity

Check:

- chapter openings and endings;
- premise → consequence → pattern → worked-house progression;
- whether concepts are defined before they carry argumentative weight;
- whether Part III and IV mode changes remain deliberate rather than abrupt through accident;
- whether Part V closes the architectural proposition rather than becoming an implementation appendix.

### 2. Compression and duplication

Remove:

- repeated explanations that exist only because source documents were originally standalone;
- repeated caveats where one well-placed boundary can govern a section;
- repository/process commentary;
- assistant/conversation residue;
- defensive prose whose only purpose is to narrate how the project got here.

Retain repetition when it is structural, mnemonic or deliberately returns a proposition at a new scale.

### 3. Architectural register

The book should read as native architectural writing:

- concrete rather than managerial;
- precise rather than bureaucratic;
- confident where evidence is strong;
- explicit about uncertainty without becoming apologetic;
- aphoristic only where compression improves transmission;
- free of invented grandeur and generic manifesto language.

### 4. Temporal / Ovidian frame

Check that **permanence without stasis** and the Ovidian frame appear where they genuinely clarify the project rather than becoming branding repeated mechanically.

The title should gain depth from the book rather than requiring continuous explanation.

### 5. Publication constitution

Preserve:

- strangeness;
- restraint;
- absence of author cult;
- black-line argumentative visual language;
- accessibility through clarity rather than conventionalisation;
- memorable propositions without slogan inflation.

## Gate

PR-00E passes when the book no longer reads as a cleaned export of a documentation site and no major passage remains obviously in development-note/register voice.

---

# PR-00F — Cross-reference, nomenclature and back-matter integrity

## Purpose

Eliminate small structural defects that undermine trust once the object is read linearly.

## Checks

- title is consistently **Ovid’s House**;
- **House Kernel** is used only for the formal architectural/computational system where intended;
- **Metamorph Compiler** is used only for the executable machinery;
- legacy project names appear only as explicit history/provenance;
- stable `PAT-*` identifiers remain intact and are explained as identity rather than current project branding;
- pattern/strategy/candidate distinctions are consistent;
- G-01 terminology reflects frozen v0.1;
- chapter numbering matches the publication architecture;
- figures/tables/captions resolve correctly;
- internal references point to reader-facing sections rather than repository files wherever possible;
- glossary covers project-specific terms actually used by the book;
- sources/further reading and evidence notes do not conflict or duplicate incoherently;
- doctrine/principle/pattern/grammar/Reference House boundaries are named consistently;
- research debt exposed in the text appears coherently in the research agenda where appropriate.

## Gate

PR-00F passes when terminology, cross-reference and back-matter defects are no longer likely to distract an adversarial reader from the substantive argument.

---

# PR-00G — Candidate print proof

## Purpose

Test the actual candidate object, not merely its Markdown sources.

The previous G4 proof established that the print system works as a Working Edition. PR-00G asks a different question: **does the completed candidate read and reproduce as the book we intend to attack in PR-01?**

## Required artifact

Build the full publication through the existing deterministic pipeline.

The candidate proof must be inspected for:

- contents / part / chapter order;
- chapter starts;
- page hierarchy;
- blank-page behaviour;
- headings stranded at page bottoms;
- widows/orphans where visually damaging;
- tables split unintelligibly;
- figures at actual print size;
- captions separated from figures;
- line weights and labels in monochrome;
- internal links / destinations where retained;
- missing glyphs/fonts;
- image/SVG clipping;
- excessive white-space accidents;
- repeated H1/title artefacts from adapters;
- repository/admin language reintroduced by newly added sources;
- index/back-matter continuity;
- total physical plausibility for the intended private hardback object.

Do not target an arbitrary page count. The earlier 300–500 / roughly 400-page private-object expectation is a production planning range, not a manuscript quota.

## Correction rule

Fix defects at the highest legitimate source:

1. canonical/publication prose if the writing is wrong;
2. publication synthesis if reader-facing structure is wrong;
3. adapter if canonical repository prose is right but inappropriate to print;
4. theme/layout only for genuinely typographic defects.

Do not solve substantive writing problems with CSS.

## Gate

PR-00G passes when one full generated artifact has been read/inspected as an object and all freeze-blocking defects are resolved or explicitly classified as accepted non-blockers.

---

# PR-00H — Candidate-book freeze

## Purpose

Create the stable object that PR-01 will attack.

## Freeze record

Record:

- exact commit SHA;
- publication architecture version;
- publication manifest identity;
- candidate artifact build identity where available;
- retained known research debt;
- accepted non-blocking publication defects;
- explicit maturity boundaries;
- sections that remain hypotheses/candidates rather than conclusions;
- list of upstream workstreams frozen for the purpose of PR-01;
- conditions that permit a substantive post-freeze change.

## Freeze semantics

After PR-00H:

### Allowed without breaking the freeze

- spelling/grammar corrections;
- broken-link/caption/reference repairs;
- typographic defects;
- other changes demonstrably not affecting the argument being reviewed.

### Breaks the freeze and requires a new candidate revision

- adding/removing a principle or pattern;
- materially changing a major proposition;
- rewriting chapter structure substantially;
- changing Reference House architecture in a way relevant to the book;
- altering evidence boundaries materially;
- adding a major new research claim;
- changing the publication architecture itself.

PR-01 findings are expected to break the freeze where they reveal real defects. The point of PR-00H is not permanence; it is versioned stability.

## PR-00 final pass condition

PR-00 passes only when all of the following are true:

- publication architecture is substantially complete in actual book material;
- Parts I–V exist at useful depth;
- Part IV is publication-facing rather than a disguised coordination-file bundle;
- Part III represents the canonical pattern language without migration/admin residue or evidence laundering;
- retained back matter exists and is intentionally structured;
- principal figures exist and have been checked against their claims;
- evidence/maturity boundaries are explicit;
- known research debt is visible;
- unsupported technical certainty has been removed;
- current G-01 / Reference House / compiler authority is reconciled;
- a whole-book editorial hardening pass is complete;
- a full candidate print proof has passed;
- one exact candidate commit/artifact is frozen for PR-01.

At that point the book is **ready to be attacked**, not ready to be published.

---

# 5. Stop rules

PR-00 should stop and escalate rather than manufacture completion if:

- a missing chapter requires architectural decisions the current project has not actually made;
- the only way to make a claim read cleanly is to overstate weak evidence;
- Part IV can become coherent only by pretending the Reference House is externally validated or engineered;
- a promised back-matter object has no genuine reader value and exists only because an old outline listed it — in that case change the publication architecture explicitly rather than fill pages ceremonially;
- a figure requires invented geometry or unsupported precision;
- publication-native prose conflicts materially with canonical project authority;
- the candidate can be made “complete” only by quietly reopening compiler, pattern or doctrine work by inertia.

A thinner truthful book is preferable to a falsely complete one.

---

# 6. PR-00 / PR-01 boundary

PR-00 asks:

> **Is the book complete and internally reconciled enough to criticise fairly?**

PR-01 asks:

> **Now that the object is stable, where is it wrong, weak, derivative, naïve, overstated, incomplete, inconsistent or unmemorable?**

Do not use PR-00 as an excuse to pre-empt every conceivable criticism. Conversely, do not send obvious structural holes to PR-01 and call that adversarial review.

The correct sequence remains:

```text
COMPLETE THE OBJECT
  PR-00
      ↓
ATTACK THE OBJECT
  PR-01
      ↓
MAKE THE PRIVATE OBJECT
  PR-02
```

---

# 7. Chat-loss recovery

If PR-00 resumes without conversational context:

1. read this programme;
2. read issue #71;
3. read `publication-credibility-release-programme.md`;
4. read `publication-architecture.md`;
5. read `print-publication-editorial-proof.md`;
6. read `publication/publication.ts`;
7. read current `STATUS.md` and `project/maturity.ts`;
8. read the latest PR-00 gate record / candidate-book ledger;
9. continue from the first open PR-00 subgate.

Repository authority supersedes chat summaries.

---

# 8. Immediate next action

Begin **PR-00A**.

Create the candidate-book ledger by reconciling the publication architecture against the actual publication manifest and canonical sources. Do not start broad prose rewriting until that ledger has established the finite missing-work set.