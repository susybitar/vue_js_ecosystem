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
 * @description Tarjeta del Explorer. Sirve para artistas, álbumes y canciones;
 * adapta qué botón overlay enseña según `type`: para artista/álbum, botón
 * "añadir a biblioteca"; para track, botón "play" del preview de 30s. El JSON
 * de Deezer tiene claves distintas según el tipo (`name` vs `title`,
 * `picture_*` vs `cover_*`), así que normalizo cover/title/detail en computeds
 * para que el template no tenga condicionales.
 *
 * @prop {Object} item - Payload crudo de la API de Deezer.
 * @prop {"artist"|"album"|"track"} type - Qué estoy pintando.
 * @prop {boolean} [inLibrary=false] - true → el usuario ya lo tiene guardado.
 * @prop {boolean} [playing=false] - true → el preview de audio está sonando.
 * @fires add - Guardar en biblioteca (artista o álbum; no aplica a tracks).
 * @fires preview - Play/pause del preview (sólo tracks).
 * @fires select - Click en la tarjeta (lo uso para la navegación rápida).
 */

import { computed } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
  type: { type: String, required: true },
  inLibrary: { type: Boolean, default: false },
  playing: { type: Boolean, default: false },
});

defineEmits(["add", "preview", "select"]);

/**
 * Imagen en la mejor resolución disponible. Deezer la sirve en 3 tamaños;
 * prefiero `_big` y si no tiro de `_medium`. Para tracks la imagen cuelga
 * del álbum, no del track directamente.
 */
const cover = computed(() => {
  if (props.type === "artist")
    return props.item.picture_big || props.item.picture_medium;
  if (props.type === "album")
    return props.item.cover_big || props.item.cover_medium;
  return props.item.album?.cover_big || props.item.album?.cover_medium;
});

/** Título principal. Artista → `name`, resto → `title`. */
const title = computed(() => {
  if (props.type === "artist") return props.item.name;
  return props.item.title;
});

/** Saca sólo el año del `release_date` (formato YYYY-MM-DD de Deezer). */
const releaseYear = computed(() => {
  if (!props.item.release_date) return null;
  return Number(props.item.release_date.slice(0, 4)) || null;
});

/**
 * Subtítulo bajo el título. Junta los datos que haya disponibles con "·"
 * entre medias. Filtro los `falsy` antes del join para no dejar separadores
 * sueltos cuando a un álbum le falta el año o a un track le falta el álbum.
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
