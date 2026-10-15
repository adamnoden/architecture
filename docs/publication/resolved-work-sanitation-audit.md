<!-- nav-exclude: redirect -->
# Resolved-work sanitation audit

**Programme:** PUB-SAN / issue #133  
**Baseline:** public/internal boundary established on `main`; semantic cleanup continuing in bounded tranches  
**Status:** SAN-00 and SAN-01 complete; SAN-02/SAN-03 substantially advanced; SAN-04 execution continuing; SAN-05 first-reader traversal in progress

## Governing rule

> **The publication contains the resolved work, not the history of its resolution.**

Losslessness means losslessness of architectural ideas, evidence and constraints—not preservation of draft chronology, migration machinery or programme state on reader-facing surfaces.

## SAN-00 — reader-facing build graph

The website and PDFs have an explicit public/internal boundary. Repository ownership no longer implies publication.

- VitePress excludes internal development/history records from the public build.
- Public navigation is filtered through the same boundary.
- The Working Edition is assembled from an explicit manifest rather than from the whole repository.
- Internal records remain recoverable in the repository and Git history.

## SAN-01 — high-confidence residue removed from public surfaces

The following classes are internal-only:

- the legacy House Design Doctrine crosswalk;
- development, editorial and publication-control records;
- project status and repository-structure pages;
- old publication-freeze/release programmes;
- retired/pilot/legacy pattern records;
- grammar research-programme and stage records whose useful findings have been migrated;
- Reference House model-freeze, discrepancy, parity and explicit development-history records;
- compiler hardening, paper-compilation, model-freeze, output-architecture and pattern-crosswalk programmes;
- completed implementation plans, test-gate reports, capability matrices and external-review packs whose value is project control rather than architectural reading;
- pre-test prototype build packs, specimen scripts and engineering handoff records before measured public results exist.

The legacy doctrine crosswalk has also been removed from the Working Edition.

## SAN-02 / SAN-03 — semantic migration completed

### Publication and manuscript

- **Part III — Patterns and Generative Sequences** retains the pattern argument, strategies, candidates and transfer evidence while removing internal stage/review language.
- **Research Agenda** retains substantive open questions without publication-stage references.
- **Reference House Implementation Schedule** retains real-project gates while replacing internal proof/prototype codes with semantic names.
- **Part IV — Reference House** retains the architectural proposition and technical boundaries while removing stage IDs and prototype shorthand.
- **Manuscript overview, Reading Guide and landing page** point readers toward the resolved work rather than publication programmes, live project status or repository-management records.

The PDF manifests have been checked directly against the resolved-work rule. The Working Edition contains the authored architectural argument, current pattern/strategy/candidate set, Reference House synthesis, making/testing argument and substantive back matter; it does not include the internal programme-control corpus. The Primer is likewise derived from the proposition, canonical principles, current patterns, Reference House and one authored closing section rather than from development history.

The Primer closing section no longer describes the existing compiler as a merely future possibility or claims that prototypes/computational work as a class sit outside both publications. It states the bounded capability and proof limits already earned by the computational track, distinguishes retained internal working records from the resolved argument, and links to the current `ovids-house.pdf` output rather than the obsolete `house-kernel.pdf` path.

The Preface no longer ends its Ovid research note by telling the reader which internal research-boundary file produced it. The note ends with the substantive sources themselves. The publication-only shim that previously hid that sentence from the PDF has consequently been removed rather than becoming permanent build machinery.

### Pattern language

The public pattern overview shows the active pattern set, strategies and held candidates without exposing retired identities or migration provenance as part of the reading surface. Stable pattern IDs remain because they provide useful cross-reference across current evidence and computational representations.

### G-01 architectural grammar

`G-01 v0.1` remains a formal specification identity; its version is not treated as draft provenance.

The public grammar surface is organised around:

- the resolved G-01 specification;
- subject-organised evidence such as corpus, topology, dimensions and plan/section/elevation coupling;
- the reader-facing **G-01 Validation and Limits** synthesis.

