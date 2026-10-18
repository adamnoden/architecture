# HFI-00C — Friction Register and Completeness Proof

**Packet:** HFI-00C  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `c5db4feee48a91101deef7df98bed8e0aafc16fa`  
**Controlled baseline:** [`hfi-00b-controlled-baseline.md`](hfi-00b-controlled-baseline.md)  
**Question:** what human-factors-sensitive claims, facts, obligations, triggers and missing representations already exist before HFI begins research?  
**Boundary:** inventory only. Nothing in this register is a design correction, preferred dimension, doctrine, compliance finding or HFI acceptance target.

---

## 1. How to read the register

HFI-00C is a **question and obligation register, not a defect list**.

An item appears because later HFI work must be able to find and dispose of it. Inclusion does not mean that the current architecture is wrong. A current dimension is not endorsed because it is recorded; an anecdotal irritation is not evidence because it triggered the programme; and an unmodelled question is not automatically a Reference House defect.

Five inventory classes are used:

| Class | Meaning |
|---|---|
| `CURRENT-CLAIM` | an architectural or project position already stated in controlled project material |
| `CURRENT-FACT` | a represented or derived fact in the controlled Reference House baseline |
| `KNOWN-OBLIGATION` | a matter the project already says remains to be proved, resolved or reviewed |
| `TRIGGER-HYPOTHESIS` | a human-factors concern that helped open HFI but has not yet earned a project rule |
| `NOT-MODELLED` | an in-scope question for which the current Reference House does not contain enough representation to judge |

HFI-07 later owns `PASS / IMPROVE / CONFLICT / UNRESOLVED / NOT-MODELLED` audit findings. HFI-00C deliberately does **not** apply that later status vocabulary early.

Each item also names the narrowest present architectural owner. Research ownership is shown separately so HFI does not become a shadow architectural authority.

---

