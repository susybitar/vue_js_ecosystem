<template>
  <div class="home-page">
    <nav class="top-nav">
      <div class="brand">
        <img :src="logo" alt="MusicSpace" class="brand-logo" />
      </div>

      <div class="nav-actions">
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="link-login"
            >Iniciar sesión</router-link
          >
          <router-link to="/register" class="link-register">
            Empezar gratis →
          </router-link>
        </template>

        <template v-else>
          <div class="d-flex align-center ga-4">
            <span class="user-greeting d-none d-sm-block"
              >Hola, {{ userName }}</span
            >
            <router-link to="/profile" class="btn-cta-small"
              >Ir al Panel</router-link
            >
          </div>
        </template>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-grid">
        <div class="hero-left">
          <h1 class="hero-title">
            Tu colección musical,<br />
            <em class="title-em">por&nbsp;fin ordenada.</em>
          </h1>

          <div class="hero-cta">
            <template v-if="!isLoggedIn">
              <router-link to="/register" class="btn-cta"
                >Crear mi biblioteca</router-link
              >
              <router-link to="/login" class="btn-ghost"
                >Tengo cuenta</router-link
              >
            </template>
            <template v-else>
              <router-link to="/profile" class="btn-cta"
                >Entrar a mi Catálogo</router-link
              >
            </template>
          </div>
        </div>

        <div class="hero-right">
          <div class="mockup-glow"></div>
          <div class="mockup-wrapper">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>

    <div class="light-section-wrapper">
      <ArtistRibbon />
    </div>

    <HowItWorksSection />
    <GlobalFooter />
  </div>
</template>

<script setup>
/**
 * @file HomeView.vue
 * @description Landing page principal del proyecto MusicSpace.
 * Orquesta los componentes visuales clave y gestiona el estado de acceso para adaptar los CTAs.
 */

import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import logo from "@/assets/img/logotipo/logo_music_space.svg";

// Importación de componentes de la Home
import HeroMockup from "../components/home/HeroMockup.vue";
import ArtistRibbon from "../components/home/ArtistRibbon.vue";
import HowItWorksSection from "../components/home/HowItWorksSection.vue";
import GlobalFooter from "../components/home/GlobalFooter.vue";

const authStore = useAuthStore();

/** Estado reactivo de sesión */
const isLoggedIn = computed(() => authStore.currentUser !== null);

/** Nombre del usuario formateado para el saludo */
const userName = computed(
  () => authStore.currentUser?.name?.split(" ")[0] || "Usuario",
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;900&display=swap");

.home-page {
  background: #000000;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}

/* NAVEGACIÓN */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 56px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.brand-logo {
  width: 140px;
  height: auto;
  filter: brightness(0) invert(1);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 32px;
}

.link-login {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #ffffff;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.link-login:hover {
  opacity: 0.7;
}

.link-register {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #1265ff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.2s ease;
}

.link-register:hover {
  gap: 8px;
  text-shadow: 0 0 15px rgba(18, 101, 255, 0.4);
}

.btn-cta-small {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #ffffff;
  background: #1265ff;
  text-decoration: none;
  padding: 10px 22px;
  border-radius: 999px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(18, 101, 255, 0.3);
}

/* HERO SECTION */
.hero {
  position: relative;
  padding: 100px 56px 140px;
  background: #000000;
  overflow: hidden;
}

/* Gradientes sutiles de fondo para iluminar el Hero */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(
      circle at top right,
      rgba(18, 101, 255, 0.15),
      transparent 30%
    ),
    radial-gradient(
      circle at left center,
      rgba(255, 255, 255, 0.03),
      transparent 25%
    );
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 80px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-title {
  font-family: "Montserrat", sans-serif;
  font-weight: 900;
  font-size: clamp(2.8rem, 6.5vw, 5.6rem);
  line-height: 1.06;
  letter-spacing: -0.045em;
  color: #ffffff;
  margin: 0 0 32px;
}

.title-em {
  font-style: italic;
  font-weight: 900;
  color: #1265ff !important;
  white-space: nowrap;
}

.hero-cta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-cta {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  background: #1265ff;
  text-decoration: none;
  padding: 18px 36px;
  border-radius: 999px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(18, 101, 255, 0.2);
}

.btn-cta:hover {
  background: #2570ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(18, 101, 255, 0.4);
}

.btn-ghost {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  text-decoration: none;
  padding: 18px 28px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

/* ÁREA DEL MOCKUP DINÁMICO */
.hero-right {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.mockup-glow {
  position: absolute;
  width: 80%;
  height: 80%;
  background: #1265ff;
  filter: blur(120px);
  opacity: 0.2;
  border-radius: 50%;
  z-index: 0;
}

.mockup-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 650px;
  transform: translateY(-15px);
}

/* CONTENEDOR DE TRANSICIÓN */
.light-section-wrapper {
  background: #f5f8ff;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 64px;
    text-align: center;
  }
  .hero-left {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .hero-cta {
    justify-content: center;
  }
  .hero-right {
    order: -1;
  }
}

@media (max-width: 640px) {
  .top-nav,
  .hero {
    padding-left: 24px;
    padding-right: 24px;
  }
  .link-login {
    display: none;
  }
}
</style>
