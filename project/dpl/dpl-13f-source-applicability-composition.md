# DPL-13F — Case-Specific Source / Applicability Composition Integration

**Issue:** #527  
**Depends on:** DPL-L #524 / PR #525  
**Stacked base:** DPL-L candidate `8afa03b44cb8443fd755c369058cb9a97b6eea98`  
**Status:** implementation candidate; exact-head validation required

## Decision

DPL-13F integrates exactly two existing owner-authority seams into the controlled DPL-RS-02 substantive aggregation:

- `ENGLAND:ENG-COV-SOURCE-APPLICABILITY`;
- `PLANNING:DPL10-COV-SOURCE-COMPOSITION-STATUS`.

It adds no new legal or planning judgement authority.

Expected narrow result:

```text
England source/applicability        = UNRESOLVED
Planning source/status composition  = PASS
```

Therefore:

```text
substantiveUnresolved       11 → 10
dueClassificationUnresolved     17
substantiveFailure                0
wholeSiteConclusion             UNRESOLVED @ SCREENING
```

## England — explicit unresolved source selection

The current England technical slice is exact and source-identified at its research date. DPL-09A, however, freezes a stronger rule: project technical-source selection across the 2027/2028 transition depends on legally relevant project events.

DPL-RS-02 does not currently provide:

- building-control route / qualifying notice-or-application kind;
- notice/application date and status;
- qualifying commencement date;
- qualifying commencement evidence.

DPL-13F therefore refuses the shortcut:

```text
current source snapshot
    ⇒
transition-safe project technical target
```

The case-specific result is `UNRESOLVED` with the missing facts named explicitly.

This is progress even though the blocker remains: a generic owner-family placeholder is replaced by an exact case/source result with provenance and a finite missing-fact set.

No Part A–T technical compliance is claimed.

## Planning — narrow source/status PASS

For the controlled 2026-10-24 RS-02 Croydon case, the current authority set supports a narrow mechanical source/status composition.

Development-plan membership represented by this packet:

```text
London Plan 2021       = YES
Croydon Local Plan 2018 = YES
```

Other controlled source statuses include:

```text
NPPF September 2026         = operative policy/material consideration; not development plan
Draft London Plan 2026      = emerging / non-operative; not development plan
Croydon Local Plan review   = emerging / non-operative; not development plan
London Plan Guidance        = adopted guidance; not development plan policy
Croydon SPD2                = revoked from 2022-07-26
```

The PASS means only:

> the source/status composition question for the controlled case is represented coherently under DPL-10A.

It does **not** mean:

- every source is material to this proposal;
- any emerging source has a particular planning weight;
- any policy is complied with;
- the planning balance is positive;
- permission is likely or granted.

## Authority locks

DPL-13F refuses silent reuse if any reviewed source authority changes.

Git-blob locks:

```text
DPL-09A       d7106eeb03903b2ca1f25b22a3374e69ac50af78
DPL-10A       3e097ecf433ed1da70651939e1ed83ae605b91fb
England slice c5cef671928837a22a81de44d328bc815f545c1a
London slice  177eec46828648182270829ad7cbd32c14d0d05f
Croydon slice 0b97a25e9aac962e8dd8cbb8a67b7e7fe6bbd106
```

The implementation also binds the exact RS-02 candidate fingerprint and checks the Croydon → London strategic-parent relation.

## Aggregation boundary

Only the exact two records above may change.

DPL-13F tests require all seventeen `::ACCELERATION_REVIEW` records to remain semantically identical.

The remaining source result ecology after the packet is therefore:

```text
1 source/status family positively resolved
1 source/applicability family explicitly unresolved on named missing events
9 other substantive blockers unchanged
17 acceleration classifications unchanged
```

## Proof boundary

DPL-13F explicitly retains:

```text
englandTechnicalCompliance = NOT_CLAIMED
planningPolicyCompliance   = NOT_CLAIMED
planningPermission         = EXTERNAL_ONLY
compatibleAtScreening      = NOT_ADMITTED
incompatible               = NOT_ADMITTED
routeExhaustion            = NOT_IMPLEMENTED
```

No Reference House geometry changes.

## Next gate

After merge, a fresh gate should decide whether the one bounded Croydon local-quantitative family merits an integration packet or whether the remaining uncertainty is sufficiently external that DPL-15 real-site work should begin.
