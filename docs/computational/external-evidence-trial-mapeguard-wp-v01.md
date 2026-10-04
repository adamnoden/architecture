# External Evidence Trial 01 — Mapei Mapeguard WP System

**Status:** completed structured product/system-evidence trial  
**Date:** 2026-10-04  
**Applies to:** [WZ-BSM-01 — Bonded Sheet-Membrane Wet Room](wet-zone-family-bonded-sheet-v01.md)  
**Purpose:** test whether the compiler's evidence/provenance model can scope real public manufacturer evidence without converting a product brochure into a whole-building proof.

## 1. Trial question

Can a real proprietary wet-room system be represented as external evidence strongly enough that the compiler can answer:

- what exact propositions the evidence supports;
- which model conditions it applies to;
- which accessories and substrate assumptions are part of the system;
- which claims remain outside the manufacturer's evidence;
- what changes make the evidence stale;
- whether a product substitution is genuinely equivalent rather than merely similar?

The selected reference package is Mapei's UK **Mapeguard WP System**, centred on Mapeguard WP 200.

This is an evidence-model test, not a product endorsement or permanent project specification.

## 2. Source set

The trial uses current public Mapei UK material available in October 2026.

### EVD-WZ-001 — Mapeguard WP 200 UK product page / technical data

Supports, within its stated conditions:

- identity of Mapeguard WP 200;
- intended internal waterproofing/anti-fracture use;
- domestic/hotel bathrooms and private/commercial showers as example applications;
- compatibility categories for moisture-sensitive and mineral substrates;
- basic material/properties and installation recommendations.

Source:

https://www.mapei.com/gb/en/products-and-solutions/products/detail/mapeguard-wp-200

### EVD-WZ-002 — Mapeguard WP Adhesive UK product page

Supports:

- identity and intended role of Mapeguard WP Adhesive;
- sealing/bonding overlaps of Mapeguard WP 200;
- bonding/sealing Mapeguard ST, IC, EC and PC accessories;
- wall/floor application role.

Source:

https://www.mapei.com/gb/en/products-and-solutions/products/detail/mapeguard-wp-adhesive

### EVD-WZ-003 — Mapeguard WP System technical manual / brochure

Supports the **system relationship** between components, including:

- Mapeguard WP 200 membrane;
- WP Adhesive;
- ST sealing strip;
- IC / EC corner pieces;
- PC pipe collars;
- compatible substrate adhesives;
- drain / shower interface examples;
- tiled finish build-up.

Source:

https://cdnmedia.mapei.com/docs/librariesprovider2/lines-technical-documentation/brochure-mapeguard-wp-system-12-2024-en.pdf

### EVD-WZ-004 — Mapei UK outline specification LR/OS013/2025

This is particularly useful to the compiler because it states an installation sequence and dependencies rather than merely describing a product.

It requires, among other things:

- dry, stable, sound, flat substrate;
- substrate-specific preparation/primer where applicable;
- WP 200 bonded with a suitable Mapei adhesive;
- sheet overlap of at least the stated system width;
- overlaps sealed with WP Adhesive;
- floor/wall and sheet junctions sealed with ST;
- IC/EC at corners;
- PC accessories around pipes;
- a defined drain-junction sealing method;
- compatible tiling adhesive.

Source:

https://cdnmedia.mapei.com/docs/librariesprovider12/default-document-library/mapeguard-wp-system---outline-specification.pdf

### EVD-WZ-005 — product/system assessment / declaration source

Where a project relies on an ETA/DoP or other formal technical assessment for acceptance, the exact applicable document, revision and declared intended use must be included in the project evidence package.

A historic/current Mapeguard WP system declaration identifies ETA 15/0257 for the flexible wet-room sheet system. The compiler must retain the exact document actually relied upon at project time rather than merely storing the number.

This trial does **not** treat the ETA identifier alone as proof of the complete installed bathroom.

## 3. What the evidence proves

Within matching model conditions, the package can credibly support propositions such as:

~~~text
PRODUCT = Mapeguard WP 200
INTENDED USE includes internal wet-area waterproofing under supported finishes
SYSTEM ACCESSORIES include ST / IC / EC / PC / WP Adhesive
PIPE PENETRATION has an evidence-backed accessory route
CORNER / JUNCTION has an evidence-backed system route
SHEET OVERLAP has an evidence-backed bonding/sealing route
SUBSTRATE must satisfy declared preparation / compatibility conditions
FINISH ADHESIVE must satisfy the declared system route
~~~