That synthesis preserves the useful conclusions from the internal validation programme: hierarchy survives more strongly than fixed ratios or one sectional mechanism; entrance rank matters more than centring; urban irregularity defeats global-symmetry assumptions; historical service circulation is not a contemporary invariant; blind/simulated openings separate composition from physical aperture; and a prominent roof can remain Georgian-derived where body and roof are compositionally integrated.

The raw validation/programme records are internal-only. The controlled specification points its evidence header to the Grammar Charter, comparative precedent research and the reader-facing **G-01 Validation and Limits** synthesis rather than linking readers back into the internal D-stage falsification/validation chain.

The **Reference House G-01 conformance record** is a resolved architectural result. It states the six-rule pass directly and explains the house evidence without development-stage chronology, freeze mechanics or gate IDs. The courtyard, low-slope roof, technical families and construction choices remain explicitly project-owned rather than being promoted into the grammar.

### Reference House

The Reference House overview presents the current building proposition rather than a chronology of gates: authority stack; morphology/programme; G-01 order and section; envelope and structure; stair/circulation; service/failure geography; environmental hierarchy; roof/water/maintenance; occupied interfaces; life-safety/adaptation boundary; and remaining external proof obligations.

The former discipline-by-discipline external-review package has been reduced to one reader-facing **Independent Review Questions** page. It preserves the substantive unresolved questions—structure, fire/access, MEP/acoustics, building physics/energy, cross-discipline interfaces and real-site dependencies—without publishing review workflow, response templates, maturity gates or issue instructions. The detailed working briefs and date-stamped regulatory baseline remain internal project records.

The public **Vertical Interface Coordination** page has been reconciled with the current house. Earlier option studies had drifted behind later decisions by still treating removable wall lining and accessible floors as preferred development directions. The resolved page states direct quiet wall finish and continuous conventional floors as the baseline; selective attachment/service datums and replaceable lining remain optional challengers; floor-edge and wall/ceiling movement are the two priority unresolved interfaces. The superseded A/B/C option study is retained internally, while its durable proportionality rule is preserved publicly: depart from excellent conventional construction only when a named future task justifies the permanent material, depth, joints and boundary debt.

A further first-reader click-through exposed a second layer of contamination: several still-public Reference House pages were valuable current technical content wrapped as RH-stage gate records. Structural coordination, environmental coordination, roof/drainage/access, envelope coordination, energy/heat coordination, outer-elevation coordination, the old brief/constraint restart ledger and the project maintenance plan all carried stage IDs, dates, PASS declarations, parent-gate links or rewind chronology.

That material has now been semantically migrated into one reader-facing **Reference House — Technical Coordination** synthesis. It owns the current structure, envelope, service/failure geography, environmental hierarchy, energy family, roof/water arrangement, external order, maintenance geography, principal unresolved interfaces and proof limits in resolved present tense.

The old stage records remain in the repository for project archaeology and maintenance but are excluded from the public build. The Reference House overview now points readers to the resolved synthesis rather than back into those gate records. The former `RH-C0 / RH-C1 fixture programme` public group disappears once its final reader-facing restart ledger is internalised; its durable brief and authority content already survives in the overview and technical synthesis.

### Physical prototypes

The public prototype surface presents the **evidence questions and proof boundaries**, not unexecuted test management.

It preserves three live questions:

- **structural floor edge** — conventional hanger/restraint is the incumbent, direct/seated bearing is a comparator, and any bespoke shoe/ledge must first earn engineering justification;
- **wall/ceiling movement junction** — compare excellent conventional work with concealed-slip and only genuinely functional metal challengers; movement behaviour, removability and architectural quality remain separate verdicts;
- **replaceable wall lining** — compare a full-scale removable dense-mineral lining with first-rate conventional finish for solidity, tolerance recovery, installer robustness, fixing, handling, removal and reinstatement; the house remains complete if it fails.

The detailed pre-test build packs and protocols remain internal. No public result is manufactured before a specimen exists.

### Computational track

