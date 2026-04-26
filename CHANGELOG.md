# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions track milestones, not npm semver — this is a content/site project.

---

## [Unreleased]

### Added
- `src/lib/config.ts`: `SITE_CONFIG` (name, url, whatsapp, sedePrincipal from `buga.json`) and `CATEGORIAS` array — single source of truth for site-wide config; replaces all hardcoded phone/address strings across pages
- **Structural layout pass** — all pages now have `max-w-7xl mx-auto px-4` wrappers, semantic section/article/nav/address elements, mobile-first grid/flex breakpoints. Tailwind structural utilities only (no color, shadow, or border-radius classes added in this pass):
  - `index.astro`: 9 sections with layout (hero, pillars 2×2→4-col, audience 3-col, sede map, category grid, services grid, humanización, quality strip, aliados grid)
  - `sedes/index.astro`: sorted card grid (1→2→3 col), sede principal first
  - `sedes/[slug].astro`: breadcrumb, CTA group (WhatsApp/call/directions), 2-col info strip (hours + contact), map placeholder, services grid, conditional gallery/convenios sections, 3 nearby sedes; drops LocationMap stub
  - `examenes/index.astro`: header with count, category grid, Pagefind TODO
  - `examenes/[slug].astro`: breadcrumb, synonyms line, 4-stat `<dl>` strip, CTA group, ¿Qué es?, 2-col (para qué sirve / preparación), sedes list or fallback, related exams grid, WhatsApp CTA banner, medical disclaimer; sedesData and relacionadosData resolved to names at build time
  - `servicios/[slug].astro`: breadcrumb, sedes resolved to names, CTA from `SITE_CONFIG.whatsapp`
  - `empresas.astro`: 3 value-prop cards, services grid, strategic allies grid, WhatsApp CTA from `SITE_CONFIG`
  - `laboratorios.astro`: 3 differentiator cards with dynamic sede/exam counts, WhatsApp CTA
  - `nosotros/index.astro`: single-page with sticky sidebar anchor nav on desktop; 5 sections (#historia with 30+ stat, #equipo placeholder grid, #tecnologia video placeholder, #calidad, #aliados from collection)
  - `pacientes/preparacion.astro`: anchor nav for preparation categories, general + 4 typed sections
  - `pacientes/derechos-deberes.astro`: 2-col desktop layout (derechos / deberes)
  - `pacientes/preguntas-frecuentes.astro`: `<details>`/`<summary>` accordion grouped by 4 topics; WhatsApp CTA from `SITE_CONFIG`
  - `contacto.astro`: 2-col (sede principal info + CTA / map placeholder); pulls from `SITE_CONFIG`
  - `404.astro`: centered full-height layout with 3 nav links
- `BaseLayout.astro`: WhatsApp phone now pulled from `SITE_CONFIG.whatsapp` (removes hardcoded placeholder)

### Added
- `Header`: sticky top bar with wordmark, desktop nav, and mobile hamburger toggle
  - Separate `#mobile-nav-panel` element (below header bar) avoids display-property conflicts with the always-visible desktop nav
  - Hamburger button uses `aria-expanded` / `aria-controls` and swaps menu ↔ close SVG icons
  - Vanilla JS toggle with `matchMedia` listener to auto-close panel on resize to desktop
- `Footer`: dark-background footer with 3-column grid (1 col mobile → 2 col sm → 3 col lg)
  - Columns: contact `<address>`, sitemap `<nav>`, social links
  - Copyright bar separated by a top border
- `BaseLayout`: skip-to-content link as first focusable element; `<body>` uses `flex min-h-svh flex-col` so footer is always flush to the bottom; `<main>` gets `flex-1`

---

## [0.1.0] — 2026-04-25

### Added
- Initial Astro 5 scaffold with full route skeleton (31 static pages at build time)
- Content collections with Zod schemas: `examenes`, `sedes`, `servicios`, `perfiles`, `aliados`
- Sample data: 3 examenes (TSH, glucosa, hemograma), 1 perfil (prenatal), 4 servicios, 2 aliados
- Layouts: `BaseLayout`, `SedeLayout` (MedicalBusiness JSON-LD), `ExamenLayout` (MedicalTest JSON-LD)
- Components: `Header`, `Footer`, `SEO` (OG + JSON-LD), `WhatsAppFloating` (Vue island),
  `LocationMap` stub (Vue), `ExamSearch` stub (Vue)
- `src/lib/seo.ts` helpers: `buildSedeJsonLd`, `buildExamenJsonLd`
- Tailwind v4 via `@tailwindcss/vite` (no `@astrojs/tailwind`)
- `@astrojs/vue`, `@astrojs/sitemap`, `@astrojs/vercel` (static adapter)
- Pagefind installed as dev dependency (integration deferred to v1.1)
- `tsconfig.json` extending `astro/tsconfigs/strict`
- README with dev commands and folder structure

### Fixed
- Resolved all 84 TypeScript strict-mode errors across 20 files:
  - Added `interface Props` with `CollectionEntry<'x'>['data']` to all `[slug].astro` pages
  - Added explicit `CollectionEntry<'x'>` annotations to every `.map()` and `getCollection`
    filter callback that lacked inference in the template section
  - Replaced local `ExamenData` / `SedeData` interfaces in layouts with `CollectionEntry` types
  - Added `[key: string]: unknown` index signature to `MedicalBusinessJsonLd` and
    `MedicalTestJsonLd` so they satisfy `Record<string, unknown>`
  - Merged split `<script>/<script setup>` blocks in `WhatsAppFloating.vue` into a single
    `<script setup lang="ts">` with typed `interface Props`
  - Added `is:inline` to JSON-LD `<script>` in `SEO.astro` (silenced `astro(4000)` hint)

### Changed
- Replaced 2 placeholder sede entries (`buga-centro`, `tulua-principal`) with all
  17 real CIC Laboratorios locations sourced from production data:
  Andalucía, Ansermanuevo, Buga (sede principal), Bugalagrande, Caicedonia,
  Cartago, Darién, Guacarí, La Cumbre, La Unión, Obando, Restrepo, Roldanillo,
  San Pedro, Tuluá, Yotoco, Zarzal
- `lat` / `lng` schema fields made optional (coordinates not yet available for all sedes)
- `buildSedeJsonLd` now conditionally emits `geo` block only when both coordinates present
- Updated `sedesDisponibles` slug references in examenes and servicios entries from
  `buga-centro` / `tulua-principal` → `buga` / `tulua`
- Build output: 31 → 46 static pages

### Known gaps (TODOs planted)
- `horario` missing for 16 of 17 sedes (only Andalucía has hours data)
- `lat` / `lng` not yet populated for any sede
- Pagefind search not configured (stub component in place)
- LocationMap is a stub (no real map library)
- No visual design — pages are unstyled skeleton HTML
- WhatsApp phone hardcoded; should move to env var

---

[Unreleased]: https://github.com/juanjosec5/cic-web-2026/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/juanjosec5/cic-web-2026/releases/tag/v0.1.0
