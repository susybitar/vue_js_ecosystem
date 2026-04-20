/**
 * @file ui.js (Store)
 * @description Gestión del estado de la interfaz de usuario.
 * Centraliza elementos globales como notificaciones (Snackbars) para que puedan
 * ser disparados desde cualquier parte de la aplicación (vistas, otros stores o componentes).
 */

import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  /**
   * Estado global de la interfaz.
   * @property {Object} snackbar - Configuración del componente de alerta.
   * @property {boolean} snackbar.show - Controla la visibilidad del mensaje.
   * @property {string} snackbar.text - Contenido del mensaje a mostrar.
   * @property {string} snackbar.color - Color de fondo (basado en el tipo de alerta).
   */
  state: () => ({
    snackbar: {
      show: false,
      text: '',
      color: 'success'
    }
  }),

  actions: {
    /**
     * Dispara una notificación visual en pantalla.
     * @param {string} text - El mensaje que leerá el usuario.
     * @param {'success'|'error'} [type='success'] - Determina el color de la alerta.
     */
    notify(text, type = 'success') {
      this.snackbar.text = text
      
      // Mapeo de colores: Rojo vibrante para errores, Verde Spotify/Deezer para éxitos.
      this.snackbar.color = type === 'error' ? '#FF3B3B' : '#1DB954'
      
      // Activamos el flag para que el componente v-snackbar de Vuetify reaccione.
      this.snackbar.show = true
    }
  }
})