The computational overview is organised around resolved capability rather than programme sequence. It explains House Kernel and Metamorph Compiler; the bounded plan/structure/service/boundary/calculation layers; demonstrated semantic capabilities; the private-stair numeric correspondence example; the distinction between machine proof, semantic inspection and publication graphics; explicit authority limits; and the rule for when computation should stop.

High-confidence computational gate history, capability matrices, doctrine-sync delta and external-review packs are internal. Their unique reader-useful result is preserved in the resolved overview: shared plan semantics have been tested across unlike fixtures, and exterior maintenance remains outside the demonstrated executable scope where real tasks depend on access equipment, support/setup geometry, permissions and future landscape conditions.

The concrete Mapeguard manufacturer-evidence trial remains public because it demonstrates a substantive evidence-scoping method rather than merely recording programme progress.

## Public navigation

Reader-visible navigation labels are normalised at the public boundary so surviving technical material is grouped by meaning rather than old programme names. Internalised groups disappear automatically when no public item remains.

Examples include:

- `G-01 v0.1 — specification` rather than “frozen grammar”;
- `Technical coordination` rather than “Reference House development history”;
- `Current technical coordination` rather than a stage-specific structural-gate identity;
- `Independent review questions` rather than an RH-stage review package;
- `Vertical interface coordination` rather than an option-development label;
- `Scoped manufacturer evidence — Mapeguard WP` rather than an evidence-trial stage label.

## SAN-05 — first-reader coherence traversal

The first-reader pass is being performed as an actual reading sequence rather than a keyword scan.

### Primary path checked so far

`Project overview → Reading guide → Preface → Part I → Part II → Pattern Language → Reference House → Part V → Sources and further reading`

The core argument is coherent. The opening proposition, doctrine, pattern boundary, grammar boundary, Reference House role, proportionality argument and evidence limits survive the sequence without requiring development history to explain them.

The pass nevertheless found several reader-facing residues and presentation defects:

- the Reading Guide ended by explaining where internal development records live; that production note has been removed;
- the Reference House overview repeated its maturity statement almost verbatim and used stale link labels inherited from development-stage pages; it has been tightened into one current synthesis with semantic link names;
- the Sources page ended with an editorial instruction to future maintainers; that sentence has been removed;
- the Research overview still narrated document ownership and pattern-language migration history; it has been rewritten around the actual evidence domains;
- the Prototype overview still explained where hidden working papers live and how future public results should be published; it now states only what a credible physical result must establish;
- the Delivery overview was too skeletal to explain its relationship to research; it now states the translation boundary and gives a concrete external-maintenance example;
- the Reference House technical click-through exposed multiple RH-stage gate records; their durable content has now been consolidated into the resolved technical-coordination page and the stage records internalised.

### Current reading result

The primary Reference House path can now be read without entering RH-05/RH-07/RH-08/RH-10 chronology. The overview links to current technical meaning, current interfaces, current prototype questions and current independent-review questions.

SAN-05 is still **not complete**. The next pass must follow the remaining evidence and technical-family links from the cleaned overview surfaces and look for the same class of process residue one level deeper.

## Remaining work

1. Continue first-reader click-through across the remaining public evidence route and technical-family pages.
2. Review the remaining Reference House public surfaces that are not stage records—whole-house fixture, vertical-interface coordination, tectonic language, generated inspection surfaces—for stray process narration rather than assuming their titles make them clean.
3. Perform SAN-06 lossless verification: every internalised or rewritten record must have its unique architectural claims, evidence and constraints accounted for in a current owner.
4. Regenerate and validate both public outputs and the site.
5. Close issue #133 only after the public site and both PDFs pass that final check.

## Semantic guardrail

An identifier is judged by function, not by appearance.

- `G-01 v0.1` may remain because it names a stable formal architectural specification.
- external standards, regulatory categories and technical classifications remain where relevant.
- development-stage labels should not survive merely because the project once used them internally.

Before any source is internalised, unique architectural claims, distinctions, constraints, evidence and useful formulations are mapped to a resolved destination.
