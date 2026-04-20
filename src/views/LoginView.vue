<template>
  <div class="login-page">
    <div class="login-form-panel">
      <div class="login-card" :class="{ 'shake-error': loginError }">
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
          <h1 class="form-title">
            {{ step === 1 ? "Bienvenido" : "Introduce tu contraseña" }}
          </h1>
          <p class="form-subtitle" :class="{ 'email-confirm': step === 2 }">
            {{ step === 1 ? "Accede a tu biblioteca musical" : email }}
          </p>
        </div>

        <v-form
          ref="loginForm"
          v-model="isFormValid"
          @submit.prevent="handleSubmit"
        >
          <v-expand-transition>
            <div v-if="step === 1">
              <div class="field-group">
                <label class="field-label">Correo electrónico</label>
                <v-text-field
                  v-model="email"
                  placeholder="tu@email.com"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :rules="[
                    (v) => !!v || 'Email requerido',
                    (v) => /.+@.+\..+/.test(v) || 'Email no válido',
                  ]"
                  class="login-field-dark"
                  autofocus
                />
              </div>
              <div class="auth-options">
                <v-checkbox
                  v-model="rememberMe"
                  label="Recordarme"
                  density="compact"
                  hide-details
                  class="remember-checkbox-dark"
                />
                <router-link to="/forgot-password" class="forgot-link-dark"
                  >¿Olvidaste tu contraseña?</router-link
                >
              </div>
            </div>
          </v-expand-transition>

          <v-expand-transition>
            <div v-if="step === 2" class="field-group">
              <label class="field-label">Contraseña</label>
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                :rules="[
                  (v) => !!v || 'Contraseña requerida',
                  (v) => v.length >= 6 || 'Mínimo 6 caracteres',
                ]"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                class="login-field-dark"
                autofocus
              />
            </div>
          </v-expand-transition>

          <v-btn
            type="submit"
            color="#1265FF"
            block
            size="large"
            rounded="pill"
            class="login-btn mt-6"
            :loading="authStore.loading"
            :disabled="!isFormValid"
          >
            {{ step === 1 ? "Continuar" : "Iniciar Sesión" }}
          </v-btn>

          <v-btn
            v-if="step === 2"
            variant="text"
            block
            class="mt-2 text-none back-btn"
            @click="goBack"
            >Usar otro correo</v-btn
          >
        </v-form>

        <p v-if="step === 1" class="form-footer">
          ¿No tienes cuenta?
          <router-link to="/register" class="form-link"
            >Regístrate aquí</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file LoginView.vue
 * @description Vista de acceso en dos pasos. Primero verifica la existencia del usuario
 * y luego solicita la contraseña. Implementa lógica de "Recordarme" y animaciones de error.
 */

import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUIStore } from "../stores/ui";
import simbolo from "@/assets/img/logotipo/favicon.svg";

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const route = useRoute();

const loginForm = ref(null);
const step = ref(1);
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isFormValid = ref(false);
const rememberMe = ref(false);
const loginError = ref(false);

/**
 * Al montar, comprobamos si venimos de un registro exitoso o si hay un correo recordado.
 */
onMounted(() => {
  const emailParam = route.query.email;
  if (emailParam) {
    email.value = emailParam;
    step.value = 2;
    return;
  }
  const savedEmail = localStorage.getItem("ms_remember_email");
  if (savedEmail) {
    email.value = savedEmail;
    rememberMe.value = true;
  }
});

/**
 * Maneja el flujo de login.
 * Paso 1: Valida si el usuario existe (si no, redirige a registro).
 * Paso 2: Ejecuta el login real contra el store.
 */
async function handleSubmit() {
  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  if (step.value === 1) {
    // Avanzamos siempre al paso de contraseña. No confirmamos si el email
    // existe: hacerlo permitiría enumerar cuentas (OWASP ASVS).
    if (rememberMe.value)
      localStorage.setItem("ms_remember_email", email.value);
    step.value = 2;
  } else {
    const success = await authStore.login(email.value, password.value);
    if (success) {
      uiStore.notify("Bienvenido de nuevo");
      router.push("/profile");
    } else {
      loginError.value = true;
      // Mensaje unificado: no revelamos si el email existe o si la contraseña falla.
      uiStore.notify("Email o contraseña incorrectos", "error");
      setTimeout(() => (loginError.value = false), 500);
    }
  }
}

/** Resetea el flujo al paso de email */
function goBack() {
  step.value = 1;
  password.value = "";
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-panel {
  width: 100%;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 40px;
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
  margin-bottom: 32px;
}

.form-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.03em;
}

.form-subtitle {
  font-family: "Roboto", sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.email-confirm {
  color: #ffffff;
  font-weight: 400;
}

.field-label {
  display: block;
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.login-field-dark :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: white !important;
}

.auth-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -8px;
}

.remember-checkbox-dark :deep(.v-label) {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.forgot-link-dark {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
}

.login-btn {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  height: 50px !important;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

.form-link {
  color: #1265ff;
  text-decoration: none;
  font-weight: 700;
}

.back-btn {
  color: rgba(255, 255, 255, 0.3) !important;
}

/* ANIMACIÓN DE ERROR */
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
