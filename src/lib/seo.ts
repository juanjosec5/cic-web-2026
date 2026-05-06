/**
 * JSON-LD helpers for CIC Laboratorios.
 * Used in SEO.astro via the jsonLd prop.
 *
 * TODO (content-needed): Fill in sameAs social URLs once confirmed.
 */
import { SITE_CONFIG } from '@/lib/config';
import type { Horario } from '@/sanity/types';

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

const DIAS_ORDER: (keyof Horario)[] = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
];

const DAY_ABBR: Record<keyof Horario, string> = {
  lunes: 'Mo', martes: 'Tu', miercoles: 'We', jueves: 'Th',
  viernes: 'Fr', sabado: 'Sa', domingo: 'Su',
};

const WEEK_ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function parseTimeToken(token: string): string | null {
  const m = token.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm|m)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const period = m[3].toLowerCase();
  if (period === 'am') {
    if (h === 12) h = 0;
  } else if (period === 'pm') {
    if (h !== 12) h += 12;
  } else {
    h = 12; // "m" = mediodía
  }
  return `${String(h).padStart(2, '0')}:${min}`;
}

function parseHorarioRanges(value: string): string[] {
  return value
    .split(/\s+y\s+de\s+/i)
    .flatMap((seg) => {
      const parts = seg.trim().split(/\s+a\s+/i);
      if (parts.length !== 2) return [];
      const open = parseTimeToken(parts[0]);
      const close = parseTimeToken(parts[1]);
      return open && close ? [`${open}-${close}`] : [];
    });
}

/**
 * Convert a Sanity `Horario` object to Schema.org `openingHours` strings.
 * Returns an empty array when no parseable schedule is available.
 *
 * Consecutive same-schedule days are compressed to a range: ["Mo-Fr 06:30-12:00"].
 * Non-consecutive days each get their own entry: ["Mo 06:30-12:00", "We 06:30-12:00"].
 * Space-separated multi-day strings ("Mo We HH:MM-HH:MM") are NOT valid Schema.org.
 *
 * Example output: ["Mo-Fr 06:30-12:00", "Mo-Fr 14:00-17:00", "Sa 07:00-12:00"]
 */
export function horarioToOpeningHours(horario: Horario): string[] {
  const scheduleMap = new Map<string, (keyof Horario)[]>();
  for (const dia of DIAS_ORDER) {
    const val = horario[dia];
    // Skip empty values — unparseable free-text also returns [] from the parser below.
    if (!val) continue;
    const ranges = parseHorarioRanges(val);
    if (ranges.length === 0) continue;
    const key = ranges.join('|');
    if (!scheduleMap.has(key)) scheduleMap.set(key, []);
    scheduleMap.get(key)!.push(dia);
  }

  const result: string[] = [];
  for (const [key, days] of scheduleMap) {
    const abbrs = days.map((d) => DAY_ABBR[d]);
    const indices = abbrs.map((a) => WEEK_ORDER.indexOf(a)).sort((a, b) => a - b);
    const consecutive = indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1);
    const timeRanges = key.split('|');

    if (consecutive && abbrs.length > 1) {
      const rangeStr = `${WEEK_ORDER[indices[0]]}-${WEEK_ORDER[indices[indices.length - 1]]}`;
      for (const range of timeRanges) {
        result.push(`${rangeStr} ${range}`);
      }
    } else {
      for (const abbr of abbrs) {
        for (const range of timeRanges) {
          result.push(`${abbr} ${range}`);
        }
      }
    }
  }
  return result;
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
  lat?: number;
  lng?: number;
  url?: string;
  openingHours?: string[];
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
    ...(params.lat !== undefined && params.lng !== undefined
      ? { geo: { '@type': 'GeoCoordinates', latitude: params.lat, longitude: params.lng } }
      : {}),
    ...(params.openingHours && params.openingHours.length > 0
      ? { openingHours: params.openingHours }
      : {}),
  };
}

export interface OrganizationJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  telephone: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  areaServed: string;
  [key: string]: unknown;
}

export function buildOrganizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    // TODO (content-needed): Replace with real logo URL once brand assets are available.
    logo: `${SITE_CONFIG.url}/images/og-default.png`,
    telephone: SITE_CONFIG.sedePrincipal.telefono,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.sedePrincipal.direccion,
      addressLocality: SITE_CONFIG.sedePrincipal.ciudad,
      addressRegion: 'Valle del Cauca',
      addressCountry: 'CO',
    },
    areaServed: 'Valle del Cauca',
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
