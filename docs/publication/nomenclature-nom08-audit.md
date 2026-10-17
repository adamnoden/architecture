<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-08 order, numbering and version semantics audit

**Gate:** NOM-08 — order, numbering and version semantics audit  
**Status:** IN PROGRESS  
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

- [ ] **NOM-08A — grammar identity and version semantics**  
  Resolve `G-01` versus `G-01 v0.1`, keep the specification version where exact revision identity matters, and remove version typography from ordinary primary prose/navigation where the grammar identity alone performs the reader task.
- [ ] **NOM-08B — project maturity semantics**  
  Prove `M1`–`M5` are used only as the project maturity scale, keep them off primary prose, pair human-facing technical occurrences with named maturity states, and distinguish external lookalikes such as CIBSE Guide M1 and UK M4(2)/M4(3).
- [ ] **NOM-08C — sequence, order and stable identity**  
  Verify genuine sequences such as Part I–V, Appendix A–E, Principle numbers and service-topology S1–S10 are true order/reference systems; prove pattern publication order cannot derive from `PAT-*`; keep workflow gates internal.
- [ ] **NOM-08D — figure/table/reference numbering and final reconciliation**  
  Confirm retired `D-F*` has no successor invented by PUB-NOM, classify current figure/table treatment, preserve DRW ownership of any future public figure register, and run final source/rendered validation.

## Frozen upstream decisions applied here

NOM-02 already decided:

- `G-01` is a reader-facing stable reference when tied to its human grammar name;
- `G-01 v0.1` is **technical-only** and should not become routine primary prose;
- `M1`–`M5` are a real maturity scale but are not self-explanatory; technical/status surfaces may use the code with its named state, while primary prose should state meaning in words;
- workflow/gate numbers are internal/provenance;
- pattern IDs are stable machine identity, not publication order;
- `D-F*` is retired and DRW owns any later reader-facing figure-number architecture.

## Exit condition

NOM-08 closes only when all visible number/version families are semantically classified, primary-versus-technical treatment matches the frozen contract, misleading ordinal/version cues are removed, the original pattern-order defect remains structurally impossible, and source plus rendered validation pass with the tightened rules.