## 2. Movement and vertical circulation

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-MV-01` | `CURRENT-FACT` | Reference House stair uses 18 risers in three groups of six, five 280 mm goings per flight, derived rise ≈183.33 mm, `2R+G` ≈646.67 mm and pitch ≈33.2°. These are baseline facts, not HFI targets. | RH-03 | 02B |
| `HFI-FR-MV-02` | `CURRENT-FACT` | Stair clear-width target is 1000 mm and stair reservation is 2400–2500 mm; both remain provisional source facts. | RH-03 | 02B / 02C |
| `HFI-FR-MV-03` | `CURRENT-CLAIM` | RH-03 selects full landings and no winders, explicitly preferring secure ordinary treads over a more compact winder-led solution. | RH-03 | 02B |
| `HFI-FR-MV-04` | `TRIGGER-HYPOTHESIS` | Large-foot users may experience shallow domestic treads as a repeated foot-placement/attention demand. The initial size-11-shoe concern is a trigger, not evidence that 280 mm is or is not sufficient. | RH-03 if accepted | 02A / 02B |
| `HFI-FR-MV-05` | `KNOWN-OBLIGATION` | Clear-headroom intent is not less than 2000 mm, but detailed headroom geometry is outside the current executable stair proof. | RH-03 / later technical design | 02B |
| `HFI-FR-MV-06` | `KNOWN-OBLIGATION` | Handrail geometry, guarding, nosings, edge/contrast treatment, lighting and construction tolerance are not established by the current RH-C5 arithmetic check. | RH-03 / technical design | 02B |
| `HFI-FR-MV-07` | `NOT-MODELLED` | Stair use while carrying a child, laundry, luggage or other load; with occupied hands; under fatigue, distraction or low light; or with reduced balance has not been scenario-tested. | RH-03 if geometry changes | 01C / 02D |
| `HFI-FR-MV-08` | `CURRENT-CLAIM` | Current stair width is said to preserve a lower-burden future stair-lift option. The proportionality and real geometry of that claim have not yet been tested by HFI. | RH-10, with RH-03 geometry | 02C / 05B |
| `HFI-FR-MV-09` | `CURRENT-CLAIM` | The house preserves a credible future entrance-level sleeping-room option and potential entrance-level level-access shower. These are adaptation intentions, not whole-dwelling wheelchair claims. | RH-10 | 02C / 04A |
| `HFI-FR-MV-10` | `NOT-MODELLED` | Assistance on stairs, use by children, short/tall occupants, pregnancy, temporary injury and age-related changes have not yet been put through a frozen scenario matrix. | RH-03 / RH-10 | 01C / 02C / 02D |

---

## 3. Horizontal circulation, corners and pinch points

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-HC-01` | `CURRENT-FACT` | `G-GAL-01` is a 1300 mm gross executable field. RH-02 explicitly leaves final clear gallery width unresolved once wall, door and joinery coordination is applied. | RH-02 | 03A |
| `HFI-FR-HC-02` | `CURRENT-FACT` | `U-GAL-02` is a 1300 mm gross field. DRW-04A.1 added a provisional 1300 mm-deep south turn and preserved the existing ≈1200 mm north turn to make the U-route positive-width and compiler-enforced. These are planning facts, not usability targets. | RH-03 | 03A |
| `HFI-FR-HC-03` | `CURRENT-CLAIM` | Principal architectural movement and ordinary all-weather movement are intentionally different systems; the house does not require routine crossing of the open courtyard. | RH-02 / RH-10 | 03A / 03D |
| `HFI-FR-HC-04` | `TRIGGER-HYPOTHESIS` | High-traffic circulation may deserve more width than low-frequency secondary movement. No role/traffic classification or preferred width has yet been derived. | RH-02 / RH-03 if accepted | 03A / 05B |
| `HFI-FR-HC-05` | `TRIGGER-HYPOTHESIS` | Tight corners can impose unnecessary body or object choreography even when adjacent straight segments meet nominal width rules. | RH-02 / RH-03 if accepted | 03A / 03C |
| `HFI-FR-HC-06` | `NOT-MODELLED` | Effective swept path around corners, including body/object rotation rather than static corridor width, is not represented by the current compiler. | RH-02 / RH-03 | 03A / 03C / 07A |
| `HFI-FR-HC-07` | `KNOWN-OBLIGATION` | Door clear openings, door swings, cabinetry, radiators, joinery and other local intrusions have not been comprehensively coordinated against clear circulation width. | RH-02 / RH-03 / RH-09 by interface | 03A / 04B |
| `HFI-FR-HC-08` | `NOT-MODELLED` | Passing, turning and assisted movement envelopes are not currently encoded or audited across principal and secondary routes. | RH-02 / RH-03 | 03A |
| `HFI-FR-HC-09` | `CURRENT-CLAIM` | RH-10 says door and passage widths must be checked together rather than treated as independent pass/fail values. | RH-10 | 03A |
| `HFI-FR-HC-10` | `NOT-MODELLED` | Dignity/equivalence of routes has not been audited: a technically usable but conspicuously secondary/service route could still fail the programme's intended quality test. | RH-02 / RH-10 | 01C / 03A / 03B |

---

