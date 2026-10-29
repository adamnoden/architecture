# RH-C4 — bounded envelope / boundary view

RH-C4 compiles the Reference House envelope relationships already coordinated through RH-08, RH-09 and RH-10. It sits downstream of RH-C3 and treats environmental boundaries as semantic systems rather than as extra labels on wall objects.

The executable slice keeps four independent boundary roles: **weather, air, thermal and moisture**. Each role is carried across outer walls, courtyard walls, roof and a qualitative ground-interface handoff. Openings, thresholds, selected service penetrations and the registered courtyard drainage crossing are typed transitions that must preserve explicit obligations.

The historical rainwater view declares four outward roof fields and primary/emergency courtyard routes with different destination descriptions. A controlling house source that declares inward roof drainage fails explicitly: this adapter does not support that roof system. Every route needs non-blank origin and destination text; courtyard destination comparison collapses superficial whitespace. `PEN-CD-01` remains the registered occurrence owning both courtyard route declarations.

These checks establish source compatibility, declaration completeness and textual destination distinction. They do not establish physically independent paths, gravity continuity, a safe discharge or visible failure in the actual building. `visibleFailure: true` is an authored obligation, not observation or performance evidence. Current-house network selection remains with ROF/RWT and their gate; CCR does not migrate this historical adapter to the provisional Georgian roof.

The proof boundary is deliberately narrow:

```text
ENVELOPE / BOUNDARY TOPOLOGY  MACHINE-CHECKED
BUILDING-PHYSICS PERFORMANCE   EXTERNAL — NOT PROVED
```

RH-C4 does not prove U-values, ψ-values, airtightness, rain resistance, condensation or hygrothermal performance, drainage capacity, fire/acoustic performance or product compliance. It exposes where those proofs are required and fails when the represented topology loses continuity or ownership.
