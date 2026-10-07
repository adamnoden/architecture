# Patterns

<script setup>
import { data as patterns } from './patterns.data'

const activePatterns = patterns.filter((pattern) => pattern.state === 'active')
const retiredPatterns = patterns.filter((pattern) => pattern.state === 'retired')
</script>

This area holds the reusable architectural responses developed from the doctrine.

The project now has an evidence-qualified **pattern language**: stable pattern identities, sparse typed relationships and separate generative sequences. Phase 7 has completed canonical pattern identity migration; the remaining work is to normalise non-pattern material, reconcile the Reference House/publication, and add only lightweight validation tooling.

Pattern identity is independent from evidence maturity. A pattern can have a stable place in the language while still requiring calculation, prototype work or professional review.

## Active canonical patterns

<div v-if="activePatterns.length">
  <ul>
    <li v-for="pattern in activePatterns" :key="pattern.id">
      <a :href="pattern.url"><code>{{ pattern.id }}</code> — {{ pattern.title }}</a>
      <span> · {{ pattern.evidence }}</span>
    </li>
  </ul>
</div>

## Retired identities

<div v-if="retiredPatterns.length">
  <ul>
    <li v-for="pattern in retiredPatterns" :key="pattern.id">
      <a :href="pattern.url"><code>{{ pattern.id }}</code> — {{ pattern.title }}</a>
    </li>
  </ul>
</div>

Retired IDs remain visible for provenance and are never reused.

## Non-pattern layers

Not every useful recurring proposition belongs in the pattern graph.

- [Strategies](strategies/) hold broad approaches whose valid physical responses differ too much to form one pattern.
- [Held Pattern Candidates](candidates/) hold plausible future patterns whose evidence, scope, domestic proportionality or physical quality has not yet crossed the admission gate.
- implementation families and prototypes remain in their research/prototype records rather than being promoted by naming.

These distinctions are intentional. They keep the language small enough to mean something.

## Language and migration controls

- [Pattern Language — Model and Authoring Contract](language-model.md)
- [Service Topology — Generative Sequence](service-topology-sequence.md)
- [Phase 7 Migration Plan](../development/pattern-language-phase7-plan.md)
- [Pattern-Language Overhaul Control](../development/pattern-language-overhaul.md)
- [Phase 6 Gate Review](../development/pattern-language-phase6-review.md)
- [Phase 6 Corpus Audit](../development/pattern-language-corpus-audit.md)

## Migration provenance

These pages remain available because they preserve the path by which the language was derived. They are not competing canonical sources:

- [Core Pattern Catalogue](core-12.md) — legacy aggregate prose for the original Core 12;
- [Service-Topology Pilot](pilot/README.md) — the first linked language experiment;
- [Reversible Assembly Candidates](reversible-assembly-candidates.md) — legacy mixed strategy/candidate/implementation material now being normalised;
- [Accessible Vertical Service Zone — pre-admission candidate](candidates/accessible-vertical-service-zone.md) — provenance for canonical `HSA-P-014`.

The generated lists above derive from canonical pattern frontmatter. Do not maintain a second manual ID registry here.