## 4. Continuous ground plane, thresholds and external approach

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-GP-01` | `CURRENT-CLAIM` | The ground floor is intended to remain step-free internally. | RH-10 | 03B |
| `HFI-FR-GP-02` | `CURRENT-CLAIM` | Principal entrance approach and threshold should be step-free where a real site permits the normal applicable solution; the site-agnostic Reference House cannot prove external approach levels. | RH-10 | 03B |
| `HFI-FR-GP-03` | `CURRENT-CLAIM` | `TH-02` principal entrance threshold is intended to be substantially level, weathered, replaceable and consistent with the entrance hierarchy. | RH-09 / RH-10 | 03B |
| `HFI-FR-GP-04` | `CURRENT-CLAIM` | Courtyard/garden thresholds should read as substantially flush while resolving internal datum, doorset, paving/drainage, movement, weathering and accessibility together. | RH-09 | 03B / 05C |
| `HFI-FR-GP-05` | `CURRENT-CLAIM` | Where the same floor build-up genuinely continues through an internal doorway, RH-09 selects no decorative threshold strip. | RH-09 | 03B |
| `HFI-FR-GP-06` | `TRIGGER-HYPOTHESIS` | Changes of internal floor material should not create gratuitous level changes or raised strips merely because finishes differ. The limits and interface duties are not yet researched. | RH-09 if accepted | 03B / 05C |
| `HFI-FR-GP-07` | `KNOWN-OBLIGATION` | Exact external threshold weathering, drainage, thermal, movement and doorset geometry remains technical work. A flush expression cannot be treated as permission to ignore water. | RH-09 / technical owners | 03B / 05C |
| `HFI-FR-GP-08` | `NOT-MODELLED` | Level-access shower entry and its relationship to falls, drainage, waterproofing and slip conditions are not represented at usable detail. | RH-09 / bathroom owner | 03B / 04A |
| `HFI-FR-GP-09` | `NOT-MODELLED` | Street/pavement levels, approach gradient, parking/set-down and real garden levels are absent by design because the Reference House has no site. | future site design, not HFI/RH defect | 03B boundary only |
| `HFI-FR-GP-10` | `TRIGGER-HYPOTHESIS` | The desired condition is close to wheeled continuity from public approach to principal entrance-level destinations, but HFI has not yet defined when site geometry makes a step or ramp compromise proportionate. | RH-10 / real site | 03B / 05B |

---

## 5. Furniture, objects and repeated domestic logistics

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-LO-01` | `TRIGGER-HYPOTHESIS` | Furniture movement should be treated as a real design task rather than assuming that an object fitting through one doorway means it can reach its destination. | RH-02 / RH-03 if accepted | 03C |
| `HFI-FR-LO-02` | `NOT-MODELLED` | No current house-level swept-path test exists for a representative sofa from outside → entrance → principal living room. | RH-02 | 03C / 07D |
| `HFI-FR-LO-03` | `NOT-MODELLED` | No current swept-path test exists for representative mattresses/beds to upper bedrooms via the principal stair and landings. | RH-03 | 03C / 07D |
| `HFI-FR-LO-04` | `NOT-MODELLED` | No current household logistics test exists for replacement white goods from delivery point to kitchen/utility destination. Service-plant replacement routes do not substitute for this ordinary domestic question. | RH-02 / RH-06 where routes overlap | 03C / 07D |
| `HFI-FR-LO-05` | `NOT-MODELLED` | Pram, wheelchair and other representative mobility/object routes through entrance, principal circulation and garden access are not yet tested as complete routes. | RH-02 / RH-10 | 03C |
| `HFI-FR-LO-06` | `NOT-MODELLED` | Groceries from entrance to kitchen are not tested as a loaded-body route with occupied hands and door interactions. | RH-02 | 03D / 02D |
| `HFI-FR-LO-07` | `NOT-MODELLED` | Laundry routes between bedrooms/bathroom, utility and drying/storage destinations are not tested for repeated carrying burden. | RH-02 / RH-03 | 03D |
| `HFI-FR-LO-08` | `NOT-MODELLED` | Waste, cleaning equipment and ordinary housekeeping routes are not presently tested as human-factors tasks. | RH-02 / RH-03 | 03D |
| `HFI-FR-LO-09` | `NOT-MODELLED` | Carrying or assisting children/dependants through doors, corners and stairs is not represented. | RH-02 / RH-03 / RH-10 | 01C / 03D |
| `HFI-FR-LO-10` | `KNOWN-OBLIGATION` | An alternate delivery/replacement route may be valid where consciously designed; HFI has not yet established when that is preferable to enlarging principal circulation. | owning RH gate for selected route | 03C / 05B |

---