That is already useful.

It turns a vague source condition:

> waterproof the bathroom

into a traceable network of product/system obligations.

## 4. What it does not prove

The same evidence package does **not** prove:

- that the floor has adequate falls;
- that the drain is correctly sized hydraulically;
- that the selected drain geometry actually matches the detailed membrane transition;
- that the floor structure can accommodate the recess/opening;
- that the installer followed the specification;
- that there are no accidental punctures after membrane inspection;
- that the room passes accessibility requirements;
- that the shower valve remains maintainable;
- that the physical installation is watertight;
- that another manufacturer's membrane/accessories are interchangeable;
- that the whole building complies with Building Regulations.

Those are separate obligations/evidence items.

This is the central success condition of the trial: **real evidence becomes more useful when its authority is narrowed rather than inflated.**

## 5. Evidence object

A useful machine-independent representation is approximately:

~~~text
EvidenceItem
  id: EVD-WZ-003
  class: manufacturer-system-technical-evidence
  issuer: Mapei UK Ltd
  title: Mapeguard WP System technical manual
  source_uri: <public source>
  retrieved_at: 2026-10-04
  product_family: Mapeguard WP System
  supported_claims:
    - membrane intended for supported internal wet-area use
    - system component relationships
    - seam/corner/pipe treatment route
    - selected drain-interface route
  applicability:
    - substrate ∈ supported/prepared substrate set
    - membrane = compatible WP-system membrane
    - accessories = compatible WP-system accessories
    - installation follows cited system detail
  excludes:
    - structural adequacy
    - drainage hydraulic design
    - installer workmanship
    - physical watertightness verification
  depends_on:
    - product identity
    - substrate identity/condition
    - accessory identities
    - relevant interface geometries
    - document revision
~~~

The syntax is illustrative only.

## 6. System evidence versus component evidence

This trial exposes an important evidence distinction.

### Component claim

Example:

> Mapeguard WP 200 is intended for internal wet-area waterproofing.

This can be supported by the product technical data.

### System claim

Example:

> this wall/floor corner using WP 200 + ST + WP Adhesive + IC is a supported Mapeguard system detail.

This depends on multiple components and their relationship.

### Installed-instance claim

Example:

> the north-east corner of bathroom B-02 was installed in conformity with that detail.

This additionally requires physical/as-built evidence.

The compiler must not collapse these three scopes.

## 7. Applicability test — baseline H1 wet room

Assume a future H1 wet-room occurrence with:

- stable cement-based tile backer / mineral substrate;
- Mapeguard WP 200 over the defined wet boundary;
- Mapeguard WP Adhesive at system seams/details;
- ST at wall/floor junctions;
- IC/EC at applicable corners;
- PC at pipe penetrations;
- evidence-backed drain interface;
- compatible Mapei C2/R2-class substrate/tile adhesive route as applicable;
- tiled finish.

Result:

**PRODUCT/SYSTEM APPLICABILITY: PLAUSIBLE / SCOPED PASS SUBJECT TO EXACT TECHNICAL DOCUMENT AND DETAIL SELECTION**

Still unresolved:

- floor falls;
- structural recess/opening;
- exact drain product/interface;
- actual installation evidence.

This is the correct result.

## 8. Mutation tests

### EVD-M01 — substitute the membrane brand only

Change:

Mapeguard WP 200 → another bonded sheet membrane.

Keep:

- WP Adhesive;
- ST;
- IC/EC;
- PC;
- drain detail.

Expected:

- EVD-WZ-001 applicability fails;
- Mapei system-evidence claims depending on WP 200 fail/stale;
- geometry unchanged;
- generic WZ-BSM-01 family may remain viable;
- alternate product-system evidence required.

**PASS — selective evidence invalidation is intelligible.**

### EVD-M02 — substitute only the pipe collar

Replace Mapeguard PC with an unrelated generic collar.

Expected:

- pipe-penetration system evidence stale;
- other membrane field/corner evidence may remain current;
- whole wet-boundary release fails until equivalent compatibility is evidenced.

**PASS.**

### EVD-M03 — change substrate

Stable cement board → ordinary gypsum plasterboard.

Expected:

- substrate applicability/preparation re-evaluates;
- Mapei's product evidence may still permit some gypsum substrates under defined conditions;
- H1 generic family preference for moisture-robust substrate is a separate doctrine/family rule and may reject the baseline even where manufacturer evidence is technically permissive.

This is a valuable demonstration:

> **manufacturer applicability and project/doctrine acceptability are different validity dimensions.**

