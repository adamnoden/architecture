# Tectonic Integration Register

**Status:** active migration ledger  
**Purpose:** guarantee that the current tectonic/reversible-assembly development is integrated deliberately rather than scattered through the project.  
**Source baseline:** `House Design Doctrine v7` remains preserved and is not rewritten in place.

## Migration rule

Every material idea must end in one of three states:

- **Integrated** — carried through the relevant doctrine → strategy → pattern → reference implementation → delivery/test chain.
- **Reference-house only** — intentionally specific to the worked Georgian house and not claimed as universal doctrine.
- **Rejected** — deliberately excluded, with the reason recorded.

Nothing is considered integrated merely because it appears once in prose.

## Core propositions

| ID | Proposition | Primary home | Required downstream expression | Status |
|---|---|---|---|---|
| TH-01 | **Selective permanence:** every element should justify becoming part of the permanent building. | Part I / Principles | permanence map; replacement hierarchy | Integrated |
| TH-02 | **Tectonic honesty:** construction may conceal complexity but should not falsify material, movement, construction or function. | Principle 11 / Part II | pattern architectural-resolution field; reference-house language | Integrated |
| TH-03 | **Concealment is not deception.** A real architectural element may conceal a real technical condition; a cosmetic surface should not counterfeit a different material or structural relationship. | Tectonic-honesty position | reference-house review test | Integrated |
| TH-04 | **Beauty is a technical requirement.** A serviceable detail is not finished until its visible resolution belongs to the architecture. | Pattern methodology / Delivery | architectural-resolution review | Integrated |
| TH-05 | **Bounded movement:** do not attempt to suppress every movement; identify harmless movements and give them controlled places to occur. | Principle 3 / Ch.6 | movement map; movement/slip patterns | Integrated |
| TH-06 | **Separate functions at interfaces:** support, restraint, movement, sealing, protection and finish should be distinguished unless there is a reason to combine them. | Ch.6 | interface-family drawings | Integrated |
| TH-07 | **Seated Floor Structure:** support by bearing; restrain only where restraint is required. | Candidate pattern | structural engineering study + 1:1 edge prototype | Candidate |
| TH-08 | **Few permanent fixings:** reversible fixings are encouraged, but penetrations of permanent fabric should be sparse, deliberate and documented. | Principle 2 / Replaceable Interior | attachment map | Integrated |
| TH-09 | **Architectural Backplane:** permanent fabric receives a limited engineered attachment interface; later occupation attaches principally to that interface. | Candidate pattern | load classes; remanufacturable geometry | Candidate |
| TH-10 | **Replaceable Wall Lining:** investigate dry, mechanically mounted internal lining systems independent of permanent masonry. | Replaceable Interior / Candidate pattern | fire/acoustic/impact/moisture study | Candidate |
| TH-11 | **Wet-trade discipline:** site-applied wet/bonded finishes require justification when they bridge replaceable layers, movement interfaces or future access. | Replaceable Interior / Delivery | wet-trade justification schedule | Integrated |
| TH-12 | **Manufacture according to lifespan:** the shorter-lived and more replaceable the layer, the stronger the presumption that it should be manufactured under controlled conditions and dry-assembled on site. | Principle 6 / Part V | manufacturing schedule | Integrated |
| TH-13 | **Finish-Agnostic Floor Platform:** separate the removable floor platform from the finish system so timber, tile, stone or other finishes can use a common interface. | Candidate pattern | interface datum; stiffness/acoustic/load criteria | Candidate |
| TH-14 | **Joints are architecture:** panel and movement joints should be deliberately composed rather than hidden by cosmetic continuity. | Ch.6 / Reference house | joint grammar | Integrated |
| TH-15 | **Georgian grammar as interface grammar:** skirting, dado, picture rail, cornice, architrave, panel moulding and threshold can coincide with real technical interfaces. | Reference house | architectural-language document | Reference-house only |
| TH-16 | **Brass/bronze as functional interface language:** visible metal should normally correspond to movement, wear, access, disassembly, indexing or touch. | Reference house / patterns | metal-use rules and prototypes | Reference-house only |
| TH-17 | **Boundary independence:** routine removal of decorative/replaceable layers should not casually destroy critical fire, air, acoustic, moisture or thermal boundaries. | Ch.10 / patterns | boundary ledger | Integrated |
| TH-18 | **Ordinary mechanisms, durable enclosures:** commodity technical components should sit inside beautiful, remanufacturable architectural housings where needed. | Principle 6 / Part V | standardisation hierarchy | Integrated |
| TH-19 | **Build the permanent house; assemble the changeable house inside it.** | Part I / Part V | layer/manufacturing hierarchy | Integrated |
| TH-20 | **First-article disassembly:** repeated non-standard assemblies should be removed and reinstated during prototype approval, not merely inspected visually. | Delivery / Part V | prototype acceptance criteria | Integrated |
| TH-21 | **Workmanship robustness:** ordinary construction variation should be anticipated and translated through deliberate tolerance strategies; consequential repeated assembly should not depend unnecessarily on exceptional precision, hidden knowledge or improvised site correction. | Principle 3 / Principle 6 / Ch.6 / Part V | tolerance/workmanship schedule; representative-installer trial; prototype acceptance criteria | Integrated |

