# PR-00D — Figure and Visual-Argument Completion — Closeout

**Status:** PASS  
**Date:** 2026-10-14  
**Programme:** PR-00 — Candidate-Book Freeze Execution Programme  
**Umbrella issue:** #71 — PUB-01 publication credibility and release programme

PR-00D closes the figure-completion gate at publication-source and deterministic-composition scope. It does not claim that the later candidate PDF has completed its final paginated print proof; that belongs to PR-00G.

## 1. Retained visual set

Eleven principal figures survive the visual-argument audit:

- **D-F01** — selective permanence / architectural platform;
- **D-F02** — designed interface / functional decomposition;
- **D-F03** — failure architecture / second consequence;
- **D-F04** — maintenance geography;
- **D-F05** — pattern-language fields + one generative service-topology sequence;
- **D-F06** — Reference House type and orientation;
- **D-F07** — Reference House spatial and sectional order;
- **D-F08** — Reference House structural and assembly logic;
- **D-F09** — Reference House service and maintenance geography;
- **D-F10** — Reference House water and failure geography;
- **D-F11** — Reference House external maintenance geography.

Two inventoried possibilities are deliberately absent:

- **D-F12 — future intervention scenarios:** no standalone figure. Chapter 18 contains heterogeneous interventions whose common schematic would either become generic or imply geometry the project does not own. D5 may be revisited only if later print proof exposes a concrete comprehension problem.
- **D-F13 — evidence / maturity diagram:** removed as decorative administration. The existing prose and maturity table communicate the distinction more directly.

The resulting set is intentionally small. Image count was not a target.

## 2. Composition model

Publication figure placement is controlled by `publication/figures.ts`.

The module records for each retained figure:

- publication entry;
- stable textual anchor;
- figure identity;
- asset path;
- alt text;
- authored publication caption.

`publication/scripts/prepare.ts` applies the composition **after** any publication adapter and only for the full Working Edition. Canonical manuscript sources are not rewritten merely to place book figures.

The placement system fails closed when:

- an anchor disappears;
- an anchor becomes ambiguous;
- a figure has already been inserted;
- an asset path does not resolve;
- a retained D-F01→D-F11 placement disappears;
- the intentionally omitted D-F12/D-F13 are reintroduced without an explicit decision.

`publication/scripts/validate.ts` exercises that composition during the normal repository-health contract.

## 3. Visual-language review

The retained figures use a deliberately restrained analytical language:

- monochrome-first linework;
- simple fills only to distinguish roles or zones;
- sans-serif labels compatible with the existing print system;
- no photorealism or pseudo-CAD finish;
- no colour-dependent meaning;
- no invented dimensional precision;
- explicit uncertainty or `not proved` wording where a project figure could otherwise read as technical evidence.

The general figures remain style-neutral. Reference House figures make project geometry visible only where the current coordinated house owns it.

Full paginated scale, page-turn rhythm, caption separation and any final figure resizing remain part of **PR-00G — candidate print proof**. PR-00D establishes that the source figures themselves are monochrome-safe, compositionally restrained and suitable for the current Working Edition measure; PR-00G owns the actual PDF proof rather than pretending that source review is a physical print test.

## 4. Authority review

No retained figure increases architectural or technical authority.

In particular:

- D-F01–04 explain Ovid’s House propositions without prescribing one material or technical system;
- D-F05 does not invent a complete pattern dependency graph or mandatory whole-house sequence;
- D-F06–11 derive from the current Reference House / COA substrate but do not turn M3 coordination into engineering, regulatory or physical proof;
- exact MEP routes, structural capacities, drainage capacities, wall-face details, product choices and professional-review outcomes remain absent where unresolved.

COA remains the semantic inspection source. The PR-00D figures are publication arguments downstream from it.

## 5. Execution record

- **D0** — figure inventory and constitution — PR #104 — PASS
- **D1** — core architectural argument figures — PR #105 — PASS
- **D2** — pattern-language figure — PR #106 — PASS
- **D3** — Reference House orientation and architectural argument — PR #107 — PASS
- **D4** — Reference House systems and maintenance figures — PR #108 — PASS
- **D5** — deterministic Working Edition integration and visual QA — PR #109 — PASS subject to final merge

PR #109 repository-health validation passed after figure integration. The validation includes type checking, repository/route/brand guards, compiler/COA regressions, exact output verification, publication validation and docs build.

## 6. Gate result

**PR-00D — PASS.**

The book now has a bounded visual argument rather than a collection of development drawings. Every retained principal figure has a named purpose, source authority and claim boundary; obsolete compiler presentation artefacts are not used as final publication plates; and decorative candidates have been rejected.

The next publication gate is **PR-00E — whole-book editorial hardening**.

PR-00E should treat the visual set as established publication structure. It may tighten captions or remove a figure if whole-book argument continuity demands it, but it should not restart figure generation by default.