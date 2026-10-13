# RH-C4 — bounded envelope / boundary view

RH-C4 compiles the Reference House envelope relationships already coordinated through RH-08, RH-09 and RH-10. It sits downstream of RH-C3 and treats environmental boundaries as semantic systems rather than as extra labels on wall objects.

The executable slice keeps four independent boundary roles: **weather, air, thermal and moisture**. Each role is carried across outer walls, courtyard walls, roof and a qualitative ground-interface handoff. Openings, thresholds, selected service penetrations and the registered courtyard drainage crossing are typed transitions that must preserve explicit obligations.

The rainwater view is directional. Four roof fields drain outward, while the courtyard has a primary service-side route plus an independent visible emergency overflow. `PEN-CD-01` remains the registered occurrence owning both courtyard conduits rather than allowing them to become anonymous penetrations.

The proof boundary is deliberately narrow:

```text
ENVELOPE / BOUNDARY TOPOLOGY  MACHINE-CHECKED
BUILDING-PHYSICS PERFORMANCE   EXTERNAL — NOT PROVED
```

RH-C4 does not prove U-values, ψ-values, airtightness, rain resistance, condensation or hygrothermal performance, drainage capacity, fire/acoustic performance or product compliance. It exposes where those proofs are required and fails when the represented topology loses continuity or ownership.
