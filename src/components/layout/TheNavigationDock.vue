<template>
  <div class="glass-dock-container">
    <nav class="glass-dock">
      <div class="d-flex justify-center w-100">
        <button class="dock-logo-btn mb-10" @click="router.push('/profile')">
          <svg
            viewBox="0 0 100 100"
            width="32"
            height="32"
            style="background: transparent"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="white"
              stroke-width="8"
              stroke-dasharray="180 100"
              fill="none"
            />
            <rect x="35" y="30" width="8" height="40" rx="4" fill="white" />
            <rect x="50" y="20" width="8" height="60" rx="4" fill="white" />
            <rect x="65" y="35" width="8" height="30" rx="4" fill="white" />
          </svg>
          <v-tooltip activator="parent" location="right">INICIO</v-tooltip>
        </button>
      </div>

      <div class="d-flex flex-column align-center w-100 ga-6">
        <v-btn
          v-for="item in navItems"
          :key="item.value"
          :to="item.path"
          icon
          variant="text"
          class="dock-btn mx-auto"
        >
          <v-icon size="24">{{ item.icon }}</v-icon>
          <v-tooltip activator="parent" location="right">{{
            item.title
          }}</v-tooltip>
        </v-btn>
      </div>

      <v-spacer></v-spacer>

      <div class="d-flex justify-center w-100 pb-6">
        <v-menu
          min-width="200px"
          rounded="xl"
          transition="slide-x-transition"
          location="right"
          offset="12"
        >
          <template v-slot:activator="{ props }">
            <v-avatar
              v-bind="props"
              size="40"
              class="cursor-pointer avatar-border mx-auto"
            >
              <v-img :src="userAvatarUrl"></v-img>
            </v-avatar>
          </template>
          <v-list bg-color="#050505" theme="dark" class="border-subtle pa-2">
            <v-list-item
              prepend-icon="mdi-account-outline"
              title="Perfil"
              @click="openSettings"
              class="rounded-lg mb-1"
            />
            <v-divider class="my-2 border-opacity-10" />
            <v-list-item
              prepend-icon="mdi-logout"
              title="Salir"
              color="error"
              @click="handleLogout"
              class="rounded-lg text-red-accent-2"
            />
          </v-list>
        </v-menu>
      </div>
    </nav>

    <v-dialog v-model="showSettings" max-width="480">
      <v-card class="bg-black border-subtle pa-10 rounded-xl">
        <h2
          class="text-h4 font-weight-black text-white mb-6 uppercase ls-tight"
        >
          Perfil de Usuario.
        </h2>
        <p class="text-overline text-grey-darken-1 mb-4 uppercase">
          Selecciona tu Avatar
        </p>

        <div class="d-flex ga-4 mb-8 overflow-x-auto pb-2 custom-scroll">
          <v-avatar
            v-for="seed in botSeeds"
            :key="seed"
            size="64"
            class="cursor-pointer avatar-option"
            :class="{ 'active-avatar': currentAvatarSeed === seed }"
            @click="currentAvatarSeed = seed"
          >
            <v-img
              :src="`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=1265ff,303030,000000`"
            ></v-img>
          </v-avatar>
        </div>

        <v-form @submit.prevent="saveProfile">
          <v-text-field
            label="NOMBRE"
            variant="underlined"
            color="#1265FF"
            v-model="editUser.name"
            class="mb-6 white-input text-white"
          />
          <v-text-field
            label="EMAIL"
            variant="underlined"
            color="#1265FF"
            v-model="editUser.email"
            class="mb-10 white-input text-white"
          />
          <v-btn
            block
            color="#1265FF"
            variant="flat"
            class="font-weight-black py-6 rounded-lg"
            type="submit"
            >GUARDAR CAMBIOS</v-btn
          >
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
/**
 * @file TheNavigationDock.vue
 * @description Dock lateral flotante con efecto glassmorphism. Centraliza la navegación principal
 * de la zona privada y la gestión del perfil de usuario.
 */
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

/** Estado para mostrar/ocultar el modal de edición de perfil */
const showSettings = ref(false);

/** * Semillas para la generación de avatares mediante Dicebear API.
 * Permite que el usuario elija una identidad visual robótica.
 */
const botSeeds = [
  "Spike",
  "Cyberpunk",
  "Groovy",
  "Glitch",
  "Astro",
  "Nova",
  "Cosmo",
];

/** Semilla seleccionada por defecto */
const currentAvatarSeed = ref("Cyberpunk");

/** * Clon reactivo de los datos del usuario para el formulario de edición.
 * Evitamos mutar el store directamente hasta que el usuario guarde.
 */
const editUser = reactive({
  name: authStore.currentUser?.name || "",
  email: authStore.currentUser?.email || "",
});

/** Construye la URL del avatar basándose en la semilla elegida */
const userAvatarUrl = computed(
  () =>
    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentAvatarSeed.value}&backgroundColor=1265ff,303030,000000`,
);

/** Configuración de los accesos directos del dock */
const navItems = [
  {
    title: "ARTISTAS",
    icon: "mdi-microphone",
    path: "/profile/artists",
    value: "arts",
  },
  {
    title: "ÁLBUMES",
    icon: "mdi-album",
    path: "/profile/albums",
    value: "albs",
  },
  {
    title: "EXPLORAR",
    icon: "mdi-compass-outline",
    path: "/profile/explore",
    value: "explore",
  },
];

/**
 * Inicializa el formulario con la info actual del usuario y abre el modal.
 */
function openSettings() {
  editUser.name = authStore.currentUser?.name || "";
  editUser.email = authStore.currentUser?.email || "";
  showSettings.value = true;
}

/** * Cierra el modal de perfil.
 * Nota: La persistencia en el Store se implementará en la siguiente fase de desarrollo.
 */
function saveProfile() {
  showSettings.value = false;
}

/** * Limpia el estado de autenticación y redirige a la landing pública.
 */
function handleLogout() {
  authStore.logout();
  router.push("/");
}
</script>

<style scoped>
/* Contenedor fijo que mantiene el dock centrado verticalmente a la izquierda */
.glass-dock-container {
  position: fixed;
  left: 24px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  z-index: 1000;
}

/* Efecto Glassmorphism con desenfoque de fondo y bordes sutiles */
.glass-dock {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 40px;
  width: 64px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.dock-logo-btn {
  background: transparent !important;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  width: 100%;
  transition: transform 0.2s;
}
.dock-logo-btn:hover {
  transform: scale(1.1);
}

.dock-btn {
  color: rgba(255, 255, 255, 0.3) !important;
  transition: 0.3s;
}
.dock-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.avatar-border {
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: 0.3s;
}
.avatar-border:hover {
  transform: scale(1.1);
  border-color: #1265ff;
}

/* Marca visual para el avatar seleccionado en el modal */
.active-avatar {
  border: 2px solid #1265ff;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(18, 101, 255, 0.4);
}

.border-subtle {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Estilización de los inputs del modal para mantener el look Pitch Black */
.white-input :deep(input) {
  color: white !important;
  font-weight: 700;
}

/* Scrollbar personalizado para el selector de avatares */
.custom-scroll::-webkit-scrollbar {
  height: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}
</style>
