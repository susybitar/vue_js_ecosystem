<template>
  <v-card
    class="explore-card"
    color="transparent"
    variant="flat"
    :ripple="false"
    @click="$emit('select', item)"
  >
    <div class="card-cover">
      <v-img :src="cover" cover aspect-ratio="1" class="cover-img" />

      <div v-if="type !== 'track'" class="cover-add">
        <button
          class="add-to-lib-btn"
          :class="{ added: inLibrary }"
          :disabled="inLibrary"
          @click.stop="$emit('add')"
        >
          <v-icon size="16">{{ inLibrary ? "mdi-check" : "mdi-plus" }}</v-icon>
        </button>
      </div>

      <div
        v-if="type === 'track' && item.preview"
        class="cover-play"
        @click.stop="$emit('preview')"
      >
        <v-icon size="36" color="white">
          {{ playing ? "mdi-pause-circle" : "mdi-play-circle" }}
        </v-icon>
      </div>
    </div>

    <div class="card-info">
      <p class="card-name" :title="title">{{ title }}</p>
      <p class="card-detail" :title="detail">{{ detail }}</p>
    </div>
  </v-card>
</template>

<script setup>
/**
 * @file ExploreCard.vue
 * @description Tarjeta multiuso para la sección de exploración. Adapta su diseño y botones según si muestra un artista, un álbum o una canción.
 */

import { computed } from "vue";

/**
 * Datos y estado visual que recibe la tarjeta
 * @param {Object} item - Datos crudos devueltos por la API (Deezer)
 * @param {string} type - Define el tipo de contenido ('artist', 'album', 'track')
 * @param {boolean} [inLibrary=false] - Marca si el usuario ya lo tiene guardado
 * @param {boolean} [playing=false] - Indica si el fragmento de audio está sonando en este momento
 */
const props = defineProps({
  item: { type: Object, required: true },
  type: { type: String, required: true },
  inLibrary: { type: Boolean, default: false },
  playing: { type: Boolean, default: false },
});

/**
 * Acciones del usuario
 * @fires add - Pide guardar el álbum o artista en la biblioteca
 * @fires preview - Alterna el play/pausa del fragmento de audio (solo pistas)
 * @fires select - Navega al detalle del elemento al pinchar la tarjeta
 */
defineEmits(["add", "preview", "select"]);

/**
 * Extrae la imagen en la mejor calidad posible.
 * La estructura del JSON cambia dependiendo de si pedimos un artista, álbum o canción.
 */
const cover = computed(() => {
  if (props.type === "artist")
    return props.item.picture_big || props.item.picture_medium;
  if (props.type === "album")
    return props.item.cover_big || props.item.cover_medium;
  return props.item.album?.cover_big || props.item.album?.cover_medium;
});

/**
 * Normaliza el nombre principal. Los artistas usan la clave 'name', el resto usa 'title'.
 */
const title = computed(() => {
  if (props.type === "artist") return props.item.name;
  return props.item.title;
});

/**
 * Saca solo el año (YYYY) de la fecha completa (YYYY-MM-DD) que manda la API.
 */
const releaseYear = computed(() => {
  if (!props.item.release_date) return null;
  return Number(props.item.release_date.slice(0, 4)) || null;
});

/**
 * Monta el subtítulo descriptivo uniendo los datos disponibles de forma dinámica.
 * Filtra los campos nulos (Boolean) para no dejar viñetas (·) sueltas en el texto.
 */
const detail = computed(() => {
  if (props.type === "artist") {
    const albums = props.item.nb_album
      ? `${props.item.nb_album} álbumes`
      : "Artista";
    return albums;
  }
  if (props.type === "album") {
    const parts = [props.item.artist?.name].filter(Boolean);
    if (releaseYear.value) parts.push(String(releaseYear.value));
    if (props.item.nb_tracks) parts.push(`${props.item.nb_tracks} canciones`);
    return parts.join(" · ");
  }
  const parts = [props.item.artist?.name];
  if (props.item.album?.title) parts.push(props.item.album.title);
  return parts.filter(Boolean).join(" · ");
});
</script>

<style scoped>
.explore-card {
  cursor: pointer;
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 12px;
  overflow: hidden;
  background: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}
.explore-card:hover .card-cover {
  transform: translateY(-4px);
}
.cover-img {
  width: 100%;
  height: 100%;
}
.cover-add {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.2s;
  background: rgba(0, 0, 0, 0.2);
}
.explore-card:hover .cover-add {
  opacity: 1;
}
.add-to-lib-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: white;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.add-to-lib-btn.added {
  background: #4caf50;
  color: white;
}
.cover-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s;
}
.explore-card:hover .cover-play {
  opacity: 1;
}
.card-name {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.card-detail {
  font-family: "Roboto", sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
