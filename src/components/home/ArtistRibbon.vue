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
 * @description Cinta animada infinita (marquee) que expone los álbumes top del momento. Sirve de escaparate visual dinámico para la landing.
 */

import { computed, ref, onMounted } from "vue";
import { useDeezerApi } from "../../composables/useDeezerApi";

// Consumimos el composable global para reutilizar la lógica de red
const { fetchTrendingAlbums } = useDeezerApi();

/**
 * Almacena los resultados limpios de la API.
 * Empieza vacío para no bloquear el renderizado inicial del template.
 */
const artists = ref([]);

/**
 * Pedimos los datos en cuanto el componente toca el DOM.
 * Mapeamos el JSON gigante de Deezer a un objeto ligero solo con lo que pintamos.
 * Priorizamos la imagen de máxima calidad (cover_xl) si existe.
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
 * Truco matemático para el scroll infinito CSS.
 * Duplicamos el array exacto sobre sí mismo para que, cuando el primer set de tarjetas salga por la izquierda, el clon ya esté cubriendo el hueco.
 * @returns {Array} Lista doble de álbumes lista para el loop continuo
 */
const marqueeItems = computed(() => {
  if (artists.value.length === 0) return [];
  return [...artists.value, ...artists.value];
});
</script>

<style scoped>
/* CABECERA EDITORIAL (Igual que antes) */
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

/* CONTENEDOR Y ANIMACIÓN */
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
  gap: 20px; /* Separación Apple Music */
  width: max-content;
  will-change: transform;
  animation: marquee 40s linear infinite;
}

.artist-ribbon:hover .marquee-track {
  animation-play-state: paused;
}

/* LA TARJETA (ESTRUCTURA APPLE MUSIC) */
.ribbon-card {
  flex: 0 0 240px; /* Ancho fijo de la tarjeta */
  max-width: 240px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

/* CONTENEDOR DE LA PORTADA (1:1) */
.album-cover {
  width: 100%;
  aspect-ratio: 1 / 1; /* Cuadrado perfecto */
  border-radius: 12px; /* Redondeado suave de Apple */
  overflow: hidden;
  background: #e2e8f0;
  box-shadow: 0 4px 12px rgba(10, 39, 92, 0.08); /* Sombra de profundidad */
  transition:
    transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.3s ease;
  margin-bottom: 12px; /* Separación con el texto */
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* HOVER */
.ribbon-card:hover .album-cover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(10, 39, 92, 0.15);
}

/* INFORMACIÓN DE TEXTO */
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

/* MATEMÁTICA DEL LOOP */
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
