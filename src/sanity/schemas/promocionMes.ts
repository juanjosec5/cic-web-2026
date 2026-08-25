import { defineField, defineType } from 'sanity';

export const promocionMesType = defineType({
  name: 'promocionMes',
  title: 'Promoción del Mes',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string' }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 3 }),
    defineField({ name: 'mes', title: 'Mes y año (YYYY-MM)', type: 'string', placeholder: '2026-05' }),
    defineField({
      name: 'modo',
      title: 'Modo de visualización',
      type: 'string',
      options: {
        list: [
          { title: 'Imagen completa (reemplaza el banner)', value: 'imagen' },
          { title: 'Compuesto (título + descripción + fondo opcional)', value: 'compuesto' },
        ],
        layout: 'radio',
      },
      initialValue: 'compuesto',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'imagenes',
      title: 'Imágenes (máx. 4)',
      description:
        'Usadas cuando el modo es "Imagen completa". Si hay más de una, se muestran en un slider automático. Cada imagen puede tener su propio enlace opcional: si tiene URL, será clicable; si no, se mostrará como imagen fija.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'imagenSlide',
          title: 'Imagen',
          fields: [
            defineField({
              name: 'imagen',
              title: 'Imagen',
              type: 'image',
              options: { hotspot: true },
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL del enlace (opcional)',
              description:
                'Si se define, esta imagen será clicable y abrirá el enlace en una pestaña nueva. Si se deja vacía, la imagen no será clicable.',
              type: 'url',
              validation: (R) => R.uri({ scheme: ['http', 'https'], allowRelative: true }),
            }),
          ],
          preview: {
            select: { media: 'imagen', subtitle: 'url' },
            prepare({ media, subtitle }) {
              return { title: subtitle ? 'Con enlace' : 'Sin enlace', subtitle, media };
            },
          },
        },
      ],
      validation: (R) => R.min(1).max(4),
    }),
    defineField({
      name: 'imagenFondo',
      title: 'Imagen de fondo',
      description: 'Opcional. Usada como fondo en modo "Compuesto".',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'colorFondo',
      title: 'Color de fondo',
      description: 'Hex color cuando no hay imagen de fondo (modo Compuesto). Ej: #dc2626',
      type: 'string',
      initialValue: '#dc2626',
    }),
    defineField({ name: 'ctaTexto', title: 'Texto del botón CTA', type: 'string', initialValue: 'Consultar promoción' }),
    defineField({
      name: 'ctaUrl',
      title: 'URL del CTA',
      type: 'url',
      validation: (R) => R.uri({ scheme: ['http', 'https'], allowRelative: true }),
    }),
    defineField({ name: 'activo', title: 'Activa', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'titulo', subtitle: 'mes', media: 'imagenes.0.imagen' },
  },
});
