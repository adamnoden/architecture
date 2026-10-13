# Ovid’s House — identity and conceptual migration

**Programme:** OH — Ovid’s House migration  
**Status:** complete — PASS  
**Baseline:** `a57db1b03cc055ef744e883f0333d53fb282f6f5` (`CH-08 — distillation and deletion`)  
**Branch:** `ovids-house-migration`

## Purpose

This programme migrates the project’s master identity from **House Kernel** to **Ovid’s House**, and makes explicit a conceptual thread that is already present throughout the work: a long-lived house should seek **permanence without stasis**, allowing necessary change without needlessly consuming what deserves to endure.

The migration is not a new architectural programme and does not expand the project’s physical, regulatory or computational claims. It should reveal and clarify an existing argument rather than retrofit a literary theme onto unrelated material.

## Identity contract

The approved hierarchy is:

| Layer | Name | Role |
|---|---|---|
| Master project | **Ovid’s House** | The complete architectural research project, website, publication and public identity. |
| Central thesis | **Permanence through transformation** | Compact expression of the project’s temporal proposition. |
| Interpretive lens | **Ovidian architecture** | A bounded literary/philosophical lens for continuity through altered form; not an architectural authority. |
| Formal system | **House Kernel** | The formal architectural/computational kernel: bounded models, invariants, relationships, obligations and semantics that can be expressed explicitly. |
| Compiler | **Metamorph Compiler** | Human-facing name for the software machinery that compiles and checks House Kernel state. |
| Worked building | **Reference House** | One coordinated interpretation and integration fixture, never proof of the doctrine. |

**Display form:** `Ovid’s House` with a typographic apostrophe in prose and publication surfaces.  
**Slug/domain form:** `ovids-house` / `ovidshouse.com` where punctuation is unavailable.

## Conceptual boundary

The migration may strengthen the project’s account of time, continuity and change. It must preserve several distinctions.

1. **Ovid is a lens, not an authority.** The project did not derive its architecture from Ovid. The literary relationship is useful because the independently developed architecture already treats transformation, continuity and identity as connected problems.
2. **Transformation is not automatically good.** The project remains committed to selective permanence, proportional serviceability and settled architecture. Some things should change; some should endure.
3. **Ovidian architecture is not transformable-architecture spectacle.** The relevant transformations are usually ordinary: maintenance, repair, replacement, adaptation, renewal and succession.
4. **The name must not become art direction.** No classical cosplay, Roman ornament, laurel branding, mythological subsystem naming or Latin vocabulary merely for atmosphere.
5. **The literary framing must earn its place.** If removing an Ovidian reference does not reduce understanding of the architectural mechanism, remove it.

## Protected technical identity

This migration must not churn stable technical or historical identifiers merely to match the new brand.

Retain:

- canonical `HSA-P-*` pattern IDs;
- `HK-RH-COMPILE-1` and other established semantic/provenance identifiers;
- RH-C0…RH-C5, CF-01 and CH-00…CH-08 gate names;
- historical directory names and regression fixtures where they carry evidence or provenance;
- ordinary code terms such as `compileReferenceHouse`, `compile.ts`, domain names and diagnostic identifiers where they describe the software rather than the public brand.

**House Kernel is not a legacy name to be deleted.** It changes role from master project identity to active formal-system identity.

## Compiler baseline and proof boundary

The migration begins after CH-08, with the computational track at M4 within its bounded proof scope. The complete CH-00→CH-08 semantic, artefact, determinism and proof baseline controls this work.

Brand/editorial changes must not change:

- frozen Reference House semantics;
- compiler statuses, diagnostics or proof boundaries;
- CH semantic/source/method/result/compile identities;
- canonical generated drawing identities unless a deliberately public-facing label is itself part of the artefact;
- computational maturity.

There is no CH-09 and no RH-C6 created by this migration.

## Editorial integration target

The theme should be strongest where it helps a reader understand the project and absent where repetition would become branding.

| Location | Target treatment |
|---|---|
| Landing page | Strong thesis; minimal literary exposition. |
| Preface | One earned, restrained explanation of the title near the existing conclusion. |
| Part I | Explicit but bounded treatment alongside selective permanence and temporal layers. |
| Governing principles | Almost no literary language; preserve low-rhetoric doctrine. |
| Primer | Compact thesis and one short explanation of the name. |
| Pattern language | No Ovidian overlay unless a specific mechanism requires it. |
| Reference House | No thematic dressing; remain project-specific and accountable. |
| Research | Full intellectual treatment and red-team boundary. |
| Computational track | Clarify House Kernel / Metamorph Compiler and use invariants only where technically exact. |

## Programme

### OH-00 — rebase and migration freeze

- Reconcile current `main` with the planned migration.
- Freeze the exact baseline commit and CH completion state.
- Record identity hierarchy, protected names and non-goals.

**Exit:** restart-safe migration authority exists before public naming changes.

### OH-01 — intellectual foundation

- Add an evidence-sensitive research note covering Ovid, Heraclitean continuity-through-flux, persistence/identity, Open Building, pace layers, repair and architectural counterexamples.
- Distinguish direct architectural precedent from analogy.
- Define the useful meanings of `permanence through transformation`, `Ovidian architecture`, `persistence conditions` and `invariants` without forcing them into doctrine.

