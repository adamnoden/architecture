# HFI-04D — Kitchen, Storage and Fixed Work Zones

**Packet:** HFI-04D  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Research-start baseline `main`:** `0da7f1ccd9a9d7ae540a6c326733a2fdb7ef3d0d`  
**Prior packet:** HFI-04C — environmental/electrical controls  
**Question:** how should HFI judge kitchens, fixed storage and fixed work zones as complete sequences of retrieval, staging, preparation, hot/wet transfer, appliance loading/unloading, cleaning and return-to-storage — including reach, bending, lifting, open-door/drawer geometry and simultaneous-use conflicts — without turning HFI into an interior-design specification or importing wheelchair-category provisions as universal domestic geometry?  
**Boundary:** fixed architectural geometry and fixed interfaces only. This packet does **not** choose a kitchen style, cabinet manufacturer, appliance brand, loose-storage scheme or decorative finish; set Ovid’s House worktop/storage heights or clearances; adopt M4(2)/M4(3) kitchen dimensions as universal targets; redesign the Reference House; create doctrine/patterns; add compiler proof; or change publication maturity.

---

## 1. Purpose

Kitchen usability is often reduced to one of three shortcuts:

1. a nominal work triangle;
2. a standard worktop height;
3. a clear floor-space dimension.

All three can be useful facts. None proves ordinary task usability.

The relevant unit is the **complete fixed-interface task sequence**.

For a representative food task:

`retrieve → carry → set down → prepare → transfer → heat/cook → plate → carry/serve → clear → wash/load → dry/unload → return/store`

For groceries:

`arrive loaded → enter → stage → unpack → sort → place ambient/chilled/frozen items → dispose packaging → recover circulation`

For a dishwasher:

`collect dirty item → approach → open door → pull rack → load/unload while door/rack occupy floor space → close → dose/control → later reopen → unload → return items to storage`

For fixed storage:

`locate → approach → open → reach/bend → grasp → extract → clear adjacent door/drawer/body → carry/use → return → close`

The controlling proposition is:

> **Kitchen and fixed-storage usability is a property of complete task sequences through changing occupied geometry, not of nominal room area, worktop height or a work-triangle diagram alone.**

A second proposition follows from HFI-03D:

> **The events matter individually; they are not added into a fake numerical friction score.**

A third proposition bounds the architectural question:

> **HFI should intervene where permanent geometry repeatedly forces compensation; it should not freeze every household’s preferred storage choreography into the building.**

---

## 2. Existing HFI boundaries reused

### 2.1 HFI-02A — anthropometry/reach

HFI-02A already establishes that:

- percentile labels are not design answers;
- comfortable and maximum reach are different constructs;
- forward/side reach changes with body size, posture and obstruction depth;
- lower storage can exchange reach burden for bending/kneeling burden;
- upper storage can exchange floor-area efficiency for extended reach/step-use;
- current dimensions are not validated merely because common practice uses them.

HFI-04D therefore refuses to derive one universal worktop or shelf height from one body percentile.

### 2.2 HFI-03C — object movement

HFI-03C owns the complete delivery/replacement swept path for large appliances.

HFI-04D owns the **in-use fixed interface after installation**:

- appliance door/rack projection;
- approach position;
- loading/unloading posture;
- adjacent set-down surface;
- control reach;
- conflicts with opposing units/doors/circulation.

Do not double-count appliance replacement as kitchen ergonomics.

### 2.3 HFI-03D — domestic task routes

HFI-03D already freezes event-ledger logic for groceries, laundry, waste, cleaning, care/childcare and garden-serving.

04D begins where those routes meet fixed kitchen/storage interfaces.

For example:

- 03D asks whether groceries require repeated doors/turns/set-downs on the route;
- 04D asks whether the kitchen arrival point provides credible staging and whether fixed cold/ambient storage then forces avoidable rehandling.

---

## 3. Frozen scenario coverage

HFI-04D primarily owns or materially contributes to these HFI-01C scenarios.

| Scenario | Kitchen/storage/fixed-work question |
|---|---|
| `HFI-SC-LOG-01` | when groceries arrive with occupied hands, do fixed staging/storage relationships cause repeated set-down/regrip or cross-traffic? |
| `HFI-SC-LOG-04` | can cleaning equipment be stored/retrieved without repeated awkward lifting, obstruction or stair-level duplication assumptions? |
| `HFI-SC-USE-10` | does the fixed kitchen hot/wet sequence create avoidable crossover, long transfer, unstable reach or conflicting open states? |
| `HFI-SC-USE-11` | does frequent fixed storage force repeated overreach or dependence for a smaller adult? |
| `HFI-SC-LC-05` | do fixed storage/work relationships impose materially avoidable bending, turning or carrying burden during pregnancy? |

Related scenarios also matter when evidence is available:

- `HFI-SC-USE-13` for upper-limb impairment at fixed controls/appliances;
- wheelchair scenarios only where a category-specific or future-adaptation proposition is explicitly being tested;
- assisted-use scenarios only where a fixed work zone is genuinely foreseeable for two-person use.

