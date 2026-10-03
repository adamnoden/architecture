# S0 Complexity Gate — v0.1

**Status:** programme gate  
**Purpose:** make complexity containment an explicit acceptance criterion rather than a vague UX aspiration.  
**Applies before:** S0 Run 02 and H1 implementation planning.

> **Internal rigour may scale. Authoring bureaucracy may not.**

## 1. The risk

The compiler idea is attractive partly because a building contains thousands of interacting consequences.

That same fact can destroy the product.

If every consequence becomes a field, checkbox, warning or manually resolved obligation, the software will expose the industry's complexity rather than contain it.

That is a course-failure condition.

## 2. Complexity is allowed internally

The system may maintain:

- many graph nodes;
- many obligations;
- many evidence dependencies;
- many target rules.

The ordinary author should manipulate:

- rooms;
- walls;
- openings;
- floors;
- roofs;
- service points/zones;
- architectural roles;
- meaningful system/family choices.

The translation between those levels is the compiler's job.

## 3. Gate principles

### CG-01 — no manual obligation authoring

The ordinary author must never need to create a “check cavity closer” item because they placed a window.

The semantic relationship generates the relevant model contribution.

### CG-02 — one authoritative fact

A dimension/property is authored once.

Example: opening width is stored once on the opening occurrence.

Structure, thermal, quantity, façade and regulation read from it.

No parallel manually synchronised values.

### CG-03 — composition before canonical obligations

Bundles contribute to shared graphs.

Do not concatenate child checklists and deduplicate later.

### CG-04 — knowledge is defined once, occurrences are cheap

Adding another occurrence of a supported family must not require re-authoring:

- regulatory knowledge;
- boundary logic;
- product-family logic;
- doctrine rules.

Only occurrence-specific facts/evidence should grow.

### CG-05 — default issues group by action

If one unresolved decision causes twelve child obligations, the default authoring surface should normally show the **decision**, not twelve symptoms.

Example:

> Window operational/safety strategy unresolved — affects fall protection, glazing, purge and escape.

Expert expansion exposes the children.

### CG-06 — selective invalidation

A local edit should not stale unrelated evidence.

Broad invalidation is a complexity bug unless the dependency is genuinely broad.

### CG-07 — shared evidence remains shared

One product certificate, calculation family or inspection event can support several scoped claims.

Do not duplicate the document merely because several obligations depend on it.

### CG-08 — expert inspectability

Compression must never mean opacity.

Every summary issue expands to:

- child obligations;
- authority;
- source;
- evidence;
- assumptions;
- dependencies.

## 4. Scaling test — duplicate the bay

Take S0 bay B01 and create B02 using the same:

- wall family;
- window family;
- boundary family;
- floor/wall interface family;
- workmanship route.

Only occurrence identity/position differ initially.

### What should grow

- entity occurrences;
- geometry;
- quantities;
- occurrence-level inspections;
- occurrence-level local collisions;
- whole-elevation aggregates such as total unprotected opening area.

### What should not require new authoring

- definition of BF-WIN-MCW-01;
- Part K rule knowledge;
- Part Q rule knowledge;
- cavity-wall moisture logic;
- air-boundary logic;
- structural-assurance policy;
- workmanship process model;
- product-family evidence, where its scope covers both occurrences.

## 5. Missing shared evidence test

Assume both B01 and B02 use the same unselected window family.

Internally there may be multiple dependent obligations.

Default authoring issue should be approximately:

> **Select / evidence window family — affects 2 occurrences.**

Not a repeated list of identical product deficiencies for each occurrence.

Those child states still exist.

They are not the user's primary task list.

## 6. Occurrence-specific failure test

Now obstruct the withdrawal zone only at B02.

Expected default issues:

- shared window-family issue still one grouped action;
- **B02 replacement clearance blocked** as one local occurrence issue.

B01 should remain valid on maintenance geometry.

The grouped abstraction must not erase occurrence-specific failure.

## 7. Aggregate obligation test

Duplicate the window.

Whole-elevation opening area becomes:

~~~text
2 × 2.16 m² = 4.32 m²
~~~

B4 external-fire-spread analysis may therefore change at the **elevation** level.

The user should not manually create an aggregate B4 rule.

The composed building graph derives it.

## 8. Complexity alarms

Raise a course alarm if any of the following becomes normal.

### Alarm A — manual rule creation

User creates compliance/doctrine checks to make ordinary objects valid.

### Alarm B — duplicate truth

The same dimension is manually edited in several analytical models.

### Alarm C — duplicate unresolved actions

Ten identical occurrences create ten identical author decisions when one family decision would resolve all ten.

### Alarm D — global invalidation

Small local edits repeatedly stale most of the project.

### Alarm E — abstraction leakage

Ordinary users must understand internal regulation/engineering graph topology to complete ordinary design operations.

### Alarm F — expert opacity

Compression is achieved by hiding why the system made a decision.

### Alarm G — unsupported becomes workaround

Users habitually bypass the system because supported families are too narrow.

This last alarm may mean the domain is too constrained, not that users are wrong.

## 9. Complexity metrics for paper research

Before software, record:

- authored semantic decisions required for the scenario;
- canonical source facts;
- internal obligation groups;
- default user-facing issue groups;
- expert-expandable child obligations;
- shared evidence items;
- occurrence-specific evidence items;
- unrelated evidence invalidated by each mutation.

Do not optimise the raw count blindly.

The direction matters:

> more internal coverage should not require proportionally more authoring decisions.

## 10. Run-02 pass condition

Run 02 passes the complexity gate provisionally if:

1. no obligation is manually authored;
2. no canonical value is duplicated;
3. two identical bays reuse family/rule knowledge;
4. shared unresolved decisions group once by default;
5. occurrence-specific failures remain local;
6. whole-building/elevation aggregates emerge automatically;
7. expert detail remains inspectable;
8. Run 02 adds regulatory coverage without increasing the conceptual authoring burden over Run 01.

If criterion 8 fails badly, stop expanding the compiler and simplify the model.

## 11. H1 gate

S0 can only give provisional confidence.

Before implementing H1, repeat this test at larger scale:

- repeated windows;
- repeated floor bays;
- several room types;
- two storeys;
- service networks;
- roof;
- wet rooms.

The critical curve is:

~~~text
INTERNAL RIGOUR        may grow steeply
AUTHORING BURDEN       should grow with meaningful design decisions
                       not with rule count
~~~

If those curves converge, change course.
