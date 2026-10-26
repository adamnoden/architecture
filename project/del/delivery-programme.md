# DEL — Delivery requirements

**State:** framed umbrella; requirements remain evidence-dependent  
**Tracking:** [#854 — DEL evidence-led delivery requirements and responsibility coordination](https://github.com/adamnoden/architecture/issues/854)  
**Starting authority:** `docs/delivery/README.md`, `project/maturity.ts`, the RH-11 validation execution register and the owning DPL, HFI and OCG handoffs

## Question and scope

Which requirements, responsibilities and stage-specific evidence must an appointed team resolve to deliver the authored architecture on a real commission?

DEL coordinates the existing delivery modules. It does not replace their owning sources or create a second architectural doctrine, deployment evaluator or technical specification. Manufacturing questions belong here only where a concrete assembly, tolerance, replacement or verification decision needs a delivery owner.

## Work and acceptance gates

1. Inventory the existing implementation brief, external-maintenance and human-factors modules against their upstream handoffs. Distinguish requirements ready to issue from requirements waiting on site evidence, professional judgement or physical tests.
2. Assign the responsible discipline, applicable project stage, required evidence and upstream rewind owner for each admitted requirement. Preserve unknowns explicitly; a requirement is not evidence that its proposition is true.
3. Reconcile the modules when their upstream evidence matures, recording the smallest justified change and checking affected links, contracts and publication boundaries.

The umbrella can close when the declared commission/stage scope has a coherent requirement and responsibility set, each requirement has an evidence route or explicit dependency, and material upstream findings have been reconciled. It does not claim that a building has passed those requirements or that delivery maturity has increased.

## Dependencies and boundaries

- RH-11 professional review and P03/P04 physical evidence remain with their existing execution owners.
- DPL owns jurisdiction, site facts, deployment findings and site interfaces.
- HFI and OCG handoffs are inherited obligations, not reopened programmes.
- `docs/development/manufacturing-strategy.md` remains a strategy; concrete delivery decisions must be tied to an actual assembly and evidence need.
- No external contact, commissioning or spend is authorised by this umbrella.
- P01 remains held/optional research under [#856](https://github.com/adamnoden/architecture/issues/856); P02 remains held under [#857](https://github.com/adamnoden/architecture/issues/857). Their existing codes and validation-register reopening triggers are preserved.

Keep programme history here and requirements in `docs/delivery/`. Present project-wide state remains owned by `STATUS.md` and the typed maturity registry.
