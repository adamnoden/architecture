# HFI-04B — Doors, Windows and Hardware

**Packet:** HFI-04B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Research-start baseline `main`:** `552bc8fb84379287a032cd7f7e18cef74c03bcc9`  
**Prior packet:** HFI-04A — bathing, toileting and dressing  
**Question:** how should HFI represent and judge ordinary doors, operable windows and their fixed hardware as complete action sequences — including reach, grip, operating force, one-handed use, leaf/sash motion, latch/lock/closure behaviour, swing conflicts and feedback — without importing public-building or wheelchair-category limits as universal domestic targets or weakening security, fire, weathering and ventilation duties?  
**Boundary:** evidence synthesis and interface-use method only. This packet does **not** change Reference House door/window geometry, choose a proprietary doorset/window/hardware family, freeze lever/knob/lock geometry, set Ovid’s House operating-force or torque limits, set handle mounting heights, redesign fire/security/weathering/ventilation strategy, claim M4 compliance, create doctrine/patterns, add compiler proof or change publication maturity.

---

## 1. Purpose

A door or window can satisfy a nominal clear width, handle height or product datasheet force and still be awkward to use.

The relevant unit is the **complete operation**:

`approach → position → reach/grasp → unlock/unlatch → initiate movement → control moving leaf/sash → pass/use → recover/reposition → close → latch/lock → confirm state`

Not every interface uses every event. A simple unlatched internal door differs from a weather-sealed external door. A top-hung window differs from a casement. A self-closing doorset differs from an ordinary bedroom door. A person carrying a child or tray differs from the same person with both hands free.

The controlling proposition is:

> **Door and window usability is a property of the complete body–hardware–moving-leaf sequence, not of handle height, clear width or a single force value in isolation.**

A second proposition follows from HFI-02A:

> **Operating effort is action- and posture-specific. Push, pull, lever depression, twist/torque and sustained control are not interchangeable measures of “strength”.**

This packet tests those propositions while preserving the project’s separate technical owners.

---

## 2. Controlled Reference House facts — comparison only

HFI-00B remains the controlled human-factors baseline. RH-09 and later drawing work provide relevant interface facts but do not themselves prove HFI usability.

### 2.1 Door family

RH-09 currently selects a serviceable doorset interface in permanent openings:

`permanent opening → declared fixing / adjustment zone → replaceable doorset → removable architrave`

That is a tectonic/lifecycle choice. It does **not** freeze:

- final handle profile;
- latch return/operating force;
- lock/cylinder operation;
- closer behaviour where a closer is required;
- hold-open behaviour;
- exact handle height;
- opening-force target;
- haptic/visual indication of latched or locked state.

Internal threshold logic is already deliberately restrained: where the same floor build-up continues, no decorative threshold strip is introduced merely for appearance. External threshold/water-management questions remain governed by HFI-03B and the appropriate technical owners.

### 2.2 Window family

RH-09 currently selects the `OW-01` replaceable-window interface:

`permanent masonry opening → durable mounting/tolerance zone → replaceable frame → removable internal reveal/architrave trim`

It prefers internal removal of sash/glazing/ironmongery where the selected product permits it, but does not require the complete frame to be removable from indoors.

Again, this is lifecycle/tectonic authority, not ergonomic proof. The Reference House does not yet freeze:

- operable-sash type per room;
- handle profile;
- latch/locking sequence;
- operating force/torque;
- opening travel;
- reachable closing state after opening;
- remote operator provision;
- fixed furniture/radiator interference with approach.

### 2.3 Existing inherited reach bands

RH-09 currently notes the broad Approved Document M dwelling guidance ranges for sockets/switches and selected window handles. HFI-02A explicitly refused to promote those inherited values into Ovid’s House ergonomic targets.

HFI-04B preserves that boundary.

---

## 3. Frozen scenario coverage

HFI-04B primarily owns or materially contributes to these HFI-01C scenarios.

