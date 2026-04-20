/**
 * @file useLibraryActions.js
 * @description Puente entre los resultados de Deezer y la biblioteca local del usuario.
 * Implementa un patrón de UI optimista para que la adición de elementos sea instantánea
 * mientras los metadatos pesados se cargan en segundo plano.
 */

import { useMusicStore } from '../stores/music'
import { useDeezerApi } from './useDeezerApi'

/**
 * Hook para gestionar las acciones de guardado en la biblioteca.
 * @returns {Object} Métodos para verificar existencia y añadir artistas o álbumes.
 */
export function useLibraryActions() {
  const musicStore = useMusicStore()
  const { resolveArtistGenre, resolveAlbumYear, genreMap } = useDeezerApi()

  /** * Tiempo máximo de espera para el enriquecimiento de datos.
   * Evita que procesos en segundo plano queden colgados indefinidamente.
   */
  const ENRICH_TIMEOUT_MS = 3000

  /**
   * Ejecuta una promesa con un tiempo límite de expiración.
   * @param {Promise} promise - Tarea asíncrona a realizar.
   * @param {number} ms - Tiempo en milisegundos.
   * @param {any} fallback - Valor devuelto si se alcanza el timeout.
   * @returns {Promise}
   */
  function withTimeout(promise, ms, fallback) {
    return Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(fallback), ms))
    ])
  }

  /**
   * Comprueba si un artista ya existe en el store local.
   * @param {string} name - Nombre del artista.
   * @returns {boolean}
   */
  function isArtistInLibrary(name) {
    return !!musicStore.findArtistByName(name)
  }

  /**
   * Comprueba si un álbum específico de un artista ya está guardado.
   * @param {string} title - Título del disco.
   * @param {string} artistName - Nombre del artista.
   * @returns {boolean}
   */
  function isAlbumInLibrary(title, artistName) {
    const artist = musicStore.findArtistByName(artistName)
    if (!artist) return false
    return musicStore.albums.some(
      (a) => a.artistId === artist.id && a.title.toLowerCase() === title.toLowerCase()
    )
  }

  /**
   * Busca y actualiza el género de un artista en segundo plano.
   * @param {number} localId - ID interno del artista.
   * @param {number} deezerId - ID del artista en la API externa.
   */
  async function enrichArtistGenre(localId, deezerId) {
    const genre = await withTimeout(resolveArtistGenre(deezerId), ENRICH_TIMEOUT_MS, null)
    if (genre && genre !== 'Sin clasificar') {
      musicStore.setArtistGenre(localId, genre)
    }
  }

  /**
   * Busca y actualiza el año de un álbum en segundo plano.
   * @param {number} localId - ID interno del álbum.
   * @param {number} deezerId - ID del álbum en la API externa.
   */
  async function enrichAlbumYear(localId, deezerId) {
    const year = await withTimeout(resolveAlbumYear(deezerId), ENRICH_TIMEOUT_MS, null)
    if (year) {
      musicStore.setAlbumYear(localId, year)
    }
  }

  /**
   * Intenta resolver el género musical del álbum analizando sus datos o los de su artista.
   * @param {object} item - Payload del álbum.
   * @returns {Promise<string|null>}
   */
  async function resolveGenreForAlbum(item) {
    if (item.genre_id && genreMap.has(item.genre_id)) {
      return genreMap.get(item.genre_id)
    }
    return withTimeout(resolveArtistGenre(item.artist?.id), ENRICH_TIMEOUT_MS, null)
  }

  /**
   * Añade un artista a la biblioteca y dispara la búsqueda de su género.
   * @param {object} item - Datos del artista provenientes de Deezer.
   */
  function addArtistToLibrary(item) {
    if (isArtistInLibrary(item.name)) return
    
    const newArtist = musicStore.addArtist(
      item.name,
      null,
      item.picture_big || item.picture_medium
    )
    enrichArtistGenre(newArtist.id, item.id)
  }

  /**
   * Añade un álbum a la biblioteca.
   * Crea automáticamente al artista si no existía previamente para mantener la integridad.
   * @param {object} item - Datos del álbum provenientes de Deezer.
   */
  function addAlbumToLibrary(item) {
    const artistName = item.artist?.name
    if (!artistName) return

    let artist = musicStore.findArtistByName(artistName)
    
    // Si el artista no existe, lo creamos primero
    if (!artist) {
      artist = musicStore.addArtist(
        artistName,
        null,
        item.artist?.picture_big || item.artist?.picture_medium || null
      )
      
      // Enriquecemos el género del nuevo artista
      resolveGenreForAlbum(item).then((genre) => {
        if (genre && genre !== 'Sin clasificar') {
          musicStore.setArtistGenre(artist.id, genre)
        }
      })
    }

    if (isAlbumInLibrary(item.title, artistName)) return

    // Priorizamos el año si viene en el payload inmediato
    const immediateYear = item.release_date
      ? Number(item.release_date.slice(0, 4))
      : null

    const newAlbum = musicStore.addAlbum(
      item.title,
      artist.id,
      immediateYear,
      item.cover_big || item.cover_medium
    )

    // Si no teníamos el año, lo buscamos en diferido
    if (!immediateYear) {
      enrichAlbumYear(newAlbum.id, item.id)
    }
  }

  return {
    isArtistInLibrary,
    isAlbumInLibrary,
    addArtistToLibrary,
    addAlbumToLibrary
  }
}