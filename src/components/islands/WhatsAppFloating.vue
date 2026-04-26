<script setup lang="ts">
/**
 * WhatsAppFloating.vue
 * Sticky floating WhatsApp button, bottom-right corner.
 * Renders a plain anchor tag pointing to wa.me — no external SDK needed.
 *
 * TODO (design-needed): Replace emoji/text with SVG WhatsApp icon.
 * TODO (design-needed): Add entrance animation, tooltip on hover.
 */
import { computed } from 'vue';

interface Props {
  /** Phone number in international format without +, e.g. "573001234567" */
  phone: string;
  /** Pre-filled message text (optional) */
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: '¡Hola! Quisiera información sobre los servicios de CIC Laboratorios.',
});

const waUrl = computed(() => {
  const encodedMsg = encodeURIComponent(props.message ?? '');
  return `https://wa.me/${props.phone}?text=${encodedMsg}`;
});
</script>

<template>
  <a
    :href="waUrl"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contáctanos por WhatsApp"
    style="
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 9999px;
      background-color: #25d366;
      color: white;
      font-size: 1.5rem;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    "
  >
    <!-- TODO (design-needed): Use WhatsApp SVG icon instead of emoji -->
    💬
  </a>
</template>
