<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="450"
    persistent
  >
    <v-card
      class="bg-black pa-6 rounded-xl border-sm"
      style="border-color: rgba(255, 255, 255, 0.1) !important"
    >
      <v-card-title class="text-h5 font-weight-black text-white px-0 pb-6">
        {{ isEditing ? "Editar Álbum" : "Nuevo Álbum" }}
      </v-card-title>

      <v-form v-model="isValid" @submit.prevent="submit">
        <v-text-field
          v-model="form.title"
          label="TÍTULO DEL DISCO"
          variant="outlined"
          color="#1265FF"
          base-color="rgba(255,255,255,0.3)"
          density="comfortable"
          class="mb-2"
          :rules="titleRules"
        />

        <v-select
          v-model="form.artistId"
          :items="musicStore.artists"
          item-title="name"
          item-value="id"
          label="ASIGNAR ARTISTA"
          variant="outlined"
          color="#1265FF"
          base-color="rgba(255,255,255,0.3)"
          density="comfortable"
          class="mb-2"
          :rules="[(v) => !!v || 'Debes elegir un artista']"
          no-data-text="No hay artistas disponibles. Crea uno primero."
        />

        <v-select
          v-model="form.year"
          :items="years"
          label="AÑO DE LANZAMIENTO"
          variant="outlined"
          color="#1265FF"
          base-color="rgba(255,255,255,0.3)"
          density="comfortable"
          class="mb-6"
          :rules="[(v) => !!v || 'El año es obligatorio']"
        />

        <v-card-actions class="pa-0 ga-3">
          <v-btn
            variant="text"
            color="grey-lighten-1"
            class="flex-grow-1 text-none font-weight-bold"
            @click="$emit('update:modelValue', false)"
          >
            Cancelar
          </v-btn>
          <v-btn
            type="submit"
            color="#1265FF"
            variant="flat"
            class="flex-grow-1 text-none font-weight-black"
            :disabled="!isValid"
          >
            {{ isEditing ? "Actualizar Álbum" : "Crear Álbum" }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
/**
 * @file AlbumDialog.vue
 * @description Modal para la gestión de álbumes con validación de integridad
 * y vinculación reactiva al store de música.
 */

import { reactive, watch, computed, ref } from "vue";
import { useMusicStore } from "../../stores/music";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  album: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "save"]);
const musicStore = useMusicStore();
const isValid = ref(false);

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const list = [];
  for (let i = currentYear; i >= 1950; i--) {
    list.push(i);
  }
  return list;
});

const isEditing = computed(() => !!props.album);

const form = reactive({
  title: "",
  artistId: null,
  year: new Date().getFullYear(),
});

/**
 * Reglas del título. Evitamos que el mismo artista tenga dos álbumes con
 * idéntico título (case-insensitive); al editar, excluimos el propio álbum
 * de la comprobación.
 */
const titleRules = computed(() => [
  (v) => !!v || "El título es obligatorio",
  (v) =>
    (v && v.trim().length >= 1) || "El título no puede estar vacío",
  (v) => (v && v.trim().length <= 100) || "Máximo 100 caracteres",
  (v) => {
    if (!v?.trim() || !form.artistId) return true;
    const trimmed = v.trim().toLowerCase();
    const clash = musicStore.albums.find(
      (a) =>
        a.artistId === form.artistId && a.title.toLowerCase() === trimmed,
    );
    if (clash && props.album?.id !== clash.id) {
      return "Ya tienes este álbum en tu biblioteca";
    }
    return true;
  },
]);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    if (props.album) {
      form.title = props.album.title;
      form.artistId = props.album.artistId;
      form.year = Number(props.album.year) || new Date().getFullYear();
    } else {
      form.title = "";
      form.artistId = null;
      form.year = new Date().getFullYear();
    }
  },
);

function submit() {
  if (!isValid.value) return;

  emit("save", {
    id: props.album?.id || null,
    title: form.title.trim(),
    artistId: form.artistId,
    year: form.year,
  });

  emit("update:modelValue", false);
}
</script>
