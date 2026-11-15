# Removable Study floor and service skirting

[450 mm Study plan](studies/study-floor-450mm-plan.svg) · [Service skirting and shoe section](studies/study-service-skirting-section.svg)

The current compiler runs a candidate floor and skirting schedule over the furnished Study from the HAD and IAS source receipts. The native IAS study uses the same tile clipping method. The result contains room occurrences, an ADE plan and a section from the same parameters.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --study-assembly -
```

The programmatic projection accepts the published IAS pitch comparison and the ordinary or service skirting profile. A 400 to 450 mm pitch changes complete tiles from 43 to 31, exposed width from 397 to 447 mm, and full 18 mm oak wear-face mass from 1.986 to 2.518 kg. The source remains the same furnished 8.414 m² room. The fixed 400 mm bridge apparatus is withheld at 450 mm rather than scaled. Changing the skirting projection from 18 to 45 mm while retaining its 150 mm height changes the actual fixed shoe clearance from +2.5 to −24.5 mm under the same setting allowance. The service profile therefore requires a new release shoe or local demountable termination before selecting it.

Variants, exact native receipts, path and selected source identities, unknown settings and rejected alternative house provenance are checked. The clipped perimeter occurrence areas do not provide piece fabrication or mass. Installation support, wear, fire, handling loads, skirting-cable separation and access remain separate checks.

CCR-ASSEMBLY-INTEGRATION remains open. Panelling, grates and cassette options still need their own method inputs and assembled-drawing tests. The Study analysis leaves fixed product dimensions separate from candidate room configuration.

Verify the retained witness with `node --import tsx project/ccr/studies/current-projection-witnesses.ts --check`.
