# EDA — Editorial Doctrine Audit

**Status:** CLOSED — EDA-00–08 passed; final editorial acceptance recorded 2026-10-27
**Programme owner:** publication editorial control  
**Baseline:** `816c6ca71e20235dca83350eb0f3e2cd05186169`  
**Governing relationship:** post-migration assurance of the completed Editorial Overhaul  
**Audit standard:** Editorial Doctrine v0.4, frozen at blob `30fb6b2d67c356664430bca4996e38898ce91084`  
**Corpus register:** [EDA-01](eda-01-corpus-register.md)  
**Release effect:** EDA close is required before PR-02 private physical-object production

---

## 1. Purpose

The completed Editorial Overhaul improved the prose substantially but did not prove that the resulting manuscript conforms to the Editorial Doctrine as a whole object.

EDA exists to perform that proof.

It is not another general rewrite and it must not reopen architectural substance by stealth. It audits the current reader-facing corpus against a hardened editorial standard, repairs demonstrated failures, then verifies the result in reading order and in typeset form.

The trigger is a recurring failure visible in the current preface: sentences that are locally competent are sometimes given disproportionate rhetorical force through isolation, bolding, section rules, whitespace or page position. The existing doctrine already rejects over-shaped prose and continuous quotation-seeking, but the migration did not sufficiently control this page-level form of emphasis.

EDA calls that failure **staged significance**: importance manufactured by rhetorical or typographic treatment beyond what the argument itself earns.

---

## 2. Authority and non-authority

EDA may:

- revise the Editorial Doctrine where the audit demonstrates a general editorial rule;
- classify reader-facing prose by mode and audit it against that mode;
- remove, combine, relocate or restyle rhetoric whose primary function is emphasis;
- make local wording changes needed to restore ordinary explanatory prose;
- inspect typeset pages because layout is part of rhetoric;
- add diagnostics that flag likely editorial smells for human review.

EDA may not silently:

- change architectural propositions;
- strengthen or weaken evidence claims;
- alter controlled terminology or doctrine hierarchy;
- rewrite research provenance or frozen programme records;
- turn mechanical diagnostics into automatic editorial authority;
- impose numerical quotas for sentence length, paragraph length or rhetorical devices.

If an editorial repair appears to require a substantive architectural change, stop and hand the issue to the owning workstream.

---

## 3. Core distinction

EDA separates three layers that the previous migration treated too locally:

1. **Sentence rhetoric** — antithesis, aphorism, importance signalling, repeated polished cadence.
2. **Paragraph rhetoric** — isolation, dramatic stepping, paragraph-end morals, repeated transition announcements.
3. **Page and book rhetoric** — whitespace, bolding, rules, page turns, repeated section-break staging and the cumulative density of rhetorical peaks across chapters.

A sentence can be acceptable at layer 1 and still fail at layers 2 or 3.

The governing question is not merely “is this a good sentence?” but “has the manuscript earned the amount of attention this treatment asks the reader to give it?”

---

## 4. Programme

### EDA-00 — Audit and harden the Editorial Doctrine — CLOSED

Audit the standard before using it as the audit instrument.

Result:

- Editorial Doctrine v0.4 is frozen at blob `30fb6b2d67c356664430bca4996e38898ce91084`;
- staged significance and page-level rhetoric are explicit;
- whole-book recurrence and dynamic-range review are explicit;
- the **remove the spotlight first** test and related de-escalation tests are explicit;
- mechanical diagnostics are explicitly non-authoritative;
- preface rarity controls are strengthened;
- fixed-layout publication requires typeset-page review;
- the guide was self-audited for rule growth, duplication and over-hardening.

Gate result: passed. Corpus conformance work may begin under v0.4.

### EDA-01 — Corpus and prose-mode register — CLOSED

Enumerate the current reader-facing surfaces and assign each a prose mode. Explicitly classify what is in scope, lightly controlled, or provenance/frozen.

Result:

