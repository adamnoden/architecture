# Compile one explicit current design

The current entry point admits a saved `current-design/1` document through the named source resolver and emits a `current-design-compile/1` result. It reuses the existing Georgian layout-family method for the ground and first floor plan scenes at 1:100. The method still owns its nominal drawing limits. The result carries the supplied plan digest, method identity, both scenes, the nominal envelope/court dimensions and verified discipline applicability bindings.

The accepted Georgian drawing method still closes over its native layout family. The compile boundary compares the complete supplied nominal document with the owning source before invoking that method. A one-window edit under the accepted source ID fails. An admitted candidate uses the shared orthogonal plan model and ADE scene compiler with its own envelope, court, nominal wall depths, partitions and hosted openings. It produces independent schematic ground and first floor proof scenes, without the Georgian fittings, annotation or discipline bindings.

## Execute

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts -
```

The first command explicitly exports the named authored input. The second reads standard input through `-`, or accepts an explicit document path. Omitted, malformed, unverifiable or incorrectly identified inputs fail without an output. An admitted, drawable candidate returns scoped nominal plans and a diagnostic explaining which representation and technical claims remain outside the method. Invalid host geometry fails with the actual host/junction diagnosis. No current compile path reads an older technical fixture.

From the repository root, `--bundle` requests all three admitted projections through a single source resolution.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --bundle -
```

The bundle contains both plan scenes, the native occupied schedule and the native selected-event ledger. Each compiled result cites the same input plan digest and its own method. The specialist results include the verified native producer blob and conditional applicability. The native JSON bytes retain their original format. A candidate bundle returns both nominal candidate scenes and object-linked unavailable diagnostics for the two selected-house calculations. The standalone ledger routes still reject candidates and emit no result.

## Active entry points checked

| Entry point | Evidence and remaining migration |
| --- | --- |
| `compiler/reference-house/georgian/layout-family.ts` | The nominal view method reads the current Georgian design family. The current drawing projection reuses its ground/first scene paths after exact applicability. Roof, section, exterior and the actual occupied service composition remain outside this method. |
| `publication/primer/figure.ts`, `publication/adapters.ts` | Prepare, validate and integrity explicitly supply the named current document. The adapter takes both the quoted dimensions and the ground-floor scene from one compile result. The page composer retains its existing filtering, translation and SVG renderer. |
| `publication/figures.ts`, `publication/plates-current.ts` | The production figure pipeline includes explicitly historical predecessors in the Part IV placement register. Historical captions and paths should remain attributable during any future replacement. |
| `compiler/reference-house/output/generate.ts`, `output/build.ts`, `output/context.ts` | The `outputs:*` commands, generated service/boundary registers and structural inspection are historical tooling with a default RH-C fixture. The current entry point has no path to those historical methods. `scripts/dataplate.ts` consumes the historical technical output manifest as an assessed identity. The historical manifest retains its existing authority. |
| `project/had/studies/current-house.mjs`, `project/mra/studies/internal-leak-study.mjs` | The occupied-house assembler remains the selected service calculation. The current CLI now resolves the explicit design, invokes that assembler, and compares the 17 actual input identities to the HAD binding before emitting its native schedule bytes. The three native drawing exports and MRA’s direct producer use remain on their existing paths. |
| `project/str/studies/house-source.ts`, `project/str/studies/current-house-joined-foundation.py` | The initial structural study pins named source files. The joined Python calculation combines actual receipt and producer paths with the retained load-state scope. Both need explicit current method adapters before their results can be returned by the headless compile. |
| `project/rwt/studies/selected-water-event.mjs`, `project/rwt/studies/east-ground-outfall.mjs` | The selected-event report now has an explicit current-design route. The adapter binds the selected HAD receipt and RWT receiving input before invoking the owning event calculation. The separate east-ground helper still requires migration because it permits its documented old MAT dock fallback when the current file is missing. |

## Acceptance

The tests compile the actual saved current document, compare both native scene objects, verify that discipline bindings use the same supplied plan digest, and exercise the real CLI entry point. Input controls reject a stale current width. The non-square specimen compares an actual 760 to 920 mm ground-floor window change in the resulting setout, preserves its centre, and does not change the first-floor scene. The historical output family remains separately reproducible.

The actual Primer reference-house Markdown and its standalone ground-plan SVG match the pre-cutover bytes. The adapter rejects a missing source, a stale court dimension under the current ID and an explicitly labelled alternate at the publication boundary. Its page composition still preserves native primitive order, evidence metadata and physical scale.

The implemented contract closes the current-compile foundation. Domain migrations still own other drawing and publication consumers, native service drawing/regeneration, structural and other engineering callers. The independent alternate method covers schematic plan geometry. Room/title placement, architectural styling, fittings, discipline results and publication approval remain outside that method.

| Foundation obligation | Executed evidence |
| --- | --- |
| One explicit entry point and separation of I/O | The command reads one explicit JSON document. The orchestration resolves it once and requests the named projections. Primer requests plans only. The selected HAD and RWT methods load only when called and retain their own validated producer reads. |
| Existing methods and stale-input handling | Native plan geometry, service composition and event calculation remain the owning methods. Source coverage and receipt identities reject changed or missing inputs before a bundle emits output. The HAD method cross-checks the 17 input identities it actually reads. The RWT method checks the actual HAD and authored RWT inputs. |
| Typed results and current caller identities | The bundle names the plan source and methods. Plan diagnostics link to both storeys. The candidate exclusion links to the supplied candidate ID. The CLI, drawing and production Primer preserve the same plan source. The schedule and calculation commands use their declared source bindings and return their native payloads. |
| Supported mutation and separate historical path | The non-square candidate changes a rendered window from 760 to 920 mm at the same centre and preserves the first-floor scene. A stale accepted tag fails. The explicit historical command `node --import tsx compiler/reference-house/output/verify.ts` reproduces its own retained output family. A historical fixture supplied to the current command is rejected. |

Full active-consumer cutover, assemblies, structural loads, services integration, evidence invalidation and release against the final selected design are later programme gates. Native RWT replay still requires the repository-root working directory. No site or installed performance claim follows from source integration.

## Occupied-service schedule

Supply the same explicit snapshot used for the current plan. The selected HAD compositor still owns the calculation and writer. The adapter compares its actual read receipts with the resolved service family before writing any schedule bytes.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --occupied-services -
```

The applicable document reproduces `project/had/studies/current-house-services.json` byte for byte. Missing input, a candidate document or a stale accepted-source document produces no schedule. Existing adoption and qualification fields retain their original meaning. This route publishes no service drawing and makes no installation claim.

## Selected water event

From the repository root, pass the same explicit current design used by the plan and occupied-service schedule.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --selected-water-event -
```

The route emits the native `selected-water-event.json` ledger byte for byte. It verifies both the actual composed HAD and authored RWT receiving bindings before calling the owner’s calculation. An absent or stale design, missing authority, or a candidate yields no event. The ledger retains its adverse scenarios and conditional claim limits. The native drawing, other hydraulic consumers and final network remain separately scoped.
