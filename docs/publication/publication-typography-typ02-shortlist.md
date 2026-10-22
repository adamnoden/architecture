<!-- nav-exclude: redirect -->
# TYP-02 — typeface architecture and shortlist

Status: **stacked candidate; depends on TYP-01**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Parent packet: `TYP-01` / stacked PR #443  
Packet scope: family architecture and shortlist only

## 1. Decision

Advance **four** systems to real Ovid’s House specimen work:

1. **Lyon Text + Atlas Grotesk** — aesthetic lead hypothesis;
2. **Tiempos Text + Söhne** — editorial/performance lead hypothesis;
3. **Scala Pro + Scala Sans Pro** — coherent humanist challenge candidate;
4. **Source Serif 4 + Source Sans 3** — open, deterministic control candidate.

No winner is selected in TYP-02.

The first two are the strongest current hypotheses. Scala is retained because it tests whether a more visibly related serif/sans pair gives the book a quieter and more distinctive internal coherence. Source is retained because any commercial candidate must prove that its aesthetic and reading advantage is worth the additional licensing/build complexity.

The shortlist is deliberately small. TYP-03 should eliminate candidates through real page composition rather than expanding the search.

---

## 2. Typeface architecture

The working architecture remains:

1. **text serif** — sustained prose and the main literary voice;
2. **publication sans** — headings/navigation, captions/plate furniture, tables where appropriate, and the family role consumed by PLT;
3. **mono** — **not yet admitted as a permanent third family**.

TYP-02 has not found enough evidence that a book-wide monospaced role deserves equal status with serif and sans. The production theme currently has `--hk-mono`, but a technical aesthetic must not be invented simply because code exists somewhere in the repository.

TYP-05 must decide whether reader-facing machine/code material actually requires true monospacing. If it does, the mono should be selected as a narrow functional dependency of the final system rather than as a third expressive voice.

This is a useful simplification:

> **Two expressive families; a mono only if semantics force it.**

---

## 3. Admission criteria

A system reaches TYP-03 only if it plausibly satisfies all of these before physical proof:

- serious sustained-reading pedigree;
- convincing roman and italic;
- enough useful weight contrast without family clutter;
- numerals suitable for contents, tables, dimensions and evidence;
- punctuation and symbol coverage appropriate to the corpus;
- a sans capable of small captions and eventual drawing use;
- black-only print plausibility;
- licensing path for a physical book and embedded PDF;
- a credible deterministic-build path;
- aesthetic compatibility with the TYP-01 brief.

Passing this gate is not winning. TYP-03 exists because many excellent typefaces fail when they become pages.

---

# 4. Shortlist

## A — Lyon Text + Atlas Grotesk

### Sources

- Lyon Text: https://commercialtype.com/catalog/lyon_text
- Atlas Grotesk: https://commercialtype.com/catalog/atlas_grotesk
- Commercial Type EULA: https://commercialtype.com/eula

### Why it advances

**Lyon Text** is explicitly intended for magazines, books and newspapers. Commercial Type describes it as contemporary despite its Granjon/Renaissance basis, and as having an “intelligent, anonymous” character. That combination is unusually close to Ovid’s House: literary authority without historical cosplay.

**Atlas Grotesk** is spacious enough for extended reading while remaining compact and disciplined. It draws from 1950s European grotesks but does not set like a generic Helvetica/Univers clone. Commercial Type itself suggests **Atlas Grotesk + Lyon Text** as a pairing.

Both families expose the practical OpenType behaviour the corpus may need, including tabular figures; Lyon includes oldstyle/lining behaviour and Atlas includes tabular figures, fractions, superiors/subscripts and small caps.

### Aesthetic hypothesis

This is currently the **strongest aesthetic hypothesis**.

Expected character:

- Lyon supplies warmth, gravity and genuine bookishness without looking antiquarian;
- Atlas supplies precision and contemporary order without the overt “architectural graphic design” signal of a colder neo-grotesk;
- the pair should permit headings and furniture to withdraw while prose retains personality;
- the combination looks capable of making the book feel authored rather than branded.

The possible failure mode is **polite excellence**: a beautiful, serious system that is so resolved and culturally familiar that the “slightly strange” part of Ovid’s House disappears.

### Technical strengths

- text family explicitly designed for editorial work;
- proper italics;
- strong numeral/technical feature coverage;
- Atlas has useful small-text proportions;
- standard desktop licensing permits PDF embedding.

### Operational risk

Commercial Type states that **server-side generation of PDFs requires a separate licence**. The standard desktop licence is therefore not sufficient evidence for our GitHub-hosted automated build.

This does not reject the pair. If it wins TYP-03/07, TYP must obtain an explicit build/server licensing path before TYP-09 deterministic freeze.

### TYP-03 question

Can Lyon retain its elegance on dense evidence/pattern pages while Atlas remains quiet enough in headings, tables and plate furniture?

---

## B — Tiempos Text + Söhne

### Sources

- Tiempos Text: https://klim.co.nz/fonts/tiempos-text/
- Söhne: https://klim.co.nz/fonts/soehne/
- Klim desktop licence: https://klim.co.nz/licences/desktop-fonts/

