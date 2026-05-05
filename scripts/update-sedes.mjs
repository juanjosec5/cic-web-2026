/**
 * Patch sede JSONs from sedes.xlsx
 * Updates: direccion, telefono, whatsapp, email, horario
 * Preserves: slug, nombre, ciudad, lat, lng, servicios, fotos, convenios, etc.
 * Creates dagua.json if missing.
 *
 * Usage: node scripts/update-sedes.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const XLSX    = require('xlsx')

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const XLSX_PATH = join(ROOT, 'sedes.xlsx')
const SEDES_DIR = join(ROOT, 'src', 'content', 'sedes')

// Format a 10-digit Colombian mobile number: 3183492569 → "318 349 2569"
function fmtPhone(raw) {
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 10) return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`
  return digits
}

// Normalize schedule text — collapse multiple spaces
function fmtHorario(raw) {
  const s = String(raw ?? '').replace(/\s+/g, ' ').trim()
  return s === 'N/A' || s === '' ? null : s
}

// xlsx name → slug + ciudad
const NAME_MAP = {
  'CIC ANDALUCIA':       { slug: 'andalucia',   ciudad: 'Andalucía' },
  'CIC ANSERMANUEVO':    { slug: 'ansermanuevo', ciudad: 'Ansermanuevo' },
  'CIC BUGALAGRANDE':    { slug: 'bugalagrande', ciudad: 'Bugalagrande' },
  'CIC CAICEDONIA':      { slug: 'caicedonia',   ciudad: 'Caicedonia' },
  'CIC CARTAGO':         { slug: 'cartago',      ciudad: 'Cartago' },
  'CIC DAGUA':           { slug: 'dagua',        ciudad: 'Dagua' },
  'CIC DARIEN':          { slug: 'darien',       ciudad: 'El Darién' },
  'CIC GUACARI':         { slug: 'guacari',      ciudad: 'Guacarí' },
  'CIC LA CUMBRE':       { slug: 'la-cumbre',    ciudad: 'La Cumbre' },
  'CIC LA UNION':        { slug: 'la-union',     ciudad: 'La Unión' },
  'CIC OBANDO':          { slug: 'obando',       ciudad: 'Obando' },
  'CIC PRINCIPAL - BUGA':{ slug: 'buga',         ciudad: 'Guadalajara de Buga' },
  'CIC RESTREPO':        { slug: 'restrepo',     ciudad: 'Restrepo' },
  'CIC ROLDANILLO':      { slug: 'roldanillo',   ciudad: 'Roldanillo' },
  'CIC SAN PEDRO':       { slug: 'san-pedro',    ciudad: 'San Pedro' },
  'CIC TULUA':           { slug: 'tulua',        ciudad: 'Tuluá' },
  'CIC YOTOCO':          { slug: 'yotoco',       ciudad: 'Yotoco' },
  'CIC ZARZAL':          { slug: 'zarzal',       ciudad: 'Zarzal' },
}

// Load xlsx
const wb   = XLSX.readFile(XLSX_PATH)
const ws   = wb.Sheets[wb.SheetNames[0]]
const raw  = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
const rows = raw.slice(5).filter(r => String(r[0]).trim()) // data starts row 5

let updated = 0, created = 0

for (const row of rows) {
  const nameRaw = String(row[0]).trim().toUpperCase()
  const info    = NAME_MAP[nameRaw]
  if (!info) { console.warn(`  ⚠ No mapping for "${nameRaw}"`) ; continue }

  const { slug, ciudad } = info
  const filePath = join(SEDES_DIR, `${slug}.json`)

  // Parse fields from xlsx
  const direccion   = String(row[1]).trim()
  const telRaw      = String(row[2]).trim()
  const lvRaw       = fmtHorario(row[3])   // Lunes–Viernes
  const sabRaw      = fmtHorario(row[4])   // Sábado
  const emailRaw    = String(row[5]).trim()

  // Buga has "Recepción 317 432 8255 Domicilios 315 819 7366" as phone
  // Extract first 10-digit number from that string
  const phoneDigits = telRaw.replace(/\D/g, '')
  const telefono    = phoneDigits.length >= 10
    ? fmtPhone(phoneDigits.slice(0, 10))
    : fmtPhone(telRaw)

  // Buga has two emails separated by whitespace — take the first
  const email = emailRaw.split(/\s+/)[0]

  const horario = {
    lunes:     lvRaw ?? undefined,
    martes:    lvRaw ?? undefined,
    miercoles: lvRaw ?? undefined,
    jueves:    lvRaw ?? undefined,
    viernes:   lvRaw ?? undefined,
    sabado:    sabRaw ?? undefined,
  }
  // Remove undefined keys
  Object.keys(horario).forEach(k => horario[k] === undefined && delete horario[k])

  if (existsSync(filePath)) {
    // Patch existing file
    const existing = JSON.parse(readFileSync(filePath, 'utf8'))
    const patched = {
      ...existing,
      direccion,
      telefono,
      whatsapp: existing.whatsapp ?? telefono, // keep whatsapp if already set
      ...(email && { email }),
      horario: { ...existing.horario, ...horario },
    }
    writeFileSync(filePath, JSON.stringify(patched, null, 2) + '\n')
    console.log(`  ✓ Updated ${slug}.json`)
    updated++
  } else {
    // Create new sede (Dagua)
    const newSede = {
      slug,
      nombre: `CIC Laboratorios — ${ciudad}`,
      ciudad,
      direccion,
      telefono,
      whatsapp: telefono,
      ...(email && { email }),
      horario,
      servicios: ['toma-muestras', 'validacion-qr'],
      fotos: [],
      convenios: [],
      esSedePrincipal: false,
    }
    writeFileSync(filePath, JSON.stringify(newSede, null, 2) + '\n')
    console.log(`  + Created ${slug}.json`)
    created++
  }
}

console.log(`\nDone: ${updated} updated, ${created} created.\n`)
