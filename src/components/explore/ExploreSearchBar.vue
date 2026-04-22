<template>
  <div class="search-section">
    <div class="search-bar">
      <v-icon size="18" class="search-bar-icon">mdi-magnify</v-icon>

      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        type="text"
        :placeholder="placeholder"
        class="search-bar-input"
        @keyup.enter="$emit('search')"
      />

      <button
        v-show="modelValue"
        class="search-bar-clear"
        @click="$emit('update:modelValue', '')"
      >
        <v-icon size="14">mdi-close</v-icon>
      </button>

      <button
        class="search-bar-btn"
        :disabled="!modelValue.trim() || loading"
        @click="$emit('search')"
      >
        {{ loading ? "Buscando..." : "Buscar" }}
      </button>
    </div>

    <div class="type-tabs">
      <button
        v-for="tab in typeTabs"
        :key="tab.value"
        class="type-tab"
        :class="{ active: searchType === tab.value }"
        @click="$emit('update:searchType', tab.value)"
      >
        <v-icon size="14" class="mr-1">{{ tab.icon }}</v-icon>
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * @file ExploreSearchBar.vue
 * @description Buscador del Explorer: input + botón "Buscar" + pestañas
 * (artistas / álbumes / canciones). Uso un `<input>` nativo (no `v-text-field`)
 * para tener control absoluto del CSS sin pelearme con los overrides internos
 * de Vuetify. La búsqueda no se dispara mientras se escribe — sólo al pulsar
 * Enter o el botón — para no bombardear Deezer con peticiones por cada tecla.
 *
 * @prop {string} modelValue - Texto actual (v-model).
 * @prop {"artist"|"album"|"track"} searchType - Pestaña activa (v-model:searchType).
 * @prop {boolean} [loading=false] - Deshabilita el botón mientras hay una petición en vuelo.
 * @prop {string} [placeholder] - Placeholder adaptado al tipo activo.
 * @fires update:modelValue - Cambios del texto.
 * @fires update:searchType - Cambio de pestaña.
 * @fires search - Usuario pidió buscar (Enter o click en "Buscar").
 */
defineProps({
  modelValue: { type: String, required: true },
  searchType: { type: String, required: true },
  loading: { type: Boolean, default: false },
  placeholder: {
    type: String,
    default: "Busca un artista, álbum o canción...",
  },
});

defineEmits(["update:modelValue", "update:searchType", "search"]);

/** Pestañas disponibles. Array para poder iterarlo en el template. */
const typeTabs = [
  { value: "artist", label: "Artistas", icon: "mdi-account-music" },
  { value: "album", label: "Álbumes", icon: "mdi-album" },
  { value: "track", label: "Canciones", icon: "mdi-music-note" },
];
</script>

<style scoped>
.search-section {
  margin-bottom: 32px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0 16px;
  height: 44px;
  margin-bottom: 14px;
  transition: border-color 0.2s ease;
}
.search-bar:focus-within {
  border-color: rgba(18, 101, 255, 0.4);
}

.search-bar-icon {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.search-bar-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
  font-size: 0.9rem;
}
.search-bar-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.search-bar-clear {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 6px;
  transition: color 0.2s;
}
.search-bar-clear:hover {
  color: #ffffff;
}

.search-bar-btn {
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: #1265ff;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s ease;
}
.search-bar-btn:hover:not(:disabled) {
  background: #0d52d6;
}
.search-bar-btn:disabled {
  background: rgba(18, 101, 255, 0.3);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.type-tabs {
  display: flex;
  gap: 6px;
}

.type-tab {
  display: inline-flex;
  align-items: center;
  font-family: "Montserrat", sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}
.type-tab:hover {
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}
.type-tab.active {
  background: rgba(18, 101, 255, 0.15);
  border-color: rgba(18, 101, 255, 0.35);
  color: #5a9aff;
}
</style>