| Scenario | Door/window/hardware question |
|---|---|
| `HFI-SC-ARR-03` | can a mobility-aid user enter without avoidable retreat/repositioning caused by threshold, leaf and handle sequence? |
| `HFI-SC-ARR-05` | can a person carrying a tray/load move inside→garden without repeatedly setting down or freeing a hand merely to operate the door? |
| `HFI-SC-LOG-05` | what happens when a person carrying a child operates doors under hands-busy/divided-attention conditions? |
| `HFI-SC-USE-02` | do leaf, handle and adjacent geometry create body interference or reach-back for a larger adult? |
| `HFI-SC-USE-03` | can open/close/lock be completed one-handed without disproportionate grip, regrip or bracing? |
| `HFI-SC-USE-04` | what force/grip/feedback relationships materially affect door/window operation under reduced dexterity? |
| `HFI-SC-USE-13` | does temporary upper-limb impairment create avoidable cross-body reach, force or sequence failure distinct from merely having one occupied hand? |

HFI-03D also makes `DOOR` an explicit domestic-task event. HFI-04B supplies the interface detail for that event; it does not re-score domestic routes.

---

## 4. Existing evidence reused

### 4.1 HFI-02A — anthropometry, reach and operating force

HFI-02A already establishes the inference firewall that controls this packet:

- maximum grip is not a hardware force limit;
- grip, pinch, twist, push, pull and lever depression are different actions;
- repeated comfortable operation is not equivalent to one maximum voluntary effort;
- approach/posture changes effective capability;
- one-handed, occupied-hand and upper-limb-impaired states must be tested explicitly;
- the 2025-published government research force values are candidate observations, not project targets.

The relevant government-study 5th-percentile observations recorded by 02A are:

| Action | 5th-percentile observation |
|---|---:|
| anterior push | `16.7 N` |
| anterior pull | `25.3 N` |
| anterior downward handle | `18.7 N` |
| lateral push | `16.8 N` |
| lateral pull | `29.8 N` |
| lateral downward handle | `36.0 N` |

These values demonstrate action/posture sensitivity. **HFI-04B does not adopt any of them as an Ovid’s House limit.**

### 4.2 `HFI-SRC-N02` — Approved Document M Volume 1

Current England dwelling guidance keeps M4 categories distinct. Category-specific provisions give useful external reference points but do not become universal HFI rules.

Relevant mechanisms include:

- accessible approach/leading-edge geometry in the higher-access categories;
- category-specific window-handle reach provisions, including remote-operation alternatives where handles are outside the stated range;
- category-3 guidance that door handles/locks/latches/catches should be easy to grip/use and located within its specified band;
- category-3 power-assisted opening trigger where specified entrance-door opening forces exceed the stated force profile.

HFI takes the mechanism seriously — **approach + reach + operation + moving leaf must work together** — without treating M4(3) geometry or force thresholds as a universal private-house optimum.

### 4.3 `HFI-SRC-N06` — Approved Document Q

Approved Document Q requires relevant new-dwelling doors/windows to resist physical attack and use appropriate hardware.

This is a hard boundary against simplistic HFI reasoning:

> **a lock or closure is not “low-friction” if making it easier to operate destroys required security performance.**

HFI-04B can seek lower-burden operation **within** security duty; it cannot silently waive the duty.

### 4.4 `HFI-SRC-A07` / `HFI-SRC-R01` — government Part M research

The government-commissioned Arup/Loughborough work remains research, not government policy/guidance.

Its doors/windows focus study is particularly important because it tested **approach geometry and force actions together**. The study included 63 participants across five sites for the door/window work, overwhelmingly wheeled-mobility-aid users (61) with only two ambulant-disabled participants; the report explicitly says the ambulant-disabled sample was too small for separate conclusions.

The study:

- measured approach width by hand used;
- measured anterior and lateral push, pull and downward handle forces separately;
- found left-hand operation required larger approach width in the sampled conditions;
- found substantial differences among force actions/postures;
- explicitly recommended further research into door/window handle profiles, locking facilities and sliding-door operation.

That last point matters: the report itself does **not** justify treating one tested mock-handle configuration as the final answer.

---

## 5. Additional topic evidence

These records extend the HFI evidence architecture for the bounded 04B question.

