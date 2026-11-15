# Versioned headless design edits

The [edit API](../../compiler/reference-house/current-design/edit.ts) accepts a `current-design-edit/1` transaction in millimetres with a session ID and base revision. It returns either a validated candidate and the net changes to declared dependencies, or the prior state and a typed rejection. Commands, saved drafts and snapshot geometry use plain JSON. The semantic modules use the same inputs in Node and a browser bundle. [Owning programme](current-house-integration-programme.md#ccr-edit-contract--headless-editor-boundary)

| Supported operation | Geometry and identity boundary |
| --- | --- |
| Move and resize an opening | Change the centre or width along the existing host reference line. Require the same storey, host and opening IDs. The shared snapshot validator checks the complete resulting opening set. |
| Move a wall | Translate a free-standing orthogonal partition perpendicular to itself along a clear reference-line sweep. Its hosted openings travel with their wall and retain their own source positions along it. Connected walls, rotation, rehosting, court and outer walls remain outside this command. Room reservations retain their authored geometry. |
| Change an assembly depth | Change the nominal depth of an existing envelope, partition or intermediate-floor assembly by ID. The host view and schedule derive from that reservation. A floor reservation that consumes the nominal ground-storey height remains editable and carries a revision-linked error from the lightweight geometry inspection. |

Starting a draft forks the supplied geometry into a separate candidate. An atomic batch advances the session revision once. Undo and redo restore exact authored documents and each advances the revision, including when a previous document recurs. `current-design-draft/1` saves the candidate and loads it into a new caller-identified session. The in-memory history belongs to that session. An accepted baseline remains at its original source and technical applicability.

The edit result reports affected fields and declared consumers. A geometry consumer can recompute. A declared evidence consumer receives a stale finding on the matching object and field. Applicability for unmapped evidence stays with its owner. The [analysis boundary](../../compiler/reference-house/current-design/revision-analysis.ts) uses a separate request and method identity for each revision. Its cancellation response releases the headless client promptly. Specialist work receives the `AbortSignal` and can stop cooperatively. A result can enter the current view only when it is complete and its revision, request and method match the active ticket.

## Executed checks

The [headless tests](../../compiler/reference-house/current-design-edit.test.ts) use the [current plan compile](../../compiler/reference-house/current-design/compile.ts), ADE bay cut and its linked schedule.

| Control | Observed output |
| --- | --- |
| Two-operation Study aperture transaction | Width 1000 → 1100 mm and centre X1800 → X1900. The compiled glazing and ADE row both move. The resulting cut spans X1350–2450. The first-floor row and accepted Georgian input stay equal. |
| Free-standing wall in an 8600 × 10200 mm specimen | Wall and hosted door move from X2600 to X2800 with the same IDs. The ground plan changes and the first-floor plan stays equal. The same command rejects a sweep crossing a second wall. |
| Depth mutations | The Study aperture cut and host schedule change together at 417.5 → 437.5 mm. A floor depth of 3500 mm in the 3450 mm storey yields a −50 mm nominal clearance, persists through save/load and still runs the candidate plan compile. |
| Reversal and rejection | Undo and redo restore the exact documents at revisions 2 and 3. Saved candidate bytes and compile results round-trip. Tests cover stale/cross-session requests, unknown schema or units, non-finite dimensions, unsupported rotation, host mismatch and an atomic invalid batch. |
| Headless asynchronous client | The old job receives cancellation. A job that ignores the signal cannot hold up the client. A completed older revision, replaced request, wrong method or absent active ticket supplies no current output. |

```sh
node --import tsx --test compiler/reference-house/*.test.ts compiler/architectural-drawing/*.test.ts
npm run typecheck
```

The supported operations complete the headless contract at nominal geometry scope. Discipline-specific recalculation, evidence dependencies for actual installed assemblies, selected technical bay work and the browser interface follow their registered packets.
