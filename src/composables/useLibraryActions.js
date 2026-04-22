/**
 * @file useLibraryActions.js
 * @description Puente entre los resultados de Deezer y la biblioteca local
 * del usuario. Añado el ítem al instante con los datos del listado y en
 * paralelo disparo llamadas extra para rellenar género/año. Así el toast
 * de "añadido a tu biblioteca" salta al momento, sin esperar al segundo
 * fetch que completa los metadatos.
 */

import { useMusicStore } from '../stores/music'
import { useDeezerApi } from './useDeezerApi'

export function useLibraryActions() {
  const musicStore = useMusicStore()
  const { resolveArtistGenre, resolveAlbumYear, genreMap } = useDeezerApi()

  /**
   * Corto por lo sano las promesas del enriquecimiento a los 3s: si Deezer
   * tarda más, prefiero que el álbum se quede con el género "Independiente"
   * antes que dejar una promesa colgando indefinidamente.
   */
  const ENRICH_TIMEOUT_MS = 3000

  /**
   * Compite una promesa contra un timer. Si gana el timer, devuelve el
   * valor `fallback` y la promesa original se ignora silenciosamente.
   * @template T
   * @param {Promise<T>} promise
   * @param {number} ms
   * @param {T} fallback
   * @returns {Promise<T>}
   */
  function withTimeout(promise, ms, fallback) {
    return Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(fallback), ms))
    ])
  }

  /**
   * ¿El artista (por nombre) ya está en la biblioteca del usuario?
   * @param {string} name
   * @returns {boolean}
   */
  function isArtistInLibrary(name) {
    return !!musicStore.findArtistByName(name)
  }

  /**
   * ¿Este álbum concreto (título + artista) ya está guardado?
   * @param {string} title
   * @param {string} artistName
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
   * Resuelve el género del artista contra Deezer y lo aplica en el store.
   * Va en segundo plano: el usuario ya tiene el artista creado con
   * "Independiente" como placeholder.
   * @param {number} localId - ID interno dentro de nuestro store.
   * @param {number} deezerId - ID del artista en Deezer.
   */
  async function enrichArtistGenre(localId, deezerId) {
    const genre = await withTimeout(resolveArtistGenre(deezerId), ENRICH_TIMEOUT_MS, null)
    if (genre && genre !== 'Sin clasificar') {
      musicStore.setArtistGenre(localId, genre)
    }
  }

  /**
   * Igual que enrichArtistGenre pero para el año de un álbum.
   * @param {number} localId
   * @param {number} deezerId
   */
  async function enrichAlbumYear(localId, deezerId) {
    const year = await withTimeout(resolveAlbumYear(deezerId), ENRICH_TIMEOUT_MS, null)
    if (year) {
      musicStore.setAlbumYear(localId, year)
    }
  }

  /**
   * Intenta encontrar un género para el álbum. Primero mira si el propio
   * payload trae `genre_id` conocido; si no, tira del género del artista.
   * @param {object} item - Ítem de Deezer.
   * @returns {Promise<string|null>}
   */
  async function resolveGenreForAlbum(item) {
    if (item.genre_id && genreMap.has(item.genre_id)) {
      return genreMap.get(item.genre_id)
    }
    return withTimeout(resolveArtistGenre(item.artist?.id), ENRICH_TIMEOUT_MS, null)
  }

  /**
   * Añade un artista a la biblioteca desde un payload de Deezer y dispara
   * el enriquecimiento de género en segundo plano.
   * @param {object} item
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
   * Añade un álbum desde Deezer. Si su artista no estaba en la biblioteca,
   * lo creo primero en modo silencioso para que sólo salte un toast (el
   * del álbum) en lugar de dos seguidos.
   * @param {object} item
   */
  function addAlbumToLibrary(item) {
    const artistName = item.artist?.name
    if (!artistName) return

    let artist = musicStore.findArtistByName(artistName)

    if (!artist) {
      artist = musicStore.addArtist(
        artistName,
        null,
        item.artist?.picture_big || item.artist?.picture_medium || null,
        { silent: true }
      )

      // Además de crear al artista, aprovecho para resolver su género.
      resolveGenreForAlbum(item).then((genre) => {
        if (genre && genre !== 'Sin clasificar') {
          musicStore.setArtistGenre(artist.id, genre)
        }
      })
    }

    if (isAlbumInLibrary(item.title, artistName)) return

    // Si el payload del listado ya trae la fecha, me ahorro el fetch extra.
    const immediateYear = item.release_date
      ? Number(item.release_date.slice(0, 4))
      : null

    const newAlbum = musicStore.addAlbum(
      item.title,
      artist.id,
      immediateYear,
      item.cover_big || item.cover_medium
    )

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
