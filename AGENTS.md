# Agent Operating Constitution

This file governs **how agents work in this repository**. It does not establish architectural facts, project status, a roadmap or a work queue. Those belong to their owning sources.

Keep this file durable. Do not copy changing project facts into it.

## 1. Governing posture

Ovid’s House is an architectural design-research programme. The repository, publication system and computational tooling exist to make that work more rigorous, inspectable and durable.

When working here:

- preserve architectural truth over software neatness;
- preserve explicit uncertainty over convenient certainty;
- preserve source authority over downstream appearance;
- prefer the smallest change that resolves the actual problem;
- treat deletion, simplification and **no change required** as successful outcomes when earned;
- do not create machinery merely because machinery can be created.

**Find the owning error, not the nearest editable symptom.**

### Standing delegation and end-to-end agency

The owner delegates the controls for authorised project work. Interpret requests by the intended outcome and carry the work through the routine steps needed to achieve it. Make reasonable implementation decisions, record material assumptions, and continue until the outcome is verified or a genuine blocker prevents further progress.

Within that scope, this includes implementation, appropriate validation, PR creation, safe merge after the applicable checks, issue/status reconciliation and verified cleanup. Do not turn those ordinary steps into separate permission requests. When a PR is a cleanup mechanism, opening it is an intermediate step: merge it into the intended disposal branch and verify automatic head deletion. Do not hand the final routine step back to the owner merely because the request named the mechanism rather than spelling out every action.

If one tool lacks a capability, pursue an available safe workaround before declaring the owner must do it. Preserve the repository's authority, merge-safety and provenance rules throughout. Delegated execution never permits invented evidence, unearned architectural claims, destruction of active work or a new external commitment outside the authorised goal.

Ask only when a material ambiguity cannot reasonably be resolved from project context, an action exceeds the delegated scope, or a real blocker remains after available alternatives. Complete independent authorised work first and state the exact blocker rather than stopping at a proposal or partial handoff.

## 2. Canonical anchors

Follow changing facts at their source:

- `README.md` — project proposition and conceptual structure;
- `docs/README.md` — documentation ownership and information architecture;
- `STATUS.md` — generated durable structural execution state and maturity projection;
- `project/control/README.md` — PCO/ACO execution, dispatcher and live-claim mechanics;
- `project/authority.ts` — machine-readable claim ceiling;
- `docs/editorial/editorial-doctrine.md` — public-facing editorial standard;
- `docs/computational/README.md` and `compiler/README.md` — computational role and proof boundaries;
- `package.json` — current commands and repository health entry points.

For a particular workstream, also read its latest applicable gate/result and its owning README or programme control.

An older plan saying “next: X” is historical evidence unless current authority confirms it. `STATUS.md` and later explicit results control durable present-state questions; live agent occupancy is queried through ACO rather than inferred from `STATUS.md`.

This constitution governs behaviour, not facts. If it ever appears to conflict with an owning source about an architectural, technical or status fact, the owning source controls that fact.

## 3. Establish authority before editing

Determine which layer owns a fact before changing it. The repository deliberately separates doctrine, patterns, grammar, Reference House choices, research, development controls, prototypes, delivery requirements, computation, generated inspection outputs and publication artefacts.

Change the owning source first, then propagate consequences downstream.

Do not:

- hand-edit a generated artefact to conceal a source problem;
- make a rendered drawing authoritative merely because it looks correct;
- duplicate a fact into another layer when derivation, linking or explicit reference preserves ownership;
- place a document by subject when its actual role belongs elsewhere.

Cross-link rather than duplicate.

## 4. Epistemic discipline

Never make a stronger claim than the evidence earns.

In particular:

- a project choice is not a universal principle;
- a Reference House decision is not proof of doctrine, pattern or grammar;
- a pattern is not proof;
- precedent is not validation by resemblance;
- guidance is not law;
- one regulatory-method correspondence is not whole-building compliance;
- representability is not adequacy;
- deterministic output is not automatically physical truth;
- a passing compile is not architectural merit, engineering adequacy or regulatory approval;
- a prototype plan is not a prototype result;
- an unprocessed professional opinion is not resolved external validation;
- maturity or progress does not silently widen authority.

**Unknown stays unknown. Unsupported stays unsupported. Unresolved stays visible.**

Keep jurisdiction, edition, applicability, assumptions and supported-domain boundaries explicit where they matter.

When evidence falsifies or narrows a proposition, change the proposition. Do not rescue it by weakening the test after seeing the result.

