/**
 * @file music.js
 * @description Store principal de la app: biblioteca (artistas + álbumes) y
 * búsquedas contra Deezer. Persisto todo en localStorage y emito las
 * notificaciones desde aquí para no repetir la misma línea de feedback en
 * cada vista. Las funciones que añaden datos aceptan `silent` porque en
 * acciones compuestas (añadir un álbum desde Explorar también crea al
 * artista) no quiero que salten dos toasts seguidos.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUIStore } from './ui'

export const useMusicStore = defineStore('music', () => {
  const ui = useUIStore()

  // --- ESTADO ---
  /** Rehidrato desde localStorage; si el JSON está roto vuelvo a vacío. */
  const getInitialArtists = () => {
    try { return JSON.parse(localStorage.getItem('ms_artists')) || [] }
    catch { return [] }
  }
  const getInitialAlbums = () => {
    try { return JSON.parse(localStorage.getItem('ms_albums')) || [] }
    catch { return [] }
  }

  const artists = ref(getInitialArtists())
  const albums = ref(getInitialAlbums())
  const apiResults = ref([])
  const loading = ref(false)

  // --- GETTERS ---
  /** Devuelve los álbumes de un artista concreto (por su id local). */
  const getAlbumsByArtist = computed(() => {
    return (artistId) => albums.value.filter(album => album.artistId === artistId)
  })

  /** Escribe artistas y álbumes a localStorage de golpe. */
  const syncStorage = () => {
    localStorage.setItem('ms_artists', JSON.stringify(artists.value))
    localStorage.setItem('ms_albums', JSON.stringify(albums.value))
  }

  // --- CRUD DE BIBLIOTECA ---

  /**
   * Añade un artista a la biblioteca local.
   * @param {string} name
   * @param {string|null} [genre=null] - Si no llega, cae a "Independiente".
   * @param {string|null} [image=null] - URL de la foto del artista.
   * @param {Object} [options]
   * @param {boolean} [options.silent=false] - Si true, no dispara toast.
   * @returns {Object} El artista recién creado (con su id local ya asignado).
   */
  function addArtist(name, genre = null, image = null, { silent = false } = {}) {
    const newArtist = {
      id: Date.now(),
      name: name.trim(),
      genre: genre || 'Independiente',
      image: image || null
    }
    artists.value.push(newArtist)
    syncStorage()

    if (!silent) {
      ui.notify(`Artista "${newArtist.name}" añadido a tu biblioteca`)
    }
    return newArtist
  }

  /**
   * Busca un artista por nombre (case-insensitive). Lo uso desde
   * useLibraryActions para no duplicar artistas al añadir desde Explorar.
   * @param {string} name
   * @returns {Object|undefined}
   */
  function findArtistByName(name) {
    if (!name) return undefined
    return artists.value.find(
      (a) => a.name.toLowerCase() === name.toLowerCase().trim()
    )
  }

  /**
   * Actualiza nombre y/o género de un artista existente.
   * @param {number} id
   * @param {string} name
   * @param {string|null} [genre=null] - Sólo se reemplaza si llega algo válido.
   */
  function updateArtist(id, name, genre = null) {
    const artist = artists.value.find(a => a.id === id)
    if (!artist) return
    artist.name = name.trim()
    if (genre && typeof genre === 'string' && genre.trim()) {
      artist.genre = genre.trim()
    }
    syncStorage()
    ui.notify('Artista actualizado')
  }

  /**
   * Muta el género de un artista en sitio (sin tocar el resto del objeto),
   * para conservar la reactividad. Lo llamo desde el enriquecimiento
   * asíncrono que trae el género real de Deezer; no notifica porque va
   * en segundo plano.
   * @param {number} id
   * @param {string} genre
   */
  function setArtistGenre(id, genre) {
    if (!genre) return
    const artist = artists.value.find(a => a.id === id)
    if (!artist) return
    artist.genre = genre.trim()
    syncStorage()
  }

  /**
   * Elimina un artista y, en cascada, todos sus álbumes vinculados.
   * Uso tipo "info" porque es una acción que el usuario confirma a propósito
   * y no encaja ni como success ni como error.
   * @param {number} id
   */
  function deleteArtist(id) {
    artists.value = artists.value.filter(a => a.id !== id)
    albums.value = albums.value.filter(a => a.artistId !== id)
    syncStorage()
    ui.notify('Artista eliminado', 'info')
  }

  /**
   * Añade un álbum a la biblioteca. Normalizo el año a YYYY aunque venga
   * en ISO (YYYY-MM-DD), que es como lo devuelve Deezer en algunos endpoints.
   * @param {string} title
   * @param {number} artistId
   * @param {string|number|null} [year=null]
   * @param {string|null} [cover=null]
   * @param {Object} [options]
   * @param {boolean} [options.silent=false]
   * @returns {Object} El álbum recién creado.
   */
  function addAlbum(title, artistId, year = null, cover = null, { silent = false } = {}) {
    const safeYear = year && String(year).includes('-')
      ? String(year).split('-')[0]
      : year
    const newAlbum = {
      id: Date.now(),
      title: title.trim(),
      artistId,
      year: safeYear || null,
      cover: cover || null
    }
    albums.value.push(newAlbum)
    syncStorage()

    if (!silent) {
      ui.notify(`Álbum "${newAlbum.title}" añadido a tu biblioteca`)
    }
    return newAlbum
  }

  /**
   * Edita los datos básicos de un álbum existente.
   * @param {number} id
   * @param {string} title
   * @param {number} artistId
   * @param {string|number|null} [year=null]
   */
  function updateAlbum(id, title, artistId, year = null) {
    const album = albums.value.find(a => a.id === id)
    if (!album) return
    album.title = title.trim()
    album.artistId = artistId
    if (year) album.year = year
    syncStorage()
    ui.notify('Álbum actualizado')
  }

  /**
   * Mismo caso que setArtistGenre: mutación puntual silenciosa cuando el
   * año llega por detrás desde Deezer tras añadir desde Explorar.
   * @param {number} id
   * @param {number} year
   */
  function setAlbumYear(id, year) {
    if (!year) return
    const album = albums.value.find(a => a.id === id)
    if (!album) return
    album.year = year
    syncStorage()
  }

  /**
   * Borra un álbum de la biblioteca.
   * @param {number} id
   */
  function deleteAlbum(id) {
    albums.value = albums.value.filter(a => a.id !== id)
    syncStorage()
    ui.notify('Álbum eliminado', 'info')
  }

  // --- DEEZER ---

  /**
   * Busca en Deezer por tipo (artist/album/track) y deja el resultado en
   * `apiResults`. Paso por el proxy `/api/deezer` definido en vite.config.js
   * para saltarme el CORS en desarrollo.
   * @param {'artist'|'album'|'track'} type
   * @param {string} query
   */
  async function searchDeezer(type, query) {
    if (!query?.trim()) return
    loading.value = true
    try {
      const res = await axios.get(`/api/deezer/search/${type}`, {
        params: { q: query.trim() }
      })
      apiResults.value = res.data.data || []
    } catch {
      ui.notify('No pudimos completar la búsqueda. Revisa tu conexión', 'error')
    } finally {
      loading.value = false
    }
  }

  /**
   * Trae las tendencias del tipo pedido. El endpoint de chart de Deezer
   * usa plurales, así que hago un mapeo interno para poder llamar con
   * singulares desde la app.
   * @param {'artist'|'album'|'track'} [type='album']
   * @returns {Promise<Array>}
   */
  async function fetchTrending(type = 'album') {
    loading.value = true
    try {
      const endpoint = type === 'track' ? 'tracks' : type === 'artist' ? 'artists' : 'albums'
      const res = await axios.get(`/api/deezer/chart/0/${endpoint}`)
      return res.data.data || []
    } catch {
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    artists, albums, loading, apiResults, getAlbumsByArtist,
    addArtist, findArtistByName, updateArtist, setArtistGenre, deleteArtist,
    addAlbum, updateAlbum, setAlbumYear, deleteAlbum,
    searchDeezer, fetchTrending
  }
})
