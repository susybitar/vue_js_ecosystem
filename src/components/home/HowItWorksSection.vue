<template>
  <section class="how-it-works-section" aria-label="Cómo funciona MusicSpace">
    <v-container class="section-container px-4">
      <div class="text-center mb-16">
        <p class="section-eyebrow text-blue-accent">EL PROCESO</p>
        <h2 class="section-title text-white">De caos a control en 3 pasos.</h2>
      </div>

      <div class="steps-grid">
        <div
          class="step-card glass-panel"
          v-for="(step, index) in steps"
          :key="index"
        >
          <div class="step-number text-blue-accent">0{{ index + 1 }}</div>
          <h3 class="step-title text-white">{{ step.title }}</h3>
          <p class="step-desc">{{ step.desc }}</p>
        </div>
      </div>
    </v-container>
  </section>
</template>

<script setup>
/**
 * @file HowItWorksSection.vue
 * @description Sección "Cómo funciona" de la landing: tres tarjetas glass
 * con los pasos del flujo de usuario. Todo es estático; si mañana añado un
 * paso, basta con meterlo en `steps` y el grid se adapta solo.
 */

/** Pasos del flujo. La numeración 01/02/03 la añade el template. */
const steps = [
  {
    title: "Sincroniza tu catálogo",
    desc: "Importa tu biblioteca actual o explora nuevos horizontes usando nuestra integración con la API de Deezer.",
  },
  {
    title: "Audita identidades",
    desc: "Visualiza metadatos, álbumes y estadísticas reales. Gestiona tu inventario con precisión profesional.",
  },
  {
    title: "Toma el control",
    desc: "Accede a tu panel Pitch Black. Sin distracciones, sin ruido. Solo tú y la arquitectura de tu música.",
  },
];
</script>

<style scoped>
/* Fondo negro puro. El !important es para ganarle al tema global de Vuetify. */
.how-it-works-section {
  background: #000000 !important;
  padding: 120px 0;
  color: #ffffff;
  position: relative;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-eyebrow {
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.text-blue-accent {
  color: #1265ff !important;
}

.section-title {
  font-family: "Montserrat", sans-serif;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
}

/* Grid responsive: auto-fit con minmax hace que las tarjetas bajen a una
   columna en móvil sin tocar nada en JS. */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.step-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 48px 32px;
  text-align: left;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
}

.step-card:hover {
  transform: translateY(-5px);
  border-color: rgba(18, 101, 255, 0.3);
}

.step-number {
  font-family: "Montserrat", sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  opacity: 0.8;
  margin-bottom: 24px;
  line-height: 1;
}

.step-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.step-desc {
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
}
</style>
