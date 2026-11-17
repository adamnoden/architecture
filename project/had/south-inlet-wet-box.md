# Separate the under-sill wet boxes at their removable fronts

**Prefer branch-specific wet closures for development. Retain the selected indoor inlet reference.** Use an independent fixed metal trough and sleeve-to-box bulkhead for each branch. Remove that branch’s upper front, target and split collar for renewal. A shared dry fascia is possible. A common wet cover or liner opens the second fault path when the first is serviced. A divided housing only preserves independence if each cell retains its own fixed bulkhead, cover, vent, supports and receiver. [Under-sill set-out](south-inlet-under-sill.md) · [Fault basis](south-inlet-relief.md) · [Reproducible receipt](studies/south-inlet-wet-box.json)

| House coordinates in mm | Utility | Plant |
|---|---:|---:|
| Box X at Y429.5 | 9995–10165 | 10200–10370 |
| Riser Y | 580 | 545 |
| Front Y / top Z | 665 / 680 | 665 / 730 |
| Permanent trough upstand Z | 363.29 | 463.29 |
| Adverse design water Z with upper outdoor mouth blocked | 322.54 | 422.54 |
| Ø32 formed vent at outer Y−90, X / Z | 10115 / 635 | 10345 / 688 |
| Ø32 formed vent at inner Y429.5, X / Z | 10115 / 645.39 | 10345 / 698.39 |
| Outside receiver lane X | 9980–10160 | 10200–10380 |

The Ø150 clear upper mouth leaves **5 mm on each side** within the 170 mm bulkhead after charging a 2 mm lining and 3 mm fabrication set. Keep the mouth continuously joined to the metal containment. Support the sleeve and the trough independently of the washable access panels. Keep the Ø100 clear emergency outlet opening into the bottom of each fixed trough. The lower wet seam and upstand remain intact during renewal. They retain **10.75 mm** to the measured-design head after allowing 20 mm splash and 10 mm setting. The upper closure still needs captive sealed edges, an inward-draining return and its own impact proof.

Put a separate outward-sloping **Ø26 clear** metallic vent in each Ø32 opening. Terminate each in its own accessible high weather and splash hood. Keep the hood open in the upper-mouth blockage case, without bonding it to either receiver or the other branch. A vent to the lower relief crown submerges by **39.25 mm** in either box. The new plant vent leaves **26.36 mm** to the upper formed sleeve, **25.61 mm** to the raw sill and **29.00 mm** to the jamb after the 10 mm setting. The earlier X10340/Z690 Ø30 comparator leaves only **24.61 mm** at the sill. The interior plant roof rises to Z730 to leave **10.61 mm** at the vent after plate allowance. The fixed exterior weather housing stays below Z715. This is a **six-opening** masonry and window interface. Formed clearances reserve geometry. The jamb, sill loads, actual ventilation through the selected hood under partial blockage, and physical window renewal still need proof.

Stand an 8 mm removable impact panel from Y637 to Y645 at each front. The utility face is X10051–10160 / Z385–620 with supports at X10051/10105.5/10160. The plant face is X10205–10365 / Z485–705 with supports at X10205/10258/10312/10365. Use folded side returns into the fixed trough and keep the ribs and fasteners clear of each lower throat. These faces leave **15 / 50 mm** behind the jacket after setting, and their bottoms stand **62.46 mm** above the screened wet level. Their local spans meet the 60 mm comparison. The tested target geometry still needs a captive load path, asymmetric impact, ricochet, corner seam and through-sleeve strike checks. The 9 bar ideal jet and 90 L/min design challenge remain separate source cases.

## Isolate, keep the low trough intact and withdraw one branch

1. Isolate the subject branch at the Boundary Service Lodge and the dry local cut. Verify both sides drained. Restrain the washer at its existing Y1500 first rest and close conflicting occupancy and electrical work fields for the temporary service state. Keep the other shell, supports and receiver closed and available.
2. Remove the subject front and captive target. Remove the utility diagonal face to its knee at X9995/Y522 and split the Ø88 roof collar. The complete collar clears the installed Y580 taper by **5.40 mm** after allowance. The original fixed taper rail locally intercepts the complete Ø74 withdrawal by **20 mm** after allowance. Purge remains available in normal use. Drawing the complete taper in a shared maintenance stage would intersect an *occupied* purge stance by 40 mm.
3. Carry a continuous bent bare metallic carrier through the upper sleeve. Place the outer connection at Y−140 and the indoor dry release at Z900. Remove the outer jacket and retained hardware in the outer housing before drawing. Release the exterior face axially. Positively retract the indoor companion face along Z until its seal, pilot and tools clear the moving assembly; then lock it to the independent dry support. Use the actual product engagement and wrench envelope to size the retreat and to select supports. A piloted union left engaged cannot draw sideways. The pressure contacts and thermal transition require complete rated parts; no unqualified wet joint is introduced at the inside bulkhead.
4. Support the isolated L carrier throughout a **620 mm straight +Y draw**. The proposed jacket has **43 mm** side reserve after setting with the upper front and taper removed, clears the retained lower lip by at least **73 mm** at the wall and parks far enough inboard to bring the outer tip **50.5 mm past** the inside finished plane. The utility and plant jacket ends leave **253 / 288 mm** to the restrained washer first-rest line. These are clearance reservations for the carrier without exposed outside fittings. Detail the guides, complete carried fittings, captive panel handling, reaction tools and structural supports before a loaded procedure. Restore pressure seals and test before allowing the dry occupied and electrical states again.

The shorter utility front trial at X10034/Y625 with the riser at Y560 leaves 4 mm through its fixed taper after setting, but retains only 25.04 mm at the purge stance and 55.5 mm before its R75 tangent. The Y580 enclosure keeps the longer bend and gives full-width access through a separately demountable taper.

The unresolved cutover requirements are a supported six-opening infill and sill, rated carrier and retrievable dry connections, freeze and motion protection, the joined vented wet assembly under independent 90 L/min challenges, and the verified source and separate external tailwaters. An assembly with its vents or reliefs shut does not pass. The dry access, baffle and receiver coordinates are development evidence.

Reproduce with `node project/had/studies/south-inlet-wet-box.mjs --check`.

## Check the whole straight draw in the current compiler

The local split collar gives the Ø74 riser only 2 mm of +Y travel after the 5 mm fit allowance if the remaining roof stays closed. A continuous branch-specific opening must follow the vertical riser to the released front. The ideal strip is 84 mm wide and extends to Y665. It needs 127 mm of roof length over the Utility box and 162 mm over Plant with the 620 mm draw. The lower trough and sibling closure stay in place. A clear-strip comparison means the strip is open for the motion, with its eventual independent cover, vent, retention and weather details still to qualify.

The compiler checks the full translation of the released carrier against the washer and retained trough, and screens the bare tube inside the sloping sleeve. It evaluates one branch at a time, with separate preparation checks for isolation, connection disengagement, wet front and target removal, sibling closure and temporary room and electrical exclusion. The ideal path still needs actual assembled union/tool clearances, a positively retained guide and independent first rest, and qualification of the wet closure before cutover.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-inlet-removal - > removal-cases.json
node -p 'JSON.stringify(require("./removal-cases.json")[0])' |
  node --import tsx scripts/compile-current-design.ts --inlet-removal -
```
