<template>
  <div class="confirm-page">
    <div class="confirm-container">
      <div class="glass-panel">
        <div class="success-icon">
          <v-icon size="80" color="#1265FF">mdi-check-circle</v-icon>
        </div>

        <h1 class="confirm-title">Registrado correctamente</h1>
        <p class="confirm-subtitle">¡Bienvenido, {{ userName }}!</p>

        <v-btn
          color="#1265FF"
          variant="flat"
          block
          size="large"
          rounded="pill"
          class="confirm-btn mt-8"
          @click="goToProfile"
        >
          Ir a mi perfil
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file RegisterConfirmView.vue
 * @description Pantalla de "registro OK" con CTA para entrar al perfil.
 * Lee el nombre del usuario desde la query de la URL en vez de sacarlo
 * del store para no depender de que el login automático haya terminado
 * cuando esta vista se monta.
 */
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

/** Nombre del usuario leído de `?name=...`, con fallback genérico. */
const userName = computed(() => route.query.name || "Usuario");

/** Lleva al dashboard del perfil. */
function goToProfile() {
  router.push("/profile");
}
</script>

<style scoped>
/* Centrado en pantalla; el fondo lo hereda del tema oscuro de App.vue. */
.confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.confirm-container {
  width: 100%;
  max-width: 400px;
}

/* Glass muy sutil para el panel de éxito (no compite con el CTA). */
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 48px;
  text-align: center;
}

/* Pop del icono al entrar: cubic-bezier con rebote ligero. */
.success-icon {
  margin-bottom: 24px;
  animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleUp {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff !important;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.confirm-subtitle {
  font-family: "Roboto", sans-serif;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
}

.confirm-btn {
  font-family: "Montserrat", sans-serif !important;
  font-weight: 700 !important;
  height: 52px !important;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(18, 101, 255, 0.3) !important;
}
</style>
