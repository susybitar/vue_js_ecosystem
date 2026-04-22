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
            :class="{ 'active-avatar': editUser.avatarSeed === seed }"
            @click="editUser.avatarSeed = seed"
          >
            <v-img
              :src="`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=1265ff,303030,000000`"
            ></v-img>
          </v-avatar>
        </div>

        <v-form v-model="isFormValid" @submit.prevent="saveProfile">
          <v-text-field
            label="NOMBRE"
            variant="underlined"
            color="#1265FF"
            v-model="editUser.name"
            :rules="nameRules"
            class="mb-6 white-input text-white"
          />
          <v-text-field
            label="EMAIL"
            variant="underlined"
            color="#1265FF"
            v-model="editUser.email"
            :rules="emailRules"
            class="mb-10 white-input text-white"
          />
          <v-btn
            block
            color="#1265FF"
            variant="flat"
            class="font-weight-black py-6 rounded-lg"
            type="submit"
            :disabled="!isFormValid"
            :loading="authStore.loading"
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
 * @description Dock lateral flotante con cristal. Es la navegación principal
 * de la zona privada (Perfil / Artistas / Álbumes / Explorar) y además
 * contiene el menú de usuario con el modal de edición de perfil. El dock y
 * el modal viven juntos porque comparten el mismo `currentUser` y el mismo
 * flujo — separarlos sería duplicar imports sin ganar nada.
 */
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useUIStore } from "../../stores/ui";

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

/** Modal de edición de perfil abierto/cerrado. */
const showSettings = ref(false);

/** Validez del formulario del modal (lo rellena Vuetify vía v-model). */
const isFormValid = ref(false);

/**
 * Seeds que paso a Dicebear para generar avatares. Tiro de seeds con
 * "personalidad" (Astro, Cosmo, Nova...) porque quedan mejor en la UI que
 * strings aleatorios.
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

/**
 * Seed por defecto si el usuario nunca eligió avatar. Lo dejo en una
 * constante para que dock y modal usen exactamente el mismo fallback.
 */
const DEFAULT_AVATAR_SEED = "Cyberpunk";

/**
 * Copia reactiva del usuario, sólo para el modal. No toco `authStore.currentUser`
 * hasta que el usuario pulse "Guardar"; así si cierra sin guardar no pierdo
 * nada y tampoco dejo al store en un estado a medias.
 */
const editUser = reactive({
  name: authStore.currentUser?.name || "",
  email: authStore.currentUser?.email || "",
  avatarSeed: authStore.currentUser?.avatarSeed || DEFAULT_AVATAR_SEED,
});

/**
 * URL del avatar que pinto en el dock. Lo saco de `currentUser` (no de
 * `editUser`) para que reaccione al guardar el perfil y también a cualquier
 * cambio externo — por ejemplo si en el futuro añado refresh de sesión.
 */
const userAvatarUrl = computed(() => {
  const seed = authStore.currentUser?.avatarSeed || DEFAULT_AVATAR_SEED;
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=1265ff,303030,000000`;
});

/** Reglas del nombre. Mismos mínimos/máximos que en el paso 3 del registro. */
const nameRules = [
  (v) => !!v?.trim() || "El nombre no puede quedar vacío",
  (v) => (v?.trim().length || 0) >= 2 || "Mínimo 2 caracteres",
  (v) => (v?.trim().length || 0) <= 40 || "Máximo 40 caracteres",
];

/**
 * Reglas del email: presencia y formato. No compruebo duplicados aquí porque
 * el store ya devuelve `reason: "email-taken"` si choca con otra cuenta, y
 * prefiero enseñar ese error vía toast que duplicar la lógica en el form.
 */
const emailRules = [
  (v) => !!v?.trim() || "El email es obligatorio",
  (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim()) ||
    "Revisa el formato del email",
];

/** Accesos directos del dock. El orden es el que quiero ver de arriba abajo. */
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
 * Abre el modal de perfil. Antes de abrir, re-copio los datos del usuario
 * al `editUser`; así si el usuario abre el modal, cambia algo, cierra sin
 * guardar y lo vuelve a abrir, no se queda viendo sus cambios descartados.
 */
function openSettings() {
  editUser.name = authStore.currentUser?.name || "";
  editUser.email = authStore.currentUser?.email || "";
  editUser.avatarSeed =
    authStore.currentUser?.avatarSeed || DEFAULT_AVATAR_SEED;
  showSettings.value = true;
}

/**
 * Guarda los cambios del perfil. Traduzco los `reason` técnicos del store a
 * mensajes que el usuario pueda entender — "email-taken" → toast en rojo,
 * cualquier otro → error genérico. Si todo va bien, cierro el modal.
 */
function saveProfile() {
  if (!isFormValid.value) return;

  const result = authStore.updateProfile({
    name: editUser.name,
    email: editUser.email,
    avatarSeed: editUser.avatarSeed,
  });

  if (result.ok) {
    uiStore.notify("Perfil actualizado");
    showSettings.value = false;
    return;
  }

  if (result.reason === "email-taken") {
    uiStore.notify("Ese email ya está en uso por otra cuenta", "error");
    return;
  }

  uiStore.notify("No pudimos actualizar tu perfil", "error");
}

/** Cierra sesión y vuelve a la landing pública con un toast informativo. */
function handleLogout() {
  authStore.logout();
  uiStore.notify("Sesión cerrada", "info");
  router.push("/");
}
</script>

<style scoped>
/* El dock vive fijado a la izquierda y centrado verticalmente. */
.glass-dock-container {
  position: fixed;
  left: 24px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  z-index: 1000;
}

/* Cristal: fondo casi transparente + blur fuerte + borde apenas visible. */
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

/* Avatar elegido en el modal: borde azul + escala + glow. */
.active-avatar {
  border: 2px solid #1265ff;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(18, 101, 255, 0.4);
}

.border-subtle {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Inputs del modal en blanco para que contrasten con el fondo negro. */
.white-input :deep(input) {
  color: white !important;
  font-weight: 700;
}

/* Scrollbar fina para la tira de avatares cuando no cabe en el modal. */
.custom-scroll::-webkit-scrollbar {
  height: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}
</style>