---

## 4. Current normative context — categories remain separate

The current Building Regulations continue to distinguish:

- `M4(1)` visitable dwellings;
- optional `M4(2)` accessible and adaptable dwellings;
- optional `M4(3)` wheelchair user dwellings.

Current legislation states M4(2) and M4(3) as optional requirements applying in substitution for M4(1) where required. HFI-04D preserves that category boundary.

Approved Document M contains detailed kitchen provisions for the higher categories, including clear approach/manoeuvring relationships and, for M4(3), worktop/fitting/appliance arrangements and adaptable/accessibility distinctions.

Those provisions are highly relevant **external reference systems**. They are not silently converted into the optimum geometry for every private house.

The HFI inference rule is:

> **use category-specific guidance to understand mechanisms and tested accommodation routes; derive any Ovid’s House universal target separately through HFI-05/HFI-06.**

---

## 5. Specialist housing guidance

### `HFI-SRC-KIT01` — Habinteg / CAE / RIBA Inclusive Housing Design Guide

- **Source:** *The Inclusive Housing Design Guide*; Habinteg Housing Association + Centre for Accessible Environments in partnership with RIBA.
- **Date/version:** September 2024.
- **Authorship:** Jacquel Runnalls; peer reviewed by Dr Marney Walker; specialist housing occupational-therapy/inclusive-environment expertise.
- **Class:** `SPECIALIST-HOUSING-GUIDANCE`.
- **Applicability:** practical explanation of M4(2)/M4(3), rationale for exceeding minimums and how furnished functional use changes the apparent adequacy of bare dimensions.
- **Useful mechanism:** scale-drawn people/tasks, fixtures/fittings and case evidence are used to show why nominal compliance geometry can still be functionally weak.
- **Known limits/nonclaims:** specialist guidance, not legislation; the guide explicitly serves accessible/adaptable and wheelchair housing and does not establish a universal Ovid’s House kitchen specification.
- **Checked:** 2026-10-19.
- **Canonical location:** https://www.habinteg.org.uk/the-inclusive-housing-design-guide

### `HFI-SRC-KIT02` — Habinteg Wheelchair Housing Design Guide, third edition

- **Source:** *Wheelchair Housing Design Guide*, third edition; Habinteg / CAE / Royal College of Occupational Therapists Specialist Section – Housing; RIBA publication.
- **Class:** `SPECIALIST-HOUSING-GUIDANCE`.
- **Applicability:** wheelchair-accessible kitchen/storage geometry and practical implementation beyond bare M4(3) compliance.
- **Useful mechanism:** wheelchair use requires the whole relationship among approach, knee/foot clearance, worktop, sink/hob/appliance position, storage and manoeuvring geometry to work together.
- **Known limits/nonclaims:** category-specific specialist guidance; not a universal geometry for all dwellings or all ambulant users.
- **Checked:** 2026-10-19.
- **Canonical location:** https://www.habinteg.org.uk/wheelchair-housing-design-guide-third-edition

These sources are valuable precisely because HFI keeps their applicability explicit rather than laundering M4(3) geometry into general domestic ergonomics.

---

## 6. Empirical evidence — older people and kitchen use

### `HFI-SRC-KIT03` — Maguire et al. 2014, Kitchen Living in Later Life

- **Source:** Martin Maguire, Sheila Peace, Colette Nicolle, Russell Marshall, Ruth Sims, John Percival and Clare Lawton, *Kitchen Living in Later Life: Exploring Ergonomic Problems, Coping Strategies and Design Solutions*.
- **Date/version:** 2014, *International Journal of Design* 8(1).
- **Population/context:** semi-structured interviews with 48 older people in the UK; detailed kitchen-living study.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** real domestic reaching, bending, standing, appliance/cupboard use, cleaning and coping strategies.
- **Useful findings:** reach, bending, dexterity and sight problems increased with age; 26 participants (54%) reported limitations related to reaching, bending or prolonged standing in using appliances, cupboards, cleaning or food preparation; users adapted storage and tasks around their capabilities.
- **Known limits/nonclaims:** small older-adult sample; self-report/observational context; does not justify one universal shelf/worktop dimension.
- **Checked:** 2026-10-19.
- **Canonical location:** https://ijdesign.org/index.php/IJDesign/article/view/1216

### `HFI-SRC-KIT04` — Ibrahim & Davies 2012 cooking-task study

- **Source:** N. I. Ibrahim and S. Davies, *Aging: physical difficulties and safety in cooking tasks*.
- **Date/version:** 2012; *Work* 41 Suppl 1; DOI `10.3233/WOR-2012-0804-5152`.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Population/context:** adults aged 65+ who cooked for themselves/family; observation/interview/questionnaire/role-play methods.
- **Applicability:** fixed storage and work-centre relationships.
- **Useful findings:** common difficulties included bending to lower shelves, reaching high storage and cleaning cookers; safety concerns included relationships among storage, cooker and sink.
- **Known limits/nonclaims:** specific population/context; does not prove a universal work triangle, worktop height or cabinet arrangement.
- **Checked:** 2026-10-19.
- **Canonical location:** https://pubmed.ncbi.nlm.nih.gov/22317518/

