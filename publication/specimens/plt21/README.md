# Four complete exterior isometrics

Generate the four tracked direct SVGs with `node --import tsx publication/specimens/plt21/prepare.ts`.
Verify them with `node --import tsx publication/specimens/plt21/prepare.ts --check`.

For finished proof pages, run the preparer with `--proof`; build each of `b5`,
`a4` and `a2` using `PLT21_FORMAT` and this directory's Vivliostyle config; then
run `node --import tsx publication/specimens/plt21/validate.ts`.

BOOK has four individual views. A2 has four views plus a 2×2 BOOK-factor comparison.
Standalone SVGs use 420 × 390 mm; A2 uses 420 × 594 mm at the same fixed factor,
with translation only. Each physical profile has one common factor for all cameras.
Nothing is fit-scaled per view. SVGs contain only vector linework, so their
appearance has no font-download dependency. PDF captions embed pinned Source Sans 3.

The [source and admission record](../../../docs/publication/architectural-plate-exterior-isometrics.md)
records omissions, current roof provisionality and release boundaries.
