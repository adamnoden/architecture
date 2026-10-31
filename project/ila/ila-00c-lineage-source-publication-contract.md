# ILA-00C — Lineage, source and publication-treatment contract

**Programme:** [#630 — ILA — intellectual lineage and attribution audit](https://github.com/adamnoden/architecture/issues/630)  
**Packet:** [#638 — ILA-00C — lineage, source and publication-treatment contract](https://github.com/adamnoden/architecture/issues/638)  
**Depends on:** ILA-00B / PR #637 / merge `7e1cc8800ad96cd76725f6b7faf5cc8d651d9082`  
**Baseline `main`:** `7e1cc8800ad96cd76725f6b7faf5cc8d651d9082`  
**State:** methodology contract; no new source discovery and no attribution verdicts

## 1. Purpose

ILA-00A froze what Ovid’s House currently cites. ILA-00B froze the fifteen claims important enough to trace. ILA-00C freezes **how the tracing is allowed to work** before new discovery begins.

The central problem is that several different questions are easily collapsed:

- Did this project actually encounter the source while forming the claim?
- Did the source articulate the idea earlier?
- Did one source explicitly derive the idea from another?
- Is the source merely similar?
- Is it empirical evidence rather than conceptual lineage?
- Is it a built example rather than a theory?
- Is it important enough to affect the book?
- Does importance require reader-facing prominence?

ILA must answer those independently.

> **A source may be important without having influenced Ovid’s House. A source may have influenced Ovid’s House without being the earliest antecedent. A source may be the earliest antecedent without deserving reader-facing prominence.**

This contract therefore uses several separate dimensions rather than one catch-all label.

---

# 2. Atomic unit

The atomic ILA record is not “thinker X influenced Ovid’s House”. It is:

`claim → source → project-contact status → intellectual relationship → edge evidence → chronology → importance → Ovid delta → current treatment → required treatment`

Where a source-to-source genealogy matters, create a second explicit edge:

`source A → source B → relationship → edge evidence → chronology`

Do not infer the source A → Ovid’s House edge merely because source B has one.

No lineage graph may contain an untyped arrow.

---

# 3. Dimension A — project-contact status

Project-contact status records what can actually be shown about **Ovid’s House encountering or using a source**. It is independent of whether the source is an antecedent, parallel, counterpoint, evidence or precedent.

## `DOCUMENTED_FORMATIVE_SOURCE`

Use only when recoverable project evidence shows that engagement with the source materially informed, changed, sharpened or constrained the claim during its formation or revision.

Acceptable evidence can include:

- a dated repository issue, research record or decision note showing the source being used to form or revise the proposition;
- a commit sequence where the source is introduced together with a material conceptual change and the record states the relationship;
- an explicit contemporaneous project note identifying the source as formative;
- another durable project record that establishes both contact and conceptual consequence.

Mere chronology is insufficient.

## `DOCUMENTED_ADOPTED_SOURCE`

Use when the project consciously adopts or uses a source to explain, support, test or refine a claim, but the available record does not establish that the source formed the original idea.

This is likely to be common. It is an honest category, not a weaker substitute for “influence”.

## `CURRENTLY_ACKNOWLEDGED_SOURCE`

Use when the source is named or cited in current Ovid’s House material but the timing and formative role are unresolved.

A current citation proves current acknowledgement only.

## `NO_DOCUMENTED_PROJECT_CONTACT`

Use when no durable evidence establishes that the source participated in development of Ovid’s House before ILA discovered it.

This remains the correct status even when the source is a powerful earlier antecedent.

## `PROJECT_CONTACT_UNRESOLVED`

Use when there is evidence of contact but insufficient evidence to distinguish formative from later adoption.

### Project-contact prohibition

Do not write `influenced Ovid’s House`, `Ovid derives from`, `source of the Ovid claim`, or equivalent causal language unless the project-contact status is `DOCUMENTED_FORMATIVE_SOURCE` and the relevant conceptual consequence is evidenced.

If a source was discovered during ILA after the claim already existed, ILA discovery cannot retroactively make that source formative.

---

# 4. Dimension B — intellectual relationship type

This dimension answers **what kind of intellectual relationship exists**, regardless of project contact.

Use one primary type per source-to-claim edge. Add qualifiers where necessary rather than inventing hybrids.

## `DOCUMENTED_DERIVATION`

The later node explicitly derives, credits or demonstrably takes the relevant proposition from the earlier node.

This is primarily a source-to-source relationship, but may also describe a project edge when `DOCUMENTED_FORMATIVE_SOURCE` evidence is strong enough.

Requirements:

- the relevant proposition must be the thing actually derived, not merely another idea in the same work;
- the derivation must be evidenced by primary text, contemporaneous record or strong historical scholarship;
- “B cites A” is not enough if B cites A for a different proposition.

## `EARLIER_ANTECEDENT`

The source predates the Ovid claim or later source and materially articulates the same or a closely related proposition, but causal influence is not established.

This is the preferred term for prior art where chronology and conceptual overlap are clear but genealogy is not.

Do not upgrade `EARLIER_ANTECEDENT` to `DOCUMENTED_DERIVATION` merely because the chronological sequence is persuasive.

## `CONVERGENT_PARALLEL`

The source reaches a materially similar position through a different problem frame, discipline, tradition or apparently independent route.

Use where resemblance is real enough to sharpen the Ovid claim but ancestry would be misleading.

## `COUNTERPOINT`

The source provides a serious alternative, criticism, failure case or boundary condition that materially limits, contests or reframes the Ovid claim.

Counterpoints are first-class evidence. Do not demote a source because it disagrees with the project.

## `EVIDENTIAL_SUPPORT`

The source supplies empirical, technical, normative, historical or professional support for the proposition without being its conceptual ancestor.

Examples include standards, service-life data, ergonomic studies and professional guidance where their job is to establish a bounded fact or constraint.

## `PRECEDENT_EXEMPLAR`

A built, drawn, organisational or material example demonstrates the proposition, a variant, or a failure mode without necessarily articulating the governing idea.

Precedent demonstrates possibility or consequence; resemblance does not establish lineage.

## `INTERPRETIVE_FRAME`

The source helps frame meaning, identity, transformation or another interpretive question without supplying architectural or technical authority.

Ovid, Heraclitus and Ship-of-Theseus material are the current obvious examples of this category.

## `METHOD_ANTECEDENT`

The source materially precedes or informs a method of representing, generating or testing architectural knowledge rather than a physical architectural proposition.

This exists principally for ILA-C15 and related design-method questions. It must not be used to absorb visual precedent owned by DRW/PLT/TYP.

### Relationship prohibition

Do not use `ancestor`, `descended from`, `lineage`, `derives from` or an arrow implying causal inheritance where the edge is only `EARLIER_ANTECEDENT` or `CONVERGENT_PARALLEL`.

In internal records, prefer the exact type over picturesque genealogy language.

---

# 5. Source-to-source edges

Source genealogy and project genealogy are separate graphs.

For example, if a later architectural writer explicitly credits an earlier systems theorist, record:

`earlier source → later source = DOCUMENTED_DERIVATION`

If Ovid’s House later used the architectural writer but never encountered the earlier source during development, the project edges may be:

`later source → Ovid = DOCUMENTED_ADOPTED_SOURCE + [relevant intellectual type]`

`earlier source → Ovid = NO_DOCUMENTED_PROJECT_CONTACT + EARLIER_ANTECEDENT`

The existence of a documented A → B edge does not manufacture a documented A → Ovid influence edge.

This rule is specifically intended to prevent neat but false chains such as `A → B → C → Ovid` being drawn from chronology plus resemblance.

---

# 6. Dimension C — importance to Ovid’s House

Importance is independent of relationship type and project contact.

## `FOUNDATIONAL`

The source materially changes understanding of a governing Ovid proposition or several major claim families. Omitting it from the internal lineage model would materially distort the project’s intellectual position.

## `MAJOR`

The source materially clarifies, anticipates, challenges or bounds one important claim family. It is necessary for an accurate account of that family but does not organise the project as a whole.

## `SUPPORTING`

The source adds useful precision, corroboration, contrast or history but does not materially change the core lineage judgement once FOUNDATIONAL / MAJOR sources are understood.

## `PERIPHERAL`

The source is relevant enough to retain in research notes but does not affect attribution, Ovid delta or publication treatment.

### Importance rules

- A `COUNTERPOINT` can be `FOUNDATIONAL`, `MAJOR`, `SUPPORTING` or `PERIPHERAL`.
- A `DOCUMENTED_FORMATIVE_SOURCE` is not automatically `FOUNDATIONAL`.
- An `EARLIER_ANTECEDENT` may be `FOUNDATIONAL` even with `NO_DOCUMENTED_PROJECT_CONTACT`.
- Fame, citation count and canonical status do not establish importance.

---

# 7. Dimension D — edge confidence

Do not use numerical confidence scores.

## `DOCUMENTED`

The relationship itself is directly supported by primary evidence or an explicit durable project record.

## `STRONG`

The relationship is strongly supported by the relevant texts and chronology, preferably with independent scholarly corroboration, but causal influence is not directly documented.

`STRONG` cannot be used to smuggle an undocumented influence claim into the graph. A `STRONG EARLIER_ANTECEDENT` remains an antecedent.

## `TENTATIVE`

There is meaningful evidence for the relationship but important ambiguity remains about scope, chronology, wording or conceptual equivalence.

## `UNRESOLVED`

The source may matter, but the evidence is not sufficient to type the edge reliably.

### Confidence discipline

When uncertainty concerns a specific fact, state the uncertainty rather than lowering a generic confidence label. Examples:

- first publication date uncertain;
- English translation post-dates the relevant project period;
- concept appears in a secondary account but primary page not yet located;
- source cites an earlier author but not clearly for this proposition;
- project contact predates the surviving repository record and cannot be reconstructed.

---

# 8. Source-quality and reading contract

ILA is not allowed to make strong lineage claims from weak source chains when stronger sources are reasonably available.

## Tier A — primary source

Preferred basis for the substantive proposition:

- original book, article, lecture, essay, interview or archival statement by the relevant author / office;
- original project documentation for a built precedent;
- original standard, regulation or professional document where the issue is normative;
- contemporaneous project record where the issue is Ovid project contact.

Primary does not mean infallible. It means the source is closest to the proposition being attributed.

## Tier B — authoritative secondary scholarship

Use to establish historical context, chronology, disputed authorship, terminology, reception, source-to-source derivation and intellectual context.

Examples include peer-reviewed scholarship, respected academic monographs, institutional archives and serious histories of the relevant movement or office.

## Tier C — reputable secondary orientation

Use for discovery, terminology and locating stronger sources: reputable essays, publisher material, professional institutions, substantial interviews and other credible secondary accounts.

A Tier C source may support a minor contextual point but should not normally be the sole basis for a FOUNDATIONAL or MAJOR lineage edge when Tier A/B evidence is obtainable.

## Tier D — tertiary discovery only

Search snippets, unsourced summaries, generic blogs, Wikipedia-like tertiary summaries and casual online discussion may identify candidate names or works. They do not close a lineage judgement.

### Reading rule

Once a candidate becomes potentially FOUNDATIONAL / MAJOR, stop relying on repeated summaries and read the primary work or the strongest recoverable primary material relevant to the proposition.

A famous quotation reproduced by later writers is not a substitute for checking its original context.

---

# 9. Bibliographic identity, chronology and edition contract

Every source promoted beyond discovery must record enough identity to prevent chronology and attribution errors.

At minimum:

- author(s) / office / institution;
- title;
- source type;
- first publication / presentation date where known and relevant;
- edition actually consulted;
- edition publication date;
- translator and translation date where applicable;
- page / section / figure location for the relevant proposition where recoverable;
- original domain / problem being addressed;
- jurisdiction where material;
- URL / DOI / archive identifier where appropriate;
- access date for unstable online material.

### Chronology fields

For an important source-to-Ovid edge, separately record:

1. earliest known articulation of the relevant source proposition;
2. first known Ovid claim formulation in durable project history;
3. first documented project contact with the source;
4. date of any later material revision of the Ovid claim attributable to that contact.

If the Ovid claim clearly predates first documented contact, the source cannot be labelled formative on the available evidence.

If a source existed earlier but only a later translation / edition was available to the project, keep those facts separate.

---

# 10. Scope and domain-transfer contract

A source must be understood in the problem it was actually addressing before Ovid borrows from it.

For each FOUNDATIONAL / MAJOR source, record:

- original building type / discipline / scale / institutional context;
- actor or decision-maker the theory assumes;
- time horizon;
- technical conditions that make the proposition work;
- what the source explicitly does **not** claim where material;
- what must change for transfer into a detached domestic house.

Cross-domain transfer must identify the shared mechanism, not merely shared vocabulary.

The test is:

> **If the source domain were removed from the explanation, what exact causal or organisational mechanism would still survive in architecture?**

If the answer is unclear, the transfer remains `TENTATIVE` or is rejected.

Commercial-office flexibility, ecological hierarchy, software evolution, manufacturing quality systems and reliability engineering all require this check.

---

# 11. Current acknowledgement is not formative influence

This distinction is sufficiently important to restate as a gate.

The following do **not** prove formative influence:

- appearing in `Sources and further reading`;
- being cited in the current manuscript;
- being discussed in a later research packet;
- using similar terminology;
- predating Ovid’s House;
- being widely known in architecture;
- being cited by another source that Ovid uses;
- being discovered during ILA and looking uncannily close to an Ovid claim.

The correct disposition in those cases is one of `DOCUMENTED_ADOPTED_SOURCE`, `CURRENTLY_ACKNOWLEDGED_SOURCE`, `NO_DOCUMENTED_PROJECT_CONTACT` or `PROJECT_CONTACT_UNRESOLVED`.

---

# 12. Novelty, priority and authorship language

ILA is not a novelty-defence exercise.

## Prohibited without exceptional proof

Do not write that Ovid’s House is:

- the first;
- unprecedented;
- novel in the historical-priority sense;
- the origin of an idea;
- uniquely the inventor of a concept;

unless a later bounded priority study explicitly supports that claim. ILA itself is not designed to prove universal historical priority.

## Permitted authorship claims

The project may accurately say:

- `this book uses X to mean ...`;
- `Ovid’s House proposes ...`;
- `the project combines ...`;
- `the project applies ...`;
- `the project sharpens ... into ...`;
- `the project uses the term ...`;

when referring to its own formulation, synthesis, decision rule or implementation — provided this does not imply priority for the underlying idea.

A coined term can be project-authored even when the concept it names has deep antecedents.

`No antecedent found in the bounded search` is a research result, never a priority claim.

---

# 13. Ovid-delta vocabulary

For every FOUNDATIONAL / MAJOR overlap, later ILA packets must state the Ovid delta using one or more of the following types.

## `INHERITS`

Ovid substantially adopts the earlier proposition without a material conceptual change.

## `SYNTHESISES`

Ovid combines previously distinct propositions or traditions into one architectural framework.

## `OPERATIONALISES`

Ovid turns a general proposition into an architectural decision rule, pattern, sequence, interface or verification method.

## `TRANSFERS_DOMAIN`

Ovid brings a mechanism from another building type or discipline into the domestic architectural problem with explicit transfer limits.

## `NARROWS`

Ovid restricts a broader antecedent to a more proportionate or defensible domain.

## `EXTENDS`

Ovid adds a material consequence not present in the antecedent, where the source review supports that distinction.

## `DIVERGES`

Ovid rejects or materially departs from the earlier position.

## `RESTATES_OR_APPLIES`

Ovid primarily restates or applies established thinking without a material conceptual delta.

## `DELTA_UNRESOLVED`

The relationship is understood but the distinct Ovid contribution is not yet defensible.

### Delta rule

Do not manufacture an `EXTENDS` or `SYNTHESISES` finding to preserve a sense of originality. `INHERITS` and `RESTATES_OR_APPLIES` are successful and important findings when accurate.

---

# 14. Reader-facing publication-treatment ladder

Importance to research and prominence in the book are separate decisions.

Use the **smallest treatment that restores intellectual honesty and improves the manuscript**.

## `T0 — INTERNAL_ONLY`

Retain in ILA research / lineage apparatus. No reader-facing change.

Use when the source is relevant to internal understanding but naming it would not materially help the argument or attribution.

## `T1 — REFERENCE_ONLY`

Include or correct the bibliography / Sources and further reading apparatus without naming the source in prose.

## `T2 — LOCAL_NOTE`

Add a local citation, endnote or restrained source note where a proposition benefits from attribution but prose-level naming would interrupt the argument.

## `T3 — LOCAL_PROSE_ACKNOWLEDGEMENT`

Name the source / tradition in the relevant argument because the intellectual inheritance is material to understanding that claim.

## `T4 — STRUCTURAL_ACKNOWLEDGEMENT`

Give the source or converging tradition a compact synthesis passage because several central Ovid claims depend on understanding the relationship.

This does not automatically mean an intellectual-history chapter.

## `T5 — SUBSTANTIVE_CORRECTION`

The current manuscript materially overstates novelty, misattributes a proposition, collapses distinct sources, or otherwise requires substantive correction rather than simple citation.

T5 may involve removing or demoting an existing attribution as well as adding one.

### Treatment rules

- FOUNDATIONAL does not automatically imply T4.
- A source may be FOUNDATIONAL internally and T2 publicly if the book already states the inherited idea accurately and a note is enough.
- A MAJOR source can require T5 if the current prose is materially misleading.
- Reader-facing treatment must obey `docs/editorial/editorial-doctrine.md`; ILA taxonomy must not leak into the publication.
- Do not add a theory-history excursus merely to display research depth.

---

# 15. Attribution finding vocabulary

ILA-04 will use the following finding vocabulary against current treatment.

## `ADEQUATE`

Current treatment is proportionate and materially accurate.

## `UNDER_ATTRIBUTED`

A material intellectual debt or antecedent is insufficiently acknowledged for the way the current text presents the claim.

## `MISATTRIBUTED`

Current text attributes the proposition to the wrong source, wrong source level, wrong lineage or wrong causal relationship.

## `OVER_CREDITED`

Current treatment gives a source more causal, conceptual or historical authority than the evidence supports.

## `LINEAGE_UNCERTAIN`

Evidence is insufficient to make a clean attribution judgement.

## `NO_PUBLIC_ACKNOWLEDGEMENT_REQUIRED`

The source matters internally but does not need reader-facing treatment.

## `SUBSTANTIVE_QUALIFICATION_REQUIRED`

The claim itself or its implied novelty / scope requires narrowing or reframing, not merely a better citation.

A claim can receive more than one finding where they answer different questions, but avoid redundant label stacking.

---

# 16. Minimum source record for ILA-01 onward

Every candidate that survives discovery beyond a passing mention must have a compact record containing:

```text
SOURCE ID
bibliographic identity
source quality tier
claim IDs
relevant proposition
original problem / domain
project-contact status
intellectual relationship type
edge confidence
chronology
importance
current Ovid treatment
candidate publication treatment
possible Ovid delta
transfer limits
contradictory / negative evidence
unresolved questions
provenance / location
```

Discovery records may leave importance, treatment and delta provisional. They may not leave bibliographic identity or relationship uncertainty hidden.

Deep ILA-02 dossiers expand this contract rather than replacing it.

---

# 17. Concept-family discovery contract

ILA-01 begins from the fifteen claims in ILA-00B, not from a list of thinkers.

For each family:

1. state the Ovid claim IDs and the conceptual question;
2. identify current named sources from ILA-00A;
3. identify search terminology used by the relevant historical / professional traditions;
4. discover candidate antecedents, parallels and counterpoints;
5. verify bibliographic identity before treating a candidate as real;
6. follow backwards citations toward earlier material articulations;
7. follow forwards only where criticism, synthesis or reception materially changes interpretation;
8. admit cross-domain material only where the mechanism is relevant;
9. retain negative findings and rejected candidates where they prevent repeated false leads;
10. stop at decision saturation.

Do not rank sources by fame or frequency of citation.

Do not deep-read every candidate in ILA-01. Deep primary-source dossiers belong in ILA-02 for candidates that survive as potentially FOUNDATIONAL / MAJOR or material COUNTERPOINTS.

---

# 18. Decision saturation

ILA seeks **decision saturation, not bibliographic completeness**.

A concept family is ready to freeze discovery when all of the following are true:

- the strongest currently known antecedent(s) are identified well enough to test in primary sources;
- obvious earlier-source chains have been traced until additional backwards searching no longer changes the likely lineage structure;
- at least one serious counter-tradition / limiting source has been sought where the claim is contestable;
- the source set is sufficient to test the provisional Ovid delta;
- new credible searches are yielding supporting variants rather than changing relationship type, chronology, importance or likely publication treatment;
- one explicit adversarial pass for “earlier than this?”, “different tradition?”, and “source we disagree with?” produces no material change.

Do not use a fixed number of sources as a proxy for saturation.

Reopen a frozen family only when a new source could materially change:

- earliest / strongest antecedent understanding;
- a documented derivation edge;
- project-contact classification;
- an important counterpoint;
- Ovid delta;
- attribution finding;
- reader-facing treatment.

---

# 19. Packet discipline

One discovery packet should cover one coherent concept family or a tightly coupled cluster of claims.

Split when work would otherwise:

- mix unrelated claim families;
- require deep primary-source reading before discovery is mature;
- combine historical research with manuscript rewriting;
- cross from intellectual lineage into technical adequacy;
- reopen architectural authority rather than attribution;
- create a substantial publication freeze break.

After ILA-00C, source families may proceed in parallel only if they obey this same record contract.

No ILA-01/02 packet may edit reader-facing manuscript prose merely because a compelling source is found. Integration belongs to ILA-05 after the attribution audit.

---

# 20. Anti-genealogy checks

Before accepting any lineage edge, ask:

1. **Same words, same idea?** Shared terminology may conceal different mechanisms.
2. **Same idea, same scope?** Office planning, social housing, infrastructure and detached houses are not interchangeable domains.
3. **Earlier, therefore causal?** Chronology establishes possibility, not influence.
4. **Cited, therefore derived?** A citation may support another point entirely.
5. **Later summary, therefore accurate?** Check the primary source.
6. **Famous, therefore foundational?** Canonical status is not an ILA criterion.
7. **Similar, therefore ancestor?** Convergence is allowed and often more accurate.
8. **Helpful to Ovid, therefore reader-facing?** Internal intellectual clarity may be enough.
9. **No earlier source found, therefore original?** Never.
10. **Antecedent exists, therefore Ovid adds nothing?** The delta must be tested separately.

---

# 21. Special rule for offices, systems theory and other non-domestic origins

Several likely ILA families begin outside the ordinary detached house.

Where a source originates in:

- commercial office planning;
- mass housing / Open Building;
- ecology;
- systems engineering;
- reliability / safety engineering;
- manufacturing;
- software;
- philosophy;

ILA must explicitly separate:

1. the original proposition;
2. the mechanism that survives transfer;
3. the conditions that do **not** transfer;
4. the architectural consequence Ovid actually takes from it.

A successful analogy does not turn the source into architectural authority outside the transferred mechanism.

---

# 22. Built precedent rule

A building may prove that an arrangement can exist, reveal maintenance consequences, or expose a failure of claimed flexibility. It does not by itself establish the origin of the governing idea.

For built precedent, record separately:

- design intent where recoverable;
- built arrangement;
- actual use / alteration / maintenance history where known;
- what the precedent demonstrates;
- what it does not demonstrate;
- whether an associated architect / office also produced a relevant explicit theoretical proposition.

Do not collapse the built work and the architect’s writing into one lineage node where their evidential jobs differ.

---

# 23. Negative evidence and contradiction

ILA must preserve evidence that makes the preferred story less tidy.

For every FOUNDATIONAL / MAJOR dossier, explicitly look for:

- earlier formulations that weaken a priority implication;
- later criticism or empirical failure that narrows transfer;
- disagreement between editions / later recollections;
- contradictions between a source’s theory and built practice;
- evidence that a widely repeated genealogy is secondary-source simplification;
- project history showing the Ovid claim existed before the supposed influence was encountered.

Negative evidence belongs in the durable record even when the final manuscript does not discuss it.

---

# 24. Publication restraint

The likely internal lineage model will be much denser than the final book.

That is expected.

The reader does not need to watch the audit happen. They need:

- enough acknowledgement to understand where central ideas come from;
- enough distinction to understand what Ovid’s House does with them;
- enough citation to verify material debts;
- no false implication of originality;
- no theory parade unrelated to the architectural argument.

Do not leak relationship enums, source tiers, claim IDs, packet names or research machinery into reader-facing prose.

A compact sentence can be the correct public expression of a large internal dossier.

---

# 25. Worked synthetic examples — methodological only

These examples demonstrate the contract without making real ILA findings.

## Example A — later-discovered earlier thinker

Suppose ILA finds a 1970 primary text that closely anticipates ILA-C08, but there is no evidence the project encountered it before 2026.

Correct record:

- project contact: `NO_DOCUMENTED_PROJECT_CONTACT`;
- relationship: `EARLIER_ANTECEDENT`;
- confidence: `STRONG` or `DOCUMENTED` as appropriate to the textual overlap;
- importance: possibly `MAJOR`;
- publication treatment: decided later.

Incorrect conclusion: “Ovid’s House was influenced by this thinker.”

## Example B — source credited by a source Ovid uses

Suppose source B explicitly says its relevant model comes from source A. Ovid’s House demonstrably used B but did not encounter A during development.

Correct graph:

- A → B: `DOCUMENTED_DERIVATION`;
- B project contact: `DOCUMENTED_FORMATIVE_SOURCE` or `DOCUMENTED_ADOPTED_SOURCE` depending evidence;
- A project contact: `NO_DOCUMENTED_PROJECT_CONTACT`;
- A → Ovid intellectual edge: possibly `EARLIER_ANTECEDENT`.

Incorrect graph: one unqualified A → B → Ovid influence chain.

## Example C — standard supporting a concept

Suppose a standard requires maintainability provisions that align with ILA-C08.

Correct relationship: usually `EVIDENTIAL_SUPPORT`.

The standard can materially strengthen the architectural claim without being called an intellectual ancestor.

---

# 26. Gate before ILA-01

ILA-00C passes only if later researchers can classify the following without inventing new rules:

- an earlier primary source never encountered by the project;
- a source currently cited but added after the claim existed;
- a documented formative project source;
- a source-to-source derivation;
- a similar independent tradition;
- a serious opposing tradition;
- a technical standard;
- a built precedent;
- an interpretive philosophical analogy;
- a method antecedent;
- an internally foundational source that deserves only a quiet public note;
- a source whose discovery requires substantive correction of apparent novelty.

This contract covers all of those cases.

## 27. ILA-00C result

**PASS — relationship, source, uncertainty, novelty and publication-treatment rules are frozen sufficiently to begin concept-family discovery without prejudging the sources.**

The key discipline is now explicit:

> **Current acknowledgement, formative influence, historical antecedence, source-to-source derivation, conceptual similarity, evidential support and publication prominence are different facts. Record them separately.**

No doctrine, pattern, Reference House, compiler, drawing or reader-facing publication content changes in ILA-00C.

## 28. Next authorised packet

**ILA-01A — claim-family map.**

Cluster the fifteen canonical claims by underlying intellectual problem before searching for new thinkers or works.

ILA-01A may refine the provisional family seeds from #630 and ILA-00B, but it must not yet perform broad literature discovery. The family map should define the questions that ILA-01B will search.