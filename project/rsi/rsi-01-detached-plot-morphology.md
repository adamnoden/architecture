# RSI-01 — ordinary detached-plot morphology benchmark

Issue: #895  
Programme: #891  
Evidence record: `project/rsi/data/detached-plot-morphology.json`  
Evidence class: **MORPHOLOGY_EVIDENCE_ONLY**

## Question

What kind of site should constrain the canonical Reference Deployment if the project wants to demonstrate an exceptional detached house on **ordinary land**, rather than on a parcel generously shaped around the existing house?

The important distinction emerging from this first bounded corpus is:

> **Modesty is not necessarily low site area. The stronger architectural constraint is often limited frontage combined with substantial depth.**

A 13 × 40 m rectangle is 520 m² — essentially the same area as DPL-RS-01's 522 m² — but it puts radically more pressure on house width, side access, neighbour relationships, façade composition and service geography than a 17.4 × 30 m rectangle.

That is exactly the pressure RSI is intended to expose.

## Evidence rules

This corpus is deliberately useful without pretending to be survey evidence.

Allowed:

- dimensions explicitly printed on estate-agent floorplans;
- dimensions explicitly stated in listing/brochure text;
- property form and ordinary street relationship;
- qualitative morphology visible in supplied listing material.

Not allowed:

- pixel-measuring aerials or maps;
- inferring title boundaries from fences/hedges;
- treating garden width as legal frontage;
- deriving parcel polygons from marketing area;
- claiming statistical representativeness from this small corpus.

Missing facts stay missing.

## Core corpus

| Ref | Area | Form | Recoverable front condition | Recoverable rear-garden condition | Use |
| --- | --- | --- | --- | --- | --- |
| RM-94138431 | Kings Avenue, Ealing W5 | Detached | approx 11.63 m wide × 4.42 m deep front garden | approx 10.92 m wide × 26.95 m deep | strongest seed for long/narrow morphology |
| RM-165027833 | Eaton Rise, Ealing W5 | Detached | approx 6.1 m front-garden depth | approx 29.26 m deep | deep-garden / ordinary-frontage seed |
| RM-167698106 | Ealing W5 | Detached | not recovered | approx 13.23 m wide × 24.13 m deep | useful recoverable rear width/depth pair |
| RM-164538002 | The Ridings, Ealing W5 | Detached | not recovered | approx 18.90 m deep | shorter-garden control |
| RM-164163029 | Crooked Usage, Finchley N3 | Detached | not recovered | approx 24.08 m deep | north-London morphology check |
| RM-169050863 | Rowantree Road, Enfield EN2 | Detached | not recovered | approx 10.49 m wide × 19.00 m deep | outer-London narrow rear-width check |
| RM-168826421 | Park Way, Enfield EN2 | Detached | not recovered | approx 25.91 m deep | outer-London deep-garden check |
| RM-169233089 | Westbury Road, Bromley BR1 | Detached | not recovered | approx 21.34 m deep | south-east London check |
| RM-168918770 | Friar Road, Orpington BR5 | Detached | not recovered | approx 15.85 m deep | lower-depth control |
| RM-166121852 | Park Road, Kingston KT2 | Detached | not recovered | approx 30.48 m deep | south-west London deep-garden member |

The source URLs and exact evidence classifications are retained in the JSON record. These numbers are marketing-reported morphology observations, not title/survey geometry.

Woodville Gardens / RM-89809551 is retained only as a supporting urban-house reference because it is not detached and therefore should not distort the core corpus.

## Bounded reading of the corpus

For these ten deliberately selected detached examples, the **reported rear-garden depths** run from approximately 15.85 m to 30.48 m, with the middle observation around 24.1 m.

That is not offered as a London statistic. It is enough, however, to falsify one accidental assumption embedded in the earlier Reference Site: a useful detached-house test does not need to spend most of its land on frontage.

Where a rear-garden width is explicitly recoverable in this first pass, the values are approximately:

```text
10.49 m
10.92 m
13.23 m
```

Again, those are **garden widths, not legal plot widths**. Their architectural value is directional: substantial detached houses plainly exist in a much narrower lateral condition than DPL-RS-01's 17.4 m parcel.

## DPL-RS-01 as control

The old synthetic fixture remains useful precisely because it is now a contrast case:

```text
DPL-RS-01
width:  17.4 m
depth:  30.0 m
area:   522 m²
aspect: 1 : 1.72
```

A same-order-area long/narrow challenger could look like:

```text
13.0 × 40.0 m = 520 m²
14.0 × 40.0 m = 560 m²
13.5 × 42.0 m = 567 m²
```

These are not RSI-02 candidates yet. They demonstrate why **area alone is the wrong variable**.

The first option gives away essentially no land area relative to DPL-RS-01 but removes 4.4 m of frontage. For the current 12 m shell that changes gross side territory from 5.4 m total to only 1.0 m total before any boundary/building tolerances or asymmetric service strategy are considered. That makes the existing house fail loudly rather than comfortably passing by construction.

## What RSI-02 should vary

The evidence supports moving RSI-02 away from one guessed rectangle and toward 2–3 controlled envelopes that vary the dimensions with genuine architectural consequence.

Working exploration band:

```text
frontage: 13–15 m
depth:    38–45 m
status:   WORKING BAND — NOT CANONICAL
```

Candidate differences should primarily test:

1. **frontage pressure** — whether the house can maintain useful side/service access;
2. **front setback** — enough arrival territory without estate-like distance from the street;
3. **rear depth** — a genuinely good garden after the house has used the site;
4. **house/plot width ratio** — the main constraint exposed by ordinary detached morphology;
5. **neighbour proximity** — side windows/privacy/maintenance must work when neighbouring houses actually matter.

Do not use RSI-02 to add simultaneous complexity in trees, major slope, heritage, flood or pathological access. Those are separate adversarial dimensions.

## Provisional architectural implication

The present 12 m Reference House is now worth testing much harder.

On a 13 m frontage it has only 1 m of total gross lateral territory. On 14 m it has 2 m. On 15 m it has 3 m. Even before deciding the final site, this provides a clean diagnostic range:

```text
13 m plot → 92.3% house/plot width ratio
14 m plot → 85.7%
15 m plot → 80.0%
17.4 m DPL-RS-01 → 69.0%
```

This does **not** prove that the house should become narrower. It proves that RSI-03 will be asking a substantially more useful question than DPL-RS-01 did.

If a strong detached house needs, for example, one meaningful service-side route plus a smaller opposite flank, RSI can now make that requirement explicit and discover the maximum house width from architecture rather than habit.

## Recommendation into RSI-02

Carry three envelope families forward rather than immediately freezing 13 × 40:

- **TIGHT FRONTAGE** — around 13 m frontage, long depth; deliberately severe test of the current 12 m shell;
- **ORDINARY MODEST** — around 14 m frontage, long depth; likely central candidate;
- **RELIEVED MODEST** — around 15 m frontage, long depth; verifies whether a small amount of additional width produces a disproportionate improvement.

Depth and setback should be chosen so all three retain a good ordinary rear garden. The point is to discover whether the architecture earns extra frontage, not to gift it extra frontage by default.

## Current result

RSI-01 has already changed the programme's working model:

> **The target is not “a smaller plot”. It is “a more ordinary detached-house morphology”: modest frontage, useful depth, close neighbours, real side-access pressure, and enough garden that the house still has to behave domestically.**

That preserves Ovid's House's ambition while removing the easiest escape route: abundant lateral land.
