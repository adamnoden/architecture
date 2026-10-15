# Scoped Manufacturer Evidence — Mapei Mapeguard WP

A product page or technical manual can be useful evidence without becoming proof of the whole assembly, room or building around it.

The Mapei **Mapeguard WP System**, centred on Mapeguard WP 200, provides a concrete example of how House Kernel can scope real manufacturer evidence: identify exactly what the source supports, preserve the system relationships on which that support depends, and keep all other architectural and technical obligations separate.

This is an evidence-modelling example, not a product endorsement or permanent Reference House specification.

## Source package

The example uses public Mapei UK material current to the recorded source set.

### Mapeguard WP 200 product information

Within its stated conditions, the product information supports claims concerning:

- product identity;
- intended internal wet-area waterproofing and anti-fracture use;
- example applications including bathrooms and showers;
- substrate compatibility categories;
- material properties and installation recommendations.

### Mapeguard WP Adhesive product information

Supports the identity and intended role of the adhesive in bonding and sealing overlaps and compatible system accessories.

### Mapeguard WP System technical manual

Supports the relationship among system components such as:

- Mapeguard WP 200 membrane;
- WP Adhesive;
- sealing strip;
- internal/external corner pieces;
- pipe collars;
- compatible substrate adhesives;
- selected drain/shower interface examples;
- tiled finish build-up.

### Mapei UK outline specification

This is particularly valuable evidence because it describes dependencies and installation sequence rather than simply advertising a product.

It establishes conditions concerning substrate preparation, bonding, overlaps, junction strips, corner pieces, pipe collars, drain treatment and compatible finish adhesives within the cited system.

### Formal assessment / declaration material

Where a real project relies on an ETA, DoP or another formal assessment, the exact document and revision actually relied upon must become part of the project evidence set.

An assessment identifier by itself is not proof that an installed bathroom satisfies the complete system.

## What the evidence can establish

Within matching conditions, the manufacturer package can support propositions such as:

```text
PRODUCT = Mapeguard WP 200
INTENDED USE includes supported internal wet-area waterproofing
SYSTEM includes defined compatible seam / corner / penetration accessories
PIPE PENETRATION has an evidence-backed system treatment
CORNER / JUNCTION has an evidence-backed system treatment
SHEET OVERLAP has an evidence-backed bonding / sealing route
SUBSTRATE must satisfy declared compatibility / preparation conditions
FINISH ADHESIVE must follow an admitted system route
```

This is useful because it turns a vague instruction such as “waterproof the bathroom” into a network of traceable product/system conditions.

## What it does not establish

The same package does **not** establish:

- adequate floor falls;
- hydraulic drain sizing;
- exact drain geometry for a particular bathroom;
- structural adequacy of a recess or opening;
- installer workmanship;
- absence of later punctures;
- accessibility compliance;
- serviceability of concealed valves;
- physical watertightness of the installed room;
- interchangeability with another manufacturer’s membrane/accessories;
- whole-building Building Regulations compliance.

Those remain separate obligations and evidence questions.

The central rule is:

> **External evidence becomes more trustworthy when its authority is narrowed to what it actually supports.**

## Evidence object

A machine-independent representation might record:

```text
EvidenceItem
  class: manufacturer-system-technical-evidence
  issuer: Mapei UK Ltd
  product_family: Mapeguard WP System
  source_identity: exact document / page / revision
  supported_claims:
    - intended wet-area use
    - system component relationships
    - seam / corner / pipe treatment route
    - selected drain-interface route
  applicability:
    - supported prepared substrate
    - compatible membrane and accessories
    - cited installation route
  excludes:
    - structural adequacy
    - drainage hydraulic design
    - installer workmanship
    - physical watertightness verification
  depends_on:
    - product identity
    - substrate condition
    - accessory identities
    - relevant interface geometry
    - document revision
```

The syntax is illustrative. The important thing is that scope and dependencies are explicit.

## Component, system and installed-instance evidence

Three evidence levels should not collapse into one another.

### Component claim

“Mapeguard WP 200 is intended for supported internal wet-area waterproofing.”

This can be supported by product technical data.

### System claim

“This corner using compatible membrane, strip, adhesive and corner piece follows an evidenced Mapeguard system route.”

This depends on several products and their relationship.

### Installed-instance claim

“This particular bathroom corner was installed in conformity with that system.”