### `HFI-SRC-HW01` — Nersveen 2016 door-opening force study

- **Source:** Jonny Nersveen, *Experimental Studies of Wheelchair and Walker Users Passing Through Doors with Different Opening Force*.
- **Date/version:** 2016; *Studies in Health Technology and Informatics* 229, 612–614; DOI `10.3233/978-1-61499-684-2-612`.
- **Population/context:** users of walkers and several wheelchair categories in Norway; short conference paper.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** perceived acceptability of whole-door opening force for mobility-aid users.
- **Useful findings:** 94.7% of wheelchair users described `30 N` as acceptable and 92.1% described `40 N` as acceptable; walker-user figures were 100% and 87.5% respectively.
- **Known limits/nonclaims:** abstract/public metadata do not expose enough sample/task detail to derive a house threshold; reported acceptability is not the same construct as lower-tail maximum force or repeated low-friction operation. The apparent difference from A07 usefully demonstrates why unlike experiments must not be collapsed into one magic number.
- **Access state:** PubMed metadata/abstract; proceedings metadata publicly indexed.
- **Checked:** 2026-10-19.
- **Canonical location:** https://pubmed.ncbi.nlm.nih.gov/27534356/

### `HFI-SRC-HW02` — Paschoarelli et al. 2012 door-handle effort-perception study

- **Source:** Luis Carlos Paschoarelli, Raquel Santos, Paula Bruno, *Influence of door handles design in effort perception: accessibility and usability*.
- **Date/version:** 2012; *Work* 41(S1); DOI `10.3233/WOR-2012-0771-4825`.
- **Population/context:** 180 Portuguese participants of both sexes across three age groups; simulated operation of five different door-handle forms.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** whether handle form materially changes perceived effort even where “door operation” is treated as one nominal task.
- **Useful findings:** perceived effort differed among handle designs; the paper concludes handle design can materially affect accessibility/usability.
- **Known limits/nonclaims:** subjective effort, simulated task and source-specific handle designs; this packet does not infer a universal lever geometry from the abstract.
- **Access state:** PubMed/SAGE abstract and metadata.
- **Checked:** 2026-10-19.
- **Canonical location:** https://pubmed.ncbi.nlm.nih.gov/22317464/

### `HFI-SRC-HW03` — Tanaka et al. 2004 sliding-door force × handle-form experiment

- **Source:** Shinji Tanaka et al., *Relationship between Applied Force and the Shape and Dimensions of the Operating Part of Sliding Doors Considering Use by Elderly People*.
- **Date/version:** 2004; *Japanese Journal of Medical Electronics and Biological Engineering* 42(4), 347–353; DOI `10.11239/jsmbe2002.42.347`.
- **Population/context:** force measurement with 18 younger/older adults and sensory evaluation with 16 younger/older adults; full-size mock sliding door; `10/20/30 N` operating-force conditions and several handle/grip forms.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** interaction between sliding resistance and the geometry available to grasp/pull.
- **Useful findings:** `10 N` was rated highly and `30 N` poorly regardless of tested handle; at `20 N`, handle form mattered materially, with shallow grips assessed less favourably and the tested bar handle more favourably.
- **Known limits/nonclaims:** small Japanese sample, sliding-door task, 2004 study and specific hardware geometry. It supports **force × grip-form interaction**, not a universal `10 N` target or mandatory bar handle.
- **Access state:** open J-STAGE abstract/full article.
- **Checked:** 2026-10-19.
- **Canonical location:** https://doi.org/10.11239/jsmbe2002.42.347

### `HFI-SRC-HW04` — Kubo et al. 2017 wheelchair/sliding-door movement analysis