### `HFI-SRC-KIT05` — Kirvesoja et al. 2000 task-surface study

- **Source:** H. Kirvesoja, S. Väyrynen and A. Häikiö, *Three evaluations of task-surface heights in elderly people's homes*.
- **Date/version:** 2000; *Applied Ergonomics* 31(2), 109–119; DOI `10.1016/S0003-6870(99)00044-7`.
- **Population/context:** 55 older Finnish participants performing simulated daily-living tasks on adjustable task surfaces.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** demonstrates that task-surface preference/performance can be tested against actual users rather than assumed from standard dimensions.
- **Useful finding:** evaluations converged enough to show that surface-height mismatch is a real ergonomic variable.
- **Known limits/nonclaims:** older Finnish sample, dated context and specific mock-up tasks; the packet explicitly does not adopt the study’s preferred dimensions as project targets.
- **Checked:** 2026-10-19.
- **Canonical location:** https://pubmed.ncbi.nlm.nih.gov/10711973/

### `HFI-SRC-KIT06` — kitchen-storage accessibility simulation

- **Source:** *Ergonomic suitability of kitchen furniture regarding height accessibility*.
- **Date/version:** 2015; indexed by PubMed, PMID `26040088`.
- **Class:** `PEER-REVIEWED-EMPIRICAL/MODEL`.
- **Population/context:** simulation of cupboard accessibility across age/sex groups using Slovenian manufactured kitchen geometries.
- **Applicability:** upper-cabinet reach and the interaction between worktop depth/body approach and storage accessibility.
- **Useful mechanism:** storage volume is not equivalent to usable storage; obstruction depth and ability to approach materially alter reachable volume.
- **Known limits/nonclaims:** simulation, manufacturer-specific geometry and population assumptions; no universal cabinet geometry is adopted.
- **Checked:** 2026-10-19.
- **Canonical location:** https://pubmed.ncbi.nlm.nih.gov/26040088/

The evidence converges on a mechanism rather than a magic dimension:

> **fixed storage creates a reach/bend/posture distribution; frequency and item characteristics determine whether that distribution is benign or repeatedly burdensome.**

---

## 7. Fixed-interface task ledger

For every representative kitchen/storage task, record the events that actually occur.

| Event | Question |
|---|---|
| `LOCATE` | can the destination/item/appliance be identified without searching multiple deep zones? |
| `APPROACH` | can the user occupy a stable position near the interface? |
| `OPEN` | what door/drawer/appliance element enters occupied space? |
| `REACH` | what horizontal/vertical reach is required after obstruction depth is included? |
| `BEND/KNEEL` | does retrieval/load require repeated trunk flexion, squat or kneeling? |
| `GRASP` | is the item/hardware grasp practical in the tested state? |
| `LIFT` | from what height/depth is mass lifted? |
| `EXTRACT` | can the item clear shelves/doors/body without reorientation or a second grip? |
| `SET-DOWN` | is a stable adjacent staging surface available when the task needs one? |
| `TRANSFER` | how far/through what crossing is hot, wet, sharp or heavy material moved? |
| `CROSSOVER` | do two linked operations force paths across another active/hazard zone? |
| `OPEN-STATE CONFLICT` | what happens when dishwasher/oven/fridge/drawer/cupboard is actually open? |
| `CONTROL` | can appliance/fixed-control operation occur from a stable usable position? |
| `CLEAN` | does routine cleaning require unusually deep reach/twist because of fixed geometry? |
| `RETURN` | can the item be restored without a materially worse reverse sequence? |
| `CLOSE` | can doors/drawers/racks be closed without body/load conflict? |

No weighted sum follows.

The ledger is descriptive and diagnostic.

---

## 8. Frequency × item character

Storage burden depends on what is stored and how often it moves.

HFI-04D therefore introduces a **qualitative storage-demand classification**, not a fixed cupboard schedule.

### 8.1 Frequency

- `FREQUENT` — ordinarily used daily or near-daily;
- `REGULAR` — used recurrently but not daily;
- `OCCASIONAL` — legitimately placed in less convenient fixed storage.

### 8.2 Item character

- light / low consequence;
- heavy or awkward;
- fragile;
- hot/wet when transferred;
- requires two hands;
- bulky enough to obscure vision/body clearance.

The architectural question is not “are all shelves easy to reach?”

It is:

> **does the fixed storage arrangement force likely frequent/heavy/awkward items into the most demanding reach/bend zones because no credible alternative fixed zone exists?**

This deliberately leaves household-specific allocation flexible.

---

## 9. Storage height is not a single-axis problem

### 9.1 High storage

Potential burdens:

- shoulder elevation/extended reach;
- trunk extension;
- reduced visual confirmation of item/grip;
- step-stool dependence;
- heavier item descending toward face/torso;
- inability to see rear contents.

