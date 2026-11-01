# PLT room-programme revision

Owner choice #903: south-west study, open hall/family, eastern guest WC and
walk-in cloakroom with separate doors. This is a current-house coordination
candidate, not approval of an RSI successor or a physical/token freeze.

B5/A4 page 1 = retained B4; page 2 = new room programme, both 1:100.
A2 = revision only at 1:50. Print at actual size without fit scaling.

```bash
node --import tsx publication/specimens/plt03b5/prepare.ts
PLT03B5_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt03b5/vivliostyle.config.js
PLT03B5_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt03b5/vivliostyle.config.js
PLT03B5_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt03b5/vivliostyle.config.js
node --import tsx publication/specimens/plt03b5/validate.ts
```

Preparation checks closed room reservations, whole-system topology, the retained
stair passage and historical B3/B4 fingerprints. Finished-PDF validation checks
page dimensions/counts, measured x/y drawing scale, constant note size and
embedded Source Sans/Unicode. Fit tests check the authored desk/chair, hanging
zone, WC/basin, removable service lining and door/fixture clearances. These
planning choices do not prove manufactured product fit, drainage falls,
ventilation capacity, accessible doorset widths or stair headroom/framing.
