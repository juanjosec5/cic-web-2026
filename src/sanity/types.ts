export interface Horario {
  lunes?: string;
  martes?: string;
  miercoles?: string;
  jueves?: string;
  viernes?: string;
  sabado?: string;
  domingo?: string;
}

export type ServicioSlug =
  | 'toma-muestras'
  | 'domicilio'
  | 'ginecologia-vph'
  | 'jornadas-empresariales'
  | 'salud-ocupacional'
  | 'validacion-qr';

export interface Sede {
  slug: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  lat?: number | null;
  lng?: number | null;
  telefono: string;
  whatsapp: string;
  whatsappDomicilio?: string | null;
  whatsappSubgerencia?: string | null;
  email?: string | null;
  horario: Horario;
  servicios: ServicioSlug[];
  fotos: string[];
  video?: string | null;
  convenios: string[];
  domicilioGratisDesde?: number | null;
  esSedePrincipal: boolean;
  mapEmbedUrl?: string | null;
}

export interface PromoMes {
  titulo?: string;
  descripcion?: string;
  modo: 'imagen' | 'compuesto';
  imagenCompletaUrl?: string;
  imagenFondoUrl?: string;
  colorFondo?: string;
  ctaTexto?: string;
  ctaUrl?: string;
}

export interface PaginaInicio {
  heroTitulo?: string;
  heroSubtitulo?: string;
  heroCta1Label?: string;
  heroCta1Url?: string;
  heroCta2Label?: string;
  heroCta2Url?: string;
  heroCtaWaLabel?: string;
  pilares?: { titulo: string; descripcion: string }[];
  audiencias?: { titulo: string; descripcion: string; links: { label: string; url: string }[] }[];
  calidad?: { titulo: string; descripcion: string; linkLabel?: string; linkUrl?: string }[];
  testimonios?: { texto: string; nombre: string; ciudad: string; cargo?: string }[];
}
