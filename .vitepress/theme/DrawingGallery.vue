<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../../docs/drawings.data'
import type { GalleryEntry } from '../../scripts/drawing-gallery'

type Category = GalleryEntry['category']
type Basis = GalleryEntry['basis']

const entries = data.entries as GalleryEntry[]
const categories: { id: Category; label: string }[] = [
  { id: 'architecture', label: 'Architectural drawings' },
  { id: 'diagrams', label: 'Diagrams' },
  { id: 'details', label: 'Details & assemblies' },
  { id: 'studies', label: 'Studies & comparisons' }
]
const basisLabels: Record<Basis, string> = {
  current: 'Current study',
  historical: 'Earlier study',
  study: 'Supporting study'
}
const category = ref<Category | 'all'>('all')
const basis = ref<Basis | 'all'>('all')
const query = ref('')
const diagramPreviews = ref<Record<string, { src: string; width: number; height: number }>>({})
const diagramErrors = ref<Record<string, boolean>>({})
const dialog = ref<HTMLDialogElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const selected = ref<GalleryEntry | null>(null)
const zoom = ref(1)

function url(href: string): string {
  return href.startsWith('/') && !href.startsWith('//') ? withBase(href) : href
}

const searchTerms = computed(() => query.value.trim().toLocaleLowerCase('en-GB').split(/\s+/).filter(Boolean))
const matchingEntries = computed(() => entries.filter((entry) => {
  if (basis.value !== 'all' && entry.basis !== basis.value) return false
  const text = [entry.title, entry.description, entry.collection, entry.sourcePath, entry.context.label]
    .join(' ').toLocaleLowerCase('en-GB')
  return searchTerms.value.every((term) => text.includes(term))
}))
const categoryCounts = computed(() => Object.fromEntries(categories.map(({ id }) => [
  id, matchingEntries.value.filter((entry) => entry.category === id).length
])))
const visibleEntries = computed(() => matchingEntries.value
  .filter((entry) => category.value === 'all' || entry.category === category.value))
const isFiltered = computed(() => category.value !== 'all' || basis.value !== 'all' || searchTerms.value.length > 0)
const selectedDiagram = computed(() => selected.value ? diagramPreviews.value[selected.value.id] : undefined)
const zoomPercent = computed(() => Math.round(zoom.value * 100))

function reset() {
  category.value = 'all'
  basis.value = 'all'
  query.value = ''
}

function fitDiagram() {
  const image = selectedDiagram.value
  if (!image || !stage.value) return
  zoom.value = Math.min(1, (stage.value.clientWidth - 40) / image.width, (stage.value.clientHeight - 40) / image.height)
  stage.value.scrollTo({ top: 0, left: 0 })
}

async function openDiagram(entry: GalleryEntry) {
  if (!diagramPreviews.value[entry.id]) return
  selected.value = entry
  await nextTick()
  dialog.value?.showModal()
  fitDiagram()
}

function changeZoom(multiplier: number) {
  zoom.value = Math.min(4, Math.max(0.1, zoom.value * multiplier))
}

onMounted(async () => {
  const diagrams = entries.filter((entry) => entry.mermaid)
  if (!diagrams.length) return
  try {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'neutral',
      flowchart: { htmlLabels: false, useMaxWidth: false }
    })
    for (const [index, entry] of diagrams.entries()) {
      try {
        const { svg } = await mermaid.render(`gallery-diagram-${index}`, entry.mermaid!)
        const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number)
        const width = viewBox?.[2] && Number.isFinite(viewBox[2]) ? viewBox[2] : 1000
        const height = viewBox?.[3] && Number.isFinite(viewBox[3]) ? viewBox[3] : 750
        diagramPreviews.value[entry.id] = {
          src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          width,
          height
        }
      } catch {
        diagramErrors.value[entry.id] = true
      }
    }
  } catch {
    for (const entry of diagrams) diagramErrors.value[entry.id] = true
  }
})
</script>

