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
      validate-on="blur lazy"
    />
  </div>
</template>

<script setup>
/**
 * @file StepEmail.vue
 * @description Paso 1 del registro: email. El v-model conecta con la vista
 * padre (RegisterView), que es la que decide cuándo se puede avanzar
 * (`isStepValid`) con los validadores compartidos. Aquí sólo pinto el campo
 * y las reglas inline, que son para que el usuario entienda qué falta — no
 * bloquean el avance.
 *
 * @prop {string} modelValue - Email actual (v-model).
 * @fires update:model-value - Nuevo valor escrito.
 */
defineProps(["modelValue"]);
defineEmits(["update:model-value"]);

/**
 * Reglas del input. Con `validate-on="blur lazy"` los mensajes sólo aparecen
 * cuando el usuario ya escribió algo y salió del campo — así el input no se
 * pinta en rojo al montar la vista.
 */
const rules = [
  (v) => !!v?.trim() || "Necesitamos tu email para continuar",
  (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim()) ||
    "Revisa el formato del email",
];
</script>
