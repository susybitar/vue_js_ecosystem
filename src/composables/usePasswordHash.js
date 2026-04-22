/**
 * @file usePasswordHash.js
 * @description Ofuscación de contraseñas antes de guardarlas en localStorage.
 * Uso la Web Crypto API del propio navegador (SHA-256 + salt por usuario)
 * así no tiro de ninguna librería externa.
 *
 * OJO — esto no es seguridad "de verdad": como todo se ejecuta en cliente
 * (localStorage + JS visible en DevTools), cualquiera con acceso al
 * dispositivo puede leer el hash y reproducir el algoritmo. El único
 * objetivo es que la contraseña no aparezca en claro al abrir localStorage
 * durante una demo o entrevista. En producción esto se haría en servidor
 * con un KDF decente (bcrypt, scrypt, argon2).
 */

/** Tamaño del salt aleatorio, en bytes. 16 bytes = 128 bits, suficiente aquí. */
const SALT_BYTES = 16

/**
 * @returns {{
 *   generateSalt: () => string,
 *   hashPassword: (plainText: string, salt: string) => Promise<string>,
 *   verifyPassword: (plainText: string, salt: string, expectedHash: string) => Promise<boolean>
 * }}
 */
export function usePasswordHash() {
  /**
   * Bytes → string hexadecimal.
   * @param {Uint8Array|Array<number>} bytes
   * @returns {string}
   */
  function bytesToHex(bytes) {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Salt aleatorio (16 bytes) en hex, apoyándome en `crypto.getRandomValues`
   * para que sea realmente aleatorio y no un `Math.random`.
   * @returns {string}
   */
  function generateSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
    return bytesToHex(bytes)
  }

  /**
   * Devuelve SHA-256(salt + plainText) en hex. Concateno el salt al
   * principio para que dos contraseñas iguales de dos usuarios distintos
   * acaben produciendo hashes diferentes.
   * @param {string} plainText
   * @param {string} salt
   * @returns {Promise<string>}
   */
  async function hashPassword(plainText, salt) {
    const encoder = new TextEncoder()
    const data = encoder.encode(salt + plainText)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return bytesToHex(new Uint8Array(digest))
  }

  /**
   * Compara una contraseña en claro contra el hash guardado.
   * @param {string} plainText
   * @param {string} salt - El mismo salt con el que se generó el hash.
   * @param {string} expectedHash
   * @returns {Promise<boolean>}
   */
  async function verifyPassword(plainText, salt, expectedHash) {
    const actual = await hashPassword(plainText, salt)
    return actual === expectedHash
  }

  return { generateSalt, hashPassword, verifyPassword }
}
