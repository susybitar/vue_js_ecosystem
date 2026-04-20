<template>
  <div class="register-page d-flex align-center justify-center">
    <div class="register-form-panel w-100 pa-6">
      <v-card
        flat
        class="register-card mx-auto pa-10 bg-transparent"
        :class="{ 'shake-error': registerError }"
        max-width="400"
      >
        <header class="d-flex justify-center mb-6">
          <router-link to="/">
            <v-img :src="simbolo" width="52" height="52" class="white-logo" />
          </router-link>
        </header>

        <section class="mb-6">
          <h1 class="form-title text-white font-weight-black">
            {{ currentTitle }}
          </h1>
        </section>

        <v-progress-linear
          :model-value="(step / 3) * 100"
          color="#1265FF"
          bg-color="rgba(255, 255, 255, 0.1)"
          height="1.5"
          rounded
          class="mb-12"
        ></v-progress-linear>

        <v-form @submit.prevent="handleNext">
          <v-window v-model="step" :touch="false">
            <v-window-item :value="1">
              <StepEmail v-model="email" />
            </v-window-item>

            <v-window-item :value="2">
              <StepPassword
                v-model="password"
                :show="showPassword"
                :validations="{ hasLength, hasUppercase, hasNumberOrSpecial }"
                @toggle-show="showPassword = !showPassword"
              />
            </v-window-item>

            <v-window-item :value="3">
              <StepProfile v-model:name="name" v-model:terms="acceptTerms" />
            </v-window-item>
          </v-window>

          <v-btn
            type="submit"
            color="#1265FF"
            block
            size="large"
            rounded="pill"
            class="register-btn mt-8 text-none font-weight-bold"
            :disabled="!isStepValid"
            :loading="authStore.loading"
          >
            {{ step === 3 ? "Finalizar registro" : "Continuar" }}
          </v-btn>
        </v-form>

        <v-btn
          v-if="step > 1"
          variant="text"
          block
          class="mt-4 text-none text-grey"
          @click="prevStep"
        >
          ← Atrás
        </v-btn>

        <footer v-if="step === 1" class="text-center mt-8 form-link">
          <span class="text-grey">¿Ya tienes cuenta?</span>
          <router-link to="/login" class="form-link ml-1"
            >Inicia sesión aquí</router-link
          >
        </footer>
      </v-card>
    </div>
  </div>
</template>

<script setup>
/**
 * @file RegisterView.vue
 * @description Flujo de registro secuencial en 3 pasos: Email, Password y Perfil.
 * Integra validaciones en tiempo real y persistencia optimista en el store de autenticación.
 */

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useAuthValidators } from "../composables/useAuthValidators";
import { useUIStore } from "../stores/ui";
import simbolo from "@/assets/img/logotipo/favicon.svg";

import StepEmail from "../components/auth/StepEmail.vue";
import StepPassword from "../components/auth/StepPassword.vue";
import StepProfile from "../components/auth/StepProfile.vue";

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

// --- ESTADO REACTIVO ---
const step = ref(1);
const email = ref("");
const password = ref("");
const name = ref("");
const acceptTerms = ref(false);
const showPassword = ref(false);
const registerError = ref(false);

// --- LÓGICA DE VALIDACIÓN COMPARTIDA ---
const {
  isEmailValid,
  hasLength,
  hasUppercase,
  hasNumberOrSpecial,
  isPasswordValid,
} = useAuthValidators(email, password);

/** Títulos descriptivos para cada fase del registro */
const currentTitle = computed(() => {
  const titulos = ["Tu email", "Tu contraseña", "Tu perfil"];
  return titulos[step.value - 1];
});

/** Validación local por paso para habilitar/deshabilitar el botón de progreso */
const isStepValid = computed(() => {
  if (step.value === 1) return isEmailValid.value;
  if (step.value === 2) return isPasswordValid.value;
  return name.value.trim().length >= 2 && acceptTerms.value;
});

/**
 * Gestiona el avance de pasos o la finalización del registro.
 * Incluye verificación de duplicados de email en el primer paso.
 */
function handleNext() {
  if (step.value === 1) {
    const existe = authStore.users.some(
      (u) => u.email === email.value.toLowerCase().trim(),
    );
    if (existe) {
      // Feedback de error visual y por notificación
      registerError.value = true;
      uiStore.notify("Este correo ya está registrado", "error");
      setTimeout(() => (registerError.value = false), 500);
    } else {
      step.value++;
    }
  } else if (step.value === 2) {
    step.value++;
  } else {
    // Proceso de creación de cuenta y login automático
    authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    authStore.login(email.value, password.value);

    uiStore.notify("Cuenta creada con éxito");
    router.push({ path: "/register-confirm", query: { name: name.value } });
  }
}

/** Retrocede al paso anterior */
function prevStep() {
  if (step.value > 1) step.value--;
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
}

.form-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.4rem;
  letter-spacing: 0.01em;
}

.white-logo {
  filter: brightness(0) invert(1);
}

.form-link {
  color: #1265ff;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.8rem;
}

/* Estilos inyectados a componentes hijos (Deep selectors) */
:deep(.field-label) {
  display: block;
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
}

:deep(.register-field-dark .v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: white !important;
}

:deep(.requirement) {
  display: flex;
  align-items: center;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

:deep(.requirement.is-met) {
  color: rgba(255, 255, 255, 0.9);
}

/* Animación de feedback negativo (vibración) */
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
