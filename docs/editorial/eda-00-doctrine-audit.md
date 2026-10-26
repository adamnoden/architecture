# EDA-00 — Editorial Doctrine audit

**Status:** active — audit complete enough to define hardening scope  
**Input standard:** Editorial Doctrine v0.3  
**Output target:** Editorial Doctrine v0.4  
**Programme:** [EDA — Editorial Doctrine Audit](eda-programme.md)

---

## 1. Finding

Editorial Doctrine v0.3 is fundamentally sound. EDA-00 does **not** justify replacing it.

The standard already identifies the manuscript's principal sentence-level pathology unusually well:

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

v0.3 primarily treats prose as sentences and paragraphs. The typeset manuscript demonstrates that typography and page composition can manufacture the same effect.

The hardened doctrine must explicitly treat the following as rhetorical devices:

- isolation by whitespace;
- horizontal or ornamental rules;
- bold full-sentence declarations;
- page-turn placement;
- short paragraphs placed immediately before or after section breaks;
- repeated use of visual separation to turn transitions into pronouncements.

The test is functional: does the layout clarify structure, or instruct the reader to experience an ordinary sentence as significant?

### 2.2 Local quality is not enough

v0.3 recognises density in places, but EDA requires a stronger book-scale rule.

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

Editors currently have good deletion tests but no explicit first move for an over-promoted sentence.

Add:

> **Remove the spotlight first.** Before deleting a potentially good sentence, return it to ordinary prose: remove isolation, bolding, rule-adjacency or dramatic paragraph treatment. If the thought remains useful, retain the thought without the staging.

This prevents EDA from overcorrecting by deleting good ideas merely because their presentation is corny.

### 2.5 Diagnostics must not become rules

The hardened standard should state more explicitly that mechanical detections are review candidates, not verdicts.

One-sentence paragraphs, antithesis, em dashes, bolding and short declarations are not prohibited forms. A linter can find their locations; it cannot determine whether they are earned.

The EDA scan must therefore optimise for recall rather than pretend to editorial judgement.

### 2.6 Preface privilege needs a stronger counterweight

v0.3 correctly gives the preface more authorial freedom. The current manuscript demonstrates the danger: permission for occasional rhetorical compression can become permission for repeated staging.

Harden the rule:

- preface rhetoric is judged by **rarity across the entire preface**, not permissibility at each local instance;
- section breaks do not automatically authorise a rhetorical peak;
- historical examples should normally be allowed to deliver their own force rather than being followed by a maxim that explains what to feel about them.

### 2.7 Final conformance must include the typeset object

Markdown conformance is insufficient. Pagination can create emphasis that is invisible in source.

The doctrine's workflow should end with a publication proof pass whenever prose is headed for a fixed-layout object. That pass checks page-level rhetorical effects as well as ordinary typographic defects.

---

## 3. Things not to add

EDA-00 should resist several tempting forms of over-hardening.

Do **not** add:

- quotas for aphorisms, one-sentence paragraphs or rhetorical questions;
- automatic deletion rules;
- banned-word lists;
- a prescribed average sentence or paragraph length;
- an instruction to eliminate all bold emphasis or section rules;
- a generic preference for longer paragraphs;
- a requirement that every sentence be informationally dense;
- a new universal house voice that erases prose-mode differences.

The doctrine is an instrument of judgement. Turning it into a style linter would reproduce the same mechanical writing problem from the opposite direction.

---

## 4. Self-audit of the guide

The guide itself is long, but its length is mostly functional: it separates prose modes, defines failure modes, preserves claim fidelity and gives an editing workflow. A wholesale compression would reduce its usefulness as an operating standard.

The guide's own rhetoric is also materially calmer than the manuscript it governs. Short standalone propositions occur, but mostly as definitions or operational instructions rather than attempts at profundity.

EDA-00 should therefore make a **surgical v0.4 hardening**, not a rewrite.

Expected changes:

1. raise version from v0.3 to v0.4;
2. extend sentence/paragraph economy into sentence/paragraph/page/book rhetoric;
3. add staged significance;
4. add the spotlight, transplantation, recurrence and earned-isolation tests;
5. strengthen the preface-mode rarity rule;
6. extend the editing workflow with whole-section / whole-book recurrence review;
7. add typeset-proof review for fixed-layout publication;
8. update the red-team checklist accordingly;
9. retain the existing core doctrine, examples and prose-mode system unless a direct contradiction is found during integration.

---

## 5. EDA-00 gate

EDA-00 closes only when Editorial Doctrine v0.4 contains the hardening above and has itself been reread for unnecessary rule growth, duplication and rhetorical over-shaping.

Until then, v0.3 remains canonical and no manuscript edit is accepted as an EDA conformance verdict.