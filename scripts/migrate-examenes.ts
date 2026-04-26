/**
 * migrate-examenes.ts
 *
 * One-shot migration script. Converts the raw JSON dump from the legacy
 * MongoDB-backed `/api/labs?search=.` endpoint into validated Astro content
 * collection files under `src/content/examenes/`.
 *
 * Usage:
 *   Place the raw JSON array at data/raw/examenes-raw.json, then run:
 *     npm run migrate:examenes
 *
 * Outputs:
 *   src/content/examenes/<slug>.json   — one file per exam
 *   data/reports/migrate-errors.json  — validation failures (if any)
 *   data/reports/migrate-warnings.json — swap-heuristic & category warnings
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { toSlug, resolveSlugCollisions } from './lib/slug.js';
import { categorize } from './lib/cups.js';
import { examenSchema, type Examen } from './lib/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Raw input schema
// Mirrors the shape returned by /api/labs?search=.
// ---------------------------------------------------------------------------
const rawExamenSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  nombre_prueba: z.string(),
  codigo_cups: z.string(),
  /**
   * ⚠️  FIELD SWAP: In the source data the field labels are inverted.
   *   condicion_paciente  →  actually contains the delivery time  → oportunidadResultados
   *   tiempo_entrega      →  actually contains preparation notes  → preparacion
   */
  condicion_paciente: z.string().optional(),
  tiempo_entrega: z.string().optional(),
  muestra: z.string().optional(),
  sinonimos: z.array(z.string()).optional().default([]),
  descripcion: z.string().optional(),
  activo: z.boolean().optional().default(true),
});

type RawExamen = z.infer<typeof rawExamenSchema>;

// ---------------------------------------------------------------------------
// Heuristics to detect if fields look correctly swapped
// ---------------------------------------------------------------------------
const DELIVERY_PATTERN =
  /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|am|pm|\d+\s*horas?|\d+\s*d[ií]as?|\d+\s*semanas?|resultado|entrega|mismo d[ií]a|partir del|procesamiento|despacho)\b/i;

const PREP_PATTERN =
  /\b(ayuno|preparaci[oó]n|dieta|evitar|abstenerse|horas antes|d[ií]as antes|no comer|en ayunas|no requiere|relacionar datos|consumir|ingerir)\b/i;

function swapLooksCorrect(condicion_paciente?: string, tiempo_entrega?: string): boolean {
  const cpOk = !condicion_paciente || DELIVERY_PATTERN.test(condicion_paciente);
  const teOk = !tiempo_entrega || PREP_PATTERN.test(tiempo_entrega);
  return cpOk && teOk;
}

function detectRequiereAyuno(preparacion?: string): boolean | undefined {
  if (!preparacion) return undefined;
  return /ayuno/i.test(preparacion);
}

// ---------------------------------------------------------------------------
// Transform one raw entry into a validated Examen
// ---------------------------------------------------------------------------
interface TransformResult {
  data: Examen | null;
  warnings: string[];
  errors: string[];
}

