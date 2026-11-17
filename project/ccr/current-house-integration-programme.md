# Current-house executable model and editor-readiness programme

**Owner direction:** 15 November 2026, [#1539](https://github.com/adamnoden/architecture/issues/1539) and [#1542](https://github.com/adamnoden/architecture/issues/1542). **Contract:** [executable design and editor boundary](../../docs/computational/executable-design-contract.md). Execution authority remains `project/control/nodes/`; no parallel status register is created here.

## Problem and acceptance target

The retained full-system compiler still has a historical Reference House fixture, while the evolved occupied house and many engineering calculations live in specialised generators. Shared drawing/roof primitives, source identities, the current-house compositor and deterministic studies are useful foundations. They are not yet one editable current-house compile path.

Eliminate that split for **all active current-house consumers**. Do not delete historical evidence, rewrite old fixtures, force every algorithm into one language, or require a speculative universal BIM/physics engine. The future browser editor must consume the same versioned design document, semantic edit operations, compiler results and diagnostics as the CLI. The headless contract is required for delivery. The bounded browser application follows the change proof as a separate ADE packet.

A final design-dependent claim still requires actual compatible architecture. Early source/adaptor implementation can represent candidate and unresolved choices without selecting them. This separates useful early integration from the post-TRIAD technical-acceptance gate.

## Delivery sequence and packet contracts

The two owner directions describe overlapping implementation. The eight CCR packets below retain the separate engineering lanes and the final audit against actual selected outputs. ADE owns the browser delivery.

| Delivery scope in #1542 | Canonical packet |
| --- | --- |
| ADE-DESIGN-INPUT | CCR-CURRENT-SOURCE |
| ADE-CURRENT-COMPILE | CCR-CURRENT-COMPILE |
| ADE-PARAMETRIC-SYSTEMS | CCR-STRUCTURE-INTEGRATION, CCR-SERVICES-INTEGRATION and CCR-ASSEMBLY-INTEGRATION |
| ADE-CHANGE-PROPAGATION | CCR-EDIT-CONTRACT and CCR-CHANGE-PROOF |
| ADE-EDIT-REGRESSION | CCR-CHANGE-PROOF, followed by CCR-CURRENT-RELEASE on the final selected source |
| ADE-BROWSER-EDITOR | ADE-BROWSER-EDITOR |

### CCR-CURRENT-SOURCE — early, independent of design convergence

Inventory every active source and consumer, starting with `compiler/reference-house/fixture.ts`, `system-compile.ts`, output contexts, Georgian publication adapters, `project/had/studies/current-house.mjs`, the structural sources and IAS/OAS generators. Classify source authority, variant identity, unit/datum, mutable copies, derived receipts, supported domain and current/historical purpose. An inventory is part of implementation, not its only deliverable.

Implement a versioned serialisable design-document/snapshot resolver over existing authoritative records, with runtime validation, stable component/host IDs and explicit selected/candidate/unresolved states. It may compose discipline modules; it must not invent a competing house. Expose a read-only current snapshot that callers can pass explicitly. Preserve source ownership and immutable historical fixtures. Prove current/legacy distinction, deterministic save/load, duplicate/missing references and unresolved alternatives. Exercise the current house and a non-default orthogonal specimen so fixture constants cannot satisfy the contract. Output `project/ccr/current-source-result.md` with implemented modules, tests and the consumer inventory location.

### CCR-CURRENT-COMPILE — one explicit current entry point

After the source contract exists, implement a current-house compile/orchestration entry point using it. Separate Node filesystem/CLI I/O from core and specialist-runner inputs. Reuse the existing plan, topology, calculation, drawing and evidence methods only within their real supported domains. Recompute generated intermediates in dependency order or reject stale inputs. Do not silently substitute the historical fixture for an unsupported current subsystem.

Return source/method identities, domain results and typed object-linked diagnostics. Preserve historical compilation as an explicit named path. Demonstrate active CLI, drawing, publication, schedule and calculation callers' source identities. Verify that the current and historical fixtures remain independently reproducible, current commands cannot fall back and a changed supported input controls the output. This creates the integration path, not a claim that every domain is migrated. Output `project/ccr/current-compile-result.md`.

### CCR-STRUCTURE-INTEGRATION — structural adapter and reusable methods

Integrate active selected/candidate STR computations through explicit snapshot/load/material inputs. Parameterise geometry, coordinate transforms, supports, load combinations, joints and clearance checks at their justified ownership boundaries. Keep rejected connection trials as labelled regression/history; do not port every superseded experiment into production. Reuse Python solvers through versioned contracts where appropriate. Source/path changes must recompute supported reactions/geometry or explicitly invalidate the dependent result, never retain a pass from another candidate.

Coordinate any edits to live STR-owned source with its lease holder. Read-only adapters and isolated tests may progress independently. Prove a span/support/location perturbation, a domain/failure case and current-source identity through the integrated entry point. Output `project/ccr/structure-integration-result.md`.

### CCR-SERVICES-INTEGRATION — water and service adapter

Integrate the active occupied-house services, selected roof/water duties and inlet/routing calculations. Use explicit ports, paths, levels, pipe/material envelopes and occupied-operation parameters rather than copied house coordinates inside generic logic. Distinguish designed geometry from survey/product inputs and retain their absence as explicit diagnostics. Shared calculations such as path distance, clearances, falls and bounded flow belong in reusable methods; source-owned trial coordinates remain data.

Preserve the authoritative HAD/RWT/MRA decisions and coordinate live source edits. Prove a route/port/level change propagates to relevant drawing, calculation and evidence, plus a blocked/out-of-domain case. Output `project/ccr/services-integration-result.md`.

### CCR-ASSEMBLY-INTEGRATION — room and component families

Integrate the active IAS/OAS floor panels, panelling, skirting, grates, renewable opening assemblies and their supported manipulation checks. Reuse ADE-MODEL's stable bay/component views; extend only where whole-house occurrences require it. Derive room fields, module counts, masses, sections, component schedules and declared access envelopes from the same parameters. Distinguish configuration from algorithm and keep fixed product dimensions fixed.

Prove floor pitch, material or panel-depth and window-size changes across actual views/quantities/clearance checks. Qualify or invalidate unmodeled physical handling and performance. No owner selection is inferred from a configured trial. Output `project/ccr/assembly-integration-result.md`.

### CCR-EDIT-CONTRACT — headless editor boundary

Implement a small validated transaction API over the shared design document: move/resize an opening, move a supported wall and edit an assembly/floor parameter. Use explicit IDs, units and base revisions; reject unsupported topology or schema changes without silently patching adjacent geometry. Preserve physically infeasible but well-formed candidates with diagnostics.

Prove atomic application/rejection, serialisation, undo/redo or equivalent reversal, current/candidate separation, and revision-correlated asynchronous compile results. Expose lightweight geometry checks separately from heavy analysis orchestration. Keep DOM, filesystem and React out of the semantic model; heavy Python/server computation is legitimate. Supply a minimal headless-client test, not a speculative web application, database or collaboration platform. Output `project/ccr/editor-contract-result.md`.

### CCR-CHANGE-PROOF — end-to-end mutation and invalidation

Use the real current entry point and the integrated domains, not fixture-only helpers. Exercise the contract's window, floor/panel, roof and structural/service edits through source -> computation -> drawing/schedule -> evidence diagnostics. Include non-finite inputs, missing IDs, historical substitution, unrelated presentation changes, changed method/product evidence and stale asynchronous completions. Check save, reload and reversible edits on the non-default specimen as well as the current house. Where a solver is expensive, retain a smaller independently justified test with at least one real full-path check; do not fake the adapter result.

Audit manually synchronised facts and active consumers. Every outstanding computational gap has an explicit owner and rejection/implementation route; repeated active outputs cannot be treated as historical simply to pass. Wire the suite into the canonical repository health entry point. Output `project/ccr/change-propagation-result.md`.

### CCR-CURRENT-RELEASE — final elimination of the split

After HRS-SYNTHESIS and the actual ADE detail/schedule/evidence outputs, repeat the consumer audit against the final selected source, not the earlier candidate. Verify every active CLI/publication/drawing/schedule/engineering consumer is routed to the same declared current snapshot and relevant supported checks. Migrate or retire stale active paths; retain deliberately labelled historic artifacts only as history. Prove source changes cannot silently reuse their claims.

Close only when the default current path, domain migrations, editor contract and end-to-end mutation suite work on the selected house, all declared output dependencies are reconciled, and no duplicate authoritative geometry remains. Honest unavailable physical/site evidence may remain bounded; unimplemented change propagation or an active old-fixture fallback may not. Output `project/ccr/current-release-result.md`. PLT-FINAL-PREP depends on this result; no final book freeze may mask incomplete computational integration.

### ADE-BROWSER-EDITOR — bounded browser delivery

Use the same document, semantic commands and headless compiler to move a partition, resize an opening and change a floor or assembly parameter. Surface linked diagnostics and affected views. Demonstrate keyboard and pointer editing, undo/redo, save/reload and revision comparison with late-response rejection. Keep unsupported shapes explicit. The evidence is a working browser client with exercised edit paths in `project/ade/browser-editor-result.md`. This packet belongs to ADE and sits outside the publication and architectural approval dependencies.

## Re-sequencing existing work

- `ADE-MODEL` now depends on the early current-source implementation and its completed delivery audit, not on HRS-TECHNICAL. It can implement stable read-only geometry/assembly interfaces for provisional candidates without asserting their engineering acceptance.
- `ADE-DETAILS`, `ADE-SCHEDULES` and `ADE-EVIDENCE` retain or gain an explicit HRS-TECHNICAL prerequisite for the final selected bay. Their original design/evidence boundaries stay intact.
- `HRS-TECHNICAL` remains after TRIAD: it accepts/re-proves selected technical applicability, rather than being the first occasion on which reusable model contracts are built. If final geometry differs, it updates the already integrated adapters and records that reconciliation.
- Existing STR-FLOOR-PORTAL and HAD-INLET-RESOLUTION investigations are not made dependent on the new software chain. Their workers must follow the per-packet contract from now on and coordinate integration of accepted results. Do not stop physical problem-solving for a platform rewrite.
- `CCR-CURRENT-RELEASE` follows HRS and the technical bay; final PLT preparation follows both HRS and this release. No cycle through owner design acceptance is introduced. Owner choices remain real manual gates; no EPR/site sign-off is added as a generic book dependency.

## Rules for every contributing engineering packet

In the PR and closeout, name the changed authoritative inputs and methods, live consumers that recalculate, evidence whose applicability changes, executed mutation/adverse and unchanged-control cases, and remaining computational debt. Investigative drivers may remain narrow while exploratory, but active accepted results require callable source-bound integration. Explain any truly uncomputable/externally supplied evidence and its dependency boundary. No blanket 'unsupported' escape for an existing deterministic calculation, no duplicated current dimensions, no silent fixture fallback and no renderer-owned physical choices.

Preserve historical results at their original scope, stable solver behaviour and source-authority boundaries. Migration is incremental through tested adapters; a rename or directory move is not completion. Use separate files for parallel adapters and integrate shared contracts serially under canonical leases. Existing issue #1008 remains the ADE delivery discussion; #1539 and #1542 track the owner direction. The typed graph owns execution.

## Current integration frontier

The accepted Georgian document supplies the common nominal house identity. Its discipline bindings attach only to that exact document. The specialist cases below use this basis and carry their own conditional geometry. In particular, the southern Utility window has a separate structural rewind and the Study has an occupied opening offset. Releasing either into a selected layout requires reconciling those choices with the authored house.

| Consumer | Current route | Next migration |
| --- | --- | --- |
| North collector and north-west service port | `--read-north-collector` / `--north-collector` recomputes clearances, bore alignment, the DPC footprint and reversible bearing demands. Explicit yaw and dead-load probes reuse the current 52-head foundation method. `--rear-foul-vent` checks the alternate route and known openings near its terminal. | Join the collector and route to the wall/chord, DPC load transfer, roof drainage and coupled signed analysis before structural selection. Reconcile roof and site openings before accepting the terminal. |
| South Utility inlet sill insert | `--inlet-sill-insert` uses the stable Utility opening and candidate rewind. Its wind case subtracts the insert from the retained opaque bay and reapplies that action at the independent frame axes. `--inlet-fault` reuses the native lower-relief method against the resulting bores, wet cells and vents. | Prove the retained jamb and frame connection behaviour and bind installed pressure, vent, wetting and handling evidence to the case. |
| Crafted Study transition | `--study-room-kit` derives the wall transition and drawing from one kit and checks floor depth against the verified MAT stack. `--study-draft-room-kit` admits a saved position or width edit of the hosted Study window on the explicit Georgian basis. | Extend supported edits and bind the dry field's support, fixing and protective-layer evidence. |
| Current Georgian non-plan views | Native sections, roof and exterior still use the Georgian layout family. | Route current views to the explicit admitted design. Verify vertical datums, unchanged views and diagnostics for edits outside the method. |
| Occupied service schedule, drawings and MRA | `--occupied-services` and `--occupied-service-drawings` use the same bound HAD compositor as the native drawing check and the current MRA leak study. | Audit all consumers again on the final selected source, including any changed water or room geometry and its affected evidence. |
| Specialist development studies | Several HAD, IAS and OAS drivers still call the raw native compositor for their declared comparisons. Their native inputs and results carry the scopes recorded in the source inventories. | Move adopted current consumers to the bound entry point and preserve historical and adverse study reproduction under their original input identities. |
| Historical outputs and final publication | `outputs:*` and their manifest/dataplate assessment retain the RH-C fixture. The published figure register identifies historical plates at their placements. The east-ground current compile already has its own explicit case. | Keep history reproducible. For each final current publication consumer, require the selected current-source route or an explicitly historical claim, then rerun the release audit with the final bay evidence. |

Use the same versioned request for CLI or server-side analysis. For example, from the repository root, the first command emits the current design document, the second emits the source-bound candidate request, and the third replays that request.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-north-collector - |
  node --import tsx scripts/compile-current-design.ts --north-collector -
```

## What completion does and does not mean

The implemented result will be a coherent, editable and change-aware model for the supported Reference House and its declared variant families. It does not promise an arbitrary-building generator, automatic architectural judgement, complete physical validation, a shipped browser UI, real-time execution of every analysis or construction permission. Those limits do not excuse leaving current model data fragmented.