- Working Edition membership is bound to the existing mechanical publication manifest and adapter dependencies rather than duplicated manually;
- Primer authored edges and canonical-derived content are distinguished;
- the broader public website is included through the existing `project/public-surface.ts` boundary;
- every current reader-facing prose surface receives an owner, one of the six Editorial Doctrine prose modes, and an audit disposition;
- generated/machine-owned surfaces are distinguished from authored prose so EDA repairs the owning source rather than polishing projections;
- internal provenance and programme records remain explicitly outside publication-voice conformance.

Gate result: passed. [EDA-01 corpus register](eda-01-corpus-register.md) controls audit membership and mode assignment from EDA-02 onward.

### EDA-02 — Mechanical candidate scan — CLOSED

Create a non-authoritative smell register for likely failures, including:

- one-sentence paragraphs;
- short paragraphs immediately adjacent to section rules;
- full-sentence bold emphasis;
- repeated paired antitheses;
- repeated `The question is…`, `That is…`, `This is…` announcement constructions;
- clusters of short declaratives;
- repeated paragraph-end morals;
- repeated rhetorical questions;
- suspicious recurrence of the same cadence or punctuation pattern.

The scan produces candidates only. It must be allowed to generate false positives.

#### EDA-02 result

The baseline candidate register is [`eda-02-candidates.json`](eda-02-candidates.json): **128 canonical source paths, 147,412 words, 2,088 candidate records**. Its baseline is recorded in the JSON. Membership is evaluated directly from the existing TypeScript public-surface boundary, Working Edition / Primer manifests and adapter dependencies; no second path manifest is maintained.

Reproduce from repository root with `node --import tsx scripts/eda-candidates.ts <baseline-sha>`. The scanner rejects membership-authority drift. This overwrites the register; use a clean checkout of the recorded baseline when reproducing historical evidence. Source hashes and line locations bind findings to that snapshot, not to later edited line numbers.

The flags include sentence isolation, bold block quotations, sentence bolding, announcement forms, contrast candidates, questions, short-declarative clusters and short paragraphs before rules. Paragraph-end morals, paired cadence and cumulative recurrence still require contextual reading; the scan does not certify them. Generated prose is inventoried but must be repaired at its generator if necessary. Contextual dispositions for all 128 sources and their baseline candidates are recorded in [`eda-review-register.json`](eda-review-register.json). Zero findings does not certify a source. The baseline register is retained unchanged as evidence; revised line locations are not retrofitted into it.

Gate result: candidate production passed. No corpus-wide conformance claim follows.

### EDA-03 — Preface and front-matter audit — CLOSED

Audit the highest-rhetoric surfaces first. Review sentence, paragraph and page staging together.

The current preface is the calibration case because it contains known failures that survived the previous overhaul.

#### EDA-03 source review and calibration dispositions

Reviewed the complete Preface, Reader's Guide, and the two authored Primer edges under their EDA-01 modes. The source pass preserves references, historical examples, uncertainty, author disclosure, architectural priorities and conventional-construction comparisons. Physical-page acceptance is recorded under EDA-08 below.

| Calibration candidate | Source disposition and reason |
|---|---|
| “Some durable inventions…” | Retained within the preceding explanatory paragraph; the interface thought survives transplantation without isolated staging. |
| “Architecture has done this before.” | Integrated with the Paxton introduction; transition retained without a separate dramatic paragraph. |
| “I am not an architect.” | Retained with the qualification it introduces. Disclosure is essential; isolation is unnecessary. |
| “That is the method of this book.” | Removed; the preceding test and following comparison already specify the method. |
| Convention / novelty pair | Exact substantive distinction retained in ordinary paragraph prose; bold paired-card treatment removed. |
| “The question is how to earn that permanence.” | Replaced with a transition naming interfaces; the answer remains tentative. |
| “That moment does not abolish expertise…” | Recast as the need for expertise to test consequences, integrated with the pattern/drawing/prototype sequence. |

