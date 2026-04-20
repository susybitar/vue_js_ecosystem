<template>
  <div class="field-group">
    <label class="field-label mb-3">Correo electrónico</label>
    <v-text-field
      :model-value="modelValue"
      @update:model-value="$emit('update:model-value', $event)"
      placeholder="tu@email.com"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      hide-details="auto"
      class="register-field-dark"
      autocomplete="email"
      autofocus
      :rules="rules"
    />
  </div>
</template>

<script setup>
/**
 * @file StepEmail.vue
 * @description Primer paso del registro. Captura y enlaza el email del usuario usando v-model.
 * Las reglas inline dan feedback al usuario mientras escribe; la validación
 * "fuerte" (habilitar el botón Continuar) sigue viviendo en RegisterView
 * vía useAuthValidators.
 */

/**
 * Valor actual del input (v-model)
 * @param {string} modelValue - Email escrito por el usuario
 */
defineProps(["modelValue"]);

/**
 * Avisa al componente padre cuando el usuario escribe algo
 * @fires update:model-value - Envía el nuevo texto del input
 */
defineEmits(["update:model-value"]);

/**
 * Reglas de feedback inline.
 * No bloquean el avance (ya lo hace isStepValid en el padre), pero muestran
 * al usuario por qué su email no vale.
 */
const rules = [
  (v) => !!v?.trim() || "Necesitamos tu email para continuar",
  (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim()) ||
    "Revisa el formato del email",
];
</script>
