# ADE candidate plan editor

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
