/**
 * @file useAlbumFilters.js
 * @description Composable para gestionar la lógica de filtrado, búsqueda y ordenación de álbumes.
 * Centraliza el estado de la lista para mantener limpia la lógica de las vistas.
 */

import { ref, computed } from "vue";
import { useMusicStore } from "../stores/music";

/**
 * Hook para manejar la lista de álbumes con filtros dinámicos.
 * @param {number|null} [initialArtistId=null] - ID opcional para filtrar por un artista desde el inicio.
 * @returns {Object} Estados reactivos y métodos para manipular la lista de álbumes.
 */
export function useAlbumFilters(initialArtistId = null) {
  const musicStore = useMusicStore();

  // Estados reactivos para los filtros
  const searchQuery = ref("");
  const activeArtistFilter = ref(initialArtistId);
  
  // Modos de ordenación disponibles
  const sortModes = ["title-asc", "title-desc", "year-desc", "year-asc"];
  const sortIndex = ref(0);

  /** Devuelve el modo de ordenación activo actualmente */
  const currentSort = computed(() => sortModes[sortIndex.value]);

  /**
   * Lista procesada de álbumes. 
   * Aplica primero los filtros de búsqueda y artista, y finalmente ordena el resultado.
   */
  const filteredAlbums = computed(() => {
    let result = [...musicStore.albums];

    // Filtro por texto en el título
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(a => a.title.toLowerCase().includes(q));
    }

    // Filtro por pertenencia a un artista específico
    if (activeArtistFilter.value) {
      result = result.filter(a => a.artistId === activeArtistFilter.value);
    }

    // Lógica de ordenación según el modo activo
    switch (currentSort.value) {
      case "title-asc": 
        result.sort((a, b) => a.title.localeCompare(b.title)); 
        break;
      case "title-desc": 
        result.sort((a, b) => b.title.localeCompare(a.title)); 
        break;
      case "year-desc": 
        result.sort((a, b) => (b.year || 0) - (a.year || 0)); 
        break;
      case "year-asc": 
        result.sort((a, b) => (a.year || 0) - (b.year || 0)); 
        break;
    }

    return result;
  });

  return {
    searchQuery,
    activeArtistFilter,
    filteredAlbums,
    currentSort,
    /** Cambia al siguiente modo de ordenación de forma cíclica */
    cycleSortMode: () => { 
      sortIndex.value = (sortIndex.value + 1) % sortModes.length; 
    },
    /** Activa o desactiva el filtro de artista (toggle) */
    toggleArtistFilter: (id) => { 
      activeArtistFilter.value = activeArtistFilter.value === id ? null : id; 
    }
  };
}