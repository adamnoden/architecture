# Pattern-Language Overhaul — Phase 7 Gate Review

**Decision:** **PASS — canonical migration complete**  
**Validated main checkpoint:** `d2788191b546d1049f84e50fe1644e1007715179`  
**Validation:** GitHub Pages run 31 completed the **Build documentation** step successfully with pattern metadata validation active  
**Scope:** identity/classification/integration integrity; this decision does not increase physical or evidential maturity

---

## 1. Gate question

Phase 7 asked:

> **Can the audited pattern corpus be migrated into one canonical, individually addressable language—with strategies, held candidates, project occurrences and provenance kept distinct—without creating duplicate authority, evidence inflation or metadata bureaucracy?**

**Yes.**

The resulting structure is materially clearer than the pre-migration catalogue and has survived its build-time integrity checks.

---

## 2. Final canonical corpus

### Active patterns — 21

- `HSA-P-001` Controlled Utility Entry
- `HSA-P-002` Plant Room as Service Hub
- `HSA-P-003` Coherent Horizontal Service Route
- `HSA-P-004` High-Service-Room Service Wall
- `HSA-P-005` Designed Structural Penetration
- `HSA-P-007` Permanent Opening / Replaceable Window
- `HSA-P-008` Movement / Slip Junction
- `HSA-P-009` Accessible Rainwater Route
- `HSA-P-010` Source-Capture Kitchen Extract
- `HSA-P-011` Roof Maintenance Route
- `HSA-P-012` Physical Service Index
- `HSA-P-013` Ground-Supported Façade Access
- `HSA-P-014` Accessible Vertical Service Zone
- `HSA-P-015` Accessible Room Service Route
- `HSA-P-016` Compartmented Service Void
- `HSA-P-017` Visible Leakage Path
- `HSA-P-018` Failure-Tolerant Wet Service Room
- `HSA-P-019` Permanent Opening / Replaceable Door
- `HSA-P-020` Designed Threshold
- `HSA-P-021` Source-Capture Bathroom Extract
- `HSA-P-022` Controlled Attachment Plane

### Retired identity

- `HSA-P-006` Water-Damage-Safe Service Route — permanently reserved and never reused.

Its durable umbrella proposition survives as the **Fail-Safe Water Distribution** strategy.

### Canonical strategies

- Fail-Safe Water Distribution
- Decompose Structural Interface Functions
- Separate Structural Floor from Changeable Layers Where Proportionate

### Held candidates — deliberately unnumbered

- Replaceable Architectural Lining
- Individually Isolatable Manifold Distribution
- Local Deep Service Zone
- Selective Floor Access

### Implementation/prototype material retained outside the graph

Examples include service skirting, door-surround routing, undercroft topology, pipe-in-pipe, Seated Floor Structure, Finish-Agnostic Floor Platform, functional cornice and specific attachment-plane constructions.

---

## 3. What Phase 7 changed

### P7.1 — identity / layout

Stable ID rules, canonical file layout and generated Markdown-frontmatter index established.

### P7.2 — Core migration

Original Core identities split into individual pages; `P-003` corrected in scope/name; `P-006` retired rather than preserved falsely.

### P7.3 — new admitted identities

Ten audited propositions received stable canonical IDs without evidence/maturity inflation.

### P7.4 — non-pattern homes

Strategies and held candidates received explicit homes outside the pattern graph. Implementation challengers remained research/prototype material.

### P7.5 — Reference House + publication integration

- created the canonical Reference House Pattern Occurrence Register;
- distinguished pattern selection, occurrence, implementation direction and evidence obligation;
- preserved Phase-5 run/brief as historical discovery records;
- rebuilt publication Part III around the actual language rather than the obsolete 30-slot inventory;
- removed the rejected bundled **Perimeter Dry Zone** assumption from the current external-maintenance plan.

### P7.6 — integrity tooling

The ordinary documentation build now rejects:

- malformed stable pattern IDs;
- duplicate IDs;
- invalid active/retired state;
- canonical-location/state mismatch;
- relationship references to unknown IDs;
- self-referential graph edges.

Reverse-reference data is derived from the same frontmatter. No second registry was created.

---

## 4. Close-gate checks

| Gate | Result |
|---|---|
| every active pattern has exactly one canonical page | **PASS** |
| stable IDs remain unique and meaning-preserving | **PASS** |
| retired `P-006` remains visible and unreused | **PASS** |
| strategies remain outside pattern graph | **PASS** |
| held candidates remain unnumbered | **PASS** |
| implementation/prototype history preserved | **PASS** |
| graph remains sparse; sequence remains separate | **PASS** |
| Reference House current state uses canonical identities | **PASS** |
| publication architecture uses canonical Part III | **PASS** |
| historical migration records remain recoverable but non-authoritative | **PASS** |
| metadata validation runs in ordinary docs build | **PASS** |
| VitePress/navigation build passes | **PASS** |
| resulting structure is clearer than pre-migration catalogue | **PASS** |

---

## 5. Important limitations

Phase 7 validates **information architecture and migration integrity**, not physical adequacy.

It does not prove:

- that experimental wall/floor/structural assemblies work physically;
- that the Reference House occurrences are technically resolved;
- that pattern evidence labels are sufficient for construction specification;
- that the computational model can formalise every pattern consequence;
- that Part III is publication-finished merely because its canonical contents are now known.

Those remain separate validation/development tracks.

---

## 6. What is now unlocked

### Phase 8 — computational crosswalk

Map only the **formalisable consequences** of stable patterns to the existing semantic relationship / obligation / evidence model.

Do not turn patterns themselves into compiler entities.

### Phase 9 — publication development

Develop Part III/IV from the stable canonical corpus and Reference House occurrence model. The structural rearchitecture is complete; remaining work is publication-quality synthesis, figures, evidence presentation and editing.

### Continuous Phase 11 — validation

Prototype, engineering and professional challenge continue independently. A future test may change evidence/maturity or even force a pattern retirement; Phase 7 completion does not freeze knowledge against new evidence.

---

## 7. Resume-from-here

A future collaborator should read:

1. root `README.md`;
2. `STATUS.md`;
3. [`pattern-language-overhaul.md`](pattern-language-overhaul.md);
4. this review;
5. [`../patterns/README.md`](../patterns/README.md);
6. [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md);
7. [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md).

Do **not** restart the catalogue/taxonomy migration. Phase 7 is closed. Reopen classification only when new architectural, physical or professional evidence genuinely requires it.