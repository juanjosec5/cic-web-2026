# Plan: Homepage CMS + Horario Day-Order Fix

## Overview

Two independent changes shipped together:

1. **Horario day-order fix** — quick, one-file change
2. **Homepage editable via Sanity** — new `paginaInicio` singleton document; every hardcoded text block on the homepage becomes editable in Sanity Studio without a code deploy

---

## 1. Horario Day-Order Fix

### Problem
`Object.entries(sede.horario)` returns keys in JavaScript object insertion order, which may not match Mon → Sun depending on how Sanity returns the data.

### Fix
**File:** `src/pages/sedes/[slug].astro`

Replace the `Object.entries` iteration with an explicit ordered key array:

```typescript
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
```

Template change:
```astro
{DIAS.map((dia) => {
  const horas = sede.horario[dia];
  return horas && horas !== 'TODO' ? (
    <tr class="even:bg-gray-50">
      <th scope="row" class="py-2 pr-4 capitalize text-left font-medium text-gray-700">{dia}</th>
      <td class="py-2 text-gray-600">{horas}</td>
    </tr>
  ) : null;
})}
```

No changes needed to `src/sanity/types.ts` — the `Horario` interface already uses the correct Spanish key names.

---

## 2. Homepage CMS — paginaInicio Singleton

### Problem
The following homepage sections are hardcoded strings that require a code deploy to change:

| Section | Currently hardcoded |
|---------|-------------------|
| **Hero** | h1 title, subtitle paragraph, 3 CTA button labels |
| **Pilares** (4 cards) | Each card title + description |
| **Audiencias** (3 cards) | Each card title, description, link labels |
| **Calidad** (3 items) | Each item title + description |

Already content-driven (no change needed): Promo banner, Services, Aliados, Exam categories, Sede map.

### Solution
A **singleton** Sanity document type `paginaInicio` — one document, all homepage content. The Astro template falls back to the current hardcoded strings when the Sanity document doesn't exist yet, so nothing breaks on deploy.

---

## Files to Create

### `src/sanity/schemas/paginaInicio.ts`

```typescript
import { defineField, defineType } from 'sanity';

export const paginaInicioType = defineType({
  name: 'paginaInicio',
  title: 'Página de Inicio',
  type: 'document',
  __experimental_actions: ['update', 'publish'], // singleton — no create/delete
  fields: [
    // ── Hero ────────────────────────────────────────────────────────
    defineField({ name: 'heroTitulo', title: 'Título principal', type: 'string',
      initialValue: 'Resultados que transforman vidas' }),
    defineField({ name: 'heroSubtitulo', title: 'Subtítulo', type: 'text', rows: 2,
      description: 'Texto debajo del título. Los conteos de exámenes y sedes son dinámicos.' }),
    defineField({ name: 'heroCta1Label', title: 'CTA 1 — Texto', type: 'string',
      initialValue: 'Encontrar sede' }),
    defineField({ name: 'heroCta1Url', title: 'CTA 1 — URL', type: 'string',
      initialValue: '/sedes' }),
    defineField({ name: 'heroCta2Label', title: 'CTA 2 — Texto', type: 'string',
      initialValue: 'Ver exámenes' }),
    defineField({ name: 'heroCta2Url', title: 'CTA 2 — URL', type: 'string',
      initialValue: '/examenes' }),
    defineField({ name: 'heroCtaWaLabel', title: 'CTA WhatsApp — Texto', type: 'string',
      initialValue: 'Contáctanos por WhatsApp' }),

    // ── Pilares ─────────────────────────────────────────────────────
    defineField({
      name: 'pilares',
      title: 'Pilares (4 tarjetas)',
      type: 'array',
      description: 'Exactamente 4 items. Los íconos son fijos por posición (1: reloj, 2: calendario, 3: pruebas, 4: domicilio).',
      of: [defineField({
        name: 'pilar', title: 'Pilar', type: 'object',
        fields: [
          defineField({ name: 'titulo', title: 'Título', type: 'string' }),
          defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 2 }),
        ],
        preview: { select: { title: 'titulo', subtitle: 'descripcion' } },
      })],
      validation: R => R.max(4).min(4),
    }),

    // ── Audiencias ───────────────────────────────────────────────────
    defineField({
      name: 'audiencias',
      title: 'Audiencias (3 tarjetas)',
      type: 'array',
      description: 'Exactamente 3 items: Paciente, Empresa, Laboratorio/IPS.',
      of: [defineField({
        name: 'audiencia', title: 'Audiencia', type: 'object',
        fields: [
          defineField({ name: 'titulo', title: 'Título', type: 'string' }),
          defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 2 }),
          defineField({
            name: 'links', title: 'Links', type: 'array',
            of: [defineField({
              name: 'link', title: 'Link', type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Texto', type: 'string' }),
                defineField({ name: 'url', title: 'URL', type: 'string' }),
              ],
              preview: { select: { title: 'label', subtitle: 'url' } },
            })],
          }),
        ],
        preview: { select: { title: 'titulo', subtitle: 'descripcion' } },
      })],
      validation: R => R.max(3).min(3),
    }),

    // ── Calidad ──────────────────────────────────────────────────────
    defineField({
      name: 'calidad',
      title: 'Calidad (3 items)',
      type: 'array',
      description: 'Exactamente 3 items de la franja de calidad.',
      of: [defineField({
        name: 'calidadItem', title: 'Item', type: 'object',
        fields: [
          defineField({ name: 'titulo', title: 'Título', type: 'string' }),
          defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 3 }),
          defineField({ name: 'linkLabel', title: 'Link — Texto (opcional)', type: 'string' }),
          defineField({ name: 'linkUrl', title: 'Link — URL (opcional)', type: 'string' }),
        ],
        preview: { select: { title: 'titulo', subtitle: 'descripcion' } },
      })],
      validation: R => R.max(3).min(3),
    }),
  ],
  preview: { prepare: () => ({ title: 'Página de Inicio' }) },
});
```

