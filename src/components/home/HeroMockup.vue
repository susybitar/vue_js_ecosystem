<template>
  <div class="hero-aura" @mousemove="onMouseMove" @mouseleave="resetMouse">
    <div class="aura-field" :style="auraStyle"></div>

    <div class="dust-field">
      <span v-for="n in 8" :key="n" class="dust" :style="{ '--i': n }"></span>
    </div>

    <div class="library-panel" :style="tiltStyle">
      <header class="panel-header">
        <div class="panel-title">
          <v-icon size="14" color="#1265FF">mdi-music-box-multiple</v-icon>
          <span>Mi biblioteca</span>
        </div>
        <div class="panel-actions">
          <v-icon size="14" color="rgba(255,255,255,0.35)">mdi-magnify</v-icon>
          <v-icon size="14" color="rgba(255,255,255,0.35)"
            >mdi-tune-variant</v-icon
          >
        </div>
      </header>

      <div class="filter-chips">
        <span
          v-for="(chip, idx) in FILTER_CHIPS"
          :key="chip"
          class="filter-chip"
          :class="{ 'chip-active': idx === 0 }"
        >
          {{ chip }}
        </span>
      </div>

      <div class="album-grid">
        <div
          v-for="(album, idx) in gridAlbums"
          :key="album?.id || idx"
          class="album-cell"
          :class="{ 'cell-active': idx === activeIndex && album }"
        >
          <div class="album-cover">
            <img
              v-if="album"
              :src="album.cover_medium || album.cover_big"
              :alt="album.title"
            />
            <div v-else class="cover-skeleton"></div>

            <div v-if="album && idx === activeIndex" class="active-ring"></div>
          </div>
          <div class="album-meta">
            <span class="album-title">{{ album?.title || "—" }}</span>
            <span class="album-sub">
              {{ album?.artist?.name || "" }}
              <template v-if="album && year(album)">
                · {{ year(album) }}</template
              >
            </span>
          </div>
        </div>
      </div>

      <footer class="panel-footer">
        <span class="stat-dot"></span>
        <span class="stat">{{ albums.length }} álbumes</span>
        <span class="stat-sep">·</span>
        <span class="stat">{{ uniqueArtists }} artistas</span>
        <span class="stat-sep">·</span>
        <span class="stat">ordenado por género</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
/**
 * @file HeroMockup.vue (Biblioteca Dinámica)
 * @description Representación visual premium de la biblioteca del usuario.
 * Incluye efectos de profundidad (tilt), partículas de polvo y un fondo atmosférico (aura)
 * que cambia de color basándose en el álbum seleccionado actualmente.
 */

import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useDeezerApi } from "../../composables/useDeezerApi";
import { useDominantColors } from "../../composables/useDominantColors";

const { searchDeezer } = useDeezerApi();
const { extractColors } = useDominantColors();

/**
 * Curaduría de álbumes para asegurar un impacto visual diverso y profesional.
 * @type {string[]}
 */
const CURATED_QUERIES = [
  "AM Arctic Monkeys",
  "Random Access Memories Daft Punk",
  "Currents Tame Impala",
  "Channel Orange Frank Ocean",
  "Motomami Rosalia",
  "Blackstar David Bowie",
];

const FILTER_CHIPS = ["Todos", "Rock", "Indie", "Electrónica", "Pop"];

/** Estado de los álbumes cargados y la celda activa para el ciclo visual */
const albums = ref([]);
const activeIndex = ref(0);

/** Colores del aura atmosférica (empiezan con tonos base de MusicSpace) */
const auraColors = ref([
  "rgb(18, 101, 255)",
  "rgb(10, 39, 92)",
  "rgb(5, 5, 5)",
]);

/** Posición del ratón normalizada (0 a 1) para el efecto Tilt */
const mouse = ref({ x: 0.5, y: 0.5 });

let cycleTimer = null;

/**
 * Genera el grid de 6 elementos. Si la API falla o devuelve menos,
 * rellena con null para mostrar esqueletos de carga.
 */
const gridAlbums = computed(() => {
  const list = [...albums.value];
  while (list.length < 6) list.push(null);
  return list.slice(0, 6);
});

/** Devuelve el objeto del álbum que tiene el foco actual */
const activeAlbum = computed(() => albums.value[activeIndex.value] || null);

/**
 * Cálculo de artistas únicos para las estadísticas del pie del panel.
 */
const uniqueArtists = computed(() => {
  const names = new Set(
    albums.value.map((a) => a.artist?.name).filter(Boolean),
  );
  return Math.max(names.size, 1);
});

/**
 * Formatea la fecha de lanzamiento para extraer solo el año.
 * @param {object} album
 * @returns {string|null}
 */
function year(album) {
  return album?.release_date ? album.release_date.slice(0, 4) : null;
}

/**
 * Genera el degradado radial dinámico para el fondo atmosférico.
 */
const auraStyle = computed(() => {
  const [c1, c2, c3] = auraColors.value;
  return {
    background: `
      radial-gradient(circle at 20% 20%, ${c1} 0%, transparent 55%),
      radial-gradient(circle at 80% 30%, ${c2} 0%, transparent 50%),
      radial-gradient(circle at 50% 85%, ${c3} 0%, transparent 60%),
      #050505
    `,
  };
});

