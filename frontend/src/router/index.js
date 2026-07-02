import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import AdminPanel from '@/views/admin/AdminPanel.vue'
import AdminUsers from '@/views/admin/AdminUsers.vue'

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
    meta: { requiresAuth: true, title: 'Ventas y Gastos - Ledgerly' }
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
    meta: { requiresAuth: true, title: 'Catalogo de Cuentas - Ledgerly' }
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
    meta: { requiresAuth: true, title: 'Importacion - Ledgerly' }
  },
  {
    path: '/analisis-ia',
    name: 'AnalisisIA',
    component: () => import('@/views/AnalisisIA.vue'),
    meta: { requiresAuth: true, title: 'Analisis IA - Ledgerly' }
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
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Gestion de Usuarios - Ledgerly' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Ledgerly Base'

  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  if (to.meta.public) {
    if (isAuthenticated) {
      next(userRole === 'admin' ? '/admin' : '/dashboard')
    } else {
      next()
    }
    return
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin && userRole !== 'admin') {
    next('/dashboard')
    return
  }

  next()
})

export default router
