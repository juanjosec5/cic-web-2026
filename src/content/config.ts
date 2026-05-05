import { defineCollection, z } from 'astro:content';

// ---------------------------------------------------------------------------
// examenes
// ---------------------------------------------------------------------------
const examenesCollection = defineCollection({
  type: 'data',
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
// sedes
// ---------------------------------------------------------------------------
const horarioSchema = z.object({
  lunes: z.string().optional(),
  martes: z.string().optional(),
  miercoles: z.string().optional(),
  jueves: z.string().optional(),
  viernes: z.string().optional(),
  sabado: z.string().optional(),
  domingo: z.string().optional(),
});

const sedesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    nombre: z.string(),
    ciudad: z.string(),
    direccion: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    telefono: z.string(),
    whatsapp: z.string(),
    email: z.string().optional(),
    horario: horarioSchema,
    servicios: z.array(
      z.enum([
        'toma-muestras',
        'domicilio',
        'ginecologia-vph',
        'jornadas-empresariales',
        'salud-ocupacional',
        'validacion-qr',
      ])
    ),
    fotos: z.array(z.string()).default([]),
    video: z.string().nullable().optional(),
    convenios: z.array(z.string()).default([]),
    domicilioGratisDesde: z.number().optional(),
    esSedePrincipal: z.boolean().default(false),
    mapEmbedUrl: z.string().optional(),
  }),
});

// ---------------------------------------------------------------------------
// servicios
// ---------------------------------------------------------------------------
const serviciosCollection = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    nombre: z.string(),
    descripcion: z.string(),
    sedesDisponibles: z.array(z.string()),
    ctaTipo: z.enum(['whatsapp', 'contacto', 'mailto']),
  }),
});

// ---------------------------------------------------------------------------
// perfiles
// ---------------------------------------------------------------------------
const perfilesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    nombre: z.string(),
    descripcion: z.string(),
    examenesIncluidos: z.array(
      z.object({
        nombre: z.string(),
        slug: z.string().optional(),
      })
    ).default([]),
    precio: z.number().optional(),
  }),
});

// ---------------------------------------------------------------------------
// aliados
// ---------------------------------------------------------------------------
const aliadosCollection = defineCollection({
  type: 'data',
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
  sedes: sedesCollection,
  servicios: serviciosCollection,
  perfiles: perfilesCollection,
  aliados: aliadosCollection,
};
