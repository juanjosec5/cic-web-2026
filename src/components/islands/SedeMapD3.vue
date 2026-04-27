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
// Real Valle del Cauca boundary — sampled every 6th point from the
// GADM/DANE dataset (726 → 121 points). [lng, lat] pairs.
const POLY: [number, number][] = [
  [-76.084, 4.974], [-76.056, 4.924], [-76.018, 4.895], [-76.005, 4.851],
  [-75.96,  4.858], [-75.95,  4.822], [-75.964, 4.786], [-75.944, 4.752],
  [-75.884, 4.752], [-75.864, 4.723], [-75.775, 4.711], [-75.747, 4.692],
  [-75.74,  4.646], [-75.763, 4.628], [-75.821, 4.625], [-75.88,  4.623],
  [-75.899, 4.602], [-75.894, 4.573], [-75.877, 4.53],  [-75.875, 4.489],
  [-75.869, 4.439], [-75.852, 4.41],  [-75.827, 4.373], [-75.824, 4.352],
  [-75.826, 4.311], [-75.816, 4.255], [-75.795, 4.185], [-75.751, 4.136],
  [-75.729, 4.089], [-75.725, 3.992], [-75.761, 3.933], [-75.873, 3.913],
  [-75.946, 3.786], [-75.975, 3.703], [-75.998, 3.638], [-76.01,  3.514],
  [-76.031, 3.408], [-76.065, 3.32],  [-76.095, 3.229], [-76.118, 3.21],
  [-76.206, 3.235], [-76.285, 3.275], [-76.393, 3.283], [-76.441, 3.301],
  [-76.496, 3.313], [-76.523, 3.288], [-76.5,   3.261], [-76.492, 3.237],
  [-76.524, 3.195], [-76.531, 3.152], [-76.555, 3.143], [-76.556, 3.103],
  [-76.607, 3.114], [-76.649, 3.099], [-76.731, 3.097], [-76.795, 3.084],
  [-76.87,  3.081], [-76.952, 3.064], [-77.002, 3.095], [-77.091, 3.084],
  [-77.212, 3.108], [-77.252, 3.12],  [-77.298, 3.166], [-77.356, 3.172],
  [-77.412, 3.23],  [-77.473, 3.258], [-77.529, 3.258], [-77.531, 3.31],
  [-77.474, 3.363], [-77.418, 3.395], [-77.368, 3.448], [-77.375, 3.507],
  [-77.31,  3.588], [-77.211, 3.651], [-77.207, 3.695], [-77.196, 3.777],
  [-77.126, 3.818], [-77.069, 3.918], [-77.201, 3.884], [-77.343, 3.872],
  [-77.357, 3.92],  [-77.315, 3.979], [-77.272, 3.971], [-77.266, 4.033],
  [-77.292, 4.094], [-77.337, 4.075], [-77.372, 4.004], [-77.441, 3.987],
  [-77.469, 4.095], [-77.432, 4.146], [-77.39,  4.197], [-77.328, 4.182],
  [-77.31,  4.231], [-77.28,  4.195], [-77.215, 4.179], [-77.132, 4.14],
  [-77.052, 4.107], [-76.946, 4.093], [-76.844, 4.02],  [-76.766, 3.999],
  [-76.706, 4.027], [-76.583, 4.074], [-76.525, 4.117], [-76.484, 4.141],
  [-76.462, 4.17],  [-76.507, 4.205], [-76.544, 4.23],  [-76.567, 4.319],
  [-76.591, 4.41],  [-76.559, 4.421], [-76.519, 4.463], [-76.499, 4.525],
  [-76.476, 4.571], [-76.44,  4.659], [-76.397, 4.716], [-76.362, 4.767],
  [-76.307, 4.801], [-76.252, 4.825], [-76.209, 4.882], [-76.17,  4.958],
  [-76.124, 4.966],
]

// Geographic bounding box derived from real dataset extents + padding.
// Real extents: W -77.563, E -75.710, S 3.064, N 4.976
const WEST = -77.62, EAST = -75.66
const SOUTH = 3.00,  NORTH = 5.03

// height / width = (NORTH - SOUTH) / (EAST - WEST) = 2.03 / 1.96 ≈ 1.036
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
      fill="#fff1f2"
      stroke="#fca5a5"
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
        :r="sede.esSedePrincipal ? 14 : 10"
        :fill="sede.esSedePrincipal ? '#34d399' : '#60a5fa'"
        class="sede-pulse"
        pointer-events="none"
      />
      <!-- Solid dot -->
      <circle
        :cx="sede.cx"
        :cy="sede.cy"
        :r="sede.esSedePrincipal ? 7 : 5"
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
