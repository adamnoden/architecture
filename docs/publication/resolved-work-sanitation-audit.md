<!-- nav-exclude: redirect -->
# Resolved-work sanitation audit

**Programme:** PUB-SAN / issue #133  
**Baseline:** first sanitation tranche merged to `main` at `609f3e7a4a8662e235d6f829609459b26f037333`  
**Status:** SAN-00 and SAN-01 complete; SAN-02/SAN-03 semantic audit in progress

## Governing rule

> **The publication contains the resolved work, not the history of its resolution.**

Losslessness means losslessness of architectural ideas, evidence and constraints—not preservation of draft chronology, migration machinery or programme state on reader-facing surfaces.

## SAN-00 — reader-facing build graph

The website and PDFs now have an explicit public/internal boundary. Repository ownership no longer implies publication.

- VitePress excludes internal development/history records from the public build.
- Public navigation is filtered through the same boundary.
- The Working Edition is assembled from an explicit manifest rather than from the whole repository.
- Internal records remain recoverable in the repository and Git history.

## SAN-01 — high-confidence residue removed from public surfaces

The following classes are now internal-only:

- the legacy House Design Doctrine crosswalk;
- development, editorial and publication-control records;
- project status and repository-structure pages;
- old publication-freeze/release programmes;
- retired/pilot/legacy pattern records;
- obvious grammar research-programme and stage records;
- Reference House model-freeze, discrepancy, parity and explicit development-history records;
- compiler hardening, paper-compilation, model-freeze, output-architecture and pattern-crosswalk programmes;
- completed implementation plans and handoff records whose value is project control rather than architectural reading.

The legacy doctrine crosswalk has also been removed from the Working Edition. Back matter now runs continuously from Evidence and Precedent Notes through Research Agenda, Reference House Implementation Schedule, Glossary and Sources/Further Reading.

## SAN-02 / SAN-03 — semantic migration completed so far

### Publication and manuscript

- **Part III — Patterns and Generative Sequences** retains the pattern argument, strategies, candidates and transfer evidence while removing internal stage/review language.
- **Research Agenda** retains substantive open questions without publication-stage references.
- **Reference House Implementation Schedule** retains real-project gates while replacing internal proof/prototype codes with semantic names.
- **Part IV — Reference House** retains the architectural proposition and technical boundaries while removing stage IDs and prototype shorthand.
- **Manuscript overview, Reading Guide and landing page** now point readers toward the resolved work rather than publication programmes, live project status or repository-management records.

### Pattern language

The public pattern overview now shows the active pattern set, strategies and held candidates without exposing retired identities or migration provenance as part of the reading surface. Stable pattern IDs remain because they provide useful cross-reference across current evidence and computational representations.

### G-01 architectural grammar

`G-01 v0.1` remains a formal specification identity; its version is not treated as draft provenance.

The public grammar surface has been reorganised around:

- the resolved G-01 specification;
- subject-organised evidence such as corpus, topology, dimensions and plan/section/elevation coupling;
- a new reader-facing **G-01 Validation and Limits** synthesis.

That synthesis migrates the useful conclusions from stage-coded validation records, including:

- hierarchy survives more strongly than fixed room ratios or one sectional mechanism;
- off-centre entrances can remain fully ordered and therefore rank matters more than centring;
- urban irregularity defeats whole-building symmetry/equal-bay assumptions;
- historical service circulation does not become a contemporary invariant;
- blind/simulated openings show that composition and physical aperture are not identical;
- Ridgehanger falsifies the proposition that a Georgian-derived roof must be visually subordinate, replacing it with integrated upper termination / roof order;
- held-out cases support a smaller relational core rather than a larger style recipe.

The raw D-stage validation/programme records are consequently internalised rather than separately published.

### Reference House

The Reference House overview has been rewritten as a current building proposition rather than a chronology of gates. It now presents:

- authority stack;
- morphology and programme;
- G-01 order and section;
- envelope and structural concept;
- stair/circulation;
- service and failure geography;
- environmental hierarchy;
- roof/water/maintenance strategy;
- occupied interfaces;
- life-safety/adaptation boundary;
- remaining external proof obligations.

Stage history and “what changed at gate X” material have been removed from the overview.

### Physical prototypes

The prototype overview now explains what physical testing can and cannot prove. The replaceable wall lining is described as an optional challenger rather than by programme code, while the structural floor edge and wall/ceiling movement junction are identified semantically as the current priority proof questions.

### Computational track

The computational overview has been rewritten around resolved capability rather than the sequence of compiler programmes. It now explains:

- House Kernel and Metamorph Compiler;
- the bounded plan/structure/service/boundary/calculation layers;
- demonstrated semantic capabilities;
- the private-stair numeric correspondence example;
- the distinction between machine proof, semantic inspection and publication graphics;
- explicit authority limits;
- the rule for when computation should stop.

Test-stage chronology, hardening-stage sequences and release-programme narration have been removed from the reader-facing overview.

## Public navigation

Reader-visible navigation labels are normalised at the public boundary so that surviving technical material is grouped by meaning rather than by old programme names. Examples include:

- `G-01 v0.1 — specification` rather than “frozen grammar”;
- `Technical coordination` rather than “Reference House development history”;
- `Engineering & test artefacts` rather than “Programme history”.

Internal sources referenced from current pages remain accessible as repository-source links rather than being rebuilt as public pages.

## Remaining SAN-02 / SAN-03 fronts

1. Continue the full prose pass across public pattern, research, Reference House coordination, prototype and computational detail pages.
2. Review remaining stage-coded filenames/pages that are still public because they may contain unique current evidence; synthesise or rewrite before internalising them.
3. Remove process-oriented references to internal source records where they no longer add reader value, even though the links are technically safe.
4. Review public navigation after the source decisions settle, including any remaining stage-coded labels such as P03/P04 or H1 that do not carry useful reader meaning.
5. Only then proceed to SAN-04/SAN-05 whole-corpus cleanup and first-reader coherence proof.

## Semantic guardrail

An identifier is judged by function, not by appearance.

- `G-01 v0.1` may remain because it names a stable formal architectural specification.
- external standards, regulatory categories and technical classifications remain where relevant.
- development-stage labels such as `PR-01`, `D10-S`, `RH-C0` or `R8-A` should not survive merely because the project once used them internally.

Before any source is merged or internalised, unique architectural claims, distinctions, constraints, evidence and useful formulations must be mapped to a resolved destination.
