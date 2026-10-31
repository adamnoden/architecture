# Reference House — RH-11 Structural Review Brief

**Status:** ready for competent structural-engineer review  
**Parent pack:** [RH-11 External Review Brief](external-review-brief.md)  
**Current project maturity:** M3 coordinated virtual design; **no structural adequacy claim**

## Review question

> **Can the selected architectural geometry be carried by the RH-05 short-span masonry-ring concept without disproportionate member depth, transfer structure, unstable masonry, unacceptable service penetrations or roof/PV structure that materially rewrites the house?**

The project is seeking a structural red team, not member design by correspondence.

---

## 1. Controlled assumptions to attack

### Primary vertical structure

Working family:

- loadbearing inner leaf of outer masonry envelope;
- loadbearing inner leaf of courtyard envelope;
- facing masonry / cavity / insulation treated as envelope layers rather than assumed gravity structure;
- non-loadbearing internal room partitions unless a later engineered reason says otherwise.

RH-10 envelope planning family is **400–425 mm overall**, with **450 mm** as a geometry stress limit. A roughly **140 mm-class inner masonry leaf** is only the first robust comparator, not a selected structural thickness.

### First-floor structure

Working topology:

- west/east strips span approximately **4.2 m gross** between outer and courtyard structural lines;
- south/north central strips span approximately **3.4 m gross**;
- four approximately **3.4 m** edge-beam conditions continue the courtyard support lines across front/rear wings:
  - `EB-W-S`
  - `EB-E-S`
  - `EB-W-N`
  - `EB-E-N`;
- stair opening `ST-01` uses local trimmers;
- `PEN-SV-01` creates the principal framed service opening;
- structural deck remains the diaphragm independently of any changeable finish layer.

### Floor depth

Architectural control:

- ground clear ceiling: +2950 mm;
- first-floor FFL: +3300 mm;
- **350 mm total floor/service/ceiling zone**.

The first engineering comparator is an engineered-timber / I-joist family around the 300 mm class. This has not been sized.

### Roof

RH-08/RH-10 replace the earlier pitched-roof preference with four very-low-slope roof fields draining outward from the courtyard.

Structural expectation:

- preserve the same short-span outer-wall ↔ courtyard-wall logic where practical;
- coordinate low-slope deck, parapet/coping and diaphragm;
- carry a distributed **~50 m² PV-capable reservation** without assuming exact module/ballast/mounting loads;
- keep primary drainage geometry intact;
- no large roof transfer frame is intended.

### Protected zones

Do not assume future service drilling through:

- courtyard corner reaction nodes;
- `EB-*` edge beams;
- stair trimmers;
- opening bearing / lintel zones;
- structural deck/diaphragm outside engineered openings.

The current [Service Crossing Register](service-crossing-register-rh06.md) should be treated as proposed openings requiring structural acceptance, not pre-approved holes.

---

## 2. Review documents / drawings

Primary:

1. [RH-05 Structural Coordination](structural-coordination.md)
2. [RH-05 Structural Concept Overlay](structural-concept-overlay.svg)
3. [RH-10 Whole-House Coordination Audit](whole-house-coordination-audit.md)
4. [RH-10 Envelope Coordination](envelope-coordination-rh10.md)
5. [RH-10 Energy / Heat / Renewable Coordination](energy-heat-coordination-rh10.md)
6. [RH-08 Roof / Drainage / Access](roof-drainage-access-rh08.md)
7. [RH-08 Roof / Drainage Plan](roof-drainage-plan-rh08.svg)
8. [Service Crossing Register](service-crossing-register-rh06.md)
9. [RH-04 front elevation](front-elevation-study.svg) and [courtyard elevations](courtyard-elevations-study.svg)
10. [RH-10 outer elevation coordination](outer-elevation-coordination-rh10.md)

Prototype dependency:

- [Tectonic Prototype Programme — P03 Structural Floor Edge](../development/tectonic-prototype-programme.md)

---

## 3. Questions requiring a structural answer

### Load path / stability

1. Is the basic **outer masonry + courtyard masonry + short-span floor ring** a credible primary structure for a two-storey house of this geometry?
2. Is there any missing global stability / robustness action that makes the apparently simple ring misleading?
3. Can the courtyard walls reasonably remain loadbearing through the current opening families without requiring a concealed independent frame?
4. Are the four courtyard corner nodes likely to become structurally disproportionate because they collect wall, floor-edge, roof and diaphragm reactions?

