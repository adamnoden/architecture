# Paired square-house plans

Ground on page 1; resolved first floor on page 2. B5/A4 are true 1:100;
A2 is true 1:50. Print at 100%, without fit scaling. Ground SVGs must equal B6.

```bash
node --import tsx publication/specimens/plt04/prepare.ts
PLT04_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt04/vivliostyle.config.js
PLT04_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt04/vivliostyle.config.js
PLT04_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt04/vivliostyle.config.js
node --import tsx publication/specimens/plt04/validate.ts
```

B6 is owner-approved on screen for continued work. Physical inspection and
print-token release remain open. Shared candidate tokens retain exact ADE03B
values; this packet does not release `drawing-publication-v2`.

Source decisions: `docs/reference-house/first-floor-plan-resolution.md`.
Seven internal door sweeps stay within their own rooms. Existing floor-height,
headroom/framing and technical-performance limitations remain visible.
