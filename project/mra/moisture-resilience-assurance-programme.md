# MRA — Moisture Resilience Assurance

**Issue:** [#959](https://github.com/adamnoden/architecture/issues/959)  
**State:** MRA-00 active; constitution, inventory and threat model in progress  
**Date:** 2026-10-28

## Purpose

Treat moisture as a first-class whole-house failure domain and prove that the Reference House is exceptionally difficult to damage through rain, plumbing water, drainage failure, ground moisture, condensation or trapped construction moisture.

The project already has strong local water patterns. MRA does not replace them. It asks the harder systems question: **do they compose into a house in which ordinary defects and ageing cannot quietly become prolonged concealed wetting of permanent fabric?**

## Heightened risk posture

Ovid’s House intentionally carries a stronger moisture-safety burden than ordinary minimum domestic practice where that burden can be met through robust form, geometry, gravity, drainage, access, drying potential and simple passive redundancy.

The governing target is:

> **No credible single failure of a seal, joint, fitting, local waterproofing element, drain, water-bearing component or ordinary maintenance item should be capable of producing prolonged concealed wetting of permanent fabric.**

Where normal maintenance degradation can plausibly coincide with an ordinary weather or service event, test selected compound cases as well.

The preferred failure behaviour is:

> **outward, visible, local, isolatable and dryable.**

This is not a promise that nothing can ever leak.

## Moisture defence hierarchy

Prefer, in order:

1. **Avoid the failure opportunity** — simple form, few penetrations, few concealed joints, coherent wet-service geography.
2. **Shed and drain by geometry** — falls, laps, drips, overhangs, capillary breaks and gravity before chemistry.
3. **Add a second physical line where consequence earns it** — drained cavities, overflow routes, sleeves, trays or other simple passive back-up.
4. **Make abnormal water visible early** — do not let the first symptom be damaged fabric.
5. **Contain and isolate locally** — accessible valves, bounded wet zones and replaceable interfaces.
6. **Preserve drying potential** — do not create assemblies that remain safe only while every seal is perfect forever.
7. **Use sensing/automation as supplementary defence** — sensors and automatic isolation may help but do not replace physical water paths.
8. **Keep inspection and renewal ordinary** — a defence that cannot be inspected, cleaned or renewed is not durable resilience.

Project shorthand remains: **geometry first; chemistry second.**

## Scope

MRA covers four moisture families.

### 1. External bulk water

Roof coverings and junctions; eaves; rainwater collection, overflow and blockage; courtyard drainage; wind-driven facade rain; cavities and wall bases; windows, external doors and thresholds; penetrations and utility entries; splashback; surface-water geometry; capillary/ground moisture; DPC/DPM and below-ground/undercroft interfaces.

### 2. Internal bulk water

Incoming water; hot/cold distribution; manifolds, valves and joints; water-bearing heating systems where selected; sanitary wastes, traps and cisterns; appliances; kitchens, utilities and bathrooms; relief/condensate routes; foul blockage/backflow consequences; local containment, visible leakage and isolation.

### 3. Vapour, condensation and drying

Surface condensation; interstitial moisture; air/vapour-control continuity; thermal bridges; wet-room source capture; purge paths; service/panel cavities that could trap water; and realistic drying after bounded wetting.

### 4. Construction and handover moisture

Rain exposure during construction; wet trades; premature closure; trapped moisture in floors/walls/panels; and proportionate pre-handover leak, drainage, containment and drying verification.

Site-specific flood, groundwater, drainage-authority and planning facts remain DPL-owned.

## Existing project material to compose

MRA begins from, rather than duplicating, existing provisions including:

- Accessible Rainwater Route;
- Visible Leakage Path;
- Failure-Tolerant Wet Service Room;
- Controlled Utility Entry;
- Designed Structural Penetration;
- Designed Threshold;
- Permanent Opening / Replaceable Window;
- Roof Maintenance Route;
- bathroom/kitchen source-capture patterns;
- Fail-Safe Water Distribution strategy;
- relevant Reference House, IAS, OAS, HAD, BCR, PHY, EPR, DEL and DPL obligations.

If existing material already catches a failure mode, MRA should reference it rather than create another rule.

## Assurance model

For each material moisture route, the final matrix must identify:

`source → path → primary defence → secondary/failure path → first vulnerable fabric → visible symptom/detection latency → containment/discharge → isolation → access/repair → drying → maintenance dependency → evidence owner`

The key question is always: **what happens when the thing intended to keep water out stops working?**

## Programme

### MRA-00 — constitution, inventory and threat model

**Active.** Working record: [`mra-00-moisture-constitution-threat-model.md`](mra-00-moisture-constitution-threat-model.md).

- inventory existing moisture doctrine, patterns, strategies, Reference House choices and unresolved obligations;
- freeze the heightened risk posture and precise claim boundary;
- define credible single failures and bounded compound failures;
- establish the whole-house assurance matrix;
- identify any required doctrinal clarification versus Reference House-specific assurance rule;
- publish the assurance questions IAS/OAS/HAD must be able to answer without redesigning their in-flight work.

### MRA-01 — external water and ground-envelope assault

After `TRIAD-GATE`, attack the integrated external water path:

`sky / ground → roof → collection → overflow → facade → openings → penetrations → wall base → site discharge`.

Test rain, wind-driven rain, blockage, ageing seals, displaced local components, courtyard concentration, surface-water mistakes and maintainability. Require explicit failure and drying paths at each consequential junction.

### MRA-02 — internal water and wet-zone assault

After `TRIAD-GATE`, in parallel with MRA-01, attack:

`entry → distribution → joints/valves → fixtures/appliances → wastes → discharge`.

Map every credible leak source to its first wetting consequence, visibility, isolation, containment, drainage/drying and repair route. Prefer joint minimisation and accessible distribution before elaborate containment.

### MRA-03 — vapour, condensation and drying assault

After `TRIAD-GATE`, in parallel with MRA-01/02, test cold surfaces, thermal bridges, interstitial moisture, air/vapour continuity, source capture, wet-room humidity, moisture traps and post-wetting drying.

Unresolved building-physics claims route to competent evidence rather than being inferred internally.

### MRA-04 — whole-house failure matrix and adversarial gate

Compose MRA-01/02/03 into one house-level failure model and red-team at minimum:

- local roof-covering/flashing defect;
- blocked primary rainwater outlet during heavy rain;
- failed window/door perimeter weather seal;
- failed service-entry seal or tracking path;
- concealed supply leak;
- appliance hose/pump/drain failure;
- sanitary/waste leak or blockage;
- failed wet-room local waterproofing/junction;
- condensate drain failure;
- failed extract / abnormal humidity episode;
- representative construction-moisture / premature-closure error;
- selected compound cases pairing one ordinary degradation with one normal weather/service event.

MRA-04 passes only when every material route either satisfies the assurance standard or becomes an explicit downstream obligation. Its output is consumed by BCR; it is not technical proof by itself.

### MRA-05 — post-BCR moisture closeout

After `BCR-CONVERGENCE`:

- verify every MRA obligation has a disposition and evidence state;
- verify technical fixes did not create new traps, inaccessible inspection points or fragile dependencies;
- verify any upstream rewinds reached the selected house;
- state remaining real-site, professional, product or commissioning limitations explicitly;
- issue the final Reference House moisture-assurance record before HRS synthesis.

## DAG

```text
BSR-ROOT ───────────────► MRA-00
                              │
                              └──── assurance questions inform IAS/OAS/HAD

IAS / OAS / HAD ─► TRIAD-GATE
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
          MRA-01     MRA-02     MRA-03
             └──────────┼──────────┘
                        ▼
                     MRA-04
                        │
                        ▼
                BCR-CONVERGENCE
                        │
                        ▼
                     MRA-05
                        │
                        ▼
                  HRS-SYNTHESIS
```

`BCR-SCAFFOLD` remains independently runnable. Substantive BCR convergence must consume the MRA-04 register rather than treating moisture as a generic matrix row.

## Authority boundaries

- **IAS** owns interior assembly choices; MRA tests moisture failure and drying consequences.
- **OAS** owns opening/threshold assemblies; MRA tests water-path robustness and replacement-state continuity.
- **HAD** owns form and expression; MRA may require rewind where form creates avoidable water concentration or unmaintainable risk.
- **BCR** owns technical-resolution convergence; MRA supplies the deep moisture failure register and verifies closure.
- **PHY** owns physical tests when selected propositions require them.
- **EPR** owns competent envelope/building-physics/MEP review where internal reasoning cannot establish adequacy.
- **DEL** owns workmanship, commissioning, inspection and acceptance obligations.
- **DPL** owns real-site flood, ground and deployment facts.
- **PLT** represents resolved water/failure architecture; it does not invent it.

## Non-goals

MRA is not a literal leak-proof guarantee, a second pattern language, a reason to add drains/membranes/sensors everywhere, a substitute for competent technical evidence, or a licence for proprietary smart-home dependence.

Redundancy can reduce resilience when it creates stagnant water, hidden interfaces or maintenance burden. Simplicity remains a safety mechanism.

## Exit gate

Close MRA only when:

- the heightened moisture-risk posture exists at the correct authority layer;
- one traceable whole-house matrix spans external water, internal water, vapour/condensation and construction moisture;
- credible single failures and selected compound cases have explicit consequences;
- no high-consequence concealed route relies only on perfect workmanship, one ageing seal, one membrane, one sensor or one inaccessible component where a robust alternative is practical;
- abnormal water preferentially becomes visible, containable, isolatable and dryable before permanent fabric is materially damaged;
- roof, opening, penetration, ground, wet-room and service-water answers are coordinated as one house;
- unresolved claims have explicit BCR/EPR/PHY/DEL/DPL ownership;
- post-BCR review confirms obligations are resolved, bounded or explicitly deferred without creating a new moisture debt;
- HRS can synthesize the final house without inheriting an undisclosed moisture vulnerability.

MRA closeout is an internal Reference House assurance result at its stated scope. It is not real-site suitability, statutory acceptance, product certification or a claim that leakage is physically impossible.