/**
 * Calcula la rotación 3D basada en la posición del ratón.
 */
const tiltStyle = computed(() => {
  const rotateY = (mouse.value.x - 0.5) * 10;
  const rotateX = (0.5 - mouse.value.y) * 10;
  // Mantenemos el translate(-50%, -50%) dentro del transform porque el estilo inline
  // pisa la regla CSS base; sin él, el panel pierde el centrado y se corta.
  return {
    transform: `translate(-50%, -50%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
  };
});

/**
 * Captura el movimiento del ratón sobre el componente.
 * @param {MouseEvent} event
 */
function onMouseMove(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  mouse.value = {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
}

/** Resetea la inclinación cuando el ratón sale del componente */
function resetMouse() {
  mouse.value = { x: 0.5, y: 0.5 };
}

/**
 * Carga un álbum específico desde la API de Deezer.
 * @param {string} query - Término de búsqueda
 * @returns {Promise<object|null>}
 */
async function loadCurated(query) {
  try {
    const results = await searchDeezer("album", query);
    return results?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Actualiza los colores del fondo extrayendo los tonos dominantes de la portada activa.
 */
async function refreshAura() {
  if (!activeAlbum.value) return;
  const url = activeAlbum.value.cover_big || activeAlbum.value.cover_medium;
  auraColors.value = await extractColors(url, 3);
}

/**
 * Incrementa el índice activo y refresca la atmósfera visual.
 */
function cycleActive() {
  if (!albums.value.length) return;
  activeIndex.value = (activeIndex.value + 1) % albums.value.length;
  refreshAura();
}

/**
 * Inicializa la carga de datos y establece el temporizador de ciclo.
 */
onMounted(async () => {
  const loaded = await Promise.all(CURATED_QUERIES.map(loadCurated));
  albums.value = loaded.filter(Boolean);
  await refreshAura();
  cycleTimer = setInterval(cycleActive, 4500);
});

/** Limpieza de timers al destruir el componente */
onBeforeUnmount(() => {
  if (cycleTimer) clearInterval(cycleTimer);
});
</script>

<style scoped>
.hero-aura {
  position: relative;
  width: 100%;
  height: 520px;
  border-radius: 28px;
  overflow: hidden;
  perspective: 1600px;
  isolation: isolate;
}

/* Aura atmosférica con colores de la portada activa */
.aura-field {
  position: absolute;
  inset: -10%;
  filter: blur(70px) saturate(1.3);
  transition: background 1.4s ease;
  animation: breathe 12s ease-in-out infinite;
  z-index: 0;
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

/* Partículas de polvo en overlay */
.dust-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: overlay;
}

.dust {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  top: calc(100% + 10px);
  left: calc((var(--i) * 11%) + 6%);
  animation: float-up 14s linear infinite;
  animation-delay: calc(var(--i) * -1.5s);
}

@keyframes float-up {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  15% {
    opacity: 0.7;
  }
  85% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-600px) translateX(30px);
    opacity: 0;
  }
}

/* Panel glass: replica de la interfaz interna */
.library-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 48px);
  max-width: 500px;
  padding: 20px;
  border-radius: 22px;
  background: rgba(12, 12, 14, 0.55);
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 40px 80px -20px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  z-index: 2;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.3px;
}

.panel-actions {
  display: flex;
  gap: 12px;
}

/* Chips de filtro */
.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  font-family: "Montserrat", sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.chip-active {
  background: #1265ff;
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(18, 101, 255, 0.4);
}

/* Grid de portadas */
.album-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.album-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.35s ease;
}

.cell-active {
  transform: translateY(-3px);
}

.album-cover {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03)
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Anillo de selección */
.active-ring {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  border: 2px solid #1265ff;
  box-shadow:
    0 0 0 3px rgba(18, 101, 255, 0.25),
    0 10px 24px rgba(18, 101, 255, 0.45);
  pointer-events: none;
  animation: ring-pulse 2s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 3px rgba(18, 101, 255, 0.25),
      0 10px 24px rgba(18, 101, 255, 0.45);
  }
  50% {
    box-shadow:
      0 0 0 5px rgba(18, 101, 255, 0.1),
      0 14px 28px rgba(18, 101, 255, 0.55);
  }
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 2px;
}

.album-title {
  font-family: "Montserrat", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-sub {
  font-family: "Roboto", sans-serif;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Pie del panel */
.panel-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-family: "Roboto", sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
}

.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1265ff;
  box-shadow: 0 0 10px rgba(18, 101, 255, 0.8);
  animation: live-pulse 2s infinite;
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.stat-sep {
  color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 960px) {
  .hero-aura {
    height: 460px;
  }
  .library-panel {
    max-width: 420px;
    padding: 16px;
    gap: 12px;
  }
  .album-grid {
    gap: 8px;
  }
  .album-title {
    font-size: 0.65rem;
  }
  .album-sub {
    font-size: 0.55rem;
  }
}
</style>
