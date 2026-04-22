<template>
  <section v-if="items.length > 0" class="profile-section">
    <div class="section-header">
      <h2 class="section-title">Tendencias</h2>
      <router-link to="/profile/explore" class="section-link">
        Explorar más
      </router-link>
    </div>

    <div class="trending-scroll">
      <div v-for="item in items" :key="item.id" class="trending-card">
        <div class="card-cover">
          <v-img
            :src="item.cover_big || item.cover_medium"
            cover
            aspect-ratio="1"
            class="cover-img"
          />
        </div>
        <div class="card-info">
          <p class="card-name" :title="item.title">{{ item.title }}</p>
          <p class="card-detail">{{ item.artist?.name }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * @file ProfileTrendingStrip.vue
 * @description Strip horizontal de tendencias globales. Lo uso en el
 * dashboard del perfil como guiño "lo que más suena fuera de tu biblioteca".
 * Los items los pide el padre a Deezer y me los pasa ya filtrados.
 *
 * @prop {Array} items - Álbumes/charts de Deezer a pintar en la tira.
 */
defineProps({
  items: { type: Array, required: true },
});
</script>

<style scoped>
.profile-section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.section-link {
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  transition: color 0.2s;
}
.section-link:hover {
  color: #5a9aff;
}

/* Overflow-x con la scrollbar oculta para que parezca un carrusel. */
.trending-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.trending-scroll::-webkit-scrollbar {
  display: none;
}

.trending-card {
  flex: 0 0 160px;
  max-width: 160px;
  cursor: default;
}

/* Portada cuadrada con sombra. Al hover, sube ligeramente + intensifica sombra. */
.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  margin-bottom: 12px;
  transition:
    transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.3s ease;
}

.trending-card:hover .card-cover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
}

.cover-img {
  width: 100%;
  height: 100%;
}

.card-info {
  padding: 0 2px;
}

.card-name {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-detail {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
