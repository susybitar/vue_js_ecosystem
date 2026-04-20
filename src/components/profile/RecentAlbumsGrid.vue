<template>
  <section v-if="albums.length > 0" class="profile-section">
    <div class="section-header">
      <h2 class="section-title">Últimos álbumes</h2>
      <router-link to="/profile/albums" class="section-link">
        Ver todos
      </router-link>
    </div>

    <v-row class="mx-n4">
      <v-col
        v-for="album in albums"
        :key="album.id"
        cols="6"
        sm="4"
        md="3"
        lg="2"
        class="pa-4"
      >
        <router-link
          :to="`/profile/artists/${album.artistId}/albums`"
          class="album-card"
        >
          <div class="card-cover">
            <v-img
              :src="resolveCover(album)"
              cover
              aspect-ratio="1"
              class="cover-img"
            />
          </div>
          <div class="card-info">
            <p class="card-name" :title="album.title">{{ album.title }}</p>
            <p class="card-detail">{{ resolveArtistName(album.artistId) }}</p>
          </div>
        </router-link>
      </v-col>
    </v-row>
  </section>
</template>

<script setup>
/**
 * @file RecentAlbumsGrid.vue
 * @description Componente que renderiza una rejilla de álbumes.
 * Se encarga de buscar los nombres de los artistas y resolver las portadas
 * tirando del store o de fallbacks externos.
 */

import { useMusicStore } from "../../stores/music";

/**
 * Propiedades del componente
 * @param {Array} albums - Colección de álbumes a mostrar en el grid
 */
defineProps({
  albums: { type: Array, required: true },
});

const musicStore = useMusicStore();

/**
 * Lógica para determinar qué imagen mostrar en la carátula.
 * Sigue un orden de prioridad: portada del disco > imagen del artista > fallback genérico.
 * @param {object} album - Objeto con la información del álbum
 * @returns {string} URL de la imagen resultante
 */
function resolveCover(album) {
  if (album.cover) return album.cover;

  const artist = musicStore.artists.find((a) => a.id === album.artistId);
  if (artist?.image) return artist.image;

  // Si no hay nada, devolvemos una imagen por defecto usando el artistId como semilla
  return `https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&fit=crop&sig=${album.artistId}`;
}

/**
 * Busca en el store de música el nombre del artista asociado al álbum.
 * @param {number} artistId - ID del artista a buscar
 * @returns {string} Nombre del artista o 'Desconocido' si no se encuentra
 */
function resolveArtistName(artistId) {
  const artist = musicStore.artists.find((a) => a.id === artistId);
  return artist?.name || "Desconocido";
}
</script>

<style scoped>
.profile-section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.section-link {
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  transition: color 0.2s;
}
.section-link:hover {
  color: #5a9aff;
}

.album-card {
  display: block;
  text-decoration: none;
  cursor: pointer;
}

/* Efecto visual de profundidad y zoom suave al interactuar con la tarjeta */
.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  margin-bottom: 12px;
  transition:
    transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.3s ease;
}

.album-card:hover .card-cover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
}

.cover-img {
  width: 100%;
  height: 100%;
}

.card-info {
  padding: 0 2px;
}

.card-name {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-detail {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
