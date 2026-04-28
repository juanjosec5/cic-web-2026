<script setup lang="ts">
import { ref, computed } from 'vue';

interface Exam {
  slug: string;
  nombre: string;
  categoria: string;
  categoriaLabel: string;
  nombresAlternativos: string[];
  requiereAyuno: boolean;
}

const props = defineProps<{ exams: Exam[] }>();

const query = ref('');
const INITIAL_SHOW = 20;

const hasQuery = computed(() => query.value.trim().length > 0);

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim();
  if (!q) return props.exams.slice(0, INITIAL_SHOW);
  return props.exams.filter(
    (e) =>
      e.nombre.toLowerCase().includes(q) ||
      e.nombresAlternativos.some((n) => n.toLowerCase().includes(q))
  );
});
</script>

<template>
  <div>
    <!-- Search input -->
    <div class="search-wrapper">
      <span class="search-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
      </span>
      <input
        v-model="query"
        type="search"
        placeholder="Buscar examen por nombre..."
        class="search-input"
        aria-label="Buscar examen por nombre"
      />
    </div>

    <!-- Result count -->
    <p v-if="hasQuery" class="result-count" aria-live="polite">
      {{ filtered.length }} resultado{{ filtered.length !== 1 ? 's' : '' }}
    </p>

    <!-- Results list -->
    <ul v-if="filtered.length > 0" role="list" class="result-list">
      <li v-for="exam in filtered" :key="exam.slug">
        <a :href="`/examenes/${exam.slug}`" class="result-row">
          <div class="result-left">
            <span class="result-nombre">{{ exam.nombre }}</span>
            <span class="result-categoria">{{ exam.categoriaLabel }}</span>
          </div>
          <div class="result-right">
            <span v-if="exam.requiereAyuno" class="ayuno-badge">Ayuno</span>
            <span class="result-arrow" aria-hidden="true">→</span>
          </div>
        </a>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else-if="hasQuery" class="empty-state">
      <p class="empty-main">No encontramos "{{ query }}" en el catálogo.</p>
      <p class="empty-sub">Intenta con otro nombre o contáctanos por WhatsApp.</p>
    </div>

    <!-- Hint when no query -->
    <p v-if="!hasQuery && exams.length > INITIAL_SHOW" class="search-hint">
      Escribe para buscar entre los {{ exams.length }} exámenes disponibles
    </p>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: white;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.search-input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.result-count {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.result-list {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  list-style: none;
  padding: 0;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.result-row:hover {
  border-color: #fca5a5;
  background-color: #fff1f2;
}

.result-left {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.375rem;
  min-width: 0;
}

.result-nombre {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.result-categoria {
  font-size: 0.75rem;
  color: #9ca3af;
}

.result-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: 0.75rem;
}

.ayuno-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: #fef3c7;
  font-size: 0.75rem;
  font-weight: 500;
  color: #92400e;
}

.result-arrow {
  font-size: 0.875rem;
  color: #9ca3af;
}

.empty-state {
  margin-top: 2rem;
  text-align: center;
}

.empty-main {
  font-size: 0.875rem;
  color: #6b7280;
}

.empty-sub {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.search-hint {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
