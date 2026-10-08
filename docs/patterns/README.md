# Patterns

<script setup>
import { data as patterns } from './patterns.data'

const activePatterns = patterns.filter((pattern) => pattern.state === 'active')
const retiredPatterns = patterns.filter((pattern) => pattern.state === 'retired')
</script>

The pattern language records reusable architectural responses developed from the governing principles. Patterns sit between doctrine and project-specific construction: specific enough to shape design, general enough to admit materially different implementations.

The canonical language currently contains **21 active patterns**, three strategies and four held candidates. Pattern identity is independent from evidence maturity. A pattern can have a stable place in the language while still requiring calculation, prototype work or professional review.

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

## Other layers

Not every useful recurring proposition belongs in the pattern graph.

- [Strategies](strategies/) hold broad approaches whose valid physical responses differ too much to form one pattern.
- [Held candidates](candidates/) contain plausible future patterns whose evidence, scope, domestic proportionality or physical quality has not crossed the admission gate.
- implementation families and prototypes remain in their research or prototype records rather than acquiring pattern status through naming alone.

These distinctions keep the language selective and preserve the difference between a reusable architectural relationship and a particular way of building it.

## How the language works

The [Pattern Language — Model and Authoring Contract](language-model.md) defines pattern identity, evidence, relationships and admission. The [Service Topology — Generative Sequence](service-topology-sequence.md) shows how patterns can be invoked in a consequential design order without turning the graph into a universal procedure.

The Reference House records actual project selections and occurrences in its [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md). Use in that house does not increase a pattern's general evidence or maturity.

## Migration provenance

The language was derived through earlier catalogue and pilot work. Those records remain available as provenance rather than competing canonical sources:

- [Core Pattern Catalogue](core-12.md) — legacy aggregate prose for the original Core 12;
- [Service-Topology Pilot](pilot/README.md) — the first linked-language experiment;
- [Reversible Assembly Candidates](reversible-assembly-candidates.md) — legacy material later separated into strategies, candidates and implementation families;
- [Accessible Vertical Service Zone — pre-admission candidate](candidates/accessible-vertical-service-zone.md) — provenance for canonical `HSA-P-014`.

The active and retired lists above are generated from canonical pattern frontmatter; individual pattern records remain the source of pattern identity and metadata.
