<!-- nav-exclude: redirect -->
# DRW-11F-3 — Failure-architecture FLOW redraw

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-11F-3  
**Status:** PASS pending final-head validation and merge  
**Issue:** #154  
**Exact base:** `e4c82dbff2d14203796d07b562b26f6f903dc823`  
**Branch:** `drw-11f-3-failure-architecture-physical-redraw`

## 1. Question

Can the authorised Part II failure-architecture figure be re-authored in physical paper space while preserving its causal review logic, removing prose that belongs in the adjacent caption, and refusing to become a generic presentation flowchart?

## 2. Starting authority

DRW-11E froze this figure as **REDRAW — preserve causal sequence, reduce embedded prose**.

The authorised sequence remains:

`avoid → passive defence → failure event → localise → reveal → isolate → reach + repair → drain + dry → reinstate`

The figure is review logic. It has no authority to prescribe a plumbing, drainage, control or sensor topology, and it must not imply that every system requires every step.

## 3. Controlled artifact change

Reader-facing source:

- `docs/manuscript/figures/failure-architecture-sequence.svg`
- old blob: `293accf77ce355423122536b9290b885900763ec`
- accepted candidate blob: `59d107418763ac9811a761ab2da7b99f3a9fdb7a`

The redraw replaces the legacy `1500 × 780` screen-oriented viewport with a fixed **128 × 78 mm** physical frame using the established early-FLOW roles.

The composition is deliberately reduced rather than cosmetically modernised:

- first defence remains left-to-right: `Avoid → Passive defence`;
- a dashed threshold and black event point make the failure transition explicit;
- designed second consequence remains left-to-right: `Localise → Reveal → Isolate`;
- recovery turns down and runs right-to-left: `Reach + repair → Drain + dry → Reinstate`;
- the recovery datum is broken where the causal connector passes through it, avoiding a false graphic junction;
- rounded boxes, tonal fill and the two large bottom prose blocks are removed;
- the old embedded disclaimer is removed because the publication caption already carries that qualification;
- black line, direction and spacing carry the sequence.

No architectural object, product, detail or measured performance is invented.

## 4. Proof-family extension

DRW-11F-3 extends `publication/specimens/drw11f/` to three pages:

1. selective permanence — regression lock;
2. designed interface — regression lock;
3. failure architecture — active proof.

All three use the actual reader-facing SVGs at fixed 128 mm width on current A4 margins and conservative ISO B5. The validator checks all three physical frames and representative 7.5 pt / 6.5 pt roles.

## 5. Automated physical proof

First complete candidate head: `92a3103723d2f0300ee7f60f85bf7d7a498f2772`.

Dedicated proof run **`39507154214`**: **SUCCESS**.

The exact proof validates on both A4 and B5:

- three pages at requested physical page sizes;
- all three SVGs retain their **128 × 78 mm** physical frames;
- the two prior figures retain their representative 7.5 pt / 6.5 pt roles;
- `Localise` and `Reach + repair` resolve to the **7.5 pt** role within tolerance;
- `limit` and `access · diagnose · renew` resolve to the **6.5 pt** role within tolerance;
- A4 and B5 extracted sizes remain equal within frozen tolerance.

Proof artifact:

- artifact id: `12304620503`
- artifact name: `drw-11f-early-flow-proof`
- GitHub artifact digest: `sha256:2ff5cac559334a6d67dbd5415f3af1ff2df1fcffdc3fa26c728670fdfd0a3146`
- A4 PDF SHA-256: `ee01e9cc22c0436527cc7966a663d7444b7685a6a65f520416c9cc66ce9ee7cc`
- B5 PDF SHA-256: `9739e797726634541e1e2aa846d6feb52ab99c4d53db43b2d2be00dd8bb39eb2`

## 6. Physical inspection

The exact uploaded PDFs were rendered at 200 dpi and page 3 inspected in both formats.

**A4 page 3: PASS**

- no clipping, overlap or broken glyphs;
- first defence, failure threshold, second consequence and recovery remain visually distinct;
- the causal turn from `Isolate` into `Reach + repair` reads continuously;
- the broken recovery rule prevents the vertical causal line from reading as an accidental four-way junction;
- the figure remains subordinate to prose and caption.

**Conservative B5 page 3: PASS**

- fixed 128 mm width fits without scaling;
- all action labels and prompts remain legible;
- the right-to-left recovery row reads naturally from the downward causal turn;
- the failure-event threshold remains unmistakable;
- the figure no longer reads as a presentation slide or dashboard process map.

No further graphical work is earned in this packet.

## 7. What this proves — and does not prove

DRW-11F-3 proves that the causal failure/recovery logic can be carried by a physically controlled, restrained editorial figure.

It does **not**:

- prescribe every step for every system;
- make the boxes physical components;
- require sensors, automation or powered detection;
- select drainage, service or control topology;
- establish technical adequacy for any real junction;
- prove the remaining two early-book redraws.

## 8. Acceptance

**DRW-11F-3: PASS, subject only to exact-final-head validation and merge lease.**

On merge, programme completion advances to **77 / 85 = 90.59%**.

**Next authorised packet: DRW-11F-4 — physically re-author the maintenance-geography figure, preserving its four spatial task geometries and avoiding conceptual reinvention.**