- **Source:** Akiko Kubo, Masafumi Yoneda, Masashi Soeda, *Analysis of movements of wheelchair caused by counterforce and wheelchair users' upper body on opening and closing a sliding door*.
- **Date/version:** 2017; *Journal of Architecture and Planning (Transactions of AIJ)* 82(734), 905–915; DOI `10.3130/aija.82.905`.
- **Population/context:** experimental wheelchair/sliding-door task over several approach angles; healthy adults were used to examine upper-body movement/counterforce mechanics, with wheelchair-user applicability bounded by the authors.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** approach direction, reach, counterforce and unintended chair/body movement during sliding-door use.
- **Useful findings:** approach direction changed whether users had to reach backward or bend forward; counterforce could move/rotate the wheelchair; the study therefore supports treating handle reach and door resistance as a coupled body–device interaction rather than independent dimensions.
- **Known limits/nonclaims:** healthy experimental participants and a specific sliding-door setup; does not prove sliding doors universally better than hinged doors or establish a domestic clear-space target.
- **Access state:** open J-STAGE article/abstract.
- **Checked:** 2026-10-19.
- **Canonical location:** https://doi.org/10.3130/aija.82.905

### `HFI-SRC-HW05` — 2015 hinged-door closer/torque experiment

- **Source:** *Design of the force measuring system for the hinged door: Analysis of the required operating torque*.
- **Date/version:** 2015; *International Journal of Industrial Ergonomics* 49, 1–10; DOI `10.1016/j.ergon.2015.05.010`.
- **Population/context:** laboratory hinged-door operating-force/torque measurement with and without door closers.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** force profile through a hinged-door opening cycle and effect of closer mechanics.
- **Useful findings:** use of a closer materially increased required operating torque; the measured task contained distinct initial and continuing operating demands rather than one constant force. The paper also describes multi-motion wheelchair strategies for hinged doors with closers.
- **Known limits/nonclaims:** engineering/laboratory study; does not determine whether a closer is technically required, does not set Ovid’s House force limits and must not override fire/security ownership.
- **Access state:** journal abstract/highlights publicly accessible.
- **Checked:** 2026-10-19.
- **Canonical location:** https://doi.org/10.1016/j.ergon.2015.05.010

### `HFI-SRC-HW06` — Oates 1970 experimental window-opening study

- **Source:** J. M. Oates, *Opening windows*.
- **Date/version:** 1970; *Applied Ergonomics* 1(5), 270–272; DOI `10.1016/0003-6870(70)90076-1`.
- **Population/context:** experimental study of user acceptance of window-handle heights and opening forces.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Applicability:** direct evidence that window operability is jointly affected by handle position and opening effort.
- **Useful findings:** the study experimentally examined both variables and their user acceptance rather than treating reach alone as sufficient.
- **Known limits/nonclaims:** very old evidence; public abstract does not expose enough sample/results for numeric target adoption; product/window technology and population context are dated. Use only as mechanism/history, not as current target evidence.
- **Access state:** PubMed metadata/abstract.
- **Checked:** 2026-10-19.
- **Canonical location:** https://pubmed.ncbi.nlm.nih.gov/15676338/

---

## 6. Door/window operation ledger

HFI-04B adopts an **action ledger**, not a numerical “interface friction” score.

| Event | Meaning |
|---|---|
| `APPROACH` | reach a usable position relative to handle and moving leaf/sash |
| `POSITION` | orient body/mobility aid/load for operation |
| `REACH-GRASP` | reach and establish the required grip/contact |
| `UNLOCK` | release security/privacy lock where present |
| `UNLATCH` | release latch/catch/espagnolette or equivalent closure |
| `INITIATE` | overcome seal/static/closer resistance and begin movement |
| `CONTROL-MOTION` | continue and restrain leaf/sash movement through useful travel |
| `PASS-USE` | pass through door or obtain intended window opening state |
| `REPOSITION` | retreat, advance, swap hand, brace or otherwise change body/device position materially |
| `CLOSE` | recover the leaf/sash to closed position |
| `RELATCH-LOCK` | restore latch/security/privacy state |
| `CONFIRM` | obtain adequate visual/tactile/audible state feedback |

Not every material occurrence is a defect. The ledger exposes where burden/hazard is concentrated.

**Do not sum events into a score.** One high-force pull while balancing or one forced backward wheelchair movement can matter more than several benign latch actions.

---

## 7. Operating effort is a profile, not one number

### 7.1 Separate the actions

A complete door can impose several different effort demands:

