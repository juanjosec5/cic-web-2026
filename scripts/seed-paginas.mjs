/**
 * scripts/seed-paginas.mjs
 *
 * Siembra (idempotente) los documentos `pagina` para las rutas conocidas, de modo
 * que los editores solo tengan que EDITARLOS. Usa createIfNotExists + _id
 * determinista → seguro de re-ejecutar; NO sobrescribe contenido ya cargado.
 *
 * Requiere: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN en .env
 * Uso:  npm run seed:paginas
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Carga .env manualmente — funciona en todas las versiones de Node
const envPath = join(ROOT, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;

if (!SANITY_PROJECT_ID || !SANITY_API_TOKEN) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_API_TOKEN. Copy .env.example → .env and fill in values.');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET ?? 'production',
  token: SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ruta -> { título de referencia, _id determinista }
const PAGINAS = [
  { ruta: '/servicios', titulo: 'Servicios' },
  { ruta: '/pacientes/preparacion', titulo: 'Preparación de exámenes' },
  { ruta: '/pacientes/derechos-deberes', titulo: 'Derechos y deberes' },
  { ruta: '/empresas', titulo: 'Soluciones para empresas' },
  { ruta: '/laboratorios', titulo: 'Laboratorio de referencia' },
  { ruta: '/examenes', titulo: 'Catálogo de exámenes' },
  { ruta: '/nosotros/historia', titulo: 'Historia' },
  { ruta: '/nosotros/aliados', titulo: 'Aliados' },
  { ruta: '/nosotros', titulo: 'Sobre nosotros' },
  { ruta: '/contacto', titulo: 'Contacto' },
];

const idFor = (ruta) => `pagina-${ruta.replace(/^\//, '').replace(/\//g, '-')}`;

console.log(
  `Seeding ${PAGINAS.length} documentos "pagina" en ${SANITY_PROJECT_ID} / ${SANITY_DATASET ?? 'production'}...\n`,
);

let ok = 0;
let fail = 0;

for (const { ruta, titulo } of PAGINAS) {
  try {
    await client.createIfNotExists({
      _id: idFor(ruta),
      _type: 'pagina',
      titulo,
      ruta,
      banner: { activo: true },
    });
    console.log(`  ✓ ${ruta}`);
    ok++;
  } catch (err) {
    console.error(`  ✗ ${ruta}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed.`);
if (fail > 0) process.exit(1);
