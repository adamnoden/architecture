# Publication build system

`publication/` contains the executable machinery that prepares, validates and renders Ovid’s House publication outputs.

It is the **build/tooling side** of publication. The authored architectural drawing and publication authority/proof records live separately under [`../docs/publication/`](../docs/publication/).

## What this area owns

This tree owns publication-specific implementation such as:

- source adaptation and preparation;
- figure integration;
- validation and integrity checks;
- metadata generation/checking;
- Vivliostyle configuration and print layout;
- primer/full-build variants;
- bounded physical/specimen proof harnesses under `specimens/`.

The command authority is [`../package.json`](../package.json). Scripts under [`scripts/`](scripts/) implement the shared preparation, validation, metadata and integrity workflows.

## What this area does not own

The build system does not own:

- architectural doctrine or manuscript claims — see [`../docs/manuscript/`](../docs/manuscript/);
- Reference House architectural decisions — see [`../docs/reference-house/`](../docs/reference-house/);
- drawing authority merely because a drawing is placed in a PDF — see [`../docs/publication/`](../docs/publication/);
- compiler-generated semantic inspection — see [`../docs/reference-house/generated/`](../docs/reference-house/generated/);
- present programme status — see [`../STATUS.md`](../STATUS.md).

A successful build proves that the publication pipeline satisfied its encoded checks. It does not prove the truth, engineering adequacy or regulatory compliance of the architectural propositions being rendered.

## Ordinary workflow

Install locked dependencies first:

```sh
npm ci
```

Pinned publication fonts and their licences are cached in
`node_modules/.cache/ovids-house/publication-fonts`, outside disposable preparation
directories. Every cached file is checked against its existing upstream Git blob
pin before use; missing or corrupt entries are downloaded and verified before
replacement. Full, Primer and current specimen preparation can therefore share
verified bytes and work offline once cached. CI restores this cache after
`npm ci`; the cache never changes the selected font pins or staged provenance.

### Browser prerequisites

The figure-bounds validator and Mermaid preparation use Puppeteer and require a compatible Chrome/Chromium browser. If a browser is already installed, select it before running those commands (adjust the path for your machine):

```sh
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

Otherwise, install Puppeteer's pinned browsers from the repository root:

```sh
npx puppeteer browsers install chrome
npx puppeteer browsers install chrome-headless-shell
```

Vivliostyle uses its own browser selection. To render with an existing browser, prepare the source and pass its executable explicitly:

```sh
npm run publication:prepare:smoke
npx vivliostyle build -c publication/vivliostyle.config.js --executable-browser /usr/bin/chromium
```

Mermaid preparation loads a local HTML file. A managed browser policy that rejects it with `ERR_BLOCKED_BY_ADMINISTRATOR` requires supported browser access from the environment administrator; selecting an executable does not override that policy. Figure-bounds validation can pass independently of PDF rendering. Keep TLS verification and managed browser policies intact.

### Commands

Useful stable entry points are:

```sh
npm run publication:validate       # validate publication source/figure contracts
npm run publication:integrity      # check publication integrity invariants
npm run publication:build:smoke    # build the smoke publication
npm run publication:build:primer   # build the primer
npm run publication:build          # prepare and build the full publication PDF
npm run publication:metadata:check # verify committed publication metadata
```

Use the dedicated specimen command named by a drawing/proof record when validating a physical page, spread, typography or scale boundary. Do not substitute a generic PDF build for a specialised proof that checks more specific geometry or physical-output invariants.

## Authored Primer framing

`primer/` is a narrow authored-source exception within this build tree. Its proposition, outlook and composition fragments own the Primer’s editorial framing; the linked manuscript, pattern and Reference House sources retain architectural authority. `adapters.ts` selects and compresses those sources and fills explicit `<!-- primer:… -->` composition slots. It does not own architectural prose. All fragments and all pattern metadata used by the complete map are declared through the existing adapter dependencies, which publication preparation and EDA corpus discovery both consume. Inventory counts use the existing canonical pattern order and publication manifest; there is no separate Primer inventory.

## Source and generated boundaries

The publication pipeline consumes authored architectural/documentation sources and controlled drawing assets, then prepares downstream publication material for rendering.

Do not edit temporary/prepared build intermediates as if they were source. Fix the owning manuscript, drawing source, adapter, renderer or layout rule and rerun the appropriate preparation/build workflow.

Likewise, do not assume that every drawing consumed by the publication is generated by this tree. Drawing authority and editability are defined by the owning record under [`../docs/publication/`](../docs/publication/) or the architectural source it names.

## Current house plates

The active Part IV register in `plates-current.ts` uses two nominal plans, the current front elevation and principal section from the admitted current design compiler, and three conditional furnished Study comparisons. `current-assets.ts` builds them in memory for validation and stages them under `publication/.work/source/publication/current` during full preparation. No prepared directory or old generated image is needed to start a clean build.

The furnished Study producer must reproduce its retained output before publication reframes its existing room groups and converts the paint to neutral black tints. The room geometry, furniture and authored finish choices remain owned by IAS and the shared compiler. Preparation records source, producer and asset identities in `publication/.work/current-publication-assets.json`; production typography verifies those exact generated bytes before its reversible font transformation.

The old house artwork and its historical plate register remain recoverable outside the active edition. The nominal house views do not establish the coordinated roof weather/support datums, raised floor proposal or structural selection. The Study images are proposals for owner review, with physical performance and aesthetic acceptance still open.

## Proof boundary

Publication validation can establish things such as:

- required source/figure presence;
- deterministic integration and identity checks;
- metadata consistency;
- page/layout constraints explicitly encoded by the relevant proof;
- physical typography/scale/placement where a dedicated specimen validator measures them.

It cannot establish architectural merit, construction adequacy, building physics, structural capacity, professional acceptance or statutory compliance.

For the repository-wide map see [`../README.md`](../README.md); for current project/workstream state use [`../STATUS.md`](../STATUS.md).
