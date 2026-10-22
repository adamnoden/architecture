<!-- nav-exclude: redirect -->
# TYP-04A — hierarchy, openings and navigation audit

Status: **COMPLETE — role architecture frozen; visual metrics deliberately not selected**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Packet authority: GitHub issue **#478 — TYP-04 — hierarchy, openings and navigation**  
Starting main: `ef3a2dd366e7f1c491699350d2d7c815f5f5a446`  
Body-system authority: `docs/publication/publication-typography-typ03f-source-selection.md`

## 1. Question

Before styling openings, headings, contents or running matter, what reader-facing hierarchy does Ovid’s House actually need?

This packet audits the current working publication against the editorial structure and freezes the **smallest semantic role architecture** worth carrying into TYP-04 specimen work.

It does **not** select heading sizes, weights, tracking, case, title-page composition or running-head wording. Those require representative A4/B5 specimen proof.

## 2. Frozen input

TYP-03 has already frozen the body-reading contract:

- Source Serif 4 body;
- Source Sans 3 companion publication sans;
- 10.5 pt body;
- 1.5 leading;
- 112 mm conservative-B5 practical measure;
- spaced paragraphs;
- ragged-right;
- hyphenation off under ragged composition;
- widows/orphans 3 / 3 where supported;
- true Source Serif 4 italic.

TYP-04 may build hierarchy around that system. It may not retune the body merely to make a heading or opening easier to compose.

The editorial structure is owned by `docs/manuscript/publication-architecture.md`. The mechanical book manifest is owned by `publication/publication.ts`. The current working presentation is in `publication/theme.css` and the generated title/contents machinery in `publication/scripts/prepare.ts` plus `publication/vivliostyle.config.js`.

## 3. Current working hierarchy

The present CSS is coherent as a working edition, but its hierarchy is primarily **selector-driven** rather than **publication-role-driven**.

| Reader-facing condition | Current mechanism | Current working treatment |
|---|---|---|
| Book title | `.publication-title h1` | 34 pt bold sans |
| Edition label | `.publication-title__edition` | 8.5 pt bold uppercase sans, tracked |
| Title-page metadata | `.publication-title__meta` | 8.5 pt sans with rule |
| Contents title | generated TOC `h2` | 23 pt sans |
| TOC entries | generated nav tree + path selectors | 9.5 pt sans, dot leaders, multiple indents |
| Ordinary H1 | raw `h1` | 21 pt bold sans |
| Ordinary H2 | raw `h2` | 14.5 pt bold sans |
| Ordinary H3 | raw `h3` | 11.5 pt bold sans |
| H4–H6 | raw `h4/h5/h6` | one shared 9.5 pt bold sans treatment |
| Part opening | `h1[id^="part-"]` | 28 pt bold sans, large top space, recto |
| Pattern opening | `h1[id^="hsa-p-"]` | 18.5 pt bold sans |
| Preface recto | one exact heading ID selector | recto |
| Running heads | page margin boxes | 7.5 pt hard-coded Arial/Helvetica |
| Folios | page margin boxes | 7.5 pt hard-coded Arial/Helvetica |
| Entry first page | `@page :nth(1)` | running heads suppressed |
| Intentional parity blank | `@page :blank` | all running matter suppressed |
| Cross-reference/link | generic `a` | underlined; same treatment for internal/external |

This arrangement was appropriate while the publication architecture was moving. It is not a sufficient final hierarchy contract.

## 4. Principal audit findings

### 4.1 Markdown depth is being asked to carry editorial meaning

The current universal `h1`–`h6` scale assumes that source heading depth and book hierarchy are the same thing.

They are not.

A raw H1 can currently mean:

- a Part opening;
- a numbered chapter within a composite Part;
- a pattern title;
- a strategy or candidate title;
- a front-matter document title;
- an appendix title.

The stylesheet then recovers selected distinctions through heading IDs. This is fragile and obscures the editorial model.

TYP-04 should style **publication roles**, with Markdown levels merely providing source structure from which those roles are derived.

### 4.2 Publication kinds already contain better authority than CSS selectors

`publication/publication.ts` already distinguishes `preface`, `front-matter`, `part`, `pattern`, `strategy`, `candidate`, `reference-house` and `back-matter` entries.

That manifest is a better source for publication-role assignment than filename strings or generated heading IDs.

TYP-04 should not duplicate architectural/editorial meaning into CSS. Later integration should derive print-role classes or equivalent attributes from the manifest/adapters and use those roles for presentation.

### 4.3 The current Part and pattern exceptions are evidence of missing roles

