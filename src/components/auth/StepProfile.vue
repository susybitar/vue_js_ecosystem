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
      validate-on="submit invalid-input lazy"
    />
  </div>

  <div class="field-group">
    <v-checkbox
      :model-value="terms"
      @update:model-value="$emit('update:terms', $event)"
      hide-details="auto"
      class="dark-checkbox-fix"
      :rules="termsRules"
      validate-on="submit invalid-input lazy"
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
 * @description Paso 3 del registro: nombre + aceptación de términos. El
 * gating del botón "Finalizar registro" está en RegisterView; aquí me quedo
 * con las reglas inline que dan feedback debajo de cada campo.
 *
 * @prop {string} name - Nombre escrito (v-model:name).
 * @prop {boolean} terms - Casilla de términos marcada (v-model:terms).
 * @fires update:name - Nuevo nombre.
 * @fires update:terms - Nuevo estado del check.
 */
defineProps(["name", "terms"]);
defineEmits(["update:name", "update:terms"]);

/**
 * Reglas del nombre. Dejo letras Unicode (acentos, hangul, etc.), espacios,
 * apóstrofes y guiones — nada de números ni símbolos. El `validate-on="submit
 * invalid-input lazy"` del template hace que el rojo sólo salga al intentar
 * enviar, y que luego se corrija en vivo; `lazy` evita que el campo arranque
 * marcado como inválido al montar.
 */
const nameRules = [
  (v) => !!v?.trim() || "¿Cómo te llamamos?",
  (v) => (v?.trim().length || 0) >= 2 || "Mínimo 2 caracteres",
  (v) => (v?.trim().length || 0) <= 40 || "Máximo 40 caracteres",
  (v) =>
    /^[\p{L}\s'\-]+$/u.test((v || "").trim()) ||
    "Solo letras, espacios y guiones",
];

/**
 * Regla del checkbox. Obligo a marcar los términos; el mensaje sólo aparece
 * si el usuario intenta enviar sin haberlo hecho.
 */
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
