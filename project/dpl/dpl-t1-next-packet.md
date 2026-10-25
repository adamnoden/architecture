# DPL-T1 — next packet

After `DPL-T-CONTROL-004 — 41 Lennard Road` passes the geometry-first preflight, the exact next packet is:

> **DPL-T2 — 41 Lennard Road datum / street-access composition and full R1–R6 admission**

DPL-T2 may acquire only the downstream evidence now justified by the positive geometry preflight:

- authoritative elevation / topography sufficient for SCREENING datum;
- controlled physical street/access relationship;
- current planning identity/snapshot cross-check;
- final R1–R6 disposition.

If all six dimensions are positively evidenced, DPL-T2 may emit `CONTROL_SITE_CANDIDATE_AUTHORING_READY` and authorise a separate candidate-authoring packet.

DPL-T2 must not author the candidate itself, mutate the Reference House, infer title/private rights, emit `COMPATIBLE` or whole-site `INCOMPATIBLE`, or enter the control into DPL-16 sampling.
