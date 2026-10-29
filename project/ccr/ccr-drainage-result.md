# CCR-DRAINAGE — source consistency and bounded drainage declarations

**Disposition:** the bounded correctness repair is implemented; final publication identity and exact-head full validation are recorded in the accepting PR. This closes the admitted false-pass defects, not the current house's rainwater design or hydraulic/physical independence duties.

**Baseline:** `0d0e6e9dbe6f337fa112dcdddae4c703b134605d`, 29 October 2026. Canonical lease generation 1 was acquired before implementation. The [CCR programme](compiler-correctness-repair-programme.md) owns scope; the historical RH-C4 adapter remains outward-only.

## Reproduction and repair

The three audit counterexamples were reproduced on that baseline before changing production code:

| Input | Observed before repair | Accepted behaviour |
|---|---|---|
| House roof `drainageDirection = 'inward'` | Full system `PASS`; derived roof inward, four boundary routes outward, no boundary diagnostics | `FAIL` with `RH_ROOF_DRAINAGE_SOURCE_UNSUPPORTED`; canonical output generation refuses the failed compile |
| Blank origin/destination strings | Boundary view `PASS`, no diagnostics | Every roof/courtyard route needs both non-blank endpoint declarations; `DRAINAGE_ENDPOINT_MISSING` identifies the route and endpoint |
| Emergency destination equal to primary plus whitespace | `PASS`, despite no meaningful textual difference | Trim and collapse whitespace before comparison; `RH_COURTYARD_DESTINATIONS_NOT_DISTINCT` rejects the duplicate description |

The smallest source-bound repair is an explicit unsupported-source diagnostic in RH-C4 hardening. The adapter's fixed historical outward declarations are retained, but they cannot validate an inward controlling source. The guard also covers a caller supplying an outward boundary override. It does not manufacture an inward outlet network or change current Georgian roof geometry. The canonical system and isolated boundary view share this hardening path.

Endpoint normalization is a shared text helper. It does not rewrite authored descriptions, equate synonyms, fold semantic case distinctions or solve network geometry. Leading/trailing and repeated internal whitespace cannot create a distinct destination. The old diagnostic name `RH_COURTYARD_OVERFLOW_NOT_INDEPENDENT` is replaced by the narrower declaration-specific name; downstream assertions were updated. The visibility diagnostic retains its code but now describes the flag as an authored declaration.

## Proof boundary

Passing checks establish compatible source direction, required non-blank text, required route declarations and different normalized destination descriptions. They do **not** establish independent physical paths, gravity continuity, overflow level, safe discharge, hydraulic capacity, actual visible failure or building performance. Two different descriptions can still designate a shared receiver or otherwise coupled network. `visibleFailure: true` is not observed evidence.

The model field comments, RH-C4 README and current executable-slice description state this limit. The existing machine-check/performance proof-boundary object is retained with its historical meaning. ROF/RWT and their gate retain selected-network duties; this packet has no dependency on inventing that future system.

## Validation and identity

The new regressions exercise the canonical system and output-generation rejection, the explicit boundary override, both endpoints of every roof/courtyard route, trailing/leading/internal whitespace variants, and the unchanged outward valid control. A whitespace-decorated but genuinely distinct declaration remains valid without implying physical independence.

Focused validation passed: all 34 RH-C4 tests, six CH-05 identity/lineage tests, eight CH-06 law tests, TypeScript and canonical `outputs:check`. The committed boundary SVG remains the exact canonical projection. No generated spatial output or frozen evidence requires rewriting for this repair; accepted canonical geometry and route text are unchanged.

On this packet baseline the canonical compact `HK-RH-COMPILE-1` identity remains `16ffc5c68a0247202997603f5fff48737c4c93d89b5947b40336fde0f63b366c`. This is evidence of unchanged canonical represented inputs/results under its existing bounded contract, **not** proof that implementation code is hashed. CCR-IDENTITY owns that guarantee and the integrated identity after other repairs. Adversarial formerly passing inputs deliberately change status and diagnostics.

Full integrated `npm run check` / exact-head CI and publication reconciliation are recorded in the PR. No computational maturity, technical acceptance, current-house source, selected rainwater system or historical identity schema is promoted by this packet.
