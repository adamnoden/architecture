# ADE ground-plan physical proof

PLT-03B.2 restarts PLT-03B from the verified ADE replacement. It does not reuse
superseded direct-primitives PDFs or freeze drawing tokens.

```
node --import tsx publication/specimens/plt03b2/prepare.ts
PLT03B2_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt03b2/vivliostyle.config.js
PLT03B2_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt03b2/vivliostyle.config.js
PLT03B2_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt03b2/vivliostyle.config.js
node --import tsx publication/specimens/plt03b2/validate.ts
```

B5 and A4: page 1 protected v1, page 2 ADE replacement, both exact 1:100.
A2: replacement only, exact 1:50. Page 1 is a historical source comparison;
it does not isolate a typography or hierarchy hypothesis. The ADE scene and
tokens remain unchanged. No extra plate furniture is introduced.

The validator measures horizontal bay-marker separation, vertical annotation
separation and note size in the finished PDF, not only source/CSS dimensions.
Finished candidate pages require both embedded, subset Source Sans faces with
Unicode mapping; historical baseline fonts are excluded from that font gate.
The dedicated read-only workflow retains PDFs and fingerprint evidence.

Print B5 page 2 and the A2 page at **Actual size / 100%**. See the owning
[review record](../../../docs/publication/architectural-plate-plt03b2-ade-physical-review.md)
for the uncertainty key and verdict boundary. Screen/CI success cannot supply
owner physical acceptance.