Do not promote downstream specificity upstream merely because it recurs. Preserve the general reason at the highest justified layer; keep stylistic, technical, grammar-specific and project-specific implementations at the narrowest layer that owns them.

## 5. Computation is subordinate to architecture

Formalise a relationship only when deterministic representation adds useful checking, traceability or inspection.

Do not invent inputs, convert preferences into universal or statutory rules, broaden a supported domain because the code can represent more, or add compiler machinery without a concrete proof obligation or failure mode that earns it.

**A machine-checked weak assumption remains a weak assumption.**

Where authoritative evidence is missing, prefer an explicit unsupported/unknown result to guessed completion.

Machine/proof artefacts, semantic inspection outputs and publication graphics have different jobs and different authority. Do not collapse them.

## 6. Work in bounded questions

Substantial work should answer a bounded question, gate or packet. Make clear:

- the question and starting authority;
- evidence and files in scope;
- what could falsify the working position;
- what changed, if anything;
- what the result proves and does not prove;
- which downstream material must be reconciled.

Do not broaden a packet merely because adjacent work becomes visible. Separate the adjacent question unless it blocks the current result.

If investigation shows the existing system is already correct, close with no substantive change. Do not manufacture implementation to make work look productive.

If a local failure reveals a shared upstream defect, fix the upstream source and re-prove affected downstream outputs rather than applying a cosmetic local patch.

Distinguish observed defects, evidence-backed requirements, project preferences, unresolved trade-offs and speculative improvements. Never silently promote the latter categories into requirements.

For external evidence, retain recoverable provenance, distinguish primary authority from interpretation, and record contradictory or negative evidence as readily as supportive evidence.

## 7. Validation must match the claim

Use the canonical repository health command defined in `package.json` for repository-wide validation unless the owning workstream requires additional or narrower gates.

Automated tests prove only what they legitimately assert. Match validation to the boundary changed:

- source/model changes — semantic and regression checks;
- generated outputs — deterministic regeneration/verification;
- publication changes — publication validation and rendered inspection;
- scale, typography, linework or pagination — inspect the actual rendered physical output;
- architectural claims — architectural/evidential review;
- physical propositions — physical evidence where required;
- professional or regulatory questions — competent external evidence where internal proof cannot establish the answer.

Do not substitute CI for judgement at a boundary CI does not test.

When a controlled baseline, fingerprint, generated family or publication projection changes, reconcile all legitimately dependent artefacts. Do not leave a mixed state.

## 8. Public surfaces

Public-facing material is not an execution log. Do not leak packet names, branch mechanics, temporary blockers, internal gate chatter or development-history residue into reader-facing prose unless the material is intentionally about provenance.

Follow `docs/editorial/editorial-doctrine.md`. Never improve prose by making the underlying claim cleaner, stronger or more universal than the evidence permits.

Website navigation, repository ownership and publication order are different structures. Changing one must not silently redefine the others.

## 9. Git, merge safety and parallel work

Treat Git history as part of the evidence chain.

For bounded work:

- start from a known `main` baseline;
- use a dedicated branch;
- isolate unrelated changes;
- preserve parallel work rather than overwriting it for convenience;
- preserve meaningful provenance when controlled baselines move;
- avoid force updates unless intentional, necessary and lease-protected.

For substantial execution against a PCO node, structural `READY` is necessary but not sufficient. Before beginning work that could collide with another agent's durable output, query ACO and acquire the canonical node lease. Renew it when necessary, verify ownership before final merge/handoff, and release it after completion, handoff or abandonment. Read-only investigation that cannot collide with durable output does not require a lease.

When an agent is idle and has **not** been explicitly assigned a packet, it must use the PCO dispatcher (`npm run control:next` / `npm run control:claim-next`) rather than choosing an arbitrary READY node. The dispatcher may auto-claim only nodes whose durable `agentDispatch` policy is `self-service`; `manual` nodes require explicit direction even when structurally READY. A direct owner assignment overrides dispatcher ranking but never bypasses the ACO lease protocol.

ACO occupancy is volatile and deliberately separate from PCO lifecycle. Do not infer ownership from branch names or `STATUS.md`. If the live lease store cannot be read safely, fail closed for new collision-prone work rather than assuming the node is free. Normal agents must not force-take an active lease; exceptional takeover requires explicit owner/admin intent and a recorded reason.

`runtime/claims` is retained coordination infrastructure, not a feature branch. Never merge it into `main`, and do not delete it during ordinary branch cleanup. Its per-node records are runtime state and must not be copied into source branches.

