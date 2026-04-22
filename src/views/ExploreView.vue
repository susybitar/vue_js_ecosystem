<template>
  <v-layout class="fill-height">
    <TheNavigationDock />

    <v-main>
      <v-container fluid class="page-container d-flex flex-column">
        <header class="mb-8">
          <p class="header-eyebrow">DESCUBRIR</p>
          <h1 class="header-title">Explorar</h1>
          <p class="header-subtitle">
            {{
              isSearching
                ? "Resultados en directo desde Deezer."
                : "Las tendencias globales, al instante."
            }}
          </p>
        </header>

        <ExploreSearchBar
          v-model="query"
          v-model:searchType="searchType"
          :loading="musicStore.loading"
          :placeholder="searchBarPlaceholder"
          @search="runSearch"
        />

        <div v-if="error" class="error-banner">
          <v-icon size="16" color="#FF3B3B">mdi-alert-circle</v-icon>
          <span>{{ error }}</span>
        </div>

        <section class="results-section">
          <div
            v-if="musicStore.loading || loadingTrending"
            class="d-flex justify-center py-16"
          >
            <v-progress-circular indeterminate color="#1265FF" size="28" />
          </div>

          <template v-else>
            <p
              v-if="isSearching && musicStore.apiResults.length > 0"
              class="results-count mb-4"
            >
              {{ musicStore.apiResults.length }} {{ resultsLabel }}
            </p>

            <p v-else-if="!isSearching" class="section-label">
              {{ trendingLabel }}
            </p>

            <v-row
              v-if="(isSearching ? musicStore.apiResults : trending).length > 0"
              class="mx-n3"
            >
              <v-col
                v-for="item in isSearching ? musicStore.apiResults : trending"
                :key="item.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                xl="2"
                class="pa-3"
              >
                <ExploreCard
                  :item="item"
                  :type="searchType"
                  :in-library="isItemInLibrary(item)"
                  :playing="currentPreview === item.id"
                  @add="addToLibrary(item)"
                  @preview="togglePreview(item)"
                  @select="handleQuickNav"
                />
              </v-col>
            </v-row>

            <div v-else class="empty-state">
              <v-icon size="40" color="rgba(255,255,255,0.15)">
                mdi-music-note-off
              </v-icon>
              <p class="empty-title">Sin resultados</p>
            </div>
          </template>
        </section>

        <TheFooter class="mt-12" />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
/**
 * @file ExploreView.vue
 * @description Buscador global. Mientras el input está vacío, muestro
 * tendencias de Deezer según la pestaña activa (artistas / álbumes / canciones).
 * En cuanto el usuario escribe y dispara la búsqueda, paso a enseñar los
 * resultados reales. El cambio de pestaña re-dispara la petición actual,
 * para que la UI no quede enseñando resultados de "álbumes" cuando estás en
 * "artistas".
 */

import { ref, computed, watch, onMounted } from "vue";
import { useMusicStore } from "../stores/music";
import { useAudioPreview } from "../composables/useAudioPreview";
import { useLibraryActions } from "../composables/useLibraryActions";

import TheNavigationDock from "../components/layout/TheNavigationDock.vue";
import TheFooter from "../components/layout/TheFooter.vue";
import ExploreSearchBar from "../components/explore/ExploreSearchBar.vue";
import ExploreCard from "../components/explore/ExploreCard.vue";

const musicStore = useMusicStore();
const { currentPreview, togglePreview } = useAudioPreview();
const {
  isArtistInLibrary,
  isAlbumInLibrary,
  addArtistToLibrary,
  addAlbumToLibrary,
} = useLibraryActions();

// --- ESTADO ---
const query = ref("");
const searchType = ref("artist"); // "artist" | "album" | "track"
const trending = ref([]);
const loadingTrending = ref(false);
const error = ref(null);

// --- COMPUTED ---
/** Hay texto en el input → modo "resultados de búsqueda". Si no, modo "tendencias". */
const isSearching = computed(() => !!query.value.trim());

/** Texto "N artistas encontrados" / "N álbumes encontrados" / etc. */
const resultsLabel = computed(() =>
  searchType.value === "artist"
    ? "artistas encontrados"
    : searchType.value === "album"
      ? "álbumes encontrados"
      : "canciones encontradas",
);

