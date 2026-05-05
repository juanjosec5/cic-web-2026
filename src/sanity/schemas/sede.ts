import { defineField, defineType } from 'sanity';

const SERVICIOS = [
  { title: 'Toma de muestras', value: 'toma-muestras' },
  { title: 'Domicilio', value: 'domicilio' },
  { title: 'Ginecología / VPH', value: 'ginecologia-vph' },
  { title: 'Jornadas empresariales', value: 'jornadas-empresariales' },
  { title: 'Salud ocupacional', value: 'salud-ocupacional' },
  { title: 'Validación QR', value: 'validacion-qr' },
];

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
const DIA_LABELS: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

export const sedeType = defineType({
  name: 'sede',
  title: 'Sede',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'nombre' }, validation: (R) => R.required() }),
    defineField({ name: 'ciudad', title: 'Ciudad', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'direccion', title: 'Dirección', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'telefono', title: 'Teléfono', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'horario',
      title: 'Horario de atención',
      type: 'object',
      fields: DIAS.map((dia) =>
        defineField({ name: dia, title: DIA_LABELS[dia], type: 'string' })
      ),
    }),
    defineField({
      name: 'servicios',
      title: 'Servicios disponibles',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: SERVICIOS },
    }),
    defineField({ name: 'fotos', title: 'Fotos', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'video', title: 'URL de video', type: 'url' }),
    defineField({ name: 'convenios', title: 'Convenios', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'domicilioGratisDesde', title: 'Domicilio gratis desde ($)', type: 'number' }),
    defineField({ name: 'esSedePrincipal', title: 'Es sede principal', type: 'boolean', initialValue: false }),
    defineField({ name: 'lat', title: 'Latitud', type: 'number' }),
    defineField({ name: 'lng', title: 'Longitud', type: 'number' }),
    defineField({ name: 'mapEmbedUrl', title: 'URL embed de Google Maps', type: 'url' }),
  ],
  preview: {
    select: { title: 'nombre', subtitle: 'ciudad' },
  },
});
