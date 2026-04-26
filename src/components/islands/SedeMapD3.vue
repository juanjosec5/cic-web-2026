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

interface Props {
  sedes: SedePin[]
}

const props = defineProps<Props>()

const containerRef = ref<HTMLDivElement | null>(null)
const width = ref(600)
const height = ref(500)
const geojson = ref<GeoPermissibleObjects | null>(null)
const activeSlug = ref<string | null>(null)

const projection = computed(() => {
  if (!geojson.value || width.value === 0) return null
  return geoMercator().fitSize([width.value, height.value], geojson.value)
})

const departmentPath = computed(() => {
  if (!projection.value || !geojson.value) return ''
  return geoPath(projection.value)(geojson.value) ?? ''
})

const sedePoints = computed(() => {
  if (!projection.value) return []
  return props.sedes.map((sede) => {
    const [x, y] = projection.value!([sede.lng, sede.lat]) ?? [0, 0]
    return {
      ...sede,
      xPct: (x / width.value) * 100,
      yPct: (y / height.value) * 100,
    }
  })
})

function tooltipClasses(xPct: number, yPct: number) {
  const horiz = xPct > 60 ? 'right-5' : 'left-5'
  const vert = yPct > 65 ? 'bottom-4' : 'top-4'
  return `${horiz} ${vert}`
}

function onDotEnter(slug: string) {
  activeSlug.value = slug
}

function onDotLeave() {
  // Only hide on mouseleave if it wasn't a tap-activated tooltip
  if (!isTouchDevice.value) activeSlug.value = null
}

function onDotClick(slug: string) {
  activeSlug.value = activeSlug.value === slug ? null : slug
}

function closeTooltip() {
  activeSlug.value = null
}

const isTouchDevice = ref(false)

function handleResize() {
  if (containerRef.value) {
    width.value = containerRef.value.clientWidth
    height.value = containerRef.value.clientHeight
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  isTouchDevice.value = window.matchMedia('(hover: none)').matches

  handleResize()
  resizeObserver = new ResizeObserver(handleResize)
  if (containerRef.value) resizeObserver.observe(containerRef.value)

  const res = await fetch('/geojson/valle-del-cauca.json')
  geojson.value = await res.json()

  // Re-measure after geojson loaded (container may have re-laid out)
  handleResize()

  document.addEventListener('click', closeTooltip)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('click', closeTooltip)
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full overflow-visible"
    style="aspect-ratio: 5/6"
    aria-label="Mapa interactivo de sedes CIC Laboratorios en Valle del Cauca"
    role="img"
    @click.stop
  >
    <!-- Loading state -->
    <div
      v-if="!geojson"
      class="flex h-full items-center justify-center"
    >
      <p class="text-sm text-gray-400">Cargando mapa…</p>
    </div>

    <!-- SVG department outline -->
    <svg
      v-if="geojson"
      class="absolute inset-0 h-full w-full"
      :viewBox="`0 0 ${width} ${height}`"
      aria-hidden="true"
    >
      <path
        :d="departmentPath"
        fill="#f0fdf4"
        stroke="#86efac"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Sede markers (HTML overlay for full Tailwind control) -->
    <template v-if="geojson">
      <div
        v-for="sede in sedePoints"
        :key="sede.slug"
        class="absolute -translate-x-1/2 -translate-y-1/2"
        :style="{ left: `${sede.xPct}%`, top: `${sede.yPct}%` }"
      >
        <!-- Pulse ring -->
        <span
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
          :class="sede.esSedePrincipal
            ? 'h-6 w-6 bg-emerald-400 opacity-40'
            : 'h-5 w-5 bg-blue-400 opacity-40'"
          aria-hidden="true"
        />

        <!-- Dot button -->
        <button
          type="button"
          class="relative z-10 rounded-full ring-2 ring-white shadow-md transition-transform hover:scale-125 focus:outline-none focus-visible:ring-blue-500"
          :class="sede.esSedePrincipal
            ? 'h-4 w-4 bg-emerald-600'
            : 'h-3 w-3 bg-blue-600'"
          :aria-label="`Ver sede ${sede.nombre}`"
          :aria-expanded="activeSlug === sede.slug"
          @mouseenter="onDotEnter(sede.slug)"
          @mouseleave="onDotLeave"
          @click.stop="onDotClick(sede.slug)"
        />

        <!-- Tooltip -->
        <div
          v-if="activeSlug === sede.slug"
          class="absolute z-20 w-52 rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-3 text-left"
          :class="tooltipClasses(sede.xPct, sede.yPct)"
          role="tooltip"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {{ sede.ciudad }}
          </p>
          <p class="mt-0.5 text-sm font-bold text-gray-900 leading-tight">
            {{ sede.nombre }}
          </p>
          <p class="mt-1 text-xs text-gray-500">{{ sede.direccion }}</p>

          <div class="mt-2 space-y-1 text-xs">
            <a
              :href="`tel:${sede.telefono}`"
              class="flex items-center gap-1 text-gray-600 hover:text-blue-600"
            >
              <svg class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              {{ sede.telefono }}
            </a>
            <a
              :href="`https://wa.me/57${sede.whatsapp.replace(/\D/g, '')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 text-gray-600 hover:text-emerald-600"
            >
              <svg class="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.531 5.85L.057 23.273a.75.75 0 00.92.92l5.424-1.474A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 01-4.964-1.363l-.354-.21-3.668.997.975-3.577-.23-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
              </svg>
              WhatsApp
            </a>
          </div>

          <a
            :href="`/sedes/${sede.slug}`"
            class="mt-3 flex items-center justify-between rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            @click.stop
          >
            Ver sede
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </template>
  </div>
</template>
