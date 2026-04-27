# CIC Laboratorios — Development Plan

_Last updated: 2026-04-27_

---

## How to read this document

Items are grouped by **tier** (blocking → design → a11y → content → suggestions) and then by page/area. Each item notes the file to change. Tier 1 must ship before launch; the rest can be sequenced by priority.

---

## Tier 1 — Blocking (launch blockers)

### 1.1 Exam search — Pagefind integration
**File:** `src/pages/examenes/index.astro`, `src/components/islands/ExamSearch.vue`
The exam catalogue has 591 entries but zero search. Users cannot find an exam by name.
- Configure Pagefind in `astro.config.mjs` (runs at build time, zero server cost)
- Replace the `[ Buscador — pendiente ]` placeholder with `<ExamSearch client:load />`
- Add `data-pagefind-body` attribute to exam detail pages so only relevant content is indexed
- Add `data-pagefind-meta="title"` / `data-pagefind-ignore` where appropriate

### 1.2 Real map embed on sede detail pages
**File:** `src/pages/sedes/[slug].astro`
Every sede detail page has `[ Mapa — próximamente ]` where an embedded map should be. All 17 sedes already have `lat`/`lng` in their JSON.
- Replace the placeholder `<div>` with a static Google Maps embed iframe:
  `https://maps.google.com/maps?q={lat},{lng}&z=15&output=embed`
- No JS island needed — a plain `<iframe>` works and is SEO-friendly
- Keep the existing "Abrir en Google Maps →" link below it

### 1.3 Opening hours — complete for all 17 sedes
**File:** `src/content/sedes/*.json`
16 of 17 sedes have `"TODO"` as every day's hours value. The `[slug].astro` page renders the horario table but shows nothing meaningful.
- Requires **client input**: actual operating hours per sede
- Once populated, the table on the sede detail page and the JSON-LD `openingHoursSpecification` in `SedeLayout.astro` will render correctly

---

## Tier 2 — Design & Styling (page-by-page pass)

The homepage has received a full design pass. These pages still render with unstyled browser defaults.

### 2.1 Sedes index — card styling
**File:** `src/pages/sedes/index.astro`
The 17 sede cards are bare `<article>` elements with no border, shadow, or hover state.
- Apply the same lifted-card pattern used on the homepage: `rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`
- "Sede principal" label → green pill badge (`rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5`)
- "Ver detalles →" → styled as a red text link with hover color

### 2.2 Sede detail — CTA buttons + section styling
**File:** `src/pages/sedes/[slug].astro`
Three CTA links (WhatsApp, Llamar, Cómo llegar) are plain unstyled anchors.
- WhatsApp → green filled button (same pattern as hero)
- Llamar → ghost/border button
- Cómo llegar → ghost/border button
- Services grid items → pill tags (same as exam categories on homepage)
- "Otras sedes" mini cards → bordered cards with hover lift
- Horario table → add alternating row background (`even:bg-gray-50`) and proper `py-2` cell padding

### 2.3 Exámenes index — categories + header
**File:** `src/pages/examenes/index.astro`
- Category grid → `flex-wrap` pill tags (same as homepage, consistent)
- Add a "Ver todos los exámenes" fallback link / count display
- Temporary search placeholder → style as a clearly marked "coming soon" notice rather than a raw `<em>` tag

### 2.4 Examen detail — stat strip + CTAs + lists
**File:** `src/pages/examenes/[slug].astro`
- 4-stat `<dl>` strip → styled definition list with label in small gray text above value in bold (like a stat card row)
- CTA group (Cotizar, Domicilio, Ver sedes) → same button hierarchy as sede detail (primary / ghost / ghost)
- "Disponible en" sedes list → pill tags linking to each sede
- "Exámenes relacionados" list → small linked cards with hover
- WhatsApp CTA banner → visually distinct section (light gray or light red background strip)
- Medical disclaimer → `<small>` styled with `text-gray-400 italic border-t pt-4 mt-10`

### 2.5 Servicios index + detail
**Files:** `src/pages/servicios/index.astro`, `src/pages/servicios/[slug].astro`
- Servicios index: same full-card link pattern as homepage services section
- Servicios detail: CTA buttons, breadcrumb spacing, section dividers

### 2.6 Exámenes category + perfiles pages
**Files:** `src/pages/examenes/categoria/[slug].astro`, `src/pages/examenes/perfiles/index.astro`, `src/pages/examenes/perfiles/[slug].astro`
- Category page: exam list items → bordered cards with name + synonyms preview + "Ver examen →" link
- Perfiles index: card grid with included exam count pill
- Perfil detail: included exams as a styled checklist (`✓` items or `<ul>` with custom bullets)

### 2.7 Pacientes pages
**Files:** `src/pages/pacientes/preparacion.astro`, `src/pages/pacientes/derechos-deberes.astro`, `src/pages/pacientes/preguntas-frecuentes.astro`
- Preparación: section headings with a left accent border (`border-l-4 border-red-300 pl-4`)
- Derechos/deberes: two-column desktop layout already exists; add card wrappers with subtle background (`bg-gray-50 rounded-xl p-6`)
- FAQ accordion (`<details>`/`<summary>`): style `<summary>` with chevron icon that rotates on open; add `cursor-pointer` and hover bg