<template>
  <div class="drawing-gallery">
    <div class="gallery-controls">
      <div class="gallery-fields">
        <label class="gallery-search" for="drawing-search">
          <span>Find a drawing</span>
          <input id="drawing-search" v-model="query" type="search" placeholder="Try ground floor, roof, services…" autocomplete="off" />
        </label>
        <label class="gallery-basis" for="drawing-basis">
          <span>Design basis</span>
          <select id="drawing-basis" v-model="basis">
            <option value="all">All drawings</option>
            <option value="current">Current study</option>
            <option value="study">Supporting studies</option>
            <option value="historical">Earlier studies</option>
          </select>
        </label>
      </div>
      <div class="gallery-categories" role="group" aria-label="Drawing categories">
        <button type="button" :aria-pressed="category === 'all'" @click="category = 'all'">
          All <span>{{ matchingEntries.length }}</span>
        </button>
        <button v-for="item in categories" :key="item.id" type="button" :aria-pressed="category === item.id" @click="category = item.id">
          {{ item.label }} <span>{{ categoryCounts[item.id] }}</span>
        </button>
      </div>
    </div>

    <div class="gallery-results-bar">
      <p role="status" aria-live="polite" aria-atomic="true">
        {{ visibleEntries.length }} {{ visibleEntries.length === 1 ? 'drawing' : 'drawings' }}<template v-if="isFiltered"> of {{ entries.length }}</template>
      </p>
      <button v-if="isFiltered" type="button" class="gallery-reset" @click="reset">Clear filters</button>
    </div>

    <div v-if="visibleEntries.length" class="gallery-grid">
      <article v-for="entry in visibleEntries" :key="entry.id" class="drawing-card" :aria-labelledby="`drawing-title-${entry.id}`">
        <button v-if="entry.mermaid" type="button" class="drawing-preview drawing-preview-button" :aria-label="`Enlarge ${entry.title}`" :disabled="!diagramPreviews[entry.id]" @click="openDiagram(entry)">
          <img v-if="diagramPreviews[entry.id]" :src="diagramPreviews[entry.id].src" :alt="entry.title" loading="lazy" decoding="async" />
          <span v-else class="drawing-placeholder">{{ diagramErrors[entry.id] ? 'Preview unavailable — follow the explanation below' : 'Preparing diagram…' }}</span>
          <span v-if="diagramPreviews[entry.id]" class="preview-action" aria-hidden="true">Enlarge ↗</span>
        </button>
        <a v-else class="drawing-preview" :href="url(entry.href)" :aria-label="`Open ${entry.title} at full size`" target="_blank" rel="noopener noreferrer">
          <img v-if="entry.preview || entry.href" :src="url(entry.preview || entry.href)" :alt="entry.title" loading="lazy" decoding="async" />
          <span class="preview-action" aria-hidden="true">Full size ↗</span>
        </a>
        <div class="drawing-card-body">
          <div class="drawing-meta">
            <span class="drawing-collection">{{ entry.collection }}</span>
            <span class="drawing-basis-tag" :class="`drawing-basis-${entry.basis}`">{{ basisLabels[entry.basis] }}</span>
          </div>
          <h2 :id="`drawing-title-${entry.id}`">{{ entry.title }}</h2>
          <p v-if="entry.description" class="drawing-description">{{ entry.description }}</p>
          <div class="drawing-links">
            <button v-if="entry.mermaid && diagramPreviews[entry.id]" type="button" @click="openDiagram(entry)">Enlarge diagram <span aria-hidden="true">↗</span></button>
            <a v-else-if="!entry.mermaid" :href="url(entry.href)" target="_blank" rel="noopener noreferrer">Open full size <span aria-hidden="true">↗</span></a>
            <a :href="url(entry.context.href)" :title="entry.context.label">Read in context <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="gallery-empty">
      <h2>No drawings match</h2>
      <p>Try another search or include a different design basis.</p>
      <button type="button" @click="reset">Show all drawings</button>
    </div>

    <dialog ref="dialog" class="drawing-dialog" aria-labelledby="drawing-dialog-title" @click="(event) => { if (event.target === dialog) dialog?.close() }">
      <div class="drawing-dialog-toolbar">
        <h2 id="drawing-dialog-title">{{ selected?.title }}</h2>
        <div class="drawing-dialog-controls">
          <button type="button" @click="fitDiagram">Fit</button>
          <button type="button" aria-label="Zoom out" @click="changeZoom(0.8)">−</button>
          <span>{{ zoomPercent }}%</span>
          <button type="button" aria-label="Zoom in" @click="changeZoom(1.25)">+</button>
          <button type="button" class="drawing-dialog-close" aria-label="Close enlarged diagram" @click="dialog?.close()">Close ×</button>
        </div>
      </div>
      <div ref="stage" class="drawing-dialog-stage" tabindex="0" role="region" aria-label="Enlarged diagram; scroll to explore">
        <img v-if="selectedDiagram" :src="selectedDiagram.src" :alt="selected?.title" :style="{ width: `${selectedDiagram.width * zoom}px` }" />
      </div>
      <div class="drawing-dialog-footer">
        <a v-if="selected" :href="url(selected.context.href)" :title="selected.context.label">Read in context <span aria-hidden="true">→</span></a>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.drawing-gallery { margin-top: 2.25rem; font-family: var(--vp-font-family-base); }
