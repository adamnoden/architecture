# Interface Obligation Bundles

**Status:** frozen paper-research abstraction; validated provisionally across two S0 interfaces and one composed wall-bay study  
**Purpose:** package recurring multi-domain consequences behind meaningful architectural relationships while preserving fine-grained proof, authority and evidence internally.  
**Executable status:** no generic bundle subsystem has been implemented; P0 demonstrates the lower-level obligation/evidence mechanism without requiring one.

## Why this layer exists

S0 Paper Compilation Run 01 exposed a scaling risk:

> one ordinary architectural junction can generate dozens of legitimate proof obligations.

The solution is not to delete those obligations.

It is to make them **generated internals of compositional architectural interfaces**, while deriving cross-interface obligations from the composed building graphs rather than concatenating independent checklists.

The ordinary author should manipulate:

- window in wall;
- floor meeting wall;
- roof meeting wall;
- service crossing boundary;

rather than maintain a compliance checklist by hand.

## Paper-research bundles

- [Window in Masonry Cavity Wall](interface-bundle-window-masonry.md) — opening, structure, weather, thermal, air, fire, replacement, tolerance and evidence.
- [Floor to Masonry Wall](interface-bundle-floor-masonry.md) — support, restraint, diaphragm, movement, boundaries, tolerance and evidence.

## Finding

The same bundle machinery survived two materially different interfaces.

A subsequent composition test corrected the abstraction: bundles contribute graph fragments, local constraints and evidence dependencies; canonical cross-interface obligations are derived from the composed graphs.

See [Assembly Composition Test 01](assembly-composition-s0-wall-bay.md).

This supports **Interface Obligation Bundle** as a useful paper-model construct. It does not establish a required implementation primitive or justify a catalogue of bundles for its own sake.

## Composition result

The first composition test used:

~~~text
EXTERNAL WALL BAY ASSEMBLY
  ├── window/wall bundle
  ├── floor/wall bundle
  ├── service-penetration bundle
  └── wall boundary family
~~~

The key result is that shared obligations should not be “merged” after independent generation. Interface families should contribute to common AIR / THERMAL / STRUCTURAL / other domain graphs first, and canonical obligations should derive from the composed state.

Later S0/S1/S2/H1 paper work and the P0 kernel reinforced the more general lesson: **obligations belong to composed building relationships, not to duplicated checklists attached to labels.** P0 did not need an explicit bundle entity to demonstrate that mechanism.

## Programme consequence

Do not proliferate bundle records by default. Add or formalise one only when a live architectural or technical workstream shows that the abstraction reduces complexity without becoming a second source of truth.