### Why it advances

**Tiempos Text** is a modern editorial serif derived from the functional lineage of Plantin/Times but deliberately redrawn for robust, economical contemporary setting. Klim documents a larger effective x-height, shortened vertical extents, narrowed glyphs, tighter spacing and contrast adjusted for ink spread. It also provides lining, oldstyle and tabular numerals, small caps and fractions.

**Söhne** is a contemporary grotesk with real italics, tabular figures, slashed zero and useful technical features. It is exceptionally capable as a shared navigation/table/drawing family.

### Aesthetic hypothesis

This is currently the **strongest all-round performance hypothesis**, and aesthetically close to Lyon/Atlas.

Expected character:

- Tiempos is warmer and more visibly contemporary than Lyon;
- it has a sturdy texture that may survive warm uncoated paper especially well;
- Söhne is exceptionally clean beside drawings and technical material;
- together they could produce exactly the serious / literary / precise tension the book wants.

The danger is Söhne itself: its Akzidenz/Helvetica/Unimark lineage can make the book tip into highly competent **contemporary architecture-brand typography**. If that happens, no amount of technical suitability rescues it.

### Technical strengths

- strong editorial text metrics;
- documented ink-spread robustness;
- Tiempos gives oldstyle + lining + tabular numerals;
- Söhne gives tabular numerals, slashed zero, fractions, superiors/inferiors;
- free test fonts are available for internal evaluation;
- Klim desktop licensing expressly permits paper books and PDF embedding subject to extraction protection.

### Operational risk

The ordinary desktop licence does not automatically establish that a GitHub-hosted automated build is authorised. Its server/app provisions need explicit resolution for the final build architecture.

Again, this is not a reason to choose an aesthetically inferior open font. It is a reason to know the actual cost of the better system before freezing it.

### TYP-03 question

Does the superb functional contrast become too familiar/neo-grotesk once Söhne appears repeatedly across headings, captions and drawings?

---

## C — Scala Pro + Scala Sans Pro

### Sources

- Scala Pro: https://www.myfonts.com/collections/scala-pro-font-martin-majoor
- Scala Sans Pro: https://www.myfonts.com/collections/scala-sans-pro-font-martin-majoor

### Why it advances

Scala and Scala Sans were designed around a shared form principle; their skeletons are intentionally related. Scala is dark, relatively low contrast and robust; Scala Sans has open forms and a true italic rather than a mechanically sloped roman.

This system tests a different proposition from A/B: perhaps the book should feel less like a carefully paired serif and grotesk and more like **one typographic language moving between serif and sans registers**.

### Aesthetic hypothesis

This is the **coherence / slight-strangeness candidate**.

Expected character:

- unusually natural serif/sans kinship;
- humanist rather than corporate or neo-grotesk;
- strong italic personality;
- enough age to feel durable rather than trend-led;
- a faint cultural/European-book quality that may suit Ovid’s House extremely well.

Its failure mode is equally plausible: Scala can carry a recognisable 1990s cultural/institutional flavour, and its italic/humanist gestures may become more noticeable than the manuscript wants.

### Technical strengths

- designed serif/sans relationship rather than accidental pairing;
- real sans italic;
- small caps, oldstyle figures and broad OpenType support;
- dark/low-contrast serif construction is promising for uncoated black-only print;
- desktop licences cover ordinary printed/PDF design work.

### Operational risk

Current MyFonts desktop terms prohibit server installation. A deterministic hosted build would therefore require a different licensing/build arrangement if Scala wins.

### TYP-03 question

Does Scala’s coherence feel quietly inevitable, or does the family’s recognisable humanist personality become an aesthetic mannerism over 200+ pages?

---

## D — Source Serif 4 + Source Sans 3

### Sources

- Source Serif: https://github.com/adobe-fonts/source-serif
- Source Sans: https://github.com/adobe-fonts/source-sans
- Adobe open-source fonts information: https://www.adobe.com/products/type/fonts-by-adobe.html

### Why it advances

This is not a token free-font candidate. **Source Serif 4** is a serious text family with optical-size capability and was explicitly created to complement Source Sans. The family is open source; Source Sans 3 and Source Serif can be pinned and vendored reproducibly under their open licence.

This system sets the bar for operational simplicity. A commercial system should beat it in the physical book, not merely have a more prestigious foundry name.

### Aesthetic hypothesis

This is the **control candidate**.

Expected strengths:

- calm, capable, neutral;
- coherent serif/sans relationship;
- broad technical coverage;
- optical sizing in Source Serif can be valuable when the same family spans body and secondary roles;
- virtually no temptation toward luxury-book theatre.

The main risk is aesthetic underreach. Source Sans was designed for UI environments and the broader Source ecosystem is common in digital/technical contexts. The result may feel like an exceptionally competent open-source technical publication rather than a singular physical book.

If physical specimens prove that fear wrong, the operational advantages are substantial.

### Technical strengths

- open-source files available directly from Adobe;
- deterministic vendoring/pinning is straightforward;
- no proprietary-font secret or hosted-runner licensing seam;
- mature Latin/Greek/Cyrillic support;
- broad weight/feature coverage;
- Source Code Pro remains available if TYP-05 proves a true mono role is required.

