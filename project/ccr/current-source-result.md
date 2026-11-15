# Current design snapshot from the Georgian layout

This implementation admits a versioned, serialisable snapshot for the ground and first floors of `RH-LAYOUT-REVISION-02`. The [current house basis](../../docs/reference-house/current-house-basis.md) describes the difference between the accepted Georgian arrangement and later selected HAD/STR/RWT developments. The adapter projects the Georgian source at its own scale of authority. Later variants require their own adapter inputs and disposition.

`compiler/reference-house/current-design/snapshot.ts` defines and validates `current-design/1`. It accepts a finite millimetre envelope, an internal court, two datum-linked storeys, room reservations, orthogonal partitions, hosted openings and nominal assembly-depth references. The document holds authored plan inputs. The validator derives the outside and courtyard host segments from the envelope rather than accepting duplicate wall coordinates. Opening centres are distances on the model X axis for a horizontal host and the model Y axis for a vertical host. Stable object IDs qualify source identifiers by storey. Opening hosts must resolve on the same storey, and assembly references must resolve to the expected role. Room boxes and assembly depths are reservations.

`compiler/reference-house/current-design/georgian-source.ts` is the named input adapter. It calls `revisionOpenings()` and reads the existing `layoutRevision` room, partition, storey and dimensional data. It projects the intermediate floor depth from the two owning level values. The envelope and partition reference IDs follow the Georgian drawing adapter. The intermediate-floor ID names its nominal reservation in this schema. Those IDs do not select a material, support or product. Door defaults follow the existing Georgian plan convention. The adapter reads the owning source on each call and returns a separate value.

Schema admission checks input shape and references. The `requireGeorgianDesignBasis` adapter matches the complete admitted payload to a fresh document from the owning Georgian source using the same canonical semantic JSON serializer as the compiler. A nominal source ID alone confers no authority. A caller supplying a candidate, changed accepted-basis payload or historical default receives an error. This input contract supplies no edit engine, compiler-result assurance, evidence invalidation or production cutover. Unknown or separately owned roof, STR, HAD/MAT and installed IAS/OAS results are explicit coverage gaps.

## Source and consumer inventory

