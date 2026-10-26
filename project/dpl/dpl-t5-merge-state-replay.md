# DPL-T5 — merge-state replay identity reconciliation

**Parent packet:** DPL-T5 / #763 / PR #766  
**Recorded by:** DPL-T6  
**Date:** 2026-10-25  
**Purpose:** preserve the distinction between T5 branch-time output identity and the actual landed/current generic-runtime replay.

## Why this record exists

The T5 branch froze deterministic runtime identities before merge while `main` was moving in parallel.

T5 then landed by merge commit:

`7c693a379d6f0e98d82d8d43a74ad3be6cb755a6`

The Lennard evidence, authored candidate and T4 verification did not change. However, the generic DPL runtime semantics present in the merged tree were newer than the branch-time runtime against which the original T5 fingerprints had been recorded.

DPL-T6 replays the landed T5 case through that actual current runtime and therefore observes different aggregate identities.

This is deterministic identity invalidation doing its job. It is **not** evidence drift and it does not author a different candidate.

## Branch-time T5 identities

These remain historical evidence of the T5 branch state and must not be silently rewritten as though they were the landed/current runtime result:

```text
manifest
  d45dda4d1c7faa46aaf08e773671590cf78a2bc7335079dfebec81091a56145b

source set
  a6af74fed8e78faa84bdcb3dcc28d2f245b74585f2a2024a3cec5ff729ce76d0

deployment case
  791cb427364d32208a00d02d7b42f2b472a64023e0e1b2eed58215e37fee52f3

deployment result
  3f2fdfb9573a31bfdf33fc418169f49d83cad303830e4e9a56370c65e22608f9

T5 result
  c858fcac7b7481f43c33e49cf7e092ca749467370d75e7903973c1887401ecdf
```

## Landed/current T5 replay identities

The T6 entry replay of the unchanged T5 real-control manifest and candidate produces:

```text
manifest
  7541bf23840f81af9089e7ce5fadbe62456ed9b51f0c9e2d1e601db9ee25bced

source set
  d3e08dfc8d411ff54dbd4d462878540a70c3b24bdd2729fcd35210df3d8242c9

deployment case
  e10a8fe8cc458a39254e3c8b82b0d64216b13fd74b69a87b9a945b06ae6aa475

deployment result
  2557f147639ae1eebd34fd4ca8d01893996b634047c98be4ca206798bf971984

T5 result
  bf04feb48795c0f5fddda5d9ddbe944428f06a52fd2afebc857a3b1bde1cf009
```

The T6 parent lock binds the second set.

## Semantic changes visible in replay

The substantive T5 outcome is unchanged:

```text
obligations     = 29
UNRESOLVED      = 27
UNSUPPORTED     = 2
FAIL            = 0
PASS            = 0
raw unresolved  = 45
candidate       = 5 CONFORMS / 20 OPEN
real claims     = 17 / 17 mapped
coverage        = 18 owner families
```

The newer runtime classifies applicability as:

```text
APPLIES       = 22
UNRESOLVED    = 7
NOT_APPLICABLE= 0
```

and exposes the 45 unresolved inputs through the newer typed `candidateConformance.*`, `proposal.*` and `site.*` namespaces.

That richer unresolved-input typing is exactly what makes DPL-T6's classification work possible.

## Proof boundary

```text
Lennard evidence changed             = NO
T3 candidate changed                 = NO
T4 verification changed              = NO
Reference House mutation             = NO
branch-time T5 history rewritten     = NO
landed/current T5 identity reconciled= YES
whole-site compatibility             = NOT_ADMITTED
DPL-16                               = HELD
```
