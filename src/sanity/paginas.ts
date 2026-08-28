import { client } from './client';
import { PAGINAS_QUERY } from './queries';
import type { Pagina } from './types';

/**
 * El build estático de Astro corre en un solo proceso Node, así que esta promesa
 * a nivel de módulo se comparte entre todas las páginas que renderizan contenido
 * de Sanity → una sola petición por build.
 */
let cache: Promise<Pagina[]> | null = null;

export function getPaginas(): Promise<Pagina[]> {
  return (cache ??= client.fetch<Pagina[]>(PAGINAS_QUERY));
}

export async function getPagina(ruta: string): Promise<Pagina | null> {
  const all = await getPaginas();
  return all.find((p) => p.ruta === ruta) ?? null;
}
