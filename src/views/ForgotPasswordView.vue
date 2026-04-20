<template>
  <div class="forgot-page">
    <div class="forgot-form-panel">
      <div class="forgot-card">
        <div class="card-icon-wrap">
          <router-link to="/">
            <img
              :src="simbolo"
              alt="MusicSpace"
              class="white-logo clickable-logo"
            />
          </router-link>
        </div>

        <div class="form-header">
          <h1 class="form-title">Cambiar Contraseña</h1>
          <p class="form-subtitle">Crea una nueva contraseña para tu cuenta</p>
        </div>

        <v-form @submit.prevent="handleSubmit" class="mt-8">
          <div class="field-group">
            <label class="field-label">Correo electrónico</label>
            <v-text-field
              v-model="email"
              placeholder="tu@email.com"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="forgot-field-dark"
              autofocus
            />
          </div>

          <div class="field-group mt-6">
            <label class="field-label">Nueva contraseña</label>
            <v-text-field
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="forgot-field-dark"
            />

            <div class="minimal-checklist mt-4 mb-6">
              <div class="requirement" :class="{ 'is-met': hasLength }">
                <v-icon size="8" class="mr-2">{{
                  hasLength ? "mdi-check" : "mdi-asterisk"
                }}</v-icon>
                <span>Mínimo 8 caracteres</span>
              </div>
              <div class="requirement" :class="{ 'is-met': hasUppercase }">
                <v-icon size="8" class="mr-2">{{
                  hasUppercase ? "mdi-check" : "mdi-asterisk"
                }}</v-icon>
                <span>Al menos 1 mayúscula</span>
              </div>
              <div
                class="requirement"
                :class="{ 'is-met': hasNumberOrSpecial }"
              >
                <v-icon size="8" class="mr-2">{{
                  hasNumberOrSpecial ? "mdi-check" : "mdi-asterisk"
                }}</v-icon>
                <span>Un número o carácter especial</span>
              </div>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Confirmar contraseña</label>
            <v-text-field
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="forgot-field-dark"
            />
          </div>

          <v-btn
            type="submit"
            color="#1265FF"
            variant="flat"
            block
            size="large"
            rounded="pill"
            class="forgot-btn mt-8"
            :disabled="!isFormValid"
            :loading="isLoading"
          >
            Cambiar Contraseña
          </v-btn>
        </v-form>

        <v-btn
          variant="text"
          block
          class="mt-4 text-none back-btn"
          @click="$router.push('/login')"
        >
          ← Atrás
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file ForgotPasswordView.vue
 * @description Vista para el restablecimiento de contraseñas. Implementa validaciones
 * de seguridad en tiempo real y persistencia a través del AuthStore.
 */

import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import simbolo from "@/assets/img/logotipo/favicon.svg";

const authStore = useAuthStore();
const email = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const showPassword = ref(false);

/**
 * Evaluación granular de requisitos de seguridad para feedback en la UI.
 */
const hasLength = computed(() => newPassword.value.length >= 8);
const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value));
const hasNumberOrSpecial = computed(() =>
  /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword.value),
);

/**
 * Lógica de validación global del formulario.
 * El botón se habilita únicamente si el formato de email es correcto,
 * se cumplen los criterios de seguridad y las contraseñas coinciden.
 */
const isFormValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return (
    emailRegex.test(email.value.trim()) &&
    hasLength.value &&
    hasUppercase.value &&
    hasNumberOrSpecial.value &&
    confirmPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value
  );
});

/**
 * Procesa el cambio de credenciales.
 * Si el usuario existe, actualiza el store y redirige mediante refresco forzado
 * para garantizar la limpieza de estados previos.
 */
async function handleSubmit() {
  isLoading.value = true;
  try {
    const userExists = authStore.users.some((u) => u.email === email.value);
    if (userExists) {
      authStore.updatePassword(email.value, newPassword.value);
      // Redirección con limpieza de caché/estado
      window.location.href = "/login";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Contenedor principal: Centrado absoluto sobre fondo oscuro (Pitch Black) */
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-form-panel {
  width: 100%;
  padding: 24px;
}

.forgot-card {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: 20px;
}

.card-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.white-logo {
  filter: brightness(0) invert(1);
  width: 52px;
  height: 52px;
}

.clickable-logo {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-logo:hover {
  opacity: 0.8;
}

.form-header {
  text-align: left;
  margin-bottom: 24px;
}

.form-title {
  font-family: "Montserrat", sans-serif !important;
  font-size: 1.6rem !important;
  font-weight: 800 !important;
  color: #ffffff !important;
  letter-spacing: -0.03em !important;
}

.form-subtitle {
  font-family: "Roboto", sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
}

.field-label {
  display: block;
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

/* Estilización personalizada para inputs de Vuetify en modo oscuro sutil */
.forgot-field-dark :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: white !important;
}

.forgot-field-dark :deep(input) {
  color: white !important;
}

.forgot-btn {
  font-family: "Montserrat", sans-serif !important;
  font-weight: 700;
  text-transform: none;
  height: 50px !important;
}

.back-btn {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* Checklist de seguridad: Diseño minimalista con estados visuales activos/inactivos */
.minimal-checklist {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.requirement {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.requirement.is-met {
  color: #ffffff;
}

.requirement.is-met :deep(.v-icon) {
  color: #1265ff !important;
}
</style>
