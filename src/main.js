/**
 * @file main.js
 * @description Punto de entrada principal de la aplicación. 
 * Se encarga de instanciar Vue y conectar los plugins fundamentales:
 * Pinia (Estado), Router (Navegación) y Vuetify (Diseño y Componentes).
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// --- Configuración de Vuetify ---
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Configuración de Iconos (Material Design Icons)
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

/**
 * Personalización de Vuetify con la identidad visual de Future Space.
 * Implementa una paleta semántica basada en tendencias SaaS contemporáneas,
 * optimizando el contraste y la legibilidad.
 */
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'futureSpaceTheme',
    themes: {
      futureSpaceTheme: {
        dark: false,
        colors: {
          primary: '#1265FF',      // Azul corporativo: Botones de acción y estados activos.
          secondary: '#0A275C',    // Azul profundo: Para jerarquía en headers y secciones.
          accent: '#3D83FF',       // Azul medio: Enlaces y énfasis visuales.
          background: '#F5F8FF',   // Fondo suavizado: Evita el blanco puro para reducir fatiga.
          surface: '#FFFFFF',      // Color de superficies: Tarjetas, modales y campos de entrada.
          'on-surface': '#1A1A1A', // Contraste tipográfico: Texto principal sobre fondo claro.
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

/**
 * Inicialización de la Aplicación
 * Se inyectan los plugins en la instancia de Vue y se monta el proyecto 
 * en el contenedor del DOM identificado como '#app'.
 */
const app = createApp(App)

app.use(createPinia()) // Gestión de estado global
app.use(router)      // Gestión de rutas
app.use(vuetify)     // Sistema de diseño y UI

app.mount('#app')