/** Título que sale sobre la grid cuando estamos en modo tendencias. */
const trendingLabel = computed(() =>
  searchType.value === "artist"
    ? "Artistas en tendencia"
    : searchType.value === "album"
      ? "Álbumes más escuchados"
      : "Canciones del momento",
);

/** Placeholder del buscador, adaptado a la pestaña actual. */
const searchBarPlaceholder = computed(
  () =>
    `Busca un ${
      searchType.value === "artist"
        ? "artista"
        : searchType.value === "album"
          ? "álbum"
          : "canción"
    }...`,
);

// --- LIBRERÍA ---
/**
 * ¿El item ya está en la biblioteca del usuario? Sirve para pintar "Añadido"
 * en vez del botón de añadir. Para canciones devuelvo siempre `false` porque
 * los tracks no los guardo localmente.
 */
function isItemInLibrary(item) {
  if (searchType.value === "artist") return isArtistInLibrary(item.name);
  if (searchType.value === "album")
    return isAlbumInLibrary(item.title, item.artist?.name);
  return false;
}

/** Añade el item a la biblioteca (sólo artistas y álbumes; tracks no aplican). */
function addToLibrary(item) {
  if (searchType.value === "artist") addArtistToLibrary(item);
  if (searchType.value === "album") addAlbumToLibrary(item);
}

/**
 * "Navegación rápida" dentro del buscador: al seleccionar un artista, paso
 * automáticamente a buscar sus álbumes; y al seleccionar un álbum, a sus
 * tracks. Es un atajo para no obligar al usuario a cambiar la pestaña +
 * escribir el nombre a mano.
 */
function handleQuickNav(item) {
  if (searchType.value === "artist") {
    searchType.value = "album";
    query.value = item.name;
  } else if (searchType.value === "album") {
    searchType.value = "track";
    query.value = item.title;
  }
}

// --- API ---
/** Dispara la búsqueda en la API con el tipo y el texto actuales. */
async function runSearch() {
  if (!query.value.trim()) return;
  error.value = null;
  await musicStore.searchDeezer(searchType.value, query.value);
}

/**
 * Carga las tendencias para la pestaña actual. Se llama al montar y cada vez
 * que el usuario vacía el input (vuelve al "modo portada").
 */
async function loadTrendingData() {
  loadingTrending.value = true;
  try {
    trending.value = await musicStore.fetchTrending(searchType.value);
  } catch {
    error.value = "No se pudieron cargar las tendencias.";
  } finally {
    loadingTrending.value = false;
  }
}

// --- WATCHERS ---
/**
 * Cambio de pestaña: si hay búsqueda activa, re-busco en la nueva categoría;
 * si no, recargo las tendencias de esa categoría. No observo `query` aquí a
 * propósito — sería una petición por cada tecla. La búsqueda se dispara por
 * Enter o por el botón, vía el evento `@search` del ExploreSearchBar.
 */
watch(searchType, async () => {
  if (query.value.trim()) {
    await runSearch();
  } else {
    await loadTrendingData();
  }
});

/** Al vaciar el input vuelvo a tendencias y limpio los resultados previos. */
watch(query, (val) => {
  if (!val.trim()) {
    musicStore.apiResults = [];
    loadTrendingData();
  }
});

// --- INIT ---
onMounted(() => {
  loadTrendingData();
});
</script>

<style scoped>
.page-container {
  padding: 48px 48px 48px 120px !important;
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: 960px) {
  .page-container {
    padding: 32px 24px 32px 100px !important;
  }
}

@media (max-width: 600px) {
  .page-container {
    padding: 24px 16px 24px 85px !important;
  }
}

.header-eyebrow {
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1265ff;
  margin-bottom: 6px;
}

.header-title {
  font-family: "Montserrat", sans-serif;
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 6px;
}

.header-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.45);
}

.section-label {
  font-family: "Montserrat", sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 18px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 59, 59, 0.1);
  padding: 12px;
  border-radius: 8px;
  color: #ff3b3b;
  font-size: 0.85rem;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 59, 59, 0.2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: rgba(255, 255, 255, 0.2);
}

.empty-title {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  margin-top: 12px;
}

.results-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
