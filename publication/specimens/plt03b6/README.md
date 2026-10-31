# PLT square-house comparison

Owner choice #905: 12 m square shell, centred 3.6 m square courtyard, aligned
service-wall faces, paired opposing windows, separate kitchen pantry, larger
study and 3.1 m ceilings on both floors. Modest-plot constraints are deferred.

B5/A4 paper: previous programme on page 1, square revision on page 2 at 1:100.
A2: square revision only at 1:50. Print at actual size without fit scaling.

```bash
node --import tsx publication/specimens/plt03b6/prepare.ts
PLT03B6_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt03b6/vivliostyle.config.js
PLT03B6_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt03b6/vivliostyle.config.js
PLT03B6_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt03b6/vivliostyle.config.js
node --import tsx publication/specimens/plt03b6/validate.ts
```

The manifest includes the bounded four-option stair comparison and circulation
check. The selected balanced return retains 300 mm goings, increases its open
well/landing and accepts 191.7 mm rises over the taller floor height. Do not
infer structural floor-opening, guarding or headroom proof from the plan.
Both source levels compile; the companion first-floor SVG remains coordination
evidence. B3/B4/B5 fingerprints and the historical release remain protected.
Finished-PDF pages, measured x/y scale and embedded typography remain gated.
