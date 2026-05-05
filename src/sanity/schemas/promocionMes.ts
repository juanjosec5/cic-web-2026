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
      name: 'imagenCompleta',
      title: 'Imagen completa',
      description: 'Usada cuando el modo es "Imagen completa". Reemplaza todo el banner.',
      type: 'image',
      options: { hotspot: true },
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
    defineField({ name: 'ctaUrl', title: 'URL del CTA', type: 'url' }),
    defineField({ name: 'activo', title: 'Activa', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'titulo', subtitle: 'mes', media: 'imagenCompleta' },
  },
});
