<script setup lang="ts">
/**
 * LocationMap.vue — STUB
 *
 * TODO (blocking-for-v1.1): Implement real map integration.
 * Candidates: Leaflet.js + OpenStreetMap (free), Google Maps Embed API,
 * or Mapbox GL JS.
 * Props to implement: lat, lng, nombre, zoom.
 */
defineProps<{
  lat?: number;
  lng?: number;
  nombre?: string;
}>();
</script>

<template>
  <div
    style="
      border: 2px dashed #ccc;
      padding: 2rem;
      text-align: center;
      background: #f9f9f9;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    <p>[ Map placeholder — {{ nombre ?? 'Ubicación' }} ({{ lat }}, {{ lng }}) ]</p>
  </div>
</template>
