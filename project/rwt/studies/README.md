# Rainwater study evidence

These are bounded, unadopted RWT comparisons, not selected construction information. The [rainwater programme](../rainwater-systems-programme.md) owns scope; the current graph and live leases own execution status. The [whole-house material policy](../../../docs/reference-house/material-policy.md) supersedes polymer material preferences in the earlier studies, without deleting their technical evidence.

| Study | Owning interpretation | Retained evidence |
|---|---|---|
| Current selected N/E event, loss and receiving limits | [Selected-water investigation](../rwt-06-selected-water-event.md) | [Calculation](selected-water-event.mjs), [regressions](selected-water-event.test.mjs), [values](selected-water-event.json) |
| Weathered east passage: court/plant space exchange | [Source-bound plan lower bound and architectural handoff](../rwt-06-court-plant-space-exchange.md) | [Source](court-plant-space-exchange.mjs), [tests](court-plant-space-exchange.test.mjs) |
| Northeast east-passage corner-pier and plant-wall conflict | [Source-bound architectural negative gate](../rwt-06-east-corner-pier-trap.md) | [Source](court-east-corner-clearance.mjs), [tests](court-east-corner-clearance.test.mjs) |
| Single open court-to-garden gravity surface (no divided drains) | [Source-bound architectural challenger](../rwt-06-full-width-surface.md) | [Source](court-full-width-surface.mjs), [tests](court-full-width-surface.test.mjs) |
| North full-width daylight apron versus steep relief chute | [Source-bound spatial/grade rejection](../rwt-06-surface-apron.md) | [Source](court-surface-apron.mjs), [tests](court-surface-apron.test.mjs) | 
| Selected open-loggia event and service attack | [Source reconciliation and adverse result](../rwt-06-open-loggia-event.md) | [Source](open-loggia-event.mjs), [tests](open-loggia-event.test.mjs), [values](open-loggia-event.json), [sheet](open-loggia-event.svg) |
| East court crossing | [Access and court transition](../rwt-06-access-court-transition.md) | [Source](court-crossing-trial.ts), [values](court-crossing-trial.json), [sheet](court-crossing-trial.svg) |
| North sleeved crossing | [North carrier comparison](../north-court-carrier.md) | [Source](north-court-carrier.ts), [values](north-court-carrier.json), [sheet](north-court-carrier.svg) |
| Product-bound carrier support | [Support and renewal subassembly](../carrier-support.md) | [Source](carrier-support.mjs), [tests](carrier-support.test.mjs), [values](carrier-support.json), [sheet](carrier-support.svg) |
| Conventional carrier and terminals | [Material choice and renewal cost](../conventional-carrier.md) | [Source](conventional-carrier.mjs), [tests](conventional-carrier.test.mjs), [values](conventional-carrier.json), [sheet](conventional-carrier.svg) |
| Copper movement and divided-gutter backup | [Copper assembly candidates](../copper-assembly-candidates.md) | [Source](copper-compartments.mjs), [tests](copper-compartments.test.mjs), [values](copper-compartments.json), [sheet](copper-compartments.svg) |
| Copper terminal release and retained hardware | [Real joint and renewal mechanism](../copper-terminal-renewal.md) | [Source](copper-terminal-release.mjs), [tests](copper-terminal-release.test.mjs), [values](copper-terminal-release.json), [sheet](copper-terminal-release.svg) |
| Catalogue flange envelope and right-angle terminal | [Access-first route decision](../copper-access-first-result.md) | [Source and reproducible values](copper-access-geometry.mjs), [tests](copper-access-geometry.test.mjs) |

The carrier-support continuation retains the north comparison's identity rather than rewriting its historical levels. Its 11-station layout is conditional on declared model and product assumptions; it does not establish hydraulic capacity, installed compatibility or physical renewal.

The conventional successor investigated an eight-station solid-wall PVC-U comparison, not an adopted product assembly or a current admissible material default. Its separate terminal reservation spends longer pipe projections and exterior withdrawal space. The historical 11-station and original north dimensions remain unchanged; generic material stiffness does not certify the new installation.

The copper fixture checks two authored movement compartments and proves that a pipe beyond a solid divider cannot back up its neighbour. Its separate-relief graph is a necessary-path test only: no crest, capacity or safe destination is established. The thermal ranges and joint dimensions are comparison assumptions, not a selected house detail.

The terminal continuation identifies a real metal-sealing fitting family but does not treat unbolting as a complete withdrawal mechanism. Its synthetic fixture tests first axial release and carried-hardware clearance, including an explicit unknown ring envelope. It selects no product dimension, pressure seal, service bay or house route.

The access-first continuation compares an actual listed flange envelope with the original unadopted sleeve and develops a right-angle terminal's ideal separating direction. It prioritises a located accessible route before enlarging blind passages. The plane-gap witness is not a full collision/removal proof; exact faces, gaskets, supports, dry access and hydraulic duty remain unresolved. No earlier dimensions or generators are changed.

For the finite studies, run from repository root:

```sh
node --test project/rwt/studies/carrier-support.test.mjs project/rwt/studies/conventional-carrier.test.mjs project/rwt/studies/copper-compartments.test.mjs project/rwt/studies/copper-terminal-release.test.mjs project/rwt/studies/copper-access-geometry.test.mjs
node project/rwt/studies/carrier-support.mjs --check
node project/rwt/studies/conventional-carrier.mjs --check
node project/rwt/studies/copper-compartments.mjs --check
node project/rwt/studies/copper-terminal-release.mjs --check
node project/rwt/studies/copper-access-geometry.mjs
```

Regenerate with the relevant command without `--check` only after reviewing changed inputs. The PE generator refuses a changed north-comparison input blob; the conventional comparison refuses a changed reviewed support-model blob until applicability is reassessed. Copper fixture dimensions live in their generators and must remain labelled as authored assumptions. The access-first calculation prints its bounded result and creates no generated files.
