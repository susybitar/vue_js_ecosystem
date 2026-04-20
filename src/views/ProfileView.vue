<template>
  <v-layout class="pitch-black-workspace">
    <TheNavigationDock />

    <v-main class="main-bg">
      <v-container fluid class="profile-container">
        <header class="profile-header">
          <p class="header-eyebrow">CATÁLOGO DIGITAL</p>
          <h1 class="header-title">Hola, {{ userName }}</h1>
        </header>

        <ProfileTrendingStrip :items="trending" />

        <ArtistBubbleStrip :artists="recentArtists" />

        <RecentAlbumsGrid :albums="recentAlbums" />

        <ProfileEmptyState v-if="isLibraryEmpty" />

        <TheFooter />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
/**
 * @file ProfileView.vue
 * @description Dashboard principal del usuario autenticado.
 * Orquesta la visualización de la biblioteca personal mezclando datos locales (MusicStore)
 * con datos globales de tendencias (Deezer API).
 */

import { computed, ref, onMounted } from "vue";

import { useAuthStore } from "../stores/auth";
import { useMusicStore } from "../stores/music";
import { useDeezerApi } from "../composables/useDeezerApi";

import TheNavigationDock from "../components/layout/TheNavigationDock.vue";
import TheFooter from "../components/layout/TheFooter.vue";
import ProfileTrendingStrip from "../components/profile/ProfileTrendingStrip.vue";
import ArtistBubbleStrip from "../components/profile/ArtistBubbleStrip.vue";
import RecentAlbumsGrid from "../components/profile/RecentAlbumsGrid.vue";
import ProfileEmptyState from "../components/profile/ProfileEmptyState.vue";

const authStore = useAuthStore();
const musicStore = useMusicStore();
const { fetchTrendingAlbums } = useDeezerApi();

/** Estado para almacenar los álbumes populares de la API global. */
const trending = ref([]);

/** * Obtiene el nombre de pila del usuario.
 * @returns {string}
 */
const userName = computed(
  () => authStore.currentUser?.name?.split(" ")[0] || "Usuario",
);

/** * Selecciona los 10 artistas añadidos más recientemente.
 * Se invierte la lista original del store para priorizar la novedad.
 */
const recentArtists = computed(() =>
  [...musicStore.artists].reverse().slice(0, 10),
);

/** * Selecciona los 6 álbumes más recientes para la vista previa del dashboard.
 */
const recentAlbums = computed(() =>
  [...musicStore.albums].reverse().slice(0, 6),
);

/** * Flag para determinar si el usuario necesita ver el mensaje de bienvenida inicial.
 * @returns {boolean}
 */
const isLibraryEmpty = computed(
  () => musicStore.artists.length === 0 && musicStore.albums.length === 0,
);

/**
 * Hook de montaje: Inicializa la carga de datos externos.
 */
onMounted(async () => {
  trending.value = await fetchTrendingAlbums(10);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap");

/* Layout Pitch Black: Negro puro para eliminar distracciones visuales */
.pitch-black-workspace {
  background: #000;
  min-height: 100vh;
}
.main-bg {
  background: #000 !important;
}

/* Espaciado del contenedor adaptado a la presencia del Dock lateral fijo (120px) */
.profile-container {
  padding: 48px 48px 48px 120px !important;
  max-width: 1400px;
  margin: 0 auto;
}

/* Ajustes de responsividad para el padding lateral en pantallas pequeñas */
@media (max-width: 960px) {
  .profile-container {
    padding: 32px 24px 32px 100px !important;
  }
}

@media (max-width: 600px) {
  .profile-container {
    padding: 24px 16px 24px 85px !important;
  }
}

/* --- ESTILOS DE CABECERA --- */
.profile-header {
  margin-bottom: 48px;
}

.header-eyebrow {
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1265ff;
  margin-bottom: 8px;
}

.header-title {
  font-family: "Montserrat", sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1;
}
</style>
