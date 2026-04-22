/**
 * @file auth.js
 * @description Store de autenticación. Como no hay backend, uso localStorage
 * como base de datos y el propio store mantiene la sesión activa. Las
 * contraseñas nunca van en claro: guardo SHA-256(salt + password) con salt
 * por usuario (ver usePasswordHash.js). Si aparece un registro antiguo en
 * claro, lo migro al hash la primera vez que ese usuario entra bien.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePasswordHash } from '../composables/usePasswordHash'

export const useAuthStore = defineStore('auth', () => {
  const { generateSalt, hashPassword, verifyPassword } = usePasswordHash()

  /** Lista completa de usuarios registrados (rehidrato desde localStorage al arrancar). */
  const users = ref(JSON.parse(localStorage.getItem('ms_users')) || [])

  /** Usuario con sesión iniciada, o `null` si nadie está logueado. */
  const currentUser = ref(JSON.parse(localStorage.getItem('ms_session')) || null)

  /** Flag para pintar loaders en los botones de login/registro. */
  const loading = ref(false)

  /** Atajo reactivo: true si hay alguien dentro. */
  const isLoggedIn = computed(() => currentUser.value !== null)

  /** Persiste usuarios + sesión a localStorage en el mismo momento. */
  const saveToStorage = () => {
    localStorage.setItem('ms_users', JSON.stringify(users.value))
    localStorage.setItem('ms_session', JSON.stringify(currentUser.value))
  }

  /**
   * Migración transparente: cuando un usuario legacy acierta su password en
   * claro, rehasheo antes de devolver el login para que la próxima vez entre
   * por el camino normal.
   * @param {number} userId - ID del usuario a migrar.
   * @param {string} plainText - Contraseña correcta ya verificada en claro.
   */
  async function migrateLegacyPassword(userId, plainText) {
    const idx = users.value.findIndex(u => u.id === userId)
    if (idx === -1) return

    const salt = generateSalt()
    const passwordHash = await hashPassword(plainText, salt)

    // Quito el campo `password` para no dejar el texto plano en storage.
    const { password, ...rest } = users.value[idx]
    users.value[idx] = { ...rest, passwordSalt: salt, passwordHash }
    saveToStorage()
  }

  /**
   * Crea una cuenta nueva a partir de los datos del formulario de registro.
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.password
   * @returns {Promise<boolean>} true si terminó sin errores.
   */
  async function register(userData) {
    loading.value = true
    try {
      const salt = generateSalt()
      const passwordHash = await hashPassword(userData.password, salt)

      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        passwordSalt: salt,
        passwordHash,
        createdAt: new Date().toISOString()
      }
      users.value.push(newUser)
      saveToStorage()
      return true
    } finally {
      loading.value = false
    }
  }

  /**
   * Valida credenciales y arranca la sesión si coinciden. Acepta el camino
   * normal (hash + salt) y el legacy (texto plano), migrando al vuelo si
   * el usuario entra por la vía antigua.
   * @param {string} email
   * @param {string} password - En claro, tal y como lo escribió el usuario.
   * @returns {Promise<boolean>} true si el login fue correcto.
   */
  async function login(email, password) {
    loading.value = true
    try {
      // Delay artificial para que el spinner del botón se note.
      await new Promise(resolve => setTimeout(resolve, 800))
      const cleanEmail = email.toLowerCase().trim()
      const user = users.value.find(u => u.email === cleanEmail)
      if (!user) return false

      let isValid = false

      if (user.passwordHash && user.passwordSalt) {
        isValid = await verifyPassword(password, user.passwordSalt, user.passwordHash)
      } else if (user.password !== undefined) {
        // Camino legacy: comparo en claro y migro al hash si coincide.
        isValid = user.password === password
        if (isValid) {
          await migrateLegacyPassword(user.id, password)
        }
      }

      if (!isValid) return false

      // Releo al usuario por si lo acabo de migrar.
      const freshUser = users.value.find(u => u.id === user.id) || user
      currentUser.value = { ...freshUser }
      saveToStorage()
      return true
    } finally {
      loading.value = false
    }
  }

  /** Cierra la sesión activa y limpia el storage de sesión. */
  function logout() {
    currentUser.value = null
    localStorage.removeItem('ms_session')
  }

  /**
   * Reemplaza la contraseña de un usuario (usado desde "He olvidado mi
   * contraseña"). Cada cambio genera un salt nuevo para que el hash no
   * sea comparable con el anterior.
   * @param {string} email
   * @param {string} newPassword
   * @returns {Promise<boolean>} true si el usuario existía y se actualizó.
   */
  async function updatePassword(email, newPassword) {
    const cleanEmail = email.toLowerCase().trim()
    const userIndex = users.value.findIndex(u => u.email === cleanEmail)
    if (userIndex === -1) return false

    const salt = generateSalt()
    const passwordHash = await hashPassword(newPassword, salt)

    const { password, ...rest } = users.value[userIndex]
    users.value[userIndex] = { ...rest, passwordSalt: salt, passwordHash }
    saveToStorage()
    return true
  }

  /**
   * Actualiza campos del perfil del usuario en sesión (nombre, email y/o
   * avatar). Si cambia el email, compruebo que no choque con otra cuenta
   * antes de aplicar nada.
   * @param {Object} data - Campos a pisar. Los que no lleguen se respetan.
   * @param {string} [data.name]
   * @param {string} [data.email]
   * @param {string} [data.avatarSeed] - Semilla del avatar elegido.
   * @returns {{ok: boolean, reason?: 'no-session'|'email-taken'}}
   */
  function updateProfile(data) {
    if (!currentUser.value) return { ok: false, reason: 'no-session' }

    const cleanEmail = data.email?.toLowerCase().trim()

    if (cleanEmail && cleanEmail !== currentUser.value.email) {
      const taken = users.value.some(
        u => u.email === cleanEmail && u.id !== currentUser.value.id
      )
      if (taken) return { ok: false, reason: 'email-taken' }
    }

    const userIndex = users.value.findIndex(u => u.id === currentUser.value.id)
    if (userIndex === -1) return { ok: false, reason: 'no-session' }

    // Parcheo sólo los campos que llegan; los que no, se mantienen tal cual.
    const updated = {
      ...users.value[userIndex],
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(cleanEmail && { email: cleanEmail }),
      ...(data.avatarSeed !== undefined && { avatarSeed: data.avatarSeed })
    }

    users.value[userIndex] = updated
    currentUser.value = { ...updated }
    saveToStorage()
    return { ok: true }
  }

  return {
    users,
    currentUser,
    isLoggedIn,
    loading,
    register,
    login,
    logout,
    updatePassword,
    updateProfile
  }
})
