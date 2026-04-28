# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions track milestones, not npm semver — this is a content/site project.

---

## [Unreleased]

### Added (breadcrumbs on main index pages)
- `src/pages/sedes/index.astro`, `src/pages/examenes/index.astro`, `src/pages/servicios/index.astro`, `src/pages/empresas.astro`, `src/pages/nosotros/index.astro`: added `Inicio → <Page>` breadcrumb at the top of each page using the existing `Breadcrumb` component

### Fixed (exam search category order)
- `src/components/islands/ExamSearch.vue`: category pills now render between the search input and the results list (previously appeared below results); categories accepted as `readonly Categoria[]` prop from the Astro page
- `src/pages/examenes/index.astro`: `CATEGORIAS` passed as `categorias` prop to `ExamSearch`; standalone category pills section removed (now owned by the island)

### Added (exam search + detail redesign)
- `src/components/islands/ExamSearch.vue`: client-side filter island replacing the disabled stub — `query` ref, `INITIAL_SHOW = 20` cap, `filtered` computed filtering `nombre` and `nombresAlternativos`; scoped CSS search input with red focus ring, amber "Ayuno" pill, result count (`aria-live`), empty state, and hint text; SVG magnifying glass icon
- `src/pages/examenes/index.astro`: wired `ExamSearch` island with `examenesParaSearch` array built at build time (slug, nombre, categoria, categoriaLabel, nombresAlternativos, requiereAyuno)
- `src/pages/examenes/[slug].astro`: header card with category label + CTAs inside; always-rendered ¿Qué es?, ¿Para qué sirve?, and Preparación sections with `[ próximamente ]` placeholders; sedes overflow pattern (first 3 pills + `+N más` link); related exams as full-width 1-col bordered links; `getStaticPaths` builds `allSedesData` sorted sede principal first as fallback when `sedesDisponibles` is empty
- `src/pages/sedes/[slug].astro`: header card with 3 CTAs (green WhatsApp / ghost Llamar / ghost Cómo llegar); 2-col horario + contacto cards; map card with "Abrir en Google Maps →" button; 6-service ✓/— grid (`class:list` green/gray); blue promo banner when `domicilioGratisDesde` is set; gallery always renders (placeholder squares when no photos); convenios pills with `+N otros` overflow; nearby sedes as plain text links

### Changed (layout standardization)
- All inner pages standardized to `mx-auto max-w-4xl px-4 py-12 sm:px-6` wrapper (14 pages updated)
- `src/pages/index.astro`: section wrappers changed from `max-w-7xl` → `max-w-5xl` (8 occurrences); hero centered-text wrapper remains `max-w-4xl`

### Added (SEO pass)
- `src/components/SEO.astro`: `og:locale` (`es_CO`); `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` (summary_large_image); `ogImage` is now resolved to an absolute URL via `Astro.site?.origin` before being set on og:image and twitter:image (required by Open Graph crawlers)
- `src/lib/seo.ts`: `OrganizationJsonLd` interface and `buildOrganizationJsonLd()` helper — returns `@type: Organization` with name, url, logo, telephone, address, and areaServed pulled from `SITE_CONFIG`; `SITE_CONFIG` imported into `seo.ts`
- `src/pages/index.astro`: homepage now passes `jsonLd={buildOrganizationJsonLd()}` so Google sees Organization structured data on the root page
- `public/robots.txt`: allows all crawlers; points to `sitemap-index.xml`

### Changed (SEO pass)
- `src/pages/index.astro`: `title="Inicio"` → `title="Laboratorio Clínico en el Valle del Cauca"` — rendered title is now `"Laboratorio Clínico en el Valle del Cauca | CIC Laboratorios"`
- `src/layouts/SedeLayout.astro`: `title={sede.nombre}` → `title={\`Laboratorio Clínico en ${sede.ciudad}\`}` — eliminates duplicate brand in title (previous: "CIC Laboratorios — Tuluá | CIC Laboratorios")
- `src/layouts/BaseLayout.astro`: skip-to-content link color `focus:bg-blue-600` → `focus:bg-red-600` (brand consistency)

