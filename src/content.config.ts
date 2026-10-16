import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// ---------------------------------------------------------------------------
// examenes
// ---------------------------------------------------------------------------
const examenesCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/examenes' }),
  schema: z.object({
    id: z.string(),
    mongoId: z.string().optional(),
    nombre: z.string(),
    codigoCups: z.string(),
    slug: z.string(),
    categoria: z.enum([
      'andrologia',
      'biologia-molecular',
      'citogenetica',
      'citometria',
      'coagulacion',
      'electroforesis',
      'genetica',
      'hematologia',
      'hormonas',
      'inmunologia',
      'inmunologia-infecciosa',
      'inmunoquimica',
      'marcadores-cardiacos',
      'marcadores-tumorales',
      'medicamentos',
      'metabolicas',
      'microbiologia',
      'microscopia',
      'nefelometria',
      'patologia',
      'proteinas-especificas',
      'quimica',
      'reumatologia',
      'toxicologia',
      'otros',
    ]),
    diaProceso: z.string().optional(),
    nombresAlternativos: z.array(z.string()).default([]),
    muestra: z.string().optional(),
    requiereAyuno: z.boolean().optional(),
    preparacion: z.string().optional(),
    oportunidadResultados: z.string().optional(),
    descripcionQueEs: z.string().optional(),
    descripcionParaQueSirve: z.string().optional(),
    sedesDisponibles: z.array(z.string()).default([]),
    examenesRelacionados: z.array(z.string()).default([]),
    perfiles: z.array(z.string()).default([]),
    imagen: z.string().nullable().optional(),
    activo: z.boolean().default(true),
  }),
});

// ---------------------------------------------------------------------------
// servicios
// ---------------------------------------------------------------------------
const serviciosCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/servicios' }),
  schema: z.object({
    slug: z.string(),
    nombre: z.string(),
    descripcion: z.string(),
    sedesDisponibles: z.array(z.string()),
    ctaTipo: z.enum(['whatsapp', 'contacto', 'mailto']),
    clinicaAliada: z.object({
      nombre: z.string(),
      direccion: z.string(),
      telefono: z.string(),
    }).optional(),
  }),
});

// ---------------------------------------------------------------------------
// aliados
// ---------------------------------------------------------------------------
const aliadosCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/aliados' }),
  schema: z.object({
    slug: z.string(),
    nombre: z.string(),
    descripcion: z.string(),
    logo: z.string(),
    url: z.string().nullable().optional(),
    esEstrategico: z.boolean().default(false),
  }),
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const collections = {
  examenes: examenesCollection,
  servicios: serviciosCollection,
  aliados: aliadosCollection,
};
