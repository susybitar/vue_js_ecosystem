/**
 * @file useDominantColors.js
 * @description Extractor de colores dominantes desde una imagen remota.
 * Analiza los píxeles de una carátula para generar una paleta dinámica que alimenta
 * los efectos atmosféricos y gradientes de la interfaz.
 */

export function useDominantColors() {

  /** * Paleta por defecto para casos de error (CORS, imágenes rotas, etc.).
   * Mantiene la estética azul y oscura del proyecto (Pitch Black).
   */
  const FALLBACK = ['rgb(18, 101, 255)', 'rgb(10, 39, 92)', 'rgb(5, 5, 5)']

  /**
   * Carga una imagen en memoria gestionando los permisos de CORS.
   * @param {string} url - URL de la imagen a cargar.
   * @returns {Promise<HTMLImageElement>} Promesa con el elemento de imagen cargado.
   */
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // Clave para permitir el acceso a los píxeles vía Canvas
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * Convierte valores RGB a espacio HSL (Hue, Saturation, Lightness).
   * Fundamental para filtrar píxeles que no aportan información de color (grises, muy oscuros o muy claros).
   * @param {number} r - Rojo (0-255).
   * @param {number} g - Verde (0-255).
   * @param {number} b - Azul (0-255).
   * @returns {number[]} Array con [matiz 0-360, saturación 0-1, luminosidad 0-1].
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
   * Analiza la imagen para extraer los colores que mejor la representan visualmente.
   * Dibuja la imagen en un canvas reducido para optimizar el rendimiento del escaneo.
   * @param {string} url - URL de la imagen.
   * @param {number} [count=3] - Cantidad de colores dominantes a extraer.
   * @returns {Promise<string[]>} Array de cadenas RGB listas para CSS.
   */
  async function extractColors(url, count = 3) {
    if (!url) return FALLBACK
    
    try {
      const img = await loadImage(url)
      const size = 64 // Escala reducida para procesar menos píxeles sin perder la esencia cromática
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const { data } = ctx.getImageData(0, 0, size, size)

      /** * Agrupamos por matiz (Hue) en 12 cubos (buckets) de 30º cada uno.
       * Esto evita obtener colores casi idénticos y asegura variedad.
       */
      const buckets = Array.from({ length: 12 }, () => ({ r: 0, g: 0, b: 0, n: 0 }))

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const [h, s, l] = rgbToHsl(r, g, b)
        
        // Descartamos píxeles que sean demasiado oscuros, claros o neutros (grises)
        if (l < 0.15 || l > 0.85 || s < 0.25) continue
        
        const idx = Math.floor(h / 30) % 12
        buckets[idx].r += r
        buckets[idx].g += g
        buckets[idx].b += b
        buckets[idx].n += 1
      }

      /** Seleccionamos los grupos con mayor densidad de píxeles y calculamos su promedio RGB */
      const top = buckets
        .filter((b) => b.n > 0)
        .sort((a, b) => b.n - a.n)
        .slice(0, count)
        .map((b) => `rgb(${Math.round(b.r / b.n)}, ${Math.round(b.g / b.n)}, ${Math.round(b.b / b.n)})`)

      // Rellenamos con la paleta de seguridad si no se encontraron suficientes colores válidos
      while (top.length < count) {
        top.push(FALLBACK[top.length] || FALLBACK[0])
      }

      return top
    } catch (error) {
      // Si el Canvas falla por restricciones de seguridad (Tainted Canvas), aplicamos fallback
      return FALLBACK
    }
  }

  return { extractColors }
}