**PASS.**

### EVD-M04 — add a new pipe after membrane inspection

Expected:

- product family can theoretically support a collar detail;
- existing as-built membrane evidence becomes stale;
- new penetration occurrence + collar evidence + new inspection required;
- unrelated corners remain current.

**PASS.**

### EVD-M05 — move the drain

Expected:

- membrane field product evidence remains potentially current;
- drain-transition detail applicability and floor-fall evidence stale;
- structural opening may stale independently.

**PASS.**

### EVD-M06 — newer manufacturer document issued

Expected:

- previous evidence does not disappear from a historical released build;
- new compilation/project target must decide whether the previous revision remains acceptable/applicable;
- source URI alone is insufficient: evidence needs document identity/revision/retrieval/version metadata.

**PASS.**

## 9. Substitution rule

The compiler must not implement:

~~~text
category = waterproof membrane
→ any waterproof membrane may substitute
~~~

Instead, substitution asks whether the proposed replacement carries enough evidence to discharge the same scoped obligations.

Conceptually:

~~~text
OLD SYSTEM
  membrane A
  adhesive A
  tape A
  corners A
  collars A
  drain detail A

NEW SYSTEM
  membrane B
  ???

RESULT
  NOT EQUIVALENT YET
  missing evidence for seam/corner/penetration/drain relationships
~~~

This is directly aligned with the Long-Life House preference for ordinary replaceable parts **without pretending interfaces are generic when they are not**.

## 10. Evidence dependency graph

A simplified dependency graph is:

~~~text
SUBSTRATE TYPE / CONDITION
      ↓
SUBSTRATE ADHESIVE / PREP
      ↓
WP 200 FIELD MEMBRANE
      ├───────────┬───────────┬────────────┐
      ↓           ↓           ↓            ↓
   SEAMS        CORNERS     PIPE COLLARS   DRAIN INTERFACE
      │           │           │            │
      └───────────┴───────────┴────────────┘
                      ↓
              WET BOUNDARY CONTINUITY
                      ↓
            PHYSICAL INSTALLATION EVIDENCE
~~~

The field membrane is necessary but insufficient.

## 11. Evidence lifecycle

The product/system package should move through at least:

~~~text
CANDIDATE
  ↓ exact product/system selected
APPLICABLE TO DESIGN
  ↓ installed + inspected
INSTANCE EVIDENCE AVAILABLE
  ↓ accepted into release manifest
RELEASE EVIDENCE
  ↓ later relevant alteration
STALE / SUPERSEDED
~~~

A manufacturer page remains reference evidence. It never turns itself into as-built evidence.

## 12. Trial verdict

This trial **passes C-032I's structured real external-evidence test at product/system scope**.

It demonstrates that the current evidence architecture can:

- identify real sources;
- distinguish component/system/installed-instance scope;
- record applicability;
- keep architectural/project rules distinct from manufacturer permission;
- invalidate selectively after substitutions and geometry changes;
- preserve historical evidence revisions;
- refuse to inflate a manufacturer system specification into a whole-building proof.

It also exposes one implementation requirement for later:

> evidence dependencies must be relationships, not just document attachments on objects.

A PDF stored against “Bathroom 01” is not enough.

## 13. H1 consequence

Together with WZ-BSM-01, this trial closes two pre-H1-PAPER internal research tasks:

- first ordinary wet-zone waterproofing family;
- first structured real external product/system-evidence exercise.

The remaining obvious ordinary-family blocker before H1-PAPER source freeze is:

**C-019B — controlled external-envelope service penetration.**

External competent review and real project calculations remain release-level obligations, not prerequisites for a paper fixture intended to expose them.

## 14. Source anchors

- Mapeguard WP 200 UK: https://www.mapei.com/gb/en/products-and-solutions/products/detail/mapeguard-wp-200
- Mapeguard WP Adhesive UK: https://www.mapei.com/gb/en/products-and-solutions/products/detail/mapeguard-wp-adhesive
- Mapeguard WP System UK: https://www.mapei.com/gb/en/products-and-solutions/products/detail/mapeguard-wp-system
- Mapeguard WP System technical manual: https://cdnmedia.mapei.com/docs/librariesprovider2/lines-technical-documentation/brochure-mapeguard-wp-system-12-2024-en.pdf
- Mapei UK outline specification LR/OS013/2025: https://cdnmedia.mapei.com/docs/librariesprovider12/default-document-library/mapeguard-wp-system---outline-specification.pdf
