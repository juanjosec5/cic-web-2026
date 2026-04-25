# CIC Laboratorios — Web 2026

Clinical laboratory website for CIC Laboratorios, built with Astro 5, Tailwind CSS v4, and Vue 3.

## Stack

- **Framework**: Astro 5 (static output)
- **UI components**: Vue 3 (islands for interactive elements)
- **CSS**: Tailwind CSS v4 via `@tailwindcss/vite`
- **Sitemap**: `@astrojs/sitemap`
- **Deploy**: Vercel (static adapter)
- **Search**: Pagefind (installed, integration pending — v1.1)

## Dev commands

| Command           | Action                                   |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start local dev server at localhost:4321 |
| `npm run build`   | Build static site to `./dist`            |
| `npm run preview` | Preview the production build locally     |
| `npm run type-check` | Run TypeScript type checking          |

## Folder structure

```
src/
├── content/          # Content collections (JSON data files)
│   ├── config.ts     # Zod schemas for all collections
│   ├── examenes/     # Lab exam entries (~700 eventually)
│   ├── sedes/        # Location entries
│   ├── servicios/    # Service entries
│   ├── perfiles/     # Exam profile/panel entries
│   └── aliados/      # Strategic partner entries
├── layouts/          # Page layouts (Base, Sede, Examen)
├── components/       # Astro components + Vue islands
│   └── islands/      # Vue 3 interactive components
├── pages/            # File-based routing
├── styles/           # global.css (Tailwind entry)
└── lib/              # Utilities (SEO JSON-LD helpers)
```

## Content collections

| Collection  | Type | Description                        |
| ----------- | ---- | ---------------------------------- |
| `examenes`  | data | Lab exam catalog (~700 entries)    |
| `sedes`     | data | Clinic locations                   |
| `servicios` | data | Services offered                   |
| `perfiles`  | data | Exam profiles/panels               |
| `aliados`   | data | Strategic partners                 |

## Environment variables

None required for static build. Future integrations may need:

- `PUBLIC_WHATSAPP_PHONE` — Main WhatsApp number (currently hardcoded)
- `PUBLIC_SITE_URL` — Override for canonical URLs

## Roadmap

- **v1**: Base scaffold + routes + schemas (this branch)
- **v1.1**: Pagefind search integration, real map, full exam catalog migration
- **v2**: Forms, booking, results portal integration