## 6. Controls, openings and operating effort

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-CT-01` | `CURRENT-CLAIM` | RH-09 rejects ordinary socket outlets in the skirting and currently carries the 450–1200 mm accessible accessory/control band inherited from Approved Document M guidance. | RH-09 | 02A / 04C |
| `HFI-FR-CT-02` | `CURRENT-CLAIM` | Selected door surrounds may host controls/switches near room entry where the architectural/service route genuinely earns it. | RH-09 | 04C |
| `HFI-FR-CT-03` | `TRIGGER-HYPOTHESIS` | Controls should be placed according to the sequence of human action rather than simply nearest service convenience. | RH-09 if accepted | 04A / 04C / 05D |
| `HFI-FR-CT-04` | `TRIGGER-HYPOTHESIS` | Shower controls under the shower head can require the user to enter the consequence zone before establishing flow/temperature. The project has not yet researched or formalised the better relationship. | RH-09 / bathroom layout owner | 04A |
| `HFI-FR-CT-05` | `NOT-MODELLED` | Bath control reach and the need to lean across a bath/hot-water zone are not represented. | RH-09 / bathroom layout owner | 04A |
| `HFI-FR-CT-06` | `NOT-MODELLED` | Door handle, latch, lock and closer force/grip requirements are not represented in the Reference House. | RH-09 | 02A / 04B |
| `HFI-FR-CT-07` | `NOT-MODELLED` | Window opening/closing reach, force, grip and one-handed operation are not represented. | RH-09 | 02A / 04B |
| `HFI-FR-CT-08` | `NOT-MODELLED` | Lighting, heating, ventilation and shading controls have no HFI sequence/mapping/feedback audit. | RH-09 / controls technical owner | 04C |
| `HFI-FR-CT-09` | `NOT-MODELLED` | Control use with wet hands, one hand, occupied hands, reduced dexterity or low light has not been tested. | RH-09 | 01C / 04A / 04C |
| `HFI-FR-CT-10` | `KNOWN-OBLIGATION` | Fault/isolation controls intersect HFI only where ordinary occupants must identify or operate them; service access, electrical safety and maintenance procedure retain their existing technical owners. | RH-09 + service/electrical owner | 04C boundary |

---

## 7. Bathrooms, WC, kitchen and fixed-use zones

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-FX-01` | `CURRENT-CLAIM` | Ground WC access geometry takes priority over utility storage/appliance convenience; if they conflict, utility yields area first rather than shell expansion occurring automatically. | RH-10 | 04A / 05B |
| `HFI-FR-FX-02` | `KNOWN-OBLIGATION` | Final `G-WC-01` WC/basin geometry and outward-opening door condition require technical/access proof rather than being assumed from the room label. | RH-10 | 04A / 07B |
| `HFI-FR-FX-03` | `CURRENT-CLAIM` | The entrance-storey service-suite sanitary space is intended to preserve a potential level-access shower without enlarging the shell. | RH-10 | 04A / 02C |
| `HFI-FR-FX-04` | `NOT-MODELLED` | Family-bathroom fixture clearances, reach, transfer, drying/dressing sequence and possible assistance space are not represented at HFI resolution. | RH-03 / RH-09 as applicable | 04A |
| `HFI-FR-FX-05` | `NOT-MODELLED` | Future support/grab-rail provision and backing capacity have not been tested for proportionality or interface consequences. | RH-09 / structure where required | 04A / 05B |
| `HFI-FR-FX-06` | `NOT-MODELLED` | Wet-condition slip, balance and operating-sequence consequences are not currently represented beyond general moisture/water design concerns. | RH-09 / bathroom owner | 04A |
| `HFI-FR-FX-07` | `NOT-MODELLED` | Kitchen fixed-work geometry, circulation around open appliance doors and interaction with the service edge are not HFI-audited. | RH-02 / RH-06 where services govern | 04D |
| `HFI-FR-FX-08` | `NOT-MODELLED` | Storage/reach/bending burdens created by fixed architectural geometry are not audited. Loose cabinet organisation remains outside HFI unless architecture constrains it. | RH-02 / RH-09 | 04D |
| `HFI-FR-FX-09` | `NOT-MODELLED` | Appliance controls and loading/unloading sequences are not HFI-owned unless fixed architectural geometry materially constrains use; that boundary has not yet been applied. | RH-02 / product design boundary | 04D / 05A |
| `HFI-FR-FX-10` | `KNOWN-OBLIGATION` | HFI must avoid becoming an interior-design specification system: only spatial/interface decisions with architectural persistence or retrofit consequence are candidates for project rules. | architectural-specificity boundary | 01A / 05A |

