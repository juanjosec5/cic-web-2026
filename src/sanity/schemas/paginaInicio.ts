import { defineField, defineType, type StringRule } from 'sanity';

const validateUrl = (R: StringRule) =>
  R.custom((val) => {
    if (!val) return true;
    if (/^(\/|https?:\/\/)/.test(val)) return true;
    return 'Debe ser una ruta relativa (/) o una URL https://';
  });

export const paginaInicioType = defineType({
  name: 'paginaInicio',
  title: 'Página de Inicio',
  type: 'document',
  // @ts-expect-error experimental API not in Sanity type definitions
  __experimental_actions: ['update', 'publish'],
  fields: [
    // ── Hero ────────────────────────────────────────────────────────────────
    defineField({
      name: 'heroTitulo',
      title: 'Título principal',
      type: 'string',
      initialValue: 'Resultados que transforman vidas',
    }),
    defineField({
      name: 'heroSubtitulo',
      title: 'Subtítulo (parte central)',
      type: 'text',
      rows: 2,
      description: 'Texto entre el conteo de exámenes y el de sedes. Ej: "resultados el mismo día, sin cita previa, en"',
      initialValue: 'resultados el mismo día, sin cita previa, en',
    }),
    defineField({
      name: 'heroCta1Label',
      title: 'CTA 1 — Texto (rojo)',
      type: 'string',
      initialValue: 'Encontrar sede',
    }),
    defineField({
      name: 'heroCta1Url',
      title: 'CTA 1 — URL',
      type: 'string',
      initialValue: '/sedes',
      validation: validateUrl,
    }),
    defineField({
      name: 'heroCta2Label',
      title: 'CTA 2 — Texto (borde)',
      type: 'string',
      initialValue: 'Ver exámenes',
    }),
    defineField({
      name: 'heroCta2Url',
      title: 'CTA 2 — URL',
      type: 'string',
      initialValue: '/examenes',
      validation: validateUrl,
    }),
    defineField({
      name: 'heroCtaWaLabel',
      title: 'CTA WhatsApp — Texto',
      type: 'string',
      initialValue: 'Contáctanos por WhatsApp',
    }),

    // ── Pilares ─────────────────────────────────────────────────────────────
    defineField({
      name: 'pilares',
      title: 'Pilares (4 tarjetas)',
      type: 'array',
      description: 'Exactamente 4 items. Íconos y enlaces son fijos por posición: 1-Reloj, 2-Calendario, 3-Pruebas(→/examenes), 4-Domicilio(→/servicios/domicilio).',
      of: [
        defineField({
          name: 'pilar',
          title: 'Pilar',
          type: 'object',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string' }),
            defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'descripcion' } },
        }),
      ],
      validation: (R) => R.min(4).max(4),
    }),

    // ── Audiencias ───────────────────────────────────────────────────────────
    defineField({
      name: 'audiencias',
      title: 'Audiencias (3 tarjetas)',
      type: 'array',
      description: 'Exactamente 3 items: Paciente, Empresa, Laboratorio/IPS.',
      of: [
        defineField({
          name: 'audiencia',
          title: 'Audiencia',
          type: 'object',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string' }),
            defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 2 }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineField({
                  name: 'link',
                  title: 'Link',
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Texto', type: 'string' }),
                    defineField({ name: 'url', title: 'URL', type: 'string', validation: validateUrl }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'url' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'descripcion' } },
        }),
      ],
      validation: (R) => R.min(3).max(3),
    }),

    // ── Calidad ──────────────────────────────────────────────────────────────
    defineField({
      name: 'calidad',
      title: 'Calidad (3 items)',
      type: 'array',
      description: 'Exactamente 3 items de la franja de calidad y tecnología.',
      of: [
        defineField({
          name: 'calidadItem',
          title: 'Item',
          type: 'object',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string' }),
            defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 3 }),
            defineField({ name: 'linkLabel', title: 'Link — Texto (opcional)', type: 'string' }),
            defineField({ name: 'linkUrl', title: 'Link — URL (opcional)', type: 'string', validation: validateUrl }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'descripcion' } },
        }),
      ],
      validation: (R) => R.min(3).max(3),
    }),
    // ── Testimonios ──────────────────────────────────────────────────────────
    defineField({
      name: 'testimonios',
      title: 'Testimonios de pacientes',
      type: 'array',
      description: 'La sección se oculta si el array está vacío.',
      of: [
        defineField({
          name: 'testimonio',
          title: 'Testimonio',
          type: 'object',
          fields: [
            defineField({ name: 'texto', title: 'Texto del testimonio', type: 'text', rows: 3, validation: (R) => R.required() }),
            defineField({ name: 'nombre', title: 'Nombre del paciente', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'ciudad', title: 'Ciudad', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'cargo', title: 'Cargo / Empresa (opcional — para testimonios B2B)', type: 'string' }),
          ],
          preview: { select: { title: 'nombre', subtitle: 'texto' } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Página de Inicio' }),
  },
});
