# DPL-14C — Five-Site Corpus Gap-Correction Review

**Issue:** [#402 — DPL-14C — five-site corpus gap-correction cohort](https://github.com/adamnoden/architecture/issues/402)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Protocol:** [DPL-14A](dpl-14a-real-plot-corpus-protocol.md)  
**Pilot:** [DPL-14B](dpl-14b-three-site-real-corpus-pilot.md)  
**Research date:** 2026-10-21  
**Assurance profile:** `SCREENING`  
**Status:** gap-correction cohort admitted; **not deployment trials, compatibility findings or a purchase shortlist**

## 1. Result

**PASS WITH ONE RESIDUAL CONTROL GAP.**

DPL-14C adds five deliberately non-random real-site records to the three-site pilot:

| ID | Borough | Site condition | Gap attacked |
|---|---|---|---|
| `DPL-RP-004` | Havering | ordinary street-front replacement dwelling | ordinary/replacement condition |
| `DPL-RP-005` | Hounslow | corner host site with side-road development frontage | corner / dual-frontage |
| `DPL-RP-006` | Greenwich | small Thamesmead residential parcel with flood/contamination/foul evidence | authoritative water/environment |
| `DPL-RP-007` | Croydon | steep/natural Kenley strip with current planning record | slope / topography |
| `DPL-RP-008` | Lambeth | small established-street garage redevelopment parcel | ordinary control / comparatively clear geometry |

The controlled eight-site index is now [`sites/corpus-1-index.json`](sites/corpus-1-index.json).

The cohort materially corrects the B2 pilot's bias toward backland/garage/path-access pathology. It does **not** claim statistical representativeness of London.

---

## 2. Coverage decision

### Ordinary street-front detached/replacement

**COVERED.**

`DPL-RP-004` is a conventional replacement-dwelling case with an official 2026 Havering application/decision identity. Its value is precisely that the site condition is less exotic than the pilot.

### Corner / dual-frontage

**COVERED WITH SOURCE-IDENTITY RECHECK.**

`DPL-RP-005` introduces two-street exposure and separate side-road access/servicing potential. The planning-subparcel identity is not promoted beyond the current evidence: two marketing surfaces share lineage and the direct legacy planning record still requires recovery.

This is a successful test of DPL-14B's `IDENTITY_LINK_CONFIDENCE` refinement, not a defect to smooth away.

### Reliably evidenced slope/topography

**COVERED WITH CANDIDATE-SCOPE CAUTION.**

`DPL-RP-007` supplies a materially steep site. The public evidence is sufficient to treat topography as decision-critical, but the recent planning proposal was for three dwellings.

Therefore:

```text
real parcel + steep condition = admitted corpus evidence
three-dwelling proposal       ≠ DPL deployment candidate
```

Before DPL-15 could use this parcel for a one-house trial, the deployment case would have to prove a controlled one-dwelling working parcel/candidate rather than inherit the prior scheme's development unit.

The site also exposed a direct source conflict in public decision labelling. The conflict is retained as `UNRESOLVED` and does not affect the topographic admission purpose.

### Authoritative flood/water/environmental trigger

**COVERED.**

`DPL-RP-006` is the strongest empirical addition. Public application evidence includes flood-risk, contamination and foul/utilities material, while the auction record separately warns of approximate geometry and possible adopted-highway overlap.

This is exactly the kind of cross-authority evidence DPL-08C / DPL-09C / DPL-12A need to encounter later without collapsing planning documents into title truth.

### Ordinary control with clear geometry + sparse planning history

**PARTIALLY COVERED.**

`DPL-RP-008` supplies a relatively simple one-home garage redevelopment site with a current approximate 97 m² market geometry and an official application identity.

However, DPL-14C does not possess direct evidence sufficient to assert **sparse planning history** as a site fact. Current permission status also needs direct notice recheck.

The correct result is therefore a useful lower-pathology control with a **residual targeted gap**, not a fabricated perfect control.

---

## 3. Provenance red-team

DPL-14B's four refinements are now confirmed as mandatory rather than pilot-specific.

### `SOURCE_LINEAGE`

The Hounslow corner case proves that two live property portals may be two surfaces over one upstream set of particulars. URL count is not corroboration count.

### `SPATIAL_SCOPE`

The Thamesmead and Hounslow cases both show why a marketing outline, planning red line, adopted-highway extent and legal title must remain different spatial claims.

### `TEMPORAL_STATE`

Replacement, garage and auction sites repeatedly require separate statements for:

- application-date physical condition;
- decision-date planning state;
- current marketing assertion;
- current build-out state, often still unknown.

### `IDENTITY_LINK_CONFIDENCE`

The cohort uses uncertainty explicitly rather than refusing every messy record or pretending every source describes the same parcel exactly.

The controlled relation remains:

```text
EXACT_IDENTITY
LIKELY_OVERLAP
CONTEXT_ONLY
UNRESOLVED_LINK
```

No new provenance enum is earned by DPL-14C.

---

## 4. Protocol tensions exposed

### Multi-dwelling history does not define the DPL candidate

`DPL-RP-007` is the sharpest test. A real parcel can be useful evidence for topography even when the proposal that exposed the condition was multi-unit.

The corpus protocol still requires the **one new low-rise detached dwelling question to be meaningful**. DPL-14C interprets that as a deployment-question test, not a requirement that every discovery application itself proposed one dwelling.

That interpretation is safe only because the record explicitly withholds a deployment candidate and DPL-15 result.

### “Ordinary” is not the same as “well evidenced”

The search for a boring control was harder than finding constrained development land. Public sources disproportionately surface auction/development/planning-active sites.

That is a source-selection bias worth preserving in the corpus record. The future 24-site collection should deliberately spend effort on ordinary replacement/side-garden parcels rather than simply ingesting whatever development portals expose most richly.

---

## 5. Corpus state after DPL-14C

Corpus 1 now contains:

```text
8 admitted screening records
7 Greater-London boroughs
0 deployment compatibility conclusions
0 purchase rankings
```

Boroughs represented:

- Barnet;
- Bromley;
- Croydon;
- Greenwich;
- Havering;
- Hounslow;
- Lambeth.

No borough exceeds the DPL-14A concentration limit.

The cohort is materially more varied across:

- street-front / backland / corner relationships;
- access conditions;
- plot scale;
- slope/topography;
- trees/context;
- water/environmental evidence;
- planning-history richness;
- provenance cleanliness.

---

## 6. Remaining gaps before bulk scaling

DPL-14C does **not** authorise blind expansion to 24 sites.

The remaining collection should deliberately seek:

1. a low-pathology ordinary parcel whose sparse planning history is directly proved rather than merely unrecovered;
2. survey-grade orientation/topographic geometry on at least some sites;
3. materially narrow and materially wide street-front plots with credible working geometry;
4. another authoritative flood/environmental case so RP-006 is not a singleton pattern;
5. further borough spread before any current borough becomes overrepresented.

These are collection gaps, not reasons to reopen the DPL ontology.

---

## 7. Machine-readable decision

The eight-site index earns one small evolution from the pilot index:

- one corpus-wide index over all admitted records;
- explicit coverage state after the gap correction;
- the four provenance requirements marked mandatory;
- residual gaps represented as text/list values rather than a fake coverage score.

It does **not** earn:

- a rigid full site-claim JSON schema;
- polygon/title modelling;
- compatibility fields;
- planning probability;
- site quality/desirability scores;
- automated ranking.

DPL-12A should continue to orchestrate site-record identities and admitted claims rather than reinterpret this index as a generic property database.

---

## 8. Interaction with current Wave C

DPL-14C is empirical input, not authority over architecture or regulation.

It does not modify:

- DPL-08C's water-interface contract;
- DPL-09C's drainage/waste-water target;
- DPL-10C's Croydon borough plug-in;
- DPL-12A's orchestration semantics;
- Reference House geometry;
- DRW drawing authority.

The expanded corpus does, however, provide materially better cases for the **post-Wave-C integration gate** to decide what comes next.

Croydon's prior selection for DPL-10C is not retroactively justified by this record; DPL-14C merely observes that Croydon now has two materially different corpus sites and must not be allowed to become the accidental universal borough. The predeclared Bromley adversarial replay remains important.

---

## 9. Acceptance

The DPL-14C acceptance question is satisfied:

- the five-site cohort is intentionally selected against known coverage gaps;
- the corpus is materially less biased toward backland/infill pathology;
- uncertainty/source-lineage discipline survived the new cases;
- no plot is ranked or called compatible;
- one residual ordinary-control gap remains explicit rather than hidden;
- the next programme decision belongs to the post-Wave-C integration gate, not to this corpus packet.

**DPL-14C may close once the exact branch is validated and merged.**