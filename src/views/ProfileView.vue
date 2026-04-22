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
 * @description Dashboard del usuario ya logueado. Mezcla lo suyo (biblioteca
 * local del MusicStore) con una tira de tendencias globales que pido a Deezer.
 * El propio componente es básicamente un montaje de strips/grids; la lógica
 * aquí sólo arma los slices que paso a cada uno.
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

/** Tendencias de Deezer. Se rellena en onMounted. */
const trending = ref([]);

/** Primer nombre para el saludo. Fallback a "Usuario" si no hay. */
const userName = computed(
  () => authStore.currentUser?.name?.split(" ")[0] || "Usuario",
);

/**
 * Últimos 10 artistas añadidos a la biblioteca. Invierto el array porque el
 * store los guarda en orden de adición y aquí quiero mostrar los más nuevos
 * arriba.
 */
const recentArtists = computed(() =>
  [...musicStore.artists].reverse().slice(0, 10),
);

/** Últimos 6 álbumes añadidos, por la misma razón que los artistas. */
const recentAlbums = computed(() =>
  [...musicStore.albums].reverse().slice(0, 6),
);

/**
 * Biblioteca vacía → enseño el empty state con CTA para añadir. Miro las dos
 * colecciones porque alguien podría tener sólo álbumes y ningún artista, o
 * al revés.
 */
const isLibraryEmpty = computed(
  () => musicStore.artists.length === 0 && musicStore.albums.length === 0,
);

/**
 * Al montar disparo la petición de tendencias. No pongo loading explícito:
 * mientras llega, el strip enseña skeletons.
 */
onMounted(async () => {
  trending.value = await fetchTrendingAlbums(10);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap");

/* Fondo negro puro de la zona privada. Quiero cero distracciones aquí. */
.pitch-black-workspace {
  background: #000;
  min-height: 100vh;
}
.main-bg {
  background: #000 !important;
}

/* Padding izquierdo alto (120px) para dejar sitio al dock lateral fijo. */
.profile-container {
  padding: 48px 48px 48px 120px !important;
  max-width: 1400px;
  margin: 0 auto;
}

/* En móvil el dock se achica y puedo reducir el padding izquierdo. */
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

/* Cabecera con eyebrow azul + título gigante. */
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
