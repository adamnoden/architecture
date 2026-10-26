# Architectural Drawing Engine

`compiler/architectural-drawing/` is the semantic/representation layer between architectural authority and the low-level publication vector backend.

The boundary is deliberate:

```text
architectural source / compiled facts
        ↓
architectural-drawing semantic model
        ↓
architectural-drawing representation compiler
        ↓
publication-drawing / DrawingScene
        ↓
SVG / PDF
```

## What this layer owns

This layer may own **representation semantics** such as:

- physical wall runs and wall-network topology;
- references to source-owned wall assemblies;
- openings hosted by physical walls;
- unresolved partition datums that are explicitly not walls;
- required adjacency without invented doors;
- authority / precision / provenance carried into representation;
- model-space dimensions and labels;
- architectural scale and BOOK/WALL/PROOF representation profiles;
- later, proved rules for joins, opening subtraction, uncertainty and scale-appropriate assembly visibility.

## What this layer does not own

It may not decide architecture merely to complete a drawing. In particular it must not invent:

- wall construction families;
- internal partition thicknesses;
- door positions or swings;
- window/frame positions;
- technical junction details;
- structural, thermal or regulatory adequacy.

Those remain upstream architectural / engineering / evidence decisions.

## Model-space first

ADE semantic geometry is expressed in real/model millimetres. It is not pre-scaled into paper coordinates.

A representation profile supplies the conventional architectural scale:

```text
1000 model mm @ 1:100 → 10 paper mm
1000 model mm @ 1:50  → 20 paper mm
```

Paper-space notation remains physical:

```text
2 mm marker @ 1:100 → 2 paper mm
2 mm marker @ 1:50  → 2 paper mm
```

Later representation packets may decide that a larger scale exposes more **already-owned** architectural structure. Scale never creates new source authority.

## Partition contract

`AdePartitionDatum` is intentionally a separate type from `AdeWallRun`.

A partition datum:

- has model-space location;
- has provenance;
- has no wall assembly;
- has no thickness;
- cannot host an architectural opening.

When architecture actually selects a physical partition family, that condition is represented as an ordinary physical wall run with an owned wall assembly. The drawing engine does not silently promote a datum into a wall.

## Wall assembly contract

An `AdeWallRun` is physical enough to require an `AdeWallAssembly` reference. The assembly's thickness may still be exact, approximate, ranged or unresolved depending on source authority.

ADE-03 will extend this boundary only as much as required to express source-owned coordination layers such as the Reference House cavity-wall family.

## Opening contract

An `AdeOpening`:

- must be hosted by a physical wall;
- carries separate position and width authority;
- may be exact, approximate, ranged, qualitative or unknown;
- does not imply a door leaf, frame, reveal or technical closure unless those facts are separately owned.

ADE-04 owns the later graphic grammar for these precision states.

## Current packet boundary

ADE-01 defines and validates semantic intent only. It does **not** compile wall bodies, joins, openings or uncertainty into `DrawingScene` yet.

That separation is intentional. The next packet, ADE-02, must prove wall topology and join behaviour against small fixtures before any Reference House redraw resumes.
