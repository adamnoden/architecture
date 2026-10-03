# Interface Obligation Bundles

**Status:** research abstraction validated provisionally across two S0 interfaces  
**Purpose:** package recurring multi-domain consequences behind meaningful architectural relationships while preserving fine-grained proof, authority and evidence internally.

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

## Current bundles

- [Window in Masonry Cavity Wall](interface-bundle-window-masonry.md) — opening, structure, weather, thermal, air, fire, replacement, tolerance and evidence.
- [Floor to Masonry Wall](interface-bundle-floor-masonry.md) — support, restraint, diaphragm, movement, boundaries, tolerance and evidence.

## Current finding

The same bundle machinery survives two materially different interfaces.

A subsequent composition test also corrected the abstraction: bundles contribute graph fragments, local constraints and evidence dependencies; canonical cross-interface obligations are derived from the composed graphs.

See [Assembly Composition Test 01](assembly-composition-s0-wall-bay.md).

That justifies promoting **Interface Obligation Bundle** into the formal model as a research construct.

It does not justify implementation syntax.

## Next scaling test

Do not proliferate bundles.

The first **composition** test is now complete conceptually:

~~~text
EXTERNAL WALL BAY ASSEMBLY
  ├── window/wall bundle
  ├── floor/wall bundle
  ├── service-penetration bundle
  └── wall boundary family
~~~

The result is that shared obligations should not be “merged” after independent generation. The bundles should contribute to a single AIR/THERMAL/STRUCTURAL/etc graph first, and canonical obligations should be derived from that composed state.

The next step is red-teaming the composed bay for missed obligations, valid-child conflicts, product substitution and target-context changes.
