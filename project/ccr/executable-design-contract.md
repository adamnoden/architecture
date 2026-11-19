# Executable design and editor contract

This contract governs how authored house decisions become reusable computational capabilities. It is a required engineering boundary, not a claim that every capability below is implemented. The canonical task graph and implementation evidence determine delivery status.

## Destination

A browser-based house editor and the command line must be clients of the same executable design model. A person should be able to move a supported wall or opening, change an assembly or finish, save the design, and submit that exact revision for compilation. The response must regenerate what is supported, identify contradictions, invalidate affected evidence, and expose unsupported questions without silently choosing a different design.

The browser is not a second house model. Screen coordinates, React state, SVG marks and a scene graph are not architectural authority. A drag becomes a validated semantic edit to a model-space object. Heavy analysis may run in a worker, service or existing Python process; browser compatibility does not require rewriting every solver in JavaScript or running every calculation during pointer movement. The future graphical interface is not a prerequisite for proving this headless contract.

## One authoritative state, not one giant file

Use a versioned, serialisable design document and a resolved immutable snapshot. Reuse existing object identities, units, geometry primitives and provenance rather than replacing working systems wholesale. Discipline-owned modules may contribute records; compilation must resolve their ownership and references into one coherent input revision. There must be one writer/authority for each architectural fact, not one monolithic module containing all expertise.

Separate:

- **Authored inputs:** dimensions, locations, assemblies, topology, material/product choices, design intent, candidate options and explicit assumptions. An authored coordinate is legitimate data, not automatically an anti-pattern.
- **Derived relationships:** geometry, clearances, quantities, reactions or bounded calculations that can be recomputed from declared inputs and method versions.
- **Evidence and applicability:** measurements, product declarations, test results, reviews, uncertainties and the exact inputs/domain for which a conclusion is valid.
- **Views and presentation:** drawing scale, camera, labels, page composition and visual style. Presentation cannot silently change physical geometry or technical acceptance.

Stable IDs must survive movement and resizing. Level/host qualification must prevent collisions between similarly named objects. Use explicit units and datums at API boundaries. Reject duplicate IDs, dangling references, non-finite values, invalid schemas and ambiguous assemblies. Schema migration must be versioned and tested; do not silently reinterpret an older saved design.

A design can be structurally well-formed as data but physically infeasible. Keep such an editable candidate and return diagnostics; do not promote it to an accepted selection. An unresolved source choice must remain unresolved, not select whichever file was read last. Deliberately different variants have explicit identities and never contribute mixed geometry to one result.

## Computation and adapters

Separate computational functions from file loading, CLI flags, Git lookups, network requests, publication rendering and browser state. Use explicit inputs and outputs, no hidden mutable global house and no default historical fixture in a current-design path. Thin Node/CLI/browser/service adapters can own I/O. Existing Python or other specialist calculations may be invoked through explicit, versioned, deterministic input/output contracts. Integration is about shared semantics, not moving every file beneath `compiler/` or rewriting sound mathematics.

Treat the current house as the first demanding application of reusable capabilities. A generic function must not hide Georgian room coordinates, selected product dimensions or a particular window ID inside its algorithm. Conversely, do not invent a universal geometry framework just to evaluate a known assembly family. Start with parameterised functions and explicit supported domains; extract shared components when actual reuse or change requirements justify them.

Exploration may use a narrow study driver. Before its result becomes an active design dependency, make its parameters and method callable through the shared contracts, or identify an actual external authoritative method and bind its inputs/results. A reproducible script, byte receipt or file hash proves repeatability or identity, not composability, domain validity or complete change propagation.

## Dependency and change semantics

Each active output or evidence claim declares its controlling object/field values, method/version and external evidence dependencies. Build order must follow these dependencies, not a manually memorised sequence of regeneration commands. Generated receipts consumed by later stages must be rebuilt or freshness-checked against the same snapshot; an old JSON result must not become an alternative authority.

An edit has one of three explicit consequences for each relevant consumer:

1. **Recompute:** the method supports the changed inputs; regenerate the result and dependent views/schedules.
2. **Invalidate:** a former calculation, approval, product fit or physical finding no longer has its required inputs; mark it stale/pending and prevent reuse as a current affirmative result.
3. **Reject or report unsupported:** the edit is invalid as data, outside a declared method domain, or requires a design decision. Return a precise reason and affected objects rather than guessing.

Conservative invalidation is acceptable while dependencies are being mapped, if its breadth is explicit. Claiming selective validity requires field/object-level evidence; a whole-file hash alone does not establish it. A label or camera change should alter presentation identity without manufacturing a new structural decision. A material, support, load path, wet boundary or topology change must not retain an unrelated-looking but actually dependent approval.

