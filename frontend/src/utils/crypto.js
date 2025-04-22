
// A modular crypto utility for RSA key generation, import/export, and message encryption/decryption
const backendUrl = import.meta.env.VITE_BACKEND_URL;
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return btoa(binary);
  }
  
 
  function pemToArrayBuffer(pem) {
    // Remove header/footer and line breaks
    const b64 = pem.replace(/-----.*?-----/g, '').replace(/\s/g, '');
    const binary = atob(b64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  }

  export async function generateKeyPair() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256',
      },
      true,               // extractable keys
      ['encrypt', 'decrypt']
    );
  }
  
 
  export async function exportKeys(keyPair) {
    // Export SPKI for public key
    const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    // Export PKCS8 for private key
    const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  
    // Wrap in PEM headers
    const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(publicKeyBuffer)}\n-----END PUBLIC KEY-----`;
    const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(privateKeyBuffer)}\n-----END PRIVATE KEY-----`;
  
    return { publicKeyPEM, privateKeyPEM };
  }

  export async function importPublicKey(publicKeyPEM) {
    const binaryDer = pemToArrayBuffer(publicKeyPEM);
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
  }
  
 
  export async function importPrivateKey(privateKeyPEM) {
    const binaryDer = pemToArrayBuffer(privateKeyPEM);
    return await window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt']
    );
  }

  export async function encryptMessage(publicKeyPEM, message) {
    const publicKey = await importPublicKey(publicKeyPEM);
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );
    return arrayBufferToBase64(encrypted);
  }
  
  
  export async function decryptMessage(privateKeyPEM, ciphertextB64) {
    const privateKey = await importPrivateKey(privateKeyPEM);
    const binary = atob(ciphertextB64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      buffer
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
  
  
  export function savePrivateKey(privateKeyPEM) {
    // TODO: Replace with secure storage (e.g., IndexedDB + encryption)
    localStorage.setItem('soulSync_privateKey', privateKeyPEM);
  }
  
  
  export function loadPrivateKey() {
    return localStorage.getItem('soulSync_privateKey');
  }
  
  export async function sendPublicKeyToBackend(userId, publicKeyPEM) {
    return await fetch(`${backendUrl}/savePublicKey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, publicKey: publicKeyPEM }),
    });
  }