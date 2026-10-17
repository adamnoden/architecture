<!-- nav-exclude: redirect -->
# DRW-00C — physical publication format contract

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-00C  
**Status:** DONE pending branch validation  
**Issue:** #154

## 1. Purpose

Freeze the physical assumptions that architectural drawings must respect before DRW chooses visual doctrine, drawing scales or page classes.

This record deliberately distinguishes three things that must not be collapsed:

1. **current deterministic proof format** — what the repository builds today;
2. **authorised PR-02 object direction** — what the private physical edition is intended to become;
3. **open production variables** — facts that depend on final trim, stock, printer and binder and therefore must not be invented by DRW.

The governing rule is:

> **Design drawings in physical paper units for a portrait sewn book, prove them on the current A4 pipeline, and do not treat A4 as the final trim unless PR-02 later makes that decision.**

## 2. Current deterministic publication format — CONTROLLED

The current Working Edition / Primer pipeline is a portrait **A4 duplex-first** publication.

`publication/vivliostyle.config.js` sets `size: 'A4'`. The generated DRW-00B proof confirms both current PDFs as 595.276 × 841.89 pt A4 pages.

`publication/theme.css` encodes mirrored duplex margins:

| Dimension | Current A4 proof value |
|---|---:|
| Top | 23 mm |
| Bottom | 24 mm |
| Inner / binding side | 30 mm |
| Outer | 22 mm |

The left-page rule is 22 mm left / 30 mm right and the right-page rule is 30 mm left / 22 mm right. This creates a deliberate **8 mm inner-margin premium** for the binding side in the current proof object.

Major front matter / Part starts are forced to recto where encoded, and intentional blank pages suppress running matter. This is a real duplex reading model rather than a stack of unrelated screen pages.

These values are **controlled as the current proof baseline**, not frozen as the final private-edition dimensions.

## 3. Current proof object — CONTROLLED before-state

DRW-00B records the current generated object as:

- Working Edition: **217 A4 pages**;
- Primer: **15 A4 pages**;
- 11 current figure placements;
- black/greyscale-safe visual system with no required colour dependency.

Page count is an output of the current content and pagination. It is not a design quota.

Earlier publication planning discussed roughly 300–500 pages / around 400 for the private object, but PR-00H already rejected page-count expectation as a manuscript quota when the controlled candidate was 212 A4 pages. The current 217-page object is therefore not to be padded merely to satisfy the old planning range.

## 4. PR-02 physical-object direction — AUTHORISED BUT NOT FULLY DIMENSIONED

Issue #71 and the publication credibility/release programme currently authorise the following private-object direction:

- **12 premium hardback copies**;
- portrait book;
- trim **larger than A5 and smaller than A4, approximately B5 territory**;
- thread-sewn binding;
- substantial boards;
- premium warm off-white / warm uncoated stock;
- black-only text, diagrams and illustrations;
- deep oxblood cloth;
- blank front and back boards;
- small dull-gold serif `OVID’S HOUSE` spine title only;
- warm grey / cream endpapers;
- no dust jacket;
- no ISBN/barcode, URL, social handles, author photograph or author-brand clutter;
- minimal colophon;
- approximately £1,500 planning allowance for 12 copies, explicitly not a printer quotation.

For DRW, only a subset directly constrains drawings:

1. **portrait physical object** is the default orientation;
2. **thread-sewn hardback** means drawings must be designed for facing-page reading and a real binding zone, not edge-to-edge screen presentation;
3. **B5-territory final trim** means A4 legibility is necessary but not sufficient — drawing text/line hierarchy must survive a smaller final page;
4. **warm uncoated stock + black-only reproduction** means fine greys, hairlines and dense hatching require physical proof rather than screen judgement;
5. **premium restrained object** argues against decorative colour dependence or presentation-board graphics masquerading as architectural drawings.

The cloth, foil, endpaper and cover constitution is important to PR-02 but does not set the internal drawing geometry at DRW-00C.

## 5. Open production inputs — MUST NOT BE INVENTED

The following are **OPEN** until PR-02 obtains a real production route or DRW-01D/DRW-12 has enough evidence to freeze them:

- exact final trim dimensions;
- exact text-stock brand, weight, caliper, opacity and grain direction;
- exact board thickness;
- exact sewn/case-binding construction and opening behaviour;
- signature size and imposition;
- creep / shingling compensation if relevant;
- final inner-margin / gutter allowance after stock and binding are known;
- bleed requirement for any future full-bleed plate;
- printer tolerances;
- whether any specific drawing earns a rotated plate or foldout;
- final spine width;
- final production page count after DRW integration.

No renderer or plate template may hard-code guesses for these as though they were publication authority.

## 6. Drawing-space consequences frozen for DRW-01 / DRW-02

### 6.1 Physical units, not screen pixels

Line weights, type sizes, dimension ticks, hatch spacing, clearances and page safe zones must be defined in physical output units. A drawing that only works because an SVG is zoomable on screen fails the publication task.

### 6.2 Two proof scales are required

Until exact PR-02 trim is chosen:

- **A4** remains the canonical automated build/proof surface;
- a **conservative B5-territory reduction proof** must be used by DRW-01E and later plate proofs to ensure the design is not accidentally A4-dependent.

This does **not** select a final B5 trim. It is a robustness test against the already-authorised smaller-than-A4 physical direction.

### 6.3 Page-class hierarchy

The physical book remains portrait. Plate preference is therefore:

1. portrait single-page plate;
2. paired facing pages;
3. true two-page spread;
4. rotated plate only when materially superior;
5. foldout only if a specific drawing later earns the manufacturing complexity.

This hierarchy comes from the DRW programme and is now bound to the PR-02 physical-object direction.

### 6.4 Binding-safe composition

The current A4 proof uses 30 mm inner / 22 mm outer margins. That asymmetry is evidence that the composition already recognises a binding side.

DRW-01D must define a **semantic gutter safe zone** for drawings and captions rather than assuming the current 30 mm is the final physical answer. Critical geometry, dimensions, labels and keys may not depend on the visually lost centre of a spread.

### 6.5 Monochrome first

Every required architectural distinction must survive black-only reproduction. If a later optional accent colour is tested, it may reinforce hierarchy but must not carry unique meaning.

## 7. What this packet does not do

DRW-00C does not:

- choose the exact private-edition trim;
- commission a printer or binder;
- select paper or binding products;
- redesign the existing book theme;
- define final drawing line weights, fonts, scales or page templates;
- decide current figure disposition;
- change PR-02 budget or copy allocation;
- convert the current A4 working PDF into the final physical-object file.

Those decisions belong to their named downstream packets / PR-02.

## 8. Handoff

**Next packet: DRW-00D — classify the current eleven figures as retain / replace / demote / remove and close the DRW-00 baseline gate.**

DRW-00D must judge visual function and architectural adequacy against the authority and format contracts now frozen. It must not yet implement replacements.