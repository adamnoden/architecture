<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { currentMermaid, completeMermaid } from '../../docs/project/graph-source.js'

const full = ref(false)
const historical = ref(false)
const ready = ref(false)
const error = ref('')
const zoom = ref(1)
const stage = ref<HTMLElement | null>(null)
const svgHost = ref<HTMLElement | null>(null)
const pageUrl = withBase('/project/dependency-graph')
const fullUrl = computed(() => `${pageUrl}?view=full&graph=current`)
const percent = computed(() => Math.round(zoom.value * 100))
let svgElement: SVGSVGElement | null = null
let naturalWidth = 3200
let drag: { x: number; y: number; left: number; top: number; pointerId: number } | null = null

function applyZoom(value: number) {
  zoom.value = Math.min(2.5, Math.max(0.15, value))
  if (svgElement && full.value) svgElement.style.width = `${Math.round(naturalWidth * zoom.value)}px`
}

function fit() {
  if (!stage.value) return
  applyZoom(Math.min(1, (stage.value.clientWidth - 48) / naturalWidth))
  stage.value.scrollTo({ left: 0, top: 0 })
}

function pointerDown(event: PointerEvent) {
  if (!full.value || !stage.value || event.button !== 0 || event.pointerType !== 'mouse') return
  drag = {
    x: event.clientX,
    y: event.clientY,
    left: stage.value.scrollLeft,
    top: stage.value.scrollTop,
    pointerId: event.pointerId
  }
  stage.value.setPointerCapture(event.pointerId)
  stage.value.classList.add('is-dragging')
}

function pointerMove(event: PointerEvent) {
  if (!drag || !stage.value) return
  stage.value.scrollLeft = drag.left - (event.clientX - drag.x)
  stage.value.scrollTop = drag.top - (event.clientY - drag.y)
}

function pointerUp() {
  if (drag && stage.value?.hasPointerCapture(drag.pointerId)) {
    stage.value.releasePointerCapture(drag.pointerId)
  }
  stage.value?.classList.remove('is-dragging')
  drag = null
}

onMounted(async () => {
  const query = new URLSearchParams(window.location.search)
  full.value = query.get('view') === 'full'
  historical.value = query.get('graph') === 'all'
  await nextTick()

  try {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      flowchart: { htmlLabels: true, useMaxWidth: false }
    })
    const source = historical.value ? completeMermaid : currentMermaid
    const { svg } = await mermaid.render(
      `ovids-control-graph-${historical.value ? 'complete' : 'current'}`,
      source
    )
    if (!svgHost.value) return
    svgHost.value.innerHTML = svg
    svgElement = svgHost.value.querySelector('svg')
    if (!svgElement) throw new Error('Mermaid did not return an SVG')
    const width = svgElement.viewBox?.baseVal?.width
    naturalWidth = width && Number.isFinite(width) ? Math.max(1800, width) : 3200
    svgElement.style.maxWidth = 'none'
    svgElement.style.height = 'auto'
    applyZoom(1)
    ready.value = true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
})
</script>

