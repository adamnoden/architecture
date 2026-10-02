# House Design Doctrine — Pattern Register v0.2

**Purpose:** evidence and maturity control before detail design.  
**Change from v0.1:** adds proportionality, boundary debt, maintenance/replacement/disassembly distinctions and explicit next-proof requirements.

## Status system

**Established** — mature professional practice or direct regulatory/guidance basis.  
**Supported** — strong precedent and technical rationale, but project-dependent.  
**Proposed** — plausible architectural synthesis needing project validation.  
**Experimental** — should not be promoted without modelling, cost review and/or physical prototype.

A second maturity track should later record: **drawn / calculated / costed / mocked-up / maintenance-tested / built / observed in use**.

| # | Pattern | Status | Publication position | Required next proof |
|---:|---|---|---|---|
| 1 | Controlled utility entry | **Established** | Core pattern. Consolidate incoming penetrations where practical; reserve only justified spare capacity. | Utility-company constraints; fire/water/pest detail; cost. |
| 2 | Plant room as service hub | **Established** | Core strategy where plant density warrants it. Access must include withdrawal route. | Equipment schedule; replacement envelopes; heat/noise/drainage study. |
| 3 | Accessible primary riser | **Supported** | Keep, but remove “walk-in” as default wording. Size to actual maintenance tasks plus justified growth. | Sectional options; fire/acoustic compartmentation; net-area cost. |
| 4 | Horizontal service spine | **Supported** | Strong architectural strategy. Corridor or service edge preferred only where plan supports it. | Route study across alternative plans; boundary crossings. |
| 5 | High-service-room service wall | **Supported** | Strong. Prioritise back-access to high-risk components rather than universal demountability. | Full bathroom/kitchen mock-up; acoustic/fire/waterproofing interfaces. |
| 6 | Whole-house service undercroft | **Experimental domestically** | Do not assume. Treat as one sectional option for the reference house. | Six-way options appraisal; hygrothermal analysis; fire/acoustic/pest; QS/WLC. |
| 7 | Local structural service drop | **Supported** | Likely stronger domestic default than #6 for wet rooms and large drainage. | Structural coordination; ceiling-height composition; acoustic test. |
| 8 | Service skirting | **Proposed / supported components** | Keep as signature pattern for power/data; not universal route for all services. | 1:1 mock-up; BS 7671 design; impact/fire/acoustic/cleaning review. |
| 9 | Architectural vertical electrical route | **Proposed** | Use removable architrave/panelling selectively for switches and controls. | 1:1 joinery prototype; wiring-space and fixing review. |
| 10 | Designed structural penetration | **Established** | Core. Pre-coordinate penetrations instead of later drilling/chasing. | Structural schedule; fire/acoustic/air/water collar family. |
| 11 | Compartmented service void | **Established principle** | Non-negotiable where routes cross fire/acoustic/pest boundaries. | Boundary schedule and inspectable penetration details. |
| 12 | Water manifold / local isolation | **Established** | Core water strategy where appropriate. Avoid unnecessary valve proliferation. | Hydraulic sizing; stagnation/dead-leg review; access mock-up. |
| 13 | Withdrawable pipe or conduit run | **Supported / established ingredients** | Strong where service life is materially shorter than enclosure. | Demonstrate actual pulling/removal geometry at bends and terminations. |
| 14 | Water-damage-safe service route | **Established principle** | Promote strongly. Implementation may be pipe-in-pipe, drained cabinet, local tray, accessible route or other equivalent. | UK system selection; drainage/drying and cleaning detail. |
| 15 | Detectable leak path / tell-tale | **Supported** | Keep as a family, not “external tell-tale everywhere”. | Freeze/stain/pest/hygiene analysis; sensor/auto-isolation comparison. |
| 16 | Wet-service utility room | **Supported** | Strong for laundry/utility plant. | Threshold/accessibility detail; floor drain/trap strategy; flood test. |
| 17 | Local removable floor access panel | **Established** | Keep. Use only where floor boundaries can be reliably reinstated. | Load/deflection; acoustic/rattle; edge wear; lifting trial. |
| 18 | Service access band / border | **Proposed / supported** | Preferred experimental domestic direction over a full removable field. | Full-scale room-edge mock-up; furniture/use conflict; acoustics. |
| 19 | Full removable domestic floor field | **Experimental** | Do not promote as normal solution. | 1:1 room prototype plus long-duration squeak/rattle/edge-wear trial; QS. |
| 20 | Permanent opening / replaceable window | **Supported** | Strong architectural pattern. | 1:1 jamb/sill/head prototype; thermal/water/air test; replacement sequence. |
| 21 | Permanent opening / replaceable door | **Supported** | Strong and relatively low risk. | Threshold/weathering prototype for external door; acoustic/security review. |
| 22 | Movement / slip junction | **Established principle** | Core interface family. Expression may be conventional or architectural. | Engineer movement allowances; decoration and cleaning review. |
| 23 | Functional cornice slip joint | **Experimental** | Signature research detail only. | Full room-corner mock-up; seasonal movement simulation; acoustic/fire review. |
| 24 | Perimeter dry zone | **Supported / site-dependent** | Keep as landscape/building-interface pattern, not mandatory moat. | Ground/site drainage design; accessibility; leaf/sediment/pest maintenance. |
| 25 | Accessible rainwater route | **Established principle** | Core. External/visible systems often advantageous; gutterless eaves only by climate/site analysis. | Rainfall sizing; overflow scenarios; roof-access plan. |
| 26 | Source-capture kitchen extract | **Established** | Core environmental pattern. | Hood capture geometry; replacement air; noise; cleaning route; commissioning. |
| 27 | Quiet bathroom terminal + remote fan | **Supported** | Strong option, not mandated system type. | Airflow/noise calculation; condensate; duct cleaning and replacement route. |
| 28 | Designed fixing infrastructure | **Established + proposed extension** | Keep selectively. Traditional picture rail is low-risk; heavy concealed rail is project-specific. | Load classes; fixing detail; no-drill/service coordination. |
| 29 | Roof maintenance route | **Established principle** | Core where maintainable roof items remain. Eliminate avoidable roof plant first. | Work-at-height strategy; rescue/access; replacement/lifting route. |
| 30 | Physical service index | **Proposed** | Distinctive but intentionally small. Stable IDs physically; detailed data digitally. | Information architecture; change-control procedure; mock-up with trades. |

