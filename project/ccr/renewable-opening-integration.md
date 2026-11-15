# Study window and paired court door renewal

The current compiler uses the stable ADE ground Study window and its south wall host to identify the nominal X1800 opening. The BCR bay receipt identifies the same opening in the occupied HAD arrangement at X2100. The OAS Study comparison binds that occupied occurrence to the BCR, MAT, IAS and HAD input bytes.

A width case recalculates the symmetric dry jamb section with the kernel used by the native OAS comparison. The existing E0 frame stays 922 mm wide. The section drawing, available width schedule and retained frame clearance use the same calculation.

| Occupied aperture width | E2 carrier | Available jamb width | Retained frame clearance per jamb |
| --- | --- | --- | --- |
| 1000 mm | Tight | 914 mm | −4 mm |
| 1000 mm | Separated | 904 mm | −9 mm |
| 1020 mm | Tight | 934 mm | +6 mm |
| 1020 mm | Separated | 924 mm | +1 mm |

The geometry is a dry plan cut through the jamb. The positive width screen leaves the arch head, glazing, support, fixings and weather performance unresolved. The 250 mm inward half-head draw and 2 mm pocket reserve belong to the original 1000 mm comparison. Changing the width withholds that repair stroke evidence.

The paired south-court threshold has its own HAD overlay occurrence and authored proof. The compiler returns its exact native section and the distinct captured leaves and pan movements. It records the 500 mm leaf translation and 500 mm pan pull after screen installation and the separately described leaf, frame and sill removal. The geometrical handling proof reports 28.77 mm body reserve. Clamps, operating forces, weather and selected product approval remain open. The native front-door geometry is a different occurrence.

Run the CLI with a versioned request of the form `{"schema":"renewable-opening-request/1","design":…,"study":{"schema":"oas-study-width-case/1","widthMm":1020}}`. Supply the current source returned by `--read-georgian-source` as `design` and use `--renewable-openings REQUEST.json`. Omitting `study` returns the native comparison width. Contrast-design and stale authority inputs fail explicitly. The width is an OAS trial configuration against the exact accepted occupied evidence. It does not amend the nominal snapshot or change other door occurrences.

Check this integration with `node --import tsx --test compiler/reference-house/current-design-renewable-openings.test.ts`. The owning receipt checks remain `node project/oas/studies/study-subframe.mjs --check` and `node project/had/studies/water-replan.mjs --check`.
