# ADE candidate plan editor

## Joined engineering-document continuation — 21 November 2026

The original schematic plan client below is a delivered increment, with its retained browser proof. It is not the browser authoring client of the saved `current-engineering-document/1` now used by the structural, services and roof compiler. The convergence audit following the joined structural/inlet integration reopens the existing ADE-BROWSER-EDITOR packet to close that actual consumer split; it adds no new packet or final design prerequisite.

The continuation implements `stages.roofPitch` authoring through the same saved document and `compileEngineeringDocument` used by the public CLI. The local API calls that compiler for every supplied stage; it does not reproduce the roof method or silently discard imported stages. The initial document deliberately contains only the supported roof-pitch comparison. Imported documents retain their admitted design, source bindings and other stages, and the shared compiler must admit them before they replace the open document.

`engineering-edit.ts` supplies a finite, stable-ID pitch operation, atomic revision checks, history, save/load and exact-document response correlation. `engineering-api.ts` is a thin local transport. The separate `engineering.html` client renders the native roof section and stock schedule, compares/pins revisions and displays the compiler's withheld roof/water evidence. The original plan editor remains an explicitly schematic increment; its candidate snapshots cannot enter the engineering document through a fallback.

Run the same Vite command below and open `/engineering.html`. Production build and Vite preview retain the same local API. Export is plain `current-engineering-document/1` JSON accepted directly by `scripts/compile-current-design.ts --bundle`; browser session/history state is not another design format. A reload begins a fresh edit session. A stale imported binding fails atomically; unsupported finite geometry may remain a draft with an explicit compiler error and no displayed current result.

The source-bound tests exercise 25→27° through the actual API and public CLI: field ridge Z8409.33→8501.16 mm and severe court slate rows 12→13; reversal restores the exact document identity and native roof result. Nominal plans and plan catchment remain controls. The changed roof withholds MAT covering/headlap, STR roof actions/stiffness and RWT applicability; it does not adopt new roof weather/support geometry. Extra stage and binding preservation, malformed/non-finite inputs, missing IDs, stale sources and late responses are checked. The source account registers the new actual browser/API consumers under the existing roof family.

Local TypeScript, production build, semantic/API/CLI tests and actual HTTP transport passed. Local Chromium cannot start because the execution sandbox denies its profile UNIX socket; no local browser pass is claimed. The exact-head ADE workflow preserves all original plan scenarios and adds real Vite HTTP/native-compiler browser checks, including exported-CLI replay, a retained Study stage, undo/redo, save/import, a rejected pitch and delivery of an older real response after a newer revision. Its inspected screenshot and successful result are required before merge.

Inputs changed: saved `stages.roofPitch.pitchDeg` only. Methods: existing native MAT pitch/stock compiler and shared engineering orchestration. Consumers: actual native section, stock schedule, saved/public CLI and browser review. Remaining fragmentation: other engineering settings still lack browser controls; the plan candidate editor remains a separately labelled schematic client, and final selected-house roof/structure/water reconciliation and the current-release audit remain open. No house-wide browser migration or technical acceptance is claimed.

The selected-house release, physical/material evidence and owner aesthetic gates retain their existing boundaries. This scope repair does not reopen completed plan computations or fabricate an engineering or owner verdict.

The browser editor opens a new candidate from the actual RH-LAYOUT-REVISION-02 plan or from the separate non-square free-standing partition specimen used by the headless edit regression. Edits use the same versioned transactions and stable object IDs. The browser worker runs the shared candidate plan compiler and V2 SVG renderer for Ground and First. The editor shows which plan drawings differ from the pinned revision and links diagnostics to their affected object.

Open the editor with the installed Vite tool from the repository root.

```sh
node node_modules/vite/bin/vite.js --config project/ade/browser-editor/vite.config.ts
```

Enter a dimension and press Enter, or use the pointer controls to adjust and apply it. In the current plan, a Study opening width change alters the ground plan. Changing envelope assembly depth alters both plans. An infeasible floor depth remains a candidate with a linked clear-height diagnostic. The free-standing study permits a partition translation that carries the existing door with its host. Joined partitions in the current house remain outside the move method.

Undo and redo create new revisions. Pinning captures the displayed revision for comparison. Save and load use local browser storage and the same draft JSON used by export and import. A loaded document starts a new revision session with empty history and recalculates its linked geometry diagnostics. The shared revision gate discards a worker response delivered after a more recent revision has already been compiled.

Inspector controls edit dimensions. Arbitrary topology editing, drawing-canvas dragging, technical analyses, owner selection, publication and shared storage are outside the browser client's schematic candidate scope.

## Browser evidence

Build the standalone entry and run the Playwright suite with Python Playwright and Chromium installed.

```sh
node node_modules/vite/bin/vite.js build --config project/ade/browser-editor/vite.config.ts --outDir /tmp/ade-editor-dist
python3 project/ade/browser-editor/browser_test.py --dist /tmp/ade-editor-dist
```

The current-house browser run measures the generated Study glazing line at 1000 and 1110 mm, pins and compares revisions, exercises undo and redo, changes the assembly and floor depth, rejects a joined partition move and round-trips saved JSON. The separate specimen run uses a pointer edit to move the partition at X2600 by 10 mm and verifies drawing change, history and reload. The late-response test holds the actual revision 1 worker response, displays revision 2 and delivers revision 1. Revision 2 remains visible with its 1180 mm glazing line.

The dedicated browser proof runs the same scenarios on the built editor and retains a screenshot. Pass `--chromium` to use an already installed Chromium or headless-shell executable.
