<template>
  <v-snackbar
    :model-value="uiStore.snackbar.show"
    @update:model-value="onVisibilityChange"
    :timeout="uiStore.snackbar.timeout"
    location="top"
    :offset="24"
    transition="slide-y-transition"
    class="global-snackbar"
  >
    <div class="snackbar-card" :style="{ '--accent': colorForType }">
      <span class="accent-bar" aria-hidden="true"></span>

      <v-icon :color="colorForType" size="18" class="snackbar-icon">
        {{ iconForType }}
      </v-icon>

      <span class="snackbar-text">{{ uiStore.snackbar.text }}</span>

      <button
        type="button"
        class="close-btn"
        aria-label="Cerrar notificación"
        @click="uiStore.dismiss()"
      >
        <v-icon size="14">mdi-close</v-icon>
      </button>
    </div>
  </v-snackbar>
</template>

<script setup>
/**
 * @file GlobalSnackbar.vue
 * @description Snackbar global. Se monta una sola vez en App.vue y pinta lo
 * que haya en el uiStore, para que desde cualquier vista/store/composable me
 * baste con hacer `uiStore.notify(...)` y no tener que montar snackbars
 * locales por todas partes.
 *
 * Pinto mi propia tarjeta (glass oscuro) en vez de usar el fondo sólido que
 * trae Vuetify por defecto: el color del tipo se queda sólo como acento (icono
 * + barra lateral), así los toasts no chocan con el Pitch Black.
 */

import { computed } from 'vue'
import { useUIStore } from '../../stores/ui'

const uiStore = useUIStore()

/**
 * Colores por tipo. Verde "Spotify" para success, rojo saturado para error,
 * azul de marca para info, ámbar para warning. No los leo del tema de Vuetify
 * porque quiero controlar yo los hex exactos.
 */
const TYPE_COLORS = {
  success: '#1DB954',
  error: '#FF3B3B',
  info: '#1265FF',
  warning: '#FB8C00'
}

/** Iconos por tipo. Las claves tienen que coincidir con TYPE_COLORS. */
const TYPE_ICONS = {
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  info: 'mdi-information',
  warning: 'mdi-alert'
}

const colorForType = computed(
  () => TYPE_COLORS[uiStore.snackbar.type] || TYPE_COLORS.success
)

const iconForType = computed(
  () => TYPE_ICONS[uiStore.snackbar.type] || TYPE_ICONS.success
)

/**
 * Sincroniza el estado con el store cuando es Vuetify quien cierra el
 * snackbar — por timeout o por click fuera. Si no hago esto, el `show` del
 * store se queda en `true` y el siguiente `notify` no abre nada.
 *
 * @param {boolean} value - Nuevo estado de visibilidad que emite Vuetify.
 */
function onVisibilityChange(value) {
  if (!value) uiStore.dismiss()
}
</script>

<style scoped>
/* Anulo el fondo y el padding del wrapper de Vuetify; el look lo pone mi
   tarjeta custom. */
.global-snackbar :deep(.v-snackbar__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-height: 0 !important;
  min-width: 0 !important;
  border-radius: 0 !important;
}

.global-snackbar :deep(.v-snackbar__content) {
  padding: 0 !important;
}

/* Tarjeta glass oscura. La variable --accent viene del template para que la
   barrita lateral y el icono usen el mismo color del tipo (success/error/...). */
.snackbar-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 14px 20px;
  /* Capa oscura medio transparente: lo que el blur va a "amplificar". */
  background: rgba(28, 28, 30, 0.55);
  /* Blur fuerte + saturate: si debajo hay un poster del Explore o un álbum
     coloreado, quiero que se intuya a través del cristal. */
  backdrop-filter: blur(32px) saturate(160%);
  -webkit-backdrop-filter: blur(32px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  /* Sombra exterior para que flote sobre el negro y brillo superior interior
     simulando el reflejo de un borde de cristal. */
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

/* Barrita vertical a la izquierda con el color del tipo. Es el único acento
   de color de la tarjeta, así el mensaje se lee sin ruido. */
.accent-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
}

.snackbar-icon {
  flex-shrink: 0;
}

.snackbar-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.01em;
  line-height: 1.3;
}

/* Aspa discreta. Sólo se resalta al hover; en el primer boceto tenía un botón
   "Cerrar" con texto y quedaba demasiado pesado. */
.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 4px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.35);
  transition: color 0.2s ease, background 0.2s ease;
}

.close-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
}
</style>
