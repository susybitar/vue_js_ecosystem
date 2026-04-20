<template>
  <v-layout class="fill-height">
    <TheNavigationDock />

    <v-main>
      <v-container fluid class="page-container d-flex flex-column">
        <div class="flex-grow-1">
          <header class="mb-10">
            <p class="header-eyebrow">BIBLIOTECA</p>
            <h1 class="header-title">Artistas</h1>
          </header>

          <div
            class="toolbar mb-8 d-flex align-center justify-space-between flex-wrap ga-4"
          >
            <div class="d-flex align-center ga-4 flex-wrap">
              <v-btn
                icon="mdi-plus"
                color="#1265FF"
                variant="tonal"
                size="small"
                class="rounded-lg"
                @click="openCreateDialog"
              />

              <div
                class="d-flex ga-1 border-sm rounded-pill pa-1 flex-wrap"
                style="border-color: rgba(255, 255, 255, 0.1) !important"
              >
                <v-btn
                  variant="flat"
                  size="x-small"
                  :color="!activeGenreFilter ? '#1265FF' : 'transparent'"
                  class="text-none rounded-pill font-weight-bold px-4"
                  :class="!activeGenreFilter ? 'text-white' : 'text-grey'"
                  @click="activeGenreFilter = null"
                >
                  Todos
                </v-btn>
                <v-btn
                  v-for="genre in uniqueGenres"
                  :key="genre"
                  variant="flat"
                  size="x-small"
                  :color="
                    activeGenreFilter === genre ? '#1265FF' : 'transparent'
                  "
                  class="text-none rounded-pill font-weight-bold px-4"
                  :class="
                    activeGenreFilter === genre ? 'text-white' : 'text-grey'
                  "
                  @click="activeGenreFilter = genre"
                >
                  {{ genre }}
                </v-btn>
              </div>
            </div>

            <div class="d-flex align-center ga-4 flex-wrap">
              <v-btn
                variant="text"
                size="small"
                color="grey-lighten-1"
                @click="cycleSortMode"
                class="text-none"
              >
                <v-icon start size="16">{{ sortUI.icon }}</v-icon>
                {{ sortUI.label }}
              </v-btn>

              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                placeholder="Buscar artista..."
                variant="outlined"
                density="compact"
                hide-details
                rounded="xl"
                base-color="rgba(255,255,255,0.1)"
                color="#1265FF"
                class="search-bar"
                clearable
              />
            </div>
          </div>

          <v-row v-if="finalFilteredArtists.length > 0">
            <v-col
              v-for="artist in finalFilteredArtists"
              :key="artist.id"
              cols="12"
              sm="4"
              md="3"
              lg="2"
            >
              <ArtistCard
                :artist="artist"
                @click="goToArtistAlbums(artist.id)"
                @edit="openEditDialog(artist)"
                @delete="confirmRemove(artist)"
              />
            </v-col>
          </v-row>

          <div v-else class="text-center py-16">
            <v-icon size="48" color="rgba(255,255,255,0.1)"
              >mdi-account-music</v-icon
            >
            <p class="text-grey mt-4 mb-6">
              No hay artistas que coincidan con tu búsqueda
            </p>
            <router-link to="/profile/explore" class="empty-btn">
              Explorar artistas
            </router-link>
          </div>
        </div>

        <TheFooter class="mt-12" />
      </v-container>
    </v-main>

    <ArtistDialog
      v-model="dialogOpen"
      :artist="editingArtist"
      @save="saveArtist"
    />

    <v-dialog v-model="deleteDialog" max-width="350">
      <v-card
        class="bg-grey-darken-4 pa-5 rounded-xl text-center border-sm"
        style="border-color: rgba(255, 255, 255, 0.1) !important"
      >
        <v-icon color="error" size="48" class="mb-4"
          >mdi-alert-circle-outline</v-icon
        >
        <h3 class="text-white text-h6 font-weight-black mb-2">
          ¿Eliminar artista?
        </h3>
        <p class="text-grey text-body-2 mb-6">
          Esta acción borrará el artista y todos sus álbumes vinculados. No se
          puede deshacer.
        </p>
        <div class="d-flex ga-3">
          <v-btn
            variant="text"
            color="white"
            class="flex-grow-1 text-none font-weight-bold"
            @click="deleteDialog = false"
            >Cancelar</v-btn
          >
          <v-btn
            color="error"
            variant="flat"
            class="flex-grow-1 text-none font-weight-black"
            @click="executeDelete"
            >Eliminar</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script setup>
