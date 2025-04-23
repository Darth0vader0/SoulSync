// A modular crypto utility for RSA key generation, import/export, and message encryption/decryption
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
}

// Convert PEM string to ArrayBuffer
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----.*?-----/g, '').replace(/\s/g, '');
  const binary = atob(b64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

// Helper — chunk a string into fixed-size lines (default 64)
function chunkString(str, size = 64) {
  return str.match(new RegExp(`.{1,${size}}`, 'g')).join('\n');
}


export async function decryptWithKey(privateKey, ciphertextB64) {
  console.log('[decryptWithKey] privateKey:', privateKey);
  
  const binary = atob(ciphertextB64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      buffer
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error('[decryptWithKey] failed:', err);
    throw err;
  }
}

// Generate an RSA-OAEP key pair
export async function generateKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true,               // extractable keys for export
    ['encrypt', 'decrypt']
  );
}

// Export keys to PEM format
export async function exportKeys(keyPair) {
  const publicKeyBuffer  = await window.crypto.subtle.exportKey('spki',  keyPair.publicKey);
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicB64  = chunkString(arrayBufferToBase64(publicKeyBuffer));
  const privateB64 = chunkString(arrayBufferToBase64(privateKeyBuffer));

  const publicKeyPEM  = `-----BEGIN PUBLIC KEY-----\n${publicB64}\n-----END PUBLIC KEY-----`;
  const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${privateB64}\n-----END PRIVATE KEY-----`;

  return { publicKeyPEM, privateKeyPEM };
}

// Import public key from PEM
export async function importPublicKey(publicKeyPEM) {
  try {
    const binaryDer = pemToArrayBuffer(publicKeyPEM);
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
  } catch (err) {
    console.error('Failed to import public key:', err);
    throw err;
  }
}

// Import private key from PEM
export async function importPrivateKey(privateKeyPEM) {
  try {
    const binaryDer = pemToArrayBuffer(privateKeyPEM);
    return await window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt']
    );
  } catch (err) {
    console.error('Failed to import private key:', err);
    throw err;
  }
}

// Encrypt a text message with a public key PEM
export async function encryptMessage(publicKeyPEM, message) {
  const publicKey = await importPublicKey(publicKeyPEM);
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  try {
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );
    return arrayBufferToBase64(encrypted);
  } catch (err) {
    console.error('Encryption error:', err);
    throw err;
  }
}

// Decrypt a base64 ciphertext with a private key PEM
export async function decryptMessage(privateKeyPEM, ciphertextB64) {
  const privateKey = await importPrivateKey(privateKeyPEM);
  const binary = atob(ciphertextB64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      buffer
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    throw err;
  }
}

// Save private key in localStorage (consider securing this)
export function savePrivateKey(privateKeyPEM) {
  localStorage.setItem('soulSync_privateKey', privateKeyPEM);
}

// Load private key PEM from localStorage
export function loadPrivateKey() {
  return localStorage.getItem('soulSync_privateKey');
}

// Send public key PEM to backend
export async function sendPublicKeyToBackend(userId, publicKeyPEM) {
  const response = await fetch(`${backendUrl}/savePublicKey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, publicKey: publicKeyPEM }),
  });
  if (!response.ok) {
    throw new Error(`Failed to save public key: ${response.status}`);
  }
  return response.json();
}


/**
 work flow: 
  1. Generate RSA key pair client-side
  2. Export keys to PEM format
  3. Register user and get their userId
  4. Send public key to backend for storage
  5. Save private key locally for decrypting messages
  6. Use the public key to encrypt messages before sending them to the backend
  7. Use the private key to decrypt messages received from the backend


  now process of encrypting :
  user will select a friend from the list of friends , then 
  get the public key of that friend from the backend 
  send the message ,
  that message will convert to binary 
  then encrypted using the public key of that friend
  then send the encrypted message to the backend
  the backend will save the message in the database
  then send the message to the friend using socket io
  the friend will get the message and then
  that message will convert to binary
  then decrypt using the private key of that friend
  decrypted message will convert to base64 again 
  and show it to the chat window
  */