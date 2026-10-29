# RH-C5 — selected target calculations

RH-C5 is the first executable Reference House gate that evaluates a technical numeric method against an external authority rather than checking topology alone.

The initial selected family is deliberately narrow: **private-stair rise, going, pitch and 2R+G geometry** against Approved Document K guidance for England. The calculation method is versioned in code and records its document, edition, paragraph/table, source URL, jurisdiction and the date on which the source was checked.

This is **not** a release-grade compiler target. House Kernel already defines a compiler target more strictly: jurisdiction + legal snapshot + transitional basis + building/work classification + selected compliance routes + referenced standards. RH-C5 does not pretend those applicability questions have been discharged merely because one guidance table can be encoded.

The canonical Reference House already owns the required geometry: ground and first-floor datums, riser topology and going. C5 consumes those derived values; it does not create a second stair description.

CCR-STAIR corrects rise to `(firstFfl - groundFfl) / riserCount` and accumulates landing elevations from ground FFL. The source adapter carries actual controlling fact IDs, including both floors, into rise/pitch/2R+G provenance. A common elevation translation therefore changes absolute landings, not rise, pitch or the numeric result.

The existing single `goingsPerFlight` field admits equal straight-flight rise groups only: positive safely represented integer counts, each flight with one more rise than going and terminating at a landing or upper floor. Unequal flights need a separately justified representation; fractional/empty/non-finite/inconsistent declarations fail rather than being regrouped. Floor/storey inputs must be finite and ordered. This checks internal topology and arithmetic, not whether a flight run fits a plan reservation or whether its landing, headroom, guarding, support or construction is adequate. The historical canonical three-flight fixture and current Georgian house remain distinct sources; this repair does not migrate or redesign either.

```text
SELECTED NUMERIC METHOD CORRESPONDENCE  MACHINE-CHECKED
APPROVED-DOCUMENT GUIDANCE COVERAGE     BOUNDED-METHOD-ONLY
RELEASE-GRADE COMPILER TARGET           NOT ESTABLISHED
BUILDING REGULATIONS COMPLIANCE         NOT PROVED
WHOLE-BUILDING TECHNICAL ADEQUACY       EXTERNAL — NOT PROVED
```

For the selected private-stair family the implemented targets are:

- rise: 150–220 mm inclusive;
- going: 220–300 mm inclusive;
- maximum pitch: 42°;
- normal 2R+G relationship: 550–700 mm inclusive.

The fixture application context is explicit: England, dwelling, private stair. Here “private stair” follows Approved Document K's category for a stair intended for only one dwelling. That context is sufficient for this research correspondence check; it is not a substitute for a project-specific regulatory applicability / transition determination.

A `PASS` therefore means only that the represented values lie inside those four selected numeric guidance values. It does not establish Requirement K1 compliance as a whole, headroom, landing geometry, handrails, guarding, accessibility, fire/escape adequacy, construction tolerance, workmanship or building-control acceptance.

C5 intentionally does not implement U-values, thermal bridges, condensation analysis, rainwater capacity, structural member capacity, MEP sizing or whole-building compliance. Those families remain unsupported until their inputs and method authority are strong enough to earn a bounded calculation contract.
