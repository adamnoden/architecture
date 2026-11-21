# ADE candidate plan editor

## Joined engineering-document continuation — 21 November 2026

The original schematic plan client below is a delivered increment, with its retained browser proof. It is not the browser authoring client of the saved `current-engineering-document/1` now used by the structural, services and roof compiler. The convergence audit following the joined structural/inlet integration reopens the existing ADE-BROWSER-EDITOR packet to close that actual consumer split; it adds no new packet or final design prerequisite.

The continuation must edit the existing `stages.roofPitch` through the same saved document and `compileEngineeringDocument` used by the public CLI. Preserve its admitted design, source bindings and any other stages; keep nominal plans explicitly separate from the conditional roof comparison. Supply revisioned atomic edits, reversal/undo/redo, save/load and stale-response rejection. Render the actual native roof output and stock schedule, and show the dependent evidence that the compiler withholds after a change. Prove exported JSON works through the existing CLI, real API/compiler equality and a late browser response. A thin local server may run specialist analysis; browser state must not become a second engineering model.

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
