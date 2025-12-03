/**
 * AES-256-GCM message encryption/decryption using Web Crypto
 * Used for end-to-end encrypted chat messages.
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

/**
 * Encrypt a chat message with AES-256-GCM using an existing CryptoKey (K_enc)
<<<<<<< HEAD
=======
 * Includes nonce for replay attack protection
>>>>>>> 44486ae (Full Deployment)
 * @param {CryptoKey} aesKey
 * @param {string} sessionId
 * @param {string} from
 * @param {string} to
 * @param {number} msgSeq
 * @param {string} content
 */
export const encryptMessage = async (aesKey, sessionId, from, to, msgSeq, content) => {
  const timestamp = Date.now();
<<<<<<< HEAD

=======
  
  // Generate unique nonce for replay protection (128-bit)
  const nonceBytes = randomBytes(16);
  const nonce = toBase64(nonceBytes);

  // Nonce is NOT encrypted (sent in metadata) so it can be used in AAD during decryption
  // Content is encrypted, but nonce is in metadata for replay protection
>>>>>>> 44486ae (Full Deployment)
  const plaintextObj = {
    sessionId,
    from,
    to,
    msgSeq,
    timestamp,
    content
  };

  const plaintextBytes = enc.encode(JSON.stringify(plaintextObj));

<<<<<<< HEAD
  const iv = randomBytes(12); // 96-bit IV
  const aad = enc.encode(`${sessionId}|${from}|${to}|${msgSeq}`);
=======
  const iv = randomBytes(12); // 96-bit IV for AES-GCM
  // Include nonce in AAD for additional integrity (nonce is in metadata, not encrypted)
  const aad = enc.encode(`${sessionId}|${from}|${to}|${msgSeq}|${nonce}`);
>>>>>>> 44486ae (Full Deployment)

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: aad
    },
    aesKey,
    plaintextBytes
  );

  return {
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
<<<<<<< HEAD
=======
    nonce,
>>>>>>> 44486ae (Full Deployment)
    timestamp,
    msgSeq
  };
};

/**
 * Decrypt an encrypted message using AES-256-GCM and return plaintext content
 * @param {CryptoKey} aesKey
<<<<<<< HEAD
 * @param {Object} message - { from, to, sessionId, ciphertext, iv, msgSeq, timestamp }
 */
export const decryptMessage = async (aesKey, message) => {
  const { from, to, sessionId, ciphertext, iv, msgSeq, timestamp } = message;

  const ivBytes = fromBase64(iv);
  const cipherBytes = fromBase64(ciphertext);
  const aad = enc.encode(`${sessionId}|${from}|${to}|${msgSeq}`);
=======
 * @param {Object} message - { from, to, sessionId, ciphertext, iv, msgSeq, timestamp, nonce }
 */
export const decryptMessage = async (aesKey, message) => {
  const { from, to, sessionId, ciphertext, iv, msgSeq, timestamp, nonce } = message;

  const ivBytes = fromBase64(iv);
  const cipherBytes = fromBase64(ciphertext);
  
  // AAD must match encryption (includes nonce)
  const messageNonce = nonce || ''; // Use provided nonce or empty string
  const aad = enc.encode(`${sessionId}|${from}|${to}|${msgSeq}|${messageNonce}`);
>>>>>>> 44486ae (Full Deployment)

  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      additionalData: aad
    },
    aesKey,
    cipherBytes
  );

  const obj = JSON.parse(dec.decode(plaintext));

<<<<<<< HEAD
=======
  // Nonce comes from message metadata (not from decrypted plaintext)
  // This allows us to use it in AAD before decryption
>>>>>>> 44486ae (Full Deployment)
  return {
    from,
    to,
    sessionId,
    msgSeq,
<<<<<<< HEAD
=======
    nonce: messageNonce, // Nonce from metadata
>>>>>>> 44486ae (Full Deployment)
    timestamp: obj.timestamp || timestamp,
    content: obj.content
  };
};