Other repeated closing morals were removed where their information was already carried by adjacent paragraphs. The opening Thorpe sentence, material aspirations, “The rest can be ancient”, and Ovid ending remain: the authorial mode permits personality. Narrative section breaks remain because the historical cases and changes of subject genuinely divide the argument. No rule against isolation, contrast or bolding has been introduced.

The Reader's Guide is retained unchanged: its bold reading-route labels are functional navigation, its lists define categories, and its qualifications carry necessary authority limits. The Primer proposition's two bold block quotations are returned to ordinary prose with their words intact. Primer outlook is retained: the prototype rejection permission and computational proof limits perform substantive work.

Gate result: passed, with physical-page acceptance completed under EDA-08.

### EDA-04 — Main manuscript audit — CLOSED

Reviewed the complete governing doctrine, manuscript, embedded canonical material and appendices under their assigned modes. Integrated duplicated transition announcements, removed repeated closing morals and the recurring “Build the permanent house…” display refrain, and reduced quotation/bold treatment where the text is explanatory. Definitions, actual governing requirements, technical constraints, evidence qualifications and references retain their different functions. The permanent-fabric rule remains visibly distinguished as a requirement. No architectural hierarchy or modality was revised.

Gate result: passed at source level. Page acceptance is recorded under EDA-08.

### EDA-05 — Pattern, technical and reference-house audit — CLOSED

Completed contextual review of all 128 registered sources, including patterns, Reference House material, research, grammar cases, computation, web entry pages, generated reports and compatibility redirects. [`eda-review-register.json`](eda-review-register.json) binds each disposition to baseline and reviewed source hashes. Reviewed publication figure and plate captions as supplemental authored surfaces; their descriptive labels and claim limits are retained.

Removed incidental manifesto cards and repeated maxims from research/technical introductions. Preserved source qualifications, normative lists, task questions and unsupported-domain boundaries. Fixed duplicated labels in the service-topology sequence and grammar-case copy defects. Machine identifiers, historical research provenance and generated outputs were retained.

One factual reconciliation is explicitly separate from stylistic revision: Appendix C's stale 280 mm planning going now reads 300 mm, matching the existing controlled `compiler/reference-house/fixture.ts` stair, RHC5 observations and principal-section proof. This records the existing Reference House choice; it does not change stair geometry, regulatory criteria or the fixture.

Gate result: passed. No candidate count or deletion quota was used as a conformance score.

### EDA-06 — Whole-book rhythm audit — CLOSED

Following the complete source review, traversed the assembled Working Edition in publication order, using its actual adapters and embedded canonical sources. Compared openings, transitions and paragraph endings across Parts and appendices, rather than treating locally polished sentences as sufficient.

The Preface retains the highest narrative range. Part I establishes terms and rules; Part II explains mechanisms; Part III uses a repeated reference anatomy; Part IV narrows to project choices; Part V explains execution; appendices carry evidence and reference records. Repeated pattern headings, removal/reinstatement checks and proof limits perform retrieval or safety-boundary work and are retained. These are not recurring paragraph-end applause lines. No global ban on contrast, short paragraphs or authorial compression was introduced.

Gate result: passed. The ordered recurrence pass supplements the full source reading; it is not represented as an independent second word-by-word reading.

Questions include:

- how many rhetorical peaks remain, and are they actually peaks?
- does the same device recur often enough to become mannerism?
- do section endings repeatedly audition for quotation?
- does the book periodically return to ordinary explanatory prose?
- are the strongest sentences strengthened by surrounding restraint?

No fixed quota is authorised. Rarity is a compositional judgement, not a count target.

### EDA-07 — Adversarial cold read — CLOSED

Perform a hostile editorial read with one primary question:

> Where can I hear the author trying to sound important?

Also attack over-compression, bloodlessness and accidental loss of personality. EDA succeeds only if it removes performance without flattening the book.

