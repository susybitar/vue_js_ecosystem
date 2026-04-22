<template>
  <div class="field-group">
    <label class="field-label mb-3">Establece una contraseña</label>
    <v-text-field
      :model-value="modelValue"
      @update:model-value="$emit('update:model-value', $event)"
      :type="show ? 'text' : 'password'"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      hide-details="auto"
      :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="$emit('toggle-show')"
      class="register-field-dark"
      autofocus
    />
  </div>

  <div class="minimal-checklist mt-6">
    <div class="requirement" :class="{ 'is-met': validations.hasLength }">
      <v-icon size="8" class="mr-2">{{
        validations.hasLength ? "mdi-check" : "mdi-asterisk"
      }}</v-icon>
      <span>Mínimo 8 caracteres</span>
    </div>
    <div class="requirement" :class="{ 'is-met': validations.hasUppercase }">
      <v-icon size="8" class="mr-2">{{
        validations.hasUppercase ? "mdi-check" : "mdi-asterisk"
      }}</v-icon>
      <span>Al menos 1 mayúscula</span>
    </div>
    <div
      class="requirement"
      :class="{ 'is-met': validations.hasNumberOrSpecial }"
    >
      <v-icon size="8" class="mr-2">{{
        validations.hasNumberOrSpecial ? "mdi-check" : "mdi-asterisk"
      }}</v-icon>
      <span>Un número o carácter especial</span>
    </div>
  </div>
</template>

<script setup>
/**
 * @file StepPassword.vue
 * @description Paso 2 del registro: contraseña + checklist de requisitos.
 * Las banderas del checklist me las da el padre (ya computadas por
 * `useAuthValidators`); aquí sólo las pinto y gestiono el toggle del ojito
 * para mostrar/ocultar el texto.
 *
 * @prop {string} modelValue - Contraseña actual (v-model).
 * @prop {boolean} show - true para que el input enseñe el texto en claro.
 * @prop {{ hasLength: boolean, hasUppercase: boolean, hasNumberOrSpecial: boolean }} validations
 *   Estado de cada requisito. Los marco con check cuando están a true.
 * @fires update:model-value - Nuevo valor del input.
 * @fires toggle-show - El usuario pulsó el ojito (el padre invierte `show`).
 */
defineProps(["modelValue", "show", "validations"]);
defineEmits(["update:model-value", "toggle-show"]);
</script>
