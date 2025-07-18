'use client';

// A simple XOR-based encryption. This is for obfuscation, not strong security.
// The key is embedded in the client-side code, so it's not truly secret.
const SECRET_KEY = 'your-super-secret-key-that-is-not-so-secret';

function cypher(str: string, key: string): string {
  return str.split('').map((char, i) => {
    const charCode = char.charCodeAt(0) ^ key.charCodeAt(i % key.length);
    return String.fromCharCode(charCode);
  }).join('');
}

export function encrypt(text: string): string {
  const encrypted = cypher(text, SECRET_KEY);
  // Using btoa to make sure the output is a valid string for localStorage
  return btoa(encrypted);
}

export function decrypt(ciphertext: string): string {
  // Using atob to decode from base64
  const decoded = atob(ciphertext);
  return cypher(decoded, SECRET_KEY);
}