### 2.8 Contacto page
**File:** `src/pages/contacto.astro`
- Contact info block → card with icon+label rows (phone, WhatsApp, address)
- Map placeholder → replace with real iframe embed (same as sede detail)
- CTA buttons for WhatsApp and phone → button styling

### 2.9 Empresas + Laboratorios pages
**Files:** `src/pages/empresas.astro`, `src/pages/laboratorios.astro`
- Value-prop cards → same `rounded-xl border hover:shadow-lg` lifted card treatment
- WhatsApp CTA at bottom → styled banner strip (light red bg, white button)

### 2.10 Nosotros section
**Files:** `src/pages/nosotros/index.astro` + sub-pages
- Sticky sidebar anchor nav → add `border-l-2` active indicator for current section
- Historia page → visual timeline component: left border with year dots
- Equipo page → photo placeholder grid with gray avatar squares and name/role text
- Calidad page → certification "badge" cards (outlined bordered cards with a checkmark icon)
- Aliados page → logo placeholder grid

### 2.11 Header — active page indicator
**File:** `src/components/Header.astro`
- Use `Astro.url.pathname` to apply an active style (`text-blue-700 bg-blue-50`) to the current page nav link
- The wordmark is currently `text-blue-700` — should match brand color (red) once agreed

### 2.12 WhatsApp floating button
**File:** `src/components/islands/WhatsAppFloating.vue`
- Replace emoji `💬` with the official WhatsApp SVG icon
- Add entrance animation: `translate-y-16 opacity-0` → `translate-y-0 opacity-100` on mount (300ms ease)
- Add tooltip on hover: "Escríbenos por WhatsApp" text bubble appearing to the left

---

## Tier 3 — Accessibility (a11y)

### 3.1 Focus management & visible focus rings
**File:** `src/styles/global.css`
Tailwind's preflight removes default browser outlines. Many interactive elements (cards styled as links, pill tags) have no visible focus indicator.
- Add to `@layer base`: `*:focus-visible { outline: 2px solid #dc2626; outline-offset: 2px; border-radius: 4px; }`
- This gives a consistent red focus ring matching brand color across all focusable elements

### 3.2 Card accessibility — keyboard navigation
**Files:** sede cards, service cards, exam cards
Cards that wrap an `<article>` + multiple inner links are fine. Full-block `<a>` link cards (service cards) are already keyboard-accessible. **Check:** ensure no card has `pointer-events: none` on child text that intercepts focus.

### 3.3 Color contrast audit
**File:** `src/styles/global.css`, various pages
- `text-gray-400` used in several placeholder/hint lines — fails WCAG AA (4.5:1) against white background. Upgrade to `text-gray-500` minimum.
- `text-red-600` on white: passes AA (5.1:1). OK.
- Map legend `text-gray-400` hint text: upgrade to `text-gray-500`

### 3.4 Image alt text
**Files:** all pages with `<img>` tags
- Sede gallery: `alt="Foto de ${sede.nombre}"` is acceptable but vague. Add position/content if known.
- All decorative images: `alt=""` + `aria-hidden="true"`

### 3.5 Form labeling (future contact form)
When the contact/empresas forms are added, every `<input>` must have a visible `<label>` — no placeholder-only labels.

### 3.6 Landmark regions
**File:** `src/layouts/BaseLayout.astro`
Already has `<main id="main-content">` and skip-to-content link. Verify:
- `<header>` wraps the page Header component (it does)
- `<footer>` wraps the Footer (it does)
- Each major page section uses `<section aria-labelledby="...">` (most do — keep consistent)

### 3.7 Table accessibility on sede detail
**File:** `src/pages/sedes/[slug].astro`
The horario `<table>` uses `<th scope="row">` which is correct. Add a `<caption class="sr-only">` for screen readers: `Horario de atención de {sede.nombre}`.

### 3.8 Animated elements — prefers-reduced-motion
**File:** `src/components/islands/SedeMapD3.vue`, `src/styles/global.css`
The map pulse animation runs unconditionally. Add:
```css
@media (prefers-reduced-motion: reduce) {
  .sede-pulse { animation: none; }
}
```

### 3.9 External links — screen reader notice
Links that open in a new tab (WhatsApp, Google Maps, social) should indicate this to screen readers:
- Add `<span class="sr-only">(abre en nueva pestaña)</span>` inside each `target="_blank"` link
- Or use an `aria-label` that includes the context

---

## Tier 4 — Content (requires client input)

These items cannot be completed without information from the client. They are documented here so they can be requested.

