/**
 * @file index.js (Router)
 * @description Configuración central del enrutador de la aplicación.
 * Gestiona la navegación entre la zona pública (landing, login, registro) y
 * la zona privada del perfil de usuario.
 */

import { createRouter, createWebHistory } from 'vue-router'

// Importación de componentes de vista
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RegisterConfirmView from '../views/RegisterConfirmView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ArtistsView from '../views/ArtistsView.vue'
import AlbumsView from '../views/AlbumsView.vue'
import ExploreView from '../views/ExploreView.vue'

/**
 * Definición del mapa de rutas del proyecto.
 * @type {Array<Object>}
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
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/register-confirm',
    name: 'register-confirm',
    component: RegisterConfirmView
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView
  },
  {
    /** * Cargamos la vista de Perfil de forma perezosa (Lazy Loading) para 
     * aligerar el bundle inicial de la aplicación.
     */
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/profile/artists',
    name: 'profile-artists',
    component: ArtistsView
  },
  {
    path: '/profile/albums',
    name: 'profile-albums',
    component: AlbumsView
  },
  {
    /**
     * Ruta dinámica que permite filtrar la vista de álbumes para un artista concreto.
     * El parámetro ':id' se utiliza para filtrar la colección en AlbumsView.
     */
    path: '/profile/artists/:id/albums',
    name: 'artist-albums',
    component: AlbumsView
  },
  {
    path: '/profile/explore',
    name: 'profile-explore',
    component: ExploreView
  }
]

/**
 * Instancia del enrutador.
 * Utiliza 'createWebHistory' para una navegación limpia sin el símbolo '#' en la URL.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router