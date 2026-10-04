# H1 Ventilation Strategy Decision — v0.1

**Status:** programme decision  
**Purpose:** select the first whole-house ventilation family for H1 using regulatory fit, complexity, comfort, maintenance geography and Long-Life House doctrine rather than defaulting to the most sophisticated available system.

> **H1 should prove the compiler on a ventilation system that is good enough to trust and simple enough to understand. The Reference House may later choose a more demanding system.**

## 1. Candidate routes

The current and 2026 England Approved Document F routes both recognise three broad dwelling strategies relevant here:

1. natural ventilation with background ventilators and intermittent extract;
2. continuous mechanical extract ventilation;
3. mechanical ventilation with heat recovery.

For the pre-2027 target used by S0/S1, natural ventilation guidance is limited to less-airtight dwellings, while continuous mechanical extract ventilation and MVHR can be used in all dwellings.

That immediately weakens natural ventilation as the H1 baseline because the Long-Life House should not depend on being deliberately leaky.

## 2. Evaluation criteria

The first H1 family is judged against:

- regulatory applicability;
- number of active components;
- duct-network extent;
- penetrations;
- commissioning burden;
- maintenance frequency;
- failure consequence;
- heat loss;
- draught/noise risk;
- outdoor-air pollution control;
- replacement;
- proprietary lock-in;
- compatibility with service zones;
- compatibility with openable-window purge ventilation;
- ability to migrate later to a higher-performance family.

## 3. Natural ventilation + intermittent extract

### Strengths

- very low mechanical complexity;
- little ductwork;
- intuitive;
- failure of one extract fan is local;
- cheap replaceable components.

### Weaknesses

- current guidance restricts the common route to less-airtight dwellings;
- relies heavily on background ventilators;
- no heat recovery;
- outside air can enter cold and unfiltered;
- façade noise/pollution can become an architectural-comfort issue;
- weak fit with a deliberate high-performance airtight envelope.

### H1 decision

**NOT SELECTED**

Retain as an allowed future low-complexity domain family for less-airtight houses.

## 4. Continuous mechanical extract ventilation — centralised

### Principle

A central fan continuously extracts from wet rooms.

Replacement air enters habitable rooms through designed background ventilators.

Internal transfer air moves through the dwelling through designed transfer routes/door undercuts.

Openable windows remain available for purge.

### Strengths

- guidance route suitable for all dwellings;
- one primary mechanical unit;
- one extract-duct network rather than supply + extract networks;
- no heat exchanger;
- no whole-house supply balancing network;
- fewer terminal ducts than MVHR;
- background inlets provide some passive resilience if the fan fails;
- easy to place the single fan in a first-class accessible service hub;
- compatible with the existing wet-service core idea;
- straightforward to understand and inspect.

### Weaknesses

- deliberate façade/background inlets remain necessary;
- no heat recovery;
- incoming air is not centrally filtered or tempered;
- potential draught/noise/external-pollution issues at inlets;
- continuous extract fan still needs commissioning/maintenance;
- highly exposed/noisy/polluted sites may make the background-inlet strategy architecturally poor.

### H1 decision

**SELECTED AS FIRST TRUSTED FAMILY**

Identifier:

**VENT-CMEV-01**

## 5. MVHR

### Principle

Central mechanical supply to habitable rooms and extract from wet rooms through a heat exchanger.

### Strengths

- heat recovery;
- filtered outdoor supply;
- better control of inlet location;
- avoids distributed background ventilators;
- strong fit with very airtight construction;
- potentially excellent thermal and acoustic comfort;
- current Healthy Homes guidance identifies high-efficiency MVHR as a good-practice enhancement;
- likely strong candidate for the final Reference House.

### Weaknesses

- supply + extract duct networks;
- heat exchanger;
- two fans;
- filters;
- condensate;
- balancing/commissioning;
- more plant space;
- failure affects both background supply and extract;
- maintenance is more consequential;
- poor duct design/installation can create noise and performance failure;
- proprietary semi-rigid manifold systems can create lock-in if chosen carelessly.

The Passivhaus Trust maintenance guidance reinforces that MVHR is not fit-and-forget: commissioning records, filters and ongoing servicing matter.

### H1 decision

**DO NOT MAKE MVHR A GATE-B PREREQUISITE**

Retain as:

**VENT-MVHR-EXT-01 — higher-performance domain extension candidate**

Before promotion it should demonstrate:

- accessible plant;
- accessible/cleanable duct strategy;
- standard duct dimensions/components;
- filter supply/replacement route;
- condensate access;
- commissioning evidence;
- noise control;
- graceful failure/occupant guidance.

## 6. Why CMEV wins H1

This is not a claim that CMEV is globally “better” ventilation.

It wins the first domain because:

> **it removes enough ventilation complexity to let the compiler prove whole-house service reasoning without making the ventilation system itself the research project.**

The first house compiler already has:

- structural evidence;
- target versioning;
- envelope graphs;
- architecture;
- wet services;
- maintenance.

H1 should not add a second whole-house duct network and heat-recovery plant merely to prove the compiler can reason about ventilation.

## 7. Complexity comparison

Conceptually:

~~~text
CMEV
  central extract fan
  + wet-room extract ducts
  + external exhaust
  + habitable-room background inlets
  + transfer routes

MVHR
  central supply/extract unit
  + wet-room extract ducts
  + habitable-room supply ducts
  + external intake
  + external exhaust
  + heat exchanger
  + filters
  + condensate
  + balancing
  + transfer routes
~~~

The second route is supportable later.

It is unnecessarily large for H1 v0.

## 8. Reference-House implication

Do not infer:

> H1 uses CMEV, therefore the Long-Life Reference House must use CMEV.

The Reference House can deliberately select MVHR if:

- thermal/comfort value justifies it;
- maintenance geography is resolved;
- duct access and replacement are convincing;
- source-capture cooking ventilation is coordinated;
- the system survives doctrine/prototype review.

The compiler should eventually be able to support both families.

## 9. Site-context escape

CMEV should return:

**SITE-SPECIFIC REVIEW / ALTERNATE FAMILY**

where acceptable habitable-room background inlets cannot be achieved because of:

- severe external noise;
- poor outdoor air quality;
- façade exposure;
- unusual security constraints.

In such cases MVHR may become the more appropriate supported family.

This is not a compile failure of the house.

It is a family-selection consequence.

## 10. Regulatory anchors

- Approved Document F, Volume 1, earlier route: https://www.gov.uk/government/publications/ventilation-approved-document-f
- Approved Document F 2026 successor: https://www.gov.uk/government/publications/approved-document-f-2026
- Healthy Homes good-practice ventilation: https://www.gov.uk/government/publications/healthy-homes/healthy-homes-a-foundation-for-healthier-and-resilient-communities
- Passivhaus Trust MVHR maintenance guide: https://passivhaustrust.org.uk/UserFiles/File/Technical%20Papers/MVHR%20Maintenance%20v1%2020241211.pdf
