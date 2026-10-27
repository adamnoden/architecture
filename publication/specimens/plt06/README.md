# PLT elevation-family proof

Five pages: front, garden, service side, courtyard north, courtyard south.
B5/A4 true 1:100; A2 true 1:50. Print at 100%, no fit scaling.
The south courtyard aperture arrangement also represents east/west; no redundant
outer west plate is added. This specimen is programme **PLT-05 elevations**, not
completion of PLT-06 sections.

```bash
node --import tsx publication/specimens/plt06/prepare.ts
PLT06_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt06/vivliostyle.config.js
PLT06_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt06/vivliostyle.config.js
PLT06_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt06/vivliostyle.config.js
node --import tsx publication/specimens/plt06/validate.ts
```

Owning record: `docs/publication/architectural-plate-current-source-and-rollout.md`.
The accepted floor-plan source and historical proofs are unchanged. Roof-access
protection, dormer side returns and technical successor validation remain open.
