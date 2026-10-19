# BRH-05B — read-only orphan-branch audit complete

BRH-05B installs the lightweight branch-lifecycle monitor authorised by issue #161. It reports branch hygiene signals and has no branch-mutation path.

## Result

The existing `scripts/branch-hygiene-audit.mjs` remains the single Git-history engine. BRH-05B adds only:

- `scripts/branch-orphan-report.mjs` — review classification and Markdown/JSON reporting;
- `.github/workflows/branch-orphan-audit.yml` — weekly/manual/self-test execution;
- `project/branch-hygiene-retentions.json` — explicit retention reasons for intentional durable branches without open PRs.

The workflow runs weekly on Monday at 06:17 UTC, supports `workflow_dispatch`, and self-tests on PRs that change its implementation.

Its token permissions are restricted to:

- `contents: read`
- `pull-requests: read`

There is no branch deletion, push, ref update, write permission or automatic stale-branch action.

## Classification

Every non-`main` branch is reported as one of:

1. **`open-pr`** — at least one open PR exists;
2. **`retained`** — no open PR but an explicit non-empty retention reason exists;
3. **`recent`** — neither of the above and head commit age is no more than 14 days;
4. **`suspicious`** — none of the above.

`Suspicious` is deliberately a review signal only. It neither fails the workflow nor authorises deletion.

Git refs do not expose a reliable branch-creation timestamp, so the reproducible age signal is head commit age. That is intentionally conservative.

## Proof

### Implementation-head proof

At `9725d95538fd38be9c3bd99826a7ded2029f2aad`:

- orphan-audit run: **39255049551**
- job: **118068114269**
- artifact: **12187616745**
- digest: `sha256:f9f82676b17772d8ff49a05b394cda9d65b4a0b15387bcc0ffdb4e3a24db3623`
- result: **3 branches = 2 open-PR + 1 recent + 0 retained + 0 suspicious**

This correctly classified DRW-05E and BRH-05B as open-PR work and fresh HFI-04D as recent.

### Exact-final-head proof

At `720965cebe88e2b76507e526f35ce9d4caff252b`:

- orphan-audit run: **39255307550**
- job: **118068993234**
- artifact: **12187617115**
- digest: `sha256:ab6dc8e2475a12491e145629f4021de140c8b54dc9c45d2a31393e15ad94ba0b`
- result: **3 branches = 3 open-PR + 0 recent + 0 retained + 0 suspicious**
- normal PR validation run: **39255307341** — fully green

HFI-04D acquired PR #246 between the two proof snapshots. The audit therefore changed its classification from `recent` to `open-pr` from live authority rather than preserving a stale packet-start assumption.

## Merge proof

PR **#245** merged as `0f0eb04786cae47b68477164bc476ee80dc158f9` under a fresh lease:

- leased `main`: `6db87f9fc2e2e20d67b9004fd6ada53aac117d1d`
- first parent: `6db87f9fc2e2e20d67b9004fd6ada53aac117d1d`
- second parent: validated BRH head `720965cebe88e2b76507e526f35ce9d4caff252b`

`brh-05b-orphan-audit` then disappeared automatically under the BRH-05A lifecycle setting. No manual branch deletion occurred.

## Post-merge validation

Pages/publication run **39255699267** passed in full on the exact merge commit:

- repository health;
- Working Edition PDF;
- Primer PDF;
- PDF existence and metadata;
- project data plate;
- Pages artifact;
- Pages deployment.

## Safety endpoint

- historical queue: **0**
- automatic post-merge PR-head deletion: remains enabled
- automatic orphan/stale deletion: **none**
- active programme branches touched by BRH-05B: **none**

## Next packet

**BRH-05C — lifecycle doctrine.** Record only the minimum durable branch workflow rules authorised by #161. Do not create a larger branch-management subsystem.
