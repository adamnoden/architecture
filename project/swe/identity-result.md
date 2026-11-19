# SWE-IDENTITY — process-locale-independent semantic fingerprints

Parent: [SWE #1174](https://github.com/adamnoden/architecture/issues/1174). Accepted finding 9. Baseline: registration merge `a86ad87950d007f862b6004769bbea56e8bfd946`.

## Result and decision

Canonical semantic identities no longer inherit the process locale. The core serializer and Reference House identity collections use an explicit UTF-16 code-unit comparator. Existing DPL identity versions use one explicitly configured English comparator for both object keys and declarative collections, with a code-unit tie-break for distinct strings that collate equally. DPL hashes share the core's finite-data validation, non-finite diagnostic domain separation and preservation of authored array order.

The distinction is deliberate compatibility work. A disposable code-unit migration probe changed the frozen DPL-T5 result and caused downstream parent-identity guards to fail. A second comparison showed that changing only core key order also changes the DPL-T6 review ledger: English ordering places `reviewer` and `reviews` before `reviewScopeClauseIds`, while code-unit ordering reverses that relationship. Silently replacing existing DPL ordering would therefore misrepresent the accepted evidence chain. Fixing its locale explicitly resolves the reported defect without a new identity version or rewritten evidence.

This does not introduce Unicode normalization, case folding, new architectural facts or a stronger proof ceiling. JSON integer-index keys retain ECMAScript property ordering. Arrays are sorted only at the existing explicitly classified declarative boundaries; authored sequence remains identity-bearing. Human-facing drawing/report collation outside semantic identity is outside this packet.

## Compatibility evidence

The machine-readable [identity baseline](identity-baseline.json) retains full before/after hashes, runtime identity, six generated-output content hashes and twelve frozen DPL snapshot hashes.

| Contract | Comparison | Outcome |
|---|---|---|
| Reference House source, method, result and combined compile | All identity fields before/after | Identical; `HK-RH-COMPILE-1` remains applicable |
| Successor output context | All identity fields before/after | Identical |
| Six current generated inspection outputs | SHA-256 of complete output bytes | All six identical; no regeneration or baseline rewrite required |
| DPL-15E through DPL-15I and DPL-T5 through DPL-T11 | Twelve complete frozen test snapshots | Byte-identical in all three tested process locales |
| Historical fixtures, parent pins and retained proof | Existing DPL/CH gates | Preserved; no evidence file or accepted pin was rewritten |

Measured local runtime: Node 24.22.1, ICU 78.3. DPL retains a dependency on English ICU collation as part of its existing algorithm; frozen regression gates must be checked during Node/ICU upgrades. This packet establishes independence from ambient locale on the supported runtime, not compatibility with arbitrary future collation implementations. New identity contracts can use the core code-unit default.

## Validation

- Core identity regressions: 4 passed, including code-unit ordering, Unicode spelling, JSON index order, authored array sequence and disjoint invalid-numeric identities.
- CH-05: 7 passed, including fresh child processes with English, Swedish and Turkish defaults. The regression verifies that three distinct defaults actually ran, then compares core finite/non-finite hashes, Reference House source/method/result identities, current compile identity, DPL Unicode keys and set permutations.
- Complete DPL suite: 337 passed in each of `en_US.UTF-8`, `sv_SE.UTF-8` and `tr_TR.UTF-8`; all twelve frozen snapshots match the pre-change baseline exactly.
- `npm run outputs:check`: passed; all six committed successor outputs remain current.
- Typecheck passed. The local canonical `npm run check` passed every test suite and the output contract, then stopped at the publication figure-boundary check: the existing external-maintenance SVG's “ASHP / support footprints” label exceeded the right edge in this local browser environment. The untouched registration checkout reproduces the identical failure, while its exact-head CI passed that check. No SVG or threshold was changed to force a local pass; the implementation PR must establish complete canonical health and publication validation in exact-head CI before integration.

## Scope and remaining boundary

The implementation fixes the shared semantic serializer, Reference House semantic ordering and DPL fingerprint-bearing preparation. It does not promise that every human-facing report or drawing has identical presentation ordering for arbitrary Unicode under different locales, and deterministic identity does not establish physical truth or whole-building compliance. No downstream architectural state, external evidence obligation or maturity claim changes.

## Integration

Independent source `b7a903f55eccbc8748b885391f675dc68b91d671` passed [full exact-head CI 41238865876](https://github.com/adamnoden/architecture/actions/runs/41238865876) and [the 48-PDF historical owner proof 41238865901](https://github.com/adamnoden/architecture/actions/runs/41238865901). [PR #1180](https://github.com/adamnoden/architecture/pull/1180) then brings the other three packets into the same independently leased scope, preserving their exact source commits and current main. Its final combined-head checks remain the integration gate. The [integration result](integration-result.md) and parent issue own final operational closeout.