- key/cylinder or thumbturn torque;
- lever depression / latch retraction;
- initial seal/closer/static breakaway;
- push or pull through the opening arc;
- sustained control against a closer;
- restraint against rebound/wind;
- final compression to latch/weatherseal;
- relocking.

A product advertised with one “opening force” can therefore conceal the action that actually governs usability.

### 7.2 Force varies through travel

HW05 supports the engineering point that a closer can create distinct initial and continuing torque demands. Approved Document M’s category-specific force profile likewise distinguishes parts of the door-opening arc rather than assuming constant force.

Therefore later HFI-06C target work, if numeric limits are earned, should specify **what action and what part of travel** the value governs.

### 7.3 Low effort remains a design direction, not an unlimited priority

Reducing unnecessary operating burden has broad benefit and generally low architectural downside. But the required force/closure state may be constrained by:

- security;
- fire/smoke containment where applicable;
- weather seals and pressure;
- wind exposure;
- acoustic seals;
- sash/leaf size and hardware durability;
- child/safety restrictors where applicable.

HFI therefore rejects both extremes:

- “make every moving element as light as physically possible”; and
- “if it technically opens, the effort is acceptable”.

HFI-05C must reconcile these duties before HFI-06C can form targets.

---

## 8. Grip, manipulation and one-handed use

### 8.1 Handle form changes the task

HW02 and HW03 directly support the proposition that the geometry presented to the hand changes perceived/usual effort.

The correct mechanism is broader than “lever handles are accessible”:

- adequate contact area can reduce dependence on fingertip pinch;
- a lever can convert wrist/hand action differently from a round knob;
- shallow recessed pulls can become difficult as sliding resistance rises;
- smooth/small profiles may become harder under reduced grip or wet/gloved conditions;
- a long accessible operating zone can change approach options.

HFI-04B does not freeze a universal handle form.

### 8.2 Compound actions deserve suspicion

Interfaces are harder when they require simultaneous combinations such as:

`grip + twist + pull`, `pinch + slide + lift`, or `hold leaf + manipulate lock`.

This is especially relevant to:

- `S-ONEHAND`;
- `S-DEX`;
- `S-UPPER`;
- hands-busy domestic routes;
- mobility-aid users who may need the other hand for device control/stability.

Later audit should record the compound action explicitly rather than merely label the hardware “operable”.

### 8.3 One-handed operation is not the same as one free hand

`HFI-SC-USE-03` tests a one-handed sequence. `HFI-SC-ARR-05`/`LOG-05` test occupied/divided-attention states. `USE-13` tests upper-limb impairment.

These can fail for different reasons:

- occupied opposite hand → inability to steady the leaf while unlatching;
- impaired side → cross-body reach to the only practical handle side;
- mobility aid → need to control chair/walker while the closer returns;
- carrying child/tray → load may block view and remove safe regrip/set-down options.

HFI keeps these states separate.

---

## 9. Swing and movement geometry are dynamic

### 9.1 Static clear width is necessary but incomplete

A door may have adequate clear opening width after it is open while still forcing this sequence:

`approach → reach handle → retreat into circulation to clear leaf → pull → swap/regrip → move around leaf → pass → recover door`

The relevant occupied geometry therefore includes:

- body/device envelope;
- handle-reach position;
- leaf swept area;
- leading-edge space;
- destination-side clear state;
- door return/closer behaviour;
- carried-load envelope;
- simultaneous adjacent-door conflicts.

HFI-03A owns circulation geometry; HFI-04B adds the moving-interface sequence.

### 9.2 The leaf can become an active hazard/load

A heavy or self-returning leaf is not passive geometry. The user may need to:

- resist spring/closer return;
- prevent impact with body/device;
- hold it while moving through;
- reopen after insufficient travel;
- brace against floor/wall/device.

HW05 and the mobility-aid studies justify representing this explicitly.

### 9.3 Sliding is not a universal answer

Sliding doors can remove hinged-leaf swept area, but HW03/HW04 show their operation still depends on:

- pull resistance;
- grip form;
- approach direction;
- counterforce;
- usable opening travel;
- closure/lock operation.

