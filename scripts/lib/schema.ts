/**
 * Examenes schema for migration scripts.
 *
 * IMPORTANT: Keep this in sync with the `examenes` collection definition in
 * `src/content/config.ts`. This file intentionally re-declares the schema
 * using plain `zod` because `astro:content` is a virtual module that is only
 * available inside the Astro build process and cannot be imported by standalone
 * Node scripts.
 */
import { z } from 'zod';

export const categoriaEnum = z.enum([
  'quimica',
  'microbiologia',
  'hematologia',
  'inmunologia',
  'genetica',
  'hormonas',
  'orina',
  'parasitologia',
  'otros',
]);

export const examenSchema = z.object({
  id: z.string(),
  mongoId: z.string().optional(),
  nombre: z.string(),
  codigoCups: z.string(),
  slug: z.string(),
  categoria: categoriaEnum,
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
});

export type Examen = z.infer<typeof examenSchema>;
