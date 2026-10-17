<!-- nav-exclude: redirect -->
# DRW-00B — current figure / publication before-state

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-00B  
**Status:** DONE  
**Issue:** #154  
**Capture head:** `481a7c0c888654dadd363044b0f7470134f03b61`  
**Capture workflow:** run `39057699058` — PASS  
**Evidence artifact:** `drw00b-before-state`, artifact `12109992041`, SHA-256 digest `d3d7b7dbea005e0ee3a76ec15b2749591ff862a1dbe17baa93866e0e911c9f9d`

## 1. Purpose

This record freezes the publication visual state that DRW inherits before it classifies or redraws anything. It is descriptive, not an endorsement of the current figures.

The active source of publication placement truth is `publication/figures.ts`. Historical `D-F*` identities are not revived here.

## 2. Active Working Edition figure inventory

| # | Entry | Current asset | Git blob | Bytes | Working Edition page | Current alt text |
|---:|---|---|---|---:|---:|---|
| 1 | `part-i` | `docs/manuscript/figures/selective-permanence-platform.svg` | `8abf5a2298134a9967e081b857484c8e8fe22128` | 3399 | 24 | Selective permanence and the architectural platform |
| 2 | `part-ii` | `docs/manuscript/figures/designed-interface-functions.svg` | `d8a4c0382479f45e554f7da409fd0b7fb067a291` | 3394 | 40 | Functional decomposition of a designed interface |
| 3 | `part-ii` | `docs/manuscript/figures/failure-architecture-sequence.svg` | `293accf77ce355423122536b9290b885900763ec` | 5474 | 46 | Failure architecture from first defence through recovery |
| 4 | `part-ii` | `docs/manuscript/figures/maintenance-geography-route.svg` | `23fc7bb35ff9b4d0bb3e4728e9004b4240a6ce3b` | 5359 | 49 | Maintenance route from approach to withdrawal |
| 5 | `part-iii` | `docs/manuscript/figures/pattern-language-fields-sequence.svg` | `41eee9d86282c4024ed32040732226838ba349c6` | 7121 | 69 | Pattern-language fields and one generative service-topology sequence |
| 6 | `part-iv` | `docs/manuscript/figures/reference-house-type-orientation.svg` | `fb20e00a51d6698f49e095b7f5542290b6c6bd5b` | 4356 | 158 | Reference House type and orientation |
| 7 | `part-iv` | `docs/manuscript/figures/reference-house-spatial-sectional-order.svg` | `e06b7e0d3d579e600f7229cc8dad053b9a5d381b` | 4222 | 160 | Reference House spatial and sectional order |
| 8 | `part-iv` | `docs/manuscript/figures/reference-house-structural-assembly-logic.svg` | `66cd56145f83c58867d4b3c841efb8c95762cd61` | 4872 | 163 | Reference House structural and assembly logic |
| 9 | `part-iv` | `docs/manuscript/figures/reference-house-service-maintenance-geography.svg` | `e15537d1ed70aed8c0454f5e86e950e1a88de860` | 4328 | 167 | Reference House service and maintenance geography |
| 10 | `part-iv` | `docs/manuscript/figures/reference-house-external-maintenance-geography.svg` | `be7d1cba07e6907d9808b0f7ae1dfb49330b66dc` | 3638 | 168 | Reference House external maintenance geography |
| 11 | `part-iv` | `docs/manuscript/figures/reference-house-water-failure-geography.svg` | `6a9499159c7294854af5f4779284894374145b1a` | 4105 | 170 | Reference House water and failure geography |

All 11 placements resolve to 11 distinct tracked SVG assets and all 11 authored captions occur exactly once in the generated Working Edition text layer.

## 3. Generated publication evidence

| Product | SHA-256 | Pages | Page size | File bytes |
|---|---|---:|---|---:|
| Working Edition | `276a957af0767b1c7480e228b788f74659768349266839097de0e3aa64274025` | 217 | 595.276 x 841.89 pts (A4) | 1557448 |
| Primer | `031ca61a95bf22e3e6a1aa7a323de3c37c646ce568c035169ec6789b4efe2e9b` | 15 | 595.276 x 841.89 pts (A4) | 163247 |

The PDFs are generated products, not committed source. Their hashes bind this record to the exact captured output at the capture head. The ordinary publication build and metadata check passed before this record was written.

## 4. Visual evidence capture

Capture run `39057699058` rasterised every unique Working Edition page containing a current figure at 120 dpi and uploaded those PNGs together with both generated PDFs and the extracted text/placement data as artifact `12109992041`.

The artifact contains exactly:

- 11 Working Edition figure-page PNGs — pages 24, 40, 46, 49, 69, 158, 160, 163, 167, 168 and 170;
- `ovids-house.pdf`;
- `ovids-house-primer.pdf`;
- extracted Working Edition and Primer text;
- the exported active placement JSON;
- this manifest as captured at generation time.

The 11 raster pages were inspected as a contact sheet after download; all expected page captures are present and readable as before-state evidence.

The workflow artifact is inspection evidence, not the durable source of truth. Durable evidence is the Git history for the SVG blobs, the placement registry, this manifest, and the deterministic publication build.

## 5. What this packet does not decide

- no figure has yet been classified `RETAIN`, `REPLACE`, `DEMOTE` or `REMOVE`;
- no final drawing list, scale, page class or public figure numbering is implied;
- current page positions are before-state facts, not targets;
- current hand-authored SVG geometry is not promoted to architectural source authority;
- no Reference House source or renderer capability changes in this packet.

## 6. Handoff

**Next packet: DRW-00C — freeze physical publication-format assumptions that the drawing programme must target.**

DRW-00D, not this packet, will judge the disposition of the current figures.