### Added (Tier 2 design pass + a11y)
- `src/styles/global.css`: red `*:focus-visible` outline (2px solid #dc2626) across all interactive elements; `@media (prefers-reduced-motion: reduce)` disables `.sede-pulse` animation
- `src/components/Header.astro`: wordmark changed from `text-blue-700` → `text-red-600`; nav links use `class:list` with `Astro.url.pathname` comparison to highlight the active section (red-50 bg / red-700 text / semibold); hamburger focus ring updated from `ring-blue-500` → `ring-red-500`
- `src/pages/sedes/index.astro`: lifted-card styling for each sede (border, hover shadow + translate), green pill badge for "Sede principal", gray address text, red "Ver detalles →" link
- `src/pages/sedes/[slug].astro`: three-button CTA row (green WhatsApp / ghost Llamar / ghost Cómo llegar); horario table with alternating `even:bg-gray-50` rows, `<caption class="sr-only">`, and proper cell padding; services grid → pill tags; map placeholder → styled gray rounded div; nearby-sedes → bordered mini-cards with hover lift; secondary arrow links styled
- `src/pages/examenes/index.astro`: category grid → flex pill tags; raw `<em>` search placeholder → styled dashed coming-soon box
- `src/pages/examenes/[slug].astro`: 4-stat strip → grid of bordered stat cells with small uppercase labels; CTA group → green + ghost + ghost buttons; sedes list → small pill tags; related exams → bordered card links with hover red border; WhatsApp CTA → gray-50 banner section with centered heading + green button; medical disclaimer → muted italic text with `border-t`
- `src/pages/examenes/categoria/[slug].astro`: exam list → bordered card links with amber "Ayuno" badge inline
- `src/pages/examenes/perfiles/index.astro`: bare list items → full-card links with exam count pill and optional price display
- `src/pages/examenes/perfiles/[slug].astro`: included exam slugs humanized to readable names (`replace(/-/g,' ')` + capitalize); ✓ checkmark bullet styling; CTA → green WhatsApp button
- `src/pages/servicios/index.astro`: added missing `max-w-7xl` layout wrapper; service list → group full-card links (same pattern as homepage — hover lift, red title, sliding arrow)
- `src/pages/servicios/[slug].astro`: CTA → green button for WhatsApp, red button otherwise; sedes list → pill tags
- `src/pages/pacientes/preparacion.astro`: anchor nav → pill tags; all section `<h2>` headings get `border-l-4 border-red-300 pl-4` accent
- `src/pages/pacientes/derechos-deberes.astro`: each column section wrapped in `rounded-xl bg-gray-50 p-6` card; headings get red accent border; ordered lists styled with `list-decimal list-inside`
- `src/pages/pacientes/preguntas-frecuentes.astro`: `<dl>` → `<div>`; `<details>` accordion gets bordered card wrapper, `<summary>` with chevron SVG that rotates 180° on open, answer panel with `border-t`; bottom CTAs → green + ghost buttons
- `src/pages/contacto.astro`: contact info section wrapped in bordered card; CTA links → green button (WhatsApp) + ghost button (Llamar); map placeholder → styled gray rounded div; email link red
- `src/pages/empresas.astro`: value-prop articles → bordered cards; service articles → bordered cards with red text links; CTA group → green + ghost buttons
- `src/pages/laboratorios.astro`: differentiator articles → bordered cards; CTA group → green + ghost buttons
- `src/components/islands/WhatsAppFloating.vue`: replaced emoji 💬 with official WhatsApp SVG icon; replaced inline `style` attribute with `<style scoped>`; added `wa-enter` CSS animation (fade + translateY 1rem → 0, 300ms ease); hover scales button to 1.1×

### Added
- `SedeMapD3.vue`: interactive Valle del Cauca department map as a Vue island — real 121-point boundary from GADM/DANE dataset; linear geographic projection (replaces D3 which broke under Vue reactive proxy); SVG `<polygon>` outline (light red fill `#fff1f2`) + animated `<circle>` markers; pulse-ring animation via CSS `@keyframes`; hover tooltip on desktop / tap-toggle on mobile shows sede name, city, address, phone, and "Ver sede completa" CTA; Buga (sede principal) rendered larger and green; fixed-position tooltip via `<Teleport to="body">` guarded by `isMounted` to avoid SSR hydration mismatch; `client:visible` hydration; hidden on mobile (`hidden sm:block`) to avoid dot overlap; count label above + dot legend + hover hint below
- `public/geojson/valle-del-cauca.json`: full 726-point real Valle del Cauca boundary from GADM/DANE source (replaces hand-crafted approximation)
- `src/content/sedes/*.json`: added `lat`/`lng` coordinates to all 17 sede entries
- `src/pages/sedes/index.astro`: replaced `[ Mapa interactivo — próximamente ]` placeholder with `SedeMapD3` island
- `src/pages/index.astro`: added `SedeMapD3` island to homepage sede map section (replaces TODO placeholder); same mobile-hidden + legend pattern as sedes page

### Changed
- `SedeMapD3.vue`: dropped D3-geo entirely after `geoMercator` projection failed under Vue reactive proxy (all 17 sedes clustered within 3 px at default scale 150); replaced with simple linear `project(lng, lat, w, h)` function — indistinguishable from Mercator at 1.5° scale; SVG is the component root element so `getBoundingClientRect().width` is measured directly (avoids `clientHeight: 0` on aspect-ratio containers); GeoJSON polygon now hardcoded in component (no async fetch)
- `public/geojson/valle-del-cauca.json`: updated from 23-point hand-crafted approximation to real 726-point GADM/DANE dataset
- `src/styles/global.css`: added `@layer base` typography — h1 3xl→4xl responsive / h2 2xl / h3 xl / h4 lg, all semibold/bold with tight tracking; `p` leading-relaxed; links inherit color (no forced blue); buttons get cursor-pointer and 150ms transition

### Added (homepage design pass)
- `src/pages/index.astro` — visual design pass on all interactive elements:
  - **Hero CTAs**: three-button hierarchy — primary (red filled), secondary (ghost/border), WhatsApp (green); all with `active:scale-95` press feel
  - **Audience cards** ("Soy paciente / empresa / laboratorio"): `rounded-xl border` card with `hover:shadow-lg hover:-translate-y-1` lift; internal links styled as red accent arrows
  - **Exam category links**: grid → `flex-wrap` pill tags (`rounded-full bg-gray-100`) with `hover:bg-red-50 hover:text-red-700`
  - **Service cards**: entire card is a block link with `group-hover` — title turns red, arrow slides right via `group-hover:translate-x-1`
  - **Secondary CTAs** ("Ver todas las sedes →" etc.): consistent `text-sm font-medium hover:text-red-600 transition-colors`
- `src/content/sedes/*.json`: added approximate `lat`/`lng` coordinates to all 17 sede entries (city-level accuracy, sufficient for the map visualization)
- `src/pages/sedes/index.astro`: replaced `[ Mapa interactivo — próximamente ]` placeholder with `SedeMapD3` island
- `Breadcrumb.astro`: reusable breadcrumb component; also applied to `examenes/categoria/[slug].astro`, `examenes/perfiles/[slug].astro`, and `examenes/perfiles/index.astro` which were missed in the structural layout pass (added layout wrappers, replaced bare `<nav>` breadcrumbs, fixed hardcoded WhatsApp in perfiles) — accepts `items: Array<{ label: string; href?: string }>`, renders styled `<nav>` with muted ancestor links (`text-gray-500`), light separator (`text-gray-300`), and bold current-page span (`font-medium text-gray-800`); replaces inline nav blocks in `sedes/[slug].astro`, `examenes/[slug].astro`, and `servicios/[slug].astro`
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
