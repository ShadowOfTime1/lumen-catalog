// Build a Lumen catalog JSON from a folder: real IPFS CIDs + metadata, pinned to your node.
// Usage: node make_catalog.mjs <folder> <catalog name> [meta.json]
// Uses the `ipfs` CLI on your PATH (honours IPFS_PATH). Override the binary with IPFS_BIN.
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const [folder, name, metaFile] = process.argv.slice(2);
if (!folder || !name) { console.error('usage: make_catalog.mjs <folder> <name> [meta.json]'); process.exit(1); }

const IPFS = process.env.IPFS_BIN || 'ipfs';
// pass args as an array (no shell) so filenames with quotes/$/backticks can't inject commands
const ipfs = (args) => execFileSync(IPFS, args, { encoding: 'utf8', maxBuffer: 1e8 }).trim();

const TYPES = { '.epub': 'application/epub+zip', '.pdf': 'application/pdf', '.txt': 'text/plain',
  '.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.zip': 'application/zip', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.iso': 'application/x-iso9660-image',
  '.gz': 'application/gzip' };

const meta = metaFile && fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};

const items = [];
for (const file of fs.readdirSync(folder).sort()) {
  const full = path.join(folder, file);
  if (!fs.statSync(full).isFile()) continue;
  const cid = ipfs(['add', '-Q', full]);           // pins + returns CID
  const sha256 = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'); // for VirusTotal lookups
  const m = meta[file] || {};
  items.push({
    cid,
    name: file,
    path: file,
    size: fs.statSync(full).size,
    type: TYPES[path.extname(file).toLowerCase()] || '',
    sha256,
    title: m.title || file.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
    description: m.description || '',
    tags: m.tags || [],
  });
  console.log(`  ${cid}  ${file}`);
}

const catalog = {
  lumen_catalog: '1',
  name,
  created: new Date().toISOString(),
  count: items.length,
  total_size: items.reduce((s, i) => s + i.size, 0),
  items,
};

const out = path.join(folder, '..', name.replace(/[^\w.-]+/g, '_') + '.lumencatalog.json');
fs.writeFileSync(out, JSON.stringify(catalog, null, 2));
const catCid = ipfs(['add', '-Q', out]);
console.log(`\ncatalog: ${name} — ${items.length} files, ${(catalog.total_size / 1048576).toFixed(1)} MB`);
console.log(`json: ${out}`);
console.log(`CID: ${catCid}`);
