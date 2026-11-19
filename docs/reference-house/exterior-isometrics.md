# Exterior isometrics

Four corner views of the Reference House, with the roof and exterior intact.
Each uses the same geometry and true isometric projection. The sectional
cutaway serves a different purpose: it reveals the internal spatial order.

The roof and rainwater design remain provisional. Window and door profiles use
the nominal elevation convention; frame setbacks and construction details are
not selected by these drawings. All views are not to scale.

<script setup>
import { withBase } from 'vitepress'
const views = [
  ['south-west', 'South-west', 'Front and west'],
  ['south-east', 'South-east', 'Front and service side'],
  ['north-east', 'North-east', 'Garden and service side'],
  ['north-west', 'North-west', 'Garden and west']
]
</script>

<div class="exterior-grid">
  <figure v-for="[id, title, description] in views" :key="id">
    <a :href="withBase('/drawings/exterior-isometrics/' + id + '.svg')" :aria-label="'Open ' + title + ' SVG'">
      <img :src="withBase('/drawings/exterior-isometrics/' + id + '.svg')" :alt="title + ' exterior isometric: ' + description" />
    </a>
    <figcaption><strong>{{ title }}</strong><br>{{ description }}<br>
      <a :href="withBase('/drawings/exterior-isometrics/' + id + '.svg')">Open SVG</a>
    </figcaption>
  </figure>
</div>

<style scoped>
.exterior-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 1rem; margin: 2rem 0; }
.exterior-grid figure { margin: 0; min-width: 0; }
.exterior-grid img { display: block; width: 100%; height: auto; background: #fff; }
.exterior-grid figcaption { margin-top: .75rem; font-size: .875rem; line-height: 1.6; }
@media (max-width: 600px) { .exterior-grid { grid-template-columns: 1fr; } }
</style>