They also introduce architectural questions outside pure ergonomics: pocket/track maintainability, acoustic/privacy performance, threshold/weathering for exterior sliders and security hardware.

Therefore:

> **choose hinged/sliding/folding operation by the whole interface duty, not by the slogan that one type is inherently accessible.**

---

## 10. Windows are complete reach–motion–return tasks

### 10.1 Handle reach does not prove operability

A handle inside a nominal reach band can still fail if the user must:

- lean across deep furniture/radiator/cill;
- produce high wrist/lever torque;
- release several catches;
- push an outward sash beyond stable reach;
- pull a sash back from a position now farther away;
- hold one element while operating another;
- visually guess whether multi-point hardware is fully engaged.

This is particularly important because opening changes the geometry for **closing**. HFI must test the return task, not just the first touch.

### 10.2 Remote operation is an adaptation, not a free ergonomic win

Approved Document M already recognises remote opening as an alternative in some reach contexts.

A remote/manual operator can reduce reach demand, but may introduce:

- another control/interface;
- greater mechanism complexity;
- maintenance/failure modes;
- loss of intuitive direct manipulation;
- electrical dependence if powered.

HFI therefore treats remote operation as a legitimate tool where direct operation cannot be made low-friction, not a default reason to place ordinary handles badly.

### 10.3 Ventilation ownership remains separate

HFI-04B asks whether an operable window can be used. It does not decide the dwelling’s ventilation strategy or assume that a particular window must be manually operated to satisfy Part F.

HFI-04C and the ventilation/service owners remain responsible for environmental-control strategy.

---

## 11. Latching, locking, closure and feedback

The task is incomplete when the leaf merely moves.

Later audit must distinguish:

- open / partly open / closed;
- latched / unlatched;
- locked / unlocked;
- restricted / unrestricted where applicable;
- privacy lock state;
- multi-point engagement where applicable.

A user may physically complete the motion but remain uncertain whether the door/window is secure or properly latched.

HFI therefore records `CONFIRM` as a real event.

Potential feedback includes:

- visible hardware position;
- tactile detent/stop;
- audible latch engagement;
- mechanically obvious end state.

This packet does **not** prescribe a signal language or require noisy hardware. It establishes the bounded principle:

> **where closure/lock state matters, the interface should not make correct completion unnecessarily ambiguous.**

Confidence is lower here than for force/approach evidence; HFI-06 should not invent a quantitative “feedback” target.

---

## 12. Hands-busy domestic operation

HFI-03D established that doors sit inside real task chains involving groceries, waste, cleaning, laundry, care and garden serving.

For those routes, a door can create friction by forcing:

- load set-down;
- freeing a hand;
- repeated regrip;
- backward movement while carrying;
- body/leaf conflict;
- loss of visual field;
- closure while the load is still in the opening.

The correct conclusion is **not** “remove every internal door”. Doors may be justified by fire, privacy, acoustics, smells, moisture, security or thermal zoning.

The HFI question is narrower:

> **where a door is justified on a frequent hands-busy route, can its ordinary operating sequence avoid unnecessary compound handling?**

That question carries forward to HFI-05 proportionality and HFI-07 audit.

---

## 13. Proportionality findings

| Proposition | Benefit / mechanism | Burden/conflict | Current HFI posture |
|---|---|---|---|
| test complete door/window action sequence | exposes reach/force/swing/lock failures hidden by isolated dimensions | low analytical burden | **adopt as audit method** |
| prefer hardware that reduces fine pinch/high wrist torque/compound manipulation where technically compatible | broad capability benefit; low spatial burden | hardware/security/detail coordination | **strong candidate for HFI-06C target formation** |
| use one universal door-opening-force number | simple specification | erases action, travel, closer, security/fire/weathering and population context | **reject** |
| copy M4(3) force/handle geometry into every domestic interface | established category-specific route | category mismatch / unnecessary universalisation | **reject** |
| eliminate all self-closing/heavy doors | removes operating burden | can violate fire/security/weathering duty | **reject** |
| make all doors sliding | removes swing envelope | track/pocket/force/privacy/security/maintenance consequences | **reject** |
| make frequent doors operable in a one-hand scenario where technically compatible | reduces regrip/set-down and improves resilience to upper-limb variance | modest hardware/layout implications | **strong candidate; exact conditions later** |
| model window closing as well as opening | prevents “reachable to open, unreachable to close” defect | low analytical burden | **adopt as audit requirement** |
| remote-operate all windows | solves some reach problems | complexity, maintenance and failure burden | **reject as universal rule; legitimate demand-led solution** |
| preserve clear confirmation of important latch/lock state | reduces uncertainty/repeated checking | hardware-specific | **adopt as qualitative audit field** |

