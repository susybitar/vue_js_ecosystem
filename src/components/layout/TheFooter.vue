<template>
  <footer class="mt-16 pb-12 d-flex flex-column align-center w-100">
    <img :src="logo" alt="MusicSpace" class="footer-logo-fixed mb-3" />
    <div class="legal-text">© 2026 · Desarrollado por Future Space</div>
  </footer>
</template>

<script setup>
/**
 * @file TheFooter.vue
 * @description Pie de página minimalista para vistas internas. Muestra el logotipo en marca de agua y el copyright de forma discreta.
 */
import logo from "@/assets/img/logotipo/logo_music_space.svg";
</script>

<style scoped>
/* Logotipo con filtro invertido y opacidad baja para no distraer del contenido principal */
.footer-logo-fixed {
  filter: brightness(0) invert(1);
  width: 90px !important;
  height: auto;
  opacity: 0.2;
}

/* Texto legal con espaciado amplio para mantener la estética premium y minimalista */
.legal-text {
  font-family: "Montserrat", sans-serif;
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  text-transform: none;
}
</style>
