# Publication release candidates

This directory contains machine-readable publication release-candidate contracts.

A release-candidate record freezes an already-proven production object for a bounded release gate. It is not design authority and must not be used to bypass the owning typography, drawing, manuscript or manufacturing programmes.

`typ09c.json` freezes the TYP-09C typography RC1 production/rebuild-equivalence contract, the distinction between exact artifact identity and cross-run layout equivalence, and the bounded pre-`drawing-publication-v2` PLT compatibility state.

`typ09d1.json` retains the subsequent RC2 contract. Both records and their verification scripts remain historical evidence. The superseded RC1 dispatch-only notice workflow has been retired; current production is checked by the [publication typography proof workflow](../../.github/workflows/publication-typography.yml), which does not claim to reproduce either frozen candidate.
