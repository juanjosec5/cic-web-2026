import { defineField, defineType, type StringRule } from 'sanity';

/**
 * Rutas que hoy tienen una entrada de contenido ("Página") en el CMS.
 * El orden define el orden del desplegable en Studio.
 * Añadir aquí una ruta nueva + volver a correr `npm run seed:paginas`.
 */
export const RUTAS_PAGINA = [
  { value: '/servicios', title: 'Servicios' },
  { value: '/pacientes/preparacion', title: 'Pacientes · Preparación de exámenes' },
  { value: '/pacientes/derechos-deberes', title: 'Pacientes · Derechos y deberes' },
  { value: '/empresas', title: 'Soluciones para empresas' },
  { value: '/laboratorios', title: 'Laboratorio de referencia' },
  { value: '/examenes', title: 'Catálogo de exámenes' },
  { value: '/nosotros/historia', title: 'Nosotros · Historia' },
  { value: '/nosotros/aliados', title: 'Nosotros · Aliados' },
  { value: '/nosotros', title: 'Sobre nosotros' },
  { value: '/contacto', title: 'Contacto' },
] as const;

// Ruta relativa (/) o URL http(s):// — misma regla que paginaInicio.ts
const validateUrl = (R: StringRule) =>
  R.custom((val) => {
    if (!val) return true;
    if (/^(\/|https?:\/\/)/.test(val)) return true;
    return 'Debe ser una ruta relativa (/) o una URL https://';
  });

export const paginaType = defineType({
  name: 'pagina',
  title: 'Página',
  type: 'document',
  description:
    'Contenido gestionable de una página del sitio. Por ahora solo el banner superior; se irán añadiendo más campos.',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título (referencia interna)',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ruta',
      title: 'Ruta de la página',
      description: 'Identifica a qué página del sitio corresponde este contenido.',
      type: 'string',
      options: { list: RUTAS_PAGINA.map((r) => ({ value: r.value, title: r.title })) },
      validation: (R) =>
        R.required().custom(async (ruta, ctx) => {
          if (!ruta) return true;
          const { document, getClient } = ctx;
          const client = getClient({ apiVersion: '2024-01-01' });
          const id = document?._id.replace(/^drafts\./, '') ?? '';
          const count = await client.fetch<number>(
            'count(*[_type == "pagina" && ruta == $ruta && !(_id in [$id, "drafts." + $id])])',
            { ruta, id },
          );
          return count === 0 || 'Ya existe una Página con esta ruta';
        }),
    }),
    defineField({
      name: 'banner',
      title: 'Banner superior',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      description:
        'Banner delgado en la parte superior de la página. Se muestra solo si hay imagen de escritorio y texto alternativo.',
      fields: [
        defineField({
          name: 'imagenDesktop',
          title: 'Imagen escritorio (≥ 768px)',
          description: 'Franja ancha y baja. Recomendado: 1800×600 px (proporción 3:1).',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'imagenMobile',
          title: 'Imagen móvil (< 768px)',
          description:
            'Versión más cuadrada para celular. Recomendado: 1200×900 px (proporción 4:3). Si se deja vacía, se usa la imagen de escritorio.',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'alt',
          title: 'Texto alternativo (accesibilidad / SEO)',
          description: 'Describe la imagen. Obligatorio para que el banner se muestre.',
          type: 'string',
          validation: (R) => R.max(140),
        }),
        defineField({
          name: 'enlace',
          title: 'Enlace al hacer clic (opcional)',
          description: 'Ruta interna (/examenes) o URL https://. Vacío = el banner no es clicable.',
          type: 'string',
          validation: validateUrl,
        }),
        defineField({
          name: 'activo',
          title: 'Activo',
          description: 'Desmárcalo para ocultar el banner sin borrar las imágenes.',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'titulo', subtitle: 'ruta', media: 'banner.imagenDesktop' },
  },
});
