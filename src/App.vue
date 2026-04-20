<template>
  <v-app :class="themeClass">
    <v-app-bar v-if="showNavbar" class="glass-navbar" elevation="0">
      <div
        class="d-flex align-center ml-4 cursor-pointer"
        @click="$router.push('/')"
      >
        <v-img :src="favicon" width="32" height="32" contain />
        <span class="navbar-brand ml-2">MusicSpace</span>
      </div>

      <v-spacer></v-spacer>

      <nav class="d-flex align-center ga-3 mr-4">
        <template v-if="authStore.isLoggedIn">
          <v-btn class="text-none" rounded="pill" to="/profile" variant="text"
            >Mi Perfil</v-btn
          >
          <v-btn
            class="text-none"
            rounded="pill"
            to="/profile/artists"
            variant="text"
            >Artistas</v-btn
          >
          <v-btn
            class="text-none"
            rounded="pill"
            to="/profile/albums"
            variant="text"
            >Álbumes</v-btn
          >
          <v-divider vertical class="mx-2 my-4"></v-divider>
          <v-btn
            variant="text"
            color="red-lighten-1"
            rounded="pill"
            @click="handleLogout"
            >Cerrar Sesión</v-btn
          >
        </template>

        <template v-else>
          <v-btn variant="text" rounded="pill" to="/login"
            >Iniciar Sesión</v-btn
          >
          <v-btn
            variant="flat"
            color="#1265FF"
            class="text-white"
            rounded="pill"
            to="/register"
            >Registrarse</v-btn
          >
        </template>
      </nav>
    </v-app-bar>

    <v-main :class="{ 'pa-0': isFullPage }">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
/**
 * @file App.vue
 * @description Componente raíz de la aplicación. Orquesta el diseño global,
 * gestiona la visibilidad de la barra de navegación y aplica el tema visual
 * según la ruta activa (Pitch Black para gestión o claro para estáticas).
 */

import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import favicon from "@/assets/img/logotipo/favicon.svg";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

/**
 * Determina si la página debe ocupar el 100% del viewport sin márgenes.
 * Se aplica a los flujos de autenticación y a la zona privada del perfil.
 */
const isFullPage = computed(() => {
  const paths = [
    "/login",
    "/register",
    "/register-confirm",
    "/forgot-password",
  ];
  return paths.includes(route.path) || route.path.startsWith("/profile");
});

/**
 * Controla la barra de navegación de Vuetify.
 * No se muestra en la Home (usa una personalizada) ni en las zonas de gestión.
 */
const showNavbar = computed(() => {
  return route.path !== "/" && !isFullPage.value;
});

/**
 * Aplica clases de CSS condicionales para forzar el fondo negro puro en
 * áreas de trabajo profesionales.
 */
const themeClass = computed(() => ({
  "pitch-black-mode": isFullPage.value,
}));

/**
 * Lógica de salida de usuario: limpia el store y redirige al acceso.
 */
const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style>
/* Tipografía base del proyecto */
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&display=swap");

.v-application {
  font-family: "Montserrat", sans-serif !important;
  background-color: #f5f8ff !important; /* Fondo claro por defecto (Landing) */
}

/* --- TEMA PITCH BLACK --- */
/* Forzado de colores para una experiencia de usuario oscura y sin distracciones */
.pitch-black-mode,
.pitch-black-mode .v-application__wrap {
  background-color: #000000 !important;
  color: #ffffff !important;
}

.pa-0 {
  padding-top: 0 !important;
}

/* Estilización de la Navbar superior con efecto cristalizado */
.glass-navbar {
  background-color: rgba(245, 248, 255, 0.8) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(18, 101, 255, 0.1) !important;
}

.navbar-brand {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1265ff;
}
</style>
