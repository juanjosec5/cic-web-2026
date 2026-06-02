import type { Sede } from '@/sanity/types';

const NORTE_LAT = 4.3;
const SUR_LAT   = 3.8;

export interface Zona {
  label: string;
  sedes: Sede[];
}

export function buildZonas(sedes: Sede[]): Zona[] {
  return [
    { label: 'Norte del Valle', sedes: sedes.filter(s => (s.lat ?? 0) >= NORTE_LAT) },
    { label: 'Centro del Valle', sedes: sedes.filter(s => (s.lat ?? 0) >= SUR_LAT && (s.lat ?? 0) < NORTE_LAT) },
    { label: 'Sur del Valle',    sedes: sedes.filter(s => (s.lat ?? 0) < SUR_LAT) },
  ].filter(z => z.sedes.length > 0);
}
