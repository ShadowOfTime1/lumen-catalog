# Lumen Catalog

An uncensorable content layer for [Lumen](https://lumen-network.org). A **catalog** is a small JSON manifest that lists files by their IPFS CID plus whatever metadata you want. Content stays immutable, the metadata is yours to edit, and there's nothing central to take down.

Two small, dependency-free web apps:

- **`catalog/`** — build a catalog straight in the browser. Pick a folder and every file is hashed into its real IPFS CID locally (nothing is uploaded). Add titles, tags and your own columns, then export the catalog JSON.
- **`browser/`** — browse published catalogs and pull files by CID, straight to disk. Global search, multi-select, download parts, and "open any catalog by its CID".

Live: [`lumen://catalog.lmn`](lumen://catalog.lmn) · [`lumen://index.lmn`](lumen://index.lmn)

## Why

Hosting large or unpopular files on the normal web is expensive, link-rots, and can be pulled at any time. On Lumen a file is addressed by its content (CID), served peer-to-peer, and stays reachable as long as anyone seeds it. A catalog is just the index on top — like a torrent index, but the "torrents" are CIDs and the whole thing is a static page.

## How the CIDs work

The builder computes **the same CID `ipfs add` would give**, in the browser, before anything leaves your machine. It bundles [`ipfs-only-hash`](https://www.npmjs.com/package/ipfs-only-hash) with esbuild into `catalog/hash.bundle.js`. So you can index a folder without uploading it — the content stays wherever it already is, and you only share the manifest.

## Catalog format

```json
{
  "lumen_catalog": "1",
  "name": "Public Domain Library",
  "created": "2026-07-08T00:00:00.000Z",
  "count": 8,
  "total_size": 3300261,
  "columns": [
    { "key": "title", "label": "Title", "type": "text" },
    { "key": "tags", "label": "Tags", "type": "tags" }
  ],
  "items": [
    { "cid": "Qm…", "name": "book.epub", "path": "book.epub", "size": 304128,
      "type": "application/epub+zip", "title": "…", "description": "…", "tags": ["classic"] }
  ]
}
```

See [`examples/`](examples/) for real manifests.

## Usage

Both apps are plain static HTML — open them in the Lumen browser, or serve the folder over any static server / IPFS gateway:

```bash
# quick local preview
npx serve catalog
npx serve browser
```

The browser app reads its list of catalogs from the `<script id="registry">` block at the bottom of `browser/index.html`; point it at your own catalog CIDs, or just paste a CID into "Add catalog".

### Seeding a catalog from the command line

```bash
# needs a running IPFS (kubo) node
node tools/make_catalog.mjs ./my-folder "My Catalog" ./meta.json
```

### Rebuilding the hash bundle

```bash
cd tools/hash-bundle
npm install
npm run build   # writes catalog/hash.bundle.js
```

## License

MIT — see [LICENSE](LICENSE).
