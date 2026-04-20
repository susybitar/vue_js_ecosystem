/**
 * @file useDeezerApi.js
 * @description Punto único de comunicación con la API pública de Deezer.
 * Centraliza las llamadas para facilitar el mantenimiento y la reutilización de endpoints.
 */

import axios from 'axios'

/**
 * Diccionario en memoria para traducir 'genre_id' numérico al nombre real.
 * Definido a nivel de módulo para que funcione como un singleton compartido entre componentes.
 */
const genreMap = new Map()

/**
 * Hook para interactuar con la API de Deezer.
 * Usa el proxy '/api/deezer' configurado en Vite para evitar problemas de CORS.
 * * @returns {Object} Métodos para obtener tendencias, realizar búsquedas y resolver metadatos.
 */
export function useDeezerApi() {

  /**
   * Descarga el catálogo de géneros de Deezer y lo cachea en genreMap.
   * Es idempotente: si ya existen datos, evita realizar peticiones redundantes.
   * @returns {Promise<Map<number,string>>} Mapa de géneros poblado.
   */
  async function loadGenres() {
    if (genreMap.size > 0) return genreMap
    try {
      const res = await axios.get('/api/deezer/genre')
      const list = res.data.data || []
      list.forEach((g) => genreMap.set(g.id, g.name))
    } catch {
      // Si la carga falla, la app continúa operativa aunque sin etiquetas de género.
    }
    return genreMap
  }

  /**
   * Obtiene el ranking actual de álbumes más escuchados.
   * @param {number} [limit=10] - Cantidad máxima de resultados.
   * @returns {Promise<Array>} Lista de álbumes tendencia.
   */
  async function fetchTrendingAlbums(limit = 10) {
    try {
      const res = await axios.get('/api/deezer/chart/0/albums', { params: { limit } })
      return res.data.data || []
    } catch {
      return []
    }
  }

  /**
   * Obtiene el ranking actual de artistas más populares.
   * @param {number} [limit=10]
   * @returns {Promise<Array>} Lista de artistas tendencia.
   */
  async function fetchTrendingArtists(limit = 10) {
    try {
      const res = await axios.get('/api/deezer/chart/0/artists', { params: { limit } })
      return res.data.data || []
    } catch {
      return []
    }
  }

  /**
   * Obtiene el ranking actual de canciones (tracks).
   * @param {number} [limit=10]
   * @returns {Promise<Array>} Lista de canciones tendencia.
   */
  async function fetchTrendingTracks(limit = 10) {
    try {
      const res = await axios.get('/api/deezer/chart/0/tracks', { params: { limit } })
      return res.data.data || []
    } catch {
      return []
    }
  }

  /**
   * Realiza una búsqueda en Deezer según la categoría especificada.
   * @param {'artist'|'album'|'track'} type - Categoría de búsqueda.
   * @param {string} query - Término de búsqueda introducido por el usuario.
   * @returns {Promise<Array>} Resultados encontrados.
   */
  async function searchDeezer(type, query) {
    const res = await axios.get(`/api/deezer/search/${type}`, {
      params: { q: query.trim() }
    })
    return res.data.data || []
  }

  /**
   * Determina el género de un artista analizando sus álbumes.
   * Garantiza que el diccionario de géneros esté cargado antes de la resolución.
   * @param {number} artistId
   * @returns {Promise<string>} Nombre del género o 'Sin clasificar'.
   */
  async function resolveArtistGenre(artistId) {
    if (!artistId) return 'Sin clasificar'
    try {
      if (genreMap.size === 0) await loadGenres()

      const res = await axios.get(`/api/deezer/artist/${artistId}/albums`, { params: { limit: 25 } })
      const list = res.data.data || []
      
      for (const album of list) {
        if (album.genre_id && album.genre_id > 0 && genreMap.has(album.genre_id)) {
          return genreMap.get(album.genre_id)
        }
      }
    } catch {
      // Fallback controlado ante errores de red o API.
    }
    return 'Sin clasificar'
  }

  /**
   * Obtiene el año de lanzamiento de un álbum consultando su detalle.
   * Necesario porque los listados generales suelen omitir este dato.
   * @param {number} albumId
   * @returns {Promise<number|null>} Año (YYYY) o null si no se encuentra.
   */
  async function resolveAlbumYear(albumId) {
    try {
      const res = await axios.get(`/api/deezer/album/${albumId}`)
      const releaseDate = res.data?.release_date
      if (releaseDate) return Number(releaseDate.slice(0, 4))
    } catch {
      // Fallback si no hay detalle disponible.
    }
    return null
  }

  /**
   * Recupera la información detallada de un álbum (pistas, géneros, etc.).
   * @param {number} albumId
   * @returns {Promise<object|null>} Detalle del álbum u objeto nulo.
   */
  async function fetchAlbumDetail(albumId) {
    try {
      const res = await axios.get(`/api/deezer/album/${albumId}`)
      return res.data || null
    } catch {
      return null
    }
  }

  return {
    genreMap,
    loadGenres,
    fetchTrendingAlbums,
    fetchTrendingArtists,
    fetchTrendingTracks,
    searchDeezer,
    resolveArtistGenre,
    resolveAlbumYear,
    fetchAlbumDetail
  }
}