| Path | Current disposition and controlling identity |
| --- | --- |
| `compiler/reference-house/georgian/layout-revision.ts` and `compiler/reference-house/georgian/plan.ts` | Current Georgian input and the nominal plan consumer. The revision owns the authoritative dimensions and occurrences in this snapshot. The plan adapts wall centreline or face ownership, splits display segments at joins and derives opening offsets. Its generic historical defaults remain outside the named snapshot adapter. |
| `compiler/reference-house/georgian/section-exemplar.ts`, `compiler/reference-house/georgian/source.ts` and `project/design-constraints.ts` | Inherited inputs used by the current Georgian revision. The earlier standalone shapes retain their own identities. The current adapter uses the revision's explicit inheritance rather than defaulting to the older edition. |
| `compiler/reference-house/georgian/layout-family.ts` and `compiler/reference-house/georgian/section-source.ts` | Current nominal drawings and section reservations. Roof geometry, vertical aperture detail, stair, entry void, room fittings, section cut and layer models remain with these sources and their domain owners. Their derived renderings are downstream. |
| `publication/primer/figure.ts` and `publication/adapters.ts` | Active current Georgian publication route. The primer figure calls the layout family and the prose adapter reads the layout revision. Both remain separate direct consumers for the current-compile inventory. |
| `publication/specimens/plt16/prepare.ts`, `publication/specimens/plt17/prepare.ts` and `publication/specimens/plt20/prepare.ts` | Candidate Georgian proof generators with separately bounded specimen claims. Final PLT release has its own consumer audit. |
| `project/str/studies/house-source.ts`, `project/str/studies/span-envelopes.ts`, `project/str/studies/wall-arch-envelope.ts` and `project/str/studies/reconciled-house-interface.py` | Current structural source and checks. The source adapter joins named architectural artifacts at its stated applicability boundary. Grid, support, slab, access and companion JSON receipts remain with STR. |
| `project/had/studies/water-replan.mjs`, `project/had/studies/water-replan.json`, `project/had/studies/current-house.mjs`, `project/had/studies/selected-service-interfaces.mjs` and `project/mra/studies/internal-leak-study.mjs` | Selected HAD water and services overlays and their occupied/water-fault consumers. The checked JSON is a derived interface for the existing compositor. An adopted HAD revision cannot be inferred from a room or opening’s Georgian ID. |
| `project/rwt/studies/selected-receiving-interface.json`, `project/ias/studies/workable-room-assemblies.mjs` and `project/oas/studies/study-subframe.mjs` | Selected receiving reservation and named IAS/OAS design consumers with their own acceptance limits. Keep actual receiver levels, assembly operation, ownership and validity separate from drawn geometry. |
| `project/bcr/studies/structure-geometry.ts`, `project/bcr/studies/services-feasibility.ts` and `project/bcr/studies/water-path-study.ts` | Feasibility consumers of current Georgian reservations. Each bounded result retains its own method, input and applicability. |
| `compiler/reference-house/fixture.ts`, `compiler/reference-house/system-compile.ts`, `compiler/reference-house/output/context.ts` and `compiler/reference-house/output/generate.ts` | Historical technical compile and inspection generators. `npm run outputs:generate` and `npm run outputs:check` retain the historical fixture-backed contract, including the default in the historical output context. This snapshot never calls those paths. |
| `publication/plates.ts`, `publication/plates-current.ts` and `publication/figures.ts` | The frozen predecessor plate register is historical. The current placement register and figures entry point still carry historical plates under explicit historical captions, as documented in the [HRS basis repair](../hrs/hrs-baseline-result.md). Current production drawings require their own source migration. |

### Entry points and direct-reference scan

Run these read-only commands at the repository root. The commands list exact entry-point declarations and executable references, including source and receipt path literals. Match lists are review inputs. Generic module names and shared sections can refer to more than one design edition.

```sh
rg -n 'compiler/reference-house|compiler/rhc[1-5]|publication/|project/(str|had|mat|rwt|ias|oas|bcr|mra)/' package.json
rg -n 'npm run (check|test|outputs:|publication:)|validate-publication|validate-plate' .github/workflows
rg -l -g '*.ts' -g '*.mjs' -g '*.py' -g '!*.test.*' \
  '(georgian/|[.]/)(layout-revision|layout-family|section-source|section-context|orthographic-family|book-composition)[.](js|ts)' \
  compiler project publication scripts | sort
rg -l -g '*.ts' -g '*.mjs' -g '*.py' -g '!*.test.*' \
  '(current-house[.](mjs|ts)|water-replan[.](json|mjs)|current-house-(grid|services|service-bay|occupied-interfaces|joined-foundation)[.]json|selected-receiving-interface[.]json|reconciled-house-interface[.]json|deriveCurrentHouse)' \
  compiler project publication scripts | sort
rg -l -g '*.ts' -g '*.mjs' -g '*.py' -g '!*.test.*' \
  '(createReferenceHouseSource|compileReferenceHouseSystem|createReferenceHouseOutputContext)' \
  compiler project publication scripts | sort
```

