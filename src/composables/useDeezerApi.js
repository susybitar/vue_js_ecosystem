/**
 * @file useDeezerApi.js
 * @description Wrapper de las llamadas a Deezer. Todo pasa por el proxy
 * `/api/deezer` (ver vite.config.js) para saltarme el CORS. Lo saqué a
 * composable para no tener `axios.get` desperdigado por medio proyecto.
 */

import axios from 'axios'

/**
 * Cache de géneros a nivel de módulo para compartirla entre componentes.
 * La API devuelve `genre_id` numérico en los álbumes y el nombre legible
 * está en un endpoint aparte, así que lo resuelvo una sola vez y lo guardo.
 * @type {Map<number, string>}
 */
const genreMap = new Map()

export function useDeezerApi() {

  /**
   * Carga el catálogo completo de géneros (id → nombre) la primera vez y
   * lo cachea. Llamadas posteriores salen gratis.
   * @returns {Promise<Map<number,string>>}
   */
  async function loadGenres() {
    if (genreMap.size > 0) return genreMap
    try {
      const res = await axios.get('/api/deezer/genre')
      const list = res.data.data || []
      list.forEach((g) => genreMap.set(g.id, g.name))
    } catch {
      // Si falla la carga, la app sigue funcionando pero sin nombres de género.
    }
    return genreMap
  }

  /**
   * Top de álbumes del momento.
   * @param {number} [limit=10]
   * @returns {Promise<Array>}
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
   * Top de artistas del momento.
   * @param {number} [limit=10]
   * @returns {Promise<Array>}
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
   * Top de canciones del momento.
   * @param {number} [limit=10]
   * @returns {Promise<Array>}
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
   * Busca en Deezer por tipo.
   * @param {'artist'|'album'|'track'} type
   * @param {string} query - Término que escribió el usuario.
   * @returns {Promise<Array>}
   */
  async function searchDeezer(type, query) {
    const res = await axios.get(`/api/deezer/search/${type}`, {
      params: { q: query.trim() }
    })
    return res.data.data || []
  }

  /**
   * Deezer no da el género del artista directamente en su endpoint propio,
   * así que miro sus álbumes y me quedo con el primer `genre_id` válido
   * que aparezca.
   * @param {number} artistId
   * @returns {Promise<string>} Nombre del género o "Sin clasificar".
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
      // Si falla la red, caigo al valor por defecto.
    }
    return 'Sin clasificar'
  }

  /**
   * El año sólo viene en el detalle del álbum, no en los listados cortos.
   * @param {number} albumId
   * @returns {Promise<number|null>}
   */
  async function resolveAlbumYear(albumId) {
    try {
      const res = await axios.get(`/api/deezer/album/${albumId}`)
      const releaseDate = res.data?.release_date
      if (releaseDate) return Number(releaseDate.slice(0, 4))
    } catch {
      // Sin detalle devuelvo null y la UI pinta "—".
    }
    return null
  }

  /**
   * Detalle completo del álbum (pistas, género, etc.).
   * @param {number} albumId
   * @returns {Promise<object|null>}
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
