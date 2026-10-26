# EDA — Editorial Doctrine Audit

**Status:** authorised / active — EDA-00 and EDA-01 closed; EDA-02 next  
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

### EDA-02 — Mechanical candidate scan

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

### EDA-03 — Preface and front-matter audit

Audit the highest-rhetoric surfaces first. Review sentence, paragraph and page staging together.

The current preface is the calibration case because it contains known failures that survived the previous overhaul.

### EDA-04 — Main manuscript audit

Audit governing doctrine and long-form manuscript material against their assigned modes. Preserve claim fidelity and architectural hierarchy.

### EDA-05 — Pattern, technical and reference-house audit

Audit low-rhetoric and technical surfaces for accidental manifesto voice, unnecessary repetition, terminology drift and explanatory-order failures.

### EDA-06 — Whole-book rhythm audit

Read the publication in order and inspect recurrence rather than isolated quality.

Questions include:

- how many rhetorical peaks remain, and are they actually peaks?
- does the same device recur often enough to become mannerism?
- do section endings repeatedly audition for quotation?
- does the book periodically return to ordinary explanatory prose?
- are the strongest sentences strengthened by surrounding restraint?

No fixed quota is authorised. Rarity is a compositional judgement, not a count target.

### EDA-07 — Adversarial cold read

Perform a hostile editorial read with one primary question:

> Where can I hear the author trying to sound important?

Also attack over-compression, bloodlessness and accidental loss of personality. EDA succeeds only if it removes performance without flattening the book.

### EDA-08 — Typeset proof and closeout

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

## 6. Known calibration failures

The current preface already provides useful EDA candidates:

- `Some durable inventions are agreements about where things meet.` — good thought, likely over-promoted by isolation and surrounding section staging.
- `Architecture has done this before.` — transition promoted into an event.
- `I am not an architect.` — substantively important disclosure, but isolation plus section staging may over-dramatise it.
- `That is the method of this book.` — likely pure importance signalling.
- the bold paired lines `Convention deserves respect, not immunity.` / `Novelty deserves scrutiny, not admiration.` — central distinction presented with manifesto-card treatment.
- `The question is how to earn that permanence.` — ordinary transition given exceptional weight.
- `That moment does not abolish expertise. It creates work for it.` — compressed cadence whose survival should depend on whole-book rhetorical density.

These are calibration candidates, not pre-authorised deletions. EDA-03 decides their final form in context under frozen Editorial Doctrine v0.4.

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

## 8. Current next action

Proceed to **EDA-02 — Mechanical candidate scan**. The scan is non-authoritative and must use [EDA-01](eda-01-corpus-register.md) for membership, prose mode and disposition. Do not begin EDA-03 prose repair until EDA-02 has produced the candidate register.