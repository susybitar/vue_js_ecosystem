/**
 * @file music.js (Store)
 * @description Gestión centralizada de la biblioteca musical y comunicación con la API.
 * Implementa el CRUD local con persistencia y las llamadas asíncronas a Deezer
 * dentro de Actions para cumplir con el Requisito Opcional 1 del programa.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUIStore } from './ui'

export const useMusicStore = defineStore('music', () => {
  const ui = useUIStore()

  // --- ESTADO (STATE) ---
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
  const getAlbumsByArtist = computed(() => {
    return (artistId) => albums.value.filter(album => album.artistId === artistId)
  })

  // --- MÉTODOS PRIVADOS ---
  const syncStorage = () => {
    localStorage.setItem('ms_artists', JSON.stringify(artists.value))
    localStorage.setItem('ms_albums', JSON.stringify(albums.value))
  }

  // --- ACCIONES CRUD ---

  /**
   * Crea un artista en la biblioteca local.
   * Si no se proporciona género, se marca como "Independiente" y se deja que
   * useLibraryActions lo enriquezca en segundo plano con el género real de Deezer.
   */
  function addArtist(name, genre = null, image = null) {
    const newArtist = {
      id: Date.now(),
      name: name.trim(),
      genre: genre || 'Independiente',
      image: image || null
    }
    artists.value.push(newArtist)
    syncStorage()
    return newArtist
  }

  /**
   * Localiza un artista por nombre (case-insensitive). Utilizado por
   * useLibraryActions para evitar duplicados al añadir desde Explorar.
   */
  function findArtistByName(name) {
    if (!name) return undefined
    return artists.value.find(
      (a) => a.name.toLowerCase() === name.toLowerCase().trim()
    )
  }

  /**
   * Actualiza nombre y/o género de un artista existente.
   */
  function updateArtist(id, name, genre = null) {
    const artist = artists.value.find(a => a.id === id)
    if (!artist) return
    artist.name = name.trim()
    if (genre && typeof genre === 'string' && genre.trim()) {
      artist.genre = genre.trim()
    }
    syncStorage()
  }

  /**
   * Mutador puntual para rellenar el género cuando llega del enriquecimiento
   * asíncrono. Mutamos la propiedad in-place para preservar la reactividad.
   */
  function setArtistGenre(id, genre) {
    if (!genre) return
    const artist = artists.value.find(a => a.id === id)
    if (!artist) return
    artist.genre = genre.trim()
    syncStorage()
  }

  function deleteArtist(id) {
    artists.value = artists.value.filter(a => a.id !== id)
    albums.value = albums.value.filter(a => a.artistId !== id)
    syncStorage()
    ui.notify('Artista eliminado', 'error')
  }

  /**
   * Añade un álbum asegurando que el año quede normalizado a YYYY aunque
   * venga en formato ISO (YYYY-MM-DD) desde Deezer.
   */
  function addAlbum(title, artistId, year = null, cover = null) {
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
    ui.notify(`Álbum "${title}" guardado`)
    return newAlbum
  }

  /**
   * Actualiza los datos básicos de un álbum existente.
   */
  function updateAlbum(id, title, artistId, year = null) {
    const album = albums.value.find(a => a.id === id)
    if (!album) return
    album.title = title.trim()
    album.artistId = artistId
    if (year) album.year = year
    syncStorage()
  }

  /**
   * Mutador puntual para rellenar el año cuando llega del enriquecimiento
   * asíncrono tras añadir desde Explorar.
   */
  function setAlbumYear(id, year) {
    if (!year) return
    const album = albums.value.find(a => a.id === id)
    if (!album) return
    album.year = year
    syncStorage()
  }

  function deleteAlbum(id) {
    albums.value = albums.value.filter(a => a.id !== id)
    syncStorage()
    ui.notify('Álbum eliminado', 'error')
  }

  // --- ACCIONES API ---

  /**
   * Busca en Deezer. Usa el proxy '/api/deezer' definido en vite.config.js
   * para evitar errores de CORS en desarrollo.
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
      ui.notify('Error en la búsqueda', 'error')
    } finally {
      loading.value = false
    }
  }

  /**
   * Recupera las tendencias del tipo indicado (artist, album, track).
   * Mapeo interno porque el endpoint de Deezer usa plurales.
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