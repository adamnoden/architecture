# Compile an explicit Georgian plan document

The prototype admits a saved `current-design/1` document through the named source resolver and emits a `current-design-compile/1` result. It reuses the existing Georgian layout-family method for the ground and first floor plan scenes at 1:100. The method still owns its nominal drawing limits. The result carries the supplied plan digest, method identity, both scenes, the nominal envelope/court dimensions and verified discipline applicability bindings.

The accepted Georgian drawing method still closes over its native layout family. The compile boundary compares the complete supplied nominal document with the owning source before invoking that method. A one-window edit under the accepted source ID fails. An admitted candidate uses the shared orthogonal plan model and ADE scene compiler with its own envelope, court, nominal wall depths, partitions and hosted openings. It produces independent schematic ground and first floor proof scenes, without the Georgian fittings, annotation or discipline bindings.

## Execute

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts -
```

The first command explicitly exports the named authored input. The second reads standard input through `-`, or accepts an explicit document path. Omitted, malformed, unverifiable or incorrectly identified inputs fail without an output. An admitted, drawable candidate returns scoped nominal plans and a diagnostic explaining which representation and technical claims remain outside the method. Invalid host geometry fails with the actual host/junction diagnosis. No compile path reads an older technical fixture.

## Active entry points checked

| Entry point | Evidence and remaining migration |
| --- | --- |
| `compiler/reference-house/georgian/layout-family.ts` | The nominal view method reads the current Georgian design family. The prototype reuses its ground/first scene paths after exact applicability. Roof, section, exterior and the actual occupied service composition remain outside this method. |
| `publication/primer/figure.ts`, `publication/adapters.ts` | Prepare, validate and integrity explicitly supply the named current document. The adapter takes both the quoted dimensions and the ground-floor scene from one compile result. The page composer retains its existing filtering, translation and SVG renderer. |
| `publication/figures.ts`, `publication/plates-current.ts` | The production figure pipeline includes explicitly historical predecessors in the Part IV placement register. Historical captions and paths should remain attributable during any future replacement. |
| `compiler/reference-house/output/generate.ts`, `output/build.ts`, `output/context.ts` | The `outputs:*` commands, generated service/boundary registers and structural inspection are historical tooling with a default RH-C fixture. This prototype never calls them. `scripts/dataplate.ts` consumes the historical technical output manifest as an assessed identity. A revised label cannot make that manifest current. |
| `project/had/studies/current-house.mjs`, `project/mra/studies/internal-leak-study.mjs` | The occupied house assembler owns the selected service schedule and component occurrences. Its CLI derives and exports from tracked inputs. MRA checks that its actual receipt reproduces. The present compile emits references to those inputs with their scope, without reproducing the service schedule from guessed geometry. |
| `project/str/studies/house-source.ts`, `project/str/studies/current-house-joined-foundation.py` | The initial structural study pins named source files. The joined Python calculation combines actual receipt and producer paths with the retained load-state scope. Both need explicit current method adapters before their results can be returned by the headless compile. |
| `project/rwt/studies/selected-water-event.mjs`, `project/rwt/studies/east-ground-outfall.mjs` | The event uses a pinned composed HAD source. The east-ground helper still permits its documented old MAT dock fallback when the current file is missing. The source resolver blocks a missing live dependency for this prototype; the downstream helper still needs its own explicit input path. |

## Acceptance

The tests compile the actual saved current document, compare both native scene objects, verify that discipline bindings use the same supplied plan digest, and exercise the real CLI entry point. Input controls reject a stale current width. The non-square specimen compares an actual 760 to 920 mm ground-floor window change in the resulting setout, preserves its centre, and does not change the first-floor scene. The historical output family remains separately reproducible.

The actual Primer reference-house Markdown and its standalone ground-plan SVG match the pre-cutover bytes. The adapter rejects a missing source, a stale court dimension under the current ID and an explicitly labelled alternate at the publication boundary. Its page composition still preserves native primitive order, evidence metadata and physical scale.

This is a nominal-plan compile checkpoint with the Primer route migrated. Other current drawing and publication consumers, the occupied service schedule and the engineering callers still need explicit adapters. The independent alternate method covers schematic layout geometry; authored room/title placements, architectural styling, fittings, discipline results and publication approval remain outside that method. Those are the remaining current-compile and integration boundaries.
