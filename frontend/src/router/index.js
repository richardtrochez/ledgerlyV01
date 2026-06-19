import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import AdminPanel from '@/views/Admin/AdminPanel.vue'
import AdminUsers from '@/views/Admin/AdminUsers.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true, title: 'Login - Ledgerly' }
  },

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, title: 'Dashboard - Ledgerly' }
  },

  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/views/Transactions.vue'),
    meta: { requiresAuth: true, title: 'Transacciones - Ledgerly' }
  },

  {
  path: '/sales-expenses',
  name: 'SalesExpenses',
  component: () => import('@/views/SalesExpenses.vue'),
  meta: { requiresAuth: true }
  },

  {
    path: '/income-statement',
    name: 'IncomeStatement',
    component: () => import('@/views/IncomeStatement.vue'),
    meta: { requiresAuth: true, title: 'Estado de Resultados - Ledgerly' }
  },
  
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import('@/views/Accounts.vue'),
    meta: { requiresAuth: true, title: 'Catálogo de Cuentas - Ledgerly' }
  },
  
  {
    path: '/cost-classes',
    name: 'CostClasses',
    component: () => import('@/views/CostClasses.vue'),
    meta: { requiresAuth: true, title: 'Clases de Costo - Ledgerly' }
  },
  
  {
    path: '/importar',
    name: 'ImportView',
    component: () => import('@/views/ImportView.vue'),
    meta: { requiresAuth: true, title: 'Importación - Ledgerly' }
  },

  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Panel Admin - Ledgerly' }
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Gestión de Usuarios - Ledgerly' }
  },

  // Ruta 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticación y autorización
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Ledgerly Base'

  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  console.log('Guard - Navegando a:', to.path)
  console.log('Guard - Autenticado:', isAuthenticated)
  console.log('Guard - Rol:', userRole)
  console.log('Guard - RequiresAdmin:', to.meta.requiresAdmin)

  // Ruta pública
  if (to.meta.public) {
    if (isAuthenticated) {
      // Si ya está logeado, redirigir según rol
      if (userRole === 'admin') {
        next('/admin')
      } else {
        next('/dashboard')
      }
    } else {
      next()
    }
    return
  }

  // Ruta privada requiere autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Sin autenticación, redirigiendo a login')
    next('/login')
    return
  }

  // Ruta admin requiere rol admin
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    console.log('No es admin, redirigiendo a dashboard')
    next('/dashboard')
    return
  }

  next()
})

export default router