| Entry family | Source result and routing rule |
| --- | --- |
| `publication:prepare:primer`, `publication:build:primer` | The current primer source route runs through `publication/adapters.ts` and `publication/primer/figure.ts`. The diagram consumes the nominal Georgian layout family. Current prose imports the authored layout directly. |
| `publication:prepare`, `publication:build` and `publication/figures.ts` | Production preparation includes explicitly historical Part IV figures through `publication/plates-current.ts`. An active build can legitimately render a historical artefact whose caption and source both preserve that scope. |
| `npm run rh-c1:generate`, `outputs:reports:generate`, `outputs:spatial:generate`, `outputs:generate`, `outputs:check` | The older RH-C coordination and inspection path uses `compiler/reference-house/fixture.ts` through the historical compile/output context. The explicit Georgian source entry and applicability boundary are independent of these defaults. |
| `npm run test:rh-c1`, `npm run check`, compiler and publication validation workflows | Verification umbrellas. Keep Georgian, RH-C and candidate cases distinguishable by each test's inputs, regardless of the enclosing command name. Current-design snapshot tests register through the existing Reference House test glob. |
| `project/had/studies/current-house.mjs`, STR/HAD/MAT/RWT/IAS/OAS/BCR/MRA studies, `publication/specimens/plt*/` | Direct disciplinary and fixture runners remain separately attributable. The scan supplies paths to reconcile. Label completed selections, comparison or superseded studies, and generated receipts before deciding whether each input belongs in the current compile route. |
| `compiler/dpl/canonical.ts`, `compiler/dpl/exploration.ts`, `compiler/dpl/dplT5Lennard.ts`, `compiler/rhc{2,3,4}/generate.ts` | The historical symbol scan includes DPL and workstream proof entry points. Name the actual fixture/site scope in each continued call. A result on one of those sources cannot appear as Georgian applicability through the snapshot adapter. |

### Applicable and rejected use

| Source and use | Result |
| --- | --- |
| Valid JSON from `readGeorgianDesignSnapshot()` into `requireGeorgianDesignBasis()` | Admitted at nominal two-floor Georgian scope. The test checks the width and stable ID of every opening against native `createRevisionPlan()` on both storeys. |
| The real default from `createReferenceHouseOutputContext().source`, or missing input | Rejected at admission. The adapter supplies no substitute. |
| A valid contrast specimen or a Georgian-labelled snapshot carrying a changed width | The shapes can be admitted as data. Georgian applicability rejects the candidate kind or incorrect value. |
| A current HAD/STR/RWT selection, physical product or future plot | Requires its own controlling source path and evidence. The nominal plan does not transfer these claims. |

## Resolved current design

`compiler/reference-house/current-design/resolve.ts` returns `current-design-resolution/1`. The input document remains the authored nominal plan. The derived resolution binds four independently scoped overlays to the exact admitted plan and its 12000 × 12000 mm envelope. Each binding carries its selected/candidate state, scope, observed path-to-Git-blob identities and a deterministic SHA-256 digest. The applicability record binds the actual full plan digest as well as the house ID and width/depth.

The resolver verifies all scoped input identities and the existing producer edges before attaching bindings. A contrast design stays unbound. A Georgian-labelled document whose contents differ from the owning source fails before it can receive those bindings. A caller cannot supply a binding as part of the input document. Existing HAD, STR and RWT authorities continue to own their geometry, receipts and technical limits. This entry point hands off verified sources for current-compile and domain adapter work. It does not replace the occupied-house compositor or a specialist calculation.

## Selected overlay provenance

The [source account](studies/source-coverage.json) distinguishes decisions, executable authors, authored data, upstream generated inputs, historical inputs, outputs and current consuming entry points. It pins 100 files from the inspected main, separately from the owning workstream's provenance fields. It records the native read-only producer checks beside the family whose results they qualify. Run the account and its controls from the repository root.

```sh
node --import tsx project/ccr/studies/source-coverage.ts
node --import tsx --test project/ccr/studies/source-coverage.test.mjs
```

The audit compares actual file bytes with the inspected Git blobs and checks the source edges independently declared by current HAD, STR and RWT receipts using the digest algorithm those receipts use. A missing source, changed bytes, unknown receipt edge or inconsistent receipt returns a finding and a failing exit code. A label cannot authenticate a receipt. The manifest is a review checkpoint. A passing audit confirms the listed identities and edges only. Changes call for inspection of the owning source and affected consumers before re-baselining the account.

