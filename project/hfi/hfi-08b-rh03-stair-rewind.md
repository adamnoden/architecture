# HFI-08B — RH-03 Stair Rewind / HFI-RW-01

**Packet:** HFI-08B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Rewind authority:** [`hfi-07e-finding-rewind-register.md`](hfi-07e-finding-rewind-register.md)  
**Baseline:** `e4f19846377bc9206e8d8030136fdda79585ad09`  
**Owning Reference House gate:** RH-03  
**Question:** does the complete principal stair perform better with the HFI-preferred 300 mm going once its coupled plan, section, structure and circulation costs are made explicit, or does the existing 280 mm stair justify retention?

---

## 1. Decision

**Select 300 mm going.**

The Reference House retains the existing stair family:

- 18 risers total;
- three flights of six risers;
- five goings per flight;
- full landings;
- no winders;
- nominal ≈1000 mm clear-flight target remains provisional;
- existing south entrance-hall position;
- existing south landing → east gallery → north landing upper circulation topology.

Only the controlled going changes:

`RHCF-STAIR-G: 280 mm → 300 mm`

At the controlled RH-04 first-floor FFL of +3300 mm this gives:

| Measure | 280 mm baseline | 300 mm selected | Consequence |
|---|---:|---:|---|
| risers | 18 | 18 | unchanged |
| rise | 183.33 mm | 183.33 mm | unchanged |
| goings / flight | 5 | 5 | unchanged |
| flight run | 1400 mm | 1500 mm | +100 mm |
| `2R + G` | 646.67 mm | 666.67 mm | remains inside encoded 550–700 mm method range |
| pitch | ≈33.22° | ≈31.43° | shallower |
| landings | full | full | unchanged |
| winders | none | none | unchanged |

This is an architectural preference decision, not a claim that 300 mm is a universal statutory minimum.

---

## 2. Why 300 mm wins

HFI-02B/HFI-06B/HFI-07C established the mechanism: a principal domestic stair is a high-frequency, high-consequence route, and deeper secure treads reduce the need for conscious foot placement and compensation, particularly when descending, carrying, tired or operating with reduced spare attention.

The comparison is favourable because the project can buy that benefit cheaply.

The selected three-flight topology was already adopted to preserve generous ordinary treads inside the shallow south wing. Increasing five goings from 280 to 300 mm adds only **100 mm of run per flight**. The existing RH-03 reservation is approximately **2.4–2.5 m square**, so the revised stair consumes the upper end of an already-authorised coordination field rather than demanding a new room, shell or courtyard geometry.

The 300 mm alternative therefore improves the repeated-use condition without requiring any of the unacceptable trades identified in HFI-07E:

- no shell enlargement;
- no courtyard reduction;
- no service-hub displacement;
- no winder introduction;
- no floor-to-floor change;
- no loss of the east-side all-weather passage as an architectural requirement;
- no change to the selected upper-floor circulation topology;
- no new proprietary equipment or lift reservation.

Retaining 280 mm would save 100 mm per flight but would no longer be the proportionate optimum once the human-factor preference and actual spatial cost are considered together.

---

## 3. RH-04 section recheck

RH-04 owns the current first-floor FFL of **+3300 mm** and the restrained ground-floor sectional primacy.

That datum is retained.

With 18 rises:

- rise remains **183.33 mm**;
- 300 mm going gives `2R + G = 666.67 mm`;
- pitch becomes approximately **31.43°**.

No storey datum, ceiling datum, cornice datum or opening head needs to move.

The front stair-window relationship also survives: its centreline remains controlled by the four-bay elevation field while its higher sill remains stair/section-led. Detailed headroom and guard/string relationships are still technical-resolution obligations; the going change does not convert absent geometry into proof.

**RH-04 recheck: PASS — no geometry rewind beyond the stair itself.**

---

## 4. RH-05 structure recheck

RH-05/technical coordination carries:

- short engineered-timber floor spans between permanent masonry lines;
- local framing around the stair opening;
- no claim of final stair-trimmer sizing or exact technical opening geometry.

The selected change alters flight run but does not move the principal masonry support lines, courtyard, shell, floor spans or structural concept. The stair remains a bounded local interruption requiring deliberate local framing.