### Operational risk

Low. The principal risk is typographic character, not build feasibility.

### TYP-03 question

Is Source merely neutral on screen, or does good physical composition reveal enough warmth and authority to make the commercial alternatives unnecessary?

---

# 5. Deliberate exclusions

## Georgia / Arial current system

Retained only as the **before-state**, not a finalist. Their usefulness as robust ubiquitous working defaults has already been established. TYP exists because ubiquity is not a sufficient finished-publication rationale.

## Helvetica / Neue Haas / Univers-led systems

Not shortlisted. They would make the sans role exceptionally easy but add too little information to the experiment: the project already knows a generic grotesk works functionally, and the aesthetic risk of default architecture-modernist signalling is too high.

## High-contrast editorial/display serif systems

Not shortlisted at this stage. The object is intended to be warm, restrained and black-only on uncoated stock. A system whose identity depends on high-contrast display drama starts too close to the luxury/editorial anti-pattern.

## Large superfamilies merely because they solve everything

Not shortlisted by default. Family breadth is not a virtue if it encourages us to create unnecessary voices. A small number of excellent roles is preferable.

---

# 6. Cross-candidate comparison

| System | Reading hypothesis | Aesthetic hypothesis | Sans/drawing fitness | Reproduction risk | Build/licensing friction |
|---|---|---|---|---|---|
| Lyon + Atlas | excellent | **leading**: quiet, literary, precise | excellent | low–moderate | **high** until server-build licence resolved |
| Tiempos + Söhne | **leading**: robust editorial | excellent; risk of architecture-brand familiarity | **leading** | low | moderate–high until hosted-build use resolved |
| Scala + Scala Sans | very good | strongest internal kinship; slightly stranger | very good | low | **high** for hosted build under standard licence |
| Source Serif + Source Sans | very good | controlled/neutral; risk of generic technical tone | very good | low | **minimal** |

This table is not a score. It records the hypotheses TYP-03 must try to falsify.

---

## 7. Required TYP-03 specimen discipline

All four systems must be composed from the **same semantic source anchors** frozen in TYP-01.

Do not make each candidate look good by independently tuning every page. The first pass should use a constrained common composition envelope so the face itself can be compared:

- same approximate trim territory;
- same text-block geometry;
- equivalent perceived body size, not blindly identical nominal point size;
- leading adjusted only enough to achieve comparable baseline comfort;
- same paragraph strategy within each comparison round;
- same content and page sequence;
- no candidate-specific display tricks;
- black only.

Then allow a second bounded optimisation pass for each viable candidate. Typeface choice and composition interact; a candidate must not lose simply because it was forced into another face’s exact metrics.

### Required aesthetic comparison

The specimen review must explicitly judge:

- full-page colour;
- word shape and reading texture;
- italic voice;
- punctuation;
- serif/sans temperature together;
- heading character without branding theatre;
- caption restraint;
- table/numeral character;
- plate furniture beside a drawing;
- whether the system still feels calm after several consecutive spreads.

This is where the user-facing aesthetic question is actually answered.

---

## 8. Licensing / repository boundary

No proprietary font binaries may be committed to the public repository merely to make a specimen easy to reproduce.

For commercial candidates TYP-03 may use official trial/evaluation fonts under their terms for internal comparison. Before a commercial candidate can become final:

1. exact production styles must be licensed;
2. PDF embedding rights must be confirmed;
3. printer/service-bureau handling must be confirmed;
4. **automated/hosted build use must be explicitly licensed or the build architecture must be redesigned lawfully**;
5. the repository must record how deterministic font identity is verified without redistributing proprietary files.

Aesthetics can justify paying for the right font. They cannot justify a build process whose licensing is ambiguous.

---

## 9. TYP-02 freeze

TYP-02 freezes:

1. Four systems advance: Lyon/Atlas, Tiempos/Söhne, Scala/Scala Sans, Source Serif/Source Sans.
2. **Lyon/Atlas and Tiempos/Söhne are leading hypotheses, not winners.**
3. Scala remains deliberately because its integrated serif/sans character tests a materially different aesthetic direction.
4. Source remains deliberately as the high-quality open/deterministic control.
5. Aesthetics are first-class among admitted systems: an aesthetically dead system should not win merely because it is operationally convenient.
6. Conversely, a beautiful system cannot survive poor sustained reading, reproduction or technical behaviour.
7. Mono is held rather than automatically promoted to a third expressive family; TYP-05 must prove its semantic need.
8. Proprietary font files are not to be committed to the public repo.
9. Hosted/automated-build licensing is a real acceptance criterion, separate from ordinary desktop/PDF rights.
10. No production typography has changed.

---

## 10. Next authorised packet

**TYP-03 — body-text specimen and reading system.**

The next job is not more internet font research. It is to put these four systems onto real Ovid’s House pages, first under a constrained common comparison and then under bounded candidate-specific optimisation, and physically judge sustained reading and page colour.

TYP-03 is authorised to reduce the field aggressively. It should not reopen the candidate search unless all four fail for a reason that reveals a missing typeface category rather than ordinary preference.