// Values pulled from src/content/sedes/buga.json (esSedePrincipal: true)
export const SITE_CONFIG = {
  name: 'CIC Laboratorios',
  url: 'https://www.ciclaboratorios.com',
  /** Pre-formatted for wa.me (Colombia +57 + 10-digit mobile) */
  whatsapp: '573174328255',
  sedePrincipal: {
    slug: 'buga',
    nombre: 'CIC Laboratorios — Buga',
    direccion: 'Cra 13 # 4 - 51',
    ciudad: 'Guadalajara de Buga',
    telefono: '315 819 7366',
    whatsapp: '317 432 8255',
  },
} as const;

export const CATEGORIAS = [
  { slug: 'quimica',               label: 'Química' },
  { slug: 'hematologia',           label: 'Hematología' },
  { slug: 'hormonas',              label: 'Hormonas' },
  { slug: 'microbiologia',         label: 'Microbiología' },
  { slug: 'inmunologia',           label: 'Inmunología' },
  { slug: 'inmunologia-infecciosa',label: 'Inmunología Infecciosa' },
  { slug: 'inmunoquimica',         label: 'Inmunoquímica' },
  { slug: 'genetica',              label: 'Genética' },
  { slug: 'coagulacion',           label: 'Coagulación' },
  { slug: 'marcadores-tumorales',  label: 'Marcadores Tumorales' },
  { slug: 'marcadores-cardiacos',  label: 'Marcadores Cardíacos' },
  { slug: 'medicamentos',          label: 'Medicamentos' },
  { slug: 'toxicologia',           label: 'Toxicología' },
  { slug: 'reumatologia',          label: 'Reumatología' },
  { slug: 'metabolicas',           label: 'Metabólicas' },
  { slug: 'proteinas-especificas', label: 'Proteínas Específicas' },
  { slug: 'nefelometria',          label: 'Nefelometría' },
  { slug: 'electroforesis',        label: 'Electroforesis' },
  { slug: 'biologia-molecular',    label: 'Biología Molecular' },
  { slug: 'citogenetica',          label: 'Citogenética' },
  { slug: 'citometria',            label: 'Citometría' },
  { slug: 'andrologia',            label: 'Andrología' },
  { slug: 'microscopia',           label: 'Microscopía' },
  { slug: 'patologia',             label: 'Patología' },
  { slug: 'otros',                 label: 'Otros' },
] as const;

export type CategoriaSlug = (typeof CATEGORIAS)[number]['slug'];
