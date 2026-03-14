#!/usr/bin/env node
/**
 * migrate.mjs
 * Splits docs/README.md into individual recipe files for Astro Content Collections.
 * Run from the repo root: node migrate.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_PATH = path.join(__dirname, 'docs/README.md');
const OUTPUT_DIR = path.join(__dirname, 'site/src/content/receitas');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function removeEmoji(str) {
  return str
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '')  // Unicode emoji
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/:[a-z0-9_]+:/g, '')             // text emoji codes like :corn: :cake:
    .trim();
}

function toSlug(title) {
  return removeEmoji(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function detectTags(title) {
  const tags = [];
  const t = title.toLowerCase();
  if (t.includes('low carb'))                                   tags.push('low-carb');
  if (t.includes('microondas') || t.includes('micro-ondas'))   tags.push('microondas');
  if (t.includes('liquidificador'))                             tags.push('liquidificador');
  if (t.includes('chocolate') || t.includes('cacau') || t.includes('brownie')) tags.push('chocolate');
  if (t.includes('frango'))                                     tags.push('frango');
  if (t.includes('sem farinha') || t.includes('sem trigo'))     tags.push('sem-farinha');
  if (t.includes('vegana') || t.includes('vegano'))             tags.push('vegano');
  if (t.includes('atum'))                                       tags.push('atum');
  if (t.includes('marmita'))                                    tags.push('marmita');
  return tags;
}

/** Category section headers have their name wrapped in **bold**. */
function parseCategoryId(textWithoutEmoji) {
  const t = textWithoutEmoji.toLowerCase();
  if (t.includes('low carb') || t.includes('receitas low')) return 'low-carb';
  if (t.includes('bolos'))    return 'bolos';
  if (t.includes('tortas'))   return 'tortas';
  if (t.includes('mousses'))  return 'mousses';
  if (t.includes('muffins'))  return 'muffins';
  return null;
}

/** Converts VuePress custom containers to standard HTML details/summary. */
function convertVuePressBlocks(md) {
  return md.replace(/::: details ([^\n]+)\n([\s\S]*?):::/g, (_, label, body) => {
    return `<details>\n<summary>${label.trim()}</summary>\n\n${body.trim()}\n\n</details>`;
  });
}

/** Strips leading separators/blanks and trailing separators/blanks from a line array. */
function trimSeparators(lines) {
  const isSep = (l) => /^(-{3,}|={3,})\s*$/.test(l) || l.trim() === '';
  while (lines.length > 0 && isSep(lines[0]))           lines.shift();
  while (lines.length > 0 && isSep(lines[lines.length - 1])) lines.pop();
  return lines;
}

// ---------------------------------------------------------------------------
// Parse README
// ---------------------------------------------------------------------------

const rawContent = fs.readFileSync(README_PATH, 'utf-8');
const lines = rawContent.split('\n');

let currentCategory = 'low-carb'; // file starts in Low Carb section
let recipes = [];
let current = null;

for (const line of lines) {
  // Match level-2 headings, stripping an optional trailing " ##"
  const h2 = line.match(/^##\s+(.+?)(?:\s+##)?\s*$/);
  if (!h2) {
    if (current) current.lines.push(line);
    continue;
  }

  const rawTitle = h2[1].trim();
  const plainTitle = removeEmoji(rawTitle).replace(/\*\*/g, '').trim(); // text only

  // End-of-file marker
  if (plainTitle.toLowerCase().includes('fim das receitas')) {
    if (current) { recipes.push(current); current = null; }
    break;
  }

  // Category section header (bold text = not a recipe)
  const isBold = /^\*\*.+\*\*$/.test(removeEmoji(rawTitle).trim());
  if (isBold) {
    const catId = parseCategoryId(plainTitle);
    if (catId) currentCategory = catId;
    if (current) { recipes.push(current); current = null; }
    continue;
  }

  // Recipe title
  if (current) recipes.push(current);

  const title = plainTitle; // emoji-free, clean
  current = {
    title,
    slug: toSlug(title),
    categoria: currentCategory,
    tags: detectTags(title),
    lines: [],
  };
}

if (current) recipes.push(current);

// ---------------------------------------------------------------------------
// Deduplicate slugs
// ---------------------------------------------------------------------------

const slugCount = {};
for (const r of recipes) slugCount[r.slug] = (slugCount[r.slug] || 0) + 1;

const slugSeen = {};
for (const r of recipes) {
  if (slugCount[r.slug] > 1) {
    slugSeen[r.slug] = (slugSeen[r.slug] || 0) + 1;
    if (slugSeen[r.slug] > 1) r.slug = `${r.slug}-${slugSeen[r.slug]}`;
  }
}

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------

// Clean the output directory before writing (removes stale files from previous runs)
if (fs.existsSync(OUTPUT_DIR)) {
  for (const f of fs.readdirSync(OUTPUT_DIR)) {
    if (f.endsWith('.md')) fs.unlinkSync(path.join(OUTPUT_DIR, f));
  }
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let created = 0;
for (const recipe of recipes) {
  const bodyLines = trimSeparators([...recipe.lines]);
  let body = convertVuePressBlocks(bodyLines.join('\n'));

  const tagsYaml = recipe.tags.length > 0
    ? `\ntags: [${recipe.tags.map((t) => `"${t}"`).join(', ')}]`
    : '';

  const safeTitle = recipe.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const frontmatter = `---\ntitle: "${safeTitle}"\ncategoria: "${recipe.categoria}"${tagsYaml}\n---\n\n`;

  fs.writeFileSync(path.join(OUTPUT_DIR, `${recipe.slug}.md`), frontmatter + body);
  console.log(`  ✓ [${recipe.categoria}] ${recipe.slug}.md`);
  created++;
}

console.log(`\n✅ ${created} receitas migradas para site/src/content/receitas/`);
