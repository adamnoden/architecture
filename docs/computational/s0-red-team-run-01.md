# Domain S0 — Run 01 Red Team

**Status:** internal adversarial review v0.1  
**Subject:** S0-RUN-01 and ASM-S0-WALL-BAY-01  
**Date:** 2026-10-03  
**Purpose:** look for obligations the first compile did not generate, test conflicts between individually reasonable requirements, and test whether evidence/target changes invalidate the right parts of the model.  
**Implementation:** none

> **A compiler architecture is only interesting if it can discover what the designer forgot to ask.**

## 1. Verdict

Run 01 remains useful, but it was **not complete even within its declared slice**.

The red-team found several material omissions:

1. Part K fall protection / critical glazing at the frozen 750 mm sill;
2. Part B external-fire-spread / unprotected-area dependency on site boundary distance;
3. possible Part B emergency-egress-window duties depending on the whole-house escape strategy;
4. Part F purge-ventilation contribution at room level;
5. Part Q security applicability for easily accessible windows;
6. Regulation 7 / Approved Document 7 materials-and-workmanship authority;
7. interactions between fall protection, emergency escape, purge ventilation and security that cannot be evaluated from nominal window geometry alone.

This is a **positive research result**.

The omission demonstrates why:

- target coverage must itself be versioned and testable;
- obligations often arise from composition/context rather than one component;
- the window needs operational semantics, not only width/height;
- whole-house context can make a previously neutral wall-bay fact relevant.

## 2. Historical integrity rule

Do **not** patch S0 Run 01 or its target snapshot until they appear to have always known these obligations.

Run 01 used:

- T-ENG-NDW-2026-10-03-S0
- source package S0-SOURCE-01

Those records remain historical evidence of what the research system knew at that point.

Create a new target revision for future runs.

This is precisely the behaviour required of a versioned compiler target.

## 3. Missed obligation — Part K, protection from falling

The frozen S0 source has:

- upper-floor external window;
- sill at 750 mm above finished floor.

Approved Document K's protection-from-falling guidance identifies the edge below an opening window as a guarding location where necessary, and Diagram 3.1 gives **800 mm** as the guarding height at opening windows.

### Red-team obligation

**K-S0-01 — OPENING WINDOW FALL PROTECTION**

Applicability inputs:

- is any part of WIN01 openable?
- vertical fall distance outside;
- effective guarding height;
- any fixed lower light/guard/limiter strategy.

Current S0 source does not contain enough operational-window information.

**Status under Run 01 source:** UNRESOLVED / MISSED BY RUN 01

### Why this matters

The nominal sill dimension cannot be treated as a purely architectural proportion.

At 750 mm it participates in a life-safety obligation.

This is an excellent example of a dimension with several authorities:

- architectural grammar;
- view/daylight;
- furniture/use;
- fall safety;
- glazing safety.

## 4. Missed obligation — Part K, impact with glazing

Approved Document K identifies window glazing below **800 mm** above floor level as a critical impact location.

The S0 glazing begins at a nominal sill of 750 mm.

Therefore at least the lower portion of the glazing falls in the critical zone unless another compliant protection strategy changes the condition.

### Red-team obligation

**K-S0-02 — CRITICAL GLAZING**

Requires an appropriate route such as:

- safe-breakage glazing;
- robust glazing;
- qualifying small panes;
- permanent protection;

within the applicable guidance.

**Status:** UNRESOLVED / MISSED BY RUN 01

No glazing product was selected, so the correct output is not failure of the design geometry.

It is:

**PRODUCT / SAFETY-GLAZING EVIDENCE REQUIRED**

## 5. Missed obligation — Part B external fire spread

The window is an unprotected area in an external wall for external-fire-spread analysis.

Approved Document B requires the extent of unprotected areas to be considered relative to the relevant boundary and the fire-resistance strategy of the remainder of the external wall.

S0 deliberately has no real site.

Therefore it cannot know:

- relevant-boundary distance;
- facing relationship;
- permitted unprotected area;
- whether the represented wall needs a particular fire-resistance role.

### Red-team obligation

**B4-S0-01 — EXTERNAL WALL / RELEVANT BOUNDARY**

Inputs:

- wall location on site;
- relevant-boundary geometry;
- building height/use;
- unprotected opening areas.

Window area from S0:

**2.16 m²**

This should contribute to the whole-elevation/unprotected-area model.

**Status:** UNRESOLVED — SITE / WHOLE-ELEVATION CONTEXT MISSING

### Important scale lesson

A wall-bay compiler can calculate opening area.

It cannot determine B4 conformance from one bay in isolation.

The bay contributes data to a larger obligation.

## 6. Missed/conditional obligation — emergency escape window

Approved Document B gives dimensional guidance for windows used as emergency escape, including:

- minimum unobstructed openable area;
- minimum openable height/width;
- maximum height of the bottom of the openable area.

Whether WIN01 must perform that role depends on:

- storey height above ground;
- room type;
- room relationship;
- protected-stair/escape strategy;
- whether another escape route serves the room.

