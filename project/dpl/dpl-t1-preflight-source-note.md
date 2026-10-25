# DPL-T1 — source provenance note

The geometry-first preflight uses only controlled or explicitly bounded public-source inputs:

- Bromley planning/application material naming `41 Lennard Road, Bromley, BR2 8LN` and planning reference `26/02618/FPA`;
- an earlier planning statement for the same exact address giving BNG site coordinate `542903,166217`;
- public Open UPRN point data resolving that coordinate to UPRN `100020404537`;
- Planning Data's HM Land Registry `title-boundary` entity `12057071807` / reference `57071807`.

The UPRN point and planning coordinate converge within approximately 4 cm. No neighbouring-title selection by visual judgement was used.

The HMLR polygon remains an indicative index extent, not a determined legal boundary. The preflight result is therefore limited to controlled SCREENING geometry.

The disposable GitHub Actions workflow used to transport the public API bytes was removed before merge. No acquisition scraper or workflow becomes product/repository machinery through DPL-T1.