A separate hostile read of the revised Preface, manuscript openings/endings, Primer proposition and previously prominent web/research cards tested that question after the repair pass. Rechecked the full Preface without the candidate annotations, including the remaining terse turns. Thorpe's opening, the material aspirations, the ordinary-room ambition and the Ovid ending carry narrative or authorial work; retaining them avoids replacing personality with uniform technical prose. Conventional-construction comparisons and the permission for proposals to fail remain explicit. No material recurring mannerism or loss of claim qualification remained in this review.

Gate result: passed. This was an adversarial pass by the completing editor, not an independent reviewer or external architectural validation.

### EDA-08 — Typeset proof and closeout — CLOSED

Regenerate the publication and inspect physical pages, not merely Markdown.

Check:

- isolation created by pagination;
- accidental page-turn cliffhangers;
- rules and whitespace acting as emphasis;
- bolding or typographic hierarchy that promotes ordinary transitions into pronouncements;
- widows/orphans or layout artefacts that alter rhetorical force;
- the cumulative reading rhythm of representative full sections.

Only after this pass may EDA close and PR-02 proceed.

---

## 5. Editorial tests introduced by EDA

### The spotlight test

If a sentence appears powerful because it is isolated, bold or surrounded by whitespace, first remove that treatment and place it in ordinary prose.

If the thought remains useful, keep the thought and remove the spotlight.

If the thought collapses without staging, it probably was not carrying enough information.

### The transplantation test

Ask whether the sentence would still appear “important” if typeset as the middle sentence of a normal paragraph. If not, the layout may be doing the intellectual work.

### The recurrence test

A device can be excellent once and corny twenty times. Judge rhetorical forms at chapter and book scale, not only at the point of use.

### The earned-isolation test

A one-sentence paragraph or other isolated statement must earn isolation through a real structural function: a major turn, consequence, disclosure or compression that would be weakened by integration. “It sounds good alone” is not a structural function.

### The ordinary-prose test

Every chapter needs enough unshowy explanatory prose that genuine compression can register as compression. If every paragraph is polished to maximum finish, the chapter has no dynamic range.

---

## 6. Baseline calibration failures

The baseline Preface supplied the following calibration candidates:

- `Some durable inventions are agreements about where things meet.` — good thought, likely over-promoted by isolation and surrounding section staging.
- `Architecture has done this before.` — transition promoted into an event.
- `I am not an architect.` — substantively important disclosure, but isolation plus section staging may over-dramatise it.
- `That is the method of this book.` — likely pure importance signalling.
- the bold paired lines `Convention deserves respect, not immunity.` / `Novelty deserves scrutiny, not admiration.` — central distinction presented with manifesto-card treatment.
- `The question is how to earn that permanence.` — ordinary transition given exceptional weight.
- `That moment does not abolish expertise. It creates work for it.` — compressed cadence whose survival should depend on whole-book rhetorical density.

These were calibration candidates, not pre-authorised deletions. Their explicit EDA-03 dispositions above preserve the useful distinctions under frozen Editorial Doctrine v0.4.

---

## 7. Acceptance criteria

EDA closes only when:

- the hardened Editorial Doctrine is frozen as the audit standard;
- every in-scope public surface has a recorded prose mode and audit disposition;
- mechanical diagnostics have been reviewed rather than blindly applied;
- known staged-significance candidates have explicit dispositions;
- a whole-book recurrence pass has been completed;
- a cold adversarial read finds no material recurring rhetorical mannerism;
- typeset proof has been reviewed for page-level manufactured emphasis;
- claim fidelity is preserved;
- no unresolved editorial defect material to PR-02 remains.

EDA is an editorial assurance gate, not evidence that the architecture itself is externally validated.

---

## 8. Final acceptance — 2026-10-27

EDA-00–08 have passed. All 128 registered sources have contextual dispositions bound to reviewed hashes; the 2,088 baseline candidate records remain recoverable. The complete source review, publication-order recurrence pass and adversarial editorial pass are recorded above. No unresolved editorial defect material to PR-02 remains in the reviewed object.

### Physical proof and repairs