The special 28 pt Part H1 and 18.5 pt pattern H1 demonstrate that the working system already needs more than a raw H1 scale.

But the answer is **not** to add more ID-specific variants for strategies, candidates, appendices and Reference House material.

The answer is to name the editorial roles once.

### 4.4 The TOC is mechanically useful but structurally too close to a website tree

The current contents logic uses:

- generated document nesting;
- filename/path substring selectors;
- special indentation for patterns, strategies, candidates and Reference House files;
- multiple font-size and colour adjustments derived from repository location.

This makes the TOC sensitive to repository organisation and encourages it to describe the source tree rather than the reading architecture.

The final contents should be derived from the publication architecture, not from where files happen to live.

The starting hypothesis for specimen work is **two reader-facing TOC levels**:

1. primary publication divisions/entries;
2. secondary entries within a division where navigation genuinely benefits.

A third visual level is not authorised merely because the source tree has one. It must be earned by a demonstrated navigation failure in the two-level specimen.

### 4.5 One generic sans hierarchy risks report behaviour

The current system places every heading level, contents, title-page furniture and running matter in bold/general sans treatments.

TYP-00 already identified this as a risk. With Source Serif 4 + Source Sans 3 now frozen, TYP-04 must test the relationship between the two families rather than assume that every navigational distinction should be made through a larger/bolder sans.

This packet does not decide which roles use serif or sans. It freezes only the roles that require testing.

### 4.6 H4–H6 do not earn three visual systems by default

The working edition collapses H4–H6 to one treatment. That is a useful warning, not necessarily a defect.

The book should not acquire six visible heading scales because Markdown permits six levels.

TYP-04 will therefore carry one **minor-heading** role beneath subsection level. H4–H6 map to that role by default. If a real page becomes semantically ambiguous, first ask whether the editorial structure is too deep. Add another visual level only if actual reading evidence requires it.

### 4.7 The title page currently carries development provenance

The generated Working Edition title page visibly prints:

- edition label;
- date;
- revision hash;
- project URL.

Those are useful working-publication provenance. They are not automatically appropriate to the intended restrained physical object, whose public face is deliberately free of repository/website signalling.

TYP-04 must therefore distinguish:

- **book-title composition**;
- **edition/imprint/provenance composition**.

The current Working Edition may retain provenance until production integration. The specimen must test moving necessary edition facts away from the principal title composition rather than inheriting the current developer-facing metadata block as final design.

### 4.8 Running matter has good suppression rules but weak semantic context

Two current behaviours are worth preserving as the starting point:

- entry first pages suppress running heads;
- true blank pages suppress all running matter.

The current running-head content is less resolved: publication title on one side and generated document title on the other is mechanically safe, but the book title is likely redundant across every verso and a generated document title is not always the most useful reading context inside composite Parts.

TYP-04B should test **division context versus entry context** rather than freezing current `pub-title` / `doc-title` semantics.

### 4.9 Recto starts should remain selective

Major Parts currently begin recto, and the Preface is also forced to recto. Ordinary entries are not all promoted to recto openings.

That restraint is sound as a starting hypothesis. Making every pattern, chapter or appendix begin recto would increase blanks and book-block thickness while manufacturing ceremony not yet earned by the material.

TYP-04 specimen work should preserve recto starts for major divisions and test other starts only where reading rhythm requires them.

### 4.10 Cross-references currently look like generic web links

Internal cross-reference, external source link and ordinary URL all inherit one generic underline treatment.

That is robust for a working PDF but not yet a book navigation system. TYP-04 must test a quieter internal-reference treatment that remains legible in print and does not make prose resemble a webpage. External URLs/source apparatus remain subject to TYP-05 where technical density becomes material.

## 5. Frozen minimum content hierarchy

TYP-04 will proceed with **five content roles**, one of which is unique to the book object:

### H0 — book title

The name of the work on the title page only.

This is not a generic manuscript heading level.

### H1 — division opening

Major book-scale divisions: principally Parts I–V.

A division may carry a label and title as separate typographic elements in later specimen work, but they form one editorial role.

### H2 — entry opening

The ordinary major unit of reading below a Part or outside the Part sequence.

This role covers, unless physical proof earns a bounded exception:

- Preface;
- Reader’s Guide;
- numbered chapters inside composite Parts;
- pattern titles;
- strategy titles;
- candidate titles;
- Reference House reader-facing entry titles;
- appendices A–E.

**No separate pattern-title scale is authorised at this stage.** The current pattern H1 exception must justify itself physically if it is to survive as a compact variant.

### H3 — section

The principal subdivision within an entry: for example `Context`, `Problem`, `Pattern`, `Forces` and equivalent manuscript sections.