Avoid circular computation masquerading as a DAG. A genuine coupled analysis needs an explicit bounded iteration/solver contract, convergence criteria and failure diagnostics. A deterministic execution order is not proof that an engineering feedback loop has been resolved.

## Editor-facing interface

Provide validated semantic transactions such as moving/resizing an opening, editing a wall within the supported topology, selecting an assembly or changing a floor-module parameter. Commands refer to stable object IDs and a base revision, carry explicit units, and either apply atomically or leave the previous document unchanged with diagnostics. Do not let a drawing renderer mutate the document.

Prove serialisation and save/load equivalence, undo/redo or equivalent inverse/snapshot restoration, and compile-after-edit behaviour. Editing a candidate does not overwrite an accepted baseline or erase historical evidence. Parameter-only edits and topology changes have distinct validation paths. Unsupported rotations, wall joins, structures or material assemblies must be rejected or returned as explicit review states, not drawn plausibly as if supported.

Compilation returns machine-readable diagnostics with stable codes, severity, source object/field references, affected outputs and the assessed revision. Missing evidence, invalid geometry, stale evidence and unsupported methods are distinct states. UI highlighting is a consumer of these references, not a string-parsing convention.

Define a cheap geometry/constraint response separately from expensive engineering analyses. Requests and responses retain source revision and method identity. An older asynchronous result must never overwrite a newer edit; cancelled or interrupted work has explicit status. Test this with a headless client even before a browser exists. Cache keys must include all declared dependencies; incremental caching is an optimisation, not an excuse to return stale results. Correct full recomputation is an acceptable first implementation.

## Current and historical compilation

Historical house fixtures, papers and accepted regression outputs remain reproducible under their original identities. Their retention is useful evidence, not the weakness being remedied. The defect is an active current consumer quietly compiling a historical house or mixing independent source versions.

Current entry points must require or resolve a single explicit current snapshot. Historical compilation must be deliberately selected and visibly labelled. Remove silent fallback, misleading defaults and mutable copies of current dimensions in old fixtures. Preserve existing historical tests rather than editing their expected answers to resemble the current house.

The current consumer inventory must cover all public/current CLI reports, drawing and publication sources, schedules, active engineering analyses and downstream evidence. Every item is migrated, explicitly retired from current use, or identified as a genuinely unsupported capability with its affected claim and owner. Existing computable design results may not be renamed unsupported merely to avoid integration. Frozen archive illustrations may remain in publications only when clearly historical and not used as current proof.

## Required proof for substantial design computation

A relevant change packet must show an ordinary changed input, an adverse or out-of-domain input, and the result across its actual consumers. Preserve the original expected result as a regression, but do not stop at reproducing it.

The integration suite must include:

- Opening width/location: consistent plan, elevation, section, dimensions and linked schedule; a fixed product that no longer fits becomes a conflict, not a rescaled product.
- Floor pitch/material and panel/skirting depth: updated layouts, quantities, masses and adjoining clearance/maintenance diagnostics; changed support or boundary evidence becomes pending.
- Roof pitch/eaves: shared roof geometry and affected analysis inputs change together; no old drainage or load conclusion silently survives outside its domain.
- Structural wall/span or service route: supported geometry recomputes; force, slope, clearance and boundary dependencies recompute or invalidate explicitly. The engine need not autonomously invent a replacement structural system.
- Missing/renamed IDs and historic/current source substitution: reject before apparently complete outputs are emitted.
- Unrelated presentation edits: do not invalidate unchanged technical evidence beyond its declared dependencies.
- Save/load, edit reversal and stale asynchronous completion: preserve semantic state and prevent old results from becoming current.

For each claimed general algorithm include a second materially different fixture within its declared domain. Do not use a nominal second fixture differing only in its title. For a genuinely single-occurrence detail, a bounded parameter-variation test is enough; do not overclaim universality.

## Review and completion

Every substantial engineering PR states its source parameters, derived logic, output/evidence consumers, mutation tests and any residual manual synchronisation. An exception must name the unsupported relationship, responsible existing packet and completion trigger. Pure prose, historical records and physical evidence collection can explain why no new algorithm is warranted. Repeated or accepted active mechanics cannot use 'study only' as a permanent exception.

A software pass is not architectural taste, physical proof or construction permission. Owner approval, external evidence and actual site facts remain distinct. The compiler must represent these boundaries and their invalidation correctly, not pretend to supply them.

The goal is an editable, inspectable, change-aware house model: **author once, derive consistently, preserve evidence identity and make every consequential change visible**.
