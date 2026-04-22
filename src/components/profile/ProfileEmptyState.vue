<template>
  <section class="empty-section">
    <v-icon size="48" color="rgba(255,255,255,0.1)">mdi-music-note-plus</v-icon>
    <p class="empty-title">Tu biblioteca está vacía</p>
    <p class="empty-detail">
      Ve a Explorar para descubrir artistas y álbumes y añadirlos a tu
      colección.
    </p>
    <router-link to="/profile/explore" class="empty-btn">
      Explorar música
    </router-link>
  </section>
</template>

<script setup>
/**
 * @file ProfileEmptyState.vue
 * @description Empty state del dashboard. Lo pinta el padre cuando la
 * biblioteca está vacía — mejor esto que dejar varias secciones vacías
 * colgadas sin explicación. El CTA manda directamente a Explorar porque
 * es el siguiente paso natural: si no tienes nada, busca algo.
 */
</script>

<style scoped>
/* Todo centrado para que el empty state se lea como una sola "escena". */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 12px;
  margin-bottom: 48px;
}

.empty-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
}

.empty-detail {
  font-family: "Roboto", sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.15);
  margin: 0;
  text-align: center;
  max-width: 360px;
}

/* CTA principal. Mismo azul que el resto de botones de marca. */
.empty-btn {
  margin-top: 12px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 10px;
  background: #1265ff;
  color: #ffffff;
  text-decoration: none;
  transition: background 0.2s;
}
.empty-btn:hover {
  background: #0d52d6;
}
</style>
