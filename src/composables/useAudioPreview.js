/**
 * @file useAudioPreview.js
 * @description Composable para gestionar las pre-escuchas de audio de Deezer.
 * Encapsula la lógica del objeto nativo Audio y asegura que la reproducción 
 * se detenga al navegar fuera de la vista.
 */

import { ref, onBeforeUnmount } from 'vue'

/**
 * Hook para controlar la reproducción de clips de audio de 30 segundos.
 * @returns {Object} Estado del track actual y método para alternar la reproducción.
 */
export function useAudioPreview() {

  /** ID del track que suena actualmente. Sirve para marcar la UI como "playing" */
  const currentPreview = ref(null)

  /** * Instancia nativa del reproductor. 
   * Se mantiene fuera del estado reactivo para evitar overhead innecesario. 
   */
  let audioPlayer = null

  /**
   * Controla el flujo de reproducción: Play, Pausa o Cambio de pista.
   * @param {object} track - Objeto de la canción con ID y URL del clip (.preview)
   */
  function togglePreview(track) {
    // Si el usuario pincha en la que ya suena, simplemente pausamos
    if (currentPreview.value === track.id) {
      audioPlayer?.pause()
      currentPreview.value = null
      return
    }

    // Si hay algo sonando (aunque sea otra pista), lo matamos antes de empezar lo nuevo
    if (audioPlayer) {
      audioPlayer.pause()
    }

    // Inicializamos el audio con un volumen moderado
    audioPlayer = new Audio(track.preview)
    audioPlayer.volume = 0.5
    audioPlayer.play()
    currentPreview.value = track.id

    /** Cuando el clip termina de forma natural, reseteamos el estado visual */
    audioPlayer.onended = () => {
      currentPreview.value = null
    }
  }

  /** * Limpieza de seguridad. 
   * Evita el efecto "fantasma" donde la música sigue sonando tras cerrar la vista.
   */
  onBeforeUnmount(() => {
    audioPlayer?.pause()
    audioPlayer = null
  })

  return { 
    currentPreview, 
    togglePreview 
  }
}