### 9.2 Low storage

Potential burdens:

- repeated trunk flexion;
- squat/kneel;
- difficult rise/recovery;
- deep reach into base units;
- lifting mass from low height.

### 9.3 Deep storage

Depth can be as important as height.

A nominally reachable shelf becomes harder when the body cannot approach because of:

- worktop projection;
- sink/hob/appliance face;
- door/drawer;
- fixed furniture;
- wheelchair footplate/knee relationship where tested.

### 9.4 HFI implication

Do not optimise one axis in isolation.

An “accessible” upper cabinet lowered closer to the worktop can improve vertical reach while worsening visibility, counter use or horizontal reach. A deep drawer can improve visibility/extraction relative to a cupboard but has its own open-state floor envelope.

Later target formation must preserve these trade-offs.

---

## 10. Worktop / fixed work-surface height

There is no evidence basis here for one universal Ovid’s House worktop height.

Relevant variables include:

- stature and elbow relationship;
- task type;
- force required;
- duration;
- standing vs seated use;
- pregnancy/temporary limitation;
- countertop thickness/front detail;
- sink bowl depth;
- appliance relationship.

A surface comfortable for light preparation can be poor for a forceful task; a sink can create a different effective hand height from the surrounding worktop.

HFI-04D therefore records work-surface height as a future **task-specific audit fact**, not a universal pass/fail number.

### 10.1 Adjustable/lowerable work surfaces

Height-adjustable or lowerable work zones are credible category-specific or demand-led solutions, particularly in wheelchair-accessible housing.

Universal installation in every Ovid’s House kitchen is not justified by this packet because it adds:

- mechanism complexity;
- service/flexible-connection requirements;
- cost;
- maintenance;
- potential loss of fixed storage;
- technology/product dependence.

HFI-05B must test any universal reservation against the lower-burden alternative of designing **adaptation-compatible service/interface geometry**.

---

## 11. The work triangle — useful shorthand, inadequate proof

The traditional refrigerator–sink–cooker work triangle captures one useful intuition: repeated linked tasks should not be needlessly far apart.

It is too weak as the primary HFI model because it ignores:

- groceries arriving from the entrance;
- pantry/ambient storage;
- dishwasher loading/unloading;
- waste/recycling;
- oven vs hob distinction;
- small appliances;
- serving/dining/garden routes;
- multiple occupants;
- open appliance doors/drawers;
- set-down points;
- hot/wet transfer consequence.

HFI therefore uses **task chains**, not triangle conformance, as the primary method.

A triangle may remain a useful secondary diagnostic.

---

## 12. Hot / wet / sharp transfer

HFI-SC-USE-10 requires special treatment because the consequence of compensation can be higher than mere annoyance.

Representative chains include:

`fridge → preparation → hob/oven → landing/plate`

`sink → draining/preparation → hob`

`hob/oven → stable set-down → serving`

`dirty item → scrape/waste → sink/dishwasher`

Audit questions:

- is a stable set-down available before a heavy/hot object needs regrip?
- does opening an oven/dishwasher remove the only usable landing zone?
- must a hot vessel cross the principal circulation route unnecessarily?
- do sink and hob arrangements force a person to reach over one active hazard to operate another?
- can wet hands reach required controls without extended/unstable posture?
- does a corner create blind crossover between two simultaneous users?

HFI does not specify cooking equipment or fire-safety strategy.

---

## 13. Set-down / staging is a first-class event

A recurring domestic friction is the absence of a credible intermediate surface.

Examples:

- entering with groceries and no stable staging point before opening cold storage;
- removing a hot/heavy item from an oven with no adjacent landing surface;
- unloading a dishwasher while cupboards are too far away or circulation is blocked;
- retrieving a heavy appliance from storage and having nowhere to set it before opening/using it.

The principle is not “continuous spare worktop everywhere.”

The audit question is:

> **where the task predictably changes grip/state, is there a stable nearby place for the load without blocking the next operation?**

This is usually a low-area analytical question before it becomes a dimensional target.

---

## 14. Appliance open-state geometry

A kitchen drawing with all fronts closed can materially misrepresent use.

The HFI audit should model at least representative states for:

- dishwasher door down + lower/upper rack extended;
- oven door open;
- refrigerator/freezer door open to required angle;
- pull-out pantry/tall unit extended;
- representative wide drawer open;
- washing machine/tumble dryer door where located in kitchen/utility fixed work zone.

For each, ask:

- where does the user’s body stand?
- can they bend/reach without backing into an opposing unit/wall?
- is principal circulation temporarily blocked, and is that acceptable for the task frequency/duration?
- can an adjacent appliance/cupboard be used simultaneously where the sequence requires it?
- is there a credible set-down surface?
- does the user need to reach across the open element?

### 14.1 Door conflict is not automatically failure

Some temporary occupation is normal.

A dishwasher door crossing a kitchen aisle is not necessarily defective if:

