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
 * @description Modal genérico para confirmaciones de seguridad. Se utiliza principalmente para evitar borrados accidentales de artistas o álbumes.
 */

/**
 * Propiedades del diálogo
 * @param {boolean} modelValue - Controla si el modal está a la vista (v-model)
 * @param {string} [title="¿Estás seguro?"] - Encabezado del mensaje
 * @param {string} message - Texto descriptivo del peligro de la acción
 * @param {string} [cancelLabel="Cancelar"] - Etiqueta del botón de escape
 * @param {string} [confirmLabel="Confirmar"] - Etiqueta de la acción principal
 * @param {string} [tone="error"] - Color del botón de acción (error, info, success...)
 * @param {string} [icon="mdi-alert-circle"] - Icono que acompaña al título
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
 * Ejecuta la confirmación.
 * Avisamos al componente padre de que el usuario ha aceptado y cerramos el modal automáticamente.
 */
function confirm() {
  emit("confirm");
  emit("update:modelValue", false);
}
</script>

<style scoped>
/* Borde fino para mantener la estética Pitch Black sin que el modal se pierda en el fondo negro */
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