### Red-team obligation

**B1-S0-01 — ESCAPE-WINDOW ROLE APPLICABILITY**

Current source says only:

- upper-floor;
- principal occupied room.

That is insufficient.

**Status:** APPLICABILITY UNRESOLVED

### Consequence

The window entity needs a semantic distinction between:

- fixed;
- ordinary openable;
- purge-ventilation opening;
- emergency-egress opening;
- guarded/restricted opening;

and it may carry several roles simultaneously.

## 7. Missed cross-scale contribution — Part F purge ventilation

Under the frozen pre-2027 Part F route, habitable rooms require purge ventilation.

Openable windows/doors are one possible method, but not the only one.

The S0 source does not define:

- full room floor area;
- whether WIN01 is the purge route;
- opening type;
- maximum opening angle;
- unobstructed openable area.

### Red-team result

Do **not** create:

> WINDOW MUST PROVIDE PURGE VENTILATION

Create instead:

> ROOM-R01 requires an accepted purge-ventilation route if it is a habitable room.

If WIN01 is nominated as that route, its operational geometry contributes to the room-level obligation.

**Status:** ROOM ROLE / SYSTEM ROUTE UNRESOLVED

### Scale lesson

This is another case where an interface bundle contributes facts to a higher-level graph rather than owning the final obligation.

## 8. Missed conditional obligation — Part Q security

Requirement Q1 applies to new dwellings.

Approved Document Q's window guidance covers ground-floor, basement and other **easily accessible** windows.

S0 calls the window upper-floor but does not define exterior accessibility.

Examples that could change applicability:

- roof below;
- balcony;
- adjacent structure;
- accessible ledge;
- ground relationship.

### Red-team obligation

**Q-S0-01 — WINDOW SECURITY APPLICABILITY**

Inputs:

- accessibility from exterior;
- window operational type;
- product security evidence;
- fixing method.

**Status:** UNRESOLVED APPLICABILITY

If applicable, frame fixing and hardware become part of both:

- security;
- replacement/interface design.

## 9. Missed authority — Regulation 7 / materials and workmanship

Run 01 identified a computational gap around conventional S0-A workmanship.

The regulatory source map itself was also incomplete.

Regulation 7 requires building work to use adequate/proper materials, appropriately prepared/applied/fixed, and to be carried out in a workmanlike manner. Approved Document 7 provides guidance.

### Red-team correction

Workmanship has at least two different authorities in this project:

1. **Regulation 7 / material-workmanship legal requirement**;
2. **Long-Life House workmanship-robustness doctrine**, which is often stricter and more explicit about tolerance/adjustment/remediation.

These must remain distinguishable.

S0-A cannot be treated as “ordinary construction, therefore implicitly fine.”

It needs a proportional evidence/tolerance route too.

## 10. Interaction conflict 01 — fall protection vs emergency escape

Assume later whole-house analysis determines WIN01 must serve as an emergency escape window.

At the same time, the low sill/opening condition creates fall-protection concerns.

A naïve response might add a permanent restrictive limiter.

That could undermine the escape function.

Approved Document B allows certain opening stays with child-resistant release catches on escape windows, showing that both functions can be coordinated—but the product/operation must be designed accordingly.

### Compiler requirement

The system must detect:

~~~text
ROLE: FALL-PROTECTION
ROLE: EMERGENCY-EGRESS
~~~

on the same operational window and evaluate compatibility.

A child obligation cannot be resolved in a way that silently invalidates another child obligation.

## 11. Interaction conflict 02 — purge ventilation vs fall protection

Assume WIN01 is selected as the room's purge-ventilation route.

A limiter/restrictor can reduce:

- opening angle;
- effective free opening area.

Therefore:

> nominal frame size is not ventilation opening area.

The compiler needs operational geometry:

- sash type;
- hinge/pivot mode;
- restrictor state;
- clear openable area.

A fall-protection fix can make the ventilation evidence stale.

## 12. Interaction conflict 03 — security vs egress / purge

A security-rated window and its hardware may affect:

- opening behaviour;
- release method;
- frame fixing;
- available open area.

The compiler must not treat:

- security product evidence;
- egress;
- purge ventilation;

as independent green ticks.

The selected hardware configuration is shared evidence/input.

## 13. Interaction conflict 04 — architectural sill hierarchy vs safety

G-01 may eventually prefer a sill/head relationship for a principal room.

The S0 750 mm sill was only a test assumption.

If a future grammar proposes a similar low sill, the compiler should expose:

- guarding consequence;
- critical glazing consequence;
- furniture/use consequence;
- exterior façade consequence.

This is an ideal example of architecture and regulation negotiating without either authority being hidden.

## 14. Product-substitution test

### Baseline

WIN01 has:

- opening envelope 1200 × 1800 mm;
- no selected product.

### Substitution hypothesis

Select a replacement window family with identical outer-frame dimensions but change:

