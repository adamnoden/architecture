# RSI-03 — unchanged B4 house × modest site collision test

Issue: #898  
Programme: #891  
Site: `RSI-RS-01`  
House input: `RH-GROUND-PLAN-RESOLUTION-02` / B4 provisional coordination  
Ledger: `project/rsi/data/rsi-03-collision-ledger.json`

## Question

Can the best current Reference House coordination survive a credible 15 m-wide detached plot **without being rescued by redesign**?

This packet deliberately forbids the obvious escape routes:

- no shell narrowing;
- no room resizing;
- no courtyard change;
- no site widening;
- no façade redesign;
- no invented neighbour/equipment geometry.

The purpose is diagnosis, not optimisation.

## Inputs held fixed

### Site — `RSI-RS-01`

```text
parcel              15.0 × 40.0 m
front setback        5.0 m
rear garden         24.2 m
technical west side  1.75 m
principal east side  1.25 m
broad fall            240 mm / 40 m
RH ground FFL        +100 mm from street datum
```

### House — B4 provisional coordination

```text
shell                12.0 × 10.8 m
courtyard             3.6 × 3.3 m, provisional B4
stair                 current B4/B3-derived dog-leg coordination
openings              current B4 coordination
```

B4 remains provisional architecture. Using it here does not promote it into RH-C1/M3 authority.

## Controlled maintenance duty

DPL-07 records that the controlled External Access & Maintenance Plan requires credible ordinary access for:

- outer façades;
- roof edges / rainwater goods;
- plant / service work;
- courtyard access;
- material replacement routes;
- garden-to-courtyard logistics;
- temporary scaffold / tower support positions.

It also records the technical/service side as particularly valuable and warns against sacrificing the sole maintenance route.

This is important because DPL-RS-01 was authored with **3.0 m** on the technical side and **2.4 m** on the principal side specifically to give those duties room to exist. RSI-RS-01 deliberately removes that comfort.

No controlled source recovered in this packet states a universal numeric width for scaffold, tower, lifting or equipment operations. RSI therefore refuses to manufacture one.

## Primary result

The current house **fits** the 15 × 40 m site. This is not an outright geometric failure.

That is exactly why the site is useful.

The collision exposes a more interesting weakness:

> **The 12 m shell is materially frontage-sensitive. It can occupy the selected site, but the project's maintenance/service doctrine becomes brittle because so many external duties compete for only 1.75 m on the technical flank and 1.25 m on the principal flank.**

That is a different claim from “the house is too big”. The collision does not yet prove that a narrower house is better.

It proves that the current architecture has not earned its 12 m width strongly enough to stop successor exploration.

## Collision ledger

| Topic | Result | Class | Severity | Reading |
| --- | --- | --- | --- | --- |
| Gross fit / detached reading | pass with pressure | `SITE_RESPONSE` | low | 12 m shell occupies 80% of frontage but leaves two real side territories |
| Technical-side passage / service geography | fragile | `HOUSE_DEFECT` | moderate | 1.75 m works as passage, but route + plant + maintenance duties are now strongly coupled |
| Principal-side ordinary passage | pass with pressure | `SITE_RESPONSE` | low | 1.25 m remains useful if deployment does not casually consume it |
| Façade / rainwater-goods maintenance | unproved | `EXTERNAL_EVIDENCE` | moderate | ordinary access exists; operation-specific working widths are not controlled |
| Temporary scaffold / tower | unproved | `EXTERNAL_EVIDENCE` | high | explicit doctrinal duty, no frozen support/outrigger geometry |
| Plant / meters / external isolation | fragile | `HOUSE_DEFECT` | moderate | technical flank risks becoming both equipment bay and sole route |
| Drainage / utilities | unproved | `EXTERNAL_EVIDENCE` | moderate | route territory exists; outfalls, capacities and rights do not |
| Arrival / bins / deliveries | pass | `SITE_RESPONSE` | low | 5 m frontage field gives sufficient synthetic territory |
| Step-free approach | geometrically plausible | `SITE_RESPONSE` | low | 100 mm over 5 m corresponds to only ~1:50 average rise before detailed threshold design |
| Garden-to-courtyard replacement logistics | unproved | `HOUSE_DEFECT` | moderate | excellent rear staging exists, but the house still owes an explicit replacement path into the courtyard |
| Side windows / neighbour pressure | context-sensitive | `EXTERNAL_EVIDENCE` | moderate | adjacent masses are close enough to matter; exact neighbour windows/rights remain unknown |
| Rear garden | pass | `SITE_RESPONSE` | low | 24.2 m depth preserves a convincingly domestic garden |
| Construction / future replacement | unproved | `EXTERNAL_EVIDENCE` | high | exact large-component and temporary-work strategies are operation-specific |
| Wall-base / drainage territory | plausible but competing | `SITE_RESPONSE` | moderate | geometry exists, but it consumes the same narrow side fields needed for passage |
| Frontage dependency | confirmed sensitivity | `HOUSE_DEFECT` | high | 14 m counterfactual rapidly collapses useful side territory |

