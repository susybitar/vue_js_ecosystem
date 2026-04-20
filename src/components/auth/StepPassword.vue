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
 * @description Segundo paso del registro. Captura la contraseña y pinta un checklist visual de seguridad basado en las validaciones que recibe.
 */

/**
 * Datos que inyectamos en el componente
 * @param {string} modelValue - El texto actual de la contraseña (v-model)
 * @param {boolean} show - Controla si el texto está visible u oculto tras los asteriscos
 * @param {Object} validations - Banderas booleanas con el estado de seguridad (hasLength, hasUppercase, hasNumberOrSpecial)
 */
defineProps(["modelValue", "show", "validations"]);

/**
 * Eventos hacia el padre
 * @fires update:model-value - Sincroniza el texto que el usuario va escribiendo
 * @fires toggle-show - Pide al padre que cambie el estado del icono del ojito
 */
defineEmits(["update:model-value", "toggle-show"]);
</script>
