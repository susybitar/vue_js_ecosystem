<template>
  <v-layout class="fill-height">
    <TheNavigationDock />

    <v-main>
      <v-container fluid class="page-container d-flex flex-column">
        <div class="flex-grow-1">
          <header class="mb-10">
            <div v-if="activeArtistFilter" class="mb-4">
              <v-btn
                variant="plain"
                color="grey-lighten-1"
                class="text-none px-0 font-weight-bold"
                @click="router.push('/profile/artists')"
              >
                <v-icon start size="16">mdi-arrow-left</v-icon>
                Artistas
              </v-btn>
            </div>

            <p class="header-eyebrow">
              {{ activeArtistFilter ? "DISCOGRAFÍA" : "BIBLIOTECA" }}
            </p>
            <h1 class="header-title">{{ filteredArtistName || "Álbumes" }}</h1>
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
                  :color="!activeArtistFilter ? '#1265FF' : 'transparent'"
                  class="text-none rounded-pill font-weight-bold px-4"
                  :class="!activeArtistFilter ? 'text-white' : 'text-grey'"
                  @click="activeArtistFilter = null"
                >
                  Todos
                </v-btn>
                <v-btn
                  v-for="artist in musicStore.artists"
                  :key="artist.id"
                  variant="flat"
                  size="x-small"
                  :color="
                    activeArtistFilter === artist.id ? '#1265FF' : 'transparent'
                  "
                  class="text-none rounded-pill font-weight-bold px-4"
                  :class="
                    activeArtistFilter === artist.id
                      ? 'text-white'
                      : 'text-grey'
                  "
                  @click="toggleArtistFilter(artist.id)"
                >
                  {{ artist.name }}
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
                placeholder="Buscar álbum..."
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

          <v-row v-if="filteredAlbums.length > 0">
            <v-col
              v-for="album in filteredAlbums"
              :key="album.id"
              cols="12"
              sm="4"
              md="3"
              lg="2"
            >
              <AlbumCard
                :album="album"
                :artist-name="resolveArtist(album.artistId).name"
                :artist-image="resolveArtist(album.artistId).image"
                @edit="openEditDialog(album)"
                @delete="confirmRemove(album)"
              />
            </v-col>
          </v-row>

          <div v-else class="text-center py-16">
            <v-icon size="48" color="rgba(255,255,255,0.1)">mdi-album</v-icon>
            <p class="text-grey mt-4 mb-6">No hay álbumes en tu biblioteca</p>
            <router-link to="/profile/explore" class="empty-btn">
              Explorar álbumes
            </router-link>
          </div>
        </div>

        <TheFooter class="mt-12" />
      </v-container>
    </v-main>

    <AlbumDialog v-model="dialogOpen" :album="editingAlbum" @save="saveAlbum" />

    <v-dialog v-model="deleteDialog" max-width="350">
      <v-card
        class="bg-grey-darken-4 pa-5 rounded-xl text-center border-sm"
        style="border-color: rgba(255, 255, 255, 0.1) !important"
      >
        <v-icon color="error" size="48" class="mb-4"
          >mdi-alert-circle-outline</v-icon
        >
        <h3 class="text-white text-h6 font-weight-black mb-2">
          ¿Eliminar álbum?
        </h3>
        <p class="text-grey text-body-2 mb-6">
          Esta acción borrará el álbum de tu biblioteca. No se puede deshacer.
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
 * @file AlbumsView.vue
 * @description Vista principal de gestión de álbumes.
 * Permite listar, filtrar por artista, buscar por título y ordenar cronológica o alfabéticamente.
 */

import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useMusicStore } from "../stores/music";
import { useAlbumFilters } from "../composables/useAlbumFilters";

import TheNavigationDock from "../components/layout/TheNavigationDock.vue";
import TheFooter from "../components/layout/TheFooter.vue";
import AlbumCard from "../components/albums/AlbumCard.vue";
import AlbumDialog from "../components/albums/AlbumDialog.vue";

const route = useRoute();
const router = useRouter();
const musicStore = useMusicStore();

// Obtenemos el ID del artista desde la URL si existe (para discografías filtradas)
const routeArtistId = route.params.id ? Number(route.params.id) : null;

// Lógica de filtrado y ordenación delegada al composable
const {
  searchQuery,
  activeArtistFilter,
  filteredAlbums,
  currentSort,
  cycleSortMode,
  toggleArtistFilter,
} = useAlbumFilters(routeArtistId);

/** Estados para el flujo de edición y borrado */
const dialogOpen = ref(false);
const deleteDialog = ref(false);
const editingAlbum = ref(null);
const albumToDelete = ref(null);

/**
 * Resuelve el nombre del artista seleccionado para el título de la página.
 */
const filteredArtistName = computed(() => {
  if (!activeArtistFilter.value) return null;
  const artist = musicStore.artists.find(
    (a) => a.id === activeArtistFilter.value,
  );
  return artist?.name || null;
});

/**
 * Mapeo de estilos para el botón de ordenación.
 */
const sortUI = computed(() => {
  const modes = {
    "title-asc": { icon: "mdi-sort-alphabetical-ascending", label: "A-Z" },
    "title-desc": { icon: "mdi-sort-alphabetical-descending", label: "Z-A" },
    "year-desc": { icon: "mdi-calendar", label: "Recientes" },
    "year-asc": { icon: "mdi-calendar-outline", label: "Antiguos" },
  };
  return modes[currentSort.value] || modes["title-asc"];
});

/**
 * Obtiene los metadatos del artista propietario del álbum.
 * @param {number} id - ID del artista
 * @returns {Object} Nombre e imagen
 */
function resolveArtist(id) {
  const artist = musicStore.artists.find((a) => a.id === id);
  return { name: artist?.name || "Desconocido", image: artist?.image };
}

function openCreateDialog() {
  editingAlbum.value = null;
  dialogOpen.value = true;
}

function openEditDialog(album) {
  editingAlbum.value = album;
  dialogOpen.value = true;
}

/**
 * Persiste los cambios del álbum en el store de Pinia.
 * @param {Object} payload - Datos del álbum
 */
function saveAlbum(payload) {
  if (payload.id) {
    musicStore.updateAlbum(
      payload.id,
      payload.title,
      payload.artistId,
      payload.year,
    );
  } else {
    musicStore.addAlbum(payload.title, payload.artistId, payload.year);
  }
}

/**
 * Abre el diálogo de confirmación de borrado.
 */
function confirmRemove(album) {
  albumToDelete.value = album;
  deleteDialog.value = true;
}

/**
 * Ejecuta el borrado definitivo.
 */
function executeDelete() {
  if (albumToDelete.value) {
    musicStore.deleteAlbum(albumToDelete.value.id);
  }
  deleteDialog.value = false;
  albumToDelete.value = null;
}
</script>

<style scoped>
/* Contenedor optimizado para visualización en escritorio con el Dock lateral */
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

/* Buscador minimalista con bordes integrados */
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
