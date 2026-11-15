# Executable design and browser authoring

**Owner direction:** 15 November 2026, [#1542](https://github.com/adamnoden/architecture/issues/1542). This programme extends existing ADE/CCR work. The typed graph owns execution status. Registration changes instructions and dependencies; it does not implement the future compiler or editor by itself.

## Outcome and compatibility

A browser user must eventually be able to move a partition, resize an opening, choose a floor/panel assembly and inspect the consequences through the **same headless compiler** used by CLI builds. Save, reload and undo must operate on the same design contract. This is an executable architectural design tool, not a drawing canvas followed by a separate reconstruction exercise.

Reuse the existing typed geometry, hosted openings, section/view engine, units, source identities, method boundaries and useful current-house compositor. Retain supported Python/external solvers behind explicit versioned adapters. Do not rebuild CAD/BIM, rewrite every solver in JavaScript or generalise beyond demonstrated use. A browser client need not execute every expensive method locally; it must use the same input/output contract and reject stale remote results.

The current weakness is a split active information path, not the existence of historical fixtures. Preserve old fixtures and their exact claims as explicit regression/comparison targets. **Eliminate implicit historical-fixture fallback from every active current-house consumer.** A current plot, report or drawing must identify the actual submitted design revision, method versions and limitations. Missing current support produces a diagnostic or unsupported result, never a plausible result for a different house.

## Architecture contract

The flow is: **authoritative authored inputs → versioned design document → validation/normalisation → derived geometry and domain methods → diagnostics/evidence applicability → views, schedules and reports**. CLI, browser, publication and external-solver adapters surround that core; none owns a rival editable house.

- A serialisable, versioned document has stable object IDs, explicit units/datums, hosted openings, assembly references, authored parameters and typed unknown/candidate/selected status. Validate runtime input, references, finite values and schema versions. A drawing's paper offsets are not house geometry.
- Authored choices and derived values are separate. Where a room follows its wall, derive the room boundary rather than copying a second coordinate. Where a product has a fixed size, flag a new fit conflict rather than silently scaling the product.
- The first adapter reads existing current sources without creating a competing writable registry. Record field ownership and explicit cutover. Generated intermediate JSON is not secretly promoted to editable authority. Browser edits initially produce versioned candidates; promotion to selected architecture retains the existing owner decisions.
- Pure derivations accept explicit inputs and context. File reads, process environment, clocks, Git metadata and network calls stay in boundary adapters. Core methods must not select the current or historical house through hidden globals.
- Semantic edits target IDs and expected revisions. Represent invalid-but-well-formed candidates with useful object-linked diagnostics; reject malformed documents. Moving a wall is not a promise to automatically choose replacement structure. Distinguish recomputation, stale evidence, unsupported method, design conflict and approval state.
- Dependencies bind evidence to actual object/field values, configuration, product and method versions. Changing a label must not invalidate unrelated engineering; changing a support must invalidate its affected check. A hash proves identity, not complete dependency discovery.
- Keep a full deterministic compile as the correctness reference. Add incremental/cached execution only with full-versus-incremental equivalence tests. Late worker/server results cannot overwrite a newer edited revision. Preview and accepted/released results remain distinguishable.

## Delivery packets

### ADE-DESIGN-INPUT — foundations now

Implement the document, runtime admission, stable identities and source adapter using existing types where appropriate. Define concrete semantic edit records for a partition, opening and assembly parameter, with revision checks. Round-trip authored input without losing unknowns or source authority. Use the present house and a non-default orthogonal contrast specimen. Tests cover renamed/missing hosts, duplicate IDs, bad units/non-finite values, wrong versions and save/reload. Report implementation and fields still owned by existing sources in `project/ade/design-input-result.md`.

This work does not depend on final TRIAD selection. Candidate/selected distinctions permit useful implementation while architecture evolves. A prose schema or a copied 12 m fixture is not completion.

### ADE-CURRENT-COMPILE — one explicit current route

Implement an entry point taking the validated document and explicit method/evidence context. Adapt the current compositor and reusable bounded compiler slices without silently changing historical contracts. Inventory all current CLI, drawing, publication, schedule and calculation entry points: route through this path or record an explicit unsupported output. Explicitly label retained historical commands and give current and historical artifacts separate identities/paths.

Prove the submitted design, not an internally loaded fixture, controls each admitted result. Test changed shell/room/opening inputs, input identity in output metadata and an intentionally incompatible historical source. Reuse a historically located generic method only if its inputs and applicability actually match. Do not mechanically ban useful modules by directory name. Closeout `project/ade/current-compile-result.md` includes the consumer inventory, removal of hidden defaults and working commands; it does not imply all physical engineering is solved.

### ADE-PARAMETRIC-SYSTEMS — migrate real relationships

Start with the existing modular-floor/opening studies and a bounded structural/service interface. Separate named trial parameters from reusable geometry, calculations, operations and rendering. Reuse one result record for dimensions, schedules and numeric captions; human-authored argument remains human-authored and gets stale/applicability tracking rather than automatic rewriting.

Prove floor pitch/finish thickness, opening width and support/service-offset mutations. Move local coordinate frames with their host; do not spread a list of unrelated absolute coordinates into a nominal config file and call that integration. Keep surveyed/product data explicit. Preserve valid old receipts as regression evidence and describe intentional differences.

Audit remaining active study consumers as integrated, explicit bounded adapter, historical/rejected, unsupported, or unintegrated debt. Each debt item has an owner, affected adoption/output and test that discharges it. Existing selected claims cannot bypass the final current-path gate through a prose disclaimer. Closeout `project/ade/parametric-systems-result.md` must identify actual migrated modules and live consumers; a general framework without these applications does not complete it.

### ADE-CHANGE-PROPAGATION — recompute or invalidate

Implement transactional edits, dependency-aware recomputation/invalidation and object-linked diagnostics using the current identity/evidence machinery where it fits. Test undo/redo, save/reload, revision mismatch, deletion of a referenced object, label-only edits, geometry/material changes and stale asynchronous responses. Use the full compile as the reference. A changed hash alone is not a demonstrated consequence. Closeout `project/ade/change-propagation-result.md` records executable positive, adverse and unaffected-control cases.

This can run alongside parametric-system migration after the input/current-compile contract is in place. Changes to that shared contract remain serially integrated by its owner.

### ADE-EDIT-REGRESSION — eliminate the active split

A single reproducible acceptance suite must demonstrate:

| Edit | Required consequence |
|---|---|
| Resize a window | All affected plan/elevation/section dimensions and relevant schedule rows agree; an incompatible frame or support becomes a conflict/stale check, not a silently resized product |
| Move a partition/support | Adjacency, room boundary, opening hosts, clearance and supported load-path/service checks update; unsupported redesign is explicit |
| Change floor-module pitch, panel or skirting depth | Module grid/quantity/mass and affected joins/clearances agree across views, schedules and supported operation checks |
| Change a method/product datum | Only dependent results/evidence lose applicability; unchanged presentation is not mistaken for unchanged engineering |
| Save/reload/undo and use a second specimen | The same document and method versions give equivalent outputs; there are no hidden default-house values or renderer-only repairs |

Inspect actual generated outputs as well as records. Inventory every active current-house consumer and close its integration disposition. No unresolved manually duplicated controlling input may remain behind a current positive claim. Unsupported physical knowledge remains an explicit limitation; missing software integration is not relabelled as impossible physics. Re-prove against the selected source when later architecture changes invalidate a previously completed result. Closeout `project/ade/edit-regression-result.md` supplies exact inputs, method/output identities and the executed mutation matrix.

### ADE-BROWSER-EDITOR — bounded vertical slice

Build a small browser editor for the supported orthogonal domain: select/drag a partition, resize an opening, change a floor/assembly parameter, show linked diagnostics and affected views, undo/redo, save/reload and compare revisions. Use the same semantic commands, input contract and headless compiler; no UI-only geometry source. A worker or server may run expensive methods with revision-bound requests/results. Demonstrate keyboard/numeric editing as well as drag interaction, rejection of stale output and explicit limits for unsupported geometry.

`project/ade/browser-editor-result.md` must include working code and browser interaction evidence. This is a real future implementation task, not a screenshot of a hypothetical editor. Collaboration, commercial hosting, arbitrary curved solids and a universal optimisation engine are outside this slice.

## Integration and acceptance boundaries

Existing HRS-TECHNICAL remains responsible for current design-to-claim applicability. It must consume the actual current input/method identities, not relabel the old fixture. ADE-MODEL consumes the proven executable contract and HRS result before the selected construction-bay adapters; ADE-EVIDENCE consumes change/invalidation support. Final PLT preparation consumes ADE-EDIT-REGRESSION, so final publication cannot leave the active split unresolved. Material design changes require affected rechecks even after a node once reached complete.

The browser client itself is **not** a prerequisite for TRIAD, HRS, owner architectural approval or the book. The engine/data/change contract is a required quality outcome; the UI is a subsequent delivery surface. Preserve both owner design approval gates, physical print review and explicit manufacture authority. Add no blanket external professional-review prerequisite for pre-site publication.

## Work discipline and measured closeout

Apply the root constitution's computational change contract during every relevant packet. Report authoritative inputs, live consumers, reproducible recomputation/invalidation, mutation/adverse tests and residual debt. Exploratory sketches may stay local; recurring or adopted relationships earn reusable implementation without waiting for every house choice to settle. Do not inflate completion by moving files into `compiler/` or wrapping hard-coded examples in functions.

For the registration packet, graph tests prove sequencing and retained approval boundaries only. They are not proof of an implemented editable compiler. Implementation packets close only with code, executed behavioural tests and inspected affected artifacts. Canonical leases, exact-head CI and publication preflight remain unchanged.
