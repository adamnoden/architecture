# BRH-04F — controlled B/C deletion batch 6 complete

BRH-04F begins and completes the ordered historical **B → C** deletion phase without touching live programme work.

## Result

- authorised deletion set: **25 refs**
- class mix: **5 B + 20 C**
- candidate-set SHA-256: `0918c27ab42175ad27f1b81c40dd1a307bf384790119d3e290aa3c5106e89ff8`
- deletion transaction: **atomic**
- deleted: **25/25**
- B queue remaining: **0**
- reviewed C queue remaining: **20**
- D/X deleted: **0**
- repository settings changed: **no**
- branch rewrites: **no**

The 20 C refs were complete semantic-review groups from BRH-02C, BRH-02D and BRH-02F. BRH-02H remains the disposition authority: the original semantic queue closed **C=40 / D=0** with no salvage work required.

## Guarded destructive proof

The packet used a temporary GitHub Actions runner solely because the connected GitHub capability exposes no first-class remote-ref deletion action.

The destructive transaction ran as workflow **39242660079**, job **118026967683**, on exact packet head `eb6bb50a0b9d25bd92c589df466b023db9f7bb05`.

Before mutation it proved:

- `main` was still exactly `ffc870364bf28b7ab7d1f6337c9773b8580d7c19`;
- the candidate hash was exactly `0918c27ab42175ad27f1b81c40dd1a307bf384790119d3e290aa3c5106e89ff8`;
- every candidate existed at its frozen head;
- no candidate was the head of an open PR;
- the packet branch itself still matched the workflow head.

The actual deletion was one `git push --atomic` transaction with an exact-old-SHA `--force-with-lease` for every candidate, plus no-op leases on `main` and the packet branch. Therefore a moved candidate or control ref would have rejected the whole transaction rather than permitting a partial cleanup.

Proof artifact: **12182117366**, digest `sha256:c836f528c0043f41266fa3e5484b4dfaea53dce6fdd63b9543b506ab1ccb782f`.

The temporary workflow is removed from the packet before PR review.

## Namespace reconciliation

The fresh destructive snapshot contained **50 refs including `main`**. This was one ref larger than the 49-ref post-packet-creation expectation because concurrent HFI work created `hfi-04a-bathing-toileting-dressing` before the destructive lease.

The guarded run then proved:

`50 - 25 authorised atomic deletions = 25`

with:

- **25** exact authorised names removed;
- **0** unexpected removals;
- **0** additions during the destructive window itself;
- all 25 authorised candidates absent afterward.

Independent GitHub re-enumeration confirms the surviving 25-ref namespace is:

- `main`;
- `brh-04f-controlled-deletion-6`;
- live DRW-05E;
- live DRW-03C.1;
- live HFI-04A;
- the **20 remaining reviewed C refs**.

DRW PR **#235** and corrective DRW PR **#236** remain protected. HFI-04A also survives untouched.

## Remaining historical queue

All B refs are now gone. The remaining reviewed C queue is exactly:

- `pr00b-part-iv-synthesis`
- `pr00d-d3-reference-house-architecture`
- `pr00d-d3-reference-house-figures`
- `pr00d-d4-reference-house-systems`
- `pr00d-d5-visual-integration`
- `pr00e-editorial-hardening`
- `pr00f-integrity`
- `project-integrity-refactor`
- `prototype-p03-engineer-review-brief`
- `pub-san-computational-surface`
- `pub-san-research-evidence`
- `pub-san-rh-technical`
- `public-url-phase-1`
- `reference-house-phase5`
- `rh-c1`
- `rh-c2-structural-view`
- `rh-c3-service-view`
- `rh-c4-boundary-view`
- `rh-c5-target-calculations`
- `workmanship-robustness`

## Next gate

BRH-04F is ready for normal PR validation. Merge only after the exact final proof head is green and a fresh `main` + open-PR merge lease is taken.

After merge/closeout, the next authorised packet is **BRH-04G**: recover a completely fresh live lease and delete the remaining 20 reviewed C refs. No BRH-04F destructive lease may be reused.
