/**
 * scripts/migrate-perfiles.mjs
 *
 * One-time script: imports all perfil JSON files into Sanity.
 * Uses createOrReplace with deterministic _id so it's safe to re-run.
 * Images are NOT migrated — they're uploaded manually per perfil in Studio.
 *
 * Requirements:
 *   SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN in .env
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-perfiles.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env manually — works on all Node versions (--env-file requires 20.6+)
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

// Mirrors the CATEGORIA_MAP previously hardcoded in
// src/pages/examenes/perfiles/index.astro, so every migrated doc lands
// with the correct category for the listing page's filter pills.
const CATEGORIA_MAP = {
  'lipidico': 'cardiovascular',
  'hipertension': 'cardiovascular',
  'renal': 'metabolico',
  'hepatico': 'metabolico',
  'diabetico': 'metabolico',
  'tiroideo': 'metabolico',
  'dengue-igm': 'infeccioso',
  'dengue-ns1': 'infeccioso',
  'enfermedades-sexuales': 'infeccioso',
  'ninos': 'general',
  'deportivo': 'general',
  'pre-quirurgico': 'general',
  'prenatal': 'femenino',
  'mujer-gestante': 'femenino',
  'femenino': 'femenino',
  'general-mujeres': 'femenino',
  'prostatico': 'masculino',
  'general-hombres': 'masculino',
};

const perfilesDir = join(ROOT, 'src/content/perfiles');
const files = readdirSync(perfilesDir).filter((f) => f.endsWith('.json'));

console.log(`Migrating ${files.length} perfiles to Sanity (${SANITY_PROJECT_ID} / ${SANITY_DATASET ?? 'production'})...\n`);

let ok = 0;
let fail = 0;

for (const file of files) {
  const data = JSON.parse(readFileSync(join(perfilesDir, file), 'utf-8'));

  const doc = {
    _type: 'perfil',
    _id: `perfil-${data.slug}`,
    slug: { _type: 'slug', current: data.slug },
    nombre: data.nombre,
    descripcion: data.descripcion,
    categoria: CATEGORIA_MAP[data.slug] ?? 'general',
    examenesIncluidos: data.examenesIncluidos ?? [],
    ...(data.precio !== undefined ? { precio: data.precio } : {}),
  };

  try {
    await client.createOrReplace(doc);
    console.log(`  ✓ ${data.nombre}`);
    ok++;
  } catch (err) {
    console.error(`  ✗ ${data.nombre}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} migrated, ${fail} failed.`);
if (fail > 0) process.exit(1);
