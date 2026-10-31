# P04 — Wall / Ceiling Movement Junction Test Protocol

**Status:** ready for physical screening once specimen is built  
**Date:** 2026-10-12  
**Build pack:** [P04 Wall / Ceiling Movement Junction Build Pack](p04-wall-ceiling-build-pack.md)  
**Reference House occurrence:** `RH-P008-01 / WCJ-01`

P04 compares three things that can easily be confused:

1. **movement performance** — does the junction tolerate the movement it is meant to tolerate?
2. **reversibility** — can the cover/interface be removed and returned cleanly?
3. **architectural quality** — does the room still look and feel like a finished room rather than a technical mock-up?

A candidate must survive all three. Clever movement behaviour is not enough.

---

## 1. Freeze before testing

Record before the first movement cycle:

- specimen family `A / B / C`;
- drawings / detail revision;
- wall and ceiling finish materials;
- cover/cornice/metal material and profile;
- controlling assembly and fixing schedule;
- nominal hidden gap / overlap;
- rig zero datum;
- expected project movement envelope if known;
- deviations from the build pack;
- baseline photographs at fixed viewpoints.

If the expected project movement envelope is not yet available, mark the test **EXPLORATORY**.

---

## 2. Baseline room-quality assessment

Before inducing movement, assess each finished family independently.

Use at least three viewing conditions:

- close detail distance: ~0.5 m;
- ordinary room distance: ~2 m;
- oblique room view where waviness/shadow inconsistency is visible.

Record:

- straightness / datum quality;
- visible gaps;
- finish quality;
- whether the detail attracts attention unnecessarily;
- apparent permanence / solidity;
- whether metal, if present, appears functional or ornamental;
- comparison with conventional control.

Where possible, obtain at least one assessment from a competent architect/joiner/finisher who did not design the detail.

---

## 3. Exploratory movement sequence

If a project-specific expected movement envelope is available, that envelope controls the acceptance sequence.

If it is **not** available, use the rig only as an exploratory screen:

```text
0 mm
→ +1 mm
→ 0
→ -1 mm
→ 0
→ +2 mm
→ 0
→ -2 mm
→ 0
→ +3 mm
→ 0
→ -3 mm
→ 0
```

The ±1/2/3 mm sequence is **not a claim that the real building will move by those values**. It exists to reveal where each junction begins to lock, crack, expose a gap or lose visual control.

Stop before damage becomes unsafe or the rig itself ceases to represent the intended movement mode.

At each step record:

- actual displacement;
- visible crack/gap location;
- cover movement;
- rubbing/binding/noise;
- finish damage;
- whether decoration bridges the intended slip plane;
- whether the joint returns visually to zero after the rig returns to zero.

---

## 4. Cyclic movement

For the **selected project-derived movement amplitude**, or for a clearly labelled exploratory amplitude if project data remains unavailable, perform repeated cycles.

Recommended screening count:

- **20 cycles** at the selected/exploratory amplitude;
- photograph at cycles 0 / 5 / 10 / 20;
- inspect hidden interfaces after cycle 20 where removal permits.

Twenty cycles do not represent the building's lifetime. They are a repeatability screen for rattle, wear, finish bridging and loss of datum.

---

## 5. Decoration-lock test

One of the main failure risks is that a sound mechanical slip detail is defeated later by paint, caulk or filler.

Test the junction under the intended ordinary decorating sequence.

Ask:

1. Can a competent decorator understand where not to bridge the joint?
2. Does the detail still work after at least one realistic repaint/redecoration cycle?
3. Is the slip plane protected by geometry, or does it rely on a note nobody will read in 20 years?
4. If caulk/filler is required, which assembly owns it and can it tolerate the intended movement?

A detail whose movement behaviour depends on permanent specialist decorating knowledge should be heavily penalised.

---

## 6. Removal / reinstatement test

For P04-B and P04-C, perform **10 complete local removal/reinstatement cycles** of the cover/cornice/interface piece.

Record:

- tools used;
- access sequence;
- time per cycle;
- collateral finish removal;
- fixing wear;
- loss of datum;
- edge damage;
- need for filler/redecoration;
- whether fire/acoustic/air closure represented behind the cover is disturbed.

