/**
 * scripts/import-perfiles.mjs
 *
 * Parses perfiles_laboratorio.md and writes one JSON file per profile
 * into src/content/perfiles/.
 *
 * Usage:
 *   node scripts/import-perfiles.mjs          # writes files
 *   node scripts/import-perfiles.mjs --dry-run # prints parsed data, no writes
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Exam name → slug mapping (all unique names across all 17 profiles)
// ---------------------------------------------------------------------------
const HEMOGRAMA_SLUG =
  'hemograma-iv-hemoglobina-hematocrito-recuento-de-eritrocitos-indices-eritrocitarios-leucograma-recuento-de-plaquetas-indices-plaquetarios-y-morfologia-electronica-e-histograma-automatizado';

const NAME_TO_SLUG = {
  'Colesterol total': 'colesterol-total',
  'Colesterol de alta densidad (HDL)': 'colesterol-de-alta-densidad-hdl',
  'Colesterol de baja densidad (LDL)': 'colesterol-de-baja-densidad-ldl-enzimatico-automatizado',
  'Triglicéridos': 'trigliceridos',
  'Índice arterial': null,
  'Hemograma': HEMOGRAMA_SLUG,
  'Hemograma de IV generación': HEMOGRAMA_SLUG,
  'Dengue anticuerpos IGM': 'dengue-anticuerpos-ig-m',
  'Dengue antígeno NS1': null,
  'Creatinina en suero': 'creatinina-en-suero',
  'Glucosa en suero': 'glucosa-en-suero',
  'Uroanálisis': 'uroanalisis',
  'Nitrógeno Uréico BUN en suero': 'nitrogeno-ureico-serico-pre-y-post',
  'Albúmina en suero': 'albumina-en-suero-u-otros-fluidos',
  'Transaminasa ALT-TGP': 'transaminasa-glutamico-piruvica-alanino-amino-transferasa-alt-tgp',
  'Transaminasa AST-TGO (glutámico oxalacetina aspartato)':
    'transaminasa-glutamico-oxalacetica-aspartato-amino-transferasa-ast-tgo',
  'Bilirrubina total y directa': 'bilirrubina-total-y-directa',
  'GGT – Gamma glutamil transferasa': 'ggt-gamma-glutamil-transferasa',
  'Fosfatasa alcalina': 'fosfatasa-alcalina',
  'Tiempo de protrombina – PT': 'tiempo-de-protrombina-tp',
  'TSH': 'hormona-estimulante-de-tiroides-tsh',
  'T3 Total – Triyodotirona total': 't3-total-triyodotironina-total-t3-total',
  'T4 Total – Tiroxina total': 't4-total-tiroxina-total',
  'T4L – Tiroxina libre': 't4l-tiroxina-libre',
  'Antígeno prostático específico total (PSA)': 'antigeno-especifico-de-prostata-psa-automatizado',
  'Antígeno prostático libre (PSA)': 'antigeno-especifico-de-prostata-fraccion-libre-automatizado',
  'HIV prueba rápida': 'hiv-prueba-rapida',
  'Prueba no treponémica manual – VDRL (Serología)': 'prueba-no-treponemica-manual-vdrl',
  'Citología cérvico vaginal': 'citologia-cervico-vaginal',
  'Citología vaginal': 'citologia-cervico-vaginal',
  'Detección virus del papiloma humano por pruebas moleculares (específico)':
    'deteccion-virus-del-papiloma-humano-por-pruebas-moleculares-especifico',
  'Antígeno CA-125': 'antigeno-de-cancer-de-ovario-ca-125-automatizado',
  'Hepatitis B antígeno de superficie (AG-HBs)': 'hepatitis-b-antigeno-de-superficie-ag-hbs-2',
  'Hemoglobina glicosilada (Fracción A1C)': 'hemoglobina-glicosilada-automatizada-a1c',
  'Glucosa PRE y POST prandial': 'glucosa-pre-y-post-prandial',
  'Insulina PRE y POST prandial': 'insulina-pre-y-post-glucosa',
  'Coproscópico': 'coproscopico',
  'Sodio en suero': 'sodio-en-suero',
  'Potasio en suero': 'potasio-en-suero',
  'Cloro sérico': 'cloro-serico',
  'Tiempo parcial de tromboplastina – PTT': 'tiempo-de-tromboplastina-parcial-ttp',
  'CA 125 (cáncer de ovario)': 'antigeno-de-cancer-de-ovario-ca-125-automatizado',
  'CA 15-3 (cáncer de seno)': 'antigeno-de-cancer-de-mama-ca-15-3-automatizado',
  'CA 19-9 (cáncer de páncreas)': 'antigeno-de-cancer-de-tubo-digestivo-ca-19-9-automatizado',
  'Antígeno prostático específico total (PSA) ': 'antigeno-especifico-de-prostata-psa-automatizado',
  'TGO': 'transaminasa-glutamico-oxalacetica-aspartato-amino-transferasa-ast-tgo',
  'TGP': 'transaminasa-glutamico-piruvica-alanino-amino-transferasa-alt-tgp',
  'TSH ': 'hormona-estimulante-de-tiroides-tsh',
  'TSH – Hormona estimulante de tiroides': 'hormona-estimulante-de-tiroides-tsh',
  'T3 Total ': 't3-total-triyodotironina-total-t3-total',
  'T3 Total': 't3-total-triyodotironina-total-t3-total',
  'T4 Total ': 't4-total-tiroxina-total',
  'T4 Total': 't4-total-tiroxina-total',
  'Gamma Glutamil Transferasa (GGT)': 'ggt-gamma-glutamil-transferasa',
  'T4 Libre': 't4l-tiroxina-libre',
  'PT': 'tiempo-de-protrombina-tp',
  'PTT': 'tiempo-de-tromboplastina-parcial-ttp',
};

// Multi-exam items that expand to 2 entries each
const EXPAND_MAP = {
  'Sodio y Potasio': [
    { nombre: 'Sodio en suero', slug: 'sodio-en-suero' },
    { nombre: 'Potasio en suero', slug: 'potasio-en-suero' },
  ],
  'PT y PTT': [
    { nombre: 'Tiempo de protrombina – PT', slug: 'tiempo-de-protrombina-tp' },
    { nombre: 'Tiempo parcial de tromboplastina – PTT', slug: 'tiempo-de-tromboplastina-parcial-ttp' },
  ],
  'TGO – TGP': [
    {
      nombre: 'Transaminasa AST-TGO',
      slug: 'transaminasa-glutamico-oxalacetica-aspartato-amino-transferasa-ast-tgo',
    },
    {
      nombre: 'Transaminasa ALT-TGP',
      slug: 'transaminasa-glutamico-piruvica-alanino-amino-transferasa-alt-tgp',
    },
  ],
};

// ---------------------------------------------------------------------------
// Profile metadata (slug + descripcion) keyed by MD heading name
// ---------------------------------------------------------------------------
const PROFILE_META = {
  'Perfil Lipídico': {
    slug: 'lipidico',
    descripcion: 'Evaluación de lípidos en sangre para valorar riesgo cardiovascular.',
  },
  'Perfil Dengue – Anticuerpos IGM': {
    slug: 'dengue-igm',
    descripcion: 'Detección de infección activa o reciente por dengue mediante anticuerpos IGM.',
  },
  'Perfil Dengue – Antígeno NS1': {
    slug: 'dengue-ns1',
    descripcion: 'Detección temprana de dengue mediante antígeno NS1 en fase aguda.',
  },
  'Perfil Hipertensión': {
    slug: 'hipertension',
    descripcion: 'Evaluación de órganos diana en pacientes con presión arterial elevada.',
  },
  'Perfil Renal': {
    slug: 'renal',
    descripcion: 'Valoración de la función renal: filtración, depuración y análisis de orina.',
  },
  'Perfil Hepático': {
    slug: 'hepatico',
    descripcion: 'Evaluación de la función hepática: enzimas, proteínas y coagulación.',
  },
  'Perfil Deportivo': {
    slug: 'deportivo',
    descripcion: 'Chequeo integral para deportistas: función metabólica, renal y tiroidea.',
  },
  'Perfil Niños': {
    slug: 'ninos',
    descripcion: 'Batería pediátrica para seguimiento del estado de salud general.',
  },
  'Perfil Diabético': {
    slug: 'diabetico',
    descripcion: 'Control glucémico completo: glucosa, insulina y hemoglobina glicosilada.',
  },
  'Perfil Tiroideo': {
    slug: 'tiroideo',
    descripcion: 'Evaluación completa de la función tiroidea: T3, T4 y TSH.',
  },
  'Perfil Prostático': {
    slug: 'prostatico',
    descripcion: 'Detección temprana de alteraciones prostáticas mediante PSA y uroanálisis.',
  },
  'Perfil Mujer Gestante': {
    slug: 'mujer-gestante',
    descripcion: 'Seguimiento del embarazo: glicemia, función renal, serología e infecciones.',
  },
  'Perfil Femenino': {
    slug: 'femenino',
    descripcion: 'Detección de cáncer cervicouterino: citología, VPH y CA-125.',
  },
  'Perfil Enfermedades Sexuales': {
    slug: 'enfermedades-sexuales',
    descripcion: 'Cribado completo de infecciones de transmisión sexual.',
  },
  'Perfil Pre-Quirúrgico': {
    slug: 'pre-quirurgico',
    descripcion: 'Exámenes preoperatorios obligatorios: hemograma, coagulación y serología.',
  },
  'Perfil General Mujeres': {
    slug: 'general-mujeres',
    descripcion:
      'Chequeo integral femenino: marcadores tumorales, hormonas tiroideas y función orgánica.',
  },
  'Perfil General Hombres': {
    slug: 'general-hombres',
    descripcion:
      'Chequeo integral masculino: PSA, marcadores tumorales, hormonas tiroideas y función orgánica.',
  },
};

// ---------------------------------------------------------------------------
// Parse the MD file
// ---------------------------------------------------------------------------
function parsePerfiles(md) {
  const profiles = [];
  // Split by `### ` headings
  const sections = md.split(/^### /m).slice(1);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const nombre = lines[0].trim();

    // Price line: **Precio:** $XX.000
    const priceLine = lines.find((l) => l.startsWith('**Precio:**'));
    const precio = priceLine
      ? parseInt(priceLine.replace(/\*\*Precio:\*\*\s*\$/, '').replace(/[.\s]/g, ''), 10)
      : undefined;

    // Exam lines: `- ...`
    const examLines = lines
      .filter((l) => l.startsWith('- '))
      .map((l) => l.replace(/^- /, '').trim());

    profiles.push({ nombre, precio, examLines });
  }

  return profiles;
}

function resolveExamen(name) {
  // Check expand map first
  if (EXPAND_MAP[name]) return EXPAND_MAP[name];

  const slug = NAME_TO_SLUG[name];
  if (slug === undefined) {
    console.warn(`  ⚠️  No mapping for: "${name}"`);
    return [{ nombre: name }];
  }
  return slug ? [{ nombre: name, slug }] : [{ nombre: name }];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const mdPath = join(ROOT, 'perfiles_laboratorio.md');
const md = readFileSync(mdPath, 'utf-8');
const perfiles = parsePerfiles(md);

console.log(`Parsed ${perfiles.length} profiles.\n`);

let written = 0;
let skipped = 0;

for (const perfil of perfiles) {
  const meta = PROFILE_META[perfil.nombre];
  if (!meta) {
    console.warn(`⚠️  No meta for profile: "${perfil.nombre}" — skipping`);
    skipped++;
    continue;
  }

  const examenesIncluidos = perfil.examLines.flatMap(resolveExamen);

  const json = {
    slug: meta.slug,
    nombre: perfil.nombre,
    descripcion: meta.descripcion,
    examenesIncluidos,
    ...(perfil.precio !== undefined ? { precio: perfil.precio } : {}),
  };

  if (DRY_RUN) {
    console.log(`--- ${meta.slug} ---`);
    console.log(JSON.stringify(json, null, 2));
    console.log();
  } else {
    const outPath = join(ROOT, 'src/content/perfiles', `${meta.slug}.json`);
    writeFileSync(outPath, JSON.stringify(json, null, 2) + '\n');
    console.log(`✓ ${meta.slug}.json  (${examenesIncluidos.length} exams, $${perfil.precio?.toLocaleString('es-CO') ?? '—'})`);
    written++;
  }
}

if (!DRY_RUN) {
  console.log(`\nDone: ${written} written, ${skipped} skipped.`);
}
