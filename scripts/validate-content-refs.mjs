/**
 * scripts/validate-content-refs.mjs
 *
 * Validates cross-references between content collections that Astro's
 * Zod schemas can't catch (schema checks shape per-file, not that a
 * referenced slug in another file actually exists).
 *
 * Checks:
 *   - Duplicate slugs within examenes/ and perfiles/
 *   - Filename vs. `slug` field mismatch in examenes/ and perfiles/ (breaks routing)
 *   - perfiles/*.json  examenesIncluidos[].slug  -> must exist in examenes/
 *   - examenes/*.json  examenesRelacionados[]     -> must exist in examenes/
 *   - examenes/*.json  sedesDisponibles[]         -> must exist in sedes/
 *
 * Usage:
 *   node scripts/validate-content-refs.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src/content');

function loadCollection(name) {
  const dir = join(CONTENT, name);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((file) => ({
      file: `${name}/${file}`,
      base: basename(file, '.json'),
      data: JSON.parse(readFileSync(join(dir, file), 'utf-8')),
    }));
}

const examenes = loadCollection('examenes');
const perfiles = loadCollection('perfiles');
const sedes = loadCollection('sedes');

const examenSlugs = new Set(examenes.map((e) => e.data.slug));
const sedeSlugs = new Set(sedes.map((s) => s.data.slug));

const errors = [];
let checks = 0;

function checkDuplicateSlugs(entries) {
  const seen = new Map();
  for (const { file, data } of entries) {
    checks++;
    if (seen.has(data.slug)) {
      errors.push(`${file} -> duplicate slug '${data.slug}' (also in ${seen.get(data.slug)})`);
    } else {
      seen.set(data.slug, file);
    }
  }
}

function checkFilenameMatchesSlug(entries) {
  for (const { file, base, data } of entries) {
    checks++;
    if (base !== data.slug) {
      errors.push(`${file} -> filename '${base}' does not match slug field '${data.slug}' (breaks routing)`);
    }
  }
}

checkDuplicateSlugs(examenes);
checkDuplicateSlugs(perfiles);
checkFilenameMatchesSlug(examenes);
checkFilenameMatchesSlug(perfiles);

for (const { file, data } of perfiles) {
  for (const examen of data.examenesIncluidos ?? []) {
    if (!examen.slug) continue; // no slug = intentional plain text, not a link
    checks++;
    if (!examenSlugs.has(examen.slug)) {
      errors.push(`${file} -> examenesIncluidos: '${examen.slug}' (${examen.nombre}) does not exist in examenes/`);
    }
  }
}

for (const { file, data } of examenes) {
  for (const slug of data.examenesRelacionados ?? []) {
    checks++;
    if (!examenSlugs.has(slug)) {
      errors.push(`${file} -> examenesRelacionados: '${slug}' does not exist in examenes/`);
    }
  }
  for (const slug of data.sedesDisponibles ?? []) {
    checks++;
    if (!sedeSlugs.has(slug)) {
      errors.push(`${file} -> sedesDisponibles: '${slug}' does not exist in sedes/`);
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} broken content reference(s) found:\n`);
  for (const err of errors) console.error(`  ✗ ${err}`);
  console.error(`\n${checks} checks run, ${errors.length} failed.`);
  process.exit(1);
} else {
  console.log(`✓ ${checks} content reference checks passed.`);
}