---

## Files to Modify

### `src/sanity/schemas/index.ts`

```typescript
import { sedeType } from './sede';
import { promocionMesType } from './promocionMes';
import { paginaInicioType } from './paginaInicio';

export const schemaTypes = [sedeType, promocionMesType, paginaInicioType];
```

### `src/sanity/queries.ts`

Add at the bottom:

```typescript
export const PAGINA_INICIO_QUERY = `
  *[_type == "paginaInicio"][0] {
    heroTitulo, heroSubtitulo,
    heroCta1Label, heroCta1Url,
    heroCta2Label, heroCta2Url,
    heroCtaWaLabel,
    pilares[] { titulo, descripcion },
    audiencias[] { titulo, descripcion, links[] { label, url } },
    calidad[] { titulo, descripcion, linkLabel, linkUrl },
  }
`;
```

### `src/sanity/types.ts`

Add `PaginaInicio` interface:

```typescript
export interface PaginaInicio {
  heroTitulo?: string;
  heroSubtitulo?: string;
  heroCta1Label?: string;
  heroCta1Url?: string;
  heroCta2Label?: string;
  heroCta2Url?: string;
  heroCtaWaLabel?: string;
  pilares?: { titulo: string; descripcion: string }[];
  audiencias?: {
    titulo: string;
    descripcion: string;
    links: { label: string; url: string }[];
  }[];
  calidad?: {
    titulo: string;
    descripcion: string;
    linkLabel?: string;
    linkUrl?: string;
  }[];
}
```

### `src/pages/index.astro`

**Fetch** (extend the existing `Promise.all`):

```typescript
const [sedes, promo, paginaInicio] = await Promise.all([
  client.fetch<Sede[]>(ALL_SEDES_QUERY),
  client.fetch<PromoMes | null>(PROMO_MES_QUERY),
  client.fetch<PaginaInicio | null>(PAGINA_INICIO_QUERY),
]);
```

**Hero section** — replace hardcoded strings with fallback pattern:

```astro
<h1 id="hero-heading">{paginaInicio?.heroTitulo ?? 'Más que resultados'}</h1>
<p>
  Más de {examenes.length} exámenes clínicos —
  {paginaInicio?.heroSubtitulo ?? 'resultados el mismo día, sin cita previa, en'} {sedes.length} sedes del Valle del Cauca.
</p>
<!-- CTAs -->
<a href={paginaInicio?.heroCta1Url ?? '/sedes'}>
  {paginaInicio?.heroCta1Label ?? 'Encontrar sede'}
</a>
<a href={paginaInicio?.heroCta2Url ?? '/examenes'}>
  {paginaInicio?.heroCta2Label ?? 'Ver exámenes'}
</a>
<a href={waHero}>{paginaInicio?.heroCtaWaLabel ?? 'Contáctanos por WhatsApp'}</a>
```

**Pilares section** — render from Sanity array when available, keep icons hardcoded by position:

```astro
{(paginaInicio?.pilares ?? DEFAULT_PILARES).map((pilar, i) => (
  <li><!-- icon determined by index i -->{pilar.titulo}{pilar.descripcion}</li>
))}
```

`DEFAULT_PILARES` is a const defined in frontmatter with the 4 current hardcoded values.

**Audiencias section** — same fallback pattern with `DEFAULT_AUDIENCIAS`.

**Calidad section** — same fallback pattern with `DEFAULT_CALIDAD`.

---

## Sanity Studio Setup (editor action required after deploy)

1. Open Sanity Studio (`npm run studio:dev` or `cic-laboratorios.sanity.studio`)
2. Click **Página de Inicio** in the left sidebar
3. Click **Create** — fill in all fields using the current hardcoded text as reference
4. Publish — site rebuilds with Sanity-driven content

---

## Verification

1. `npm run type-check` — 0 errors
2. `npm run build` — completes; homepage renders with hardcoded fallbacks (Sanity document not yet created)
3. Sede detail page → horario rows appear Mon → Sun order
4. Create `paginaInicio` document in Studio → publish → Vercel rebuilds → updated text appears on homepage
5. Pilares, audiencias, calidad arrays filled with 4/3/3 items → each section updates correctly