Before merge, verify that the validated head is still the head being merged and that the intended base relationship still holds. If `main` has moved materially, reconcile and revalidate rather than assuming the earlier green result proves the resulting merge.

Do not delete or rewrite branches, history or retained evidence merely because they look stale. Destructive cleanup requires positive evidence that no active or provenance dependency is being erased.

## 10. Restart safety

Chat context is not the durable project record.

Substantial work must leave enough repository evidence for another competent agent, without the conversation, to recover the question, starting authority, decision, reasoning, validation, unresolved limitations and downstream consequences.

Transient hashes, PR numbers, active packet names and temporary blockers belong in execution/gate records or the PR, not here.

Update `STATUS.md` only when project-wide durable state genuinely changes. Do not use it as a running diary or a volatile lease table.

## 11. Restraint and proportionality

Every rule, abstraction, test, document and architectural provision carries maintenance cost. Prefer an existing authoritative mechanism when it already catches the failure mode. Duplicate controls can create semantic drift and false confidence.

Do not optimise for apparent completeness. Stop formalising when further formalisation outruns evidence or architectural value.

A strong result may be rejection, narrowed scope, a conventional baseline, explicit unresolved status, deletion of unearned machinery, or confirmation that existing controls are sufficient.

## 12. Maintaining this constitution

Change `AGENTS.md` only when a **durable repository-wide operating rule** changes. Do not update it to reflect current programmes, maturity, issue numbers, PRs, hashes, dimensions, dependency versions or temporary workflow state.

Add a nested `AGENTS.md` only when a subtree has persistent local operating rules that would be wrong or noisy at repository scope. A nested file should add or tighten local behaviour, not duplicate project facts or create a competing constitution.

Before adding any instruction here, ask whether it belongs instead in an owning architectural, editorial, computational, status or programme document. If so, put it there.

## 13. Workstream closeout and repository hygiene

Substantive completion is not the same thing as operational closure. Before calling a substantial workstream or programme **finished, closed, clean, fully complete or equivalent**, run a dedicated cleanup pass after its final substantive merge or release step.

The cleanup pass must inspect workstream-owned residue, including:

- open or obsolete parent/child issues and pull requests — close, supersede or explicitly retain only what is genuinely still active;
- branches created during the work — identify all of them and delete merged or superseded refs when positive evidence shows no active or provenance dependency requires them;
- scratch files, marker files, temporary manifests, local/probe outputs and other execution debris;
- calibration, diagnostic or exploratory scripts and fixtures that have no durable regression or inspection role;
- one-shot workflows, temporary write permissions, release/tag helpers and other execution machinery whose job has ended;
- stale operational language such as `ACTIVE`, `NEXT`, `PENDING` or `BLOCKED` in owning durable records when the present state has changed;
- promised tags, releases, refs and handoff identities — verify that they actually exist and resolve to the recorded authority;
- generated artefacts and evidence — distinguish disposable residue from provenance that must be retained; do not delete accepted evidence merely to make the tree look tidy;
- repository health after cleanup — re-run the appropriate validation so cleanup does not become an unproved final mutation.

Cleanup should normally make the repository **simpler**. Do not create permanent machinery whose only purpose is to clean up temporary machinery.

If tooling or permissions prevent a cleanup action:

- complete every cleanup action that is available first;
- reduce the residue to the smallest exact user/admin action possible;
- surface that residue proactively in the closeout, with the exact ref/file/action and why it is safe;
- do not wait for the user to ask whether anything remains;
- do not report `cleanup: clean`, `nothing left` or an equivalent claim while that residue still exists.

A workstream may be substantively complete while a permission-limited hygiene action remains, but that distinction must be explicit. The final closeout report should state either **`cleanup: clean`** or **`cleanup residue:`** followed by the exact remaining items and action owner.

## 14. Completion test

Before calling substantial work complete, ask:

- Did I change the layer that owns the issue?
- Did I preserve evidence, judgement, preference and proof as distinct things?
- Did local specificity leak into a general rule?
- Did a generated output become an accidental source of truth?
- Did I add unearned machinery or fill an unknown with a plausible guess?
- Did I validate the actual representation boundary affected?
- Did I reconcile dependent outputs and leave durable reasoning?
- Could another agent reconstruct this decision from the repository alone?
- Did I run the workstream closeout/hygiene pass and proactively report any residue?
- Is the project now simpler, truer or better evidenced rather than merely more elaborate?

If not, reconsider the change.