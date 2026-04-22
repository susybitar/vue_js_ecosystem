/**
 * @file router/index.js
 * @description Router de la app. Separo zona pública (landing + login +
 * registro) y zona privada (todo lo que hay bajo /profile) con dos flags
 * en `meta` (`requiresAuth` / `guestOnly`) y un único guard global que
 * hace cumplir ambos.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RegisterConfirmView from '../views/RegisterConfirmView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ArtistsView from '../views/ArtistsView.vue'
import AlbumsView from '../views/AlbumsView.vue'
import ExploreView from '../views/ExploreView.vue'

/**
 * Tabla de rutas.
 *
 * Convención de `meta`:
 * - `requiresAuth`: ruta privada; sin sesión mandamos al login.
 * - `guestOnly`: ruta sólo para anónimos; con sesión saltamos al perfil
 *   para no dejar que un usuario logueado vuelva al formulario de login.
 *
 * @type {Array<import('vue-router').RouteRecordRaw>}
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/register-confirm',
    name: 'register-confirm',
    component: RegisterConfirmView
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { guestOnly: true }
  },
  {
    // Lazy loading del perfil: es la vista más pesada y no quiero que entre
    // en el bundle inicial cuando un usuario nuevo sólo ve la landing.
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/artists',
    name: 'profile-artists',
    component: ArtistsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/albums',
    name: 'profile-albums',
    component: AlbumsView,
    meta: { requiresAuth: true }
  },
  {
    // Misma vista que /profile/albums pero prefiltrada por artista. El `:id`
    // lo lee AlbumsView con useRoute() para aplicar el filtro inicial.
    path: '/profile/artists/:id/albums',
    name: 'artist-albums',
    component: AlbumsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/explore',
    name: 'profile-explore',
    component: ExploreView,
    meta: { requiresAuth: true }
  }
]

/** Uso `createWebHistory` para tener URLs limpias (sin el `#` de hash mode). */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * Guard global.
 *
 * 1. `requiresAuth` sin sesión → al login.
 * 2. `guestOnly` con sesión → al perfil (evita volver a /login cuando ya
 *    estás dentro).
 *
 * Resuelvo el authStore aquí dentro, no a nivel de módulo, para asegurarme
 * de que Pinia ya está montado cuando se dispara la primera navegación.
 */
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return { name: 'profile' }
  }

  return true
})

export default router
