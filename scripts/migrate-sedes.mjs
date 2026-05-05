/**
 * scripts/migrate-sedes.mjs
 *
 * One-time script: imports all 18 sede JSON files into Sanity.
 * Uses createOrReplace with deterministic _id so it's safe to re-run.
 *
 * Requirements:
 *   SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN in .env
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-sedes.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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

const sedesDir = join(ROOT, 'src/content/sedes');
const files = readdirSync(sedesDir).filter((f) => f.endsWith('.json'));

console.log(`Migrating ${files.length} sedes to Sanity (${SANITY_PROJECT_ID} / ${SANITY_DATASET ?? 'production'})...\n`);

let ok = 0;
let fail = 0;

for (const file of files) {
  const data = JSON.parse(readFileSync(join(sedesDir, file), 'utf-8'));

  const doc = {
    _type: 'sede',
    _id: `sede-${data.slug}`,
    slug: { _type: 'slug', current: data.slug },
    nombre: data.nombre,
    ciudad: data.ciudad,
    direccion: data.direccion,
    ...(data.lat !== undefined ? { lat: data.lat } : {}),
    ...(data.lng !== undefined ? { lng: data.lng } : {}),
    telefono: data.telefono,
    whatsapp: data.whatsapp,
    ...(data.email ? { email: data.email } : {}),
    horario: data.horario ?? {},
    servicios: data.servicios ?? [],
    fotos: [],           // photos will be uploaded via Studio
    convenios: data.convenios ?? [],
    ...(data.domicilioGratisDesde !== undefined ? { domicilioGratisDesde: data.domicilioGratisDesde } : {}),
    esSedePrincipal: data.esSedePrincipal ?? false,
    ...(data.mapEmbedUrl ? { mapEmbedUrl: data.mapEmbedUrl } : {}),
  };

  try {
    await client.createOrReplace(doc);
    console.log(`  ✓ ${data.nombre} (${data.ciudad})`);
    ok++;
  } catch (err) {
    console.error(`  ✗ ${data.nombre}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} migrated, ${fail} failed.`);
if (fail > 0) process.exit(1);
