# Current-house executable model and editor-readiness programme

**Owner direction:** 15 November 2026, [#1539](https://github.com/adamnoden/architecture/issues/1539). **Contract:** [executable design and editor boundary](../../docs/computational/executable-design-contract.md). Execution authority remains `project/control/nodes/`; no parallel status register is created here.

## Problem and acceptance target

The retained full-system compiler still has a historical Reference House fixture, while the evolved occupied house and many engineering calculations live in specialised generators. Shared drawing/roof primitives, source identities, the current-house compositor and deterministic studies are useful foundations. They are not yet one editable current-house compile path.

Eliminate that split for **all active current-house consumers**. Do not delete historical evidence, rewrite old fixtures, force every algorithm into one language, or require a speculative universal BIM/physics engine. The future browser editor must consume the same versioned design document, semantic edit operations, compiler results and diagnostics as the CLI. A graphical application is a later delivery scope; its headless contract is required now.

A final design-dependent claim still requires actual compatible architecture. Early source/adaptor implementation can represent candidate and unresolved choices without selecting them. This separates useful early integration from the post-TRIAD technical-acceptance gate.

## Delivery sequence and packet contracts

### CCR-CURRENT-SOURCE — early, independent of design convergence

Inventory every active source and consumer, starting with `compiler/reference-house/fixture.ts`, `system-compile.ts`, output contexts, Georgian publication adapters, `project/had/studies/current-house.mjs`, the structural sources and IAS/OAS generators. Classify source authority, variant identity, unit/datum, mutable copies, derived receipts, supported domain and current/historical purpose. An inventory is part of implementation, not its only deliverable.

Implement a versioned serialisable design-document/snapshot resolver over existing authoritative records, with runtime validation, stable component/host IDs and explicit selected/candidate/unresolved states. It may compose discipline modules; it must not invent a competing house. Expose a read-only current snapshot that callers can pass explicitly. Preserve source ownership and immutable historical fixtures. Prove current/legacy distinction, deterministic save/load, duplicate/missing references and unresolved alternatives. Output `project/ccr/current-source-result.md` with implemented modules, tests and the consumer inventory location.

### CCR-CURRENT-COMPILE — one explicit current entry point

After the source contract exists, implement a current-house compile/orchestration entry point using it. Separate Node filesystem/CLI I/O from core and specialist-runner inputs. Reuse the existing plan, topology, calculation, drawing and evidence methods only within their real supported domains. Recompute generated intermediates in dependency order or reject stale inputs. Do not silently substitute the historical fixture for an unsupported current subsystem.

Return source/method identities, domain results and typed object-linked diagnostics. Preserve historical compilation as an explicit named path. Demonstrate current and historical fixtures remain independently reproducible and current command defaults cannot fall back. This creates the integration path, not a claim that every domain is migrated. Output `project/ccr/current-compile-result.md`.

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

Use the real current entry point and the integrated domains, not fixture-only helpers. Exercise the contract's window, floor/panel, roof and structural/service edits through source -> computation -> drawing/schedule -> evidence diagnostics. Include non-finite/missing IDs, historical substitution, unrelated presentation changes, changed method/product evidence and stale asynchronous completions. Where a solver is expensive, retain a smaller independently justified test with at least one real full-path check; do not fake the adapter result.

Audit manually synchronised facts and active consumers. Every outstanding computational gap has an explicit owner and rejection/implementation route; repeated active outputs cannot be treated as historical simply to pass. Wire the suite into the canonical repository health entry point. Output `project/ccr/change-propagation-result.md`.

### CCR-CURRENT-RELEASE — final elimination of the split

After HRS-SYNTHESIS and the actual ADE detail/schedule/evidence outputs, repeat the consumer audit against the final selected source, not the earlier candidate. Verify every active CLI/publication/drawing/schedule/engineering consumer is routed to the same declared current snapshot and relevant supported checks. Migrate or retire stale active paths; retain deliberately labelled historic artifacts only as history. Prove source changes cannot silently reuse their claims.

Close only when the default current path, domain migrations, editor contract and end-to-end mutation suite work on the selected house, all declared output dependencies are reconciled, and no duplicate authoritative geometry remains. Honest unavailable physical/site evidence may remain bounded; unimplemented change propagation or an active old-fixture fallback may not. Output `project/ccr/current-release-result.md`. PLT-FINAL-PREP depends on this result; no final book freeze may mask incomplete computational integration.

## Re-sequencing existing work without a new deadlock

- `ADE-MODEL` now depends on the early current-source implementation and its completed delivery audit, not on HRS-TECHNICAL. It can implement stable read-only geometry/assembly interfaces for provisional candidates without asserting their engineering acceptance.
- `ADE-DETAILS`, `ADE-SCHEDULES` and `ADE-EVIDENCE` retain or gain an explicit HRS-TECHNICAL prerequisite for the final selected bay. Their original design/evidence boundaries stay intact.
- `HRS-TECHNICAL` remains after TRIAD: it accepts/re-proves selected technical applicability, rather than being the first occasion on which reusable model contracts are built. If final geometry differs, it updates the already integrated adapters and records that reconciliation.
- Existing STR-FLOOR-PORTAL and HAD-INLET-RESOLUTION investigations are not made dependent on the new software chain. Their workers must follow the per-packet contract from now on and coordinate integration of accepted results. Do not stop physical problem-solving for a platform rewrite.
- `CCR-CURRENT-RELEASE` follows HRS and the technical bay; final PLT preparation follows both HRS and this release. No cycle through owner design acceptance is introduced. Owner choices remain real manual gates; no EPR/site sign-off is added as a generic book dependency.

## Rules for every contributing engineering packet

Declare parameters, methods, consumers and a mutation test in the PR/closeout. Investigative drivers may remain narrow while exploratory, but active accepted results require callable source-bound integration. Explain any truly uncomputable/externally supplied evidence and its dependency boundary. No blanket 'unsupported' escape for an existing deterministic calculation, no duplicated current dimensions, no silent fixture fallback and no renderer-owned physical choices.

Preserve historical results at their original scope, stable solver behaviour and source-authority boundaries. Migration is incremental through tested adapters; a rename or directory move is not completion. Use separate files for parallel adapters and integrate shared contracts serially under canonical leases. Existing issue #1008 remains the ADE delivery discussion; #1539 tracks this cross-cutting owner direction while the typed graph owns execution.

## What completion does and does not mean

The implemented result will be a coherent, editable and change-aware model for the supported Reference House and its declared variant families. It does not promise an arbitrary-building generator, automatic architectural judgement, complete physical validation, a shipped browser UI, real-time execution of every analysis or construction permission. Those limits do not excuse leaving current model data fragmented.