That additionally requires physical/as-built evidence.

A technical-data sheet can support the first two levels within scope. It cannot create the third by itself.

## Applicability example

Consider a wet-room occurrence using:

- stable compatible mineral/tile-backer substrate;
- Mapeguard WP 200 over the defined wet boundary;
- WP Adhesive at system seams/details;
- compatible strip/corner/pipe accessories;
- an evidence-backed drain interface;
- compatible substrate and tiling adhesives;
- tiled finish.

A legitimate conclusion is:

**manufacturer system evidence is potentially applicable subject to the exact cited technical documents, detail geometry and installation conditions.**

Still unresolved are floor falls, structural openings, the exact drain, physical installation and any project-specific access or compliance obligations.

That separation is the useful result.

## Selective invalidation examples

### Substitute the membrane brand

Changing only the field membrane invalidates Mapeguard-system claims that depend on Mapeguard WP 200. The room geometry may remain unchanged and a generic bonded-membrane design family may remain plausible, but alternate system evidence is required.

### Substitute the pipe collar

Changing only the pipe collar can stale the penetration-specific system evidence while leaving unrelated field-membrane or corner evidence current.

### Change substrate

A substrate change requires re-evaluation against the manufacturer’s applicability and preparation conditions. The manufacturer may permit a substrate that the project nevertheless rejects on robustness or lifecycle grounds.

> **Manufacturer applicability and project acceptability are different validity dimensions.**

### Add a penetration after inspection

A new pipe may have an available supported collar detail, yet previously accepted physical membrane evidence becomes incomplete for the changed occurrence. New system treatment and physical inspection are required; unrelated parts of the room need not become stale.

### Move the drain

Drain-transition and floor-fall evidence may become stale while field-membrane product evidence remains applicable. Structural-opening evidence can change independently again.

### New manufacturer revision

The previous document does not disappear from the historical record. A new compile or project state must decide whether the earlier revision remains applicable. A URL alone is insufficient: document identity and revision matter.

## Substitution is an evidence question

The system must not reason:

```text
category = waterproof membrane
→ any waterproof membrane may substitute
```

Instead it asks whether the proposed replacement carries enough evidence to discharge the same scoped obligations.

```text
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
  missing evidence for seam / corner / penetration / drain relationships
```

This preserves commodity replaceability where it is real without pretending interfaces are generic when they are not.

## Evidence dependency graph

The wet-boundary example can be represented approximately as:

```text
SUBSTRATE TYPE / CONDITION
      ↓
SUBSTRATE ADHESIVE / PREPARATION
      ↓
FIELD MEMBRANE
      ├──────────┬───────────┬────────────┐
      ↓          ↓           ↓            ↓
   SEAMS       CORNERS    PIPE COLLARS   DRAIN INTERFACE
      │          │           │            │
      └──────────┴───────────┴────────────┘
                     ↓
             WET-BOUNDARY CONTINUITY
                     ↓
           PHYSICAL INSTALLATION EVIDENCE
```

The field membrane is necessary but insufficient.

## Evidence lifecycle

A useful sequence is:

```text
CANDIDATE PRODUCT / SYSTEM
  ↓ exact system selected and applicable
DESIGN EVIDENCE
  ↓ installed + inspected
INSTANCE EVIDENCE
  ↓ accepted for a released state
CURRENT RELEASE EVIDENCE
  ↓ later relevant alteration
STALE / SUPERSEDED
```

A manufacturer page remains reference/design evidence. It never turns itself into as-built evidence.

## What this example demonstrates

The Mapeguard case shows that a practical evidence architecture can:

- identify real source material;
- distinguish component, system and installed-instance scope;
- record applicability;
- keep project/architectural requirements distinct from manufacturer permission;
- invalidate selectively after substitutions and geometric changes;
- preserve historical evidence revisions;
- refuse to inflate a manufacturer system specification into whole-building proof.

It also reinforces one important modelling principle:

> **Evidence dependencies are relationships, not merely document attachments on objects.**

A PDF stored against “Bathroom 01” is not enough.

## Source anchors

- Mapei UK, Mapeguard WP 200 product information.
- Mapei UK, Mapeguard WP Adhesive product information.
- Mapei UK, Mapeguard WP System technical manual.
- Mapei UK, Mapeguard WP System outline specification.

Exact source identity and revision should be retained in any real project evidence set rather than relying on these general references alone.
