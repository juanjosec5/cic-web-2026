<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

// ─── Polygon + projection ────────────────────────────────────────────────────
// Simplified Valle del Cauca boundary — clockwise from NE corner.
// Includes Pacific coast extension (lngs ~-77.5) which previous version omitted.
// [lng, lat] pairs.
const POLY: [number, number][] = [
  // East border — NE corner (Caicedonia area)
  [-75.50, 4.88],
  [-75.46, 4.94],
  // Northern bulge (Cartago / Obando area)
  [-75.58, 5.01],
  [-75.82, 5.02],
  [-76.05, 4.99],
  // West along north border toward Chocó
  [-76.28, 4.95],
  [-76.50, 4.90],
  [-76.70, 4.83],
  [-76.88, 4.72],
  // Northwest to Pacific coast
  [-77.05, 4.55],
  [-77.18, 4.38],
  // Pacific coast heading south
  [-77.35, 4.15],
  [-77.48, 3.90],
  // Buenaventura bay area
  [-77.42, 3.73],
  [-77.28, 3.58],
  // South Pacific coast
  [-77.10, 3.47],
  [-76.88, 3.40],
  // Southern border going east (border with Cauca dept.)
  [-76.65, 3.39],
  [-76.45, 3.42],
  [-76.25, 3.46],
  [-76.05, 3.50],
  // Southeast corner
  [-75.87, 3.56],
  [-75.70, 3.63],
  // East border going north (Cordillera Central)
  [-75.58, 3.78],
  [-75.47, 3.98],
  [-75.43, 4.22],
  [-75.43, 4.50],
  [-75.46, 4.72],
]

// Geographic bounding box — padded to include full Pacific coast extension.
const WEST = -77.58, EAST = -75.37
const SOUTH = 3.32,  NORTH = 5.08

// SVG aspect ratio. Including Pacific coast makes the dept. wider than tall.
// height / width = (NORTH - SOUTH) / (EAST - WEST) = 1.76 / 2.21 ≈ 0.80
const RATIO = (NORTH - SOUTH) / (EAST - WEST)

/**
 * Linear geographic → SVG projection. Accurate enough for a 1.5° area.
 * SVG y increases downward, latitude increases upward → invert y.
 */
function project(lng: number, lat: number, w: number, h: number, pad = 18): [number, number] {
  const x = pad + ((lng - WEST) / (EAST - WEST)) * (w - 2 * pad)
  const y = pad + ((NORTH - lat) / (NORTH - SOUTH)) * (h - 2 * pad)
  return [x, y]
}

// ─── SVG dimensions ──────────────────────────────────────────────────────────
const svgEl = ref<SVGSVGElement | null>(null)
const svgW  = ref(400)
const svgH  = computed(() => Math.round(svgW.value * RATIO))

// ─── Derived geometry (purely computed — no async, no D3, no watch) ──────────
const polygonPoints = computed(() =>
  POLY.map(([lng, lat]) => project(lng, lat, svgW.value, svgH.value).join(',')).join(' ')
)

const sedePoints = computed(() =>
  props.sedes.map((sede) => {
    const [cx, cy] = project(sede.lng, sede.lat, svgW.value, svgH.value)
    return { ...sede, cx, cy }
  })
)

// ─── Tooltip ─────────────────────────────────────────────────────────────────
interface TooltipState { sede: SedePin; sx: number; sy: number }
const tooltip   = ref<TooltipState | null>(null)
const isMounted = ref(false) // guards <Teleport> — must not render during SSR
let hideTimer: ReturnType<typeof setTimeout> | null = null

const tooltipStyle = computed(() => {
  if (!tooltip.value) return {}
  const TW = 224
  let left  = tooltip.value.sx + 16
  const top = Math.max(8, tooltip.value.sy - 80)
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

onMounted(() => {
  isMounted.value = true
  measure()
  ro = new ResizeObserver(measure)
  if (svgEl.value) ro.observe(svgEl.value)
  document.addEventListener('click', () => { tooltip.value = null })
})

onUnmounted(() => {
  ro?.disconnect()
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <!--
    SVG is the root element: CSS sets width, JS reads getBoundingClientRect
    for pixel width and derives height from the geographic aspect ratio.
    No wrapper div → no aspect-ratio clientHeight timing issue.
    No D3 → no reactive-proxy / fitExtent failure.
  -->
  <svg
    ref="svgEl"
    :viewBox="`0 0 ${svgW} ${svgH}`"
    style="width: 100%; height: auto; display: block"
    :aria-label="`Mapa de ${props.sedes.length} sedes CIC Laboratorios en Valle del Cauca`"
    @click="tooltip = null"
  >
    <!-- Department outline -->
    <polygon
      :points="polygonPoints"
      fill="#f0fdf4"
      stroke="#4ade80"
      stroke-width="1.5"
      stroke-linejoin="round"
      pointer-events="none"
    />

    <!-- Sede markers -->
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

  <!-- Tooltip: only mounted on client to avoid SSR hydration mismatch -->
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
