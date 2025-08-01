import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/config.js'
import { onAuthStateChanged } from 'firebase/auth'
import AboutView from '../views/AboutView.vue'
import DashboardView from '../views/DashboardView.vue'
import TablesView from '../views/TablesView.vue'
import SignUpView from '../views/SignUpView.vue'
import SignInView from '../views/SignInView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import Model3DView from '@/views/internal/Model3DView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/tables',
      name: 'tables',
      component: TablesView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: { requiresGuest: true }
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView,
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { requiresGuest: true }
    },
    {
      path: '/app',
      component: () => import('@/layouts/InternalLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'InternalDashboard',
          component: () => import('@/views/internal/DashboardView.vue')
        },
        {
          path: 'tables',
          name: 'InternalTables',
          component: () => import('@/views/internal/TablesView.vue')
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/internal/ProfileView.vue')
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/internal/SettingsView.vue')
        },
        {
          path: 'notifications',
          name: 'Notifications',
          component: () => import('@/views/internal/NotificationsView.vue')
        },
        {
          path: 'model3d',
          name: 'Model3D',
          component: Model3DView,
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// Estado de autenticação
let isAuthenticated = false
let authCheckComplete = false

// Verificar estado de autenticação
onAuthStateChanged(auth, (user) => {
  isAuthenticated = !!user
  authCheckComplete = true
  console.log(user ? '✅ Usuário logado' : '❌ Usuário não logado')
})

// Guard de autenticação
router.beforeEach(async (to, from, next) => {
  // Aguardar verificação de autenticação
  if (!authCheckComplete) {
    await new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe()
        resolve()
      })
    })
  }

  // Verificar se a rota requer autenticação
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('🚫 Acesso negado - usuário não logado')
      next('/signin')
      return
    }
  }

  // Verificar se a rota é apenas para visitantes (não logados)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      console.log('🔄 Usuário já logado - redirecionando para dashboard')
      next('/app/dashboard')
      return
    }
  }

  next()
})

export default router




