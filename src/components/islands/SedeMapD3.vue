<script setup lang="ts">
import { ref, computed, shallowRef, markRaw, watch, onMounted, onUnmounted } from 'vue'
import { geoMercator, geoPath } from 'd3-geo'

interface SedePin {
  slug: string
  nombre: string
  ciudad: string
  direccion: string
  telefono: string
  whatsapp: string
  lat: number
  lng: number
  esSedePrincipal?: boolean
}

const props = defineProps<{ sedes: SedePin[] }>()

// ─── Dimensions ──────────────────────────────────────────────────────────────
const svgEl = ref<SVGSVGElement | null>(null)
const svgW  = ref(400)
// Valle del Cauca (trimmed) bounding box is ~1.4° wide × 1.54° tall.
// 1.54 / 1.4 ≈ 1.1 → height is ~10% taller than width.
const svgH  = computed(() => Math.round(svgW.value * 1.1))

// ─── GeoJSON + projection ────────────────────────────────────────────────────
// shallowRef prevents Vue from deep-wrapping the GeoJSON coordinates —
// D3 iterates those arrays internally and a reactive Proxy breaks it.
const geojson = shallowRef<any>(null)

// D3 projection must never enter Vue's reactive system (markRaw).
// We keep them in plain shallowRefs and rebuild manually via watch.
const _proj    = shallowRef<ReturnType<typeof geoMercator> | null>(null)
const _pathGen = shallowRef<ReturnType<typeof geoPath>     | null>(null)

function reproject() {
  if (!geojson.value || svgW.value <= 0) {
    _proj.value = null
    _pathGen.value = null
    return
  }
  const p = markRaw(
    geoMercator().fitExtent(
      [[16, 16], [svgW.value - 16, svgH.value - 16]],
      geojson.value
    )
  )
  _proj.value    = p
  _pathGen.value = markRaw(geoPath(p))
}

// Re-project whenever the data or container width changes.
watch([geojson, svgW], reproject)

const departmentPath = computed(() =>
  _pathGen.value && geojson.value ? (_pathGen.value(geojson.value) ?? '') : ''
)

interface SedePoint extends SedePin { cx: number; cy: number }

const sedePoints = computed<SedePoint[]>(() => {
  const p = _proj.value
  if (!p) return []
  return props.sedes.map((sede) => {
    const pt = p([sede.lng, sede.lat])
    return { ...sede, cx: pt?.[0] ?? 0, cy: pt?.[1] ?? 0 }
  })
})

// ─── Tooltip ─────────────────────────────────────────────────────────────────
interface TooltipState { sede: SedePin; sx: number; sy: number }
const tooltip   = ref<TooltipState | null>(null)
const isMounted = ref(false) // guards <Teleport> — not rendered during SSR
let hideTimer: ReturnType<typeof setTimeout> | null = null

const tooltipStyle = computed(() => {
  if (!tooltip.value) return {}
  const TW = 224
  let left = tooltip.value.sx + 16
  const top  = Math.max(8, tooltip.value.sy - 80)
  if (typeof window !== 'undefined' && left + TW > window.innerWidth - 8) {
    left = tooltip.value.sx - TW - 16
  }
  return { position: 'fixed' as const, left: `${left}px`, top: `${top}px` }
})

function openTooltip(sede: SedePin, e: MouseEvent | TouchEvent) {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  const src = 'touches' in e ? (e.touches[0] ?? e.changedTouches[0]) : e
  tooltip.value = { sede, sx: src.clientX, sy: src.clientY }
}

function scheduleClose() {
  hideTimer = setTimeout(() => { tooltip.value = null }, 160)
}

function cancelClose() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

