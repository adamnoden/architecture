# PR-00E — Whole-Book Editorial Hardening Audit

**Status:** active gate control  
**Date:** 2026-10-14  
**Parent:** PR-00 — Candidate-Book Freeze Execution Programme  
**Entry baseline:** `12c3d7ce0ca1de88c4bdb99081418018716aeeb9`  
**Umbrella issue:** #71 — PUB-01 publication credibility and release programme

PR-00E is an editorial gate, not a new architecture programme. Its purpose is to make the candidate read as one architectural monograph rather than a sequence of individually competent project documents.

The audit distinguishes **real editorial defects** from material that merely reflects the book's research character. Explicit evidence boundaries, for example, are not removed simply because they sound less literary than the surrounding prose.

## 1. Whole-book judgement at entry

The manuscript is no longer structurally incomplete. Parts III and IV are publication-native, retained back matter exists, authority reconciliation is complete and the visual argument is now integrated.

The dominant remaining editorial risks are therefore narrower:

1. **process residue** — candidate-book, repository, development or status language that a reader should never have to know;
2. **mode changes** — Part II → III and III → IV can feel like switching document types unless transitions carry the reader deliberately;
3. **repeated qualification** — the same authority boundary can recur so often that it weakens rather than strengthens the prose;
4. **register drift** — occasional managerial or programme language inside otherwise architectural writing;
5. **ending dilution** — Part V can accumulate delivery procedure unless its final movement clearly returns to the architectural proposition;
6. **Ovidian inflation** — the temporal frame is strong precisely because it is sparse; repeated explanation would turn it into branding.

No architectural contradiction has yet been found by this audit.

## 2. Front matter and preface

### Preface

**Overall:** KEEP. The preface is authorial rather than administrative, and its corridor / kitchen / container / Paxton sequence earns the outsider-method argument rather than merely narrating project history.

**Hardening findings:**

- Note [5] ends with a literal repository path (`docs/research/preface-precedents.md`). That is development provenance leaking into the book and should not survive the candidate.
- The Ovidian explanation belongs at the end and is currently proportionate. Do not repeat the title's literary justification elsewhere merely for consistency.
- The preface is long, but compression should target duplicated explanation, not its sequence of examples. PR-01 may later attack whether all four examples are necessary; PR-00E should not pre-empt that adversarial question without a clear editorial defect.

### Reader's Guide

**Overall:** substantively useful, but it contains the clearest remaining process voice.

Required corrections:

- replace `At the candidate-book reconciliation point` with reader-facing present-tense maturity language;
- remove the sentence telling the reader that the web edition is the better place for provenance/live project state. The book can be self-sufficient; repository wayfinding belongs outside the linear publication;
- retain the distinction between evidence and maturity, but state it once cleanly rather than narrating the publication programme.

## 3. Parts I and II — argument

**Overall:** the strongest continuous prose in the book. Do not rewrite wholesale.

Hardening priorities:

- preserve the progression: different change rates → selective permanence → platform → designed interfaces → failure → maintenance geography → environmental/boundary consequences;
- use the new D-F01→04 figures to remove any nearby prose that merely redraws the same logic verbally, but do not delete the argument the figures depend on;
- check repeated phrases around `not every X should be removable/accessible` and proportionality. Repetition is useful where the scale changes, but not where one paragraph merely re-defends the project from the same caricature;
- retain evidence-bounded repose language. Do not make it more confident for literary smoothness.

No Part I/II rewrite is authorised before a passage-level duplication finding is recorded.

## 4. Part III — reference mode

**Overall:** publication-native and materially improved by PR-00B. The deliberate change from argument to reference should remain visible rather than being disguised.

Hardening priorities:

- preserve the opening sentence `A house cannot be drawn from principles alone.` as the mode-change hinge;
- the five fields, relational-pattern explanation and generative-sequence material should read as one introduction, not three independent method notes;
- now that D-F05 carries the fields/sequence distinction visually, check whether prose immediately around the figure repeats its labels line-for-line;
- retain stable PAT-* IDs, but avoid any implication that the book expects the reader to care about repository migration history.

The 21 canonical pattern pages remain architectural reference material, not prose chapters to be homogenised into Part I voice.

## 5. Part IV — worked house

**Overall:** the six-chapter synthesis succeeds as a worked interpretation rather than a gate log. Its strongest editorial task is to keep project specificity vivid without constantly apologising for it.

Hardening priorities:

- Chapter 13 should state the surrogate-site limitation once strongly, then move into the house; repeated reminders should survive only where a later claim genuinely depends on the absence of a real site;
- Chapter 14 should keep G-01, courtyard morphology and local tectonic dialect distinct without repeatedly restating the entire authority stack;
- Chapter 15's `pre-engineering coordination, not structural design` boundary is essential, but subsequent unresolved lists should not keep re-proving that same point unless they add new information;
- Chapters 16–17 now have D-F09→11. Check adjacent prose for duplicated plan-description that the figures can carry more efficiently;
- Chapter 18 scenarios are correctly prose-led. Do not add a generic scenario diagram unless later print proof exposes a real comprehension problem.

## 6. Part V — return from proposition to making

**Overall:** substantive rather than appendix filler. The risk is not lack of content but procedural accumulation.

Hardening priorities:

- preserve whole-life proportionality and interface ownership as architectural consequences, not project-management checklists;
- lists are justified where they function as review instruments; prose around them should not narrate the existence of the list;
- Chapter 25's `rewind before workaround` is a strong late-book proposition and should be allowed to carry more of the close;
- the final paragraph already returns to the central idea: a house can feel settled because change has disciplined places to occur. Protect that ending from additional programme/status material.

No separate conclusion chapter is currently justified.

## 7. Back matter

Back matter is allowed to be more documentary than Parts I–V. PR-00E should not literary-polish audit trails into ambiguity.

However:

- remove live-project or repository-wayfinding language where it has no enduring reader value;
- keep research debt explicit;
- leave cross-reference, nomenclature and glossary/source integrity to PR-00F unless a wording defect blocks editorial continuity now.

## 8. Internal execution slices

These are bounded editorial passes, not new programmes.

- **E1 — front matter + preface residue:** remove process/repository leakage; protect the opening temperament.
- **E2 — Parts I/II continuity + compression:** edit only recorded repetition/register defects.
- **E3 — Part III/IV mode + worked-house compression:** strengthen transitions; remove repeated authority narration where one boundary suffices.
- **E4 — Part V ending + whole-book voice pass:** reduce procedural drag and protect the final return to permanence-through-change.
- **E5 — closeout reread:** verify no assistant/conversation/repository residue, no new authority inflation, and no accidental loss of useful uncertainty.

## 9. Gate

PR-00E passes when:

- the primary reading path no longer sounds like a cleaned documentation export;
- process and repository residue is absent from reader-facing prose;
- Part transitions feel deliberate;
- repetition is structural rather than accidental;
- the Ovidian frame remains sparse and earned;
- Part V ends as architecture rather than administration;
- no editorial smoothing has widened evidence or authority.

The next gate after PR-00E is PR-00F — cross-reference, nomenclature and back-matter integrity.