| Current path | Source resolution and blocked use |
| --- | --- |
| **HAD water and services** | `open-north-loggia.mjs` and `water-replan.mjs` compose the reference geometry. The former explicitly replays a frozen historical service projection within its own reproducible baseline. The latter authenticates the complete live MAT service input and the authored RWT receiving requirements separately. `water-replan.json` is its receipt. `current-house.mjs` combines that receipt with the 17 named service/structure inputs and emits `current-house-services.json`. The MRA leak study, inlet investigation, STR grid and RWT event consume these outputs in their original scope. The incoming-water rejection still governs equipment and installation applicability. |
| **STR** | The ground interface, grid, reconciled interface and joined-foundation Python producers own their calculations. The latter replays head actions, floor closure and roof bracing through explicit Python paths. Their JSON outputs are conditional inputs for HAD services and receiver studies. A reproducible candidate such as SAP-C1 cannot supply adopted support, structural capacity or plot performance. The current floor-portal alternatives, unresolved installed stiffness, signed coupled replay and site foundation qualification remain separate. |
| **RWT** | `selected-receiving-interface.json` is an authored input defining conditional N/E receiving requirements. Its `startingHouseBlob` is a historical baseline. The HAD receipt binds the current RWT bytes and the selected-event receipt binds the composed HAD bytes. This direction of dependency avoids treating historical references as live actions. The event, court-service and outer-network studies remain bounded consumers. If `plant-threshold.json` is unavailable, the audit rejects applicability even though the legacy east-ground helper has a frozen-dock fallback. Site receiving, installed durability, first harm and whole-network admission stay open. |

The changed-author control moves the east maximum water in the actual selected RWT input while preserving its original identity label. The real HAD output still reproduces on the original source. With the changed input, the audit identifies both the changed file and the HAD receipt's contradictory source edge. The separate missing-MAT control flags the dormant fallback boundary. Neither control changes a selected design or fabricates a replacement receipt.

## BCR, IAS and OAS consuming entry points

The [classified roots](studies/source-consumers.json) assign each BCR, IAS and OAS study executable or test to an owning decision and an applicability scope. Discover the source files recursively, verify that each has a single classification, then trace repository-local literal references through the reachable files.

```sh
node project/ccr/studies/source-consumers.mjs
node --test project/ccr/studies/source-consumers.test.mjs
```

The inspection covers 64 classified entry files in nine families and 134 executable files in the literal-reference traversal. The reported links include reads, generated outputs and replay references. The classifications distinguish the physical-feasibility and current bay inputs, selected IAS baseline and conditional workable interiors, and the closed OAS rejection witness versus the current Study carrier comparison. For example, the Study comparison reaches both the BCR bay receipt and the HAD occupied compositor. The compositor reaches the separate selected water receipt. Unknown or removed study entry files fail the inventory. Runtime-computed names and dependencies inside generated records remain visible through the separate producer/receipt source account or their owning reproducer. Literal reference traversal does not determine production reachability or replace those controls.

## Completion boundary

This supplies the source foundation: a validated current plan snapshot, a concrete alternate specimen, source-resolution bindings, and an inventory of current, historical and explicitly separate entry families. Current-compile still owns caller migration and the explicit execution path. The later release audit rechecks every active final consumer against the actual selected outputs. Physical fit, adoption, site and product requirements retain their existing owners.

## Checks

`compiler/reference-house/current-design-snapshot.test.ts` compares the admitted document to actual source coordinates and scoped identifiers. It round-trips that document and a separate 8600 × 10200 mm non-square specimen. Changed window width and partition position survive validation, while the unrelated storey stays equal. Tests reject unknown schemas, wrong units, historical-fixture substitution, non-finite inputs, extra keys, duplicate identifiers, false assembly roles and invalid hosted openings. These checks and the candidate and deliberately false nominal source cases run in the existing `test:rh-c1` suite. The downstream control in `compiler/coa01/current-design-applicability.test.ts` exercises the real historical default and an omitted source. Drawing generation, loaded use and physical acceptance remain with their owning tests.
