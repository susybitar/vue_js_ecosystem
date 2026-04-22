/**
 * @file useAlbumFilters.js
 * @description Filtro + búsqueda + orden para la lista de álbumes. Lo saqué
 * a composable porque la lógica es idéntica en AlbumsView y cuando filtro
 * álbumes desde el detalle de un artista.
 */

import { ref, computed } from "vue";
import { useMusicStore } from "../stores/music";

/**
 * @param {number|null} [initialArtistId=null] - Si llega, arranca filtrando
 *   los álbumes de ese artista (caso: entras al detalle de un artista).
 * @returns {{
 *   searchQuery: import('vue').Ref<string>,
 *   activeArtistFilter: import('vue').Ref<number|null>,
 *   filteredAlbums: import('vue').ComputedRef<Array>,
 *   currentSort: import('vue').ComputedRef<string>,
 *   cycleSortMode: () => void,
 *   toggleArtistFilter: (id: number) => void
 * }}
 */
export function useAlbumFilters(initialArtistId = null) {
  const musicStore = useMusicStore();

  /** Texto del buscador (v-model del input). */
  const searchQuery = ref("");

  /** Si hay id, filtra por ese artista; null significa "todos". */
  const activeArtistFilter = ref(initialArtistId);

  /** Rotación cíclica de modos de orden. */
  const sortModes = ["title-asc", "title-desc", "year-desc", "year-asc"];
  const sortIndex = ref(0);

  /** Modo de orden activo (texto). */
  const currentSort = computed(() => sortModes[sortIndex.value]);

  /**
   * Álbumes ya filtrados por texto + artista + orden. Es un computed para
   * que la UI reaccione automáticamente a cualquier cambio de filtros.
   */
  const filteredAlbums = computed(() => {
    let result = [...musicStore.albums];

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(a => a.title.toLowerCase().includes(q));
    }

    if (activeArtistFilter.value) {
      result = result.filter(a => a.artistId === activeArtistFilter.value);
    }

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
    /** Rota al siguiente modo de orden. */
    cycleSortMode: () => {
      sortIndex.value = (sortIndex.value + 1) % sortModes.length;
    },
    /** Toggle: si pulsas el mismo artista activo, se desactiva el filtro. */
    toggleArtistFilter: (id) => {
      activeArtistFilter.value = activeArtistFilter.value === id ? null : id;
    }
  };
}
