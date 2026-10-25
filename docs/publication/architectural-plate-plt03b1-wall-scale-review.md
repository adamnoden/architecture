<!-- nav-exclude: redirect -->
# PLT-03B.1 — A2 WALL 1:50 screen-review gate

**Programme:** PLT — Architectural Plate Refinement  
**Parent:** #746 / PLT-03  
**Packet:** #772 / PLT-03B.1  
**Comparison:** exact A2 COMBINED 1:100 control versus exact A2 COMBINED 1:50 candidate  
**Owner physical verdict:** `UNREVIEWED`

## Decision

The exact A2 **1:50 COMBINED candidate advances through the screen-composition gate**.

The exact A2 1:100 control remains rejected for WALL use. Its 136 × 145 mm architectural field reads as a book-scale object floating in a 420 × 594 mm sheet. The problem is sheet occupation, not semantic or mechanical validity.

At 1:50 the same current-authority drawing becomes a credible A2 architectural plate:

- the plan has sufficient presence at across-room distance without approaching poster theatre;
- the larger architectural geometry improves figure/ground and room-order legibility;
- the unchanged paper-space line family remains restrained against the larger geometry;
- the unchanged Source Sans 3 drawing typography remains quiet rather than scaling theatrically with the plan;
- provisional/qualitative dashed information remains visibly subordinate to controlled architecture;
- the light poche reads as architectural cut matter without returning to the v1 black-diagram condition;
- white space remains substantial enough that the sheet still belongs to the same restrained BOOK/WALL system.

No A1 experiment is earned by this screen review.

## Mechanical proof

Successful proof head before this review record:

`4b3e339027bf1f39ac872fff560da6b757d4c272`

Dedicated workflow:

- run: `40236474660` — SUCCESS;
- artifact: `12615630586` — `plt-03b1-a2-wall-50-proof`;
- artifact digest: `sha256:0303d567bebfed54a39e9629e4eca5196dffe69f3bd676ba1b31d9f9e3d6b408`.

The proof established:

- two exact 420 × 594 mm A2 pages;
- page 1 = rejected true 1:100 COMBINED control;
- page 2 = true 1:50 COMBINED candidate;
- architectural scale factor exactly 2 from control to candidate;
- no fit-to-page scaling;
- identical semantic entity set;
- identical drawing text content;
- unchanged paper-space line weights, dash sizes and typography;
- exact TYP-06 Source Sans 3 Regular / 400 and Bold / 700 identity;
- no C-class geometry;
- no unexplained semantic `X`.

Whole-repository PR validation and publication-typography production proof were also green on the same head.

## Boundary

This is **not** physical acceptance and does not freeze `publication-drawing-v2` tokens.

The candidate must now be reviewed as an actual-size A2 object. The required owner verdict is intentionally binary enough to avoid inventing observations after the fact:

- `LGTM` — 1:50 A2 WALL profile is physically accepted and PLT-03 may proceed to exemplar/token freeze; or
- revision requested — record the concrete physical defect and return to a bounded PLT-03 candidate packet.

Do not infer physical acceptance from screen review, PDF zoom, raster inspection or CI success.

## Handoff

**Next gate: actual-size A2 owner physical review of the 1:50 COMBINED candidate.**

After physical acceptance: PLT-03C — ground-floor exemplar freeze + reusable v2 token extraction.
