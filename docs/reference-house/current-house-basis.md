# Current Reference House — design basis and technical limits

The accepted pre-site design is **RH-LAYOUT-REVISION-02**, the 12 × 12 m courtyard house. Its coordinated drawing family is **RH-LAYOUT-FAMILY-02**. The owner accepted this working layout; acceptance does not establish technical adequacy or a construction issue. A future commissioned house will have its own surveyed site and adopted project basis.

## Selected HAD development and accepted compiler identity

[HAD-03 selects the compact B/open north loggia](../../project/had/had-03-open-north-loggia.md) as its architectural development source, including the actual four-bedroom/private/service layout,27/30 finish depths, protected route, outdoor water territories and named costs. Its authoritative model is `project/had/studies/open-north-loggia.json` (B/9300 spine).

This does **not** replace the accepted RH-LAYOUT-REVISION-02 / RH-LAYOUT-FAMILY-02 compiler baseline (A/9500 spine), and those existing generated views must not be described as depicting the selected HAD house. Earlier studies retain their dated dimensions/proof identities. ROF-RWT-GATE and TRIAD reconcile the actual shared selection; HRS-TECHNICAL owns technical migration/applicability, ADE-MODEL connects current identities to outputs, and PLT-FINAL-PREP owns the final coherent proof. These existing duties, rather than a new parallel graph, control shared adoption.

## Sources to use

