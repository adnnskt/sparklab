#!/usr/bin/env node
'use strict';

/**
 * Upload em lote de JSONs para o Firestore.
 *
 * Uso:
 *   node scripts/upload-json.js <colecao> <arquivo-ou-pasta> [opções]
 *   npm run db:upload -- lessons data/lessons
 *
 * Exemplos:
 *   node scripts/upload-json.js lessons data/lessons
 *   node scripts/upload-json.js lessons data/lessons/lesson_theory_01.json --dry-run
 *   node scripts/upload-json.js lessons data/lessons --merge --credentials ./conta.json
 *
 * Opções:
 *   --dry-run            Só mostra o que seria gravado (não escreve nada)
 *   --merge              Grava com merge:true (preserva campos não enviados)
 *   --credentials <arq>  Caminho da service account JSON
 *   --project <id>       projectId (padrão: project_id da credencial)
 *   --id-field <campo>   Campo usado como id do documento (padrão: id)
 *   --batch-size <n>     Documentos por batch (padrão: 400, máx. 500)
 *   --help               Mostra esta ajuda
 *
 * Credenciais (nesta ordem):
 *   1. --credentials <arquivo>
 *   2. FIREBASE_SERVICE_ACCOUNT (caminho ou JSON inline)
 *   3. GOOGLE_APPLICATION_CREDENTIALS
 *   4. serviceAccount.json / firebase-service-account.json / ... na raiz do projeto
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function rel(file) {
  const relative = path.relative(PROJECT_ROOT, file);
  return relative.startsWith('..') ? file : relative;
}

const DEFAULT_ID_FIELD = 'id';
const DEFAULT_BATCH_SIZE = 400;
const MAX_BATCH_SIZE = 500;

const CREDENTIAL_CANDIDATES = [
  'serviceAccount.json',
  'firebase-service-account.json',
  'firebase-adminsdk.json',
  'credentials/serviceAccount.json',
  'scripts/serviceAccount.json',
];

const RECORDS_KEYS = ['docs', 'records', 'items', 'data'];

function fail(message) {
  console.error(`\x1b[31m[erro]\x1b[0m ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`\x1b[33m[aviso]\x1b[0m ${message}`);
}

function info(message) {
  console.log(message);
}

function usage() {
  const source = fs.readFileSync(__filename, 'utf8');
  const doc = source.match(/\/\*\*[\s\S]*?\*\//);
  console.log(doc ? doc[0] : 'Upload em lote de JSONs para o Firestore.');
}

function parseArgs(argv) {
  const opts = {
    positional: [],
    dryRun: false,
    merge: false,
    credentials: null,
    project: null,
    idField: DEFAULT_ID_FIELD,
    batchSize: DEFAULT_BATCH_SIZE,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      i += 1;
      if (i >= argv.length) fail(`Valor ausente para a opção ${arg}`);
      return argv[i];
    };

    switch (arg) {
      case '--dry-run':
      case '-n':
        opts.dryRun = true;
        break;
      case '--merge':
        opts.merge = true;
        break;
      case '--credentials':
        opts.credentials = value();
        break;
      case '--project':
        opts.project = value();
        break;
      case '--id-field':
        opts.idField = value();
        break;
      case '--batch-size':
        opts.batchSize = Number(value());
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('-')) fail(`Opção desconhecida: ${arg} (use --help)`);
        opts.positional.push(arg);
    }
  }

  if (opts.positional.length < 2) {
    usage();
    fail('Uso: node scripts/upload-json.js <colecao> <arquivo-ou-pasta> [opções]');
  }

  const collectionPath = opts.positional[0];
  if (!/^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/.test(collectionPath)) {
    fail(`Caminho de coleção inválido: "${collectionPath}" (use algo como "lessons" ou "units/u1/lessons").`);
  }

  if (!Number.isInteger(opts.batchSize) || opts.batchSize < 1 || opts.batchSize > MAX_BATCH_SIZE) {
    fail(`--batch-size deve ser um inteiro entre 1 e ${MAX_BATCH_SIZE}`);
  }

  return opts;
}

function collectJsonFiles(target) {
  const resolved = path.resolve(PROJECT_ROOT, target);

  if (!fs.existsSync(resolved)) {
    fail(`Caminho não encontrado: ${resolved}`);
  }

  const stat = fs.statSync(resolved);
  if (stat.isFile()) {
    if (!resolved.toLowerCase().endsWith('.json')) fail(`Arquivo não é .json: ${resolved}`);
    return [resolved];
  }

  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) found.push(full);
    }
  };
  walk(resolved);

  if (found.length === 0) fail(`Nenhum arquivo .json encontrado em: ${resolved}`);
  return found;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    fail(`Falha ao ler ${rel(file)}: ${err.message}`);
    return null;
  }
}

function extractRecords(parsed, file) {
  if (Array.isArray(parsed)) return parsed;

  if (parsed && typeof parsed === 'object') {
    const listKey = RECORDS_KEYS.find((key) => Array.isArray(parsed[key]));
    if (listKey) return parsed[listKey];
    return [parsed];
  }

  fail(`Conteúdo inválido em ${rel(file)}: esperado objeto ou array de objetos.`);
  return [];
}

function buildDocs(files, idField) {
  const byId = new Map();

  for (const file of files) {
    const records = extractRecords(readJson(file), file);
    const stem = path.basename(file).replace(/\.json$/i, '');

    records.forEach((record, index) => {
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        warn(`Ignorado: registro inválido em ${rel(file)} (posição ${index + 1}).`);
        return;
      }

      let id = record[idField];
      if (typeof id === 'number') id = String(id);

      if (!id) {
        if (records.length === 1) {
          id = stem;
          warn(`Sem campo "${idField}" em ${rel(file)}; usando o id "${id}".`);
        } else {
          id = `${stem}_${String(index + 1).padStart(3, '0')}`;
          warn(`Sem campo "${idField}" no registro ${index + 1} de ${rel(file)}; usando o id "${id}".`);
        }
      }

      if (typeof id !== 'string' || id.trim() === '' || id.includes('/')) {
        warn(`Id inválido "${id}" em ${rel(file)}; ignorado.`);
        return;
      }

      if (byId.has(id)) {
        warn(`Id duplicado "${id}" (substituindo registro anterior, origem: ${rel(file)}).`);
      }

      byId.set(id, { id, data: record, source: file });
    });
  }

  return Array.from(byId.values());
}

function resolveCredentialsPath(opts) {
  if (opts.credentials) {
    const file = path.resolve(PROJECT_ROOT, opts.credentials);
    if (!fs.existsSync(file)) fail(`Credencial não encontrada: ${file}`);
    return file;
  }

  const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envValue) {
    if (envValue.trim().startsWith('{')) return envValue;
    const file = path.resolve(PROJECT_ROOT, envValue);
    if (!fs.existsSync(file)) fail(`FIREBASE_SERVICE_ACCOUNT aponta para arquivo inexistente: ${file}`);
    return file;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const file = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (fs.existsSync(file)) return file;
  }

  for (const candidate of CREDENTIAL_CANDIDATES) {
    const file = path.join(PROJECT_ROOT, candidate);
    if (fs.existsSync(file)) return file;
  }

  fail(
    [
      'Nenhuma credencial de serviço encontrada.',
      'Baixe a chave em: Firebase Console > Configurações do projeto > Contas de serviço > Gerar nova chave privada',
      'E coloque o arquivo na raiz do projeto como serviceAccount.json (já está no .gitignore),',
      'ou informe com --credentials <arquivo> / FIREBASE_SERVICE_ACCOUNT / GOOGLE_APPLICATION_CREDENTIALS.',
    ].join('\n  '),
  );
  return null;
}

function loadServiceAccount(source) {
  let raw;
  if (source.trim().startsWith('{')) raw = source;
  else raw = fs.readFileSync(source, 'utf8');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    fail(`Credencial inválida (${source}): ${err.message}`);
  }

  for (const field of ['project_id', 'client_email', 'private_key']) {
    if (!parsed[field]) fail(`Credencial sem o campo "${field}" (${source}).`);
  }

  return parsed;
}

async function initFirestore(serviceAccount, projectId) {
  const { initializeApp, getApps, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId || serviceAccount.project_id,
    });

  return getFirestore(app);
}

async function upload(db, collectionPath, docs, opts) {
  if (opts.dryRun) {
    info(`\x1b[36m[dry-run]\x1b[0m ${docs.length} documento(s) seriam gravados em "${collectionPath}".`);
    for (const doc of docs.slice(0, 10)) {
      info(`  · ${doc.id}  <- ${rel(doc.source)}`);
    }
    if (docs.length > 10) info(`  ... e mais ${docs.length - 10} documento(s).`);
    return 0;
  }

  const started = Date.now();
  const target = db.collection(collectionPath);
  let written = 0;

  for (let i = 0; i < docs.length; i += opts.batchSize) {
    const chunk = docs.slice(i, i + opts.batchSize);
    const batch = db.batch();

    for (const item of chunk) {
      batch.set(target.doc(item.id), item.data, { merge: opts.merge });
    }

    await batch.commit();
    written += chunk.length;
    process.stdout.write(`\r  gravados ${written}/${docs.length}`);
  }

  process.stdout.write('\n');
  info(`\x1b[32m[ok]\x1b[0m ${written} documento(s) em "${collectionPath}" (${Date.now() - started}ms).`);
  return written;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const [collectionPath, target] = opts.positional;

  const files = collectJsonFiles(target);
  const docs = buildDocs(files, opts.idField);

  if (docs.length === 0) fail('Nenhum documento válido para enviar.');

  info(`Arquivos: ${files.length} | Documentos: ${docs.length} | Coleção: ${collectionPath}${opts.dryRun ? ' (dry-run)' : ''}`);

  if (opts.dryRun) {
    await upload(null, collectionPath, docs, opts);
    return;
  }

  const serviceAccount = loadServiceAccount(resolveCredentialsPath(opts));
  const db = await initFirestore(serviceAccount, opts.project);

  await upload(db, collectionPath, docs, opts);
}

main().catch((err) => {
  fail(err && err.message ? err.message : String(err));
});
