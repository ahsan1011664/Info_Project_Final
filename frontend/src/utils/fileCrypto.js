/**
 * AES-256-GCM file encryption/decryption with chunking
 * Files are split into chunks (recommended: 1MB per chunk) and each chunk is encrypted separately
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

const toBase64 = (bytes) => {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
};

const fromBase64 = (b64) => {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
};

const randomBytes = (len) => {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
};

// Chunk size: 1MB (recommended for efficient upload/download)
const CHUNK_SIZE = 1024 * 1024; // 1MB

/**
 * Encrypt a file by splitting it into chunks and encrypting each chunk with AES-256-GCM
 * @param {CryptoKey} aesKey - Session AES key from key exchange
 * @param {File} file - File object from input
 * @param {string} sessionId - Session ID
 * @param {string} from - Sender username
 * @param {string} to - Receiver username
 * @returns {Promise<{fileId: string, chunks: Array, metadata: Object}>}
 */
export const encryptFile = async (aesKey, file, sessionId, from, to) => {
  const fileId = toBase64(randomBytes(16)); // 128-bit unique file ID
  const fileArrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileArrayBuffer);
  const totalSize = fileBytes.length;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

  const chunks = [];

  // Encrypt each chunk
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunkBytes = fileBytes.slice(start, end);

    // Generate fresh IV for each chunk
    const iv = randomBytes(12); // 96-bit IV for AES-GCM

    // AAD includes fileId, chunkIndex, sessionId for integrity
    const aad = enc.encode(`${fileId}|${i}|${sessionId}|${from}|${to}`);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: aad
      },
      aesKey,
      chunkBytes
    );

    chunks.push({
      chunkIndex: i,
      ciphertext: toBase64(ciphertext),
      iv: toBase64(iv)
    });
  }

  const metadata = {
    fileId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: totalSize,
    totalChunks,
    sessionId,
    from,
    to,
    timestamp: Date.now()
  };

  return {
    fileId,
    chunks,
    metadata
  };
};

/**
 * Decrypt file chunks and reconstruct the original file
 * @param {CryptoKey} aesKey - Session AES key
 * @param {Array} chunks - Array of encrypted chunks with {chunkIndex, ciphertext, iv}
 * @param {Object} metadata - File metadata {fileId, sessionId, from, to}
 * @returns {Promise<Blob>} - Decrypted file as Blob
 */
export const decryptFile = async (aesKey, chunks, metadata) => {
  const { fileId, sessionId, from, to } = metadata;

  // Sort chunks by chunkIndex to ensure correct order
  const sortedChunks = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);

  const decryptedChunks = [];

  for (const chunk of sortedChunks) {
    const ivBytes = fromBase64(chunk.iv);
    const cipherBytes = fromBase64(chunk.ciphertext);

    // AAD must match encryption
    const aad = enc.encode(`${fileId}|${chunk.chunkIndex}|${sessionId}|${from}|${to}`);

    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        additionalData: aad
      },
      aesKey,
      cipherBytes
    );

    decryptedChunks.push(new Uint8Array(plaintext));
  }

  // Combine all chunks into a single Uint8Array
  const totalLength = decryptedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of decryptedChunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  // Create Blob from decrypted bytes
  return new Blob([combined], { type: metadata.fileType });
};

/**
 * Helper to trigger file download in browser
 * @param {Blob} blob - File blob
 * @param {string} fileName - Original file name
 */
export const downloadFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

