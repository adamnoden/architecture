# Interface Obligation Bundles

**Status:** research abstraction validated provisionally across two S0 interfaces  
**Purpose:** package recurring multi-domain consequences behind meaningful architectural relationships while preserving fine-grained proof, authority and evidence internally.

## Why this layer exists

S0 Paper Compilation Run 01 exposed a scaling risk:

> one ordinary architectural junction can generate dozens of legitimate proof obligations.

The solution is not to delete those obligations.

It is to make them **generated internals of compositional architectural interfaces**.

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

That justifies promoting **Interface Obligation Bundle** into the formal model as a research construct.

It does not justify implementation syntax.

## Next scaling test

Do not proliferate bundles.

The next test is **composition**:

~~~text
EXTERNAL WALL BAY ASSEMBLY
  ├── window/wall bundle
  ├── floor/wall bundle
  ├── service-penetration bundle
  └── wall boundary family
~~~

The key question is whether shared obligations can be merged.

If the same air-boundary continuity obligation appears separately in several child bundles and requires manual reconciliation, the abstraction has failed to solve obligation explosion.
