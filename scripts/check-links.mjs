/**
 * scripts/check-links.mjs
 *
 * Crawls the built static site (dist/client) and verifies every internal
 * <a href="..."> resolves to a page that actually exists in the output.
 * Checks the final rendered HTML, not the content sources — catches broken
 * links regardless of whether they came from Sanity, local JSON content, or
 * a hardcoded template typo.
 *
 * Only internal links (starting with "/") are checked. mailto:, tel:, and
 * external http(s) links are skipped — a blocking pre-push hook shouldn't
 * fail because a third-party site is briefly down.
 *
 * Requires a fresh build first: npm run build && npm run check-links
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist/client');

if (!existsSync(DIST)) {
  console.error(`✗ ${relative(ROOT, DIST)} not found. Run "npm run build" first.`);
  process.exit(1);
}

function findHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...findHtmlFiles(full));
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

function pageExists(urlPath) {
  if (urlPath === '/') return existsSync(join(DIST, 'index.html'));
  const clean = urlPath.replace(/^\/+/, '');
  return (
    existsSync(join(DIST, clean)) || // exact file (assets, .pdf, etc.)
    existsSync(join(DIST, clean, 'index.html')) || // directory route
    existsSync(join(DIST, `${clean}.html`)) // bare .html route
  );
}

const htmlFiles = findHtmlFiles(DIST);
const hrefPattern = /href="([^"]+)"/g;

const errors = [];
let checks = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8');
  const pageRoute = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '');

  for (const match of html.matchAll(hrefPattern)) {
    let href = match[1].replace(/&amp;/g, '&');

    if (!href.startsWith('/') || href.startsWith('//')) continue; // external, mailto:, tel:, etc.

    href = href.split('#')[0].split('?')[0];
    if (!href) continue; // was purely a hash/query on the current page

    checks++;
    if (!pageExists(href)) {
      errors.push(`${pageRoute} -> href="${href}" does not resolve to a page in dist/client`);
    }
  }
}

if (errors.length > 0) {
  const unique = [...new Set(errors)];
  console.error(`✗ ${unique.length} broken internal link(s) found:\n`);
  for (const err of unique) console.error(`  ✗ ${err}`);
  console.error(`\n${checks} links checked, ${unique.length} broken.`);
  process.exit(1);
} else {
  console.log(`✓ ${checks} internal links checked across ${htmlFiles.length} pages, 0 broken.`);
}
