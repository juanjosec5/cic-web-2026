import { defineField, defineType } from 'sanity';

const CATEGORIAS = [
  { title: 'Cardiovascular', value: 'cardiovascular' },
  { title: 'Metabólico', value: 'metabolico' },
  { title: 'Infeccioso', value: 'infeccioso' },
  { title: 'Femenino', value: 'femenino' },
  { title: 'Masculino', value: 'masculino' },
  { title: 'General', value: 'general' },
];

export const perfilType = defineType({
  name: 'perfil',
  title: 'Perfil de exámenes',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'nombre' }, validation: (R) => R.required() }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 3, validation: (R) => R.required() }),
    defineField({
      name: 'categoria',
      title: 'Categoría (para el filtro)',
      type: 'string',
      options: { list: CATEGORIAS },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'imagenPortada',
      title: 'Imagen de portada',
      description: 'Se muestra en la tarjeta del listado y como banner en la página del perfil.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'examenesIncluidos',
      title: 'Exámenes incluidos',
      type: 'array',
      of: [
        defineField({
          name: 'examenIncluido',
          title: 'Examen',
          type: 'object',
          fields: [
            defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'slug', title: 'Slug del examen (opcional, para enlazar)', type: 'string' }),
          ],
          preview: { select: { title: 'nombre' } },
        }),
      ],
    }),
    defineField({ name: 'precio', title: 'Precio (referencial, no se muestra al paciente)', type: 'number' }),
  ],
  preview: {
    select: { title: 'nombre', subtitle: 'descripcion', media: 'imagenPortada' },
  },
});