**Exit:** thematic integration is supported by a bounded argument rather than branding enthusiasm.

### OH-02 — primary editorial integration

- Rewrite the landing opening around permanence without stasis and permanence through transformation while returning quickly to physical architectural mechanisms.
- Add a restrained title explanation to the preface rather than opening with Ovid.
- Integrate the conceptual frame into Part I, principally around selective permanence.
- Update the compact Primer proportionately.
- Leave governing principles substantially unchanged except for master identity and only wording improvements that strengthen existing doctrine.

**Exit:** the name and thesis are intelligible from the primary reading path without over-explanation.

### OH-03 — master identity migration

- Change current public/master identity to Ovid’s House across canonical current material.
- Preserve historically accurate names in provenance.
- Upgrade identity validation so **House Kernel** can remain an active subsystem name without becoming an accidental old master brand.
- Migrate public PDF/site metadata and filenames to the new slug.

**Exit:** current public surfaces consistently identify the project as Ovid’s House while historical and subsystem identity remains explicit.

### OH-04 — computational naming boundary

- Define House Kernel as the formal architectural/computational system inside Ovid’s House.
- Introduce **Metamorph Compiler** at the human-facing system boundary.
- Prefer a short `compiler/README.md` and computational-index clarification over code churn.
- Do not rename compiler directories, stable schemas, regression gates or ordinary domain functions for branding.

**Exit:** project → formal system → compiler hierarchy is unambiguous without semantic change.

### OH-05 — build, audit and red team

- Run repository identity, link, route, type, test and publication validation.
- Build the site, Primer and Working Edition.
- Audit every remaining `House Kernel`, `house-kernel`, `HOUSE_KERNEL`, `HK-`, `House Systems Architecture` and `HSA-` occurrence as: active subsystem / stable identifier / historical provenance / accidental stale brand.
- Perform an editorial red team for overuse of Ovid, metamorphosis rhetoric and slogan repetition.
- Verify CH frozen semantic and artefact identity remains unchanged.

**Exit:** migration is technically green, semantically preserving and editorially proportionate.

### OH-06 — closeout

- Update project status and naming history.
- Record House Kernel’s retained subsystem role and Metamorph Compiler’s human-facing role.
- Close this programme control and retain it for provenance.
- Keep domain cutover separate from repository correctness.

**Exit:** no dangling migration TODOs remain in the repository.

## Closeout result

**OH-00 → OH-06: PASS.** The migration was executed from the completed CH-08 baseline without creating a new compiler-capability stage or changing computational maturity.

The resulting hierarchy is now explicit in current project material: **Ovid’s House** is the master project and publication identity; **permanence through transformation** is the compact temporal thesis; **House Kernel** is retained as the formal architectural/computational system; **Metamorph Compiler** is the human-facing name of its executable machinery; and the **Reference House** remains one worked integration fixture.

The Ovidian frame was integrated proportionately. It is strongest on the landing page, in the preface coda, in the selective-permanence discussion in Part I and in the compact Primer, with a fuller research boundary recorded in `docs/research/preface-precedents.md`. The governing principles, pattern language and Reference House were not converted into literary or classical branding. Ovid remains an interpretive lens rather than architectural authority.

Stable technical identity was preserved deliberately. Canonical `HSA-P-*` pattern IDs, `HK-RH-COMPILE-1`, RH-C0…RH-C5, CF-01, CH-00…CH-08, historical regression fixtures and ordinary compiler/domain names remain unchanged where they carry semantic or provenance value. No CH-09 or RH-C6 was introduced.

Verification completed at two levels. A transactional closeout run passed the complete repository/site health check and built both the compact Primer PDF and full Working Edition PDF before committing publication/status changes. After the temporary migration and verification machinery was removed, normal pull-request validation passed again on the durable-only branch state. The CH regression suites remained green throughout, preserving the frozen semantic, determinism, provenance and artefact contracts.

The remaining domain work is operational rather than architectural or repository work. Registration and DNS cutover for `ovidshouse.com`, with `ovidhouse.com` as a desirable defensive redirect, remain outside this completed programme.

## Domain and repository boundary

The source repository remains `adamnoden/architecture`; renaming it is out of scope.

The intended canonical public domain is `ovidshouse.com`, with `ovidhouse.com` desirable as a defensive redirect. Domain registration and DNS cutover are operational tasks separate from repository migration and are not prerequisites for closing the code/editorial work.

## Acceptance test

The migration succeeds only if all of the following are true:

- a reader can understand the project without knowing Ovid;
- understanding Ovid makes the title and temporal thesis richer rather than merely more prestigious;
- architecture remains the subject and metamorphosis remains a lens;
- selective permanence is strengthened, not replaced by generic flexibility;
- House Kernel has one clear subordinate meaning;
- Metamorph Compiler is a system name, not a reason to rename ordinary code;
- stable technical identities remain stable;
- the full repository and publication validation surface passes;
- the resulting prose still satisfies the project’s editorial doctrine.