- loading is a bounded task;
- the user has a stable operating envelope;
- the task does not trap the user;
- required adjacent operations remain feasible;
- alternative circulation is not disproportionately disrupted.

HFI seeks **usable choreography**, not permanent clearance around every possible open state.

---

## 15. Dishwasher / washing appliance loading

Loading and unloading often combine:

- low reach;
- repeated bending;
- wet/slippery objects;
- rack/door projection;
- twisting toward adjacent storage;
- repeated transfer frequency.

Relevant architectural levers include:

- appliance height/location;
- opposing clearance;
- storage proximity;
- adjacent landing surface;
- whether a corner traps the operating body position.

HFI-04D does not mandate raised dishwashers or laundry appliances, but records them as legitimate candidate interventions where repeated bending burden is material and spatial/service burden is proportionate.

---

## 16. Oven / hob interface

The packet distinguishes:

- hob work surface;
- oven cavity height;
- oven-door projection;
- controls;
- adjacent landing surface;
- extraction/ventilation interface;
- transfer path to sink/preparation/serving.

Potential friction mechanisms:

- deep bend + hot load extraction;
- hot load lifted over an open door;
- no immediate landing surface;
- controls reachable only across active heat;
- oven door colliding with principal work/circulation position.

A raised oven can reduce bending while increasing lift height and fixed-tall-unit demand. It is therefore a candidate, not a universal HFI rule.

---

## 17. Sink interface

The sink changes effective task geometry because the hands operate below worktop level and often forward of the body.

Audit fields include:

- front-edge/obstruction depth;
- bowl depth;
- tap/control reach;
- ability to approach closely;
- drain/set-down relationship;
- repeated forward lean;
- hot-water control/safety ownership;
- dishwasher/waste relationship.

Evidence from occupational kitchen settings also supports the basic mechanism that excessive front-edge depth can force sustained forward lean, but HFI does not import commercial-kitchen dimensions into domestic design.

---

## 18. Corners

Corners are not inherently bad.

They become HFI-sensitive when they create:

- deep inaccessible frequent storage;
- overlapping door/drawer handles;
- blind crossing between hot/wet tasks;
- unusable landing area;
- body entrapment when two fronts are open;
- a nominal worktop area that cannot be approached effectively.

A corner mechanism or carousel can improve extraction but introduces product/maintenance complexity. HFI evaluates the **fixed consequence**, not the marketing category of the cabinet fitting.

---

## 19. Fixed general storage outside the kitchen

04D includes fixed household storage where architecture materially constrains use.

Examples:

- cleaning cupboard;
- coat/boot storage where fixed;
- linen storage;
- utility storage;
- built-in pantry;
- fixed equipment recesses.

It does not govern movable wardrobes, free-standing shelves or household organisation.

### 19.1 Cleaning equipment

HFI-SC-LOG-04 requires storage to be tested with representative equipment envelopes and retrieval sequence.

Questions:

- can a vacuum/mop/bucket or equivalent representative kit be removed without unloading unrelated items first?
- is tall storage actually tall/deep enough for intended equipment?
- does the door opening provide usable extraction geometry?
- are heavy consumables forced into awkward overhead storage?
- is there a credible place for charging where the equipment architecture requires it, without turning HFI into product specification?

The exact appliance/tool brand remains unfrozen.

---

## 20. Groceries and pantry/cold-storage arrival

The final metres of grocery handling are part of a complete domestic task.

04D audits:

`route arrival → stable staging → fridge/freezer/pantry access → unpack/sort → packaging/waste return`

Questions include:

- can a loaded person reach a staging surface before complex cabinet/appliance operation?
- can chilled/frozen items be placed without repeatedly carrying them across the active kitchen?
- do fridge/freezer doors conflict with the natural arrival/staging position?
- does deep pantry storage create repeated extraction/repacking burden?
- is packaging/waste flow needlessly crossed with clean food-preparation flow?

No “perfect pantry” layout is implied.

---

## 21. Pregnancy / temporary state

HFI-SC-LC-05 prevents fixed geometry being judged only against a nominal unencumbered body.

Relevant mechanisms include:

- reduced tolerance for deep forward bend;
- changed abdominal clearance;
- altered balance/turning comfort;
- greater consequence of awkward load handling;
- fatigue.

The packet does not create pregnancy-specific dimensions. It asks whether the same fixed arrangement already creates a repeated extreme-bend/deep-reach task that becomes disproportionately burdensome under a common temporary state.

If a lower-burden general arrangement removes that friction for everyone, the case strengthens.

---

## 22. Wheelchair use and adaptation — explicit firewall

Wheelchair kitchen design requires genuinely different approach, knee/foot clearance, reach and manoeuvring relationships.

HFI-04D therefore refuses two opposite errors:

1. **ignore wheelchair geometry because most occupants are ambulant**;
2. **make every fixed kitchen permanently identical to a fully wheelchair-accessible M4(3) kitchen regardless of burden/context**.

### 22.1 Where wheelchair geometry is directly relevant

