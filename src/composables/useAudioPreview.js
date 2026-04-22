/**
 * @file useAudioPreview.js
 * @description Reproductor de previews (clips de 30s) de Deezer. Uso el
 * `Audio` nativo directamente porque no necesito nada más sofisticado y
 * así me ahorro una dependencia tipo Howler.
 */

import { ref, onBeforeUnmount } from 'vue'

/**
 * @returns {{
 *   currentPreview: import('vue').Ref<number|null>,
 *   togglePreview: (track: {id: number, preview: string}) => void
 * }}
 */
export function useAudioPreview() {

  /** ID del track que suena ahora mismo; lo uso para marcar el botón activo en la UI. */
  const currentPreview = ref(null)

  /**
   * Instancia del reproductor. La dejo fuera del `ref` para no obligar a
   * Vue a observarla (no me interesan los cambios internos del Audio).
   * @type {HTMLAudioElement|null}
   */
  let audioPlayer = null

  /**
   * Play / pause / cambio de pista, todo en el mismo handler.
   * Comportamiento:
   *  - Click en la que ya suena → pausa.
   *  - Click en otra distinta → corta la anterior y empieza la nueva.
   * @param {{id: number, preview: string}} track
   */
  function togglePreview(track) {
    if (currentPreview.value === track.id) {
      audioPlayer?.pause()
      currentPreview.value = null
      return
    }

    if (audioPlayer) {
      audioPlayer.pause()
    }

    audioPlayer = new Audio(track.preview)
    // 50% me parece un volumen razonable para no asustar al usuario.
    audioPlayer.volume = 0.5
    audioPlayer.play()
    currentPreview.value = track.id

    // Cuando termina el clip de forma natural, devuelvo el botón a reposo.
    audioPlayer.onended = () => {
      currentPreview.value = null
    }
  }

  // Importante: si no limpio aquí, el clip sigue sonando después de
  // cambiar de vista (pasé por esto, de ahí el comentario).
  onBeforeUnmount(() => {
    audioPlayer?.pause()
    audioPlayer = null
  })

  return {
    currentPreview,
    togglePreview
  }
}
