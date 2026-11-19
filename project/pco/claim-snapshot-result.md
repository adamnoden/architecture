# Claim snapshot reference isolation

Owner-directed PCO-SNAPSHOT, admitted while verifying native project operations on 29 October 2026. Registration 26d7ca62; owning operations integration #1016–1018. This bounded successor repairs a transport read, not architectural scope or dispatcher ranking.

An overlapping main fetch and claim read in one checkout produced `No lease exists` although the runtime branch retained the record. No mutation occurred. The connector snapshot reader used the shared mutable `FETCH_HEAD` after fetching claims, so another fetch could substitute a main-source tree. That could also make a briefing falsely report an empty claim store. Existing per-file CAS prevents a blind overwrite, but it does not make the read correct.

The reader now fetches the explicit runtime branch into its own remote-tracking ref using `--no-write-fetch-head`, captures that branch's commit SHA and reads immutable objects as before. A main fetch cannot redirect that ref. Non-fast-forward or unavailable fetches still fail closed; the fix does not force-update the runtime branch, change leases, add a lock, or create another store.

A local Git integration fixture has distinct main-source and claim-only histories. It leaves FETCH_HEAD at main, reads claims, verifies the exact claim content, and asserts that FETCH_HEAD remains unchanged. The test failed on the previous reader and passes with the isolated ref. It protects both sides of the interference boundary without relying on timing. All canonical control tests, workflow syntax checks and TypeScript must pass; exact-head repository CI covers integration before merge.

The original native Actions reconciler released operations generations 1 and 2. Claims still require the canonical dispatcher/CAS protocol. This repair makes transport reads robust to ordinary overlapping Git operations; it is not atomic fencing across GitHub refs.


Native claim-push run 40932263327 then reproduced a separate read-only snapshot race: generated main projections advanced during dependency installation, so the strict HEAD==main check refused reporting despite unchanged programme sources. Briefings now require a clean ancestor of main and permit only an explicit narrow set of generated projection files to differ. Both the captured source revision and observed main tip are reported. Feature branches, dirty sources and any other source change still fail closed. Mutating reconciliation retains its exact-current-main guard. This repairs an observed reporting failure without weakening publication, lease acquisition or mutation checks.
