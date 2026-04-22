<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="420"
  >
    <v-card class="bg-black border-subtle pa-8 rounded-xl">
      <div class="d-flex align-center ga-3 mb-4">
        <v-icon :color="tone" size="28">{{ icon }}</v-icon>
        <h2 class="text-h6 font-weight-black text-white ma-0">{{ title }}</h2>
      </div>

      <p class="confirm-message mb-8">{{ message }}</p>

      <div class="d-flex ga-2">
        <v-btn
          variant="text"
          color="grey"
          class="flex-grow-1"
          @click="$emit('update:modelValue', false)"
        >
          {{ cancelLabel }}
        </v-btn>
        <v-btn
          :color="tone"
          variant="flat"
          class="flex-grow-1 font-weight-black"
          @click="confirm"
        >
          {{ confirmLabel }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
/**
 * @file ConfirmDialog.vue
 * @description Modal de confirmación reutilizable. Lo uso sobre todo para
 * borrados destructivos (artista / álbum), pero le dejo props suficientes
 * (`tone`, `icon`, labels) como para poder reciclarlo en otros casos si
 * hiciera falta.
 *
 * @prop {boolean} modelValue - v-model: abre/cierra el modal.
 * @prop {string} [title="¿Estás seguro?"] - Título del modal.
 * @prop {string} message - Explicación corta de lo que va a pasar si confirma.
 * @prop {string} [cancelLabel="Cancelar"] - Texto del botón secundario.
 * @prop {string} [confirmLabel="Confirmar"] - Texto del botón principal.
 * @prop {string} [tone="error"] - Color de Vuetify para el CTA (error / warning / info).
 * @prop {string} [icon="mdi-alert-circle"] - Icono junto al título.
 * @fires update:modelValue - Cierre del modal.
 * @fires confirm - Usuario pulsó "Confirmar".
 */
defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: "¿Estás seguro?" },
  message: { type: String, required: true },
  cancelLabel: { type: String, default: "Cancelar" },
  confirmLabel: { type: String, default: "Confirmar" },
  tone: { type: String, default: "error" },
  icon: { type: String, default: "mdi-alert-circle" },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

/**
 * Acepta la acción: aviso al padre con `confirm` y cierro el modal. El padre
 * se encarga de la acción real (borrar, etc.); yo sólo me ocupo del UI.
 */
function confirm() {
  emit("confirm");
  emit("update:modelValue", false);
}
</script>

<style scoped>
/* Borde fino para que el modal no se confunda con el fondo negro. */
.border-subtle {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.confirm-message {
  font-family: "Roboto", sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}
</style>
