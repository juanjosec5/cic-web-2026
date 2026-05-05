/**
 * Import exam portfolio from xlsx → src/content/examenes/*.json
 *
 * Usage:
 *   node scripts/import-examenes.mjs --dry-run   # inspect headers + seccion values
 *   node scripts/import-examenes.mjs             # write JSON files
 *
 * The xlsx has a title row (0), subtitle row (1), real headers on row 2,
 * and data from row 3 onwards. We read raw arrays and index by position.
 *
 * Column index map (row 2):
 *   0  CUPS
 *   1  CÓDIGO CIC
 *   2  PRUEBA
 *   3  SECCIÓN
 *   4  DIA DE  PROCESO
 *   5  TIREMPO DE INFORME  (sic)
 *   6  TIPO DE MUESTRA
 *  11  CONDICIONES DEL PACIENTE
 */

import { readdirSync, rmSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const XLSX    = require('xlsx')

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const XLSX_PATH = join(ROOT, 'examenes.xlsx')
const OUT_DIR   = join(ROOT, 'src', 'content', 'examenes')
const DRY_RUN   = process.argv.includes('--dry-run')

// Column positions (0-based) in the data rows
const COL = {
  cups:       0,
  codigoCic:  1,
  prueba:     2,
  seccion:    3,
  diaProceso: 4,
  tiempoInforme: 5,
  muestra:    6,
  condiciones: 11,
}

// Normalize a raw cell value to a trimmed string
const str = (v) => String(v ?? '').replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim()

// Slug: lowercase, remove accents, replace non-alphanumeric with hyphens
function toSlug(s) {
  return str(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Seccion → categoria enum slug ─────────────────────────────────────────────
const SECCION_MAP = {
  'ANDROLOGIA':                'andrologia',
  'BIOLOGIA MOLECULAR':        'biologia-molecular',
  'BIOLOGÍA MOLECULAR':        'biologia-molecular',
  'CITOGENETICA':              'citogenetica',
  'CITOGENÉTICA':              'citogenetica',
  'CITOMETRIA':                'citometria',
  'CITOMETRÍA':                'citometria',
  'COAGULACION':               'coagulacion',
  'COAGULACIÓN':               'coagulacion',
  'ELECTROFORESIS':            'electroforesis',
  'GENETICA':                  'genetica',
  'GENÉTICA':                  'genetica',
  'HEMATOLOGIA':               'hematologia',
  'HEMATOLOGÍA':               'hematologia',
  'HORMONAS':                  'hormonas',
  'INMUNOLOGIA':               'inmunologia',
  'INMUNOLOGÍA':               'inmunologia',
  'INMUNOLOGIA GENERAL':       'inmunologia',
  'INMUNOLOGÍA GENERAL':       'inmunologia',
  'INMUNOLOGIA INFECCIOSA':    'inmunologia-infecciosa',
  'INMUNOLOGÍA INFECCIOSA':    'inmunologia-infecciosa',
  'INMUNOQUIMICA':             'inmunoquimica',
  'INMUNOQUÍMICA':             'inmunoquimica',
  'MARCADORES CARDIACOS':      'marcadores-cardiacos',
  'MARCADORES CARDÍACOS':      'marcadores-cardiacos',
  'MARCADORES TUMORALES':      'marcadores-tumorales',
  'MEDICAMENTOS':              'medicamentos',
  'METABOLICAS':               'metabolicas',
  'METABÓLICAS':               'metabolicas',
  'MICROBIOLOGIA':             'microbiologia',
  'MICROBIOLOGÍA':             'microbiologia',
  'MICROSCOPIA':               'microscopia',
  'MICROSCOPÍA':               'microscopia',
  'NEFELOMETRIA':              'nefelometria',
  'NEFELOMETRÍA':              'nefelometria',
  'PATOLOGIA':                 'patologia',
  'PATOLOGÍA':                 'patologia',
  'PROTEINAS ESPECIFICAS':     'proteinas-especificas',
  'PROTEÍNAS ESPECÍFICAS':     'proteinas-especificas',
  'QUIMICA':                   'quimica',
  'QUÍMICA':                   'quimica',
  'REUMATOLOGIA':              'reumatologia',
  'REUMATOLOGÍA':              'reumatologia',
  'TOXICOLOGIA':               'toxicologia',
  'TOXICOLOGÍA':               'toxicologia',
}

function mapCategoria(seccion) {
  const key = str(seccion).toUpperCase()
  return SECCION_MAP[key] ?? 'otros'
}

// ── Load workbook ─────────────────────────────────────────────────────────────
if (!existsSync(XLSX_PATH)) {
  console.error(`\nERROR: ${XLSX_PATH} not found.\nDrop examenes.xlsx in the project root first.\n`)
  process.exit(1)
}

const wb   = XLSX.readFile(XLSX_PATH)
const ws   = wb.Sheets[wb.SheetNames[0]]
const raw  = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

const headers  = raw[2]   // row index 2 = real header row
const dataRows = raw.slice(3).filter(r => str(r[COL.prueba])) // skip blank rows

console.log(`\nSheet: "${wb.SheetNames[0]}"  —  ${dataRows.length} data rows\n`)

// ── Dry-run ───────────────────────────────────────────────────────────────────
if (DRY_RUN) {
  console.log('── Column headers (row 2) ──────────────────────────────')
  headers.forEach((h, i) => console.log(`  [${i}] "${h}"`))

  const secciones = [...new Set(dataRows.map(r => str(r[COL.seccion])))].sort()
  console.log('\n── Unique SECCIÓN values ───────────────────────────────')
  secciones.forEach(s => {
    const mapped = mapCategoria(s)
    const ok = mapped !== 'otros' ? '✓' : '⚠ unmapped'
    console.log(`  "${s}"  →  ${mapped}  ${ok}`)
  })
  console.log('\nDry-run complete.\n')
  process.exit(0)
}

// ── Real run ──────────────────────────────────────────────────────────────────
const existing = readdirSync(OUT_DIR).filter(f => f.endsWith('.json'))
existing.forEach(f => rmSync(join(OUT_DIR, f)))
console.log(`Cleared ${existing.length} existing JSON files.\n`)

const slugsSeen = new Set()
let written = 0, skipped = 0

for (const row of dataRows) {
  const nombre = str(row[COL.prueba])
  if (!nombre) { skipped++; continue }

  const cups       = str(row[COL.cups])
  const codigoCic  = str(row[COL.codigoCic])
  const seccion    = str(row[COL.seccion])
  const diaProceso = str(row[COL.diaProceso])
  const tiempoInforme = str(row[COL.tiempoInforme])
  const muestra    = str(row[COL.muestra])
  const condiciones = str(row[COL.condiciones])

  let slug = toSlug(nombre)
  if (slugsSeen.has(slug)) slug = `${slug}-${toSlug(cups || codigoCic)}`
  slugsSeen.add(slug)

  const record = {
    id:                    codigoCic || cups,
    nombre,
    codigoCups:            cups,
    slug,
    categoria:             mapCategoria(seccion),
    ...(diaProceso   && { diaProceso }),
    ...(tiempoInforme && { oportunidadResultados: tiempoInforme }),
    ...(muestra      && { muestra }),
    ...(condiciones  && { preparacion: condiciones }),
    nombresAlternativos:  [],
    sedesDisponibles:     [],
    examenesRelacionados: [],
    perfiles:             [],
    requiereAyuno:        false,
    imagen:               null,
    activo:               true,
  }

  writeFileSync(join(OUT_DIR, `${slug}.json`), JSON.stringify(record, null, 2) + '\n')
  written++
}

console.log(`Done: ${written} files written, ${skipped} rows skipped.\n`)
