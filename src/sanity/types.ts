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
