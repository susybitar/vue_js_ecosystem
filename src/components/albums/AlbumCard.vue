<template>
  <v-card class="album-card bg-transparent" flat @click="$emit('click')">
    <v-hover v-slot="{ isHovering, props }">
      <div v-bind="props" class="card-cover-wrapper position-relative">
        <v-img
          :src="
            album.cover ||
            'https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=500&fit=crop'
          "
          cover
          aspect-ratio="1"
          class="rounded-lg album-img bg-grey-darken-4"
        >
          <div
            v-if="isHovering"
            class="cover-overlay d-flex justify-end align-start pa-2"
          >
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              color="white"
              class="mr-1 text-black"
              @click.stop="$emit('edit', album)"
            />
            <v-btn
              icon="mdi-trash-can"
              size="x-small"
              color="error"
              @click.stop="$emit('delete', album)"
            />
          </div>
        </v-img>
      </div>
    </v-hover>
    <v-card-text class="pa-2">
      <p class="text-subtitle-1 font-weight-bold text-white mb-0 text-truncate">
        {{ album.title }}
      </p>
      <p class="text-caption text-grey text-truncate">
        <span class="text-uppercase">{{ artistName }}</span>
        <span v-if="album.year"> · {{ album.year }}</span>
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
/**
 * @file AlbumCard.vue
 * @description Tarjeta visual para mostrar un álbum. Incluye controles de edición y borrado al hacer hover.
 */

/**
 * Datos que recibe el componente
 * @param {Object} album - Objeto con los datos del álbum (title, cover, year, etc.)
 * @param {string} [artistName="Desconocido"] - Nombre del artista para mostrar debajo del título
 */
defineProps({
  album: { type: Object, required: true },
  artistName: { type: String, default: "Desconocido" },
});

/**
 * Eventos que lanza la tarjeta
 * @fires click - Al hacer clic en cualquier parte de la tarjeta
 * @fires edit - Al pulsar el botón de editar. Devuelve el objeto album
 * @fires delete - Al pulsar el botón de borrar. Devuelve el objeto album
 */
defineEmits(["click", "edit", "delete"]);
</script>

<style scoped>
.album-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.album-card:hover {
  transform: translateY(-4px);
}
.cover-overlay {
  background: rgba(0, 0, 0, 0.4);
  height: 100%;
  transition: 0.3s;
}

.text-black :deep(.v-icon) {
  color: black !important;
}
</style>
