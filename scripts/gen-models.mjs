#!/usr/bin/env node
/**
 * gen-models.mjs — gera a camada de tipos por recurso a partir de api.generated.ts.
 *
 * Corrido automaticamente após `openapi-typescript` (ver script npm `sync:contract`).
 * A partir dos schemas do contrato (openapi.yaml do backend), emite:
 *   - um ficheiro por recurso  → <kebab>.model.ts   (re-export do tipo)
 *   - enums                    → enums.ts           (tipo + lista de valores em runtime)
 *   - envelope de erro         → errors.ts          (tipos + união ApiError)
 *   - ficheiro-índice          → index.ts           (ponto de importação estável)
 *
 * Todos os ficheiros gerados levam cabeçalho de aviso. Editar à mão perde-se na
 * próxima sincronização. Ficheiros feitos à mão (sem o marcador) nunca são tocados.
 */
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
// Pasta do contrato GERADO. Separada de src/app/models/ (que é para modelos
// escritos à mão, só-Angular). O gerador só limpa/reescreve ficheiros aqui —
// nunca toca em src/app/models/.
const CONTRATO_DIR = join(HERE, '..', 'src', 'app', 'contrato');
const GENERATED = join(CONTRATO_DIR, 'api.generated.ts');
const MARKER = 'FICHEIRO GERADO';
const DATA = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

function header(origem) {
  return [
    `// ⚠️ ${MARKER} — não editar à mão.`,
    `// Gerado por scripts/gen-models.mjs a partir de ${origem}`,
    `// (contrato: openapi.yaml do backend Laravel) em ${DATA}.`,
    `// Alterações manuais PERDEM-SE na próxima sincronização: npm run sync:contract`,
    '',
  ].join('\n');
}

const toKebab = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const toUpperSnake = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toUpperCase();

// ── Extrair schemas do api.generated.ts ──────────────────────────────────────
const src = readFileSync(GENERATED, 'utf8').split('\n');

const start = src.findIndex((l) => /^ {4}schemas:\s*\{/.test(l));
if (start === -1) {
  console.error('gen-models: não encontrei o bloco `schemas:` em api.generated.ts');
  process.exit(1);
}
let end = src.findIndex((l, i) => i > start && /^ {4}[A-Za-z$]/.test(l)); // próxima chave de 4 espaços (responses:)
if (end === -1) end = src.length;

/** @type {{name:string, kind:'enum'|'object', values?:string[]}[]} */
const schemas = [];
for (let i = start + 1; i < end; i++) {
  const m = src[i].match(/^ {8}([A-Za-z][A-Za-z0-9]*)\??:\s*(.*)$/);
  if (!m) continue; // linhas de propriedades (12+ espaços) ou fechos de bloco
  const [, name, rest] = m;
  if (rest.startsWith('"')) {
    const values = [...rest.matchAll(/"([^"]+)"/g)].map((v) => v[1]);
    schemas.push({ name, kind: 'enum', values });
  } else {
    schemas.push({ name, kind: 'object' });
  }
}

if (schemas.length === 0) {
  console.error('gen-models: 0 schemas extraídos — formato inesperado, a abortar (nada foi escrito)');
  process.exit(1);
}

const enums = schemas.filter((s) => s.kind === 'enum');
const errors = schemas.filter((s) => s.kind === 'object' && s.name.startsWith('Error'));
const resources = schemas.filter((s) => s.kind === 'object' && !s.name.startsWith('Error'));

// ── Limpar ficheiros gerados anteriormente (nunca tocar em ficheiros à mão) ───
for (const f of readdirSync(CONTRATO_DIR)) {
  if (!f.endsWith('.ts') || f === 'api.generated.ts') continue;
  const p = join(CONTRATO_DIR, f);
  if (readFileSync(p, 'utf8').includes(MARKER)) rmSync(p);
}

const written = [];
const write = (file, body) => {
  writeFileSync(join(CONTRATO_DIR, file), body.endsWith('\n') ? body : body + '\n', 'utf8');
  written.push(file);
};

// ── Um ficheiro por recurso ──────────────────────────────────────────────────
for (const r of resources) {
  write(
    `${toKebab(r.name)}.model.ts`,
    `${header('api.generated.ts')}import type { components } from './api.generated';\n\n` +
      `export type ${r.name} = components['schemas']['${r.name}'];\n`,
  );
}

// ── enums.ts ─────────────────────────────────────────────────────────────────
if (enums.length) {
  let body = `${header('api.generated.ts')}import type { components } from './api.generated';\n\n`;
  for (const e of enums) {
    const CONST = `${toUpperSnake(e.name)}_VALUES`;
    body += `export type ${e.name} = components['schemas']['${e.name}'];\n`;
    body += `export const ${CONST} = [${e.values.map((v) => `'${v}'`).join(', ')}] as const satisfies readonly ${e.name}[];\n\n`;
  }
  write('enums.ts', body);
}

// ── errors.ts ────────────────────────────────────────────────────────────────
if (errors.length) {
  let body = `${header('api.generated.ts')}import type { components } from './api.generated';\n\n`;
  for (const e of errors) body += `export type ${e.name} = components['schemas']['${e.name}'];\n`;
  body += `\n/** União de todos os envelopes de erro da API. */\n`;
  body += `export type ApiError =\n  | ${errors.map((e) => e.name).join('\n  | ')};\n`;
  write('errors.ts', body);
}

// ── index.ts (ficheiro-índice — ponto de importação estável) ─────────────────
{
  let body = header('api.generated.ts');
  body += `// Ponto de importação estável: os componentes/stores/services importam daqui,\n`;
  body += `// nunca de api.generated.ts. Assim uma regeneração nunca parte os imports.\n\n`;
  body += `export type { paths, components } from './api.generated';\n`;
  if (enums.length) body += `export * from './enums';\n`;
  if (errors.length) body += `export * from './errors';\n`;
  for (const r of resources) body += `export * from './${toKebab(r.name)}.model';\n`;
  write('index.ts', body);
}

console.log(`gen-models: ${resources.length} recurso(s), ${enums.length} enum(s), ${errors.length} erro(s) → ${written.length} ficheiro(s)`);
console.log('  ' + written.sort().join('\n  '));
