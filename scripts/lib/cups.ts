/**
 * CUPS-based category assignment for clinical lab exams.
 *
 * Colombian CUPS (Clasificación Única de Procedimientos en Salud) codes are
 * 6-digit identifiers. The 3-digit prefix group maps to broad lab categories.
 * Name-based refinement rules override the prefix when the exam name clearly
 * belongs to a different category (e.g. TSH appears under 902xxx chemistry
 * codes but semantically belongs to hormones).
 */

export type Categoria =
  | 'quimica'
  | 'microbiologia'
  | 'hematologia'
  | 'inmunologia'
  | 'genetica'
  | 'hormonas'
  | 'orina'
  | 'parasitologia'
  | 'otros';

// ---------------------------------------------------------------------------
// 3-digit prefix → category
// ---------------------------------------------------------------------------
const CUPS_PREFIX_MAP: Record<string, Categoria> = {
  '902': 'hematologia',
  '903': 'quimica',
  '904': 'microbiologia',
  '905': 'inmunologia',
  '906': 'hormonas',
  '907': 'parasitologia',
  '908': 'orina',
  '909': 'orina',
  '910': 'genetica',
  '911': 'genetica',
};

// ---------------------------------------------------------------------------
// Name-based refinement rules
// Each rule is tested in order; the first match wins.
// ---------------------------------------------------------------------------
interface RefinementRule {
  pattern: RegExp;
  categoria: Categoria;
}

const REFINEMENT_RULES: RefinementRule[] = [
  // Hormones — specific names often land under 902/905 in CUPS
  {
    pattern:
      /\b(tsh|tiroxina|t3\b|t4\b|triyodo|tiroide|cortisol|insulina|testosterona|progesterona|estradiol|prolactina|fsh|lh|dhea|igf|parathormona|pth|calcitonina|aldosterona|ghb|hemoglobina glicosilada)\b/i,
    categoria: 'hormonas',
  },
  // Urine / urinalysis
  {
    pattern: /\b(orina|uroanalisis|uroanálisis|parcial de orina|creatinina en orina|proteinuria)\b/i,
    categoria: 'orina',
  },
  // Hematology — some coag tests are grouped under 902 in CUPS
  {
    pattern:
      /\b(hemograma|hematocrito|plaquetas|eritrocitos|leucocitos|formula leucocitaria|reticulocitos|velocidad de sedimentacion|vsg|tiempo de coagulacion|tiempo de sangria|tp\b|tpt\b|protrombina|fibrinogeno|factor\s+[ivxlc]+)\b/i,
    categoria: 'hematologia',
  },
  // Microbiology
  {
    pattern:
      /\b(cultivo|antibiograma|gram\b|hongos|coproparasitologico|coprocultivo|urocultivo|hemocultivo|esputo|koh|ziehl|tincion)\b/i,
    categoria: 'microbiologia',
  },
  // Genetics / molecular
  {
    pattern: /\b(pcr\b|adn|dna|rna|genotipo|mutacion|molecular|cariotipo|fish\b|amh)\b/i,
    categoria: 'genetica',
  },
  // Parasitology
  {
    pattern: /\b(parasito|helmintos|protozoo|amoeba|giardia|cryptosporidium|entamoeba|toxoplasma|chagas)\b/i,
    categoria: 'parasitologia',
  },
  // Immunology / serology
  {
    pattern:
      /\b(anticuerpo|antigeno|igm|igg|iga|elisa|serologia|vdrl|hiv|hepatitis|anca|ana\b|factor reumatoide|proteina c reactiva|pcr cuantitativa|aso|anti)\b/i,
    categoria: 'inmunologia',
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export interface CategorizeResult {
  categoria: Categoria;
  /** true if a name-based rule overrode the CUPS prefix category */
  refined: boolean;
  /** the category derived from the CUPS prefix alone (may differ from categoria) */
  fromPrefix: Categoria;
}

export function categorize(codigoCups: string, nombre: string): CategorizeResult {
  const prefix = codigoCups.slice(0, 3);
  const fromPrefix: Categoria = CUPS_PREFIX_MAP[prefix] ?? 'otros';

  for (const rule of REFINEMENT_RULES) {
    if (rule.pattern.test(nombre)) {
      return {
        categoria: rule.categoria,
        refined: rule.categoria !== fromPrefix,
        fromPrefix,
      };
    }
  }

  return { categoria: fromPrefix, refined: false, fromPrefix };
}
