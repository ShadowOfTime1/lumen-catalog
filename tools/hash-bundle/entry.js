import Hash from 'ipfs-only-hash';
window.ipfsHash = (bytes) => Hash.of(new Uint8Array(bytes));
