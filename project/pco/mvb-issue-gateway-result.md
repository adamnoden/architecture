# Minimal connector-only MVB gateway

## Question
Owner-directed PCO-GATEWAY, issue #1088. Can regular ChatGPT chats use the **same** canonical dispatcher without Git network access, without installing a second task queue, command service or supervisor?

## Decision
Implement one locked [GitHub issue #1089](https://github.com/adamnoden/architecture/issues/1089) as the transport mailbox, one `issue_comment: created` GitHub Actions workflow, and one strict request handler. Only `claim-next`, `renew` and `release` are allowed. Read-only state remains available in existing operations reports. No autonomous chat restart, generic shell, merge operation, new lease store or second dispatcher.

Format — one line per owner-authored comment:
```text
MVB/1 {"cmd":"claim-next"}
MVB/1 {"cmd":"renew","node":"ABC-01","leaseId":"UUID","generation":1,"checkpoint":{"evidence":"PR #123","next":"Inspect CI"}}
MVB/1 {"cmd":"release","node":"ABC-01","leaseId":"UUID","generation":1,"reason":"handoff"}
```
The handler derives unique working branch `work/mvb-chat-COMMENT_ID` and holder label `issue-comment-COMMENT_ID` itself. It calls `scripts/project-claims.ts` using fixed argument arrays, not shell interpolation. Release only permits `handoff` or `abandoned`; the existing main-merger owns completed release.

## Trust boundaries
- Workflow triggered only on created comments under **locked** mailbox #1089, and only when trusted sender/user IDs equal the repository owner identity. Server-side code repeats checks; never trust claims from the comment body.
- Trusted `main` checkout and existing Node lockfile. GitHub Actions `GITHUB_TOKEN` scopes: `contents:write` for ACO CAS; `issues:write` for replies; no PR merge.
- Short bounded strict command syntax, no user-controlled CLI or shell invocation. Request expires after 10 minutes; ambiguous or late outcomes require inspection.
- Per-comment workflow concurrency and response correlation avoid executing a previously answered comment. Before a retry, claim-next checks the **canonical claim store** for the stable comment ID as holder and derived branch, avoiding duplicate acquisition where an earlier effect succeeded but a response was lost. Renewal checks exact generation and heartbeat; release recognises an already released generation. These are cooperative recovery checks, not global exactly-once delivery guarantees.
- Workflow responds in the same issue with `MVB/1 RESULT COMMENT_ID`; these comments are transport observations, never project authority. Comments expose no token or private owner data. Unknown outcomes must not be blindly replayed.

## What this does not solve
This is only the coordination adapter, not an agent runner. Regular chats still need GitHub connector support to edit branches and PRs and CI for proof. The adapter does not validate architecture, perform merges or supervise vanished chats. Do not imply one workflow can ensure atomic claim+merge or prevent a stale noncooperating worker writing outside permitted paths.

## Test and deployment gates
- Unit tests for accepted commands, rejected extra keys/command injection, strict owner/locked issue scope, expiry and manual dispatch boundary inherited from existing CLI.
- `npm run check` and exact-head PR CI. Actual GitHub event testing after merge (untrusted comment should not start a privileged job; benign invalid release should be refused; claim-next and release should round-trip safely).
- On workflow activation observe bot response, correct `runtime/claims` generation, no merged outputs or extra task graph. Do not claim hosted test success before observing it.
- If native event path fails or proves fragile, disable the workflow; the existing manual connector-CAS owner-directed mode remains available. The mailbox stays locked to maintain provenance.

This is a **transport**, not a reason to evolve MVB into a message bus. Do not add more commands without a demonstrated concrete need.
