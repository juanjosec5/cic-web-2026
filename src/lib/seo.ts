/**
 * JSON-LD helpers for CIC Laboratorios.
 * Used in SEO.astro via the jsonLd prop.
 *
 * TODO (content-needed): Fill in real organizationId, sameAs social URLs,
 * and areaServed once confirmed.
 */

export interface MedicalBusinessJsonLd {
  '@context': 'https://schema.org';
  '@type': 'MedicalBusiness';
  name: string;
  description?: string;
  url?: string;
  telephone?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  image?: string;
  // Index signature makes this assignable to Record<string, unknown>
  // while keeping named fields strongly typed.
  [key: string]: unknown;
}

export interface MedicalTestJsonLd {
  '@context': 'https://schema.org';
  '@type': 'MedicalTest';
  name: string;
  description?: string;
  usedToDiagnose?: string;
  usesDevice?: string;
  url?: string;
  code?: {
    '@type': 'MedicalCode';
    code: string;
    codingSystem: string;
  };
  // Index signature makes this assignable to Record<string, unknown>
  // while keeping named fields strongly typed.
  [key: string]: unknown;
}

/**
 * Build a MedicalBusiness JSON-LD object from a sede data entry.
 */
export function buildSedeJsonLd(params: {
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  lat: number;
  lng: number;
  url?: string;
}): MedicalBusinessJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: params.nombre,
    description: params.descripcion,
    url: params.url,
    telephone: params.telefono,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.direccion,
      addressLocality: params.ciudad,
      addressRegion: 'Valle del Cauca',
      addressCountry: 'CO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: params.lat,
      longitude: params.lng,
    },
  };
}

/**
 * Build a MedicalTest JSON-LD object from an examen data entry.
 */
export function buildExamenJsonLd(params: {
  nombre: string;
  descripcionQueEs?: string;
  descripcionParaQueSirve?: string;
  codigoCups: string;
  slug: string;
  siteUrl: string;
}): MedicalTestJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalTest',
    name: params.nombre,
    description: params.descripcionQueEs,
    usedToDiagnose: params.descripcionParaQueSirve,
    url: `${params.siteUrl}/examenes/${params.slug}`,
    code: {
      '@type': 'MedicalCode',
      code: params.codigoCups,
      codingSystem: 'CUPS',
    },
  };
}
