# MusicSpace · Gestor Musical

Aplicación Vue 3 para gestionar una biblioteca personal de artistas y álbumes,
con búsqueda y tendencias en vivo desde la API pública de Deezer.

Entrega del **Ejercicio 1** del curso Vue.js del Programa de Formación de
Becarios (FutureSpace).

---

## Stack

| Requisito PDF | Versión instalada | Nota |
|---|---|---|
| Vue.js 3 | `vue 3.5.32` | ✅ |
| Vuetify 3 | `vuetify 4.0.5` | Versión superior, compatible con Vue 3 |
| Vue Router 4 | `vue-router 5.0.4` | Versión superior, compatible con Vue 3 |
| Pinia | `pinia 3.0.4` | ✅ |

Adicional: `axios` para las llamadas HTTP y `@mdi/font` para iconografía.
Empaquetador: **Vite 8**.

---

## Cumplimiento de requisitos

### Ejercicio 1 — CRUD local con Pinia
- **Artistas** (`/profile/artists`): listar, crear, editar y borrar
  ([ArtistsView.vue](src/views/ArtistsView.vue)).
- **Álbumes** (`/profile/albums`): listar, crear, editar y borrar, con
  desplegable de artistas guardados ([AlbumDialog.vue](src/components/albums/AlbumDialog.vue)).
- Persistencia en memoria vía **Pinia** ([music.js](src/stores/music.js)) con
  sincronización a `localStorage` para no perder el estado entre recargas.

### Ejercicio 2 — Consumo de API con Axios y v-card
- **Explorar** (`/profile/explore`): consulta la API pública de Deezer
  mediante `axios` centralizado en acciones de Pinia (`searchDeezer`,
  `fetchTrending`), pintando los resultados en `v-card`
  ([ExploreCard.vue](src/components/explore/ExploreCard.vue)).
- La llamada HTTP se dispara por interacción del usuario (botón/Enter de
  búsqueda) y en la carga inicial de tendencias.

### Opcionales implementados
- ✅ **Llamadas a la API centralizadas** en acciones de Pinia
  ([music.js](src/stores/music.js)) — todos los `axios.get` viven en el store.
- ✅ **Componentes reutilizables**: `ArtistCard`, `AlbumCard`, `ExploreCard`,
  `ExploreSearchBar`, `TheNavigationDock`, `TheFooter`, diálogos
  `ArtistDialog` y `AlbumDialog`.
- ✅ **Dockerización**: imagen multi-stage (build con Node + servido con
  Nginx). Ver sección Docker.

---

## Puesta en marcha

Requiere **Node 20.19+** o **Node 22.12+**.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera /dist
npm run preview   # sirve /dist en local
```

La primera llamada a Deezer pasa por un proxy de Vite definido en
[vite.config.js](vite.config.js) para evitar CORS en desarrollo
(`/api/deezer` → `https://api.deezer.com`).

---

## Docker

Build multi-etapa: Node compila, Nginx sirve los estáticos.

```bash
docker build -t musicspace .
docker run --rm -p 8080:80 musicspace
# http://localhost:8080
```

El `.dockerignore` excluye `node_modules`, `dist`, `.git` y configuración de
editor del contexto de build.

---

## Arquitectura

```
src/
├── views/          Vistas enrutadas (Home, Login, Register, Profile,
│                   Artists, Albums, Explore, ForgotPassword)
├── components/
│   ├── artists/    ArtistCard, ArtistDialog
│   ├── albums/     AlbumCard, AlbumDialog
│   ├── explore/    ExploreCard, ExploreSearchBar
│   ├── auth/       StepEmail, StepPassword, StepProfile (registro en 3 pasos)
│   ├── home/       HeroMockup (panel animado de la landing)
│   └── layout/     TheNavigationDock, TheFooter
├── composables/    Lógica reutilizable (filtros, validadores, Deezer API,
│                   acciones de biblioteca, audio preview, colores dominantes)
├── stores/         Pinia: music (biblioteca + API), auth (sesión), ui (snackbar)
└── router/         Configuración de rutas
```

### Decisiones de diseño

- **UI optimista**: al añadir un artista o álbum desde Explorar, se inserta
  inmediatamente con datos básicos y se enriquece el género/año en segundo
  plano con un `Promise.race` de timeout a 3 s
  ([useLibraryActions.js](src/composables/useLibraryActions.js)).
- **Validaciones centralizadas** en composable
  ([useAuthValidators.js](src/composables/useAuthValidators.js)) más reglas
  inline en cada `v-text-field`.
- **Autenticación sin enumeración de usuarios**: el login devuelve siempre el
  mismo mensaje tanto si el email no existe como si la contraseña falla
  (alineado con OWASP ASVS v4).

---

## Scripts

| Comando | Efecto |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Sirve el build en local |

---

## Estructura del proyecto en Git

El repositorio **no** incluye `node_modules` ni `dist` (ver `.gitignore`).
Tras clonar, ejecutar `npm install` para restaurar dependencias.
