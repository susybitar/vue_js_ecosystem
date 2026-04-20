/**
 * @file auth.js (Store)
 * @description Gestión de la autenticación y persistencia de usuarios.
 * Utiliza localStorage como base de datos temporal para simular un backend
 * y mantiene el estado de la sesión activa en toda la app.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  /** Lista completa de usuarios registrados. Se recupera de LocalStorage al arrancar. */
  const users = ref(JSON.parse(localStorage.getItem('ms_users')) || [])
  
  /** Datos del usuario que ha iniciado sesión actualmente. */
  const currentUser = ref(JSON.parse(localStorage.getItem('ms_session')) || null)
  
  /** Estado de carga para mostrar feedback visual en botones y formularios. */
  const loading = ref(false)

  /** Flag booleano derivado para saber de un vistazo si hay alguien logueado. */
  const isLoggedIn = computed(() => currentUser.value !== null)

  /**
   * Sincroniza el estado del store con el almacenamiento del navegador.
   */
  const saveToStorage = () => {
    localStorage.setItem('ms_users', JSON.stringify(users.value))
    localStorage.setItem('ms_session', JSON.stringify(currentUser.value))
  }

  /**
   * Crea un nuevo perfil de usuario.
   * Limpia el email y genera un ID único basado en el timestamp actual.
   * @param {Object} userData - Datos provenientes del formulario de registro.
   * @returns {boolean} Confirmación de que el proceso terminó.
   */
  function register(userData) {
    loading.value = true
    try {
      const newUser = {
        ...userData,
        id: Date.now(),
        email: userData.email.toLowerCase().trim(),
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
   * Valida credenciales y arranca la sesión si coinciden.
   * Incluye un retardo artificial para simular latencia de red y mejorar la UX del loader.
   * @param {string} email - Correo del usuario.
   * @param {string} password - Contraseña sin cifrar (simulación).
   * @returns {Promise<boolean>} Éxito o fallo de la operación.
   */
  async function login(email, password) {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const cleanEmail = email.toLowerCase().trim()
      const user = users.value.find(u => u.email === cleanEmail && u.password === password)
      
      if (user) {
        currentUser.value = { ...user }
        saveToStorage()
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Mata la sesión activa.
   * Limpia el estado reactivo y borra el token/session de LocalStorage.
   */
  function logout() {
    currentUser.value = null
    localStorage.removeItem('ms_session')
  }

  /**
   * Localiza un usuario por email y actualiza su credencial de acceso.
   * @param {string} email - Email del usuario a modificar.
   * @param {string} newPassword - Nueva contraseña a persistir.
   */
  function updatePassword(email, newPassword) {
    const userIndex = users.value.findIndex(u => u.email === email.toLowerCase().trim())
    if (userIndex !== -1) {
      users.value[userIndex].password = newPassword
      saveToStorage()
    }
  }

  return {
    users,
    currentUser,
    isLoggedIn,
    loading,
    register,
    login,
    logout,
    updatePassword
  }
})