## Anti-drift controls

The following interpretations are explicitly **not** the intended doctrine:

- “no screws” — wrong; screws and bolts are valuable reversible fasteners. The target is few uncontrolled fixings into permanent fabric;
- “all movement is good” — wrong; load paths and required restraint remain deterministic;
- “all plaster is forbidden” — wrong; wet finishes are appropriate where their permanence, movement behaviour and future access consequences are compatible;
- “all visible joints must be metal” — wrong; brass/bronze are one reference-house language, not universal doctrine;
- “honesty means expose every technical mechanism” — wrong; concealment is legitimate when the concealing element is itself real, removable and architecturally coherent;
- “prefabrication is inherently superior” — wrong; manufacture is preferred where it improves repeatability, quality, reversibility and replacement at the relevant lifespan layer;
- “panelisation means a panelised aesthetic” — wrong; panel boundaries may be absorbed into architectural composition;
- “replaceability outranks fire, acoustics, moisture, structure or comfort” — wrong; boundary and performance obligations remain non-negotiable;
- “design for ordinary workmanship means accepting poor workmanship” — wrong; the target is explicit achievable tolerances, clear datums, bounded adjustment and visible rejection of out-of-range work;
- “mistake-proofing means eliminating craft” — wrong; skilled judgement should be preserved where it creates architectural or technical value rather than spent rescuing unresolved interfaces.

## Completion audit

An item can be marked **Integrated** only when its required homes have been checked.

For a typical physical proposition the expected chain is:

**why** — governing principle / manuscript argument  
**how** — strategy  
**reusable response** — pattern  
**project choice** — reference house  
**responsibility and stage** — implementation brief  
**proof** — prototype / calculation / commissioning / replacement test

## Current integration map

The tectonic migration is now distributed deliberately across the project:

- **Doctrine / public argument:** `docs/manuscript/governing-principles.md`, `part-i.md`, `part-ii.md`;
- **making / procurement / testing:** `docs/manuscript/part-v.md`;
- **reusable established patterns:** `docs/patterns/core-12.md`;
- **unproven physical systems:** `docs/patterns/reversible-assembly-candidates.md`;
- **reference-house architectural expression:** `docs/reference-house/tectonic-architectural-language.md`;
- **manufacturing logic:** `docs/development/manufacturing-strategy.md`;
- **engineering and 1:1 validation:** `docs/development/tectonic-prototype-programme.md`;
- **workmanship-robustness research/control:** `docs/research/workmanship-robustness.md`;
- **project enforcement:** `docs/delivery/riba-implementation-brief-template.md`.

“Integrated” means the idea now has the appropriate documentary chain. It does **not** promote experimental physical systems to proven construction. TH-07, TH-09, TH-10 and TH-13 remain candidates until the engineering/prototype programme produces enough evidence to select, modify or reject them.

The register remains the audit record for future refinements.