### H4 — subsection / minor hierarchy

The final routinely visible subdivision.

Source H4–H6 map into this lowest display role by default. Later specimen work may distinguish a run-in/minor treatment from a full subsection only if the real corpus proves the distinction necessary; it may not proliferate three additional scales automatically.

## 6. Navigation and furniture roles

These roles are deliberately separate from the content hierarchy because they perform different reading jobs.

### Title-object roles

- **edition label** — edition/private-object identity where needed;
- **imprint/provenance** — date, edition facts and other necessary production metadata, deliberately subordinate to the title.

### Contents roles

- **contents title**;
- **TOC primary**;
- **TOC secondary**.

No TOC tertiary role is admitted until the two-level model fails a representative navigation specimen.

### Running roles

- **running context** — division/entry orientation, content to be determined by specimen;
- **folio** — page number.

### Cross-reference role

- **internal cross-reference** — a print navigation treatment distinct from generic external-web linking where useful.

This is a semantic role, not a licence to create decorative link styling.

## 7. Role mapping rules

The following rules are frozen for TYP-04 specimen construction:

1. `kind: part` maps its principal publication opening to **division opening**.
2. A numbered chapter contained inside a composite Part maps to **entry opening**, even when its canonical Markdown source uses H1.
3. `preface`, `front-matter`, `pattern`, `strategy`, `candidate`, `reference-house` and `back-matter` principal titles map to **entry opening** unless a later physical specimen proves a specific exception.
4. Ordinary source H2 under an entry maps to **section**.
5. Ordinary source H3 maps to **subsection/minor hierarchy**.
6. Source H4–H6 do not automatically create new publication roles.
7. Publication-role assignment must eventually come from the manifest/preparation boundary or another explicit print-semantic transform, not CSS filename/ID inference.

These rules describe presentation semantics only. They do not alter the authority or canonical structure of the Markdown sources.

## 8. Behaviours provisionally retained

TYP-04B begins with these working behaviours intact because the audit found no reason to discard them before physical proof:

- major Part openings begin recto;
- entry first pages suppress running heads;
- blank pages suppress running heads and folios;
- body text remains the frozen TYP-03 system;
- black-only reproduction remains mandatory;
- ordinary entries are not automatically forced to recto;
- contents remain generated rather than manually duplicated.

“Retained” here means starting hypothesis, not final visual freeze.

## 9. Specimen obligations for TYP-04B

The next packet must test the role architecture **as a system**, not as isolated heading samples.

Minimum representative conditions:

1. title page plus edition/imprint page;
2. Part opening;
3. numbered chapter/entry opening followed by body and section/subsection transitions;
4. pattern entry with its repeated section grammar;
5. appendix entry;
6. contents containing:
   - Parts;
   - internal chapters for a composite Part;
   - the Part III pattern/strategy/candidate field;
   - back matter;
7. duplex spread showing running context + folios;
8. entry first page with correctly suppressed running context;
9. parity blank with no furniture;
10. internal cross-reference in ordinary prose.

Every candidate must be rendered in:

- A4 working territory for regression comparison;
- conservative B5 territory for physical judgement;
- black only;
- the exact frozen Source families.

## 10. Falsification / bounded exceptions

The role model is deliberately small. It may expand only if a representative page demonstrates a concrete reading failure.

Examples that could earn a bounded exception:

- pattern entries become materially harder to scan when forced into the same entry-opening treatment as chapters;
- two TOC levels cannot express Part III or composite Parts without genuine ambiguity;
- the single lower hierarchy role makes semantically distinct nested sections impossible to follow;
- one running-context line cannot orient the reader across composite Part documents.

If such a failure appears, add the smallest role that solves it and record why. Do not create variants pre-emptively.

## 11. What TYP-04A proves — and does not prove

This audit proves that the current working system contains enough semantic structure to replace selector-specific hierarchy with a bounded publication-role model.

It does **not** prove:

- final heading sizes;
- whether serif or sans is correct for any non-body role;
- final title-page composition;
- final TOC spacing or leader treatment;
- final running-head wording;
- final recto policy outside major divisions;
- final cross-reference styling;
- final B5 reproduction quality.

Those are TYP-04 specimen/physical-proof questions.

## 12. Next authorised packet

**TYP-04B — hierarchy/opening specimen architecture and first controlled candidate.**

Build one representative role-driven specimen family in A4 and conservative B5 using the frozen Source system. Begin from restraint: no ornamental variants, no extra heading levels, no source-path-driven TOC styling, and no production-wide theme integration until the candidate has earned it physically.
