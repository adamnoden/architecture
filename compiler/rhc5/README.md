# RH-C5 — selected target calculations

RH-C5 is the first executable Reference House gate that evaluates a technical numeric target against an external method authority rather than checking topology alone.

The initial selected family is deliberately narrow: **private-stair rise, going, pitch and 2R+G geometry** against Approved Document K guidance for England. The method is versioned in code and records its document, edition, paragraph/table, source URL, jurisdiction and date on which the source was checked as current.

The canonical Reference House already owns the required geometry: first-floor datum, riser topology and going. C5 consumes those derived values; it does not create a second stair description.

```text
SELECTED NUMERIC TARGET ALIGNMENT   MACHINE-CHECKED
APPROVED-DOCUMENT GUIDANCE ALIGNMENT BOUNDED-METHOD-ONLY
BUILDING REGULATIONS COMPLIANCE      NOT PROVED
WHOLE-BUILDING TECHNICAL ADEQUACY    EXTERNAL — NOT PROVED
```

For the selected private-stair family the implemented targets are:

- rise: 150–220 mm inclusive;
- going: 220–300 mm inclusive;
- maximum pitch: 42°;
- normal 2R+G relationship: 550–700 mm inclusive.

A `PASS` therefore means only that the represented values lie inside those four selected numeric guidance targets. It does not establish Requirement K1 compliance as a whole, headroom, landing geometry, handrails, guarding, accessibility, fire/escape adequacy, construction tolerance, workmanship or building-control acceptance.

C5 intentionally does not implement U-values, thermal bridges, condensation analysis, rainwater capacity, structural member capacity, MEP sizing or whole-building compliance. Those families remain unsupported until their inputs and method authority are strong enough to earn a bounded calculation contract.
