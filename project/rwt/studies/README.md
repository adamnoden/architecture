# Rainwater study evidence

These are bounded, unadopted RWT comparisons, not selected construction information. The [rainwater programme](../rainwater-systems-programme.md) owns scope; the current graph and live leases own execution status.

| Study | Owning interpretation | Retained evidence |
|---|---|---|
| East court crossing | [Access and court transition](../rwt-06-access-court-transition.md) | [Source](court-crossing-trial.ts), [values](court-crossing-trial.json), [sheet](court-crossing-trial.svg) |
| North sleeved crossing | [North carrier comparison](../north-court-carrier.md) | [Source](north-court-carrier.ts), [values](north-court-carrier.json), [sheet](north-court-carrier.svg) |
| Product-bound carrier support | [Support and renewal subassembly](../carrier-support.md) | [Source](carrier-support.mjs), [tests](carrier-support.test.mjs), [values](carrier-support.json), [sheet](carrier-support.svg) |

The carrier-support continuation retains the north comparison's identity rather than rewriting its historical levels. Its 11-station layout is conditional on declared model and product assumptions; it does not establish hydraulic capacity, installed compatibility or physical renewal.

For that finite study, run from repository root:

```sh
node --test project/rwt/studies/carrier-support.test.mjs
node project/rwt/studies/carrier-support.mjs --check
```

Regenerate with the second command without `--check` only after reviewing changed inputs. The generator refuses a changed north-comparison input blob until applicability is reassessed.
