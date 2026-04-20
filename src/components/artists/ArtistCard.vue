<template>
  <v-card class="artist-card bg-transparent" flat @click="$emit('click')">
    <v-hover v-slot="{ isHovering, props }">
      <div v-bind="props" class="card-cover-wrapper position-relative">
        <v-img
          :src="
            artist.image ||
            'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&fit=crop'
          "
          cover
          aspect-ratio="1"
          class="rounded-lg artist-img"
        >
          <div
            v-if="isHovering"
            class="cover-overlay d-flex justify-end align-start pa-2"
          >
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              color="white"
              class="mr-1"
              @click.stop="$emit('edit', artist)"
            />
            <v-btn
              icon="mdi-trash-can"
              size="x-small"
              color="error"
              @click.stop="$emit('delete', artist)"
            />
          </div>
        </v-img>
      </div>
    </v-hover>
    <v-card-text class="pa-2">
      <p class="text-subtitle-1 font-weight-bold text-white mb-0 text-truncate">
        {{ artist.name }}
      </p>
      <p class="text-caption text-grey">{{ artist.genre }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
/**
 * @file ArtistCard.vue
 * @description Tarjeta visual para listar artistas. Muestra su foto, nombre y género, y revela los controles de edición al pasar el ratón.
 */

/**
 * Datos que inyectamos en la tarjeta
 * @param {Object} artist - Objeto con la info del artista (nombre, imagen, género, etc.)
 */
defineProps({
  artist: { type: Object, required: true },
});

/**
 * Eventos que lanzamos al componente padre
 * @fires click - Al pinchar en cualquier parte de la tarjeta
 * @fires edit - Al pulsar el botón del lápiz. Pasa el objeto del artista
 * @fires delete - Al pulsar la papelera. Pasa el objeto del artista
 */
defineEmits(["click", "edit", "delete"]);
</script>

<style scoped>
.artist-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.artist-card:hover {
  transform: translateY(-4px);
}
.cover-overlay {
  background: rgba(0, 0, 0, 0.4);
  height: 100%;
  transition: 0.3s;
}
</style>
