<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { geoMercator, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'

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
// Use the SVG element directly as the measurement target.
// Only measure width; derive height from a fixed ratio so we never read a
// stale clientHeight from an aspect-ratio-only container.
const svgEl = ref<SVGSVGElement | null>(null)
const svgW = ref(400)
// Valle del Cauca (trimmed polygon) is ~1.4° wide × 1.54° tall → ~0.91:1.
// Use 5:5.5 ≈ 0.91 inverse so the shape fills the SVG.
const svgH = computed(() => Math.round(svgW.value / 0.91))

// ─── GeoJSON + D3 ────────────────────────────────────────────────────────────
const geojson = ref<GeoPermissibleObjects | null>(null)

const projection = computed(() => {
  if (!geojson.value || svgW.value === 0) return null
  return geoMercator().fitExtent(
    [[12, 12], [svgW.value - 12, svgH.value - 12]],
    geojson.value
  )
})

const departmentPath = computed(() => {
  if (!projection.value || !geojson.value) return ''
  return geoPath(projection.value)(geojson.value) ?? ''
})

interface SedePoint extends SedePin {
  cx: number
  cy: number
}

const sedePoints = computed<SedePoint[]>(() => {
  if (!projection.value) return []
  return props.sedes.map((sede) => {
    const [cx, cy] = projection.value!([sede.lng, sede.lat]) ?? [0, 0]
    return { ...sede, cx, cy }
  })
})

// ─── Tooltip ─────────────────────────────────────────────────────────────────
interface TooltipState {
  sede: SedePin
  screenX: number
  screenY: number
}

const tooltip = ref<TooltipState | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const tooltipStyle = computed(() => {
  if (!tooltip.value) return {}
  const TW = 224
  const { screenX, screenY } = tooltip.value
  let left = screenX + 16
  const top = Math.max(8, screenY - 80)
  if (typeof window !== 'undefined' && left + TW > window.innerWidth - 8) {
    left = screenX - TW - 16
  }
  return { position: 'fixed' as const, left: `${left}px`, top: `${top}px` }
})

function openTooltip(sede: SedePin, e: MouseEvent | TouchEvent) {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  const src = 'touches' in e ? (e.touches[0] ?? e.changedTouches[0]) : e
  tooltip.value = { sede, screenX: src.clientX, screenY: src.clientY }
}

function scheduleClose() {
  hideTimer = setTimeout(() => { tooltip.value = null }, 160)
}

function cancelClose() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

function toggleTooltip(sede: SedePin, e: MouseEvent | TouchEvent) {
  e.stopPropagation()
  if (tooltip.value?.sede.slug === sede.slug) {
    tooltip.value = null
  } else {
    openTooltip(sede, e)
  }
}

// ─── Resize ──────────────────────────────────────────────────────────────────
let ro: ResizeObserver | null = null

function measure() {
  if (svgEl.value) svgW.value = svgEl.value.clientWidth || svgEl.value.getBoundingClientRect().width
}

function onDocClick() { tooltip.value = null }

onMounted(async () => {
  measure()
  ro = new ResizeObserver(measure)
  if (svgEl.value) ro.observe(svgEl.value)

  const res = await fetch('/geojson/valle-del-cauca.json')
  geojson.value = await res.json()

  // Re-measure after paint in case the container shifted
  requestAnimationFrame(measure)

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
    Root is the SVG itself — CSS sets its width, JS reads clientWidth and
    derives height. No wrapper div means no aspect-ratio clientHeight issue.
  -->
  <svg
    ref="svgEl"
    :viewBox="`0 0 ${svgW} ${svgH}`"
    :style="{ width: '100%', height: 'auto', display: 'block' }"
    :aria-label="`Mapa de ${props.sedes.length} sedes CIC Laboratorios en Valle del Cauca`"
    @click="tooltip = null"
  >
    <!-- Loading text -->
    <text
      v-if="!geojson"
      :x="svgW / 2"
      :y="svgH / 2"
      text-anchor="middle"
      dominant-baseline="middle"
      fill="#9ca3af"
      font-size="14"
    >Cargando mapa…</text>

    <!-- Department fill + outline -->
    <path
      v-if="departmentPath"
      :d="departmentPath"
      fill="#f0fdf4"
      stroke="#4ade80"
      stroke-width="1.5"
      stroke-linejoin="round"
    />

    <!-- Sede markers (all SVG — zero overflow risk) -->
    <g
      v-for="sede in sedePoints"
      :key="sede.slug"
      @mouseenter="openTooltip(sede, $event)"
      @mouseleave="scheduleClose"
      @click.stop="toggleTooltip(sede, $event)"
      style="cursor: pointer"
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

  <!-- Tooltip: teleported to body so it never causes page overflow -->
  <Teleport to="body">
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
/* SVG transform-origin: center requires transform-box: fill-box */
.sede-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: sede-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes sede-ping {
  0%       { transform: scale(1);   opacity: 0.5; }
  75%, 100% { transform: scale(2.4); opacity: 0;   }
}

.sede-dot {
  transition: transform 0.15s ease;
  transform-box: fill-box;
  transform-origin: center;
}

.sede-dot:hover {
  transform: scale(1.5);
}
</style>
