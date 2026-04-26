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
  { slug: 'quimica', label: 'Química Sanguínea' },
  { slug: 'hematologia', label: 'Hematología' },
  { slug: 'hormonas', label: 'Hormonas' },
  { slug: 'microbiologia', label: 'Microbiología' },
  { slug: 'inmunologia', label: 'Inmunología' },
  { slug: 'genetica', label: 'Genética' },
  { slug: 'orina', label: 'Orina y Líquidos' },
  { slug: 'parasitologia', label: 'Parasitología' },
  { slug: 'otros', label: 'Otros' },
] as const;

export type CategoriaSlug = (typeof CATEGORIAS)[number]['slug'];
