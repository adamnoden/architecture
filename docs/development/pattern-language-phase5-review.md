# Pattern-Language Overhaul — Phase 5 Gate Review

**Decision:** **PASS — authorise Phase 6 corpus audit**  
**Scope of pass:** the pattern-language model and generative-sequence method have earned a full corpus audit. This is **not** approval to migrate every item unchanged, assign IDs indiscriminately or build graph UI.  
**Reference House input:** [Whole-House Coordination Fixture 01](../reference-house/whole-house-coordination-fixture.md)  
**Sequence run:** [Service Topology Run 01](../reference-house/service-topology-run-01.md)

---

## 1. Gate question

Phase 5 asked one question:

> **Does the proposed pattern-language + generative-sequence architecture materially improve real architectural reasoning when applied to a worked house, or does it merely add taxonomy and metadata?**

The answer is **yes, it materially improves the work**.

The method is therefore retained and the corpus audit may begin.

---

## 2. Why this is a pass

A pass required more than successfully filling out pattern templates.

The Reference House trial produced all of the following.

### A. Real project occurrences

The house now has identifiable provisional occurrences for:

- controlled utility entry;
- plant/service hub;
- horizontal service topology;
- two high-service-room service walls;
- controlled penetrations;
- physical service index.

The distinction between **pattern selected** and **project occurrence exists** has proven useful in practice.

### B. A real missing language candidate

The service sequence could not connect storeys honestly without resolving vertical distribution.

The resulting candidate, [Accessible Vertical Service Zone](../patterns/candidates/accessible-vertical-service-zone.md), passes the conceptual admission test while remaining deliberately unnumbered until the corpus audit checks overlap and naming.

This is exactly the behaviour wanted from a language: missing reusable knowledge became visible because a real design needed it.

### C. A real taxonomy correction

The current **Water-Damage-Safe Service Route** does not survive the worked-house test cleanly as one architectural pattern.

The actual house uses materially different responses:

- accessible/manifold geography at plant;
- joint-minimised / potentially pipe-in-pipe vertical runs;
- accessible short kitchen branches;
- dry-side bathroom access;
- ordinary but inspectable/testable drainage.

Their common invariant is failure performance, not one physical relationship.

**Phase-6 starting presumption:** reclassify the existing item as a **strategy**, then test whether narrower recurring patterns should sit beneath it.

### D. Real rewinds

The sequence rejected four tempting local solutions:

1. one deep mixed-services horizontal duct around the courtyard;
2. a west-side/scattered upper bathroom topology;
3. plant hidden in ordinary kitchen cabinetry;
4. blanket leak containment everywhere.

In each case the better answer was an upstream architectural correction or a more selective strategy.

This is stronger than catalogue browsing. The sequence changed what the house should do.

### E. Graph and sequence remained distinct

The worked case confirms that conceptual composition and decision order cannot be represented well as one dependency graph.

High-Service-Room Service Wall may **complete** horizontal service distribution at a finer scale, while the design sequence still examines service-wall/room adjacency before finalising the horizontal routes.

The two structures should remain separate.

### F. The architecture remained primary

The service run did not force the courtyard, principal axis or principal rooms to become technical infrastructure.

Instead it concentrated high-consequence service geography at the east/rear edge and let only proportionate dry/small-bore distribution fan outward.

That is the required relationship: the service language helps the architecture resolve itself; it does not become the architecture's master ontology.

---

## 3. Phase-5 completion package audit

| Required package | Result |
|---|---|
| provisional whole-house plan / storey relationships | **Complete for coordination** — `whole-house-coordination-fixture.md` + SVG |
| service-demand overlay | **Complete** — Service Topology Run §2 |
| utility-entry occurrence | **Complete provisionally** — `RH-P001-01` |
| service-hub occurrence + replacement geometry | **Complete provisionally** — `RH-P002-01` |
| vertical-distribution proposal + alternative | **Complete** — single zone preferred; split wet/dry comparator; no-zone option rejected |
| service-wall opportunities / rejected locations | **Complete** — `RH-P004-01/02` plus rejected principal-room/courtyard use |
| primary horizontal route + real depth logic | **Complete at coordination scale** — `HS-G-01`, `HS-U-01`, `LB-01` |
| representative crossing register | **Complete** — `CP-01..06` |
| water-failure strategy on actual routes | **Complete** — `WF-01..05` |
| initial occurrence register | **Complete** |

The package is intentionally not a technical-design package. Missing engineering and regulatory proof is recorded rather than invented.

---

## 4. What Phase 5 did not prove

The pass must not be overread.

It does **not** prove:

- that the provisional courtyard dimensions are architecturally optimal;
- that the service hub/riser dimensions are technically correct;
- that any chosen ventilation/heating/drainage system will fit without change;
- that all candidate patterns are evidence-supported enough for publication;
- that the planned 30-item catalogue is the correct final language;
- that every current pattern survives reclassification;
- that the language should become a database or software ontology;
- that the compiler should ingest pattern objects;
- that the Reference House itself proves the doctrine.

It proves only that the language/sequence architecture is useful enough to justify auditing the rest of the corpus.

---

## 5. Phase-6 mandate

Phase 6 should now classify **every current or planned reusable proposition** into the smallest correct set of categories:

- doctrine / governing principle;
- strategy;
- pattern;
- pattern candidate;
- implementation family;
- reference-house occurrence/decision;
- formal rule/obligation;
- evidence/research question;
- retire / merge / split.

For each current pattern/candidate, record:

1. current identity;
2. recommended classification;
3. whether identity survives, is renamed, split, merged or demoted;
4. likely graph relationships only where genuinely useful;
5. evidence state;
6. whether a generative sequence invokes it;
7. whether the compiler has formal consequences without treating the pattern itself as a rule;
8. migration action and risk.

### Corpus sources to audit

At minimum:

- `docs/patterns/core-12.md`;
- `docs/patterns/ground-supported-facade-access.md`;
- `docs/patterns/reversible-assembly-candidates.md`;
- the 30-item candidate inventory in `docs/manuscript/publication-architecture.md`;
- new candidate `Accessible Vertical Service Zone`;
- relevant stronger abstractions hiding inside candidate assemblies, especially seated floor / backplane / replaceable lining / floor platform.

Research documents support classification but should not be turned into pattern pages merely because they contain good ideas.

---

## 6. Phase-6 stop rules

Stop and revise the model if the audit produces any of these symptoms:

- most items require exceptions to the admission test;
- graph relationships become dense enough that almost everything links to everything;
- pattern identity depends mainly on implementation product/assembly;
- strategies are being forced into patterns to preserve the old catalogue count;
- a stable ID would conceal a genuine split in meaning;
- the language begins duplicating research, requirements or compiler rules;
- metadata work exceeds the architectural insight it preserves.

The target is **fewer, clearer, more composable concepts**, not a larger catalogue.

---

## 7. Decision

**Phase 5 PASS. Phase 6 is authorised.**

The current Reference House remains provisional and should continue developing in parallel, but it no longer blocks the taxonomy audit.

Phase 7 full migration remains blocked until Phase 6 produces and reviews the complete migration matrix.