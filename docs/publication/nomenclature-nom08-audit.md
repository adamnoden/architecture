<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-08 order, numbering and version semantics audit

**Gate:** NOM-08 — order, numbering and version semantics audit  
**Status:** COMPLETE  
**Draft PR:** #157  
**Tracking issue:** #156  
**Starting head:** `6db60eae77cdf35854151b0d390c97e1661d5aa7`

## Purpose

Audit every reader-visible project-owned number or version marker by meaning rather than appearance. The governing requirement is that no visual treatment may invite a reader to infer a different semantic role from the one the project actually intends.

Every retained number belongs to one of these classes:

- **reading order** — sequence through a publication or generative process;
- **stable identity** — durable identity that must not imply rank or order;
- **edition/version** — revision identity for a genuinely versioned object;
- **maturity** — evidence/validation state on an explicitly defined scale;
- **figure/table sequence** — publication-local cross-reference;
- **technical parameter** — a real dimensional, regulatory, computational or standards value;
- **historical/workflow gate** — project-development chronology that remains internal/provenance-side.

NOM-08 does not invent numbering where none is needed. It also does not erase useful technical precision merely because it contains digits.

## Bounded audit sequence

- [x] **NOM-08A — grammar identity and version semantics**  
  Resolve `G-01` versus `G-01 v0.1`, keep the specification version where exact revision identity matters, and remove version typography from ordinary primary prose/navigation where the grammar identity alone performs the reader task.
- [x] **NOM-08B — project maturity semantics**  
  Prove `M1`–`M5` are used only as the project maturity scale, keep them off primary prose, pair human-facing technical occurrences with named maturity states, and distinguish external lookalikes such as CIBSE Guide M1 and UK M4(2)/M4(3).
- [x] **NOM-08C — sequence, order and stable identity**  
  Verify genuine sequences such as Part I–V, Appendix A–E, Principle numbers and service-topology S1–S10 are true order/reference systems; prove pattern publication order cannot derive from `PAT-*`; keep workflow gates internal.
- [x] **NOM-08D — figure/table/reference numbering and final reconciliation**  
  Confirm retired `D-F*` has no successor invented by PUB-NOM, classify current figure/table treatment, preserve DRW ownership of any future public figure register, and run final source/rendered validation through the PR gate.

## Frozen upstream decisions applied here

NOM-02 already decided:

- `G-01` is a reader-facing stable reference when tied to its human grammar name;
- `G-01 v0.1` is **technical-only** and should not become routine primary prose;
- `M1`–`M5` are a real maturity scale but are not self-explanatory; technical/status surfaces may use the code with its named state, while primary prose should state meaning in words;
- workflow/gate numbers are internal/provenance;
- pattern IDs are stable machine identity, not publication order;
- `D-F*` is retired and DRW owns any later reader-facing figure-number architecture.

## Audit log

### NOM-08A — grammar identity and version semantics — COMPLETE

Decision:

- **`G-01` is stable reader identity.** It names one concrete Georgian-derived domestic grammar and supports useful cross-reference between grammar, evidence and the Reference House.
- **`v0.1` is genuine specification version identity, not maturity or publication order.** The specification itself defines a versioning rule: changes to invariant statements, rule authority, scope, membership consequence or positive dimensional families require a new version; non-semantic editorial corrections do not.
- **The version therefore survives only where exact revision identity is the reader task.** The grammar specification and its conformance/validation surface remain technical and may show `G-01 v0.1`; ordinary primary prose, navigation and Reference House exposition use `G-01` or the human grammar name.

Changes:

- restored `grammar.g01-version` to `PUBLIC_TECHNICAL` exposure rather than the temporary NOM-07 all-reader exception;
- classified the Reference House grammar-conformance record as a technical surface;
- removed `v0.1` from ordinary grammar overview, case index, Reader's Guide, Part IV, implementation schedule, research agenda and Reference House overview prose;
- changed public navigation labels to `G-01 — specification` and `G-01 conformance` while leaving exact version identity on the technical destinations;
- source nomenclature validation passed under the narrowed exposure rule.

Implementation commit: `27fd46f5902490255d9eebfde6cb1cd73854bf37`; one-shot workflow removed at `9e577ec391437f23e780d779ada3a296e469d037`.

### NOM-08B — project maturity semantics — COMPLETE

Decision:

- **`M1`–`M5` is a genuine ordered maturity scale.** The canonical meanings are M1 Framed, M2 Developed, M3 Coordinated, M4 Internally validated / controlled, and M5 Externally validated / release-ready.
- **The scale is evidence state, not publication sequence or workflow chronology.** A higher number makes a stronger evidence/validation claim at the stated scope.
- **Bare maturity codes remain unsuitable for ordinary reader prose.** The canonical nomenclature validator therefore continues to classify them as `PUBLIC_TECHNICAL`, not primary publication language.
- **Machine data may retain the compact enum.** The canonical data plate is a public-machine/status artefact generated from `project/maturity.ts`; exact `M*` identity is useful there and does not require duplication of the human label into every machine record. Human explanations derive from the one canonical maturity model.

