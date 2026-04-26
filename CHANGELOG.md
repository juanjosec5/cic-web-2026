# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions track milestones, not npm semver — this is a content/site project.

---

## [Unreleased]

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
