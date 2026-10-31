<!-- nav-exclude: redirect -->
# DRW-11E — Parts I–III figure audit

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-11E  
**Status:** DONE pending validation  
**Issue:** #154  
**Fresh base:** `5ee084e93ff268c7e29b5e14fbad51585a917e11`  
**Branch:** `drw-11e-early-book-figure-audit-v3`

## 1. Result

The five surviving Parts I–III figures all continue to earn a place in the book, but none of the current SVG artifacts is accepted unchanged.

Frozen disposition:

- **RETAIN as-is:** 0
- **REDRAW:** 5
- **DELETE:** 0

This is not a reversal of DRW-02B. Their **reader tasks, abstract status and editorial positions remain authorised**. The redraw decision is narrower: all five predate the physical-paper drawing doctrine and are authored as large screen-oriented viewBoxes with unitless internal type. In the current `FLOW` layout that text scales with the image and falls materially below the physical typography established and proved by DRW-01.

The redraws therefore preserve the ideas and, where sound, the compositions. They must not turn the early book into a second Part IV plate sequence.

## 2. Authority and admission gate

DRW-02B already established that Parts I–III are proposition/doctrine/pattern/evidence rather than Reference House inspection. It explicitly authorised abstract figures where the claim is abstract and rejected the idea that every such figure should be replaced by a plan, section or detail merely because architectural linework looks more serious.

DRW-02E then kept the five figures in `FLOW`: sparse explanatory instruments inside prose, subordinate to the reading sequence. Part IV remains the architectural visual climax.

Those decisions remain controlling.

DRW-11E therefore asks a different question:

> **Does each surviving abstract figure still earn its reader task, and does its actual artifact meet the mature publication's physical and editorial drawing grammar?**

A redraw is admitted only for a concrete defect. Visual uniformity by itself is not a defect.

## 3. Evidence snapshot

Parallel DPL work moved `main` twice while DRW-11E was being audited. The packet was therefore re-cut rather than rebased casually. The fresh base is `5ee084e93ff268c7e29b5e14fbad51585a917e11`.

The intervening DPL changes from the original DRW-11E lease touch only DPL programme records; they do not change the five SVG blobs or their `publication/figures.ts` placements. The figure evidence is therefore byte-identical at the fresh base.

| Part | Reader-facing figure | Blob SHA |
|---|---|---|
| I | `docs/manuscript/figures/selective-permanence-platform.svg` | `8abf5a2298134a9967e081b857484c8e8fe22128` |
| II | `docs/manuscript/figures/designed-interface-functions.svg` | `d8a4c0382479f45e554f7da409fd0b7fb067a291` |
| II | `docs/manuscript/figures/failure-architecture-sequence.svg` | `293accf77ce355423122536b9290b885900763ec` |
| II | `docs/manuscript/figures/maintenance-geography-route.svg` | `23fc7bb35ff9b4d0bb3e4728e9004b4240a6ce3b` |
| III | `docs/manuscript/figures/pattern-language-fields-sequence.svg` | `41eee9d86282c4024ed32040732226838ba349c6` |

The publication registry continues to give each figure a bounded caption that prevents the diagram from pretending to be a construction detail, literal service topology or canonical taxonomy.

## 4. Physical typography gate

DRW-01B/01E froze and physically proved the ordinary architectural text roles at:

- principal labels: **7.5 pt**;
- notes/dimensions/levels: **6.5 pt**.

DRW-01E deliberately proved both A4 and conservative ISO B5 without shrinking those roles. Its accepted abstract `FLOW` specimen is also physically authored: the SVG declares an `86 mm` width with a same-number `viewBox`, so its internal user-space typography has a paper-space relationship rather than an arbitrary screen viewport.

DRW-03C.1 later reinforced the same principle after browser/PDF embedding exposed a unit-boundary failure in controlled SVG text: physical type intent must survive serialization and publication embedding, not merely look plausible in source.

The five legacy figures do not have that contract. They use large abstract viewBoxes (`1400–1600` units wide), omit a physical SVG width, and rely on unitless/pixel-like internal font sizes. `publication/theme.css` then applies `max-width: 100%`, so the whole artifact—including its text—scales to the available prose width.

For a generous upper-bound check, placing each figure at the full **158 mm** A4 prose width produces approximate smallest internal text of:

| Figure | Smallest authored type | Approx. at 158 mm |
|---|---:|---:|
| selective permanence | 18 / 1400 | **5.76 pt** |
| designed interface | 19 / 1500 | **5.67 pt** |
| failure architecture | 17 / 1500 | **5.08 pt** |
| maintenance geography | 17 / 1500 | **5.08 pt** |
| pattern fields + sequence | 16 / 1600 | **4.48 pt** |

At the **138 mm** nominal B5 content width used by the DRW-01E robustness surface, the same smallest roles would fall to approximately **5.03, 4.95, 4.43, 4.43 and 3.91 pt** respectively.

These are best-case width calculations, not measurements of a particular page placement: any narrower inline placement makes them smaller. The important defect is structural. The figures have no physical type-size invariant, so the mature publication cannot prove their legibility the way it proves controlled drawings and the accepted FLOW specimen.

This is sufficient redraw authority. DRW-11E does **not** lower the frozen 6.5/7.5 pt drawing roles to rescue legacy artifacts.

## 5. Figure-by-figure decisions

### DRW-11F-1 — selective permanence and the architectural platform

**Disposition: REDRAW — preserve concept and hierarchy.**

