# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions track milestones, not npm semver — this is a content/site project.

---

## [Unreleased]

### Changed (PR #39 — footer redesign)
- `src/components/Footer.astro`: full redesign — flat 13-link list replaced with 5 categorized `<details>/<summary>` accordion groups (Pacientes, Exámenes, Servicios, Nosotros, Empresas y aliados); mobile collapses per group, sm+ shows 2-col grid, lg shows 5-col grid via `display: contents` on `<details>`; contact info now reads from `SITE_CONFIG.sedePrincipal` (fixes stale hardcoded `Calle 5 # 14-23` address); legal links (Contacto, Política de privacidad, Participación social, Estados financieros) moved to copyright bar; all site subpages now linked (nosotros/*, examenes/perfiles, servicios/*)



### Fixed (PR #34 code review)
- `src/pages/examenes/[slug].astro`: removed stray `}` character from `waDomicilio` template literal that produced a malformed WhatsApp URL with a trailing `}` appended after the query string
- `src/pages/pacientes/derechos-deberes.astro`: added `text-base font-semibold text-gray-900` to `<h2>` elements inside card sections — without override they inherited global `text-2xl` (1.5rem), visually inconsistent with equivalent cards in `politica-de-privacidad.astro`
- `src/pages/participacion-social.astro`: changed "Documentos relacionados" block from `<div>` to `<section aria-labelledby>` with a matching `id` on the `<h2>` — consistent with all other landmark regions on this page

### Added (legal pages, content fill, label corrections — marketing assets)
- `src/pages/politica-de-privacidad.astro`: new static page with full data privacy policy per Ley 1581 de 2012 — six patient data rights, SLA (10 days consultas / 15 days reclamos), responsible entity and contact details, special note on health data; effective November 28, 2025
- `src/pages/participacion-social.astro`: new static page — Oficina de Atención al Usuario (address, hours, phone), PQRSF channel (links to /contacto + WhatsApp + email), Comité de Ética, Asociación de Usuarios eligibility, satisfaction survey placeholder; links to privacy policy and derechos-deberes
- `src/components/Footer.astro`: added "Política de privacidad" and "Participación social en salud" links to siteLinks

### Changed (label corrections per marketing team)
- `src/pages/pacientes/derechos-deberes.astro`: replaced six placeholder `[ pendiente ]` items with the four official derechos and four official deberes from the MISION/VISION document; citation now links to /participacion-social; added PQRSF action block
- `src/pages/sedes/[slug].astro`, `src/content/servicios/ginecologia-vph.json`, `src/sanity/schemas/sede.ts`, `src/pages/servicios/index.astro`: renamed "Ginecología/VPH" → "Citología/VPH" across all user-facing labels (URL slug unchanged for stability)
- `src/pages/examenes/[slug].astro`: renamed stat label "Tiempo de informe" → "Oportunidad en resultados" per marketing team request

### Added (per-service WhatsApp routing on sede detail pages)
- `src/sanity/schemas/sede.ts`: new optional fields `whatsappDomicilio` and `whatsappSubgerencia` — allow CMS editors to set separate WhatsApp numbers for domicilio orders and subgerencia (empresarial/salud ocupacional) contacts per sede
- `src/sanity/types.ts`: `Sede` interface extended with `whatsappDomicilio?: string | null` and `whatsappSubgerencia?: string | null`
- `src/sanity/queries.ts`: `SEDE_PROJECTION` now projects `whatsappDomicilio` and `whatsappSubgerencia` alongside existing `whatsapp`
- `src/pages/sedes/[slug].astro`: `WA_ROUTING` lookup map derives per-service WhatsApp URLs from the new fields; service chips for domicilio, jornadas-empresariales, and salud-ocupacional display a secondary "Solicitar por WhatsApp →" link when the field is set in Sanity; chips without a matching field degrade to the existing service page link only — fully backwards-compatible

### Changed (button-first UX on service cards, footer WhatsApp link)
- `src/pages/servicios/index.astro`: "Saber más →" text span replaced with a visually button-styled span (`bg-red-600 px-4 py-2 rounded-lg`) — card remains a single `<a>` (no nested interactive elements); `group-hover:bg-red-700` provides hover feedback; label changed to "Ver servicio"
- `src/pages/servicios/[slug].astro`: CTA action block moved above the Disponibilidad section so the primary action is visible without scrolling; added "Ver sedes disponibles" secondary button linking to `/sedes`
- `src/components/Footer.astro`: added WhatsApp link in the contact `<address>` block after the email address; imports `SITE_CONFIG` from `@/lib/config` for the phone number

### Added (nosotros: mission, vision, values, timeline; breadcrumb fix; team role label)
- `src/pages/nosotros/index.astro`: added official Misión and Visión sections with brand-approved text; added values grid (6 values with biological metaphors) using `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; historia section reduced to 2-sentence teaser + "Ver historia completa →" link; anchor nav updated with Misión and Visión entries before Historia and Valores; "enfermeros" → "auxiliar de laboratorio" in equipo section copy
- `src/pages/nosotros/historia.astro`: replaced hardcoded `<nav aria-label="Migas de pan">` with `<Breadcrumb>` component; populated timeline `<ol>` with 7 official milestones (1985–2020) styled with `border-l-2 border-red-200 pl-4`; added proper page header with `<h1>`
- `src/pages/nosotros/equipo.astro`: "enfermeros" → "auxiliar de laboratorio" in meta description

### Changed (empresas: fill value proposition copy from brand documents)
- `src/pages/empresas.astro`: replaced three `TODO (content-needed)` placeholder blocks with approved brand copy — intro paragraph highlighting 1,200 pruebas/hora throughput and Valle del Cauca coverage; detail copy for "Resultados el mismo día" (digital email delivery, same-day turnaround), "Toma en sitio" (certified team, ingreso/periódico/retiro jornadas), and "Informes consolidados" (SST-compatible group report for Recursos Humanos)

### Fixed (code review cleanup — PRs #25–31)
- `src/lib/seo.ts`: `horarioToOpeningHours` now emits one `openingHours` entry per day for non-consecutive days (e.g. Mo + We) instead of the invalid `"Mo We HH:MM-HH:MM"` Schema.org string that Google silently rejects; removed now-unneeded `compressDays` helper; updated comment to clarify parser behavior
- `src/pages/contacto.astro`, `src/pages/sedes/[slug].astro`: `mapEmbedUrl` from Sanity is validated against `https://www.google.com/maps/` origin before being used as `<iframe src>` — rejects non-Google URLs from a compromised CMS account
- `src/components/Header.astro`: desktop nav dropdowns now support keyboard interaction — Enter/Space toggles open/close, Escape closes and returns focus, focusout closes when focus leaves the group; `aria-expanded` toggled dynamically; mobile nav child lists use `role="group"` with `aria-label`
- `src/pages/empresas.astro`, `src/pages/laboratorios.astro`: submit buttons replaced `disabled` with `aria-disabled="true"` + `onclick="event.preventDefault()"` so screen readers can reach and announce them; `aria-describedby` links to the "próximamente" hint text; `<option>` elements have explicit `value` attributes; WhatsApp message string extracted to a named constant to avoid duplication
- `astro.config.mjs`: removed `lastmod: new Date()` from sitemap — identical build-time timestamps on all pages neutralize the SEO recrawl hint
- `src/layouts/SedeLayout.astro`: removed stale TODO comment about building openingHours (implemented in PR #27)

### Added (F-04: sede SEO — openingHours JSON-LD + title fix)
- `src/lib/seo.ts`: new `horarioToOpeningHours(horario: Horario): string[]` function — parses Spanish freetext schedules ("6:30 am a 12:00 m y de 2:00 pm a 5:00 pm") into Schema.org `openingHours` strings ("Mo-Fr 06:30-12:00", "Mo-Fr 14:00-17:00"); consecutive same-schedule days are compressed to ranges (Mo-Fr, Sa); returns `[]` when no parseable value is found
- `src/lib/seo.ts`: `buildSedeJsonLd()` now accepts `openingHours?: string[]` parameter and includes it in the JSON-LD output when non-empty
- `src/layouts/SedeLayout.astro`: wires `horarioToOpeningHours(sede.horario)` into `buildSedeJsonLd()`; sede page title updated to `Laboratorio Clínico en {ciudad} — {nombre} | CIC Laboratorios` for better Google local search matching

### Changed (F-07: sitemap configuration)
- `astro.config.mjs`: sitemap now sets `changefreq: 'weekly'` and `lastmod` globally; `/estados-financieros` and `/nosotros/historia` are excluded from the sitemap via `filter`

### Changed (F-09: contextual WhatsApp message per page)
- `src/layouts/BaseLayout.astro`: new `whatsappMessage?: string` prop forwarded to `WhatsAppFloating` — when provided, the floating button pre-fills a page-specific message instead of the generic default
- `src/layouts/SedeLayout.astro`: passes `"Hola, quisiera información sobre la sede {nombre} en {ciudad}."` — gives WhatsApp leads automatic sede context
- `src/pages/empresas.astro`: passes `"Quiero información sobre servicios empresariales de CIC Laboratorios."`
- `src/pages/laboratorios.astro`: passes `"Quisiera información sobre alianzas con CIC Laboratorios."`

### Added (F-03: testimonios section on homepage)
- `src/sanity/schemas/paginaInicio.ts`: new `testimonios[]` array field — each item has `texto` (required), `nombre` (required), `ciudad` (required), `cargo` (optional, for B2B testimonials); section is hidden when the array is empty
- `src/sanity/queries.ts`: `PAGINA_INICIO_QUERY` now fetches `testimonios[]` with `coalesce(..., [])` — never returns null
- `src/sanity/types.ts`: `PaginaInicio.testimonios` typed as `{ texto, nombre, ciudad, cargo? }[]`
- `src/pages/index.astro`: replaced `{false && ...}` placeholder block with a real testimonials section — only rendered when at least one testimonial exists in Sanity; each card shows quote, avatar initial, name, city and optional role/company

**To activate:** Add testimonials in Sanity Studio → Página de Inicio → Testimonios. The section will appear on the next build/deploy.

### Fixed (F-05: contacto map + social links structure)
- `src/pages/contacto.astro`: replaced static "Mapa próximamente" placeholder with a real `<iframe>` Google Maps embed — URL pulled from the sede principal's `mapEmbedUrl` field in Sanity; falls back to a "Ver en Google Maps →" deep-link when the field is not yet set
- `src/sanity/queries.ts`: new `SEDE_PRINCIPAL_MAP_QUERY` — fetches only `mapEmbedUrl` from `esSedePrincipal == true` to keep the contacto page fetch minimal
- `src/lib/config.ts`: new `SOCIAL_LINKS` export with `facebook`, `instagram`, `linkedin` string fields (empty by default) — fill in real URLs to activate the footer links
- `src/components/Footer.astro`: social section is now data-driven from `SOCIAL_LINKS`; each link only renders when its URL is non-empty; entire "Síguenos" block is hidden when all three are empty

**To activate the map:** Open Sanity Studio → Sedes → [Buga] → set `mapEmbedUrl` to the Google Maps embed URL (e.g. `https://www.google.com/maps/embed?pb=...`). Redeploy.

**To activate social links:** Edit `src/lib/config.ts` → `SOCIAL_LINKS` and set the real Facebook, Instagram, and LinkedIn URLs. Then open a PR.

### Added (nav & breadcrumb audit)
- `src/components/Header.astro`: new "Pacientes" dropdown (Preparación de exámenes, Preguntas frecuentes, Derechos y deberes); "Empresas" converted from flat link to dropdown (Empresas y empleadores, Laboratorios aliados); "Contacto" flat link added before "Resultados"
- `src/pages/contacto.astro`, `src/pages/laboratorios.astro`, `src/pages/pacientes/preguntas-frecuentes.astro`, `src/pages/pacientes/derechos-deberes.astro`: `Breadcrumb` component added to each
- `src/components/Footer.astro`: "Derechos y deberes" and "Laboratorios aliados" added to sitemap link list

### Added (F-06 — preparación de exámenes dynamic content)
- `src/pages/pacientes/preparacion.astro`: complete rewrite — dynamic exam lists loaded from the `examenes` content collection at build time; `#orina` section lists up to 20 urine-sample exams (sorted A-Z) with a "ver más" link when >20; `#heces` section lists all stool-sample exams (~7); static content for `#ayuno`, `#sin-ayuno`, and `#especial` sections (espermograma, VPH/citología, urocultivo, curva de tolerancia a glucosa); `Breadcrumb` component added (Inicio → Pacientes → Preparación de exámenes); WhatsApp CTA at the bottom; no `[ pendiente ]` placeholders remain

> **Note:** No Sanity Studio changes needed. All data comes from the local `examenes` content collection.

### Added (Sanity CMS integration — sedes + promoción del mes)
- `src/sanity/client.ts`: singleton `@sanity/client` instance using `import.meta.env.SANITY_PROJECT_ID` / `SANITY_DATASET`; `useCdn: true`, `apiVersion: '2024-01-01'`
- `src/sanity/types.ts`: TypeScript interfaces `Horario`, `ServicioSlug`, `Sede`, `PromoMes` — replace `CollectionEntry<'sedes'>['data']` throughout; `PromoMes.modo` is `'imagen' | 'compuesto'` and drives homepage banner rendering
- `src/sanity/queries.ts`: GROQ `ALL_SEDES_QUERY`, `SEDE_BY_SLUG_QUERY`, `PROMO_MES_QUERY`; shared `SEDE_PROJECTION` normalizes `slug.current → slug` and resolves `fotos[].asset->url` so downstream pages need no Sanity-specific logic
- `src/sanity/schemas/sede.ts`: Sanity document schema with editor-friendly fields; `horario` as inline object with one string per day; `servicios` as array of strings with predefined value list; `fotos` as Sanity image assets (uploaded via Studio)
- `src/sanity/schemas/promocionMes.ts`: fields — titulo, descripcion, mes (YYYY-MM), modo (radio), imagenCompleta (image), imagenFondo (image, optional), colorFondo (#dc2626 default), ctaTexto, ctaUrl, activo (boolean); only the latest `activo == true` doc is shown
- `src/sanity/schemas/index.ts`: barrel exporting `schemaTypes = [sedeType, promocionMesType]`
- `sanity.config.ts`, `sanity.cli.ts`: Studio config for `npm run studio:deploy`; project ID hardcoded (public value, not a secret)
- `scripts/migrate-sedes.mjs`: reads all 18 JSON files from `src/content/sedes/`, posts each via `client.createOrReplace()` with deterministic `_id: sede-${slug}`; loads `.env` manually for Node < 20.6 compatibility
- `.env.example`: template with `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`
- `package.json`: added `migrate:sedes`, `studio:dev`, `studio:deploy` scripts

### Changed (sedes data source → Sanity)
- `src/content/config.ts`: `sedesCollection` definition and `sedes` export entry removed; sedes are no longer an Astro content collection
- `src/pages/sedes/index.astro`: replaced `getCollection('sedes')` + `CollectionEntry<'sedes'>` with `client.fetch(ALL_SEDES_QUERY)` + `Sede[]`; removed `.data` wrapper
- `src/pages/sedes/[slug].astro`: `getStaticPaths` now fetches all sedes from Sanity; `Props` interface uses `Sede` directly; `domicilioGratisDesde != null` guard handles Sanity returning `null` for unset fields
- `src/pages/index.astro`: sedes and promo fetched in parallel via `Promise.all`; hardcoded promo placeholder replaced with conditional dual-mode banner — hidden when no active promo exists in Sanity

### Added (estados financieros)
- `src/pages/estados-financieros.astro`: new legal-compliance page listing yearly PDF documents; each card shows year badge, title, description, and two CTAs (Ver PDF / Descargar); PDFs served from `public/docs/estados-financieros/`
- `src/components/Header.astro`: "Nosotros" converted to dropdown with sub-links — "Sobre nosotros" → `/nosotros` and "Estados financieros" → `/estados-financieros`
- `src/components/Footer.astro`: "Estados financieros" added to sitemap link list

### Added (perfiles de laboratorio)
- `scripts/import-perfiles.mjs`: new script that parses `perfiles_laboratorio.md` and writes 17 JSON files to `src/content/perfiles/`; exam-name → slug lookup table resolves all 17 profiles; composite MD items (Sodio y Potasio, PT y PTT, TGO – TGP) expand to separate entries; exams without a matching slug (Índice arterial, Dengue NS1) are stored as plain-name objects
- `src/content/config.ts`: `examenesIncluidos` schema changed from `z.array(z.string())` to `z.array(z.object({ nombre, slug? }))` so human-readable names can be stored alongside optional exam-page slugs; allows linking only when a slug exists
- `src/content/perfiles/prenatal.json`: converted to new schema format
- `src/content/perfiles/`: 17 new profile JSONs generated (lipidico, dengue-igm, dengue-ns1, hipertension, renal, hepatico, deportivo, ninos, diabetico, tiroideo, prostatico, mujer-gestante, femenino, enfermedades-sexuales, pre-quirurgico, general-mujeres, general-hombres)
- `src/pages/examenes/perfiles/[slug].astro`: redesigned — price badge (blue), exam count in section heading, exam list renders `nombre` from data (not slug-humanized); exams with a slug show a link icon (→ exam detail page); exams without a slug render as plain text; WhatsApp CTA below exam list

### Changed (nav dropdown for Exámenes)
- `src/components/Header.astro`: "Exámenes" nav entry converted to a dropdown; desktop uses `group`/`group-hover` CSS (no JS); mobile renders sub-links inline below parent label; `navLinks` typed with optional `children` array; `isActive()` helper checks children hrefs for parent highlight; sub-links: "Catálogo de exámenes" → `/examenes`, "Paquetes y perfiles" → `/examenes/perfiles`

### Changed (header polish)
- `src/components/Header.astro`: layout changed to `justify-between` (logo left, nav right) — dropped `flex-1 justify-center` centering wrapper; `py-4` replaces fixed `h-16` on the row; "Inicio" added as first nav link; logo `max-w-[180px]` moved from `<img>` to the `<a>` wrapper with `img` set to `w-full` so the constraint is enforced by the container
- `src/components/Header.astro`: mobile nav panel now slides in/out via `max-height` CSS transition (300 ms ease-in-out) instead of toggling `hidden`; `aria-hidden` attribute tracks open state
- `src/styles/global.css`: `html { scroll-behavior: smooth }` added under `@media (prefers-reduced-motion: no-preference)` — applies smooth scrolling to all anchor/jump links site-wide while respecting reduced-motion preferences
- `public/images/favicon/favicon.ico`, `public/images/logo/logo.svg`: committed to git (were untracked — caused missing logo and favicon on Vercel deployments)

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