Built and inspected the Working Edition in A4 and conservative B5, and the complete 16-page A4 Primer. Whole-book contact sheets were used for composition and recurrence, followed by reading-size inspection of complete Preface and pattern sections and representative interface, reference-house, execution and appendix pages. The full Primer was inspected at reading size. This is page review, not a claim that every leaf received a separate high-resolution inspection.

The page review repaired three demonstrated failures:

- An otherwise empty numbered front-matter marker page and unnecessary parity blank: move the recto break to the front-matter context marker, keeping it with its heading.
- A single closing sentence isolated on a nearly empty chapter-end page: integrate it with the explanation it qualifies. Ordinary short chapter tails remain permissible.
- Twelve Part IV headings separated from their opening explanation by full-page plates: the existing production typography adapter now keeps the opening paragraph with its heading before the plate. The frozen DRW plate register, all drawing assets, scales, plate classes and pins remain unchanged. The prepared Part IV text was byte-compared against the visually reviewed composition when moving this repair into its proper production owner.

The Preface's historical transitions and rules divide actual changes of subject. Its useful compressed turns remain within a wider field of ordinary explanation. Normative emphasis, pattern anatomy, evidence limits, plate furniture and deliberate Part openings remain distinguishable from rhetorical spotlighting. No remaining material staged-significance defect was found in the inspected sections. The page review does not replace the independent PLT physical drawing freeze.

### Accepted proof identity

The final-source production proof was rebuilt by [CI run 40396197085](https://github.com/adamnoden/architecture/actions/runs/40396197085) at `821212266485d7c0c3bbd90149ba9fb87ea0a2d2`. Its downloaded PDFs were inspected to confirm the front-matter and Part IV repairs in the CI renderer as well as the local renderer. Source dispositions are bound to their content hashes, not to line numbers in the baseline scan.

| Proof | Pages | Duplex leaves | Normalised PDF SHA-256 |
|---|---:|---:|---|
| Working Edition A4 | 275 | 138 | `462f05341c4f04ae969272d4b5a430b91fc0f4ad9d909c8702e0e73a6e2cf87a` |
| Working Edition B5 | 327 | 164 | `17b0a5a9ebb41439c53398720caa5b99adcf2fa7a365b418ab913512f9cfd50d` |
| Primer A4 | 16 | 8 | Local complete-page inspection; metadata checked against the built PDF. |

The paired production proof and diagnostics are attached to that run as `publication-typography-production-proof` and `publication-typography-production-diagnostics`. They record five frozen embedded font faces, correct page geometry, five recto Part openings, zero parser warnings, deterministic destination normalisation and all twelve heading/paragraph transformations. Artifact retention follows the existing CI policy; the source record and hashes remain in Git.

`publication/metadata.json`, `publication/typography-metadata.json` and the derived project data plate track the current content. The exact RC2 release pagination and typography-release authority are preserved unchanged; this audit does not refreeze the historical release or assert a manufactured spine width.

### Validation and boundaries

All eight workflows passed on the accepted source/layout head: repository health and site build, paired production typography and ledger, selected Source proof, hierarchy proof, mixed-content proof, difficult-content inventory, representative manifest audit and representative signature proof. DRW freeze tests passed after restoring the frozen plate register. Final closure/status integration is revalidated at its exact PR head before merge; the post-merge cleanup result is recorded in [PR #871](https://github.com/adamnoden/architecture/pull/871).

The local runtime required the equivalent `node --import tsx` loader in place of the restricted `tsx` IPC entry point, an isolated Chromium renderer and PDF inspectors. Tracked dependencies, package commands and proof assertions were not weakened to accommodate the environment.

Claim fidelity is preserved apart from the separately documented reconciliation of stale stair-going prose to its existing controlled fixture. No architectural proposition, compiler supported domain, maturity level, regulatory criterion or external-validation claim is promoted. EDA removes its editorial block on PR-02; final manufacture still requires the independent PLT drawing freeze and its owning production authority.
