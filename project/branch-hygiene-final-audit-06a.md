# BRH-06A — final mechanical re-audit

BRH-06A reruns the canonical BRH-00A Git-history audit against the live repository after controlled cleanup and lifecycle prevention are in place. This packet is read-only with respect to the repository namespace: it proves the final state but performs no historical deletion, active-programme ref mutation, branch rewrite or repository-setting change.

## Audit baseline

- `main`: `ff50ca0e98419cc52338c0f3ff9d82b007100fe7`
- canonical audit tool: `scripts/branch-hygiene-audit.mjs`
- proof workflow run: **39263047435**
- proof job: **118095414246**
- execution head: `e37cc1075f93907248709f197ff2062c9e7a4d98`
- proof artifact: **12190304401**
- artifact digest: `sha256:f37c50a1762e1458ed5835f9896d977849ba5a13f3c7ae1f4422ae4ed02ee39c`
- canonical enumeration digest: `2f826d02538737cf83b8cf0fa5b001f67d9de961a53848a8910a8db478a1cec7`
- final-proof SHA-256: `1c1c28f4f108b1ce4359a5242debf2721c8b27c4022c26d835ff97eefe80d094`

The temporary proof workflow is removed before review. The artifact contains the raw canonical audit plus the complete machine-reconstructed final proof.

## Live namespace proof

The full remote namespace contained exactly **three non-`main` refs** during the guarded proof:

1. `drw-05e-principal-section-spread-proof` @ `29c520b7c82f24880d168c3e117370dec7837b8f` — active DRW-05E work, protected by open draft PR **#235**; audit evidence: 1 ahead / 16 behind / 1 unique patch.
2. `hfi-05c-cross-discipline-conflict-matrix` @ `932dd67c61ba10cbc154f68745cf8571430f3ada` — current authorised HFI-05C packet under issue **#195**; no open PR at proof time; 0 ahead / 3 behind / 0 unique patches. Its purpose is programme authority, not Git uniqueness.
3. `brh-06a-final-mechanical-reaudit` @ `e37cc1075f93907248709f197ff2062c9e7a4d98` — this proof packet itself.

No historical merged packet ref remains. After this BRH packet merges, automatic post-merge deletion is expected to remove its own branch, leaving only `main` plus the two independently active programme refs unless concurrent work legitimately changes the namespace.

## Historical deletion ledger proof

The final proof reconstructs every branch removed by BRH-04 from the durable deletion records and, for the final 20 reviewed-C branches, the frozen BRH-02 semantic authority.

Result:

- deleted records reconstructed: **161 / 161**
- unique deleted branch names: **161**
- every reconstructed record has an exact former 40-character head SHA and final disposition
- **115 A** — fully integrated
- **5 B** — patch-equivalent
- **41 C** — semantically superseded / intentionally obsolete
- **0 D**
- **0 X**

The complete 161-row reconstruction is retained in the proof artifact. The permanent source authority remains the committed BRH-02/04 records, so the result does not depend on the artifact remaining downloadable forever.

## Unique-work / salvage proof

The audit rechecks the terminal semantic and salvage authorities rather than inferring safety from an empty namespace:

- original semantic queue: **40**
- resolved C: **40**
- resolved D: **0**
- remaining C/D: **0**
- unresolved D topics: **0**
- salvage queue: **0**

`project/branch-hygiene-x-reconciliation.json` is the durable BRH-02H X/post-freeze reconciliation record. `project/branch-hygiene-salvage-proof.json` proves BRH-03 was vacuously complete. Therefore no unique valuable work is stranded by the historical cleanup.

## Prevention / lifecycle proof

The prevention layer is intact:

- GitHub repository setting `delete_branch_on_merge = true` was independently re-read after the audit;
- `.github/workflows/branch-orphan-audit.yml` remains present, scheduled weekly and manually runnable;
- its permissions remain `contents: read` and `pull-requests: read`;
- `scripts/branch-orphan-report.mjs` remains the report layer;
- orphan/stale signals still **do not delete branches automatically**;
- `project/branch-lifecycle.md` remains the minimal lifecycle doctrine.

The mechanical model is therefore deliberately asymmetric: merged PR heads disappear automatically; non-PR/orphan branches are only reported and require review.

## Administrative note

Issue **#253** was an accidental connector-routing invocation during BRH-06A. It was immediately marked `[VOID]` and closed `not_planned`; it carries no project authority or follow-up.

## Result and next gate

BRH-06A’s mechanical close condition is satisfied on the proof baseline: the historical queue is absent, every surviving ref has an explicit current purpose, deleted heads/dispositions remain reconstructible, no D/salvage debt remains, lifecycle prevention is installed, and the repository can proceed to ordinary exact-head validation.

After this exact proof package validates and merges under a fresh lease, the next authorised packet is **BRH-06B — final reconciliation and programme closeout**. BRH-06B must begin from a fresh live repository state and is the packet that may close issue #161.
