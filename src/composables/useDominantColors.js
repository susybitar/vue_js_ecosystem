/**
 * @file useDominantColors.js
 * @description Saca los colores dominantes de una carátula para pintar
 * gradientes y fondos que peguen con la portada. Es la salsa del efecto
 * "página de álbum" cuando abres un disco y el fondo se tiñe con su color.
 */

export function useDominantColors() {

  /**
   * Paleta de seguridad para cuando la extracción falla (CORS, imagen rota,
   * carátula muy apagada, etc.). Mantengo la onda azul de la app para que
   * el fallback no rompa la estética general.
   */
  const FALLBACK = ['rgb(18, 101, 255)', 'rgb(10, 39, 92)', 'rgb(5, 5, 5)']

  /**
   * Carga una imagen remota sin manchar el canvas (tainted). Necesito
   * `crossOrigin = 'anonymous'` para poder leer los píxeles después.
   * @param {string} url
   * @returns {Promise<HTMLImageElement>}
   */
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * Paso a HSL para poder descartar grises y píxeles demasiado oscuros o
   * claros antes de promediar; en RGB es mucho más engorroso detectarlos.
   * @param {number} r - 0-255
   * @param {number} g - 0-255
   * @param {number} b - 0-255
   * @returns {[number, number, number]} [hue 0-360, saturación 0-1, luminosidad 0-1].
   */
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    let h = 0, s = 0

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break
        case g: h = ((b - r) / d + 2); break
        case b: h = ((r - g) / d + 4); break
      }
      h *= 60
    }
    return [h, s, l]
  }

  /**
   * Devuelve los `count` colores más representativos de la imagen. Reescalo
   * a 64×64 antes de leer: con miles de píxeles la UI se nota, y a esta
   * resolución el resultado es prácticamente idéntico y va instantáneo.
   * @param {string} url
   * @param {number} [count=3]
   * @returns {Promise<string[]>} Strings `rgb(...)` listos para CSS.
   */
  async function extractColors(url, count = 3) {
    if (!url) return FALLBACK

    try {
      const img = await loadImage(url)
      const size = 64
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const { data } = ctx.getImageData(0, 0, size, size)

      /**
       * 12 buckets de 30º sobre el matiz. Así evito que "los 3 dominantes"
       * salgan siendo tres rojos casi idénticos y me aseguro variedad.
       */
      const buckets = Array.from({ length: 12 }, () => ({ r: 0, g: 0, b: 0, n: 0 }))

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const [h, s, l] = rgbToHsl(r, g, b)

        // Fuera píxeles apagados, quemados o grises: no aportan al gradiente.
        if (l < 0.15 || l > 0.85 || s < 0.25) continue

        const idx = Math.floor(h / 30) % 12
        buckets[idx].r += r
        buckets[idx].g += g
        buckets[idx].b += b
        buckets[idx].n += 1
      }

      // Me quedo con los buckets más densos y promedio sus píxeles.
      const top = buckets
        .filter((b) => b.n > 0)
        .sort((a, b) => b.n - a.n)
        .slice(0, count)
        .map((b) => `rgb(${Math.round(b.r / b.n)}, ${Math.round(b.g / b.n)}, ${Math.round(b.b / b.n)})`)

      // Si la portada tiene muy poco color, relleno con el fallback.
      while (top.length < count) {
        top.push(FALLBACK[top.length] || FALLBACK[0])
      }

      return top
    } catch (error) {
      return FALLBACK
    }
  }

  return { extractColors }
}
