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

    <ConfirmDialog
      v-model="deleteDialog"
      title="¿Eliminar álbum?"
      message="Esta acción borrará el álbum de tu biblioteca. No se puede deshacer."
      confirm-label="Eliminar"
      @confirm="executeDelete"
    />
  </v-layout>
</template>

<script setup>
/**
 * @file AlbumsView.vue
 * @description Lista de álbumes del usuario con filtros por artista, búsqueda
 * por título y ordenación. Casi toda la lógica "dura" (filtro + búsqueda +
 * ordenación) está en `useAlbumFilters` para no ensuciar la vista; aquí me
 * quedo con el CRUD y los diálogos. Si la URL trae `:id`, uso ese id como
 * filtro inicial por artista (discografía).
 */

import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useMusicStore } from "../stores/music";
import { useAlbumFilters } from "../composables/useAlbumFilters";

import TheNavigationDock from "../components/layout/TheNavigationDock.vue";
import TheFooter from "../components/layout/TheFooter.vue";
import AlbumCard from "../components/albums/AlbumCard.vue";
import AlbumDialog from "../components/albums/AlbumDialog.vue";
import ConfirmDialog from "../components/ui/ConfirmDialog.vue";

const route = useRoute();
const router = useRouter();
const musicStore = useMusicStore();

// Si vengo de "Artistas → ver discografía", la ruta trae el id del artista.
const routeArtistId = route.params.id ? Number(route.params.id) : null;

const {
  searchQuery,
  activeArtistFilter,
  filteredAlbums,
  currentSort,
  cycleSortMode,
  toggleArtistFilter,
} = useAlbumFilters(routeArtistId);

// Estado local de los diálogos (crear/editar + confirmar borrado).
const dialogOpen = ref(false);
const deleteDialog = ref(false);
const editingAlbum = ref(null);
const albumToDelete = ref(null);

/**
 * Nombre del artista que filtra la vista (si lo hay). Se pinta en el título
 * grande de la cabecera. Si no hay filtro, el título pasa a "Álbumes".
 */
const filteredArtistName = computed(() => {
  if (!activeArtistFilter.value) return null;
  const artist = musicStore.artists.find(
    (a) => a.id === activeArtistFilter.value,
  );
  return artist?.name || null;
});

/**
 * Mapea el modo de ordenación actual a un icono y una etiqueta. Lo uso en el
 * botón que cicla los modos; así no tengo un `v-if` por cada opción.
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
 * Devuelve nombre + imagen del artista al que pertenece un álbum. Lo paso a
 * cada AlbumCard para que pueda pintar la autoría sin tener que buscar en el
 * store por su cuenta.
 *
 * @param {number} id - Id del artista dueño del álbum.
 * @returns {{ name: string, image?: string }} Datos mínimos para la card.
 */
function resolveArtist(id) {
  const artist = musicStore.artists.find((a) => a.id === id);
  return { name: artist?.name || "Desconocido", image: artist?.image };
}

/** Abre el modal en modo "crear álbum". */
function openCreateDialog() {
  editingAlbum.value = null;
  dialogOpen.value = true;
}

/** Abre el modal en modo "editar" con un álbum ya existente. */
function openEditDialog(album) {
  editingAlbum.value = album;
  dialogOpen.value = true;
}

/**
 * Handler del evento `save` del AlbumDialog. Si llega con `id`, es edición;
 * si no, creación.
 *
 * @param {{ id?: number, title: string, artistId: number, year: number }} payload
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

/** Guarda el álbum objetivo y abre el diálogo de confirmación de borrado. */
function confirmRemove(album) {
  albumToDelete.value = album;
  deleteDialog.value = true;
}

/**
 * Borrado definitivo. El ConfirmDialog se cierra solo tras emitir `confirm`,
 * así que aquí sólo me ocupo del store y de limpiar el álbum objetivo.
 */
function executeDelete() {
  if (albumToDelete.value) {
    musicStore.deleteAlbum(albumToDelete.value.id);
  }
  albumToDelete.value = null;
}
</script>

<style scoped>
/* Padding izquierdo grande para dejar sitio al dock fijo de la izquierda. */
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

/* Buscador. El borde apenas se ve hasta que recibe focus. */
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
