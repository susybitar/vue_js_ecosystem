<template>
  <div class="forgot-page">
    <div class="forgot-form-panel">
      <div class="forgot-card" :class="{ 'shake-error': forgotError }">
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
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
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
              :rules="confirmRules"
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
          @click="router.push('/login')"
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
 * @description "Olvidé mi contraseña". Pido email + nueva contraseña (con
 * confirmación) y delego el cambio en el AuthStore. Tiro de los mismos
 * validadores compartidos que el registro para que los requisitos sean
 * idénticos en todos los formularios de la app.
 *
 * Aquí SÍ revelo si el email existe, al contrario que en login. Es una
 * concesión a la UX: si no lo hiciese en una app "de demo con localStorage",
 * el usuario podría quedarse escribiendo contraseñas nuevas para siempre
 * sin entender por qué no entra.
 */

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUIStore } from "../stores/ui";
import { useAuthValidators } from "../composables/useAuthValidators";
import simbolo from "@/assets/img/logotipo/favicon.svg";

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

// --- ESTADO ---
const email = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const showPassword = ref(false);
const forgotError = ref(false);

// Mismos requisitos que en el registro (longitud, mayúscula, número/símbolo).
const { isEmailValid, hasLength, hasUppercase, hasNumberOrSpecial, isPasswordValid } =
  useAuthValidators(email, newPassword);

/** El form sólo se habilita cuando todo es correcto y las dos contraseñas coinciden. */
const isFormValid = computed(
  () =>
    isEmailValid.value &&
    isPasswordValid.value &&
    confirmPassword.value.length > 0 &&
    confirmPassword.value === newPassword.value,
);

/**
 * Regla del segundo campo de contraseña: sólo da feedback visual.
 * El botón ya está bloqueado cuando no coincide, así que aquí me limito
 * a mostrar el mensaje inline bajo el input.
 */
const confirmRules = [
  (v) =>
    !v ||
    !newPassword.value ||
    v === newPassword.value ||
    "Las contraseñas no coinciden",
];

/** Shake visual de la tarjeta para acompañar los toasts de error. */
function triggerShake() {
  forgotError.value = true;
  setTimeout(() => (forgotError.value = false), 500);
}

/**
 * Flujo del cambio:
 *  1. Pequeño delay artificial para que el spinner se note.
 *  2. Si el email no existe, shake + toast y corto.
 *  3. Guardo la contraseña nueva (ya hasheada) vía AuthStore.
 *  4. Mando al login con `?email=...` para que entre en el paso 2 directo.
 */
async function handleSubmit() {
  if (!isFormValid.value) return;

  isLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanEmail = email.value.toLowerCase().trim();
    const userExists = authStore.users.some((u) => u.email === cleanEmail);

    if (!userExists) {
      triggerShake();
      uiStore.notify("No encontramos ninguna cuenta con ese email", "error");
      return;
    }

    const updated = await authStore.updatePassword(cleanEmail, newPassword.value);
    if (!updated) {
      uiStore.notify(
        "No pudimos cambiar la contraseña. Inténtalo de nuevo",
        "error",
      );
      return;
    }

    uiStore.notify("Contraseña cambiada. Ya puedes iniciar sesión");
    router.push({ path: "/login", query: { email: cleanEmail } });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Centrado en pantalla, sobre el fondo negro heredado de App.vue. */
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

/* Inputs en cristal: Vuetify por defecto pinta fondos blancos y no pega
   con el tema oscuro; los fuerzo con :deep + !important. */
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

/* Animación de feedback negativo (vibración) — reutiliza el patrón del login */
.shake-error {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
