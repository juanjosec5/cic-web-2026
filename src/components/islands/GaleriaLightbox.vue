<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  fotos: string[];
  nombre: string;
}>();

const activeIndex = ref<number | null>(null);
const touchStartX = ref<number | null>(null);

const isOpen = computed(() => activeIndex.value !== null);
const activePhoto = computed(() =>
  activeIndex.value !== null ? props.fotos[activeIndex.value] : null
);
const hasPrev = computed(() => activeIndex.value !== null && activeIndex.value > 0);
const hasNext = computed(() =>
  activeIndex.value !== null && activeIndex.value < props.fotos.length - 1
);

function open(index: number) {
  activeIndex.value = index;
  document.body.style.overflow = 'hidden';
}

function close() {
  activeIndex.value = null;
  document.body.style.overflow = '';
}

function prev() {
  if (hasPrev.value && activeIndex.value !== null) activeIndex.value--;
}

function next() {
  if (hasNext.value && activeIndex.value !== null) activeIndex.value++;
}

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX;
}

function onTouchEnd(e: TouchEvent) {
  if (touchStartX.value === null) return;
  const delta = e.changedTouches[0].clientX - touchStartX.value;
  touchStartX.value = null;
  if (Math.abs(delta) < 50) return;
  if (delta < 0) next();
  else prev();
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <!-- Thumbnail grid -->
  <ul role="list" class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
    <li v-for="(foto, i) in fotos" :key="i">
      <button
        type="button"
        class="block w-full cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
        :aria-label="`Ver foto ${i + 1} de ${nombre}`"
        @click="open(i)"
      >
        <img
          :src="`${foto}?w=800&h=450&fit=crop&auto=format&q=75`"
          :alt="`Foto ${i + 1} de ${nombre}`"
          class="aspect-video w-full object-cover transition-opacity duration-200 hover:opacity-90"
          loading="lazy"
          decoding="async"
          width="400"
          height="225"
        />
      </button>
    </li>
  </ul>

  <!-- Lightbox overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      :aria-label="`Galería de ${nombre}`"
      @click.self="close"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <!-- Close -->
      <button
        type="button"
        class="absolute right-4 top-4 rounded-full p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Cerrar galería"
        @click="close"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Counter -->
      <span class="absolute left-1/2 top-5 -translate-x-1/2 text-sm text-white/50 tabular-nums">
        {{ (activeIndex ?? 0) + 1 }} / {{ fotos.length }}
      </span>

      <!-- Prev -->
      <button
        v-if="hasPrev"
        type="button"
        class="absolute left-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors"
        aria-label="Foto anterior"
        @click="prev"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <!-- Active image -->
      <img
        v-if="activePhoto"
        :src="`${activePhoto}?w=1600&h=900&fit=crop&auto=format&q=85`"
        :alt="`Foto ${(activeIndex ?? 0) + 1} de ${nombre}`"
        class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        draggable="false"
      />

      <!-- Next -->
      <button
        v-if="hasNext"
        type="button"
        class="absolute right-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors"
        aria-label="Foto siguiente"
        @click="next"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </Teleport>
</template>
