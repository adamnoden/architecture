<!-- nav-exclude: redirect -->
# Ground-plan feedback resolution

Parent: PLT #422 / #746 / #759. Revision packet: #889. Review medium was not
stated. The owner's positive overall reaction is not physical acceptance;
the specific defects reject PLT-03B.2 as a token-freeze candidate.

## All 15 observations

| No. / image | Finding | Disposition |
|---|---|---|
| 1 / image-1 | Garden openings existed only as a qualitative host relationship in C1; numeric RH-10 axes were not admitted into the plan. | Select family and kitchen windows on the outer axes and a central pair of garden doors. Source the order to RH-10; record the new nominal apertures as provisional choices. |
| 2 / image-1 | The grey horizontal line was a host-only opening-obligation band, not construction. | Remove it by resolving that obligation to real typed apertures, not by hiding an unresolved entity. |
| 3 / image-2 | Offset partition brackets denoted required connectivity, with neither a chosen door nor a conventional dimension. | Replace the obligations with selected doorways or explicit open-plan connections. Retain genuine partitions as ordinary physical bodies. |
| 4 / image-2 | A wall cut alone did not communicate window type. | Add paired glazing strokes for typed windows. These are schematic symbols, not technical frame sections. |
| 5 / image-2 | The front apertures are 1050 mm principal / 900 mm stair windows, approximately 1.85–1.90 m tall in the principal family. Plan view hides that height. | Keep those tall front-window proportions. Do not widen them to cure a missing glazing symbol. Rear principal windows receive their own wider 1500 mm nominal. |
| 6 / image-3 | Courtyard north/south widths and east/west positions were unselected. | Select 1400 mm paired doors north/south, two west room-owned windows and two east gallery windows; cut the actual wall layers. |
| 7 / image-3 | Required internal adjacency was represented without chosen doors. | Select drawing/hall, drawing/family, study/gallery and service/gallery doorways. Ground hall/gallery is one open circulation field. |
| 8 / image-3 | The service suite had room reservations without north/south physical enclosure. That was incomplete modelling, not an intended study–utility–kitchen open room. | Add both enclosure walls. Keep the suite's internal utility/plant/WC subdivision explicitly unselected; it is not one finished undivided sanitary room. |
| 9 / image-3 | Courtyard grey vertical lines were host-only opening bands. | Resolve the two-bay relationships into explicit windows and remove the bands. |
| 10 / image-3 | Diamonds meant known centre / unknown width. The uncertainty came from deferred authoring, not an external fact that could not be chosen. | Choose provisional nominal apertures upstream. Preserve uncertainty about technical details without obscuring the building's basic doors and windows. |
| 11 / image-4 | Joined corners and composed dimension ticks were positively received. | Keep their existing topology and dimension grammar. |
| 12 / image-4 | Pale fills alone weakly distinguished the leaf/cavity boundaries. | Add fine 45%-opacity boundaries to non-cavity bands. Keep the cavity white. Reject brick-bond lines and whole-house hatch for this candidate: they add clutter and unowned detail. |
| 13 / image-5 | Centred thin partitions meet thick courtyard construction with offsets. The more useful question is whether those partitions belong there. | Remove both rear partitions; family, garden dining and kitchen become zones of one open rear living field. Do not fiddle with the offsets to preserve unnecessary walls. |
| 14 / image-6 | Actual stair geometry was absent, and the old 2.5 m square fit claim fails for the ordinary three-sided 6/6/6 arrangement. | Author and draw a two-flight 9/9 return stair, retaining 18 rises, 300 mm going and 1 m clear flights; widen the front hall on both floors and check arrival/turning clearances. |
| 15 / image-6 | The entrance was indistinguishable from a window-shaped gap. | Render its explicit single leaf and inward swing, with its sweep kept clear of the stair envelope. |

## Architecture before representation

The [architectural decision](../reference-house/ground-plan-resolution.md) owns
the provisional changes. `compiler/reference-house/plan-resolution.ts` owns
the numeric choice register and a source factory that preserves historical
C1 while producing the current coordination successor. The adapter does not
promote a plausible renderer coordinate into architectural authority.

Important costs are visible:

- front drawing/hall boundary X 4000 → 3100 mm on both levels; approximately
  3.06 m² gross planning area leaves each affected front west room;
- gallery/service boundary X 9100 → 9350 mm; service suite gross width becomes
  2650 mm and represented east-gallery clear width becomes 1070 mm;
- upper south turn deepens 300 mm, giving 1120 mm clear at the represented
  walls; the upper east-front bedroom loses some planning area;
- stair topology becomes 9/9, not 6/6/6. Clear-flight footprint is 3400 ×
  2100 mm with a 3500 × 2200 mm coordination envelope.

These are reviewable provisional architectural choices, not a hidden styling
change or completed technical design. The existing complete-system compiler
passes, including its bounded stair calculation. Structural framing of the
new opening, actual guarding/headroom, finished furnishing, service-equipment
capacity and fire/escape performance remain unproved.

The rear open plan and actual stair are changes of design authority. Later
sections/elevations, room-fit and stair-opening checks and the final DPL
canonical-source delta check must consume the successor if it is adopted.
The first-floor compatibility SVG is regenerated at the new coordinates; it
is not falsely presented as an accepted PLT-04 plate.

## Drawing and proof implementation

Generic ADE adds optional typed opening symbols and a straight parallel
return-stair semantic entity. Symbol selection requires nominal position and
width; unknown/ranged inputs cannot acquire a plausible door/window. The
stair has model-space rise/going/landing geometry and level-specific UP/DN
notation. The generic engine contains no Reference House source IDs.

A small terminal capability, path stroke opacity, earns the requested faint
leaf boundaries. Without that optional field, existing terminal bytes and
all earlier ADE/contrast fingerprints are unchanged. Physical line, text,
marker and dash metrics remain constant between 1:100 and 1:50.

The labelled replacement proof is `publication/specimens/plt03b3/`:

- B5/A4 page 1: immediately previous ADE candidate, labelled PREVIOUS;
- B5/A4 page 2: revised architectural candidate, labelled REVISED COORDINATION;
- A2: revision only at 1:50;
- paired first-floor SVGs and source/scene manifests: coordination evidence.

The historical black-poche v1 control is not page 1 in this new comparison.
The proof regenerates the prior accepted manifest before generating the new
source, so the comparison cannot quietly drift. Finished-PDF scale, page,
constant note size, pinned Source Sans and Unicode gates remain mandatory.
Physical verdict stays UNREVIEWED and print tokens stay unfrozen.