| Question | Owning source | What it establishes |
|---|---|---|
| Plan, room reservations, partitions, entry void and service geography | `compiler/reference-house/georgian/layout-revision.ts`; [layout decisions](layout-revision-02.md) | The accepted architectural arrangement, including unresolved fit and access questions |
| Section, facade and roof composition | `layout-family.ts` and its upstream `section-exemplar.ts` / `source.ts`; [coordinated family](https://github.com/adamnoden/architecture/blob/main/docs/publication/architectural-plate-layout-family.md) | Source-derived views; no engineered member, roof assembly or performance selection |
| Apertures | `revisionOpenings()` in `layout-revision.ts`, keyed by level, host and ID | Nominal location and width; masonry opening, frame, clear passage and removal dimensions remain distinct |
| Shared dimensional budgets and design ownership | `project/triad-interface-contract.md` | Current constraints for interior, opening and architectural studies; not a selected-system freeze |
| Structural direction | [Structural brief](structural-brief.md) | Solid masonry, direct support, arches and structural-family preferences; no adopted thickness, member or revised geometry |
| Roof prohibition | `project/design-constraints.ts` and [brief ledger](https://github.com/adamnoden/architecture/blob/main/docs/reference-house/brief-and-constraint-ledger.md) | No flat or very-low-slope new roof; the present twin-pitch form remains provisional |
| Exterior views | [Exterior isometrics](exterior-isometrics.md) | Four views of the same current geometry; no construction-detail inference |
| Project needs and open owner decisions | [Owner project brief](https://github.com/adamnoden/architecture/blob/main/docs/delivery/owner-project-brief.md) | Confirmed purpose, inherited assumptions and unresolved decisions; no invented site or budget |

Names alone are not content fingerprints. The execution result `project/hrs/hrs-baseline-result.md` records the inspected Git revision and source blobs. Later source changes require a fresh applicability decision.

## Current architectural facts

The shell is 12000 mm square and the open court 3500 mm square, centred at x/y 4250 mm. The nominal ring is 4.25 m gross; that is not a clear structural span. Ground and first finished floors are 0 and +3450 mm, with 3100 mm clear ceilings. The intermediate 350 mm package is fully allocated: 20 mm finish, 22 mm deck, 238 mm framing, 55 mm service void and 15 mm ceiling. It contains no unallocated depth for another layer.

The front has five bays and a centred entrance. The ground floor has west-front study and cloakroom, east-front WC and utility, an eastern plant room and pantry, north-east kitchen and north/west family-dining space. Four bedrooms, a family bathroom and two en-suite reservations occupy the upper floor. The smaller en suite remains unfitted. An entrance void and bridge interrupt the first floor; their load path, guarding and fire/smoke consequences are unresolved.

The return stair has twenty 172.5 mm rises in two flights, 300 mm goings, 1100 mm flight width and a 1635 mm landing. The west gallery is 1015 mm clear in the represented geometry. These dimensions do not establish finished headroom, handrail clearance, carrying, evacuation or stair-lift compatibility.

The envelope drawing uses 417.5 mm overall depth and the dry partitions 125 mm. Actual structural, thermal, moisture, fire and acoustic assemblies remain to be selected and coordinated. No historical 450 mm wall stress test certifies the present rooms or circulation.

The eastern plant reservation is about 8.03 m² clear in the current plan. The riser is a 550 × 700 mm drawn reservation, with adjacent lining and panel reservations. Neither is proven internal free volume or product capacity. Plant packing, withdrawal, sanitary drainage, wet-floor depth and the small-en-suite access conflict remain open.

The roof has 25° inward and outward pitches, +6800 mm eaves and a 2125 mm ridge inset. Both inner and outer eaves need collection and failure-path design. The courtyard cannot be assumed to receive only direct rainfall. Collection, overflow, discharge, safe maintenance and any PV field remain unselected; older low-slope roof results do not answer these questions.

## Technical position

The [structural brief](structural-brief.md) now directs investigation of solid masonry, aligned support, real arches and non-timber primary structure. Earlier engineered-timber framing is an inherited concept, not a selected system or an exemption from that brief. The entrance void, stair and service interruptions need current load paths and member/connection design. A diagram of short spans does not establish that the house needs no transfer structure. The [structural architecture programme](https://github.com/adamnoden/architecture/blob/main/project/str/structural-architecture-programme.md) must earn any changes to the present partition and floor reservations through coordinated source revision.

Concentrated services, separate cooker source capture, accessible isolation and proportionate replacement access remain design intentions. The historical heat-pump, emitter and MVHR studies are evidence about an earlier arrangement; their capacities, routes and fit have not been established for this house. Passive environmental form remains a priority. The current ventilation decision must reconcile owner preferences, indoor-air requirements, moisture, acoustics and route feasibility without treating a remembered system choice as a completed design.

## Applicability of inherited evidence

| Material result | Applicability to this house | Next owner / withheld claim |
|---|---|---|
| Layout revision, coordinated orthographics and exterior isometrics | Applies to the represented current source at its stated geometric/drawing scope | PLT maintains correspondence; no technical acceptance follows |
| Shared interface budget and IAS/OAS/HAD candidate work naming revision 02 | Applies at the named candidate/interface scope | Design owners and the shared integration gate must resolve adverse fit findings |
| original brief and general serviceability intentions | Narrowed: confirmed preferences and open questions survive; old room/datum selections do not | Owner brief and current design sources control conflicts |
| predecessor technical plan/section, structure, environmental, roof/water, energy and maintenance studies | Historical geometry-specific results; methods and questions may be reused after rechecking | BCR physical studies, ROF/RWT and HRS technical migration; no inherited whole-house coordination pass |
| Historical model freeze and compiler fixtures and generated inspection outputs | Historical/regression evidence for their own source identity | CCR repairs methods; HRS technical migration decides current inputs/applicability. Passing old fixtures is not a current-house pass |
| discipline briefs and regulatory baseline | Current-house questions refreshed after early physical studies; unissued, no competent review or technical acceptance | [EPR applicability](https://github.com/adamnoden/architecture/blob/main/project/epr/current-house-review-applicability.md) records exact inputs and remaining issue prerequisites; recheck changed source before issue |
| Historical G-01 conformance and old pattern occurrence register | Narrowed: grammar/pattern meanings survive; occurrence and conformance claims need current design review | HAD, IAS/OAS and HRS; no automatic transfer of a historic conformance verdict |
| Structural floor-edge and wall/ceiling physical-test briefs and historical interface handoffs | Narrowed to their actual configurations and proposed tests | PHY applicability after early feasibility; no test result is created by this reconciliation |
| DPL conditional/site-transform studies and implementation records | Historical candidate/fixture scope; no actual site or placement for revision 02 | DPL owner-house plot brief and eventual authorised site assessment |
| Maturity and evidence-freshness assessments | Their existing assessed subjects only; this change makes no promotion or demotion | PCO applicability must bind assessments to design sources; source freshness is not design applicability |

Historical documents remain recoverable with their original dimensions and proof identities. Their local use of “current” means current at that document's historical baseline. Start with this page for the accepted house; use a dated predecessor only with its stated applicability.
