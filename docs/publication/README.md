# Publication and drawing records

`docs/publication/` contains the **authored authority, design and proof records for architectural drawing and publication production**.

It exists because a publication drawing needs more than a finished image: the repository must retain what the drawing is allowed to claim, which source owns its geometry, what uncertainty must remain visible, how it is placed on the page, and what physical/rendered proof has actually been performed.

This directory is therefore a record/authority layer. It is **not** the executable publication build system; that lives at top-level [`../../publication/`](../../publication/).

## What this area owns

Records here may establish or document:

- drawing authority and source selection;
- view/figure disposition and claim mapping;
- graphic tokens, notation and page grammar;
- bounded architectural source decisions needed for a controlled drawing;
- renderer/artifact proof records;
- physical page/spread proof and publication integration decisions;
- adversarial checks against invented geometry, false scale or overclaiming.

A record may be packet-specific because the packet identity is useful provenance. That does not make the README a live packet tracker.

## What this area does not own

This directory does not own:

- the general Ovid’s House architectural proposition — see [`../manuscript/`](../manuscript/);
- Reference House architecture merely because a drawing depicts it — see [`../reference-house/`](../reference-house/);
- compiler semantics or generated semantic inspection — see [`../computational/`](../computational/) and [`../../compiler/`](../../compiler/);
- publication build preparation, CSS, Vivliostyle configuration or metadata tooling — see [`../../publication/`](../../publication/);
- current programme state — see [`../../STATUS.md`](../../STATUS.md).

A physically successful page does not create architectural authority that its source does not own.

## Source and edit boundary

Before editing a controlled drawing or record, identify its owning source/gate. Publication drawings can be downstream of architectural source, deterministic renderer code or a bounded authored drawing source; the correct edit path is defined by the relevant authority/proof record.

Do not patch a rendered or generated artefact merely to improve appearance. If the problem comes from source geometry, uncertainty semantics, scale tokens or renderer behaviour, fix the owning layer and re-prove the dependent output.

Publication drawings are also distinct from [`../reference-house/generated/`](../reference-house/generated/), which is a compiler-generated semantic-inspection surface rather than publication artwork.

## Build and physical proof

Top-level [`../../publication/`](../../publication/) owns publication preparation, layout and PDF build machinery. Repository commands are defined in [`../../package.json`](../../package.json).

A publication build or physical-page proof demonstrates only the checked representation boundary: layout, scale/placement, typography, pagination, content identity or other explicit assertions. It does not prove the depicted architecture, engineering or regulatory adequacy.

For current drawing/publication workstream state, use [`../../STATUS.md`](../../STATUS.md) and the latest owning result rather than inferring progress from which packet records exist in this directory.

See [`../README.md`](../README.md) for the wider documentation ownership model.
