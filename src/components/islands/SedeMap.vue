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

const props = defineProps<{ sedes: SedePin[]; showSidebar?: boolean }>()

const COLOR_DEFAULT = 'var(--color-red-600)'
const COLOR_ACTIVE  = 'var(--color-blue-600)'

// Alphabetical sort gives stable, predictable numbering across renders
const sortedSedes = computed(() =>
  [...props.sedes].sort((a, b) => a.ciudad.localeCompare(b.ciudad, 'es'))
)

// ─── Valle del Cauca boundary ────────────────────────────────────────────────
// 121-point polygon sampled every 6th point from the 726-point GADM/DANE dataset.
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

// Geographic extents + padding. Real dataset: W -77.563, E -75.710, S 3.064, N 4.976
const WEST = -77.62, EAST = -75.66
const SOUTH = 3.00,  NORTH = 5.03
const RATIO = (NORTH - SOUTH) / (EAST - WEST)

// Linear projection — accurate enough for a 1.5° area, avoids D3 reactive-proxy issues
function project(lng: number, lat: number, w: number, h: number, pad = 18): [number, number] {
  const x = pad + ((lng - WEST) / (EAST - WEST)) * (w - 2 * pad)
  const y = pad + ((NORTH - lat) / (NORTH - SOUTH)) * (h - 2 * pad)
  return [x, y]
}

// ─── SVG dimensions ───────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 420

const svgEl  = ref<SVGSVGElement | null>(null)
const svgW   = ref(400)
const svgH   = computed(() => Math.round(svgW.value * RATIO))
const dotR   = computed(() => svgW.value < MOBILE_BREAKPOINT ? 13 : 11)
const pinR   = computed(() => svgW.value < MOBILE_BREAKPOINT ? 15 : 13)
const fSize  = computed(() => svgW.value < MOBILE_BREAKPOINT ? 10 : 9)

const polygonPoints = computed(() =>
  POLY.map(([lng, lat]) => project(lng, lat, svgW.value, svgH.value).join(',')).join(' ')
)

const sedePoints = computed(() =>
  sortedSedes.value.map((sede, i) => {
    const [cx, cy] = project(sede.lng, sede.lat, svgW.value, svgH.value)
    return { ...sede, cx, cy, num: i + 1 }
  })
)

// ─── Hover sync between map dots and sidebar list ─────────────────────────────
const activeSlug = ref<string | null>(null)

// ─── Responsive width via ResizeObserver ─────────────────────────────────────
let resizeObserver: ResizeObserver | null = null

function measure() {
  if (!svgEl.value) return
  const w = svgEl.value.getBoundingClientRect().width
  if (w > 0) svgW.value = Math.round(w)
}

onMounted(() => {
  measure()
  resizeObserver = new ResizeObserver(measure)
  if (svgEl.value) resizeObserver.observe(svgEl.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div :class="showSidebar ? 'flex items-stretch gap-4' : 'block'">

    <!-- SVG map -->
    <div :class="showSidebar ? 'flex-1 min-w-0' : 'w-full'">
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${svgW} ${svgH}`"
        style="width: 100%; height: auto; display: block"
        :aria-label="`Mapa de ${sedes.length} sedes CIC Laboratorios en Valle del Cauca`"
        @click="activeSlug = null"
      >
        <!-- Department boundary -->
        <polygon
          :points="polygonPoints"
          fill="#fff1f2"
          stroke="#fca5a5"
          stroke-width="1.5"
          stroke-linejoin="round"
          pointer-events="none"
        />

        <!-- Sede markers: circle + number -->
        <g
          v-for="sede in sedePoints"
          :key="sede.slug"
          class="sede-marker"
          :class="{ 'is-active': activeSlug === sede.slug }"
          style="cursor: pointer"
          @mouseenter="activeSlug = sede.slug"
          @mouseleave="activeSlug = null"
          @click.stop="activeSlug = activeSlug === sede.slug ? null : sede.slug"
        >
          <circle
            :cx="sede.cx"
            :cy="sede.cy"
            :r="sede.esSedePrincipal ? pinR : dotR"
            :fill="activeSlug === sede.slug ? COLOR_ACTIVE : COLOR_DEFAULT"
            stroke="white"
            stroke-width="1.5"
          />
          <text
            :x="sede.cx"
            :y="sede.cy"
            text-anchor="middle"
            dominant-baseline="central"
            :font-size="fSize"
            font-weight="700"
            fill="white"
            pointer-events="none"
            font-family="system-ui, sans-serif"
          >{{ sede.num }}</text>
        </g>
      </svg>
    </div>

    <!-- Sidebar list (desktop map+list layout only) -->
    <nav
      v-if="showSidebar"
      aria-label="Lista de sedes"
      class="w-44 shrink-0 rounded-xl border border-gray-100"
    >
      <ul role="list">
        <li v-for="sede in sedePoints" :key="sede.slug">
          <a
            :href="`/sedes/${sede.slug}`"
            class="flex items-center gap-2.5 border-l-2 px-3 py-2 text-xs transition-colors duration-100"
            :class="activeSlug === sede.slug
              ? 'border-navy-600 bg-navy-50 text-navy-800'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            @mouseenter="activeSlug = sede.slug"
            @mouseleave="activeSlug = null"
          >
            <span
              class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white transition-colors duration-100"
              :style="{ backgroundColor: activeSlug === sede.slug ? COLOR_ACTIVE : COLOR_DEFAULT }"
            >{{ sede.num }}</span>
            <span class="truncate leading-none">
              <span class="font-medium">{{ sede.ciudad }}</span>
            </span>
          </a>
        </li>
      </ul>
    </nav>

  </div>
</template>

<style scoped>
.sede-marker {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.15s ease;
}
.sede-marker.is-active {
  transform: scale(1.25);
}
</style>
