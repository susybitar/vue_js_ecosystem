/**
 * @file useArtistFilters.js
 * @description Composable para gestionar la lógica de búsqueda y filtrado de artistas por género.
 * Ayuda a mantener las vistas limpias delegando el procesamiento de las listas.
 */

import { ref, computed } from 'vue';
import { useMusicStore } from '../stores/music';

/**
 * Hook para filtrar la colección de artistas.
 * @returns {Object} Estados reactivos para el input de búsqueda, el género activo y la lista resultante.
 */
export function useArtistFilters() {
  const musicStore = useMusicStore();

  /** Texto de búsqueda vinculado al input del usuario */
  const searchQuery = ref("");

  /** Género seleccionado para filtrar (null si se muestran todos) */
  const activeGenre = ref(null);

  /**
   * Lista de artistas procesada.
   * Filtra por nombre (case-insensitive) y por género de forma simultánea.
   */
  const filteredArtists = computed(() => {
    let list = [...musicStore.artists];

    // Aplicamos filtro por nombre si el usuario ha escrito algo
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q));
    }

    // Aplicamos filtro por género si hay uno seleccionado
    if (activeGenre.value) {
      list = list.filter(a => a.genre === activeGenre.value);
    }

    return list;
  });

  return { 
    searchQuery, 
    activeGenre, 
    filteredArtists 
  };
}