.gallery-controls { padding: 1.25rem; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg-alt); }
.gallery-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(180px, 240px); gap: 1rem; }
.gallery-fields label { display: flex; flex-direction: column; gap: .45rem; font-size: .8rem; font-weight: 600; line-height: 1.4; }
.gallery-fields input, .gallery-fields select { width: 100%; min-width: 0; min-height: 44px; padding: .65rem .8rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; color: var(--vp-c-text-1); background: var(--vp-c-bg); font: 400 .9rem/1.4 var(--vp-font-family-base); }
.gallery-fields select { appearance: auto; }
.gallery-fields input::placeholder { color: var(--vp-c-text-3); }
.gallery-categories { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
.gallery-categories button { display: inline-flex; align-items: center; gap: .5rem; min-height: 40px; padding: .45rem .7rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-2); font: 500 .8rem/1.4 var(--vp-font-family-base); cursor: pointer; }
.gallery-categories button[aria-pressed="true"] { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.gallery-categories button span { font-size: .75rem; font-variant-numeric: tabular-nums; opacity: .8; }
.gallery-results-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1.25rem 0 .9rem; color: var(--vp-c-text-2); font-size: .8rem; }
.gallery-results-bar p { margin: 0; }
.gallery-reset, .drawing-links button, .gallery-empty button { padding: 0; color: var(--vp-c-brand-1); font: inherit; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.gallery-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; align-items: stretch; }
.drawing-card { display: flex; flex-direction: column; min-width: 0; overflow: hidden; border: 1px solid var(--vp-c-divider); border-radius: 5px; background: var(--vp-c-bg); }
.drawing-preview { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: 4 / 3; padding: .8rem; overflow: hidden; border: 0; border-bottom: 1px solid var(--vp-c-divider); background: #fff; color: #20221f; text-decoration: none; cursor: zoom-in; }
.drawing-preview img { display: block; width: 100%; height: 100%; object-fit: contain; }
.drawing-preview-button:disabled { cursor: default; }
.drawing-preview:focus-visible, .gallery-controls :focus-visible, .drawing-links :focus-visible, .gallery-reset:focus-visible, .gallery-empty button:focus-visible, .drawing-dialog :focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.drawing-preview:focus-visible { outline-offset: -4px; }
.preview-action { position: absolute; right: .6rem; bottom: .6rem; padding: .3rem .45rem; border: 1px solid #d6d3cb; border-radius: 3px; background: #fffef9ee; color: #315a46; font-size: .65rem; font-weight: 600; line-height: 1.2; }
.drawing-preview:hover .preview-action { border-color: #315a46; }
.drawing-placeholder { padding: 1rem; color: #5b5e57; font-size: .8rem; line-height: 1.5; text-align: center; }
.drawing-card-body { display: flex; flex: 1; flex-direction: column; gap: .65rem; padding: 1rem; }
.drawing-meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: .3rem .5rem; color: var(--vp-c-text-2); font-size: .65rem; line-height: 1.4; }
.drawing-collection { flex: 1 1 auto; }
.drawing-basis-tag { padding: .15rem .4rem; border-radius: 3px; background: var(--vp-c-bg-soft); white-space: nowrap; }
.drawing-basis-current { color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.drawing-basis-historical { color: var(--vp-c-warning-1); background: var(--vp-c-warning-soft); }
.drawing-card h2 { margin: 0; padding: 0; border: 0; font-size: 1rem; line-height: 1.4; letter-spacing: -.012em; overflow-wrap: anywhere; }
.drawing-description { margin: 0; color: var(--vp-c-text-2); font-size: .77rem; line-height: 1.55; }
.drawing-links { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem 1rem; margin-top: auto; padding-top: .5rem; font-size: .75rem; line-height: 1.5; }
.drawing-links a { font-weight: 500; }
.gallery-empty { padding: 3rem 1rem; border: 1px dashed var(--vp-c-divider); border-radius: 5px; text-align: center; }
.gallery-empty h2 { margin: 0; padding: 0; border: 0; font-size: 1.2rem; }
.gallery-empty p { margin: .6rem auto 1rem; color: var(--vp-c-text-2); font-size: .9rem; }
.drawing-dialog { position: fixed; inset: 0; width: min(1400px, 94vw); height: 90vh; max-width: 94vw; max-height: 90vh; margin: auto; padding: 0; border: 1px solid #d6d3cb; border-radius: 6px; background: #fff; color: #20221f; }
.drawing-dialog[open] { display: flex; flex-direction: column; }
.drawing-dialog::backdrop { background: #0009; }
.drawing-dialog-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; padding: .85rem 1rem; border-bottom: 1px solid #d6d3cb; background: #f7f6f2; }
.drawing-dialog-toolbar h2 { margin: 0; padding: 0; border: 0; font-size: 1rem; line-height: 1.4; }
.drawing-dialog-controls { display: flex; align-items: center; gap: .35rem; font-size: .8rem; }
.drawing-dialog-controls button { min-width: 36px; min-height: 36px; padding: .35rem .65rem; border: 1px solid #d6d3cb; border-radius: 3px; background: #fff; color: #20221f; font: inherit; cursor: pointer; }
.drawing-dialog-controls span { min-width: 42px; text-align: center; font-variant-numeric: tabular-nums; }
.drawing-dialog-controls .drawing-dialog-close { margin-left: .5rem; }
.drawing-dialog-stage { flex: 1; min-height: 0; overflow: auto; padding: 20px; }
.drawing-dialog-stage img { display: block; max-width: none; height: auto; margin: auto; }
.drawing-dialog-footer { padding: .6rem 1rem; border-top: 1px solid #d6d3cb; font-size: .8rem; line-height: 1.4; }
.drawing-dialog-footer a { color: #315a46; }
@media (min-width: 960px) {
  :global(.drawing-gallery-page .VPDoc:not(.has-sidebar) .container),
  :global(.drawing-gallery-page .VPDoc:not(.has-sidebar) .content),
  :global(.drawing-gallery-page .VPDoc:not(.has-aside) .content-container) { max-width: 1200px; width: 100%; }
}
@media (max-width: 1023px) { .gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 639px) {
  .gallery-controls { padding: .9rem; }
  .gallery-fields { grid-template-columns: 1fr; gap: .8rem; }
  .gallery-categories { gap: .4rem; }
  .gallery-categories button { padding: .4rem .55rem; font-size: .75rem; }
  .gallery-grid { grid-template-columns: 1fr; gap: 1rem; }
  .drawing-card-body { padding: 1rem; }
  .drawing-description { font-size: .85rem; }
  .drawing-links { font-size: .8rem; }
  .drawing-dialog { width: 96vw; max-width: 96vw; height: 94vh; max-height: 94vh; }
  .drawing-dialog-toolbar { padding: .75rem; }
}
</style>