No row is a final numeric HFI target.

---

## 14. HFI-07 audit representation

Later Reference House audit should represent doors/windows through named task facts rather than a single width/handle-height/force field.

### Door

Where source data exists, audit should be able to ask:

- door purpose/type and whether closure is technically required;
- pull/push direction and approach side;
- clear opening width **and** handle-operating position;
- leading/following-side room for the tested scenario;
- leaf sweep relative to body/device/load;
- hardware/grip class;
- latch/lock sequence and whether compound manipulation is required;
- opening-effort profile where known;
- closer/return behaviour where present;
- one-handed completion feasibility;
- hands-busy set-down/regrip consequence;
- confirmation of latched/locked state.

### Window

Where source data exists, audit should be able to ask:

- operable-sash type and intended task;
- approach obstruction/depth;
- handle position and actual reachable posture;
- handle/lock manipulation sequence;
- opening effort/torque where known;
- sash travel relative to reach;
- ability to recover/close/relock after opening;
- restrictor/safety interaction where present;
- remote-operation provision where relevant;
- confirmation of secure closure.

Missing source data remains `NOT-MODELLED` in HFI-07. **Do not invent a hardware schedule to manufacture a pass.**

No combined interface-friction score is authorised.

---

## 15. Reference House implications — no verdict yet

### 15.1 Internal doors

Current source authority does not freeze enough hardware/force detail for an HFI verdict.

HFI-07 should particularly test doors that sit on:

- principal circulation;
- frequent hands-busy routes;
- sanitary routes;
- any location where adjacent turns/leaf swings stack with another movement demand.

A cased opening or doorless route may be lower-friction where no duty requires a door, but HFI-04B does not redesign the plan.

### 15.2 Principal entrance and garden/courtyard doors

These interfaces combine the highest number of duties:

- security;
- weathering;
- threshold/drainage;
- potentially greater leaf/seal resistance;
- carrying/garden-serving tasks;
- mobility-aid approach;
- locking/unlocking;
- external conditions such as wind.

They are therefore **high-value HFI-07 audit cases**, not assumed failures.

### 15.3 Windows

The present Reference House has a credible replaceable-window tectonic strategy but insufficient frozen operational geometry/hardware to prove ordinary low-friction use.

HFI-07 should not infer operability from `OW-01` alone.

---

## 16. Rejected hypotheses and shortcuts

HFI-04B explicitly rejects:

1. **“Handle is in reach, therefore the door/window is usable.”** Reach is only one event in the sequence.
2. **“Clear opening width proves door usability.”** The user must first operate and control the moving leaf.
3. **“One opening-force number describes a door.”** Latch, breakaway, opening arc, closer, hold/control and relatch can be different demands.
4. **“Use the strongest/average person who can open it.”** Lower-capability tails and repeated operation matter; HFI-02A already rejects this logic.
5. **“30 N/22.5 N is the universal domestic answer.”** Those numbers belong to defined guidance contexts and conflict with other empirical constructs; HFI-06C must derive any project target deliberately.
6. **“Lever handle = solved.”** Form, grip area, latch force, approach, lock sequence and leaf motion still matter.
7. **“Sliding doors are inherently accessible.”** They remove swing area but retain force/reach/counterforce/locking/maintenance questions.
8. **“Remote window operation is always better.”** It can solve reach but adds mechanism/control/failure burden.
9. **“Remove doors from loaded routes.”** Privacy, fire, acoustics, smell, moisture, security and thermal duties can justify them.
10. **“Easy operation may weaken locks/seals.”** HFI optimises within security/fire/weathering duty; it does not waive them.
11. **“Opening is the task.”** Closing, relatching/relocking and confirmation are part of the task.
12. **“The current RH passes because RH-09 made doors/windows replaceable.”** Lifecycle serviceability and human operability are separate propositions.

