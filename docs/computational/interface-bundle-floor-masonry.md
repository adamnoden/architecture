# Interface Obligation Bundle 02 — Floor to Masonry Wall

**Identifier:** IF-FLR-MCW-01  
**Status:** conceptual standard-library candidate v0.1  
**Origin:** S0 Paper Compilation Run 01  
**Purpose:** test whether the interface-bundle abstraction generalises beyond openings by applying it to the structural floor-to-wall edge.  
**Implementation:** none

> **Support, restraint, movement and boundary closure are different obligations even when one physical junction participates in all of them.**

## 1. Why this bundle matters

The floor-to-wall edge is a good test of the bundle abstraction because it is not primarily an opening.

It is a junction where several systems meet:

- gravity support;
- joist stability;
- lateral wall restraint;
- diaphragm transfer;
- fire and acoustic continuity;
- ceiling termination;
- air/thermal boundary geometry at the perimeter;
- movement;
- corrosion/durability;
- tolerance/workmanship;
- inspection before concealment.

If the same obligation-bundle model works here, then the idea is more likely to be a reusable architectural/compiler primitive rather than a special case invented for windows.

## 1A. Composition correction

After composing this bundle with the window/wall interface, the project refined the model:

- this bundle contributes structural/boundary graph fragments and local constraints;
- it may create genuinely local obligations;
- shared continuity obligations are derived from the composed building state.

Do not concatenate a floor/wall checklist with a window/wall checklist and deduplicate later.

See [Assembly Composition Test 01](assembly-composition-s0-wall-bay.md).

## 2. Author-facing proposition

At ordinary authoring level:

~~~text
FLOOR F01
  meets / is supported by
EXTERNAL MASONRY WALL W01
  using
CONNECTION FAMILY CF01
~~~

The author should not manually create separate checks for:

- vertical support;
- restraint;
- diaphragm;
- fire;
- acoustic edge;
- ceiling slip;
- corrosion;
- movement;
- tolerance;
- inspection.

The semantic relationship expands into those obligations.

## 3. Required inputs

### Architectural / spatial

- floor identity;
- host wall identity;
- storey;
- room above/below;
- whether junction is exposed or concealed architecturally;
- ceiling/skirting/cornice relationship where relevant.

### Structural

- floor structural family;
- span direction;
- nominal span;
- joist/member centres;
- wall structural role;
- connection family;
- gravity-support intent;
- lateral-restraint intent;
- diaphragm intent;
- known concentrated loads or discontinuities.

### Boundary

- wall environmental boundary roles;
- floor fire/acoustic role;
- whether floor is a compartment/separating floor;
- ceiling/lining role;
- cavity conditions at the perimeter.

### Construction

- masonry tolerance;
- floor setting-out datum;
- connection installation tolerance;
- corrosion/exposure class where relevant;
- closure sequence;
- inspection access before concealment.

### Doctrine

- permanent/replaceable classification;
- service-routing policy;
- movement policy;
- maintenance/inspection requirement.

Unknown inputs remain explicit.

## 4. Generated obligation groups

### A. Gravity support

- floor member has a support destination;
- bearing/hanger family is compatible with member and wall;
- support geometry exists;
- reaction can pass into wall;
- wall below has a continuing support path;
- foundation/ground obligation exists downstream where applicable.

Semantic topology can pass before capacity does.

### B. Member / connection adequacy

- joist/member capacity;
- hanger/bearing capacity;
- local masonry capacity;
- fixing/embedment;
- member end condition;
- vibration/deflection where within domain;
- product/engineering evidence.

This is likely to remain external or bounded by a native proof envelope in early H1.

### C. Lateral restraint

- wall restraint requirement identified;
- connection family states whether/how it provides restraint;
- spacing/distribution meets selected route;
- floor diaphragm or equivalent restraint path is explicit;
- restraint is not assumed merely because vertical support exists.

This is a core Long-Life House interface principle expressed computationally.

### D. Diaphragm / robustness

Where applicable:

- structural deck/diaphragm role is declared;
- transfer from deck to wall/support system is explicit;
- interruptions/openings do not silently break the path;
- removable finish/platform is not falsely credited with primary stability.

### E. Fire

Depending on target and whole-building role:

