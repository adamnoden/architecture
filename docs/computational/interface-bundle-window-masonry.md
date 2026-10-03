# Interface Obligation Bundle 01 — Window in Masonry Cavity Wall

**Identifier:** IF-WIN-MCW-01  
**Status:** conceptual standard-library candidate v0.1  
**Origin:** S0 Paper Compilation Run 01  
**Purpose:** test how a meaningful architectural interface can expand into fine-grained obligations without exposing the author to a manually maintained compliance checklist.  
**Implementation:** none

> **The author places a window in a wall. The system inherits the burden of remembering what that means.**

## 1. Why this bundle exists

S0 Run 01 exposed a serious scaling risk.

One ordinary window opening created obligations concerning:

- head support;
- residual masonry;
- frame fixing;
- weather;
- drainage;
- thermal continuity;
- U-value;
- airtightness;
- cavity closure;
- fire classification;
- service conflicts;
- tolerance;
- replacement;
- maintenance access;
- inspection;
- evidence.

Those obligations are legitimate.

Presenting them as separately authored objects would not be.

The formal system therefore needs **compositional obligation bundles**.

A bundle is not a shortcut around proof.

It is a reusable semantic expansion.

## 2. Author-facing proposition

At ordinary authoring level:

~~~text
place WINDOW WIN01
inside OPENING O01
in EXTERNAL MASONRY CAVITY WALL W01
~~~

The user should not have to manually remember:

~~~text
create lintel obligation
create weather-head obligation
create jamb-air-seal obligation
create cavity-closure obligation
create thermal-bridge obligation
...
~~~

The interface family creates them.

## 3. Bundle inputs

IF-WIN-MCW-01 requires, at minimum:

### Architectural inputs

- host wall;
- opening identity;
- window identity;
- opening geometry;
- room/exterior relationship;
- architectural bay/axis relationships where a grammar defines them.

### Physical inputs

- outer-leaf family/thickness;
- cavity/insulation family;
- inner-leaf family/thickness;
- primary air-boundary location;
- window family/product state;
- fixing/interface family.

### Context inputs

- compiler target;
- supported-domain profile;
- site exposure;
- storey/context;
- fire/compartment role;
- acoustic role where applicable.

### Doctrine inputs

- permanence class of opening;
- replacement class of window;
- maintenance requirements;
- permanent-fabric penetration policy.

Unknown inputs remain UNKNOWN.

The bundle must not invent defaults that create false proof.

## 4. Bundle-generated obligation groups

The bundle expands into groups.

### A. Geometry

- opening fits host;
- required residual wall/pier geometry exists;
- frame fits opening;
- sill/head/reveal geometry exists;
- working/replacement clearance exists.

### B. Structure

- opening interrupts load-bearing wall;
- head support exists;
- bearing/reaction destinations exist;
- residual masonry condition is acceptable;
- frame fixing does not rely on undefined substrate;
- changed opening invalidates dependent structural evidence.

### C. Weather / moisture

- precipitation cannot reach vulnerable interior fabric;
- head has drainage/cavity-tray strategy where applicable;
- jamb/reveal strategy matches exposure;
- sill discharges outward;
- cavity remains drainable;
- frame/wall joint has explicit weather seal;
- moisture strategy remains valid after window replacement.

### D. Thermal

- field wall has applicable thermal evidence;
- window has applicable Uw evidence;
- head/jamb/sill transition is represented;
- thermal-bridge calculation/evidence exists where required;
- insulation continuity is not silently broken by frame/fixing/closer.

### E. Air

- primary air boundary is explicit;
- transition from wall air layer to window is explicit;
- fixing does not accidentally destroy air continuity;
- seals/tapes/grommets have evidence/installability;
- replacement generates reinstatement obligation.

### F. Fire

Depending on target/applicability:

- cavity edge/opening closure route identified;
- selected closer/barrier has correct scope;
- window/interface does not create unmodelled cavity;
- room-side lining classification remains valid;
- penetrations adjacent to opening remain separate obligations.

### G. Acoustic

Where applicable/project-required:

- frame/glazing/joint evidence;
- flanking path at reveal;
- lining/interface consequence.

Do not generate statutory Part E claims where they do not apply.

### H. Permanence / replacement

- permanent opening is distinct from replaceable window;
- removal sequence exists;
- primary fabric is not unnecessarily destroyed;
- replacement boundaries can be reinstated;
- repeat fixing strategy is explicit;
- working/withdrawal route remains available.

### I. Tolerance / workmanship

- survey datum declared;
- opening acceptance range declared;
- window manufacturing/release measurement phase declared;
- adjustment/packing/sealant range declared;
- out-of-range condition stops rather than disappears into trim;
- concealed boundary conditions have inspection hold point.

### J. Evidence

For every applicable group:

- resolution method;
- evidence scope;
- source/version;
- due phase;
- owner;
- invalidation dependencies.

## 5. Internal graph

Conceptually:

~~~text
IF-WIN-MCW-01
      │
      ├── GEO bundle
      ├── STR bundle
      ├── WEATHER bundle
      ├── THERMAL bundle
      ├── AIR bundle
      ├── FIRE bundle
      ├── ACOUSTIC bundle
      ├── REPLACEMENT bundle
      ├── TOLERANCE bundle
      └── EVIDENCE plan
~~~

The bundle is therefore closer to a package/module than a single rule.

## 6. Bundle result

The interface should report one high-level state plus expandable detail.

Example:

~~~text
WINDOW / WALL INTERFACE O01

overall: UNRESOLVED