The cover should return to its intended datum without accumulating visible looseness or requiring progressively larger screws/adhesive repairs.

Do not interpret ten cycles as service-life proof; it is a workmanship/repeatability screen.

---

## 7. Tolerance / imperfect-background trial

Introduce a representative, declared background imperfection before installing at least one challenger specimen.

Examples may include:

- slight wall waviness;
- ceiling datum variation;
- corner not perfectly square.

The magnitude should be declared before installation and should represent a plausible competent-build deviation, not deliberate sabotage.

Record whether:

- the detail has a designed adjustment method;
- installers improvise packing/filler;
- the visible line remains calm;
- movement capacity is accidentally consumed by tolerance correction.

A junction that is beautiful only on CNC-perfect backgrounds is not robust enough for the project.

---

## 8. Sound / tactile screen

The interface should not introduce a new source of domestic irritation.

At zero datum and after cycling:

- tap/press the cover at representative locations;
- listen for rattle, buzz or loose-metal noise;
- check whether ordinary cleaning/hand contact causes movement;
- compare with the conventional control.

This is not an acoustic-standard test. It is a normal-use quality screen.

---

## 9. Repair after over-range movement

After ordinary testing, intentionally move the rig beyond the selected movement envelope far enough to create a visible failure, within safe rig limits.

The purpose is not to demand infinite movement capacity. It is to discover **how the detail fails**.

Record:

- first visible failure mode;
- whether damage localises at a replaceable cover/finish zone or propagates into larger wall/ceiling areas;
- repair steps;
- materials/time required;
- final appearance after repair.

Prefer a detail that fails locally and legibly over one that hides distress until a larger brittle finish area releases.

---

## 10. Specialist boundary review

P04 is not fire, acoustic or airtightness certification.

Before Reference House technical adoption, a competent reviewer must confirm that the selected junction can be detailed so its movement gap / removable cover does not compromise:

- required fire resistance;
- acoustic separation / flanking control;
- airtightness where the junction participates in the air boundary;
- any cavity-barrier or service-zone obligation.

If the selected visible mechanism requires the decorative cover itself to perform one of those primary duties, the detail should normally be redesigned.

---

## 11. Acceptance matrix

### P04-A — conventional control

Record its actual performance. Do not assume conventional = bad.

### P04-B — concealed slip

Advance only if it demonstrates:

- movement at least as well controlled as the conventional comparator over the **project-derived** design movement envelope;
- no persistent rattle/looseness;
- credible decoration robustness;
- clean local removal/reinstatement;
- architectural quality at least equivalent to the control;
- no disproportionate fire/acoustic/boundary penalty identified at review.

### P04-C — metal challenger

Must meet every P04-B requirement **and** demonstrate a functional reason for visible metal that the concealed solution cannot achieve as well.

If not, reject the metal even if it is attractive.

---

## 12. Verdicts

Choose one:

### `P04-CONVENTIONAL`

The excellent conventional junction remains the best result. `RH-P008-01` is implemented conventionally and the project keeps the movement principle without a special visible mechanism.

### `P04-CONCEALED-SLIP`

The mechanically fixed concealed-overlap cornice materially improves movement/reinstatement without making the room technical.

### `P04-METAL-FUNCTIONAL`

Visible metal earns selection because it performs a necessary protection/slip/removable-interface duty better than the concealed alternatives.

### `P04-QUALIFY`

Promising, but expected movement, decorating robustness, boundary closure or normal-use quality remains unresolved.

### `P04-REJECT`

The challenger adds complexity without enough value. Retain the better conventional condition.

---

## 13. Evidence authority

A P04 pass may:

- select the Reference House implementation of `WCJ-01`;
- strengthen project evidence for `PAT-008 — Movement / Slip Junction` where the observed behaviour is relevant;
- refine the tectonic language around cornice / restrained metal.

It does **not** prove that every wall/ceiling junction should use a cornice or metal line, nor does a visually successful mock-up establish fire/acoustic compliance.

The preferred result is the **simplest junction that moves harmlessly and then disappears from attention**.