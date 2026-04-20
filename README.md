# Vue.js Ecosystem: SPA Development & API Integration

Este repositorio centraliza mi progresión técnica en el ecosistema Vue.js, desde
la construcción de Single Page Applications reactivas hasta la integración con
APIs REST externas y la contenedorización de aplicaciones frontend.

---

## Módulos del Repositorio

### Gestor Musical — MusicSpace

Aplicación completa de gestión musical construida sobre Vue 3, Vuetify y
Pinia, con consumo en vivo de la API pública de Deezer, autenticación
multi-paso y persistencia local. Cubre los dos ejercicios del curso en un
único producto cohesionado.

* **Destacado:** Flujo de **UI optimista** al añadir elementos desde la
  sección Explorar — la biblioteca se actualiza al instante mientras los
  metadatos (género del artista, año del álbum) se enriquecen en segundo
  plano con `Promise.race` y timeout a 3 s
  ([useLibraryActions.js](src/composables/useLibraryActions.js)).
* **Arquitectura de Estado Centralizado:** Stores Pinia con Composition API
  y persistencia en `localStorage` para mantener la biblioteca entre
  sesiones. Separación clara de stores: `music` (biblioteca + API),
  `auth` (sesión) y `ui` (snackbars globales).
* **API Centralizada en Actions de Pinia:** Todas las llamadas `axios` a
  Deezer viven dentro del store `music.js` (`searchDeezer`, `fetchTrending`),
  siguiendo el patrón recomendado por Pinia para separar la capa de datos
  de las vistas.
* **CRUD Local Completo:** Gestión de artistas y álbumes con diálogos
  reutilizables ([ArtistDialog](src/components/artists/ArtistDialog.vue),
  [AlbumDialog](src/components/albums/AlbumDialog.vue)), con detección de
  duplicados case-insensitive y desplegable de artistas vinculados.
* **Consumo de API con `v-card`:** Listado dinámico de artistas, álbumes y
  canciones en tendencia desde Deezer, pintado en componentes Vuetify
  ([ExploreCard](src/components/explore/ExploreCard.vue)).
* **Validación y Seguridad UX:** Reglas de formulario con Vuetify +
  composable centralizado
  ([useAuthValidators](src/composables/useAuthValidators.js)), autenticación
  sin enumeración de usuarios (alineado con OWASP ASVS v4), y feedback
  visual inline en cada paso del registro.
* **Componentes Reutilizables:** Tarjetas (`ArtistCard`, `AlbumCard`,
  `ExploreCard`), barras (`ExploreSearchBar`), layout
  (`TheNavigationDock`, `TheFooter`), diálogos y steps de registro
  separados por responsabilidad.
* **Containerización:** [Dockerfile](Dockerfile) multi-etapa (Node para
  build + Nginx para servido) y `.dockerignore` configurado para entorno
  de producción ligero.

---

## Stack Tecnológico

* **Lenguaje:** JavaScript (ES2022+)
* **Framework:** Vue 3 (Composition API, `<script setup>`)
* **UI Library:** Vuetify
* **Routing:** Vue Router (`createWebHistory`, lazy loading de vistas)
* **State Management:** Pinia (setup stores con refs + computed)
* **HTTP Client:** Axios (centralizado en actions de Pinia)
* **Build Tool:** Vite
* **Containerización:** Docker multi-stage + Nginx
* **APIs Externas:** Deezer (pública, sin auth) vía proxy de Vite para evitar CORS

---

## Puesta en Marcha

Requiere **Node 20.19+** o **Node 22.12+**.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera /dist
npm run preview   # sirve /dist en local
```

### Docker

```bash
docker build -t musicspace .
docker run --rm -p 8080:80 musicspace
# http://localhost:8080
```

---

## Arquitectura del Módulo

```
src/
├── views/          Vistas enrutadas (Home, Login, Register, Profile,
│                   Artists, Albums, Explore, ForgotPassword)
├── components/
│   ├── artists/    ArtistCard, ArtistDialog
│   ├── albums/     AlbumCard, AlbumDialog
│   ├── explore/    ExploreCard, ExploreSearchBar
│   ├── auth/       StepEmail, StepPassword, StepProfile
│   ├── home/       HeroMockup (panel animado de la landing)
│   └── layout/     TheNavigationDock, TheFooter
├── composables/    Lógica reutilizable (filtros, validadores, Deezer API,
│                   acciones de biblioteca, audio preview, colores dominantes)
├── stores/         Pinia: music (biblioteca + API), auth (sesión), ui (snackbar)
└── router/         Configuración de rutas con lazy loading selectivo
```

---

**Desarrollado por:** Susana Bitar