function toggleTooltip(sede: SedePin, e: MouseEvent | TouchEvent) {
  e.stopPropagation()
  tooltip.value?.sede.slug === sede.slug ? (tooltip.value = null) : openTooltip(sede, e)
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
let ro: ResizeObserver | null = null

function measure() {
  if (!svgEl.value) return
  const w = svgEl.value.getBoundingClientRect().width
  if (w > 0) svgW.value = Math.round(w)
}

function onDocClick() { tooltip.value = null }

onMounted(async () => {
  isMounted.value = true
  measure()
  ro = new ResizeObserver(measure)
  if (svgEl.value) ro.observe(svgEl.value)

  const res = await fetch('/geojson/valle-del-cauca.json')
  geojson.value = await res.json()

  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  ro?.disconnect()
  if (hideTimer) clearTimeout(hideTimer)
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <!--
    SVG is the root element — CSS sets its width, JS reads getBoundingClientRect
    to derive actual pixel width, height follows a fixed aspect ratio.
    No wrapper div → no clientHeight issue with aspect-ratio-only containers.
  -->
  <svg
    ref="svgEl"
    :viewBox="`0 0 ${svgW} ${svgH}`"
    style="width: 100%; height: auto; display: block; overflow: visible"
    :aria-label="`Mapa de ${props.sedes.length} sedes CIC Laboratorios en Valle del Cauca`"
    @click="tooltip = null"
  >
    <!-- Loading state -->
    <text
      v-if="!geojson"
      :x="svgW / 2"
      :y="svgH / 2"
      text-anchor="middle"
      dominant-baseline="middle"
      fill="#9ca3af"
      font-size="14"
    >Cargando mapa…</text>

    <!-- Department outline -->
    <path
      v-if="departmentPath"
      :d="departmentPath"
      fill="#f0fdf4"
      stroke="#4ade80"
      stroke-width="1.5"
      stroke-linejoin="round"
    />

    <!-- Sede markers — all SVG, zero overflow risk -->
    <g
      v-for="sede in sedePoints"
      :key="sede.slug"
      style="cursor: pointer"
      @mouseenter="openTooltip(sede, $event)"
      @mouseleave="scheduleClose"
      @click.stop="toggleTooltip(sede, $event)"
    >
      <!-- Pulse ring -->
      <circle
        :cx="sede.cx"
        :cy="sede.cy"
        :r="sede.esSedePrincipal ? 10 : 7"
        :fill="sede.esSedePrincipal ? '#34d399' : '#60a5fa'"
        class="sede-pulse"
        pointer-events="none"
      />
      <!-- Solid dot -->
      <circle
        :cx="sede.cx"
        :cy="sede.cy"
        :r="sede.esSedePrincipal ? 5 : 3.5"
        :fill="sede.esSedePrincipal ? '#059669' : '#2563eb'"
        stroke="white"
        stroke-width="1.5"
        class="sede-dot"
      />
    </g>
  </svg>

  <!--
    Teleport is guarded by isMounted so it is never included in the
    server-rendered HTML — eliminates the Vue hydration mismatch warning.
  -->
  <Teleport v-if="isMounted" to="body">
    <div
      v-if="tooltip"
      :style="tooltipStyle"
      class="z-[9999] w-56 rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-3 text-sm text-left"
      @mouseenter="cancelClose"
      @mouseleave="scheduleClose"
      @click.stop
    >
      <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {{ tooltip.sede.ciudad }}
      </p>
      <p class="mt-0.5 font-bold text-gray-900 leading-snug">
        {{ tooltip.sede.nombre }}
      </p>
      <p class="mt-1 text-xs text-gray-500">{{ tooltip.sede.direccion }}</p>
      <a
        :href="`tel:${tooltip.sede.telefono}`"
        class="mt-2 block text-xs text-gray-600 hover:text-blue-600"
      >
        📞 {{ tooltip.sede.telefono }}
      </a>
      <a
        :href="`/sedes/${tooltip.sede.slug}`"
        class="mt-3 flex items-center justify-between rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Ver sede completa
        <svg class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>
      </a>
    </div>
  </Teleport>
</template>

<style scoped>
/* transform-box: fill-box makes transform-origin relative to the SVG element itself */
.sede-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: sede-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes sede-ping {
  0%        { transform: scale(1);   opacity: 0.55; }
  75%, 100% { transform: scale(2.4); opacity: 0;    }
}

.sede-dot {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.15s ease;
}

.sede-dot:hover {
  transform: scale(1.5);
}
</style>
