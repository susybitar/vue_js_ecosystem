<template>
  <footer class="mt-16 pb-12 d-flex flex-column align-center w-100">
    <img :src="logo" alt="MusicSpace" class="footer-logo-fixed mb-3" />
    <div class="legal-text">© 2026 · Desarrollado por Future Space</div>
  </footer>
</template>

<script setup>
/**
 * @file TheFooter.vue
 * @description Pie que uso al final de las vistas internas (Perfil, Álbumes,
 * Artistas, Explorar). Logo en blanco a media tinta + copyright, nada más —
 * no quiero que compita con el contenido.
 */
import logo from "@/assets/img/logotipo/logo_music_space.svg";
</script>

<style scoped>
/* Logo blanco al 20% — que se note pero sin llamar la atención. */
.footer-logo-fixed {
  filter: brightness(0) invert(1);
  width: 90px !important;
  height: auto;
  opacity: 0.2;
}

/* Copyright pequeño y espaciado (tracking ancho) para que respire. */
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
