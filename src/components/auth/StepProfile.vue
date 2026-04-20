<template>
  <div class="field-group mb-6">
    <label class="field-label mb-3">Tu nombre</label>
    <v-text-field
      :model-value="name"
      @update:model-value="$emit('update:name', $event)"
      placeholder="Juan Pérez"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      hide-details="auto"
      class="register-field-dark"
      autocomplete="name"
      autofocus
      :rules="nameRules"
    />
  </div>

  <div class="field-group">
    <v-checkbox
      :model-value="terms"
      @update:model-value="$emit('update:terms', $event)"
      hide-details="auto"
      class="dark-checkbox-fix"
      :rules="termsRules"
    >
      <template v-slot:label>
        Acepto los <a href="#">términos y condiciones</a>
      </template>
    </v-checkbox>
  </div>
</template>

<script setup>
/**
 * @file StepProfile.vue
 * @description Tercer y último paso del registro. Captura el nombre del usuario y la aceptación de los términos legales.
 * Las reglas inline muestran feedback mientras se completa; el gating final
 * del botón "Finalizar registro" sigue centralizado en RegisterView.
 */

/**
 * Datos del formulario vinculados mediante v-model
 * @param {string} name - Nombre introducido en el input
 * @param {boolean} terms - Estado de la casilla de verificación
 */
defineProps(["name", "terms"]);

/**
 * Eventos para sincronizar los datos hacia el componente padre
 * @fires update:name - Emite el nombre actualizado tecla a tecla
 * @fires update:terms - Emite el cambio al marcar/desmarcar la casilla
 */
defineEmits(["update:name", "update:terms"]);

/**
 * Reglas del nombre. Aceptamos letras Unicode (soporta acentos, K-pop, etc.),
 * espacios, apóstrofes y guiones. No permitimos números ni símbolos raros.
 */
const nameRules = [
  (v) => !!v?.trim() || "¿Cómo te llamamos?",
  (v) => (v?.trim().length || 0) >= 2 || "Mínimo 2 caracteres",
  (v) => (v?.trim().length || 0) <= 40 || "Máximo 40 caracteres",
  (v) =>
    /^[\p{L}\s'\-]+$/u.test((v || "").trim()) ||
    "Solo letras, espacios y guiones",
];

/** Forzamos la aceptación explícita de los términos antes de finalizar. */
const termsRules = [(v) => !!v || "Debes aceptar los términos para continuar"];
</script>

<style scoped>
/* Usamos :deep() para penetrar en las etiquetas internas que genera Vuetify */
:deep(.dark-checkbox-fix .v-label) {
  font-size: 0.8rem !important;
  color: rgba(255, 255, 255, 0.5) !important; /* color con transparencia */
  opacity: 1 !important; /* Matamos la opacidad por defecto de Vuetify */
}

/* Estilo para el enlace que está dentro del label de Vuetify */
:deep(.dark-checkbox-fix .v-label a) {
  color: rgba(255, 255, 255, 0.5) !important;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}
</style>