- floor fire-resistance obligation;
- cavity closure;
- joist-end protection;
- ceiling/lining contribution;
- service penetration implications;
- perimeter void/cavity treatment.

If the floor is not a compartment/separating floor, the system must not invent those obligations merely because it knows such rules exist.

### F. Acoustic

Where applicable/project-required:

- flanking path at wall/floor edge;
- floor/ceiling build-up;
- resilient separation;
- perimeter sealing;
- cavity effects.

Again, regulatory and project acoustic obligations remain distinguishable.

### G. Air / thermal / moisture

At an external-wall floor edge:

- primary air boundary remains continuous;
- insulation path is not unintentionally interrupted;
- floor/hanger penetrations of the air layer are explicit;
- moisture-sensitive timber is protected from inappropriate wetting/condensation conditions;
- wall cavity drainage remains functional.

The floor itself may not be the thermal boundary, but the junction can disturb it.

### H. Movement

The relationship must distinguish:

- gravity support;
- lateral restraint;
- allowed differential movement;
- finish movement.

A connection should not be described generically as “fixed”.

Candidate questions:

- which degrees of freedom are restrained?
- which movements are expected?
- where are those movements absorbed?
- what finish/detail spans the movement?

### I. Services

- structural zone is not treated as an unrestricted service corridor;
- any member/web penetration follows supported family rules;
- any wall penetration is separately typed;
- service routing does not invalidate fire/acoustic/air conditions.

### J. Tolerance / workmanship

- masonry support datum defined;
- floor datum defined;
- incoming wall deviation stated;
- connection installation range stated;
- permitted adjustment separated from remediation;
- out-of-range conditions stop work;
- concealed restraint/fire/air conditions have inspection points.

### K. Maintenance / inspection

Even where the connection itself is not routinely replaceable:

- critical concealed conditions have installation evidence;
- future inspection route is stated where realistic;
- later floor/ceiling replacement does not silently erase structural identity/evidence;
- repair access requirements are explicit if the selected system claims repairability.

### L. Evidence / provenance

Every applicable child obligation records:

- authority;
- source;
- method;
- evidence;
- scope;
- due phase;
- invalidation dependencies.

## 5. Critical decomposition

The bundle must preserve at least this decomposition:

~~~text
FLOOR_TO_WALL
   ├── SUPPORT
   ├── RESTRAINT
   ├── MOVEMENT
   ├── BOUNDARY
   ├── FINISH
   └── EVIDENCE
~~~

A single proprietary connector may contribute to several branches.

It must not collapse the branches semantically.

For example:

> “restraint hanger installed”

is not itself proof that:

- member capacity passes;
- diaphragm passes;
- fire passes;
- acoustic edge passes;
- movement is resolved.

## 6. High-level result

A user-facing summary might be:

~~~text
FLOOR / WALL INTERFACE I02

overall: UNRESOLVED

gravity topology            PASS
member / hanger capacity    EXTERNAL PROOF REQUIRED
wall restraint route        PASS AT SEMANTIC LEVEL
diaphragm transfer          UNRESOLVED
fire edge                   NOT APPLICABLE / PENDING WHOLE-HOUSE ROLE
acoustic edge               PROJECT REQUIREMENT / UNRESOLVED
air / thermal continuity    PASS AT SEMANTIC LEVEL
movement                    UNRESOLVED
tolerance                   PLANNED
construction evidence       PLANNED
~~~

No child failure may be hidden by the high-level display.

## 7. S0 instantiation

For S0:

- wall: 215 mm dense masonry inner leaf within cavity wall;
- floor: 240 mm nominal I-joist family at 400 mm nominal centres;
- span: 4000 mm test assumption;
- support/restraint: generic restraint-type masonry hanger family;
- structural deck: 26 mm nominal research assumption;
- routine services in joist zone: prohibited by doctrine unless explicitly engineered.

### Current S0 result

**Gravity topology:** PASS  
**Connection/product capacity:** UNRESOLVED  
**Wall-restraint route:** PASS at semantic/route level  
**Diaphragm:** UNRESOLVED  
**Fire/acoustic:** partial/whole-building-role dependent  
**Boundary continuity:** explicit but performance evidence unresolved  
**Tolerance/workmanship:** not yet formalised sufficiently for S0-A