---

## 8. Perception, comprehension and degraded states

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-PC-01` | `CURRENT-CLAIM` | Repose / Low Vigilance already treats safe and understandable movement as part of reducing unnecessary monitoring load. HFI develops the embodied/operational part of that proposition. | governing principles / Repose | 01A / 05D |
| `HFI-FR-PC-02` | `CURRENT-CLAIM` | The courtyard is used as an orientation device in the upper circulation rather than allowing a blind hotel-like corridor. | RH-03 | 03A / 05A |
| `HFI-FR-PC-03` | `NOT-MODELLED` | Legibility of level changes, routes, door decisions and local controls under low light or distraction is not formally tested. | owning RH interface | 01C / 02D / 04C |
| `HFI-FR-PC-04` | `NOT-MODELLED` | Useful visual contrast for stairs, thresholds and controls has not been researched or represented as a project-specific requirement. | RH-03 / RH-09 | 02B / 04C |
| `HFI-FR-PC-05` | `NOT-MODELLED` | Predictable control mapping and clear feedback have not been audited. | RH-09 | 04C |
| `HFI-FR-PC-06` | `NOT-MODELLED` | Sensory/cognitive variation and children have not yet been frozen into representative scenarios. | HFI scenario method; RH owner only if finding alters design | 01C |
| `HFI-FR-PC-07` | `KNOWN-OBLIGATION` | Specialist life-safety signalling, alarm design and evacuation performance remain with fire/life-safety disciplines rather than being subsumed into HFI. | fire/life-safety owner | 01A boundary |
| `HFI-FR-PC-08` | `KNOWN-OBLIGATION` | Thermal comfort, acoustics, daylight and structural-perception hypotheses remain under their existing environmental/architectural research owners. HFI may consider how a person operates or moves under those states but does not inherit the underlying performance discipline. | existing discipline owners | 01A / 05C boundary |

---

## 9. Life-course, visitability and equivalent use

| ID | Class | Current state / question to preserve | Architectural owner | Research handoff |
|---|---|---|---|---|
| `HFI-FR-LC-01` | `CURRENT-CLAIM` | RH-10's visitability verdict is spatially credible with site-level proof outstanding. | RH-10 | 03B / 07B |
| `HFI-FR-LC-02` | `CURRENT-CLAIM` | The project does not currently claim whole-dwelling wheelchair compliance/usability. | RH-10 | 01A / 02C |
| `HFI-FR-LC-03` | `NOT-MODELLED` | Ageing, temporary injury, pregnancy, large/small bodies, reduced strength/grip/balance, and assistance/care are not yet a frozen scenario set. | HFI method; affected RH owner later | 01C |
| `HFI-FR-LC-04` | `NOT-MODELLED` | Equivalent/dignified use has not been tested across entrance, garden and internal routes. | RH-02 / RH-10 | 01C / 03A / 03B |
| `HFI-FR-LC-05` | `KNOWN-OBLIGATION` | HFI has not yet separated irreversible construction-time provisions worth buying early from measures better left demand-led and replaceable. | affected RH owner after evidence | 01D / 02C / 05B |
| `HFI-FR-LC-06` | `KNOWN-OBLIGATION` | London M4(2)/M4(3) context, BS 8300, Lifetime Homes/Habinteg/HAPPI and other external guidance have not yet been normalised into one applicability/evidence register. | HFI evidence layer, not direct architectural authority | 01B |
| `HFI-FR-LC-07` | `KNOWN-OBLIGATION` | Human variation must not be reduced to one median body or one nominal wheelchair envelope; percentile/population limits remain to be researched. | HFI evidence layer | 02A |
| `HFI-FR-LC-08` | `KNOWN-OBLIGATION` | HFI has not yet decided whether a dedicated inclusive-design/human-factors/occupational-therapy external review is warranted in addition to the existing RH-11 review package. | RH-11 review boundary | 08D |

---

## 10. Existing numeric facts that must not become accidental targets

HFI-00B already freezes the detailed source identities. HFI-00C adds one explicit anti-drift rule: the following values may be cited during research as the **current house**, but HFI must not treat them as normative merely because they are convenient inputs.

| Current value / range | Present meaning | Not yet established as |
|---|---|---|
| stair going **280 mm** | controlled current Reference House source | preferred human-factors going |
| stair rise **≈183.33 mm** | derived from +3300 mm FFL / 18 risers | preferred human-factors rise |
| stair pitch **≈33.2°** | current derived stair geometry | preferred human-factors pitch |
| stair width **1000 mm** | provisional clear-width target | evidence-backed project minimum/target |
| stair box **2400–2500 mm** | provisional coordination reservation | life-course/adaptation requirement |
| ground gallery **1300 mm gross** | executable planning field | required clear corridor width |
| upper gallery **1300 mm gross** | executable planning field | required clear corridor width |
| south upper turn **1300 mm deep** | provisional DRW-04A.1 planning correction | human-factors turning standard |
| north upper turn **≈1200 mm deep** | current provisional plan geometry | human-factors turning standard |
| controls/accessories **450–1200 mm AFFL** | current RH-09 adoption of external guidance band | final Ovid's House sequence/reach rule |
| external thresholds **substantially level/flush** | current architectural intent | completed drainage/weathering/accessibility detail |

HFI-06, not this packet, owns any eventual target architecture.

---

## 11. Cross-owner boundaries

The corpus sweep found several neighbouring concerns that HFI must deliberately **not** annex.

| Neighbouring concern | Existing owner / boundary | HFI intersection only |
|---|---|---|
| thermal comfort / overheating | environmental strategy / building-physics review | degraded-state/use consequence where relevant; not thermal modelling itself |
| daylight / glare | environmental/architectural design | route/control legibility where evidence supports it; not whole daylight design |
| acoustics / privacy | architectural/acoustic owner | conflict test when a wider/open route or interface changes privacy/acoustics |
| structural sizing / guarding capacity | structural owner | human-factors requirement can create a demand, but HFI does not size structure |
| fire / means of escape / alarms | fire/building-control owner | ordinary movement or interface conflicts only; no substitute fire strategy |
| service maintenance access | maintenance/service geography | shared routes and ordinary occupant controls where those overlap |
| moisture / waterproofing / drainage | envelope/wet-room/drainage owners | HFI can demand level/usable transitions but cannot waive water-management duties |
| security | doors/windows/security owner | operating effort and sequence are HFI inputs; security performance remains separate |
| loose furniture/product choice | occupant/interior/product layer | only when permanent geometry makes ordinary use or replacement materially difficult |
| real-site levels / parking / public realm | future site-specific design | HFI supplies questions/criteria; Reference House does not invent site facts |

This boundary is essential to the programme's usefulness. HFI is about **embodied use of persistent architecture**, not a second umbrella over every environmental or technical quality of a house.

---

## 12. Corpus completeness proof

### 12.1 Authority layers swept

The 00C inventory was checked against every authority layer identified by HFI-00A:

| Layer | Material checked | Disposition |
|---|---|---|
| governing architectural propositions | `docs/manuscript/governing-principles.md`; Repose / Low Vigilance research | embodied movement/attention claims inventoried; non-HFI environmental claims bounded out |
| HFI programme control | issue #195; canonical programme; execution plan | every declared HFI scope family mapped below |
| Reference House brief / early design | brief and constraint ledger; RH-02; RH-03 | circulation, stair, adaptation and route facts/questions inventoried |
| occupied interfaces | RH-09 tectonic integration; selected pattern occurrences | thresholds, doors, controls/accessory positions and fixed-interface gaps inventoried |
| whole-house coordination / review | RH-10; integrated RH summary; external review brief | visitability, ground WC, adaptation and external-validation gaps inventoried |
| executable representation | Reference House fixture/model/plan adapter; HFI-00B source freeze | current numerical geometry and modelability limits separated from design targets |
| bounded calculation | RH-C5 method/proof boundary | external ADK numeric correspondence kept separate from HFI comfort/usability claims |
| drawing-discovered correction | DRW-04A.1 | merged upper-route continuity carried as pre-HFI baseline, not duplicated as an HFI finding |
| development/specificity governance | architectural-specificity boundary | interior/product detail and Reference-House-specific conveniences prevented from becoming automatic doctrine |
| publication/delivery boundary | PUB-SAN/PUB-NOM and HFI programme controls via 00A | HFI workflow identity remains internal; no publication proposition created by 00C |

### 12.2 Programme-scope coverage

Every core research scope in issue #195 now has at least one explicit register family:

| Declared HFI scope | Register coverage |
|---|---|
| movement and vertical circulation | `MV-*` |
| horizontal circulation and clearances | `HC-*` |
| continuous ground plane and approaches | `GP-*` |
| furniture, object and domestic-task logistics | `LO-*` |
| controls, openings and operating effort | `CT-*` |
| bathrooms, kitchens and fixed use zones | `FX-*` |
| perception, comprehension and degraded states | `PC-*` |
| life-course proportionality / visitability / adaptability | `LC-*` |

No declared HFI scope family is orphaned before HFI-01 begins.

### 12.3 Owner coverage

Every register item is either:

1. mapped to an existing architectural owner (`RH-02`, `RH-03`, `RH-09`, `RH-10`, `RH-11`/technical review);
2. explicitly left with an existing neighbouring discipline; or
3. identified as a research-method/evidence question that has **no architectural authority yet**.

There is no item whose mere presence in HFI-00C creates a new owner.

### 12.4 What “complete” means here

The completeness claim is intentionally bounded:

> **HFI-00C is complete against the controlled project corpus and the HFI programme scope at baseline `c5db4fee…`; it does not claim that research, external evidence or future scenarios cannot reveal additional human-factors questions.**

If HFI-01 or later research discovers a genuinely new question, it may be appended to the active evidence/scenario work without pretending that 00C should have predicted it. If a later `main` change introduces new HFI-sensitive architecture before the HFI-07 audit, the audit must consume the changed authority rather than treating this register as a permanent freeze of the house.

---

## 13. HFI-00 closeout boundary

With HFI-00A, 00B and 00C complete, HFI has established:

- who owns each class of architectural consequence;
- the exact pre-research Reference House baseline;
- the human-factors-sensitive claims/facts already in the project;
- the questions the current model cannot answer;
- the anecdotal triggers that must remain hypotheses until evidence supports them;
- the neighbouring disciplines HFI must not absorb;
- full coverage of the programme's declared research scope.

HFI-00 has **not** established:

- any stronger design target;
- that any current dimension passes or fails human-factors research;
- a preferred corridor/stair/door/threshold/reach value;
- a universal accessibility doctrine;
- a new pattern;
- a Reference House correction;
- a new compiler proof family;
- external validation.

**Exact next packet:** `HFI-01A — terminology + scope`. It should freeze the vocabulary needed to research these questions consistently before HFI-01B begins assembling external evidence.