/**
 * @file ArtistsView.vue
 * @description Vista principal de gestión de la biblioteca de artistas.
 * Implementa filtrado dinámico por género, búsqueda en tiempo real y ordenación.
 */

import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import { useMusicStore } from "../stores/music";
import { useArtistFilters } from "../composables/useArtistFilters";

import TheNavigationDock from "../components/layout/TheNavigationDock.vue";
import TheFooter from "../components/layout/TheFooter.vue";
import ArtistCard from "../components/artists/ArtistCard.vue";
import ArtistDialog from "../components/artists/ArtistDialog.vue";

const router = useRouter();
const musicStore = useMusicStore();

// Lógica de búsqueda reactiva delegada al composable
const { searchQuery, filteredArtists: baseFilteredArtists } =
  useArtistFilters();

/** Estados reactivos para la gestión de diálogos y filtrado local */
const dialogOpen = ref(false);
const deleteDialog = ref(false);
const editingArtist = ref(null);
const artistToDelete = ref(null);

const activeGenreFilter = ref(null);
const currentSort = ref("name-asc");

/**
 * Extrae géneros únicos del store para generar los botones de filtro dinámicamente.
 */
const uniqueGenres = computed(() => {
  const genres = musicStore.artists.map((a) => a.genre).filter(Boolean);
  return [...new Set(genres)];
});

/**
 * Mapeo visual para el botón de ordenación.
 */
const sortUI = computed(() => {
  return currentSort.value === "name-asc"
    ? { icon: "mdi-sort-alphabetical-ascending", label: "A-Z" }
    : { icon: "mdi-sort-alphabetical-descending", label: "Z-A" };
});

/**
 * Alterna cíclicamente entre orden ascendente y descendente.
 */
function cycleSortMode() {
  currentSort.value =
    currentSort.value === "name-asc" ? "name-desc" : "name-asc";
}

/**
 * Procesamiento final de la lista de artistas.
 * Combina el filtro de búsqueda del composable con los filtros locales de género y orden.
 */
const finalFilteredArtists = computed(() => {
  let list = baseFilteredArtists.value || [];

  // Filtrado por género
  if (activeGenreFilter.value) {
    list = list.filter((a) => a.genre === activeGenreFilter.value);
  }

  // Ordenación alfabética
  if (currentSort.value === "name-asc") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => b.name.localeCompare(a.name));
  }

  return list;
});

/** Navegación a la discografía del artista */
function goToArtistAlbums(id) {
  router.push(`/profile/artists/${id}/albums`);
}

function openCreateDialog() {
  editingArtist.value = null;
  dialogOpen.value = true;
}

function openEditDialog(artist) {
  editingArtist.value = artist;
  dialogOpen.value = true;
}

/**
 * Guarda los cambios o crea un nuevo artista en el store de Pinia.
 */
function saveArtist(payload) {
  if (payload.id) {
    musicStore.updateArtist(payload.id, payload.name, payload.genre);
  } else {
    musicStore.addArtist(payload.name, payload.genre);
  }
}

/**
 * Abre el diálogo de seguridad antes de ejecutar una eliminación destructiva.
 */
function confirmRemove(artist) {
  artistToDelete.value = artist;
  deleteDialog.value = true;
}

/**
 * Ejecuta el borrado real en el store y sincroniza la UI.
 */
function executeDelete() {
  if (artistToDelete.value) {
    musicStore.deleteArtist(artistToDelete.value.id);
  }
  deleteDialog.value = false;
  artistToDelete.value = null;
}
</script>

<style scoped>
/* Contenedor optimizado para el dock lateral fijo */
.page-container {
  padding: 48px 48px 48px 120px !important;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
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
  .header-title {
    font-size: 1.8rem !important;
  }
  .search-bar {
    width: 100% !important;
    min-width: 200px;
  }
}

.header-eyebrow {
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1265ff;
  margin-bottom: 8px;
}
.header-title {
  font-family: "Montserrat", sans-serif;
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
}

/* Buscador minimalista integrado en el tema oscuro */
.search-bar {
  width: 220px;
}
.search-bar :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1 !important;
}
.search-bar
  :deep(.v-field--variant-outlined.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1 !important;
}
.search-bar :deep(input) {
  font-size: 0.85rem !important;
}

.empty-btn {
  display: inline-block;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 10px;
  background: #1265ff;
  color: #ffffff;
  text-decoration: none;
  transition: background 0.2s;
}
.empty-btn:hover {
  background: #0d52d6;
}
</style>
