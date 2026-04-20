<template>
  <footer class="global-footer">
    <v-container class="footer-container px-4">
      <v-row class="footer-top mb-12">
        <v-col cols="12" md="4" class="text-center text-md-left mb-8 mb-md-0">
          <img :src="logo" alt="MusicSpace" class="footer-logo mb-4" />
          <p class="footer-desc">
            Tu colección musical,<br />
            finalmente ordenada.
          </p>
        </v-col>

        <v-col
          cols="12"
          sm="6"
          md="4"
          class="text-center text-md-left mb-8 mb-sm-0"
        >
          <h4 class="footer-heading">Compañía</h4>
          <ul class="footer-links">
            <li><router-link to="/">Inicio</router-link></li>
            <li><router-link to="/login">Iniciar sesión</router-link></li>
            <li><router-link to="/register">Crear cuenta</router-link></li>
          </ul>
        </v-col>

        <v-col cols="12" sm="6" md="4" class="text-center text-md-left">
          <h4 class="footer-heading">Legal</h4>
          <ul class="footer-links">
            <li><a href="#">Términos de servicio</a></li>
            <li><a href="#">Política de privacidad</a></li>
          </ul>
        </v-col>
      </v-row>

      <div class="footer-bottom text-center">
        <p class="legal-text">
          © {{ currentYear }} · Desarrollado por
          <span>Future Space</span>
        </p>
      </div>
    </v-container>
  </footer>
</template>

<script setup>
/**
 * @file GlobalFooter.vue
 * @description Pie de página estático. Contiene la información corporativa, los enlaces a legales y la navegación secundaria.
 */

import { computed } from "vue";
import logo from "@/assets/img/logotipo/logo_music_space.svg";

/**
 * Calculamos el año en curso para que el copyright siempre esté actualizado
 * sin tener que cambiarlo a mano en enero.
 */
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
/* ─── FONDO PITCH BLACK DEFINITIVO ─── */
.global-footer {
  position: relative;
  background: #000000 !important;
  padding: 80px 0 40px 0;
  color: #ffffff;
}

/* EL HORIZONTE DE NEÓN (Separador Visual) */
.global-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(18, 101, 255, 0.8) 50%,
    transparent 100%
  );
  box-shadow: 0 0 15px rgba(18, 101, 255, 0.5);
  z-index: 10;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-logo {
  filter: brightness(0) invert(1);
  width: 140px;
  opacity: 0.8;
}

.footer-desc {
  font-family: "Roboto", sans-serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
}

.footer-heading {
  font-family: "Montserrat", sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 24px;
  color: #ffffff;
}

.footer-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  font-family: "Roboto", sans-serif;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #1265ff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 32px;
}

.legal-text {
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
}
</style>