| Item | Files | What's needed |
|------|-------|---------------|
| Sede opening hours | `src/content/sedes/*.json` | Operating hours for all 17 sedes |
| Team members | `src/pages/nosotros/equipo.astro` | Names, roles, photos, short bios |
| Historia timeline | `src/pages/nosotros/historia.astro` | Founding year, key milestones |
| Calidad accreditation | `src/pages/nosotros/calidad.astro` | ICONTEC number, scope, dates |
| Quality policy text | `src/pages/nosotros/calidad.astro` | Official policy text |
| Equipment list | `src/pages/nosotros/tecnologia.astro` | Equipment brands/models |
| EPS/ARL convenios | `src/pages/nosotros/aliados.astro` | Full list of insurance agreements |
| Social media URLs | `src/components/Footer.astro` | Facebook, Instagram, LinkedIn URLs |
| Real favicon | `public/favicon.svg` | Brand favicon asset |
| OG image | `src/components/SEO.astro` | 1200×630 brand image for social sharing |
| Contact email | `src/pages/laboratorios.astro` | Confirmed contact email address |
| QR validation URL | `src/pages/nosotros/tecnologia.astro` | URL to QR verification portal |
| Patient testimonials | `src/pages/index.astro` | 2+ real testimonials |
| Pricing (perfiles) | `src/pages/examenes/perfiles/*.json` | Confirmed prices once available |
| Exam delivery times | `src/pages/pacientes/preguntas-frecuentes.astro` | Exact delivery times per category |

---

## Tier 5 — Suggestions (optional improvements)

### 5.1 Brand color system
Currently using Tailwind's `red-600` as brand color and `blue-700` on the header wordmark — inconsistent. Recommended next step: define brand tokens in `global.css` `@theme`:
```css
@theme {
  --color-brand: #c41230; /* CIC red — confirm hex with client */
  --color-brand-dark: #a00e26;
}
```
Then replace `bg-red-600` / `hover:bg-red-700` with `bg-brand` / `hover:bg-brand-dark` everywhere. Header wordmark switches from blue to brand.

### 5.2 Font upgrade
System font stack is fine for now, but a single Google Font (e.g. **Inter** for body, weight 400/500/600/700) would significantly improve perceived quality. Add via `<link>` in `BaseLayout.astro` and set in `@layer base`:
```css
body { font-family: 'Inter', system-ui, sans-serif; }
```

### 5.3 Page transition / loading indicator
Astro's View Transitions API (`<ViewTransitions />`) adds smooth fade-slide between pages with zero JS bundle cost. Add to `BaseLayout.astro`:
```astro
import { ViewTransitions } from 'astro:transitions';
// in <head>: <ViewTransitions />
```

### 5.4 Exam search with filters
Beyond Pagefind full-text search, consider a client-side filter by category + ayuno requirement on the exam index page. Could be a simple Vue island with `ref` filtering the pre-rendered exam list passed as a prop.

### 5.5 Structured data completeness
`seo.ts` has `TODO` for `sameAs` social URLs. Once social links are confirmed, add them to the JSON-LD `Organization` object — improves Google Knowledge Panel.

### 5.6 Sitemap + robots.txt
`@astrojs/sitemap` is configured and generating `sitemap-index.xml`. Add a `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://ciclaboratorios.com/sitemap-index.xml
```

### 5.7 Cookie / privacy notice
Colombian law (Ley 1581 de 2012) requires disclosure of personal data processing. A minimal banner or footer link to a privacy policy page should be added before launch.

### 5.8 WhatsApp deep-link consolidation
Multiple pages construct `wa.me` URLs with `encodeURIComponent`. Consider a helper in `src/lib/config.ts`:
```ts
export function waLink(msg: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}
```
This is already partially done with `SITE_CONFIG.whatsapp` — just needs the URL builder.

### 5.9 404 page improvement
Current 404 has a centered layout with 3 links. Add the site header/footer (it currently uses `BaseLayout` which already includes them — verify), a search bar, and the most popular exam categories as quick links.

### 5.10 Performance — image optimization
When real photos are added (sede galleries, team photos), use Astro's `<Image>` component (`astro:assets`) instead of plain `<img>`. This provides automatic WebP conversion, lazy loading, and proper `width`/`height` to prevent CLS.

---

## Execution order recommendation

```
Sprint 1 (pre-launch critical)
  → 1.2 Sede map embeds (quick win, data exists)
  → 3.1 Focus rings (global.css, 5 min)
  → 3.8 Reduced motion (global.css + SedeMapD3.vue)
  → 2.1 Sedes index card styling
  → 2.2 Sede detail CTAs
  → 2.4 Examen detail stat strip + CTAs
  → 5.6 robots.txt

Sprint 2 (design completeness)
  → 2.3 Examenes index
  → 2.5 Servicios pages
  → 2.6 Categorías + perfiles
  → 2.7 Pacientes pages
  → 2.8 Contacto
  → 2.9 Empresas + Laboratorios
  → 2.11 Header active indicator
  → 2.12 WhatsApp floating button SVG + animation

Sprint 3 (feature + a11y)
  → 1.1 Pagefind search
  → 3.3 Contrast audit + fixes
  → 3.9 External link sr-only notices
  → 5.1 Brand color tokens
  → 5.3 View Transitions
  → 5.8 waLink helper

Sprint 4 (content-dependent — after client delivers)
  → 1.3 Opening hours
  → Tier 4 content items as they arrive
  → 5.2 Font upgrade (confirm with client)
  → 5.5 Structured data social URLs
  → 5.7 Privacy/cookie notice
```