### Floor framing

5. Is a 4.2 m engineered-timber floor span compatible in principle with the current **350 mm architectural floor zone** once strength, vibration, deflection, fire and acoustic build-up are considered?
6. Are the four `EB-*` edge-beam conditions genuinely ordinary/local, or are their reactions/connections likely to become transfer structures in disguise?
7. Does the three-flight stair opening create any load-path or diaphragm problem not captured by RH-05?
8. Is the approximately **1050 × 850 mm** starting opening around `SV-01` plausible without compromising the short-span floor system?

### Masonry / openings

9. Does the RH-04 four-bay front leave credible pier/bearing geometry once a real loadbearing inner leaf and lintels are designed?
10. Do the courtyard north/south broad openings and east/west opening rhythms leave adequate structural wall/pier behaviour, or is any façade currently over-opened?
11. Is a 140 mm-class dense masonry inner leaf a sensible first comparator, or should the project test a materially different thickness/block family?
12. Are there differential-movement / restraint implications at the masonry ↔ engineered-timber interfaces that should alter the P03 prototype scope?

### Roof / PV

13. Can the outward-draining low-slope roof follow the same short-span structural logic without excessive depth or steelwork?
14. What roof framing / deck families are most credible if the outer cornice datum and courtyard high edge are to stay visually quiet?
15. Does a ~50 m² PV reserve create a material loading, local concentration, wind-uplift or mounting issue that should change the roof concept before product layout?
16. Are parapet/coping and gutter-edge support loads being underestimated as architectural trim rather than structural edge conditions?

### Foundations / ground

17. With no real ground/site, is there any foundation assumption embedded in the current load-path concept that is unsafe even as a virtual baseline?
18. Does the courtyard/outer-wall ring create differential-settlement sensitivity worth recording now?
19. Are the foul/courtyard drain crossings likely to create avoidable foundation complications that should alter their current locations?

---

## 4. Required red-team cases

Please test at least these ordinary adverse cases.

### S-RT1 — floor depth fails

Assume vibration/fire/acoustic design pushes the repeated floor zone materially beyond **350 mm**.

- What is the credible required depth?
- Can the difference be localised?
- At what point should RH-04 reopen rather than lower the 2.95 m ground ceiling?

### S-RT2 — courtyard opening expansion pressure

Assume architectural development asks for a wider north garden/courtyard opening or larger courtyard glazing.

- Which pier/corner dimensions become controlling first?
- What maximum change can occur before a new frame/transfer family is required?

### S-RT3 — service opening congestion

Assume MEP requests a larger `PEN-SV-01` or another duct penetration near an `EB-*` line.

- What opening strategy remains ordinary?
- At what point should the service topology move rather than the structure adapt?

### S-RT4 — PV roof case

Assume realistic PV mounting/wind actions concentrate loads unfavourably on one or two roof fields.

- Can the current roof framing remain short-span and repetitive?
- What would force an RH-08 roof/architectural rewind?

---

## 5. Rewind conditions

Treat the following as likely `REWIND` findings rather than normal technical detailing if confirmed:

1. repeated floor/edge-beam design requires a floor zone materially deeper than **350 mm** and cannot preserve the RH-04 clear-height hierarchy;
2. courtyard or outer masonry requires an independent frame substantial enough that the RH-05 load-path concept is no longer truthful;
3. normal structural adequacy requires columns/posts in principal rooms or a long transfer beam not currently shown;
4. the stair must move materially for structural reasons;
5. courtyard openings / front bay axes must move materially;
6. `SV-01` / registered crossings cannot be accommodated without structural proliferation;
7. the low-slope roof / PV requires a structural depth or visible geometry incompatible with the RH-04/RH-08 cornice control;
8. a generally thicker structural/envelope wall pushes the house beyond the **450 mm** geometry stress limit.

A different joist, beam, lintel, connection or foundation family **within the same architectural coordinates** is not automatically a rewind.

---

## 6. What the project wants back

Please return:

- overall structural disposition;
- material findings / rewinds first;
- the most plausible structural family at this geometry;
- which RH-05 assumptions are safe enough to freeze for technical design;
- which dimensions should remain architectural reservations rather than nominal engineering guesses;
- P03 prototype changes required before physical testing;
- at least two counterexamples that would break the current structural concept;
- standards / Eurocodes / National Annex basis used.

A detailed member schedule is **not** required for this review gate.