<!-- nav-exclude: redirect -->
# ADE-05B — partition datum + adjacency grammar verdict

**Historical packet record. Current disposition:** ADE migration/generality is internally complete; [closeout and PLT physical-review handoff](architectural-drawing-engine-closeout.md). Earlier next/blocked statements below describe this packet’s historical gate.

**Programme:** ADE — Architectural Drawing Engine capability uplift  
**Parent:** #812 / #818  
**Packet:** #835  
**Candidate:** PR #852  
**Dependency boundary:** physical internal partitions remain gated by ADE-05A / #834

## Decision

Advance two deliberately non-physical conventions:

1. **unresolved partition datum → faint constant-paper locus band**;
2. **required adjacency → single offset bracket spanning the source-owned candidate segment**.

Neither convention becomes architectural material. Neither selects a door.

## Why this packet exists

PLT-03 exposed an ambiguity: a single planning line could be read as a thin partition, a construction centreline, an accidental remnant or nothing at all. At the same time, required adjacency between spaces had historically been at risk of collapsing into a convenient midpoint/door proxy.

ADE-05B therefore gives unresolved spatial authority a deliberate visual state while preserving the distinction between:

- where architecture owns physical matter;
- where it only owns a potential partition locus; and
- where it only owns a connectivity obligation.

## Candidate review — partition datum

### D1 — faint locus band

**KEEP / ADVANCE.** A quiet filled locus is visible at reading distance but does not read as cut matter. Its width is fixed in paper space, so changing from 1:100 to 1:50 cannot turn it into an implied model-space wall thickness. It is the strongest candidate aesthetically and epistemically.

### D2 — capped spine

**REJECT.** The black hairline and end caps read as a construction/dimension datum. It is too assertive relative to unresolved authority and too close to conventional technical-drawing notation.

### D3 — paired rails

**REJECT.** Two parallel lines are immediately legible as wall faces. Even though their spacing is paper-space notation, the visual implication is a physical thin wall. This recreates the original ambiguity in a cleaner form and is therefore unacceptable.

## Candidate review — adjacency

### A1 — single offset bracket

**KEEP / ADVANCE CONCEPT.** The bracket is visibly annotation rather than architecture, spans the whole source-owned candidate extent, and does not nominate an aperture centre. The side on which it is drawn is a representation/white-space choice, not ownership by one of the two spaces.

### A2 — opposed brackets

**REJECT.** The two brackets form a box-like condition across the boundary and begin to resemble a threshold/opening assembly. The extra symmetry adds graphic weight without adding source authority.

### A3 — limits only

**REJECT.** Endpoint ticks alone are too weak and too easily read as stray marks. They communicate extent only after explanation and do not carry the relation strongly enough.

## Engine contract

The selected grammar is promoted into `compiler/architectural-drawing/partition-adjacency.ts`.

### Partition datum

- accepts only `AdePartitionDatum`;
- produces a closed faint path around the source-owned model-space locus;
- model-space length scales conventionally;
- locus width is fixed paper-space notation;
- metadata explicitly records `physicalThickness: false`;
- no stroke, dash or implied wall assembly is introduced.

### Adjacency obligation

- accepts `AdeAdjacencyObligation` candidate segments;
- draws a single bracket offset to a caller-selected side for composition;
- bracket span follows the whole candidate model-space segment;
- bracket offset and terminal ticks remain paper-space quantities;
- metadata explicitly records `doorSelected: false`;
- no midpoint, leaf, swing or aperture is generated.

## Freeze boundary

ADE-05B freezes the **semantic-to-graphic distinction and chosen grammar family**, not the final exact paper dimensions.

Frozen now:

- unresolved partition datum is never a wall body;
- the selected datum grammar is a quiet filled locus, not a line pair;
- adjacency is a relation annotation, not an opening;
- adjacency spans candidate extent and does not invent a centre;
- physical partition body remains blocked until ADE-05A owns an assembly.

Deferred to ADE-06 physical/full-sheet review:

- exact datum locus width;
- exact bracket offset/tick size;
- tonal value of the faint locus in black-only print;
- whether BOOK 1:100 suppresses some unresolved datums that WALL 1:50 retains;
- collision/white-space routing for adjacency brackets in the complete house plan.

## Consequence for Reference House migration

ADE-07 may represent every still-unresolved `internal-planning` source boundary as a datum locus and every unresolved required connection as an adjacency bracket. Once ADE-05A classifies a source boundary as a physical partition and owns a partition assembly, that boundary must leave datum grammar entirely and compile through ordinary wall topology instead.
