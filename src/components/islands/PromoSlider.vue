<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  imagenes: string[];
  ctaUrl: string;
  alt: string;
}>();

const AUTOPLAY_MS = 5000;

const activeIndex = ref(0);
const touchStartX = ref<number | null>(null);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.imagenes.length;
}

function prev() {
  activeIndex.value = (activeIndex.value - 1 + props.imagenes.length) % props.imagenes.length;
}

function goTo(i: number) {
  activeIndex.value = i;
}

function startAutoplay() {
  if (autoplayTimer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  autoplayTimer = setInterval(next, AUTOPLAY_MS);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

onMounted(startAutoplay);
onUnmounted(stopAutoplay);

function onTouchStart(e: TouchEvent) {
  stopAutoplay();
  touchStartX.value = e.touches[0].clientX;
}

function onTouchEnd(e: TouchEvent) {
  if (touchStartX.value !== null) {
    const delta = e.changedTouches[0].clientX - touchStartX.value;
    touchStartX.value = null;
    if (Math.abs(delta) >= 50) {
      if (delta < 0) next();
      else prev();
    }
  }
  startAutoplay();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
}
</script>

<template>
  <div
    class="relative aspect-[8/3] overflow-hidden rounded-2xl"
    role="region"
    aria-roledescription="carousel"
    :aria-label="alt"
    tabindex="0"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
    @focusin="stopAutoplay"
    @focusout="startAutoplay"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    @keydown="onKeydown"
  >
    <a :href="ctaUrl" target="_blank" rel="noopener noreferrer" class="absolute inset-0" :aria-label="alt">
      <img
        v-for="(foto, i) in imagenes"
        :key="foto"
        :src="`${foto}?w=1200&auto=format&q=85`"
        :srcset="[
          `${foto}?w=640&auto=format&q=85 640w`,
          `${foto}?w=1024&auto=format&q=85 1024w`,
          `${foto}?w=1600&auto=format&q=85 1600w`,
        ].join(', ')"
        sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1600px"
        alt=""
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        :class="i === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'"
        :loading="i === 0 ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
      />
    </a>

    <!-- Prev / Next -->
    <button
      type="button"
      class="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy-800 shadow-sm transition-colors hover:bg-white"
      aria-label="Imagen anterior"
      @click="prev"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
    <button
      type="button"
      class="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy-800 shadow-sm transition-colors hover:bg-white"
      aria-label="Imagen siguiente"
      @click="next"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>

    <!-- Dots -->
    <div class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
      <button
        v-for="(foto, i) in imagenes"
        :key="foto"
        type="button"
        class="h-2 rounded-full transition-all"
        :class="i === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'"
        :aria-label="`Ir a la imagen ${i + 1}`"
        :aria-current="i === activeIndex"
        @click="goTo(i)"
      />
    </div>

    <span class="sr-only" aria-live="polite">Imagen {{ activeIndex + 1 }} de {{ imagenes.length }}</span>
  </div>
</template>