- an M4(3) dwelling or explicit wheelchair-user brief;
- HFI-07 testing of a claimed wheelchair-use proposition;
- HFI-05B assessment of future adaptation/reservation;
- an entrance-level life-course strategy that specifically claims wheelchair usability.

### 22.2 Potential adaptation-compatible provisions

Without deciding them here, examples include:

- service routes that do not make future sink/worktop adjustment destructive;
- modular/removable base storage at a candidate seated-work zone;
- avoiding structural/service placements that make future knee clearance impossible;
- appliance/service positions that can be altered without shell reconstruction.

These must pass HFI-05B proportionality. “Adaptable” is not permission to build unused specialist mechanism everywhere.

---

## 23. Multi-person use

A family kitchen often hosts simultaneous use, but HFI must avoid the opposite mistake of demanding two-person clearance everywhere.

Test representative conflicts:

- one person at sink while another passes to fridge;
- dishwasher open while someone uses a principal route;
- oven extraction while another occupies preparation space;
- adult + child/care context at a work surface;
- two adults preparing/clearing simultaneously.

The question is whether the fixed layout creates **persistent high-frequency conflict**, not whether every point supports unconstrained passing during every open state.

---

## 24. Cleaning as a fixed-interface task

Cleaning burden is often ignored because it is treated as maintenance rather than ordinary inhabitation.

04D includes routine cleaning where geometry causes repeated bodily demand:

- reaching behind/around fixed appliances where ordinary cleaning is expected;
- deep sink reach;
- cooker/oven cleaning position;
- inaccessible floor corners created by fixed joinery;
- high/deep exposed surfaces requiring frequent cleaning.

Maguire et al. found cleaning among the difficult kitchen tasks reported by older participants; HSE catering evidence independently illustrates the posture mechanism around deep sinks/ovens, though that workplace evidence is not a domestic design standard.

---

## 25. Candidate findings before target formation

| Candidate | Benefit mechanism | Burden / counter-case | HFI-04D disposition |
|---|---|---|---|
| analyse complete kitchen task chains | exposes friction hidden by work-triangle/room-area shorthand | low analytical burden | **adopt as audit method** |
| model representative appliance open states | exposes body/rack/door/circulation conflict | modest drawing/model burden | **adopt as audit requirement** |
| treat set-down/staging as explicit event | reduces risky regrip and repeated carrying | can consume valuable worktop if overprovided | **strong candidate; task-specific** |
| ensure some credible frequent-use storage avoids extreme high/low/deep reach | broad capability benefit | storage allocation is household-specific | **strong candidate; do not freeze contents** |
| put all storage in a universal “reachable band” | simple rule | destroys useful occasional storage and ignores item/frequency/depth | **reject** |
| derive one universal worktop height | simple specification | body/task variation; seated/standing conflict | **reject at 04D** |
| use work triangle as primary proof | familiar shorthand | omits staging, waste, dishwasher, open states, serving, multi-user use | **reject as primary method** |
| require adjacent landing zone for every appliance | simplifies rule | unnecessary area in low-consequence cases | **reject as universal; test hot/heavy/regrip tasks** |
| provide stable landing near oven/hot-load extraction | reduces hot-load carry/regrip | local layout cost | **strong candidate** |
| raise all ovens/dishwashers | reduces bending | increases tall-unit demand/lift height/cost; product/layout constraints | **reject as universal; legitimate candidate** |
| use drawers for every base unit | improves extraction/visibility | cost, hardware, load and maintenance differences | **reject product mandate** |
| avoid forcing frequent heavy items to extreme low/high/deep zones | reduces repeated bend/overreach | requires flexible storage allocation | **strong candidate** |
| make every kitchen permanently M4(3) wheelchair accessible | broad wheelchair accommodation | substantial category-specific area/storage/service implications | **reject as automatic universal rule; evaluate adaptation separately** |
| preserve low-disruption future adaptation where cheap/irreversible | option value | reservation can bloat services/space if speculative | **strong HFI-05B candidate** |
| model simultaneous-use conflicts selectively | exposes persistent household choreography | modelling every combination is excessive | **adopt representative-state method** |

No row is a final numerical HFI target.

---

## 26. HFI-07 audit representation

Later Reference House audit should represent the following fixed facts where source data exists.

### Kitchen / fixed work

- work-zone IDs and function;
- fixed worktop/sink/hob heights and depths where known;
- sink bowl/front-edge geometry where known;
- appliance type/location;
- appliance door/rack open-state envelope;
- principal body operating position;
- opposing fixed clearance;
- adjacent landing/set-down relationship;
- hot/wet transfer path;
- pantry/cold-storage/grocery staging relationship;
- waste/recycling interface where fixed;
- fixed control location where relevant;
- representative simultaneous-use conflict states.

### Fixed storage

- storage zone ID/purpose where architecturally declared;
- lower/upper extents;
- depth/approach obstruction;
- opening type/envelope;
- whether it is the only credible storage zone for a declared frequent/heavy item class;
- representative extraction/body position;
- adaptation/removability status where relevant.

