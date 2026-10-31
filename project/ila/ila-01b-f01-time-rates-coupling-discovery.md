# ILA-01B-F01 — Time, rates of change and coupling discovery

**Programme:** [#630 — ILA — intellectual lineage and attribution audit](https://github.com/adamnoden/architecture/issues/630)  
**Packet:** [#642 — ILA-01B-F01 — time, rates of change and coupling discovery](https://github.com/adamnoden/architecture/issues/642)  
**Depends on:** ILA-01A / PR #641 / merge `1f5566191dafbaec69dd3bdde5f9f35005a762e5`  
**Baseline `main`:** `1f5566191dafbaec69dd3bdde5f9f35005a762e5`  
**Family:** ILA-F01 — Time, rates of change and coupling  
**Primary claims:** ILA-C01, ILA-C02  
**State:** bounded discovery register; provisional relationships only; no final importance, attribution or publication verdicts

## 1. Question

ILA-F01 asks:

> **What follows architecturally from treating a building as a long-lived system whose parts change at different rates, and when do those rate differences become destructive dependencies?**

The packet must distinguish five propositions that are easy to collapse:

1. buildings change through time;
2. different parts of buildings change at different rates;
3. slower and faster parts can be usefully distinguished as layers or subsystems;
4. those layers should sometimes be capable of changing independently;
5. embedding faster-changing systems inside slower-changing ones can cause the faster cycle to consume or prematurely obsolete the slower construction.

Ovid's current C02 goes further than merely drawing a lifespan diagram. It states that the architectural problem is **coupling** and uses the physical replacement test:

> **A component's lifespan matters less than the lifespan of the things that must be destroyed to replace it.**

This packet therefore searches for the ancestry of both the **rate model** and the **dependency mechanism**.

---

## 2. Scope and method

Discovery follows the ILA-00C contract.

The search began from the sources already named by Ovid's House, then traced backwards and sideways through:

- primary or near-primary architectural texts;
- authoritative histories of DEGW / workplace strategy;
- explicit source-to-source acknowledgements by Stewart Brand;
- systems and ecological hierarchy sources cited in that chain;
- earlier architectural proposals using rate-differentiated replaceable parts;
- later empirical and design-research work capable of falsifying or narrowing the layer model.

This is not yet the ILA-02 deep-reading packet. Sources that appear capable of materially changing the F01 judgement are retained for primary-source dossiers rather than over-read here.

No reader-facing manuscript change is authorised by this record.

---

# 3. Current Ovid project-contact chronology

The surviving repository history matters because historical antecedence is not formative influence.

## 3.1 Earliest durable F01 manuscript state found

The earliest durable Part I corpus located in this pass is commit:

- `64e9f2c86163e8823fc6654343bef93d66488e12` — **Establish long-life house working corpus**, 2 October 2026.

That version already contains, together:

- the proposition that a building does not have one useful life;
- Habraken support/infill;
- Duffy's different-rate building elements;
- Brand's shearing layers;
- Alex Gordon's long-life / loose-fit formulation;
- the statement that the important condition is **coupling**;
- the slower-layer-consumed-at-the-faster-rate mechanism;
- the destruction test later retained as ILA-C02.

No earlier durable repository state located in this pass separates the formation of C02 from the introduction of Duffy / Brand.

### Project-contact disposition

For **Duffy / DEGW and Brand**, the surviving record proves early acknowledgement but does **not** prove whether they formed C02, were adopted while it was being formed, or were attached to an independently developed proposition before the first durable corpus.

Discovery-stage project-contact status:

- **Duffy / DEGW:** `PROJECT_CONTACT_UNRESOLVED`
- **Brand:** `PROJECT_CONTACT_UNRESOLVED`

Do not describe either as a documented formative source until stronger project-history evidence is found.

Habraken and Gordon are present in the same early paragraph, but ILA-01A places their primary intellectual question in F02. Their F01 relevance is therefore a handoff, not a reason to deep-read them here.

## 3.2 Simon was adopted after coupling already existed

Commit:

- `35bd4e9ae1fa7216baef6f158b88c90eeacebe80` — **Weave systems and resilience references into Part I**, 11 October 2026

adds Herbert Simon's nearly-decomposable-systems paragraph immediately after the manuscript had already stated that the important condition is coupling.

The patch makes the chronology unusually clear: C02's coupling mechanism predates the Simon reference in durable project history.

Discovery-stage project-contact status:

- **Herbert A. Simon:** `DOCUMENTED_ADOPTED_SOURCE`

Simon may still be a deep historical antecedent or explanatory parallel. He is not a documented formative source for Ovid's coupling claim on surviving evidence.

## 3.3 Sources first encountered through ILA

Repository/issue searches in this pass found no pre-ILA durable project contact for:

- R. V. O'Neill et al.;
- T. F. H. Allen & Thomas B. Starr;
- Robert Propst;
- Archigram / Peter Cook as an F01 source;
- DEGW's ORBIT study as the specific integration/obsolescence antecedent;
- Slaughter's flexibility/dependency research;
- Schmidt / Deamer / Austin's layer-dependency work;
- Kamara et al.'s empirical critique of assumed layer timings.

Unless later history proves otherwise, their project-contact status for the formation of C01/C02 is:

- `NO_DOCUMENTED_PROJECT_CONTACT`

ILA discovery does not retroactively create influence.

---

# 4. Historical terminology discovered

F01 cannot be searched reliably under `shearing layers` alone. Relevant traditions use several vocabularies for related but non-identical mechanisms:

### Architecture / workplace

- shell / services / scenery / sets;
- shell and scenery;
- layers of longevity;
- time-limited layers;
- building as facility based on change;
- adaptable building;
- accommodation of change;
- obsolescence;
- layer independence;
- lifetime compatibility;
- flexibility;
- service life;
- independent updating;
- access for change after construction.

### General systems / ecology

- hierarchy theory;
- process rates;
- temporal scale;
- nearly decomposable systems;
- weak inter-subsystem interaction;
- high-frequency / low-frequency dynamics;
- slow components / rapid components;
- pace layers.

### Later dependency research

- system interrelationships;
- component interactions;
- layer dependencies;
- hidden / unwanted dependencies;
- design structure matrix;
- product architecture.

This vocabulary should be retained for ILA-01C's adversarial search rather than treating one historical term as the family definition.

---

# 5. Discovery synthesis — two branches converge in Brand

The strongest current discovery model is **not** a linear `O'Neill → Duffy → Brand → Ovid` chain.

Chronology alone disproves that simplification: Duffy was publicly working with shell / scenery and long/short-term office layers in the early 1970s and published `Planning Office Space` in 1976; O'Neill et al.'s ecosystem book is 1986.

The evidence instead points to **two partially independent branches that Brand brings together**.

## Branch A — architectural / office change

```text
1960s architectural impermanence / replaceable-component experiments
        |
        |  broad intellectual context; exact proposition-specific derivation unresolved
        v
US office/facility change practice + Duffy/DEGW workplace research
        |
        v
Duffy / DEGW: shell-services-scenery-sets as different temporal layers
        |
        v
ORBIT 1983: independent updating prevents premature obsolescence from integrated systems
        |
        +------------------------------+
                                       |
                                       v
                                Brand 1994
```

## Branch B — general systems / ecological hierarchy

```text
Simon 1962: hierarchy + near-decomposability + fast/slow dynamics
        |
        v
Allen & Starr 1982: ecological hierarchy synthesis
        |
        v
O'Neill et al. 1986: ecosystem organisation through differences in process rates
        |
        +------------------------------+
                                       |
                                       v
                                Brand 1994 / later pace-layer synthesis
```

Brand is therefore provisionally the key **synthesis node** for F01: he explicitly derives his building layers from Duffy and explicitly invokes O'Neill's rate hierarchy when explaining how slow and fast layers constrain each other.

This structure remains provisional until ILA-01C tests the missing edges and ILA-02 reads the decisive primary material in context.

---

# 6. Architectural branch

## F01-S01 — Francis / Frank Duffy: early shell / scenery and temporal building model

### Bibliographic leads

**Duffy, Francis; Cave, Colin; Worthington, John (eds.), _Planning Office Space_, Architectural Press, 1976.**  
Google Books / WorldCat records confirm the 1976 edition and a chapter sequence including `Shell and scenery`.

Discovery sources:

- https://books.google.com/books?id=jPE9PwAACAAJ
- https://search.worldcat.org/title/2524599

**Duffy, Frank, `The origins of facilities`, _Facilities_ 25(11/12), 2007.**  
https://doi.org/10.1108/f.2007.06925kaf.001

Duffy's own retrospective says that when he returned to Britain from the United States in **1971**, he used the distinction between long-term office `shell and services` and shorter-term tenant `scenery and sets` to explain the concept to the British profession.

### Relevant F01 proposition

The building is not one temporal object. Office shell/services and fit-out belong to different planning/change horizons and are usefully distinguished as such.

### Original domain

Commercial office design, workplace planning, property supply chains and facilities management.

### Project contact

`PROJECT_CONTACT_UNRESOLVED` — Duffy is present in the earliest durable Part I located, but formative timing cannot be reconstructed from surviving material.

### Provisional relationship

- Duffy → Ovid C01/C02: `EARLIER_ANTECEDENT`
- Duffy → Brand building-layer schema: candidate `DOCUMENTED_DERIVATION`; Brand explicitly says he expanded Duffy's four layers to six.

### Discovery confidence

- Duffy's early-1970s use of long/short-term layer terminology: strong, supported by Duffy's retrospective and 1976 publication record.
- Exact first publication / exact wording of the canonical `several layers of longevity` sentence: hold for ILA-02.

### Transfer limit

Duffy's primary problem is the commercial office, where ownership, tenancy, fit-out cycles and organisational volatility differ substantially from a detached house.

### ILA-02 reason

Deep-read Duffy's own earlier texts rather than allowing Brand to stand in as the source for Duffy.

---

## F01-S02 — DEGW / Eosys ORBIT study, 1983

### Bibliographic identity

**DEGW & Eosys, _ORBIT: Office Research — Buildings and Information Technology_, 1983.**

The primary report is not yet fully read in this packet. Amy Thomas provides an authoritative historical account with reproduced ORBIT figures:

**Thomas, Amy, `Architectural consulting in the knowledge economy: DEGW and the ORBIT Report`, _The Journal of Architecture_ 24(7), 2019, pp. 1020–1044.**  
https://doi.org/10.1080/13602365.2019.1698639

### Relevant F01 proposition

Thomas's account of ORBIT is unusually close to C02. ORBIT recommended understanding the office as time-limited shell, services, scenery and sets, each with a different lifespan. The architectural value was that each layer could be updated independently, thereby avoiding premature obsolescence caused by the tight integration of functional, structural and aesthetic components.

ORBIT also explicitly argued for methods of construction allowing easy access for change after initial construction.

### Why this matters

This is the strongest discovery-stage evidence that the **dependency mechanism** existed inside the Duffy/DEGW architectural lineage before Brand.

It means Ovid cannot safely position `coupling` as though prior layer theory merely observed different lifespans. DEGW had already connected:

`different temporal layers → independent updating → avoidance of premature obsolescence caused by integration`

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` before ILA.

### Provisional relationship

- ORBIT → Ovid C02: `EARLIER_ANTECEDENT`
- ORBIT → later Duffy/DEGW rate-layer model: likely internal development, exact textual edge to be established from primary material.

### Confidence

`STRONG` for the proposition as reported by authoritative secondary scholarship; exact primary wording / pages held for ILA-02.

### Transfer limit

ORBIT responds to information technology, organisational change and speculative office-property economics. Its **integration/independence mechanism** transfers; its office-specific volatility assumptions do not automatically transfer.

### ILA-02 reason

High priority. Obtain and inspect the relevant ORBIT pages/figures and establish whether the integration/obsolescence argument is as direct in the primary report as Thomas reports.

---

## F01-S03 — Peter Cook / Archigram, _Plug-In City_, 1964

### Bibliographic / archival identity

**Peter Cook / Archigram, _Plug-In City_, 1964.**  
Museum of Modern Art collection records:

- https://www.moma.org/collection/works/795
- https://www.moma.org/collection/works/796

MoMA describes the project as an urban megastructure intended to accommodate change through obsolescence: removable building nodes with **different lifespans** plug into a longer-lived craneway, itself given a finite life.

### Relevant F01 proposition

Different architectural components are explicitly assigned different lifespans and organised so shorter-lived parts can be removed and replaced within a longer-lived support structure.

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` for F01 before ILA.

### Provisional relationship

- Plug-In City → Ovid F01: `EARLIER_ANTECEDENT`
- Archigram → Duffy: **edge unresolved for the F01 proposition**.

Joseph L. Clarke's historical research cites Duffy's 1966 `Some Notes on Archigram` and describes Duffy as expressing a debt to Archigram. That is evidence of broad intellectual contact, not yet evidence that Duffy's later lifespan-layer schema derives specifically from Plug-In City.

### Confidence

- Plug-In City as an earlier rate-differentiated architectural precedent/proposition: `DOCUMENTED` at discovery level.
- Plug-In City → Duffy's temporal-layer thesis: `TENTATIVE / UNRESOLVED` pending the 1966 primary essay and surrounding texts.

### Transfer limit

Archigram's megastructure, expendability and technological-utopian posture are not Ovid's domestic position. F01 transfers only the temporal organisation of differently lived parts, not the aesthetic or social programme.

### ILA-02 reason

Read Duffy's 1966 Archigram essay before drawing any source-to-source arrow.

---

## F01-S04 — Robert Propst, _The Office: A Facility Based on Change_, 1968

### Bibliographic identity

**Propst, Robert, _The Office: A Facility Based on Change_, Business Press, 1968, 71 pp.**  
Google Books: https://books.google.com/books?id=lGRPAAAAMAAJ

Herman Miller's archival/design account connects the book directly to Propst's Action Office research and his argument that inherited office forms had become obsolete as work changed:

- https://www.hermanmiller.com/products/workspaces/workstations/action-office-system/design-story/

### Relevant F01 proposition

The office should be conceived around continuing change rather than as a fixed completed arrangement.

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` before ILA.

### Provisional relationship

- Propst → F01: candidate `EARLIER_ANTECEDENT` to **building/facility as object of continuing change**.
- Propst → Duffy's specific lifespan-layer schema: `UNRESOLVED`.

Duffy's 2007 retrospective identifies US office practice as important to his long-term shell/services versus shorter-term fit-out distinction, but the discovery evidence does not yet prove that Propst specifically supplied the rate-layer proposition.

### Transfer limit

Office furniture, management systems and organisational change are not the same as physical service-life hierarchy. Keep Propst only if ILA-02 finds a mechanism beyond generic flexibility/change.

### ILA-01C test

Either establish a proposition-specific Propst → Duffy edge or demote Propst to formative context outside the core F01 chain.

---

# 7. General-systems / ecology branch

## F01-S05 — Herbert A. Simon, `The Architecture of Complexity`, 1962

### Bibliographic identity

**Simon, Herbert A., `The Architecture of Complexity`, _Proceedings of the American Philosophical Society_ 106(6), 1962, pp. 467–482.**

### Relevant F01 propositions

Simon develops **nearly decomposable systems**:

- short-run behaviour inside component subsystems can be approximately independent of other components;
- long-run behaviour depends on other components in aggregate;
- hierarchical systems often separate faster internal dynamics from slower interactions among larger subsystems.

The relevant mechanism is not merely `hierarchy`. It is **partial independence across subsystem boundaries combined with different temporal dynamics**.

### Project contact

`DOCUMENTED_ADOPTED_SOURCE` — added to Part I on 11 October 2026 after Ovid's coupling statement already existed.

### Provisional relationship

- Simon → Ovid C02: `CONVERGENT_PARALLEL` / possible deep `EARLIER_ANTECEDENT` at systems level; final type held for ILA-02 because this is a domain transfer rather than architecture.
- Simon → O'Neill: `DOCUMENTED_DERIVATION` candidate. O'Neill et al. explicitly cite Simon 1962 in their hierarchy-theory foundation.

### Transfer limit

Simon is describing general complex systems, not replacement of building components. The architectural transfer is valid only at the mechanism of **local interactions, weak cross-boundary interaction and different time scales**.

### ILA-02 reason

Read the relevant near-decomposability and dynamics sections in primary context and define exactly which part Ovid legitimately borrows.

---

## F01-S06 — T. F. H. Allen & Thomas B. Starr, _Hierarchy: Perspectives for Ecological Complexity_, 1982

### Bibliographic identity

**Allen, T. F. H. & Starr, Thomas B., _Hierarchy: Perspectives for Ecological Complexity_, University of Chicago Press, 1982.**

O'Neill et al. later describe Allen & Starr as a comprehensive hierarchy-theory overview for an ecological audience.

### Relevant F01 proposition

Candidate intermediary translating general hierarchy / scale theory into ecological reasoning about processes across spatial and temporal scales.

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` before ILA.

### Provisional relationship

- Simon / general systems → Allen & Starr: candidate source-to-source lineage, exact derivation not yet closed.
- Allen & Starr → O'Neill: strong contextual/intermediary lead; O'Neill explicitly names it as an overview.

### Transfer limit

No reason yet for reader-facing architectural prominence. Its current value is to prevent O'Neill from appearing intellectually ex nihilo.

### ILA-01C test

Determine whether this intermediary materially changes the F01 genealogy or can remain an internal source-chain note.

---

## F01-S07 — O'Neill, DeAngelis, Waide & Allen, _A Hierarchical Concept of Ecosystems_, 1986

### Bibliographic identity

**O'Neill, R. V.; DeAngelis, D. L.; Waide, J. B.; Allen, T. F. H., _A Hierarchical Concept of Ecosystems_, Princeton University Press, 1986.**  
JSTOR: https://www.jstor.org/stable/j.ctv1sfsf8d  
DOI: https://doi.org/10.2307/j.ctv1sfsf8d

### Relevant F01 proposition

The publisher/JSTOR description states the central idea directly: hierarchy theory treats organisation as arising from **differences in process rates** and uses those differences to decompose complex ecosystems.

The book explicitly situates its hierarchy theory in general systems theory and cites Simon 1962/1969, Whyte et al., Pattee, and Allen & Starr.

Brand later uses O'Neill's ecological rate hierarchy to explain how slower components constrain faster ones.

### Chronology correction

O'Neill is **not** a plausible source for Duffy's initial temporal-layer model:

- Duffy's shell/services/scenery/sets distinction is documented from the early 1970s and published by 1976;
- O'Neill et al. is 1986.

Any graph `O'Neill → Duffy → Brand` is therefore false on chronology alone.

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` before ILA.

### Provisional relationship

- Simon → O'Neill: candidate `DOCUMENTED_DERIVATION` at hierarchy-theory level; primary wording explicitly cites Simon as a foundation.
- O'Neill → Brand's systems explanation: candidate `DOCUMENTED_DERIVATION`; Brand explicitly names O'Neill when explaining pace/rate hierarchy.
- O'Neill → Ovid: `EARLIER_ANTECEDENT` / cross-domain explanatory source, with no documented formative project contact.

### Transfer limit

Ecological hierarchy concerns process organisation across scales, not building replacement interfaces. The useful transfer is the rate-hierarchy mechanism, not a claim that buildings behave as ecosystems in every respect.

### ILA-02 reason

Read the relevant chapters/pages around process rates and the slow/rapid-component claim; verify the exact wording Brand quotes and its scope in O'Neill's own argument.

---

# 8. Brand as synthesis node

## F01-S08 — Stewart Brand, _How Buildings Learn_, 1994, and later pace-layer retrospective

### Bibliographic identity

**Brand, Stewart, _How Buildings Learn: What Happens After They're Built_, Viking, 1994.**

Useful author retrospective:

**Brand, Stewart, `Pace Layering: How Complex Systems Learn and Keep Learning`, _Journal of Design and Science_, 2018.**  
https://doi.org/10.21428/7f2e5f08  
https://jods.mitpress.mit.edu/pub/issue3-brand

### Documented Duffy edge

Brand's own retrospective states that Duffy had four layers in the early 1970s — shell, services, scenery and set — and that Brand expanded them to six for _How Buildings Learn_: site, structure, skin, services, space plan and stuff.

Discovery-stage edge:

- **Duffy → Brand layer schema:** candidate `DOCUMENTED_DERIVATION`

### Documented ecology edge

Brand also explicitly invokes O'Neill / ecological rate hierarchy to explain the relationship between fast and slow systems: fast systems learn and propose; slow systems constrain, remember and stabilise.

Discovery-stage edge:

- **O'Neill → Brand systems interpretation:** candidate `DOCUMENTED_DERIVATION`

### The coupling / slippage proposition

The crucial F01 point is that Brand goes beyond a lifespan diagram. In the shearing-layers argument, he says an adaptive building must permit **slippage between differently paced systems**; otherwise the slow blocks the fast and the fast damages the slow. He warns that embedding differently paced systems together may appear efficient initially but becomes destructive over time.

This is a direct conceptual antecedent to Ovid C02's claim that faster systems can consume slower fabric when replacement requires destruction across the boundary.

### Project contact

`PROJECT_CONTACT_UNRESOLVED` — Brand is present in the earliest durable Part I located, but the surviving repo does not establish whether the source formed C02 or was adopted alongside an already-developed formulation.

### Provisional relationship

- Brand → Ovid C01/C02: `EARLIER_ANTECEDENT`; potentially a formative/adopted project source, project contact unresolved.
- Brand is provisionally the synthesis node where Duffy's architectural layer model and ecological/general-systems rate hierarchy are explicitly brought together.

### Ovid-delta consequence

The discovery record must **not** describe Brand as merely a populariser of Duffy. Brand appears to contribute a material synthesis: the hierarchy/interaction of fast and slow layers plus an explicit design imperative for slippage rather than destructive embedding.

### ILA-02 reason

Highest-priority primary dossier alongside Duffy/ORBIT. Establish precisely which of C02's mechanism and architectural consequences are already present in Brand.

---

# 9. Later dependency / adaptability research

These sources cannot be historical antecedents to Brand, but they matter because they test whether `coupling` is an idiosyncratic Ovid term or part of a wider post-Brand development.

## F01-S09 — E. Sarah Slaughter, `Design strategies to increase building flexibility`, 2001

### Bibliographic identity

**Slaughter, E. Sarah, `Design strategies to increase building flexibility`, _Building Research & Information_ 29(3), 2001, pp. 208–217.**  
https://doi.org/10.1080/09613210010027693

### Relevant finding

Renovation analysis found that changes commonly affect several building systems and that renovation difficulty is determined by the **interrelationships among systems**. Design strategies can alter those interactions to make later change easier.

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` before ILA.

### Provisional relationship

Candidate `CONVERGENT_PARALLEL` / later evidential support for the dependency mechanism.

### Why it matters

Slaughter reinforces the move from `layers have different lives` to `the interactions among systems determine the cost/difficulty of change`.

### Transfer limit

The paper addresses flexibility/renovation broadly; ILA-02 should determine whether it yields a lineage claim or remains supporting empirical/design evidence.

---

## F01-S10 — Schmidt III, Deamer & Austin, `Understanding Adaptability through Layer Dependencies`, 2011

### Bibliographic identity

**Schmidt III, Robert; Deamer, Jason; Austin, Simon, `Understanding Adaptability through Layer Dependencies`, ICED11, 2011, pp. 209–220.**

Design Society record:  
https://www.designsociety.org/publication/30752/understanding_adaptability_through_layer_dependencies

### Relevant finding

The paper explicitly starts with Brand's layers and uses a Design Structure Matrix / component-interaction analysis to identify appropriate layer placement and expose **unwanted / hidden dependencies**.

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` before ILA.

### Provisional relationship

Post-Brand descendant / `CONVERGENT_PARALLEL` to Ovid's physical dependency analysis.

### Why it matters

It proves that a dependency-oriented reading of Brand's layers was independently operationalised in building-design research well before Ovid. This narrows any claim that Ovid newly discovered `dependency` as the missing issue.

The remaining Ovid question becomes more specific: whether Ovid's **replacement-destruction test, domestic service geography and proportional decoupling discipline** constitute a distinct operational synthesis.

---

# 10. Counterpoints and boundary evidence

## F01-S11 — Kamara et al., `Change Factors and the Adaptability of Buildings`, 2020

### Bibliographic identity

**Kamara, John M. et al., `Change Factors and the Adaptability of Buildings`, _Sustainability_ 12(16), 6585, 2020.**  
https://doi.org/10.3390/su12166585

### Relevant finding

In the studied buildings, actual changes did **not** occur according to the assumed lifespan timetable of the building layers. Strategic, organisational, regulatory and economic triggers often dominated. The authors conclude that layer models are useful for categorising changes but are not necessarily good predictors of **when** change will occur.

Crucially, they also state that this result does not undermine layer independence as an adaptability strategy.

### Project contact

`NO_DOCUMENTED_PROJECT_CONTACT` before ILA.

### Provisional relationship

`COUNTERPOINT` to literal/predictive use of lifespan-layer models.

### Consequence for Ovid

This counterpoint fits Ovid's current preference for **broad temporal bands rather than false precision**. F01 should treat rates as an ordinal/dependency design heuristic, not as a schedule claiming that services will change after N years and structure after M years.

It also warns that use, regulation, ownership and technology may force a nominally slow layer to change unexpectedly.

---

# 11. Important handoffs and rejected expansions

## Habraken / Open Building → F02 primary ownership

Support/infill is highly relevant to the wider doctrine, but its central question is **where stable support and changeable infill should be allocated and who controls them**, not the descriptive rate hierarchy itself.

F01 should retain Habraken as a neighbouring lineage but defer deep discovery to F02 unless a primary text produces a specific process-rate / coupling proposition.

## Alex Gordon / `long life, loose fit, low energy` → F02 primary ownership

Gordon joins longevity with capacity for changed use. That is primarily the normative adaptability question. Do not duplicate the research here.

## Cedric Price / Yona Friedman / Metabolism / general megastructure

These may be important to F02's flexibility/indeterminacy history. F01 should not expand into a full flexible-architecture canon merely because those projects contain replaceable or temporary elements.

A candidate enters F01 only if it materially articulates **different rates/lifespans or the dependency between them**.

## ISO / circular-economy standards

These are primarily `EVIDENTIAL_SUPPORT`, not the origin of F01. They remain outside this discovery chain unless source history proves otherwise.

## General maintenance / repair literature

F05 owns the architecture of recurring intervention. F01 uses maintenance only where it exposes the consequence of coupling between temporal layers.

---

# 12. Candidate source-to-source edges for ILA-01C / ILA-02

No final lineage graph is authorised yet. The following are the edges worth proving or rejecting.

| Edge | Discovery-stage state | What must be proved next |
| --- | --- | --- |
| Archigram → Duffy | **UNRESOLVED / TENTATIVE** | Did Duffy's documented debt to Archigram include the rate/lifespan organisation, or only broader technological/flexibility ideas? |
| US office / Propst → Duffy | **UNRESOLVED** | Did Propst or related US office practice supply the long-term shell / short-term fit-out distinction, or only the broader facility-as-change framing? |
| Duffy early-1970s model → `Planning Office Space` | **STRONG** | Locate exact primary wording / development chronology. |
| Duffy / DEGW → ORBIT | **STRONG internal development lead** | Establish primary pages and authorship of the independent-layer / integration-obsolescence claim. |
| Duffy → Brand six building layers | **DOCUMENTED_DERIVATION candidate** | Confirm exact Brand primary passage in _How Buildings Learn_ and Duffy source used there. |
| Simon → Allen & Starr | **STRONG contextual lineage** | Check the 1982 primary text's explicit theoretical sources if the edge matters to final graph. |
| Simon → O'Neill | **DOCUMENTED_DERIVATION candidate** | O'Neill explicitly cites Simon; verify proposition-specific use in relevant chapters. |
| Allen & Starr → O'Neill | **DOCUMENTED_INTERMEDIARY lead** | O'Neill calls it an ecological overview; determine whether it materially carries the process-rate proposition. |
| O'Neill → Brand rate hierarchy | **DOCUMENTED_DERIVATION candidate** | Confirm exact Brand 1994 attribution/context, not only later retrospective. |
| Duffy branch + O'Neill branch → Brand | **STRONG synthesis hypothesis** | Primary dossier must show that Brand actually joins the two mechanisms rather than merely mentioning them in the same chapter. |
| Brand → Schmidt/Deamer/Austin | **DOCUMENTED_DERIVATION candidate** | Paper explicitly codes Brand's layers and analyses dependencies. |

This table deliberately preserves unresolved edges instead of converting chronological plausibility into lineage.

---

# 13. Provisional answer to the core F01 questions

These are **discovery hypotheses**, not ILA-04 attribution verdicts.

## 13.1 Is `building as a temporal object` inherited?

Yes in broad form. Duffy/DEGW, Propst, Archigram and Brand all make building/workplace change after completion central to design, through materially different traditions.

The useful future question is not whether Ovid discovered temporality; it plainly did not. It is how Ovid applies that premise to the ordinary detached house and turns it into a coherent set of architectural obligations.

## 13.2 Are different rates of change an established architectural idea?

Yes. The architectural evidence predates Brand by decades:

- Plug-In City assigns different lifespans to replaceable nodes and support infrastructure in 1964;
- Duffy uses long/short-term shell/services/scenery/sets thinking by the early 1970s and publishes shell/scenery material in 1976;
- DEGW's ORBIT study formalises time-limited layers and independent updating by 1983.

Brand's six-S diagram is therefore not the origin of the architectural rate concept.

## 13.3 Is destructive coupling already present before Ovid?

**Substantially, yes.**

At discovery level:

- ORBIT says independent updating avoids premature obsolescence caused by tightly integrated functional/structural/aesthetic components;
- Brand explicitly says differently paced systems require slippage, because otherwise the fast damages the slow and embedding the systems becomes destructive;
- later Slaughter and Schmidt work independently operationalises inter-system dependencies as a determinant of change difficulty/adaptability.

This materially narrows any claim that Ovid's contribution is the discovery that rate differences become harmful through dependency.

## 13.4 What may still be distinctly Ovid?

The source set suggests a **more specific delta hypothesis** worth testing in ILA-02 rather than an origin claim:

1. **Domestic transfer** — taking office/institutional temporal-layer thinking into the ordinary long-lived detached house without importing office-scale flexibility ideology.
2. **Replacement-destruction test** — evaluating a component by the longer-lived work that must be destroyed to replace it.
3. **Physical operationalisation** — converting coupling into service geography, withdrawal paths, designed interfaces, attachment zones and disassembly sequences.
4. **Proportional decoupling** — explicitly rejecting universal separability; independence is warranted according to event frequency, consequence and retrofit difficulty.
5. **Occupied-change consequence** — treating dust, demolition, reinstatement and disruption to inhabitants as a consequence of temporal coupling rather than an unavoidable renovation condition.
6. **Integration with failure / stewardship** — connecting temporal coupling to isolation, recoverability and intergenerational legibility across the wider Ovid system.

None of these should be called original until the appropriate F01/F02/F03/F05 dossiers and attribution audit are complete.

---

# 14. Counter-model / caution

The layer model is useful but must not harden into a false law of building change.

Kamara et al. shows that actual building changes can happen for reasons unrelated to nominal component lifespan. A relatively new structure may change because ownership, regulation, economics or use changes; services may remain because no actor has the will/funds to replace them.

Therefore F01 should distinguish:

- **expected physical / technological renewal rate**;
- **actual event timing**;
- **dependency consequence when change does occur**.

Ovid's strongest use of temporal layers is likely the third: **if a fast or uncertain system changes, how much unrelated slower work is forced to change with it?**

That proposition survives even when the actual date of change is unpredictable.

---

# 15. Discovery register

| ID | Source | Date | Source quality at this stage | Project contact | Provisional F01 relationship | Deep-read disposition |
| --- | --- | ---: | --- | --- | --- | --- |
| S01 | Duffy / _Planning Office Space_ + 2007 retrospective | 1971/1976/2007 | Tier A primary / retrospective | `PROJECT_CONTACT_UNRESOLVED` | `EARLIER_ANTECEDENT`; source of Brand layers | **ILA-02 candidate** |
| S02 | DEGW/Eosys ORBIT | 1983 | Primary identified; proposition currently via Tier B Thomas 2019 | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | `EARLIER_ANTECEDENT` to dependency mechanism | **High-priority ILA-02 candidate** |
| S03 | Cook / Archigram _Plug-In City_ | 1964 | Tier A archival project + MoMA scholarship | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | `EARLIER_ANTECEDENT` | **Targeted dossier / edge check** |
| S04 | Propst _The Office: A Facility Based on Change_ | 1968 | Tier A book identified + institutional archive | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | candidate `EARLIER_ANTECEDENT`; exact edge unresolved | **Conditional dossier** |
| S05 | Simon `The Architecture of Complexity` | 1962 | Tier A primary | `DOCUMENTED_ADOPTED_SOURCE` | systems `CONVERGENT_PARALLEL` / deep antecedent | **ILA-02 candidate** |
| S06 | Allen & Starr _Hierarchy_ | 1982 | Tier A book identified | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | intermediary systems/ecology lead | **Conditional edge dossier** |
| S07 | O'Neill et al. _A Hierarchical Concept of Ecosystems_ | 1986 | Tier A primary partly inspected | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | `EARLIER_ANTECEDENT`; source to Brand rate hierarchy | **ILA-02 candidate** |
| S08 | Brand _How Buildings Learn_ / pace-layer retrospective | 1994/2018 | Tier A primary | `PROJECT_CONTACT_UNRESOLVED` | `EARLIER_ANTECEDENT`; synthesis node | **Highest-priority ILA-02 candidate** |
| S09 | Slaughter `Design strategies to increase building flexibility` | 2001 | Tier A research article | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | later `CONVERGENT_PARALLEL` / support | retain; deep read if delta needs it |
| S10 | Schmidt / Deamer / Austin `Layer Dependencies` | 2011 | Tier A conference paper | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | Brand-descended dependency operationalisation | retain; likely supporting dossier only |
| S11 | Kamara et al. `Change Factors...` | 2020 | Tier A peer-reviewed empirical study | `NO_DOCUMENTED_PROJECT_CONTACT` pre-ILA | `COUNTERPOINT` to predictive layer timing | **retain as material boundary** |

No final `FOUNDATIONAL / MAJOR / SUPPORTING / PERIPHERAL` classifications are assigned here; ILA-02 and ILA-04 own those judgements.

---

# 16. Negative findings / false leads retained

1. **`O'Neill → Duffy → Brand` is rejected.** Duffy's temporal layer model predates O'Neill by at least a decade.
2. **`Brand invented building layers` is rejected.** Brand explicitly credits Duffy and describes his own six layers as an expansion.
3. **`Duffy only observed different lifespans; Ovid discovered coupling` is not supported.** ORBIT's independent-updating / integrated-obsolescence argument predates Ovid, and Brand states the destructive-embedding problem explicitly.
4. **`Archigram → Duffy rate layers` is not yet proven.** Duffy's documented debt to Archigram is broader than the proposition-specific edge required by ILA.
5. **`Propst → Duffy rate layers` is not yet proven.** Propst is a strong change/facility context but the exact schema edge is unresolved.
6. **Layer-lifespan numbers are not reliable event forecasts.** Kamara et al. provides direct empirical counter-evidence to treating them as a schedule.
7. **Habraken and Gordon are not removed from the wider lineage.** They are handed to F02 because their strongest question is where adaptability/permanence belongs, not process-rate hierarchy itself.
8. **Simon is not a formative Ovid source on surviving project evidence.** The repository shows it being added after C02 already existed.

These negative findings are part of the value of the packet: they prevent a cleaner but false intellectual history from being reconstructed later.

---

# 17. Discovery-stage saturation assessment

F01 has reached a **first-pass discovery saturation sufficient for an adversarial freeze packet**, for the following reasons:

- the current named architectural chain has been traced behind Brand to Duffy/DEGW;
- a materially earlier architectural rate-differentiation antecedent has been found in Archigram;
- the office/change context behind Duffy has been identified through US facility practice / Propst without overstating the edge;
- the DEGW branch contains a pre-Brand dependency/integration mechanism close to C02;
- Brand's documented Duffy inheritance has been identified;
- the separate general-systems/ecology branch has been traced from Simon through ecological hierarchy to O'Neill;
- O'Neill's chronology has been shown incompatible with a Duffy-source story;
- Brand appears to be the convergence/synthesis point of the architectural and ecological branches;
- later dependency research shows that coupling/dependency became an explicit post-Brand design-research concern;
- a serious empirical counterpoint has been found showing that assumed layer lifespans do not predict actual change timing;
- obvious neighbouring flexibility traditions have been bounded into F02 rather than allowed to make F01 unbounded.

This is **not yet a discovery freeze**. One adversarial pass remains necessary.

---

# 18. Questions for ILA-01C-F01

The saturation/freeze packet should attack this discovery model with the following exact questions:

1. Is there a materially earlier architectural source than Plug-In City that explicitly combines different component lifespans with replaceability/independence?
2. Does Duffy's 1966 Archigram essay make the rate-layer derivation explicit, or is Archigram merely broader intellectual context?
3. Does Propst's 1968 primary text contain a component-timescale argument, or should Propst be removed from the core F01 chain?
4. Can the ORBIT 1983 primary pages be recovered and does the primary wording support Thomas's integration/obsolescence account?
5. Which exact Duffy source did Brand use for the four-layer model?
6. Does Brand's 1994 text explicitly cite O'Neill at the point where slow/fast hierarchy and slippage are joined, or is that connection reconstructed only in later pace-layer writing?
7. Is Allen & Starr necessary to the final source chain, or merely an internal ecological intermediary?
8. Does any pre-1994 architectural literature state the `fast layer damages slow layer when embedded` mechanism more directly than ORBIT?
9. Is there a serious counter-tradition arguing for integration rather than layer independence because separation itself imposes material/technical costs?
10. After those checks, would any additional discovery plausibly change the strongest antecedent, relationship type, counterpoint, Ovid-delta hypothesis or likely publication treatment?

If the answer to question 10 is no, freeze F01 discovery and move the surviving high-value sources into ILA-02 dossiers.

---

# 19. Provisional ILA-02 dossier queue

Subject to ILA-01C-F01:

### Core dossiers likely earned

- **Duffy / DEGW temporal-layer development** — including 1970s primary source and ORBIT primary pages;
- **Stewart Brand, _How Buildings Learn_, ch. `Shearing Layers`** — Duffy derivation, O'Neill import, slippage/destructive embedding;
- **O'Neill et al.** — relevant process-rate hierarchy in its own context and its source chain to Simon;
- **Herbert Simon** — near-decomposability / temporal dynamics, especially because Ovid already invokes it;
- **Kamara et al.** — material counterpoint preventing false predictive use of layer lifespans.

### Edge-specific dossiers if 01C says needed

- Archigram / Duffy 1966;
- Propst 1968 / Duffy's US-office context;
- Allen & Starr 1982;
- Slaughter 2001;
- Schmidt / Deamer / Austin 2011.

Deep dossiers should be earned by whether they can change the F01 judgement, not by historical fame.

---

# 20. Result

**PASS — F01 has a bounded candidate source set and a materially revised discovery model.**

The current best model is a **convergence**, not a single heroic lineage:

- an architectural/workplace branch develops buildings as differently timed layers and, by ORBIT, explicitly connects layer integration to premature obsolescence;
- a systems/ecology branch develops near-decomposability and process-rate hierarchy;
- Brand explicitly inherits Duffy's building layers and imports ecological slow/fast hierarchy, producing the strongest pre-Ovid synthesis of shearing/slippage/destructive embedding found in this pass;
- later building research independently develops inter-layer dependency analysis and provides empirical limits on literal lifespan models.

The discovery materially changes the question Ovid must eventually answer. It is no longer:

> `Did prior layer theory notice destructive coupling?`

The answer appears to be yes.

The sharper question is:

> **What does Ovid's domestic replacement-destruction test, proportional decoupling discipline and physical maintenance/interface operationalisation add to an already mature temporal-layer and dependency tradition?**

That question belongs to ILA-02 and ILA-04, not this discovery packet.

No doctrine, pattern, Reference House, compiler, drawing or reader-facing manuscript content changes in ILA-01B-F01.

## Next authorised packet

**ILA-01C-F01 — adversarial discovery saturation / family freeze.**

Attack the provisional two-branch model, resolve or demote the weak edges, search explicitly for an earlier architectural coupling source and an integration-first counter-tradition, then freeze F01 only if further discovery no longer changes the lineage structure or Ovid-delta hypothesis.