geometry                 PASS
head structure           EXTERNAL PROOF REQUIRED
weather                  UNRESOLVED — site exposure missing
thermal                  UNRESOLVED — product/calculation missing
air continuity           PASS AT SEMANTIC LEVEL
fire closure             UNRESOLVED — closer evidence missing
replacement              WARNING — repeat fixing interface unresolved
tolerance                 PLANNED
construction evidence     PLANNED
~~~

The high-level state may never hide a failed mandatory child obligation.

## 7. Authority remains visible

A bundle may contain obligations from different authorities.

Example:

~~~text
STRUCTURAL
  authority: physical / Part A route

AIR
  authority: Part L route + physical boundary

REPLACEMENT
  authority: Long-Life House doctrine

BAY ALIGNMENT
  authority: G-01 architectural grammar
~~~

The bundle cannot flatten them into one generic “window rule”.

This preserves one of S0's strongest results.

## 8. Dependency/invalidation behaviour

### Change window width

Invalidates/re-evaluates:

- geometry;
- head structure;
- residual wall;
- product;
- thermal area/junction;
- weather detail;
- grammar relation;
- quantity.

Does not automatically invalidate:

- unrelated floor-member capacity;
- unrelated service penetration;
- whole-wall backplane tolerance envelope.

### Change window product without changing opening

Likely invalidates/re-evaluates:

- Uw;
- frame fixing;
- air seal;
- weather joint;
- fire/product evidence;
- replacement sequence.

Should not automatically invalidate:

- masonry lintel if loads/geometry remain inside evidence scope;
- wall quantities.

### Change site exposure

Invalidates/re-evaluates:

- weather/reveal/sill/head strategy.

Should not automatically invalidate:

- room topology;
- floor structure.

### Remove maintenance clearance

Fails:

- replacement/maintenance group.

Should not alter:

- physical structural adequacy.

This selective invalidation is a primary value of the bundle.

## 9. Bundle composition

IF-WIN-MCW-01 should eventually be composed from smaller reusable concepts rather than hard-coded as one enormous rule.

Possible sub-bundles:

- OPENING_IN_LOADBEARING_MASONRY;
- WINDOW_THERMAL_TRANSITION;
- WINDOW_AIR_TRANSITION;
- OPENING_WEATHER_MANAGEMENT;
- CAVITY_OPENING_CLOSURE;
- REPLACEABLE_COMPONENT_INTERFACE;
- MEASURED_OPENING_TOLERANCE.

Do not split these prematurely.

S0 shows the need for composition.

It does not yet tell us the optimum granularity.

## 10. Why this is not BIM object metadata

A BIM window may know:

- width;
- height;
- product;
- host wall.

The proposed interface bundle additionally knows that the relation:

> window is installed in this wall under this target/domain/doctrine

**creates obligations and evidence dependencies**.

That causal expansion is the important part.

## 11. Why this is not one prescriptive detail

The same semantic interface may have several supported implementations.

For example:

~~~text
WINDOW_IN_MASONRY_CAVITY_WALL
  ├── timber frame + closer family A
  ├── timber frame + rebated masonry family B
  ├── metal-clad timber + interface family C
  └── EXTERNAL CUSTOM INTERFACE
~~~

The bundle defines **what must be resolved**.

An implementation family defines **how**.

This distinction should survive into any future language.

## 12. Relationship to architectural grammar

G-01 may add obligations such as:

- opening centre aligned with bay axis;
- opening family appropriate to room/storey rank;
- head/sill datum relation.

Those are extensions to the same interface.

They do not alter the physical authority of:

- lintel;
- weather;
- air;
- thermal.

A grammar can require a taller window.

It cannot declare the taller window structurally adequate.

## 13. Relationship to the pattern catalogue

This bundle suggests a future distinction.

### Pattern

Human architectural knowledge:

- problem;
- forces;
- trade-offs;
- variants;
- precedent;
- architectural intent.

### Interface bundle

Formal computational counterpart:

- required inputs;
- generated obligations;
- supported implementation families;
- evidence dependencies;
- invalidation behaviour.

Some mature patterns may eventually have a computational bundle.

Not every pattern should.

## 14. User-interface implication

Default view:

> Window interface: unresolved — 3 things need attention.

Expert expansion:

- 27 generated child obligations;
- their authority;
- source;
- evidence;
- dependency graph.

This is how the project can preserve rigorous proof without turning the authoring environment into a compliance spreadsheet.

## 15. Anti-drift rules

- **A bundle is not a green badge.**  
  It can expand to FAIL/UNRESOLVED.

- **A bundle does not hide authority.**  
  Regulation, physics, doctrine and grammar remain distinct.

- **A bundle is not a product detail.**  
  It defines obligations independently of implementation family where possible.

- **Do not create a bundle for every noun.**  
  Bundles earn existence when they encapsulate recurring multi-domain consequences.

- **Do not hand-author generated obligations.**  
  The entire point is deterministic expansion from semantic relationships.

- **Do not let convenience erase UNKNOWN.**  
  Missing site/product/context inputs remain visible.

## 16. Next validation

Use IF-WIN-MCW-01 in a second S0 paper pass only after:

1. its obligation groups are red-teamed against the Run 01 list;
2. missing/duplicated obligations are identified;
3. the distinction between generic bundle and implementation family is checked;
4. a second interface family is attempted—likely FLOOR_TO_MASONRY_WALL—to see whether the abstraction generalises.

If the second family requires an entirely different conceptual machinery, reassess the bundle abstraction.

---

## Source

- [S0 Paper Compilation Run 01](s0-paper-compile-run-01.md)
- [Formal Architectural Model](formal-architectural-model.md)
- [Validity and Obligations](validity-and-obligations.md)
- [Evidence and Provenance Architecture](evidence-and-provenance.md)