function transformEntry(
  raw: RawExamen,
  slugMap: Map<string, string>
): TransformResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Resolve MongoDB id
  const mongoId = raw._id;

  // Apply field swap: condicion_paciente → oportunidadResultados, tiempo_entrega → preparacion
  const oportunidadResultados = raw.condicion_paciente;
  const preparacion = raw.tiempo_entrega;

  if (!swapLooksCorrect(raw.condicion_paciente, raw.tiempo_entrega)) {
    warnings.push(
      `swap-heuristic: [${raw.codigo_cups}] "${raw.nombre_prueba}" — ` +
        `condicion_paciente="${(raw.condicion_paciente ?? '').slice(0, 60)}" ` +
        `tiempo_entrega="${(raw.tiempo_entrega ?? '').slice(0, 60)}" ` +
        `— values may not conform to the known swap pattern; review manually`
    );
  }

  // Categorize
  const { categoria, refined, fromPrefix } = categorize(raw.codigo_cups, raw.nombre_prueba);
  if (refined) {
    warnings.push(
      `category-refined: [${raw.codigo_cups}] "${raw.nombre_prueba}" — ` +
        `prefix says "${fromPrefix}", name-rule overrides to "${categoria}"`
    );
  }

  // Resolve slug
  const slug = slugMap.get(raw.codigo_cups);
  if (!slug) {
    errors.push(`slug-missing: no slug resolved for CUPS code "${raw.codigo_cups}"`);
    return { data: null, warnings, errors };
  }

  // Build candidate object
  const candidate = {
    id: raw.codigo_cups,
    mongoId,
    nombre: raw.nombre_prueba,
    codigoCups: raw.codigo_cups,
    slug,
    categoria,
    nombresAlternativos: raw.sinonimos,
    muestra: raw.muestra,
    requiereAyuno: detectRequiereAyuno(preparacion),
    preparacion: preparacion ?? undefined,
    oportunidadResultados: oportunidadResultados ?? undefined,
    descripcionQueEs: raw.descripcion ?? undefined,
    sedesDisponibles: [],
    examenesRelacionados: [],
    perfiles: [],
    imagen: null,
    activo: raw.activo,
  };

  const parsed = examenSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(
        `validation: [${raw.codigo}] ${issue.path.join('.') || 'root'}: ${issue.message}`
      );
    }
    return { data: null, warnings, errors };
  }

  return { data: parsed.data, warnings, errors };
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const rawPath = join(ROOT, 'data/raw/examenes-raw.json');
  const outputDir = join(ROOT, 'src/content/examenes');
  const reportsDir = join(ROOT, 'data/reports');

  // ── 1. Read input ──────────────────────────────────────────────────────────
  if (!existsSync(rawPath)) {
    console.error(`\n❌  Input file not found: ${rawPath}`);
    console.error(`    Place the raw JSON array at that path and re-run.\n`);
    process.exit(1);
  }

  const rawJson: unknown[] = JSON.parse(readFileSync(rawPath, 'utf-8')) as unknown[];
  console.log(`\n📥  Read ${rawJson.length} raw entries`);

  // ── 2. Parse raw entries ───────────────────────────────────────────────────
  const parsedEntries: RawExamen[] = [];
  const parseFailures: Array<{ index: number; errors: string[] }> = [];

  for (let i = 0; i < rawJson.length; i++) {
    const result = rawExamenSchema.safeParse(rawJson[i]);
    if (result.success) {
      parsedEntries.push(result.data);
    } else {
      parseFailures.push({
        index: i,
        errors: result.error.issues.map(e => `${e.path.join('.') || 'root'}: ${e.message}`),
      });
    }
  }

  if (parseFailures.length > 0) {
    console.warn(`\n⚠️   ${parseFailures.length} entries failed raw schema parsing (skipped):`);
    for (const f of parseFailures) {
      console.warn(`  [${f.index}] ${f.errors.join(', ')}`);
    }
  }

  // ── 3. Resolve slug collisions ─────────────────────────────────────────────
  const slugInputs = parsedEntries.map(r => ({
    codigoCups: r.codigo_cups,
    rawSlug: toSlug(r.nombre_prueba),
  }));
  const slugMap = resolveSlugCollisions(slugInputs);

  // ── 4. Transform & validate ────────────────────────────────────────────────
  const results = parsedEntries.map(raw => ({ raw, ...transformEntry(raw, slugMap) }));

  const successful = results.filter(r => r.data !== null);
  const failed = results.filter(r => r.data === null);
  const withWarnings = results.filter(r => r.warnings.length > 0);

  // ── 5. Clean output directory (only .json files) ───────────────────────────
  if (existsSync(outputDir)) {
    const existing = readdirSync(outputDir).filter(f => f.endsWith('.json'));
    for (const f of existing) rmSync(join(outputDir, f));
    if (existing.length > 0) {
      console.log(`\n🧹  Removed ${existing.length} existing .json files from ${outputDir}`);
    }
  } else {
    mkdirSync(outputDir, { recursive: true });
  }

  // ── 6. Write output files ──────────────────────────────────────────────────
  for (const { data } of successful) {
    if (!data) continue;
    writeFileSync(join(outputDir, `${data.slug}.json`), JSON.stringify(data, null, 2) + '\n');
  }
  console.log(`✅  Wrote ${successful.length} files → ${outputDir}`);

  // ── 7. Write reports ───────────────────────────────────────────────────────
  mkdirSync(reportsDir, { recursive: true });

  if (failed.length > 0) {
    const failReport = failed.map(r => ({
      codigo: r.raw.codigo_cups,
      nombre: r.raw.nombre_prueba,
      errors: r.errors,
    }));
    const failPath = join(reportsDir, 'migrate-errors.json');
    writeFileSync(failPath, JSON.stringify(failReport, null, 2) + '\n');
    console.log(`📄  Error report → ${failPath}`);
  }

  if (withWarnings.length > 0) {
    const warnReport = withWarnings.map(r => ({
      codigo: r.raw.codigo_cups,
      nombre: r.raw.nombre_prueba,
      warnings: r.warnings,
    }));
    const warnPath = join(reportsDir, 'migrate-warnings.json');
    writeFileSync(warnPath, JSON.stringify(warnReport, null, 2) + '\n');
    console.log(`📄  Warning report → ${warnPath}`);
  }

  // ── 8. Print summary ───────────────────────────────────────────────────────
  console.log('\n─── Migration summary ───────────────────────────────────────────');
  console.log(`  Raw entries read:     ${rawJson.length}`);
  console.log(`  Raw parse failures:   ${parseFailures.length}`);
  console.log(`  Transform failures:   ${failed.length}`);
  console.log(`  Warnings:             ${withWarnings.length}`);
  console.log(`  Files written:        ${successful.length}`);
  console.log('─────────────────────────────────────────────────────────────────\n');

  if (failed.length > 0) {
    console.error(`❌  ${failed.length} entries could not be migrated. See ${join(reportsDir, 'migrate-errors.json')}`);
    for (const { raw, errors } of failed) {
      console.error(`\n  [${raw.codigo_cups}] ${raw.nombre_prueba}`);
      for (const e of errors) console.error(`    ${e}`);
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥  Fatal error:', err);
  process.exit(1);
});