### Audit output

Use the normal HFI-07 disposition vocabulary.

If the source does not define cabinet/appliance geometry, mark it `NOT-MODELLED`.

**Do not invent a fitted-kitchen design in HFI-07 merely to manufacture a pass.**

No combined kitchen-friction score is authorised.

---

## 27. Reference House implications — no verdict yet

### 27.1 Grocery arrival topology

HFI-03D found the ground-floor grocery topology promising at route level.

04D does not upgrade that to a pass because the decisive fixed facts — staging, cold/ambient storage, appliance door states and exact work-zone relationships — are not all frozen.

HFI-07 should connect the route ledger to the eventual fixed interface.

### 27.2 Kitchen work zone

Current Reference House planning establishes room topology more strongly than final fitted-kitchen ergonomics.

Therefore 04D records **audit obligations**, not a kitchen redesign.

High-value future tests include:

- grocery arrival/staging;
- fridge/pantry access;
- sink–prep–hob/oven hot/wet transfer;
- dishwasher open-state + unloading/storage path;
- waste/recycling flow;
- frequent-use storage reach distribution;
- whether doors/through-routes cut across active hot work.

### 27.3 Utility / cleaning storage

HFI-03D already exposed the full laundry cycle as a serious later audit case because sleeping/bathing are upstairs while utility functions are downstairs.

04D does **not** reopen that topology question. It only adds the fixed-interface question: once at the utility/storage zone, are appliances, staging and cleaning-equipment storage themselves usable?

### 27.4 No premature accessibility claim

Nothing in the present fitted-kitchen source is to be read as M4(2)/M4(3) proof unless the actual applicable category and required geometry are explicitly represented and checked by the correct owner.

---

## 28. Rejected hypotheses and shortcuts

HFI-04D explicitly rejects:

1. **“The work triangle proves a good kitchen.”** It omits too many real task events and open states.
2. **“A 900 mm-ish worktop suits everyone.”** Common practice is not multivariate ergonomic proof.
3. **“All storage should be reachable without bending or stretching.”** That would waste useful occasional storage and ignore frequency/item character.
4. **“High cupboards are bad.”** They can be appropriate for light/occasional storage; the issue is forced frequent dependence.
5. **“Low cupboards are accessible because they are below reach limits.”** Bending, kneeling and deep extraction can be the dominant burden.
6. **“Drawers solve base storage.”** They can improve extraction but remain product/hardware choices with open-state geometry.
7. **“More worktop is always better.”** Area has cost and can lengthen transfers; usable placement matters.
8. **“An island automatically improves workflow.”** It can add staging or obstruct circulation depending on task geometry.
9. **“An island automatically harms accessibility.”** Again, actual clearances/task relationships decide.
10. **“Open appliance doors may never block circulation.”** Temporary bounded occupation can be entirely acceptable.
11. **“Every appliance needs a landing surface on both sides.”** Task/consequence determine whether landing is needed.
12. **“Raised appliances are always ergonomic.”** They exchange bending for higher lift/tall-unit/service consequences.
13. **“M4(3) is the universal optimum.”** It is a defined wheelchair-user category, not a generic private-house target.
14. **“Wheelchair design is irrelevant unless a current occupant uses a wheelchair.”** Adaptation and explicit life-course propositions still require evaluation.
15. **“Future adaptability means installing motors/adjustable worktops now.”** Low-disruption future conversion may dominate permanent mechanism.
16. **“A bigger kitchen necessarily has lower friction.”** Poor topology can waste more area and lengthen repeated transfers.
17. **“Kitchen ergonomics ends at food preparation.”** Cleaning, groceries, waste, dishwasher and return-to-storage are ordinary repeated tasks.
18. **“Cabinet contents are architecture.”** HFI governs fixed constraints, not household micromanagement.
19. **“The current RH passes because the kitchen is near the entrance/garden route.”** Route topology does not prove fitted-interface usability.

---

## 29. Evidence confidence

| Finding | Confidence | Reason |
|---|---|---|
| repeated high/low/deep reach and bending can materially burden kitchen use, especially with age/capability change | `E-HIGH` | multiple empirical studies + anthropometric mechanism |
| storage usability depends on obstruction depth/approach, not height alone | `E-MODERATE/HIGH` | anthropometry + storage-access simulation + task evidence |
| kitchen usability should be evaluated as task sequences rather than room area/work triangle alone | `E-MODERATE/HIGH` | domestic empirical evidence + HFI-03D task method + category guidance mechanisms |
| appliance open states materially change usable geometry | `E-HIGH` as geometric mechanism | direct physical consequence; exact acceptability remains task/layout specific |
| adjacent staging/set-down can reduce regrip/carry burden in hot/heavy tasks | `E-MODERATE` | strong task-mechanics rationale + specialist design convergence; exact dimensions not derived |
| one universal worktop height is justified | **rejected** | body/task/seated-standing variation |
| all frequent storage can be placed in one universal reach band | **rejected** | reach/bend/depth/item/frequency interactions |
| M4(3) kitchen geometry should become universal Ovid’s House geometry | **rejected** | category/applicability and proportionality firewall |
| adaptation-compatible service geometry may have high option value | `E-MODERATE` | specialist housing practice + irreversibility logic; burden must be tested in HFI-05B |
| a particular cabinet/appliance system is justified | **rejected** | outside architectural evidence scope |

