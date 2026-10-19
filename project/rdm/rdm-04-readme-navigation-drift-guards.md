# RDM-04 — README and navigation drift guards

## Decision

Protect only structural failures that are objective, cheap to detect and costly enough to justify automation.

After RDM-02 and RDM-03, most candidate README failures are already covered by existing repository controls. RDM-04 therefore adds **one new semantic invariant** and **widens one existing invariant**:

1. every `npm run <script>` command referenced by a repository README must exist in `package.json`;
2. the existing local-Markdown-link validator must include README entry surfaces outside the root/`docs/` corpus, notably `compiler/README.md` and `publication/README.md`.

No README wording, heading order, project status, numeric architectural fact or fixed directory inventory is frozen by this packet.

## Starting authority

RDM-01 identified candidate structural invariants but explicitly prohibited prose-locking, status encoding and a bespoke documentation framework. RDM-02 then rebuilt the root README as the public repository/authority map, while RDM-03 narrowed subsystem READMEs and established the public/internal link boundary.

This review is against the combined RDM-02/RDM-03 tree, not the pre-rewrite README layer.

## Existing controls recovered

The final README layer already sits behind substantial structural validation:

| Existing control | Already protects |
|---|---|
| `.vitepress/navigation.ts` coverage | every published `docs/` Markdown page is deliberately classified in navigation |
| `scripts/validate-repository.ts` local-link validation | root and `docs/` local Markdown links resolve and remain inside the repository |
| `scripts/validate-resolved-public-surface.ts` | reader-facing pages do not link into internal-only repository surfaces |
| `scripts/validate-project-brand.ts` / repository identity checks | public master identity does not regress into legacy/internal naming |
| `project/programme-controls.ts` + repository validation | the two development lifecycle index sections remain consistent with registered controls |
| publication adapters/validators | publication-consumed semantic README sections remain present and parseable |
| `npm run outputs:check` | committed generated Reference House inspection outputs are not stale relative to their source/renderers |
| publication validation/integrity | publication source/figure/build contracts remain coherent |

RDM-04 does not duplicate these controls merely to label them “README guards.”

## Candidate disposition

| Candidate from RDM-01 | Decision | Reason |
|---|---|---|
| Canonical README/navigation links resolve | **GUARD — extend existing check** | `validateLocalMarkdownLinks()` already provides the right invariant but previously omitted internal entry READMEs outside root/`docs/`. Its source set is widened to all repository `README.md` surfaces while preserving the existing algorithm. |
| README-referenced `npm run` commands exist | **GUARD — new check** | Commands are executable claims. A typo or removed script creates a deterministic broken instruction and can be checked directly against `package.json` without judging prose. |
| Root repo-map destinations continue to exist | **DO NOT ADD A SEPARATE GUARD** | Public destinations represented as links are already checked. Internal paths are intentionally plain code spans because public pages must not link into internal surfaces. Treating arbitrary code spans as machine-readable topology or duplicating a fixed directory registry would create pseudo-authority and make legitimate reorganisation unnecessarily coupled. |
| Generated artefact surfaces retain exact warning text | **DO NOT GUARD** | Exact warning wording is editorial. Source/output staleness is already checked by `outputs:check`; operating discipline is also stated in `AGENTS.md` and the generated-surface contract. Guard the source relationship, not a sentence. |
| Explicit canonical entry documents remain reachable | **DO NOT ADD A DUPLICATE REGISTRY** | Reader-facing entries are covered by links/navigation; several internal anchors are already required by existing validators or build machinery. A second list maintained solely for README governance would drift from the owners it duplicates. |
| Prevent known duplicate/stale entry surfaces | **DO NOT GUARD BY ABSENCE OR FIXED SET** | RDM-03 deliberately rejected `docs/publication/README.md` because it did not currently earn a public route. That does not mean such a page must be forbidden forever. Navigation coverage already forces any future public page to be integrated consciously. |
| Prevent stale copied architectural numbers/preferences | **DO NOT REGEX ARCHITECTURAL FACTS** | RDM-03 removed the duplicated stair values rather than teaching a README linter architectural truth. Facts should be linked/derived from owners, not mirrored into a validator. |
| Freeze headings or section order that downstream tools happen to parse | **DO NOT ADD GENERIC README RULES** | Existing publication and programme-control consumers already enforce the few semantic sections they actually consume. Their contracts should remain local to those consumers rather than becoming a general README template. |

## Implemented guard

### README command references

`scripts/readme-command-contract.ts` extracts distinct `npm run <script>` references from README content and reports references absent from `package.json.scripts`.

`scripts/validate-repository.ts` recursively discovers repository `README.md` files while excluding runtime/generated dependency trees such as `.git`, `node_modules`, VitePress build/cache output and publication build output. The repository validator applies the command contract to that complete README set.

This check is intentionally narrow:

- it validates script identity, not command usefulness;
- it does not require any particular command to appear in a README;
- it does not freeze code-fence shape or prose around a command;
- it does not inspect general Markdown for arbitrary shell snippets;
- it does not infer architectural authority from commands.

### Local README links

The existing local-link algorithm is unchanged. Its source set is widened from root/`docs/` Markdown to include all repository README entry surfaces as well. This catches a broken local link in internal contracts such as `compiler/README.md` or `publication/README.md` without introducing a second link checker.

## Regression proof

`scripts/readme-command-contract.test.ts` provides explicit pass/fail proof for the new semantic guard:

- duplicate valid references are normalised and accepted;
- multiple existing package scripts pass;
- a representative typo/removal (`npm run publication:valdiate` when only `publication:validate` exists) fails with the README path and missing command.

Focused local proof:

```sh
npm run test:readme-contracts
```

Repository-surface proof, including actual README discovery, links and command references:

```sh
npm run test:repo
```

Canonical repository health remains:

```sh
npm run check
```

The focused regression test is also included in the main `npm test` chain so CI exercises both the helper’s negative case and the real repository’s positive state.

## Proof boundary

These guards establish only repository information-architecture invariants:

- linked local targets exist;
- README-referenced npm scripts exist.

They do **not** establish that README prose is complete, architecturally correct or well written; that the named command proves more than its implementation; that a plain-text path is canonical; that a generated artefact is architecturally true; or that the repository topology should never change.

The correct response to a legitimate topology or command change is to update the owning source and its affected README references together. The validator should not make that change difficult beyond exposing an otherwise broken instruction.

## Non-findings

No new README schema, frontmatter, heading template, canonical-path registry, generated-warning phrase, issue/status marker or architectural-fact linter is justified.

The strongest RDM-04 result is therefore restrained: reuse the repository’s existing structural controls, close two objective coverage gaps, and stop.
