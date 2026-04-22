/**
 * @file main.js
 * @description Arranque de la app. Monto Vue y le engancho Pinia, el router
 * y Vuetify. Aquí también dejo el tema custom porque es configuración única
 * de inicio y no me compensaba sacarlo a un archivo aparte.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

/**
 * Tema claro custom. Lo llamo futureSpaceTheme porque fue el nombre que
 * cogí del mock inicial. Los tonos azules son la identidad visual del
 * proyecto; el modo "dark" real de la app se pinta con variables CSS en
 * cada vista, no con otro tema de Vuetify.
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
          primary: '#1265FF',
          secondary: '#0A275C',
          accent: '#3D83FF',
          background: '#F5F8FF',
          surface: '#FFFFFF',
          'on-surface': '#1A1A1A',
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

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
