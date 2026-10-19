# BRH-04F — controlled B/C deletion batch 6 authorisation

BRH-04F begins the ordered **B → C** historical deletion phase after BRH-04E exhausted the straightforward A tail.

## Fresh live discovery

- `main`: `ffc870364bf28b7ab7d1f6337c9773b8580d7c19`
- live namespace before the BRH-04F packet ref existed: **48 refs including `main`**
- expected namespace immediately after creating `brh-04f-controlled-deletion-6`: **49 refs**, subject to concurrent work
- open PR at discovery: **#235**, `drw-05e-principal-section-spread-proof` — protected
- additional fresh active ref: `drw-03c1-physical-svg-type` — protected
- deletion cap: **25**

No BRH-04E endpoint assumption is reused as a destructive lease. The deletion runner must re-fetch and prove the live state immediately before mutation.

## Candidate set

The packet consumes the complete five-ref BRH-01B patch-equivalent queue first, then uses the remaining 20 places for complete reviewed-C semantic groups:

- **5 B** — the complete BRH-01B patch-equivalent queue;
- **7 C** — BRH-02C compiler/computational review;
- **8 C** — BRH-02D G01 completion review;
- **5 C** — BRH-02F pattern-language review.

Total: **25 refs = 5 B + 20 C**.

Candidate-set SHA-256: `0918c27ab42175ad27f1b81c40dd1a307bf384790119d3e290aa3c5106e89ff8`.

The source semantic authority remains BRH-02H: all 40 original C/D candidates finished as **C=40 / D=0**, with an empty salvage queue. This packet does not reinterpret those dispositions.

## Destructive guard

Deletion is delegated to a temporary packet-local GitHub Actions workflow because the connected GitHub capability has no first-class ref-deletion action. That runner is authorised only if all of the following are simultaneously true at execution:

1. live `main` is still exactly `ffc870364bf28b7ab7d1f6337c9773b8580d7c19`;
2. the embedded candidate-set hash is exactly `0918c27ab42175ad27f1b81c40dd1a307bf384790119d3e290aa3c5106e89ff8`;
3. all 25 candidate refs still exist at their frozen head SHAs;
4. no candidate is the head of an open PR;
5. `main`, the packet branch, #235, `drw-03c1-physical-svg-type`, and any other non-candidate ref are not deletion targets.

Each deletion uses Git's exact-old-SHA `--force-with-lease`. After mutation the runner must re-enumerate the namespace and prove that the removed-name set is **exactly** the authorised 25. Concurrent additions may be recorded; any unexpected non-candidate removal makes the proof fail.

The temporary destructive workflow is execution machinery only and must be removed before the BRH-04F PR is reviewed.

## Expected queue after a clean run

- B remaining: **0**
- reviewed C remaining: **20**
- D/X deletion: **0**

No repository setting change, historical merge/cherry-pick, or branch rewrite is authorised.

## Next step

Run the guarded deletion. If any precondition fails, stop before mutation and recompute BRH-04F from the new live authority. If the deletion succeeds, record exact post-delete namespace reconciliation, remove the temporary runner, validate the exact proof head, and merge only under a fresh `main` + open-PR lease.