No new structural member, transfer system or whole-house framing consequence is earned at this resolution.

**RH-05 recheck: PASS at the existing pre-engineering scope.**

---

## 5. RH-10 whole-house recheck

The 300 mm stair preserves the whole-house relationships RH-10 depends on:

- stair remains principal arrival/circulation rather than service circulation;
- ordinary daily routes remain intact;
- shell and courtyard remain unchanged;
- service flank remains unchanged;
- south landing → east gallery → north landing remains unchanged;
- no new infrastructure is introduced;
- no room programme changes.

The east-side passage remains a required occupied route. Final string/balustrade/wall geometry must still prove its target clear width at technical resolution; HFI-08B does not manufacture that finished geometry.

**RH-10 recheck: PASS at coordination scope.**

---

## 6. Pattern occurrence register

No canonical pattern occurrence is created, deleted or materially changed by this rewind.

The Reference House pattern occurrence register contains no stair-going pattern whose implementation identity depends on 280 mm. HFI-08B therefore records **no occurrence-register delta** rather than inventing one to satisfy process language mechanically.

The stair decision remains project geometry governed by RH-03 and HFI targets, not a new pattern-language claim.

---

## 7. Stairlift / lift scope remains unchanged

The nominal ≈1000 mm clear-flight target remains insufficient evidence for stairlift compatibility.

HFI-08B does not claim compatibility because it still lacks represented:

- handrail/guard envelopes;
- rail/chair equipment family;
- parking and transfer geometry;
- door conflicts;
- residual ordinary-stair route;
- power/interface provision.

The result remains **NOT-MODELLED** for stairlift compatibility.

No through-floor lift reservation is introduced.

---

## 8. Canonical-source propagation

The architectural selection is encoded at the semantic source:

`compiler/reference-house/fixture.ts`

with:

`RHCF-STAIR-G.going = 300 mm`.

Derived consequences continue to be calculated rather than independently authored:

- rise;
- run per flight;
- pitch;
- `2R + G`;
- deterministic RH-C1 stair projection;
- RH-C5 selected-target calculation.

The required propagation order is:

1. RH-03 human-readable authority;
2. RH-04 coupled section consequence;
3. RH-C0 canonical fact schedule / dependency map;
4. semantic fixture;
5. deterministic RH-C1 projections;
6. RH-C5 calculation re-run;
7. successor Reference House output bundle / manifest and project data plate where identities change;
8. controlled publication/DRW projections where canonical stair arithmetic is consumed.

Generated views are regenerated from source; they are never hand-adjusted merely to resemble the selected answer.

Historical gate evidence is retained only where its historical role is explicit. Current reader-facing or canonical surfaces may not continue presenting 280 mm as the selected stair.

---

## 9. Authority / maturity consequence

HFI-RW-01 is **resolved by architectural change**.

This packet changes one controlled Reference House source fact and its genuine derived consequences. It does not:

- alter shell/courtyard geometry;
- alter room programme;
- alter the upper circulation topology;
- promote 300 mm into general doctrine;
- establish technical stair construction;
- prove stairlift compatibility;
- change maturity merely because a rewind was resolved;
- claim external validation.

The correction strengthens the current Reference House within its existing virtual-design scope.

---

## 10. Closeout condition

HFI-08B is complete only when:

- RH-03/RH-04 current authority is reconciled;
- RH-C0 carries 300 mm as the controlled going;
- deterministic compiler/output artefacts match the changed source;
- RH-C5 remains PASS under the encoded method;
- publication/DRW deterministic checks are green;
- no current authoritative surface still asserts 280 mm as the selected stair;
- the HFI-08A.1 data-plate corrective packet has merged ahead of this packet;
- full PR validation passes on the exact final head.

`HFI-08B → HFI-RW-01/RH-03 → compare 280 vs 300 as complete stair system → select 300 mm; retain 18 risers / 3×6 flights / five goings / full landings / no winders / +3300 FFL → +100 mm flight run with no shell/court/service/programme sacrifice → RH-04 PASS; RH-05 PASS; RH-10 PASS; no pattern-occurrence delta → update RHCF-STAIR-G and regenerate genuine dependants → exact next packet HFI-08C`

**Exact next packet:** **HFI-08C — entrance / threshold / door / right-sized movement-route corrections.**