## Four mandatory tests for every pattern

### 1. Proportionality
What future event does the pattern serve? Estimate its frequency, consequence and retrofit difficulty. Compare that benefit with permanent cost, material, floor area and whole-life carbon.

### 2. Boundary debt
Which boundaries does the pattern interrupt: structure, fire, smoke, sound, air, vapour, water, thermal, pest, security? Show how each is restored after access.

### 3. Service-life task
Distinguish explicitly:
- inspection/maintenance;
- component repair;
- component replacement;
- major refurbishment;
- end-of-life disassembly/recovery.

A pattern good at one is not automatically good at the others.

### 4. Proof
A pattern cannot advance in maturity because it looks convincing in a diagram. Appropriate proof may include calculation, hygrothermal modelling, acoustic testing, flood testing, 1:1 mock-up, maintenance trial, cost plan, whole-life-carbon comparison or observed built precedent.

## Emerging reference-house baseline

Unless later work disproves it, the defensible baseline is now:

- a compact but genuinely maintainable plant/service hub;
- one principal accessible riser rather than a walk-in shaft by ideology;
- corridor/service-edge horizontal distribution;
- local deep service zones below wet rooms;
- back-access service walls in high-service rooms;
- removable architectural routes for power/data where they add value;
- conventional robust floors with selective access rather than universal cassettes;
- water-damage-safe distribution and local isolation chosen by risk;
- permanent masonry/openings protected from routine service renewal;
- compartmentation at every important service boundary;
- digital building passport plus a deliberately small physical service index.

This is a stronger proposition than the earlier “heroic servicing” direction: **ordinary building technology is reorganised so that predictable change is spatially and materially decoupled from enduring architecture.**