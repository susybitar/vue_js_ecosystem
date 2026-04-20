<template>
  <section v-if="artists.length > 0" class="profile-section">
    <div class="section-header">
      <h2 class="section-title">Tus artistas</h2>
      <router-link to="/profile/artists" class="section-link">
        Ver todos
      </router-link>
    </div>

    <div class="artist-scroll">
      <router-link
        v-for="artist in artists"
        :key="artist.id"
        :to="`/profile/artists/${artist.id}/albums`"
        class="artist-bubble"
      >
        <div class="bubble-img-wrap">
          <v-img
            :src="resolveArtistImage(artist)"
            cover
            aspect-ratio="1"
            class="bubble-img"
          />
        </div>
        <p class="bubble-name">{{ artist.name }}</p>
      </router-link>
    </div>
  </section>
</template>

<script setup>
/**
 * @file ArtistBubbles.vue
 * @description Carrusel horizontal de artistas en formato circular.
 * Se usa en el dashboard principal para dar acceso rápido a las discografías.
 */

/**
 * Propiedades del componente
 * @param {Array} artists - Lista de objetos artista a renderizar
 */
defineProps({
  artists: { type: Array, required: true },
});

/**
 * Resuelve la imagen del artista. Si no tiene foto propia, genera una de Unsplash
 * usando el nombre como semilla (sig) para que la imagen sea consistente.
 * @param {object} artist - Objeto con los datos del artista
 * @returns {string} URL final de la imagen
 */
function resolveArtistImage(artist) {
  if (artist.image) return artist.image;
  return `https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&fit=crop&sig=${encodeURIComponent(artist.name)}`;
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

/* Contenedor con scroll horizontal oculto */
.artist-scroll {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.artist-scroll::-webkit-scrollbar {
  display: none;
}

.artist-bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

/* Envoltura circular con transición de borde y escala en hover */
.bubble-img-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s ease;
}

.artist-bubble:hover .bubble-img-wrap {
  border-color: #1265ff;
  transform: scale(1.08);
  box-shadow: 0 0 20px rgba(18, 101, 255, 0.25);
}

.bubble-img {
  width: 100%;
  height: 100%;
}

.bubble-name {
  font-family: "Montserrat", sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  transition: color 0.2s;
}
.artist-bubble:hover .bubble-name {
  color: #ffffff;
}
</style>