Proof:

- the nomenclature inventory found **zero project-maturity tokens on public site source and zero in publication source**;
- the only public-surface occurrence class is the machine data plate, with one maturity value for each of the eleven tracked workstreams;
- apparent `M*` matches in historical Reference House mutation records are internal mutation labels rather than public maturity presentation;
- `CIBSE Guide M1` and UK accessibility categories `M4(2)` / `M4(3)` are external/domain notation, not Ovid's House maturity, and the registry pattern explicitly distinguishes them.

No content or schema migration was justified by NOM-08B.

### NOM-08C — sequence, order and stable identity — COMPLETE

Decision and proof:

- **Part I–V** is actual publication reading order and remains Roman-numeral section identity.
- **Appendix A–E** is actual back-matter order and publication-local cross-reference.
- **Constitution provisions 1–11** are durable reader references. The constitution explicitly states that the numbers remain stable because patterns, research and project records refer to them; they are therefore semantic cross-reference identity, not a claim of priority or maturity.
- **Service-topology S1–S10** is a real generative sequence. All ten steps occur exactly once in order and the page explicitly defines them as the order in which service-geography decisions should be made.
- **Pattern `PAT-*` numbers are stable machine identity only.** They remain absent from ordinary rendered pattern titles/contents and have no reader-order meaning.
- **Workflow gates remain workflow gates.** `RH-C*`, `CH-*`, `PR-*`, `NOM-*` and comparable development-stage numbering remain bounded to internal/provenance surfaces.

The original triggering defect is now structurally guarded in `publication/scripts/validate.ts`: reader-facing pattern titles may not contain `HSA-P-*` or `PAT-*`; the full publication pattern sequence must equal the separately authored canonical reader sequence; and validation deliberately fails if that authored sequence ever collapses to numeric machine-ID order. A future `PAT-014` before `PAT-003` therefore cannot again masquerade as chapter numbering because neither ID is rendered as the chapter identity.

No further sequence migration was required.

### NOM-08D — figure/table/reference numbering and reconciliation — COMPLETE

Decision:

- **PUB-NOM does not invent a figure numbering system.** The Working Edition currently uses eleven title/caption-led retained figures; the publication validator preserves the exact set by asset identity and alt text.
- **Retired `D-F*` remains retired.** Diagnostic scanning found no `D-F*` on ordinary reader surfaces.
- **There is currently no formal `Figure 1` / `Table 1` reader-number system to reinterpret.** Diagnostic scanning found no numbered Figure/Table references in the primary manuscript/pattern/Reference House corpus.
- **Future public figure numbering belongs to DRW.** When DRW creates a canonical figure register, PUB-NOM's responsibility is only to ensure that its reader-facing numbers remain distinct from compiler/source lineage identifiers.

The diagnostic pass also reconfirmed that the service sequence is S1–S10 and the publication manifest contains the complete Part I–V and Appendix A–E sequences. Its final assertion failed only because the diagnostic searched the validator source for the literal substring `PAT-`, while the existing regular expression encodes the same family as `(?:HSA-P|PAT)-`; inspection confirmed the intended pattern-order/title guards are present. The diagnostic made no repository changes and its one-shot workflow was removed at `732c70055f6728c01a55bea150e74d6d6ab2e8fc`.

## NOM-08 conclusion

The remaining visible numbers now have distinct semantics:

| Family | Semantic role | Reader treatment |
| --- | --- | --- |
| `G-01` | stable grammar identity | reader-facing when tied to human meaning |
| `G-01 v0.1` | exact specification version | technical specification/conformance surfaces only |
| `M1`–`M5` | ordered evidence maturity | technical/machine status only; primary prose uses meaning |
| Part I–V | publication reading order | public |
| Appendix A–E | back-matter reading/reference order | public |
| Principles 1–11 | stable constitutional cross-reference | public |
| S1–S10 | genuine generative sequence | public |
| `PAT-*` | stable machine identity | hidden from ordinary reader presentation |
| workflow gates | development chronology | internal/provenance only |
| `D-F*` | retired figure identity | prohibited outside provenance |
| future figure numbers | publication-local figure cross-reference | owned by DRW, not yet instantiated |
| dimensions/standards values | technical parameter / external notation | unchanged where contextually correct |

No number is being used simultaneously as publication order, machine identity and maturity. The specific semantic entanglement that triggered PUB-NOM has been removed.

## Exit condition

NOM-08 is complete subject to the branch's normal PR validation gate. That gate rebuilds the site, Working Edition and Primer, enforces source nomenclature rules, scans rendered HTML and extracted PDF text, and exercises the publication-order regression guards. NOM-09 should now adversarially prove those gates fail for deliberately reintroduced mistakes rather than merely observing the clean corpus.