---

## 17. Evidence confidence

| Finding | Confidence | Reason |
|---|---|---|
| approach geometry and hand/side materially interact with door/window use | `E-MODERATE/HIGH` | direct government experimental evidence; sample heavily wheeled-mobility-aid based |
| operating effort is action/posture/travel specific rather than one generic force | `E-HIGH` | HFI-02A + government force study + closer mechanics evidence |
| handle/grip geometry materially changes perceived/usual operating burden | `E-MODERATE` | multiple empirical handle studies; populations/tasks/hardware vary |
| closer/return behaviour can materially increase operating burden and multi-motion handling | `E-MODERATE` | engineering experiment + mobility-aid task evidence |
| one-handed/compound manipulation should be audited explicitly | `E-MODERATE` | ergonomic mechanism + current guidance convergence; exact universal hardware form not derived |
| sliding-door usability depends on approach, grip, resistance and counterforce | `E-MODERATE` | direct experimental studies; specific Japanese setups limit generalisation |
| window usability must include the close/relock return task | `E-MODERATE` | strong sequence logic + reach/motion evidence; limited modern dwelling-specific quantitative studies |
| important latch/lock state should provide unambiguous completion feedback | `E-LOW/MODERATE` | strong human-factors logic but thinner direct dwelling hardware evidence in this packet |
| one universal domestic opening-force target is justified now | **rejected** | evidence constructs, interface duties and population/task contexts differ |

---

## 18. Computational consequence

HFI-04B identifies a bounded future representation opportunity only.

Potential source facts include:

- `door_id` / `window_id`;
- operation type;
- leaf/sash motion geometry;
- handle/lock side and position;
- latch/lock state sequence;
- closer/return state;
- hardware/grip class;
- approach/use zones;
- tested operating-force/torque data with action/travel metadata where genuinely available;
- scenario-specific one-hand/hands-busy relationships.

It does **not** authorise compiler work, a universal `max_door_force`, automatic accessibility proof or HFI score.

Any future machine rule must carry its category and technical context. For example, an M4(3) entrance-door power-assistance threshold must never silently become an Ovid’s House rule for every internal door merely because it is easy to encode.

---

## 19. Closeout

**Packet:** HFI-04B — doors, windows and hardware  
**Research-start baseline:** `552bc8fb84379287a032cd7f7e18cef74c03bcc9`  
**Exact question answered:** doors/windows/hardware must be analysed as complete body–hardware–moving-element action sequences covering approach, grip/manipulation, moving resistance, body/leaf interaction, closure/locking and feedback rather than isolated handle heights, clear widths or a single force number.  
**Evidence:** HFI-02A; current Approved Documents M/Q; government Part M doors/windows research; six bounded topic sources covering mobility-aid door force, handle-form effort, sliding-door force/grip, wheelchair counterforce/approach, hinged-door closer torque and experimental window operation.  
**Findings:** adopts a door/window action ledger; treats effort as action/travel specific; exposes one-handed and compound manipulation; models swing as dynamic occupied geometry; rejects universal sliding-door/lever-handle/remote-window shortcuts; requires the close/relock return task to be audited; preserves security/fire/weathering/ventilation ownership.  
**Artefact:** this record only.  
**Checks:** no Reference House geometry, doorset/window product, hardware selection, numeric HFI target, doctrine, pattern, compiler proof, publication content or maturity state changed.  
**Authority/maturity consequence:** research method advances; no downstream architectural authority is superseded and no RH rewind is authorised.  
**Stale downstream items:** none created; HFI-07 now has explicit door/window/hardware audit fields.  
**Exact next packet:** **HFI-04C — environmental/electrical controls.**