No finding is classified as `REFERENCE_SITE_ARTIFACT`. The selected site is doing useful diagnostic work rather than manufacturing a pathological failure.

## The decisive counterfactual

The strongest evidence is not the 15 m case in isolation. It is what happens after removing only **one metre** of frontage.

### 15 m selected site

```text
technical side: 1.75 m
principal side: 1.25 m
total side land:3.00 m
house/plot width:80.0%
```

### 14 m retained counterfactual

Holding the same 0.5 m technical-side bias:

```text
technical side: 1.25 m
principal side: 0.75 m
total side land:2.00 m
house/plot width:85.7%
```

A 6.7% reduction in parcel frontage removes **one third of all side territory**.

That is the useful failure signal.

The Reference House currently behaves as though a few metres of lateral land are cheap. On the more ordinary long/narrow morphology, they are the scarce resource.

## What survives well

RSI should not overreact and redesign everything.

Several parts of the current proposition actually become stronger on the new site:

- the 5 m street setback feels ordinary rather than estate-like;
- the 24.2 m rear garden gives the house a strong domestic relationship to landscape;
- the deep site has ample front/rear territory for arrival and staging;
- a +100 mm FFL is easy to reconcile geometrically with the front field;
- the selected plot is not land-starved — only laterally constrained;
- the central-courtyard idea is not itself disproved by the site.

So the redesign question should remain narrow:

> **Can we buy back meaningful side territory without sacrificing the things that make the house worth building?**

## What is actually a house problem

Four findings earn architectural scrutiny rather than being pushed into site design:

### 1. Frontage dependency

The 12 m shell consumes too much of the variable that ordinary detached plots ration most strongly.

This is the main RSI finding.

### 2. Service-route coupling

The technical flank currently has to support too many potentially competing jobs:

- passage;
- plant / meters / isolators;
- wall-base inspection;
- façade / rainwater maintenance;
- replacement logistics;
- possibly temporary works.

The doctrine says accessible does not mean exposed, but it also says service access must remain credible. The present architecture has not yet separated those duties strongly enough on modest frontage.

### 3. Courtyard replacement logistics

A deep rear garden provides excellent staging, but the architecture still needs a deliberate path for replacing significant courtyard-facing elements. This cannot remain an assumed benefit of a large external site.

### 4. Robustness to a slightly narrower plot

A house intended as a strong reference design should not become qualitatively different because the plot loses 1 m of frontage. RSI need not make it fit every site, but the current sensitivity is high enough to justify alternatives.

## What is *not* a house problem yet

RSI must keep several unresolved matters out of the redesign brief:

- exact scaffold/tower width;
- exact crane/lift/replacement strategy;
- exact sewer/outfall/capacity;
- neighbour window/privacy conclusions;
- planning acceptability;
- precise vehicle/refuse/fire access;
- geotechnical/foundation response.

Those are evidence/project-specific duties, not excuses to reshape M4 speculatively.

## RSI-04 earned

**Yes.** Successor exploration is earned.

Not because the current house “fails to fit”. It fits.

RSI-04 is earned because the collision has exposed a real architectural question that the generous DPL site suppressed:

> **How much of the 12 m shell width is genuinely buying spatial quality, and how much is merely consuming scarce side territory?**

RSI-04 must therefore freeze an invariants/flex contract before any sketch schemes are generated.

At minimum it should answer:

1. which room/courtyard proportions are quality invariants rather than inherited M3 dimensions;
2. what service/maintenance duties require architectural territory versus project-specific temporary-work evidence;
3. whether the technical flank can keep equipment out of the sole replacement route;
4. how garden-to-courtyard replacement becomes explicit;
5. how much width can be traded for depth without producing mean rooms or an awkward Georgian façade;
6. how each candidate behaves on the retained 14 m counterfactual without being separately optimised for it.

## Decision

```text
RSI-RS-01 / 15 × 40 m:      useful canonical collision site
current B4 / 12 m shell:     deployable but frontage-fragile
14 × 40 m counterfactual:    exposes high width sensitivity
reference-site artefact:     no
architectural successor work: EARNED
```

The next architectural move is **not** to narrow the house.

The next move is to define what the house is allowed to change, then present the owner with materially different rough plan propositions under the already-recorded owner gate.
