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
 * @description Rejilla "últimos álbumes" del dashboard del perfil. Resuelvo
 * aquí la portada y el nombre del artista para no meter esa lógica en el
 * template. Pinchar un álbum lleva directamente a la discografía del
 * artista — es el atajo que más uso yo mismo.
 *
 * @prop {Array} albums - Álbumes que pinto (el padre ya los recorta a 6).
 */

import { useMusicStore } from "../../stores/music";

defineProps({
  albums: { type: Array, required: true },
});

const musicStore = useMusicStore();

/**
 * Decide qué imagen mostrar en la portada siguiendo este orden:
 *   1. Si el álbum tiene `cover` propia (añadido vía Explore), esa.
 *   2. Si no, la imagen del artista (mejor eso que nada).
 *   3. Si tampoco, placeholder de Unsplash, usando `artistId` como `sig` para
 *      que cada artista mantenga siempre la misma foto aleatoria.
 */
function resolveCover(album) {
  if (album.cover) return album.cover;

  const artist = musicStore.artists.find((a) => a.id === album.artistId);
  if (artist?.image) return artist.image;

  return `https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&fit=crop&sig=${album.artistId}`;
}

/**
 * Nombre del artista del álbum. Si no lo encuentro en el store (puede pasar
 * con datos importados o con algún estado intermedio), caigo a "Desconocido"
 * para no dejar la card con una línea en blanco.
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

/* Portada cuadrada con sombra. Al hover, sube ligeramente + intensifica sombra. */
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