---

## 30. Proportionality / burden flags for HFI-05B

### Likely low-burden / broad-benefit candidates

- explicit task/open-state modelling before freezing a kitchen layout;
- usable grocery staging;
- avoiding unnecessary hot-load crossing of principal circulation;
- providing a credible landing point for high-consequence hot/heavy extraction;
- ensuring at least some flexible frequent-use storage can avoid extreme reach/bend zones;
- avoiding fixed service geometry that needlessly blocks future adaptation;
- representative cleaning-equipment storage envelope rather than an abstract tiny cupboard.

### Higher-burden candidates requiring scrutiny

- universally larger kitchen clearances;
- permanent M4(3) geometry in every dwelling;
- adjustable-height worktop/hob/sink mechanisms installed speculatively;
- raised appliances throughout;
- redundant duplicated work zones;
- oversizing fixed storage to accommodate every possible household item;
- proprietary corner/pull-down/automated storage mechanisms as architectural requirements.

HFI-05B must test area, cost, embodied material, service complexity, maintenance, replacement, lock-in, visual/architectural effect and displaced storage/worktop capacity.

---

## 31. Cross-discipline handoffs

| Question | Owning discipline / later gate |
|---|---|
| fire / cooking ignition / suppression | fire/life safety |
| ventilation/extract rate and duct design | ventilation/services |
| water hygiene / scalding / plumbing | public health/plumbing |
| electrical isolation/socket safety | electrical / Part P / BS 7671 |
| gas safety where applicable | gas competent design |
| appliance product safety | product/manufacturer |
| structural support of stone/worktops/wall units | structure/detailing |
| moisture/waterproofing | envelope/moisture owner |
| appliance replacement route | HFI-03C / serviceability as applicable |
| domestic route before/after kitchen | HFI-03D |
| fixed kitchen/storage human use | HFI-04D |
| permanent-burden trade-off | HFI-05B |
| quantitative preferred targets | HFI-06 |
| current Reference House verdict | HFI-07 |

---

## 32. Computational consequence

HFI-04D identifies a future representation opportunity only.

Potential source facts include:

- fixed work-zone geometry;
- worktop/sink/hob height/depth where genuinely frozen;
- storage-zone extents/depth;
- appliance closed/open envelopes;
- user operating zone;
- landing/set-down adjacency;
- transfer relationships;
- representative simultaneous-use state;
- adaptation/removable-base status;
- fixed cleaning-equipment storage envelope.

It does **not** authorise:

- automatic kitchen generation;
- a universal `worktop_height_ok` rule;
- a universal storage reach band;
- M4(3) proof by proxy;
- a weighted kitchen-friction score;
- cabinet/appliance product selection.

Any later machine proof must state which person/task/category it proves and retain the external-standard context of any normative dimension.

---

## 33. Closeout

**Packet:** HFI-04D — kitchen, storage and fixed work zones  
**Research-start baseline:** `0da7f1ccd9a9d7ae540a6c326733a2fdb7ef3d0d`  
**Exact question answered:** fixed kitchens/storage/work zones must be judged through complete retrieval–staging–work–transfer–cleaning–return sequences under changing open-state geometry, with explicit reach/bend/lift/set-down and hot/wet crossover events, rather than by room area, work-triangle shorthand or one standard worktop/reach dimension.  
**Evidence:** HFI-02A/03C/03D; current M4 category framework; specialist Habinteg/CAE/RIBA housing guidance; UK/peer-reviewed kitchen-living, cooking-task, surface-height and storage-access evidence.  
**Findings:** adopts a fixed-interface task ledger; makes appliance open states and set-down events first-class audit facts; separates frequent-item storage burden from universal shelf reach; rejects one universal worktop/storage band; preserves wheelchair-category geometry without universalising it; identifies adaptation-compatible fixed/service geometry as an HFI-05B candidate; preserves product/interior-design and technical-safety ownership.  
**Artefact:** this record only.  
**Checks:** no Reference House geometry, fitted-kitchen design, appliance/cabinet product, preferred numeric target, doctrine, pattern, compiler proof, publication content or maturity state changed.  
**Authority/maturity consequence:** research method advances; no downstream architectural authority is superseded and no RH rewind is authorised.  
**Stale downstream items:** none created; HFI-07 now has explicit kitchen/storage/open-state audit fields.  
**HFI-04 gate:** if this packet merges green, HFI-04A through HFI-04D are complete.  
**Exact next packet:** **HFI-05A — candidate targets / decision register** (per execution plan naming/sequence; re-read canonical plan before starting).
