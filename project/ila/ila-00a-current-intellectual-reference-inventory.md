# ILA-00A — Current intellectual-reference inventory

**Programme:** [#630 — ILA — intellectual lineage and attribution audit](https://github.com/adamnoden/architecture/issues/630)  
**Packet:** ILA-00A  
**Baseline `main`:** `159496443cdfec11768308051f31e28fca2cb394`  
**Purpose:** freeze the project’s current attribution / intellectual-reference surface before ILA performs any new source discovery.

## 1. Scope and restraint

ILA-00A records **what Ovid’s House already names, cites or treats as precedent**. It does not decide whether the current attribution is adequate and it does not add missing thinkers merely because they are plausible antecedents.

This packet therefore distinguishes:

- reader-facing conceptual lineage;
- reader-facing cross-domain analogy or conceptual transfer;
- philosophical / interpretive framing;
- built or historical precedent;
- technical / empirical / normative evidence;
- research-only intellectual material;
- representation / publication precedents owned by other programmes;
- reading-list entries not presently tied to a specific reader-facing claim.

No relationship recorded below should yet be read as `EXPLICIT_PROJECT_SOURCE`, `EARLIER_ANTECEDENT`, `CONVERGENT`, or another final ILA relationship type. ILA-00C owns that contract.

## 2. Controlled surfaces inspected

### Primary reader-facing argument

- `docs/manuscript/preface.md`
- `docs/manuscript/governing-principles.md`
- `docs/manuscript/part-i.md`
- `docs/manuscript/part-ii.md`
- `docs/manuscript/part-v.md`
- `docs/manuscript/evidence-and-precedent-notes.md`
- `docs/manuscript/sources-and-further-reading.md`
- `docs/reading-guide.md`

Part III is represented canonically by the pattern corpus rather than a separate manuscript file. Part IV is primarily the Reference House worked integration / drawing layer and was not treated as a fresh intellectual-history source in this inventory.

### Pattern / research apparatus

- `docs/patterns/README.md`
- `docs/patterns/language-model.md`
- `docs/research/README.md`
- `docs/research/preface-precedents.md`
- `project/ocg/ocg-02b-maintainability-reversible-construction-research.md`
- HFI project records were checked at programme / evidence-register level to establish their role: they are predominantly normative, empirical and human-factors evidence rather than a currently asserted intellectual genealogy.

### Representation precedent boundary

- `docs/publication/architectural-drawing-drw01a-precedents.md`

This is recorded only to prevent ILA from accidentally absorbing a deliberate DRW/PLT visual-precedent programme into architectural intellectual lineage.

## 3. Current reader-facing conceptual lineage

| Source / tradition currently named | Current location | Current use in Ovid’s House | Current prominence | Baseline observation only |
| --- | --- | --- | --- | --- |
| **N. John Habraken / Open Building** | Part I chs. 2–3; research `preface-precedents`; Sources & further reading | Long-lived support / changeable infill; residential adaptability; precedent that durable architectural order can coexist with changing infill | High | Explicitly presented as architectural lineage. Named works include *Supports* and, in back matter, Kendall & Habraken’s *Open Building for Architects*. |
| **Frank Duffy** | Part I ch. 2 + note [6]; research `preface-precedents` | Buildings as assemblies of elements changing at different rates | High but bibliographically light | Explicitly named in the main argument and research lineage. Current Part I note is the generic `Frank Duffy / Stewart Brand, building-layer models`; the general Sources page does not identify a specific Duffy work. No correction is made here. |
| **Stewart Brand** | Part I ch. 2; research `preface-precedents`; Sources & further reading | Popularisation of shearing / pace layers and differential rates of change | High | Explicitly presented as related architectural lineage. `How Buildings Learn` appears in Sources; the research page additionally lists Brand’s pace-layer essay. |
| **Alex Gordon** | Part I ch. 2 + note [7]; research `preface-precedents` | “Long life, loose fit, low energy”: durability joined to capacity for changed use | Medium | Explicitly named in the main lineage paragraph; current note points to RIBA Journal discussion rather than a fully specified primary item. No disposition yet. |
| **Christopher Alexander, Sara Ishikawa & Murray Silverstein / pattern-language tradition** | Sources & further reading; `docs/patterns/README.md` describes the corpus as not yet a uniformly mature “Alexander-style pattern language” | Reference point for pattern-language ambition / maturity | Medium, mostly pattern-system/back-matter | The pattern layer clearly acknowledges Alexander as the relevant comparison, but the present authoring contract is largely self-defined and does not narrate a detailed conceptual lineage to *A Pattern Language*. |
| **Herbert A. Simon** | Part I ch. 2 + note [27]; Sources & further reading | “Nearly decomposable” systems as a parallel for keeping ordinary change local rather than propagating through the whole | Medium | Explicitly labelled a systems-theory parallel rather than an architectural precedent. |
| **C. S. Holling** | Part I ch. 3 + note [28]; Sources & further reading | Resilience versus stability as a bounded analogy for persistence through disturbance | Medium | Main text explicitly limits the architectural transfer. |
| **Charles Perrow** | Part II ch. 7; Sources & further reading | Tight coupling / propagation of failure as a cross-domain distinction relevant to local failure architecture | Medium | Explicitly says the source domain is far removed from domestic construction and transfers only a narrow distinction. |
| **Steven J. Jackson** | Part II ch. 8; Sources & further reading | “Broken world thinking”; repair/care as ordinary continuation rather than exceptional afterlife | Medium | Directly connected to maintenance geography in the main argument. |
| **Shannon Mattern** | Part II ch. 8; Sources & further reading | Maintenance as ordinary work sustaining technical worlds | Medium | Directly connected to maintenance geography in the main argument. |
| **Stephen Graham & Nigel Thrift** | Research `preface-precedents` | Repair/maintenance as normally hidden activities central to persistence | Research-only / contextual | Used in the research lineage page but not currently the named maintenance source in the main manuscript or general Sources page. |
| **David Pye** | Part II ch. 6; Part V ch. 21; Sources & further reading | Workmanship of risk / certainty; deliberate allocation of craft and repeatability | Medium-high | Explicit conceptual tool used twice in the reader-facing argument. |
| **Ursula M. Franklin** | Part V ch. 21; Sources & further reading | Holistic versus prescriptive technologies; boundary between maker judgement and prescribed repeatability | Medium | Explicit conceptual transfer tied to manufacture / workmanship. |
| **Shigeo Shingo / poka-yoke** | Part V ch. 21; Sources & further reading | Mistake-proofing at source; geometry / sequence should prevent or expose consequential assembly errors | Medium | Explicitly described as a narrow architectural transfer. |
| **Meir M. Lehman & Juan F. Ramil** | Part I ch. 1; Sources & further reading | Software evolution as analogy for continuing adaptation to changing context | Low-medium | Main text explicitly narrows the transfer and rejects software-speed change as the architectural lesson. |
| **Gwern Branwen** | Part I ch. 1; Sources & further reading | “Bitrot” as everyday analogy for unchanged systems becoming unsatisfactory as dependencies change | Low-medium | Explicit analogy rather than architectural lineage. |

## 4. Current philosophical / interpretive frame

| Source / case | Current location | Current role | Boundary already stated |
| --- | --- | --- | --- |
| **Ovid / _Metamorphoses_** | Preface; Part I ch. 3; research `preface-precedents` | Project name and interpretive frame for transformation, identity and continuity through altered form | Explicitly **not** presented as an architectural method or hidden theory of building. |
| **Heraclitus / river fragment** | Part I ch. 3; research `preface-precedents` | Analogy for continuity through turnover | Explicitly treated as analogy, not architectural authority. |
| **Ship of Theseus / identity-over-time tradition** | research `preface-precedents` | Frames the “persistence conditions” question | Explicitly does not supply a ready-made architectural answer. |
| **Ise Jingu / Shikinen Sengu** | research `preface-precedents` | Extreme precedent distinguishing material persistence from architectural/institutional continuity | Strong transferability warning already present. |
| **Nakagin Capsule Tower / Kisho Kurokawa** | research `preface-precedents` | Counter-precedent: intended replaceability is not meaningful unless the whole replacement chain is executable | Used to challenge representational claims of flexibility, not as a house template. |

## 5. Current narrative / methodological precedents in the Preface

These precedents establish the project’s method more than its architectural doctrine.

| Precedent | Current use |
| --- | --- |
| **John Thorpe / Beaufort House + Robin Evans** | The corridor as a relationship once treated as normal being redrawn; circulation is given its own geography. |
| **Richard and Maurice McDonald / Speedee Service System** | Full-scale rehearsal and reorganisation of relationships rather than local optimisation of an inherited process. |
| **Malcolm McLean + containerisation / ISO interface standardisation** | Stable interfaces allowing heterogeneous independent systems to interoperate; the interface outlives the originator. |
| **Joseph Paxton / Crystal Palace** | Cross-domain transfer from glasshouse culture; standardisation/prefabrication can coexist with architectural ambition. |

The research `preface-precedents` page repeats these cases with explicit transfer limits.

## 6. Current built / technical precedents around change and replaceability

The project presently uses built precedent to demonstrate possibility or expose limits, not to create doctrine automatically.

Notable current examples include:

- **Molenvliet** — Open Building support/infill residential precedent in Part I;
- **NEXT21** — repeated residential reconfiguration; Part I and OCG-02B explicitly limit transfer from its deep multi-unit service infrastructure to a detached house;
- **traditional timber sash windows** — OCG-02B treats local, culturally ordinary replaceability as a stronger bounded precedent than universal demountability;
- **Loblolly House / KieranTimberlake** — OCG-02B uses it as proof that highly integrated reversible house-scale construction is possible while warning that it creates its own system dependencies;
- **Historic England / SPAB repair practice** — used as bounded domestic precedent for retaining slower fabric while servicing replaceable subcomponents.

These are currently precedent/evidence records, not asserted intellectual ancestry unless separately stated above.

## 7. Current technical / empirical / normative evidence separated from intellectual lineage

The present corpus already contains many sources whose primary role is to support bounded claims rather than to supply the project’s conceptual ancestry. ILA should not inflate them into “influences”.

Important families include:

- ISO 15686 service-life planning;
- ISO 20887 design for disassembly and adaptability;
- RICS whole-life carbon / cost material;
- CIBSE maintainability guidance;
- RIBA Plan of Work / Plan for Use;
- Historic England / conservation guidance;
- CDM and other statutory / professional obligations;
- empirical building / perception / privacy / environmental-control literature used by Repose;
- HFI’s Building Regulations, BS, anthropometry, falls, ergonomics and inclusive-design evidence;
- OCG’s occupied-work, DfD/A, counter-evidence and domestic-precedent research.

The manuscript’s own `Evidence and Precedent Notes` already states this separation: external knowledge, architectural precedent, internal design research, and physical/professional evidence do different jobs.

## 8. Reading-list-only or weakly claim-linked sources at this baseline

The general `Sources and further reading` page contains relevant material that is not presently given a clear reader-facing conceptual role in the principal argument inspected above.

At minimum this includes:

- **Ivan Illich — _Tools for Conviviality_**;
- **James C. Scott — _Seeing Like a State_**;
- **Langdon Winner — “Do Artifacts Have Politics?”**.

They sit under “Agency, legibility and technical dependence”, but this packet found no corresponding named invocation in Parts I, II or V.

This is **not** an ILA finding that they should be promoted. It records the current distinction between inclusion in further reading and actual argumentative use.

The same rule applies generally: inclusion in the Sources page means relevance, not adopted argument or documented influence.

## 9. Representation precedents deliberately outside ILA conceptual ownership

DRW-01A has a mature, bounded five-family precedent set organised by **representational job**:

- Caruso St John Architects;
- Glenn Murcutt;
- DETAIL;
- Atelier Bow-Wow;
- Drawing Matter / Laurent Stalder and Cedric Price / Fun Palace.

Its governing rule is to borrow conventions that make architecture more inspectable without borrowing another architect’s visual personality.

These sources remain DRW/PLT representation authority. ILA should only revisit one if later claim-first work proves that the source also materially participates in an architectural concept under audit.

## 10. Baseline architecture of attribution

Without making adequacy judgements, the current project already has a recognisable attribution architecture:

1. **The main temporal lineage is explicit.** Part I directly names Habraken, Duffy, Brand and Gordon before introducing Ovid’s House’s coupling emphasis.
2. **Cross-domain transfers are usually signposted as transfers.** Simon, Holling, Perrow, software evolution, Franklin and Shingo are presented with limiting language rather than silently treated as architectural authority.
3. **Maintenance has multiple current source traditions.** The reader-facing manuscript invokes Jackson / Mattern; the transformation research page invokes Graham / Thrift.
4. **Pattern-language ancestry is acknowledged more lightly.** Alexander is a back-matter source and maturity reference (`Alexander-style`) rather than a developed reader-facing genealogy of the Ovid pattern system.
5. **Philosophy is carefully bounded.** Ovid, Heraclitus and persistence thought are explicitly interpretive frames rather than technical authority.
6. **The project already states that its contribution, where present, lies in architectural combination rather than discovery of established facts.** The governing constitution also says its provisions are not eleven claims of novelty.
7. **The bibliography is not equivalent to the argument.** Several works appear in further reading without a named claim-level role, while several claim-level names are represented only by coarse notes or research-page references.
8. **Research has a deeper precedent surface than the compact reading list.** The transformation/preference and OCG records preserve material such as Graham/Thrift, Nakagin, Ise, NEXT21, sash-window repair and Loblolly that the main argument uses selectively or not at all.

These are descriptions of the before-state. `ADEQUATE`, `UNDER_ATTRIBUTED`, `MISATTRIBUTED`, priority, influence and Ovid-delta judgements are explicitly held for later ILA gates.

## 11. Explicit non-findings

ILA-00A does **not** conclude:

- that any omitted thinker should be added;
- that any named source influenced the project merely because it predates it;
- that the Habraken → Duffy → Brand relationship has been correctly or incorrectly represented;
- that Brand is an adequate source for Duffy;
- that O’Neill or any other proposed deeper systems source belongs in the lineage;
- that a source is foundational, major, contextual or peripheral;
- that the current manuscript requires a freeze break;
- that Ovid’s House has or lacks originality in any concept family.

Those conclusions require the ILA-00B/00C claim and relationship contracts followed by source discovery and primary-source review.

## 12. ILA-00A result

**PASS — current intellectual-reference before-state is sufficiently explicit to proceed without importing the triggering Duffy / O’Neill discussion into the baseline.**

The inventory establishes a useful starting distinction between:

- concepts already credited directly in the manuscript;
- bounded cross-domain transfers;
- interpretive/philosophical material;
- built precedents;
- technical/empirical evidence;
- research-only material;
- visual/representation precedent;
- back-matter-only references.

No doctrine, pattern, Reference House, compiler, drawing or reader-facing publication content changed in this packet.

## 13. Next authorised packet

**ILA-00B — canonical claim spine.**

Recover the small set of Ovid’s House propositions important enough that significant prior articulation would materially change how the project should position them.

Do not begin source discovery or lineage verdicts until the claim spine is frozen.