This mirrors Run 01 without needing the user to author each child obligation.

## 8. Dependency behaviour

### Change floor span

Likely re-evaluate:

- joist capacity;
- vibration/deflection;
- reactions;
- hanger load;
- wall reaction;
- foundation dependency where material.

Do not automatically invalidate:

- window weather detail;
- wall U-value;
- unrelated service penetration.

### Change joist centres

Re-evaluate:

- joist/hanger counts;
- floor loading per member;
- restraint spacing/route;
- quantities;
- diaphragm fixing pattern.

### Change connection family

Re-evaluate:

- gravity support evidence;
- restraint route;
- corrosion/durability;
- installation tolerances;
- fire/acoustic edge;
- evidence plan.

Do not automatically change authored room geometry.

### Change ceiling finish

May re-evaluate:

- fire;
- acoustic;
- movement/finish interface.

Should not automatically invalidate:

- gravity capacity;
- wall restraint.

### Add service hole through joist

Generate/re-evaluate:

- member penetration rule;
- service route;
- fire/acoustic implications;
- evidence.

The change should not remain a purely graphical hole.

## 9. Comparison with window bundle

Both IF-WIN-MCW-01 and IF-FLR-MCW-01 use the same conceptual machinery:

1. meaningful architectural/physical relationship;
2. required contextual inputs;
3. deterministic contribution to shared semantic/domain graphs plus local constraints;
4. canonical obligation derivation after composition;
5. authority preserved per obligation;
6. evidence attached by scope;
7. high-level summary with expert expansion;
8. dependency-driven invalidation.

This is strong evidence that **interface obligation bundle** is a generalisable concept.

The child groups differ.

The machinery does not.

## 10. Important difference from component libraries

A component library might say:

> hanger H-17 works with joist J-04.

An obligation bundle asks:

> what does choosing this relationship commit the building to proving?

That includes conditions outside the connector product itself.

The bundle therefore sits conceptually **above** product compatibility.

## 11. Relationship to Long-Life House interface doctrine

This bundle maps unusually directly to Principle 3 — Design the Interface.

The doctrine already asks the designer to separate:

- support;
- restraint;
- movement;
- sealing/protection;
- finish;
- tolerance/remediation.

The computational system now has a plausible way to encode that separation without asking the author to manually maintain it.

This may be one of the strongest direct bridges yet found between doctrine and compiler architecture.

## 12. Architectural consequence

The interface bundle is not merely technical.

For the Reference House, the floor edge also controls:

- skirting;
- cornice/ceiling junction below;
- room datum;
- visible movement joint;
- possible access/removal strategy.

Those architectural relationships can extend the bundle under the selected grammar/doctrine profile.

They should not be mixed into structural authority.

## 13. Anti-drift rules

- **Support is not restraint.**
- **Restraint is not movement resolution.**
- **A connector product is not the interface.**
- **A complete structural calculation is not automatically a complete boundary detail.**
- **Do not generate fire/acoustic obligations without applicability.**
- **Do not expose all child obligations as authoring chores.**
- **Do not let a bundle become a proprietary product macro.**
- **Do not create duplicate source dimensions inside child analyses.**

## 14. Generalisation verdict

**PASS — PROVISIONAL**

The obligation-bundle abstraction survives a second materially different interface.

That is enough to promote the concept into the formal architectural model as a first-class **research construct**.

It is not enough to define implementation syntax.

## 15. Next test

Do not create ten more bundle documents.

The next useful move is one level upward:

> determine how bundles compose into an **assembly family** without duplicating child obligations.

For S0, the obvious candidate is:

**EXTERNAL_WALL_BAY_WITH_WINDOW_AND_FLOOR_EDGE**

It would compose:

- IF-WIN-MCW-01;
- IF-FLR-MCW-01;
- controlled service penetration;
- wall boundary family;
- room-side finish family.

The test question is whether shared obligations—especially air/thermal boundary continuity—can be **merged rather than duplicated**.

That is the next scaling problem.

---

## Sources

- S0 Paper Compilation Run 01
- Structural Semantics
- Boundary Semantics
- Formal Architectural Model
- Long-Life House governing principles