- fixed/openable split;
- opening direction;
- effective openable area;
- limiter;
- security hardware;
- Uw;
- frame fixing pattern.

### Geometry

Masonry opening remains unchanged.

**GEO opening-fit evidence:** potentially remains current.

### Must re-evaluate

- Part K fall/guarding behaviour;
- Part K critical glazing product;
- Part B emergency-egress role if applicable;
- Part F purge contribution if nominated;
- Part Q security if applicable;
- Part L Uw;
- air-seal/fixing interface;
- weather interface;
- replacement sequence;
- product evidence.

### Should usually remain current

- masonry lintel geometry/load, **if** product self-weight/load remains within the accepted evidence envelope;
- wall quantities;
- floor/hanger system;
- unrelated service penetration.

### Research result

**PASS**

The dependency architecture can express a product swap that is geometrically invisible but semantically significant.

## 15. Target-context test 01 — boundary distance changes

Keep the S0 bay physically identical.

Move the house/site context so the represented elevation is close to a relevant boundary.

### Changes

- source wall geometry: unchanged;
- window area: unchanged;
- target context: changed.

### Re-evaluate

- B4 external-fire-spread obligations;
- allowable unprotected-area strategy;
- external-wall fire-resistance requirements.

### Do not automatically invalidate

- room topology;
- floor member geometry;
- window Uw;
- maintenance withdrawal volume.

### Research result

A building can become invalid under a changed **context** without any component changing.

The compiler model supports that in principle.

## 16. Target-context test 02 — regulatory-date migration

Keep the source building identical.

Change target from the 3 October 2026 pre-Future-Homes L/F basis to a later applicable target after the 2026 L/F standards come into force for the relevant project.

Expected:

- Part L/F rule packs re-evaluate;
- affected energy/ventilation evidence becomes stale;
- structural/doctrine/G-01 evidence should remain current unless their dependencies also changed.

This remains a future explicit migration run.

## 17. Shared-evidence test

The red-team asks whether the system can avoid both:

- one-document-per-obligation bureaucracy;
- one-PDF-proves-everything vagueness.

### Proposed model

One **inspection event** can produce several scoped evidence observations.

Example pre-closure inspection event:

~~~text
INSPECTION EVENT IE-01
  observes:
    cavity closer installed
    air tape continuous at jamb
    sleeve P01 sealed
    cavity drainage path unobstructed
~~~

Each observation can support its own obligation.

The event is shared.

The claims remain separate.

Likewise, one product identity can link to several evidence documents without being treated as proof by itself.

### Result

**PASS conceptually**

Evidence should compose at the level of:

- event;
- artifact;
- observation;
- claim scope.

Not merely “attach PDF”.

## 18. New target coverage required

Future S0 runs should include at least these additional target/source areas:

- Part K — fall protection and impact with glazing;
- Part Q — security in new dwellings, with accessibility applicability;
- Regulation 7 / Approved Document 7 — materials and workmanship;
- Part B B4 external fire spread / relevant boundary;
- Part B B1 emergency-egress-window applicability;
- Part F room-level purge-ventilation contribution.

Part O remains whole-house and should receive window contributions rather than be falsely evaluated locally.

## 19. Red-team result by category

| Test | Result |
|---|---|
| Find missed obligations | **FAIL FOUND — useful** |
| Preserve Run 01 history | PASS |
| Detect cross-domain conflicts | PASS |
| Product substitution invalidation | PASS conceptually |
| Context-only invalidation | PASS conceptually |
| Shared evidence without proof collapse | PASS conceptually |
| Target completeness | **FAIL — new target required** |
| Compiler architecture | CONTINUE WITH CORRECTIONS |

## 20. Course correction

No change to the overall programme is required.

One correction is required:

> **Target coverage must be treated as executable/testable knowledge with its own conformance tests; it cannot be assumed complete because the major Approved Documents have been listed.**

And one modelling principle is strengthened:

> **Window operational state is semantic. A “window” cannot be represented only by a rectangular opening and a product ID.**

The model needs enough operational semantics to reason about:

- fixed/openable;
- egress;
- purge;
- security;
- guarding/restriction;
- replacement.

Do not build that schema yet.

Record the requirement.

## 21. Next action

1. create **S0 target snapshot v0.2** rather than editing the Run-01 target;
2. add the newly discovered source areas and explicit applicability dependencies;
3. formalise the conventional S0-A workmanship route enough to exercise Regulation 7 + project tolerance doctrine;
4. revise the window interface bundle to include operational roles;
5. only then consider Run 02.

---

## Authoritative source anchors

- Approved Document K: https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k
- Approved Document B: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- Approved Document F, pre-2027 route used by S0 target: https://www.gov.uk/government/publications/ventilation-approved-document-f
- Approved Document Q: https://www.gov.uk/government/publications/security-in-dwellings-approved-document-q
- Approved Document 7: https://www.gov.uk/government/publications/material-and-workmanship-approved-document-7
- Building Regulations 2010, current text: https://www.legislation.gov.uk/uksi/2010/2214
