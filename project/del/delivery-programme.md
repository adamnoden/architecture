# DEL — Delivery requirements

**State:** DEL-00 baseline complete; commission-specific issue and technical closure remain evidence-dependent

**Tracking:** [#854 — DEL evidence-led delivery requirements and responsibility coordination](https://github.com/adamnoden/architecture/issues/854)  
**Starting authority:** `docs/delivery/README.md`, `project/maturity.ts`, the EPR/PHY validation execution register and the owning DPL, HFI and OCG handoffs

## Question and scope

Which requirements, responsibilities and stage-specific evidence must an appointed team resolve to deliver the authored architecture on a real commission?

DEL coordinates the existing delivery modules. It does not replace their owning sources or create a second architectural doctrine, deployment evaluator or technical specification. Manufacturing questions belong here only where a concrete assembly, tolerance, replacement or verification decision needs a delivery owner.

The authorised [book/house-resolution programme](../book-resolution-programme.md) adds new concrete design sources without changing DEL’s role. `IAS`, `OAS` and `HAD` author design; `BCR` classifies construction-resolution gaps and routes delivery/stage/procurement obligations here; `HRS` owns the final architectural reconciliation. DEL must not become the designer of those systems.

## Work and acceptance gates

1. Inventory the existing implementation brief, external-maintenance and human-factors modules against their upstream handoffs. Distinguish requirements ready to issue from requirements waiting on site evidence, professional judgement or physical tests.
2. Assign the responsible discipline, applicable project stage, required evidence and upstream rewind owner for each admitted requirement. Preserve unknowns explicitly; a requirement is not evidence that its proposition is true.
3. Reconcile the modules when their upstream evidence matures, recording the smallest justified change and checking affected links, contracts and publication boundaries.
4. As BCR #944 admits concrete IAS/OAS/HAD assemblies, add only the delivery obligations actually earned by those selections: fabrication responsibility, tolerance ownership, shop drawings, product-equivalence rules, prototype/first-article acceptance, commissioning and reinstatement evidence as applicable.

The umbrella can close when the declared commission/stage scope has a coherent requirement and responsibility set, each requirement has an evidence route or explicit dependency, and material upstream findings have been reconciled. It does not claim that a building has passed those requirements or that delivery maturity has increased.

## Dependencies and boundaries

- EPR owns competent professional review; RH-11 remains the current Reference House review gate under EPR.
- PHY-03/PHY-04 own the current priority physical-validation evidence routes (historical aliases P03/P04); new IAS/OAS propositions may earn additional targeted PHY work only when a concrete physical claim requires it.
- BCR #944 owns construction-resolution classification/convergence and hands DEL concrete responsibility/stage/procurement questions; BCR does not replace DEL.
- IAS #941, OAS #942 and HAD #943 are architectural/design sources, not delivery evidence.
- HRS #945 absorbs material delivery/technical consequences back into the final architecture where they change it.
- DPL owns jurisdiction, site facts, deployment findings and site interfaces; real-site/commission acceptance remains outside the virtual Reference House.
- HFI and OCG handoffs are inherited obligations, not reopened programmes.
- `docs/development/manufacturing-strategy.md` remains a strategy; concrete delivery decisions must be tied to an actual assembly and evidence need.
- No external contact, commissioning or spend is authorised by this umbrella.
- PHY-01 remains held/optional research under [#856](https://github.com/adamnoden/architecture/issues/856); PHY-02 remains held under [#857](https://github.com/adamnoden/architecture/issues/857). Their historical P01/P02 identities and validation-register reopening triggers are preserved.

Keep programme history here and requirements in `docs/delivery/`. Present project-wide state remains owned by `STATUS.md` and the typed maturity registry.

## Execution result

[DEL-00 — Delivery inventory and responsibility baseline](del-00-delivery-baseline.md) records N01–N17 and the remaining brief sections, provisional discipline/stage allocations, evidence routes and rewind owners. The three existing delivery modules retain requirement ownership. No commission or technical acceptance is claimed.

The baseline also reconciles the HFI review route into the validation execution register and requires a declared source revision before older review/prototype packages are used for the current Georgian re-plan. Next work is evidence-triggered reconciliation after selected IAS/OAS/HAD assemblies reach BCR, current-house review/technical migration, competent RH-11 responses, applicable PHY results or a real commission brief. These are closure dependencies, not reasons to leave the inventory undone. Delivery remains M2; #854 remains open.