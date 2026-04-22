/**
 * @file ui.js
 * @description Store de UI global. Por ahora sólo guarda el estado del
 * snackbar, pero aquí iré metiendo todo lo transversal (modales globales,
 * loaders de pantalla completa) según lo vaya necesitando la app.
 */

import { defineStore } from 'pinia'

/**
 * Timeout por defecto del snackbar, en milisegundos.
 * 3,5s me parece el punto dulce: suficiente para leer un mensaje corto
 * y no tan largo como para molestar si encadenas varias acciones.
 */
const DEFAULT_TIMEOUT_MS = 3500

export const useUIStore = defineStore('ui', {
  /**
   * @property {Object} snackbar - Configuración del mensaje flotante global.
   * @property {boolean} snackbar.show - Visible o no.
   * @property {string} snackbar.text - Texto que lee el usuario.
   * @property {'success'|'error'|'info'|'warning'} snackbar.type - Tono del mensaje (color + icono).
   * @property {number} snackbar.timeout - Cuánto aguanta en pantalla (ms).
   */
  state: () => ({
    snackbar: {
      show: false,
      text: '',
      type: 'success',
      timeout: DEFAULT_TIMEOUT_MS
    }
  }),

  actions: {
    /**
     * Dispara una notificación flotante desde cualquier parte de la app.
     * @param {string} text - Mensaje a mostrar.
     * @param {'success'|'error'|'info'|'warning'} [type='success'] - Tono.
     * @param {number} [timeout=3500] - Tiempo visible en ms.
     */
    notify(text, type = 'success', timeout = DEFAULT_TIMEOUT_MS) {
      this.snackbar.text = text
      this.snackbar.type = type
      this.snackbar.timeout = timeout
      this.snackbar.show = true
    },

    /**
     * Cierra el snackbar a mano. Lo uso desde el botón "X" del propio
     * componente y me sirve como limpieza rápida entre mensajes.
     */
    dismiss() {
      this.snackbar.show = false
    }
  }
})