The figure still earns its place. It makes the slow-to-fast separation between permanent fabric, interfaces and replaceable systems perceptible faster than prose alone, and its right-hand change arrows make the ordinary-renewal boundary explicit.

The current stacked-band composition is restrained and does **not** materially read as presentation UI. The defect is physical: its smallest explanatory type falls below the mature paper-space contract when the SVG is embedded at book width.

11F-1 should therefore re-author the figure in physical paper space, preserving the temporal/layer hierarchy and avoiding added decoration or architectural pseudo-detail.

### DRW-11F-2 — designed-interface functions

**Disposition: REDRAW — preserve functional decomposition.**

The figure continues to answer a unique question: what duties must a designed interface allocate between two assemblies? The central schedule reads as technical/editorial decomposition rather than a construction detail, and the existing caption correctly bounds it.

Its rectangle grammar is acceptable in principle; it need not be replaced by a junction detail. The redraw is admitted because the embedded type is not physically controlled and drops below the established minimum at prose-page widths.

11F-2 should preserve the Assembly A → interface duties → Assembly B logic while reducing any text that merely repeats the caption.

### DRW-11F-3 — failure architecture sequence

**Disposition: REDRAW — preserve causal sequence, reduce embedded prose.**

The figure still provides non-duplicative value by showing the transition from first defence to designed second consequence and then recovery. A generic wet-room drawing would over-specialise this doctrine.

The current flowchart is monochrome and conceptually disciplined, but several explanatory roles become materially too small in print. Some embedded prose also does work now better carried by the adjacent caption.

11F-3 should preserve the causal sequence, enlarge/physically bind the essential labels, and remove explanatory text that is not needed inside the graphic.

### DRW-11F-4 — maintenance geography route

**Disposition: REDRAW — preserve the four-geometry composition.**

This is the strongest existing early-book composition. The four small plan-like diagrams turn `approach → working space → disconnection → withdrawal` into spatial tasks rather than a detached process chart. It is already close to the mature architectural/editorial register and should not be conceptually reinvented.

It nevertheless fails the same physical type-size contract, with its smallest roles scaling well below the mature minimum.

11F-4 is therefore a conservative physical redraw: retain the four geometries, increase/physically bind essential labels and strip any redundant bottom-note copy before considering structural change.

### DRW-11F-5 — pattern-language fields and generative sequence

**Disposition: REDRAW — preserve the two-structure distinction, materially simplify/reflow.**

The figure remains useful because it shows two things that prose alone makes difficult to hold simultaneously: the five editorial reading fields on one side and one generative service-topology sequence on the other, including rewind.

This is the one figure with a second defect beyond typography. Its dense field boxes plus a tall stack of sequence boxes approach the presentation-deck / systems-map grammar that the mature programme explicitly rejects. At book width it also has the worst physical type result, with several roles in roughly the 4–5 pt range and the smallest near 3.9 pt on the conservative B5 width calculation.

11F-5 should preserve the distinction between **editorial fields** and **one generative sequence**, but materially simplify and reflow it. The redraw must not imply that the fields are a taxonomy, that the sequence is universal, or that held candidates belong to the canonical count.

## 6. Common redraw constraints

Every DRW-11F-n packet must obey these frozen constraints:

1. **Remain `FLOW`.** No early-book figure becomes a plate merely to imitate Part IV.
2. **Preserve reader task before form.** The authorised concept/caption is the starting authority; redesign may not manufacture new architectural claims.
3. **Author for physical paper space.** Essential figure text must survive both current A4 and conservative B5-territory proof without depending on screen zoom.
4. **Do not rescue density by shrinking type.** Reflow, omit redundant embedded prose or simplify the composition instead.
5. **Black-only meaning.** No colour is required to understand the figure.
6. **No presentation-deck grammar.** Avoid decorative cards, pill UI, giant internal headings, floating panels and ornamental dashboard framing.
7. **No false architecture.** Abstract doctrine stays abstract where DRW-02B already established that a plan/section/detail would overclaim.
8. **One figure per packet.** Each redraw is independently reviewable and restart-safe.
9. **Physical proof before acceptance.** Source inspection or browser appearance alone is insufficient.
10. **Controlled artifact discipline.** Accepted SVG bytes and their generation/authorship path must be unambiguous in the repository; no ignored/generated-file false proof.

## 7. Deletion gate

**No figure is deleted.**

Deletion would remove a distinct explanatory task in every case and is not justified by the later Part IV drawing family. The analytical/architectural drawings prove the Reference House; these five figures explain doctrine and method before that case study begins.

The correct response to their legacy implementation is therefore to redraw them narrowly, not to erase the early book's visual reasoning or turn it prematurely into house-specific architecture.

## 8. Programme accounting

DRW-11E discovers five accepted redraw packets:

- DRW-11F-1 — selective permanence;
- DRW-11F-2 — designed interface functions;
- DRW-11F-3 — failure architecture sequence;
- DRW-11F-4 — maintenance geography route;
- DRW-11F-5 — pattern fields + generative sequence.

Under the programme's dynamic packet accounting, the denominator therefore moves from **80 → 85** once this decision packet is accepted. DRW-11E itself then closes as packet **74 / 85**; each 11F packet increments the completed numerator independently.

DRW-11G remains the family gate after all accepted redraws are complete. It must judge the five figures together and refuse any family-level drift back toward presentation-deck information design.

## 9. Handoff

**Next authorised packet: DRW-11F-1 — physically re-author the selective-permanence/platform figure while preserving its existing reader task and restrained band hierarchy.**

Do not redesign all five figures in one pass. Each must earn its own artifact, proof and closeout before the next begins.
