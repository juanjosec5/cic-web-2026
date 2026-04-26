/**
 * Converts an exam name to a URL-safe slug.
 * Strips diacritics, lowercases, replaces spaces with hyphens.
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Given a list of (codigoCups, rawSlug) pairs, returns a Map from codigoCups
 * to a final unique slug. When two entries share the same raw slug, each gets
 * a numeric suffix (-2, -3, …) in the order they appear in the input array.
 * The first occurrence keeps the bare slug; subsequent ones get -2, -3, etc.
 */
export function resolveSlugCollisions(
  items: Array<{ codigoCups: string; rawSlug: string }>
): Map<string, string> {
  // Count occurrences per base slug
  const counts = new Map<string, number>();
  for (const { rawSlug } of items) {
    counts.set(rawSlug, (counts.get(rawSlug) ?? 0) + 1);
  }

  // Assign final slugs; track how many of each base we've seen
  const seen = new Map<string, number>();
  const result = new Map<string, string>();

  for (const { codigoCups, rawSlug } of items) {
    if ((counts.get(rawSlug) ?? 0) > 1) {
      const n = (seen.get(rawSlug) ?? 0) + 1;
      seen.set(rawSlug, n);
      // First occurrence stays bare; subsequent ones get suffix
      result.set(codigoCups, n === 1 ? rawSlug : `${rawSlug}-${n}`);
    } else {
      result.set(codigoCups, rawSlug);
    }
  }

  return result;
}
