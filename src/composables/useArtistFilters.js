/**
 * @file useArtistFilters.js
 * @description Búsqueda por nombre + filtro por género para la lista de
 * artistas. Lo tengo como composable para mantener ArtistsView lo más
 * limpia posible (la parte de orden se hace a nivel de CSS grid).
 */

import { ref, computed } from 'vue';
import { useMusicStore } from '../stores/music';

/**
 * @returns {{
 *   searchQuery: import('vue').Ref<string>,
 *   activeGenre: import('vue').Ref<string|null>,
 *   filteredArtists: import('vue').ComputedRef<Array>
 * }}
 */
export function useArtistFilters() {
  const musicStore = useMusicStore();

  /** Texto del buscador. */
  const searchQuery = ref("");

  /** Género seleccionado; null significa "todos". */
  const activeGenre = ref(null);

  /** Artistas tras aplicar los dos filtros. */
  const filteredArtists = computed(() => {
    let list = [...musicStore.artists];

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q));
    }

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