<template>
  <div class="control-graph" :class="{ 'control-graph--full': full }">
    <a
      v-if="!full"
      class="graph-preview"
      :href="fullUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the current dependency graph full size in a new tab"
    >
      <div ref="svgHost" class="graph-svg">
        <span v-if="!error">Rendering dependency graph…</span>
        <span v-else>Could not render graph: {{ error }}</span>
      </div>
      <span class="graph-preview-action">OPEN FULL-SIZE GRAPH <span aria-hidden="true">↗</span></span>
    </a>
    <template v-else>
      <div class="graph-toolbar">
        <div class="graph-heading">
          <span class="graph-kicker">OVID’S HOUSE / PROJECT CONTROL</span>
          <strong>{{ historical ? 'Complete dependency graph' : 'Current execution graph' }}</strong>
        </div>
        <div class="graph-tools">
          <button type="button" @click="fit" :disabled="!ready">Fit</button>
          <button type="button" @click="applyZoom(1)" :disabled="!ready">100%</button>
          <button type="button" aria-label="Zoom out" @click="applyZoom(zoom / 1.25)" :disabled="!ready">−</button>
          <span class="graph-percent">{{ percent }}%</span>
          <button type="button" aria-label="Zoom in" @click="applyZoom(zoom * 1.25)" :disabled="!ready">+</button>
          <a :href="pageUrl" class="graph-close" aria-label="Return to the project dependency graph page">Close ×</a>
        </div>
      </div>
      <div
        ref="stage"
        class="graph-stage"
        role="region"
        aria-label="Scroll or drag to explore the full-size dependency graph"
        tabindex="0"
        @pointerdown="pointerDown"
        @pointermove="pointerMove"
        @pointerup="pointerUp"
        @pointercancel="pointerUp"
      >
        <div ref="svgHost" class="graph-svg">
          <span v-if="!error">Rendering full-size vector graph…</span>
          <span v-else>Could not render graph: {{ error }}</span>
        </div>
      </div>
      <div class="graph-footnote">Drag to pan · Scroll to navigate · Zoom controls above · Structural state, not live agent occupancy</div>
    </template>
  </div>
</template>

<style scoped>
.control-graph { font-family: var(--vp-font-family-base); }
.graph-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
  max-height: 340px;
  margin: 1.4rem 0 2.2rem;
  padding: 1rem;
  overflow: hidden;
  background: #f7f6f2;
  border: 1px solid #d6d3cb;
  border-radius: 4px;
  cursor: zoom-in;
  text-decoration: none;
}
.graph-preview:hover { border-color: #315a46; }
.graph-preview .graph-svg { width: 100%; pointer-events: none; }
.graph-preview .graph-svg :deep(svg) { display: block; width: 100% !important; height: auto !important; max-width: none !important; }
.graph-preview-action {
  position: absolute;
  right: 14px;
  bottom: 14px;
  padding: 8px 12px;
  background: #315a46;
  color: #fff;
  font: 600 11px/1.2 var(--vp-font-family-base);
  letter-spacing: .06em;
  border-radius: 3px;
}
.control-graph--full {
  position: fixed;
  z-index: 9999;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f7f6f2;
  color: #20221f;
}
.graph-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 12px 18px;
  border-bottom: 1px solid #d6d3cb;
  background: #f7f6f2;
}
.graph-heading { display: flex; flex-direction: column; gap: 2px; line-height: 1.2; }
.graph-heading strong { font-size: 16px; }
.graph-kicker { font-size: 10px; font-weight: 650; letter-spacing: .11em; color: #667068; }
.graph-tools { display: flex; align-items: center; gap: 7px; }
.graph-tools button, .graph-close {
  padding: 6px 10px;
  border: 1px solid #c9c7bf;
  color: #29342e;
  background: #fff;
  border-radius: 3px;
  font: 500 12px/1.25 var(--vp-font-family-base);
  text-decoration: none;
  cursor: pointer;
}
.graph-tools button:disabled { opacity: .5; cursor: not-allowed; }
.graph-tools button:hover:not(:disabled), .graph-close:hover { background: #dde7df; }
.graph-close { margin-left: 8px; }
.graph-percent { min-width: 44px; text-align: center; font-size: 12px; }
.graph-stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 28px;
  cursor: grab;
  background-color: #f7f6f2;
  background-image: radial-gradient(#dddcd5 .6px, transparent .6px);
  background-size: 20px 20px;
}
.graph-stage.is-dragging { cursor: grabbing; user-select: none; }
.graph-stage .graph-svg { width: max-content; }
.graph-stage .graph-svg :deep(svg) { display: block; height: auto !important; max-width: none !important; }
.graph-footnote {
  padding: 8px 18px;
  border-top: 1px solid #d6d3cb;
  font-size: 11px;
  color: #6b6b65;
}
@media (max-width: 650px) {
  .graph-toolbar { flex-wrap: wrap; padding: 10px; }
  .graph-tools { flex-wrap: wrap; }
  .graph-footnote { font-size: 10px; }
}
</style>
