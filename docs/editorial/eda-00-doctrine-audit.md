# EDA-00 — Editorial Doctrine audit

**Status:** CLOSED — Editorial Doctrine v0.4 frozen  
**Input standard:** Editorial Doctrine v0.3  
**Output standard:** Editorial Doctrine v0.4  
**Frozen standard blob:** `30fb6b2d67c356664430bca4996e38898ce91084`  
**Programme:** [EDA — Editorial Doctrine Audit](eda-programme.md)

---

## 1. Finding

Editorial Doctrine v0.3 was fundamentally sound. EDA-00 did **not** justify replacing it.

The standard already identified the manuscript's principal sentence-level pathology unusually well:

- over-shaped prose;
- continuous quotation-seeking;
- one-line sentences manufactured for importance;
- strings of one-sentence paragraphs;
- negative parallelism;
- manufactured aphorism;
- importance signalling;
- symmetry addiction;
- escalating restatement;
- paragraph-end morals;
- the need for strong sentences to be surrounded by ordinary competent prose.

The current preface nevertheless contains obvious instances of exactly those failures. The problem is therefore partly **assurance failure**: a good standard existed, but conformance was not proved at the end of the earlier migration.

EDA must fix both the remaining blind spots in the standard and the missing audit discipline around it.

---

## 2. Blind spots requiring hardening

### 2.1 Layout is rhetoric

v0.3 primarily treated prose as sentences and paragraphs. The typeset manuscript demonstrates that typography and page composition can manufacture the same effect.

The hardened doctrine must explicitly treat the following as rhetorical devices:

- isolation by whitespace;
- horizontal or ornamental rules;
- bold full-sentence declarations;
- page-turn placement;
- short paragraphs placed immediately before or after section breaks;
- repeated use of visual separation to turn transitions into pronouncements.

The test is functional: does the layout clarify structure, or instruct the reader to experience an ordinary sentence as significant?

### 2.2 Local quality is not enough

v0.3 recognised density in places, but EDA requires a stronger book-scale rule.

A rhetorical device can be justified locally and still become mannerism through recurrence. Conformance therefore has to be judged at four scales:

1. sentence;
2. paragraph;
3. section / chapter;
4. whole book.

The manuscript needs dynamic range. Ordinary competent prose is not a failure state; it is what allows genuinely compressed moments to retain force.

### 2.3 Staged significance needs a name

The doctrine should name the recurring combined failure:

> **Staged significance:** importance manufactured by rhetorical or typographic treatment beyond what the argument itself earns.

Naming it is useful because the defect often crosses sentence, paragraph and layout boundaries and is therefore awkward to describe using only existing categories.

This is not a licence for another proliferation of coined terminology. The term belongs in editorial control, not the public manuscript.

### 2.4 The doctrine needs a de-escalation test

Editors previously had good deletion tests but no explicit first move for an over-promoted sentence.

The required rule is:

> **Remove the spotlight first.** Before deleting a potentially good sentence, return it to ordinary prose: remove isolation, bolding, rule-adjacency or dramatic paragraph treatment. If the thought remains useful, retain the thought without the staging.

This prevents EDA from overcorrecting by deleting good ideas merely because their presentation is corny.

### 2.5 Diagnostics must not become rules

The hardened standard must state explicitly that mechanical detections are review candidates, not verdicts.

One-sentence paragraphs, antithesis, em dashes, bolding and short declarations are not prohibited forms. A linter can find their locations; it cannot determine whether they are earned.

The EDA scan must therefore optimise for recall rather than pretend to editorial judgement.

### 2.6 Preface privilege needs a stronger counterweight

v0.3 correctly gave the preface more authorial freedom. The current manuscript demonstrates the danger: permission for occasional rhetorical compression can become permission for repeated staging.

The hardened rule is:

- preface rhetoric is judged by **rarity across the entire preface**, not permissibility at each local instance;
- section breaks do not automatically authorise a rhetorical peak;
- historical examples should normally be allowed to deliver their own force rather than being followed by a maxim that explains what to feel about them.

### 2.7 Final conformance must include the typeset object

Markdown conformance is insufficient. Pagination can create emphasis that is invisible in source.

The doctrine's workflow must end with a publication proof pass whenever prose is headed for a fixed-layout object. That pass checks page-level rhetorical effects as well as ordinary typographic defects.

---

## 3. Things deliberately not added

EDA-00 resisted several tempting forms of over-hardening.

v0.4 does **not** add:

- quotas for aphorisms, one-sentence paragraphs or rhetorical questions;
- automatic deletion rules;
- banned-word lists;
- a prescribed average sentence or paragraph length;
- an instruction to eliminate all bold emphasis or section rules;
- a generic preference for longer paragraphs;
- a requirement that every sentence be informationally dense;
- a new universal house voice that erases prose-mode differences.

The doctrine remains an instrument of judgement. Turning it into a style linter would reproduce the same mechanical writing problem from the opposite direction.

---

## 4. v0.4 integration result

Editorial Doctrine v0.4 retains the v0.3 structure, examples, prose modes and claim-fidelity controls. The hardening is bounded to the demonstrated gaps.

It adds or strengthens:

1. explicit non-authority of mechanical diagnostics;
2. preface-scale rarity and section-break discipline;
3. sentence → paragraph → chapter → whole-book recurrence review;
4. page composition as rhetoric;
5. the definition of **staged significance**;
6. spotlight, transplantation, recurrence and earned-isolation tests;
7. the ordinary-prose / dynamic-range test;
8. de-escalation before deletion;
9. a whole-section / whole-book recurrence pass in the editing workflow;
10. mandatory typeset-page inspection for fixed-layout publication;
11. corresponding red-team questions and compressed-editor guidance.

No architectural proposition, evidence rule, controlled architectural term or doctrine hierarchy was changed.

---

## 5. Self-audit of v0.4

The integrated guide was reread as an object rather than checked only against the EDA-00 checklist.

### Rule growth

The new rules all map to a demonstrated failure that v0.3 did not control strongly enough: page-level staging, recurrence across larger scales, over-deletion risk, diagnostic overreach or final-proof omission. No adjacent editorial preference was promoted merely because the document was open for editing.

### Duplication

Some concepts intentionally appear in both the general economy section and the diagnostic/red-team machinery because those locations serve different operations: one defines the judgement, the other tells an editor where to apply it. No separate parallel doctrine or second vocabulary was created.

### Mechanical enforcement risk

The guide now states explicitly that diagnostics are candidates rather than verdicts and retains the prohibition on quotas and banned forms. The added tests require contextual judgement rather than numerical compliance.

### Overcorrection risk

The spotlight rule makes de-escalation the first response to over-promoted prose. This protects useful thought and authorial personality from being deleted merely because presentation is theatrical.

### Guide rhetoric

The v0.4 additions use operational prose. The guide does not itself rely on staged significance to state the new rules, and the term **staged significance** remains internal editorial vocabulary rather than manuscript branding.

### Proportionality

The change is surgical relative to the existing standard. The guide remains long because its existing function requires separate prose modes, claim-fidelity controls, examples and workflow; EDA-00 found no evidence that a wholesale compression would improve its operating value.

**Result:** no further doctrine hardening is earned before corpus audit. Additional rules may be added later only if EDA reveals a genuinely new general failure mode.

---

## 6. Gate result

EDA-00 is closed.

Editorial Doctrine v0.4, blob `30fb6b2d67c356664430bca4996e38898ce91084`, is the frozen audit standard for EDA-01 onward.

This closeout proves that the audit instrument has been hardened and self-audited. It does **not** prove that any manuscript surface conforms to it. That work begins with EDA-01, the corpus and prose-mode register.