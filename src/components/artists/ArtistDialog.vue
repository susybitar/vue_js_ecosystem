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
        {{ isEditing ? "Editar Artista" : "Nuevo Artista" }}
      </v-card-title>

      <v-form v-model="isValid" @submit.prevent="submit">
        <v-text-field
          v-model="form.name"
          label="NOMBRE DEL ARTISTA"
          variant="outlined"
          color="#1265FF"
          base-color="rgba(255,255,255,0.3)"
          density="comfortable"
          class="mb-2"
          :rules="nameRules"
        />

        <v-combobox
          v-model="form.genre"
          :items="genreOptions"
          label="GÉNERO MUSICAL (Opcional)"
          variant="outlined"
          color="#1265FF"
          base-color="rgba(255,255,255,0.3)"
          density="comfortable"
          class="mb-6"
          placeholder="Se detectará automáticamente si se deja vacío"
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
            {{ isEditing ? "Actualizar" : "Crear Artista" }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
/**
 * @file ArtistDialog.vue
 * @description Modal crear/editar artista. Mismo patrón que el AlbumDialog:
 * si el padre me pasa un `artist`, edito; si no, creo. Trabajo sobre una copia
 * local y sólo emito al padre al pulsar Guardar.
 *
 * @prop {boolean} modelValue - v-model: abre/cierra el modal.
 * @prop {Object} [artist=null] - Artista a editar. Si es null → modo creación.
 * @fires update:modelValue - Cierre del modal.
 * @fires save - Payload listo para crear/actualizar en el store.
 */

import { reactive, watch, computed, ref } from "vue";
import { useMusicStore } from "../../stores/music";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  artist: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "save"]);
const musicStore = useMusicStore();
const isValid = ref(false);

/**
 * Sugerencias del combobox de género. Es un `v-combobox` a propósito: el
 * usuario puede elegir una de éstas o escribir la suya propia (por si su
 * artista no encaja en ninguno de los géneros típicos).
 */
const genreOptions = ref([
  "Pop",
  "Rock",
  "Hip-Hop",
  "Trap",
  "Techno",
  "House",
  "Indie",
  "Jazz",
  "Clásica",
  "Metal",
  "R&B",
  "Reguetón",
  "Punk",
]);

const isEditing = computed(() => !!props.artist);
const form = reactive({ name: "", genre: "" });

/**
 * Reglas del nombre. Bloqueo duplicados contra la biblioteca (case-insensitive);
 * en edición ignoro el propio artista para que se pueda re-guardar sin tocar
 * el nombre.
 */
const nameRules = computed(() => [
  (v) => !!v || "El nombre es obligatorio",
  (v) => (v && v.trim().length >= 2) || "Mínimo 2 caracteres",
  (v) => (v && v.trim().length <= 80) || "Máximo 80 caracteres",
  (v) => {
    if (!v?.trim()) return true;
    const trimmed = v.trim().toLowerCase();
    const clash = musicStore.artists.find(
      (a) => a.name.toLowerCase() === trimmed,
    );
    if (clash && props.artist?.id !== clash.id) {
      return `Ya tienes a ${clash.name} en tu biblioteca`;
    }
    return true;
  },
]);

/** Al abrir el modal, relleno desde `props.artist` o reseteo a vacío. */
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    if (props.artist) {
      form.name = props.artist.name;
      form.genre = props.artist.genre;
    } else {
      form.name = "";
      form.genre = "";
    }
  },
);

/**
 * Submit. El combobox devuelve string cuando el usuario escribe, pero también
 * puede devolver un objeto si alguna vez configuro `item-title`/`item-value`;
 * por eso normalizo aquí el tipo antes de emitir.
 */
function submit() {
  if (!isValid.value) return;

  emit("save", {
    id: props.artist?.id || null,
    name: form.name.trim(),
    genre: form.genre
      ? typeof form.genre === "string"
        ? form.genre.trim()
        : form.genre
      : "",
  });

  emit("update:modelValue", false);
}
</script>
