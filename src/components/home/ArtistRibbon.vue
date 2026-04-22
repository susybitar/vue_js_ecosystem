<template>
  <section class="artist-ribbon" aria-label="Catálogo de artistas">
    <v-container class="ribbon-header px-4">
      <h2 class="ribbon-title">Tu catálogo, al milímetro</h2>
      <p class="ribbon-subtitle">
        Visualiza, audita y gestiona el inventario de artistas de tu colección
        con precisión profesional.
      </p>
    </v-container>

    <div class="ribbon-viewport">
      <div class="marquee-track">
        <div
          class="ribbon-card"
          v-for="(item, index) in marqueeItems"
          :key="`ribbon-${index}`"
        >
          <div class="album-cover">
            <img :src="item.image" :alt="`${item.artist} — ${item.album}`" />
          </div>

          <div class="album-info">
            <p class="artist-name" :title="item.artist">{{ item.artist }}</p>
            <p class="album-name" :title="item.album">{{ item.album }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * @file ArtistRibbon.vue
 * @description Cinta tipo marquee con los álbumes en tendencia de Deezer.
 * Se usa en la landing como escaparate vivo — la idea es que alguien que
 * abre la home vea que la app "respira" con música real y no con mocks.
 */

import { computed, ref, onMounted } from "vue";
import { useDeezerApi } from "../../composables/useDeezerApi";

const { fetchTrendingAlbums } = useDeezerApi();

/** Álbumes normalizados para el marquee. Arranca vacío (el template ya lo soporta). */
const artists = ref([]);

/**
 * Traigo 15 álbumes al montar y me quedo sólo con lo que pinto (artista,
 * título, imagen). Tiro de `cover_xl` si existe — en la cinta el marquee se
 * ve grande y las imágenes de menos calidad cantan mucho.
 */
onMounted(async () => {
  const data = await fetchTrendingAlbums(15);
  artists.value = data.map((album) => ({
    artist: album.artist.name,
    album: album.title,
    image: album.cover_xl || album.cover_medium || album.cover,
  }));
});

/**
 * Truco clásico del marquee infinito: duplico la lista sobre sí misma para
 * que cuando la animación CSS traslada -50%, el segundo bloque entra justo
 * donde estaba el primero y el bucle no tiene costura.
 */
const marqueeItems = computed(() => {
  if (artists.value.length === 0) return [];
  return [...artists.value, ...artists.value];
});
</script>

<style scoped>
/* Cabecera del ribbon: título + subtítulo centrados. */
.ribbon-header {
  text-align: center;
  margin-bottom: 40px;
}

.ribbon-title {
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: 2.2rem;
  color: #0a275c;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 12px;
}

.ribbon-subtitle {
  font-family: "Roboto", sans-serif;
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
}

/* Viewport del marquee. El mask de los laterales hace que las tarjetas
   "desaparezcan" suavemente en los bordes en lugar de cortarse a pelo. */
.artist-ribbon {
  width: 100%;
  padding: 20px 0 80px 0;
  background: transparent;
  overflow: hidden;
}

.ribbon-viewport {
  width: 100%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
}

.marquee-track {
  display: flex;
  gap: 20px;
  width: max-content;
  will-change: transform;
  animation: marquee 40s linear infinite;
}

.artist-ribbon:hover .marquee-track {
  animation-play-state: paused;
}

/* Tarjeta del ribbon: ancho fijo para que el marquee avance a ritmo constante. */
.ribbon-card {
  flex: 0 0 240px;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

/* Portada cuadrada con sombra sutil. */
.album-cover {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #e2e8f0;
  box-shadow: 0 4px 12px rgba(10, 39, 92, 0.08);
  transition:
    transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.3s ease;
  margin-bottom: 12px;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Al hover, la tarjeta sube un poco y la sombra se intensifica. */
.ribbon-card:hover .album-cover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(10, 39, 92, 0.15);
}

/* Texto bajo la portada (artista + álbum). */
.album-info {
  width: 100%;
  padding: 0 2px;
}

.artist-name {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #0a275c;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-name {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Loop infinito. Llego hasta -50% (mitad del track) porque la lista está
   duplicada; al completar el ciclo, la imagen coincide visualmente con el
   inicio y no hay "salto". El -10px compensa el gap entre tarjetas. */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - 10px));
  }
}

@media (max-width: 960px) {
  .marquee-track {
    gap: 16px;
  }
  .ribbon-card {
    flex: 0 0 180px;
    max-width: 180px;
  }
  .ribbon-title {
    font-size: 1.75rem;
  }
  @keyframes marquee {
    100% {
      transform: translateX(calc(-50% - 8px));
    }
  }
}
</style>
