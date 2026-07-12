import Hash from 'ipfs-only-hash';
// Match the Lumen browser's IPFS "add" exactly: CIDv1 + raw-leaves (same as `ipfs add --cid-version=1`),
// so the CID this builder shows equals the CID a file gets when uploaded to the Lumen Drive.
window.ipfsHash = (bytes) => Hash.of(new Uint8Array(bytes), { cidVersion: 1, rawLeaves: true });
