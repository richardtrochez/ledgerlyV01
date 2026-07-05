<template>
  <aside class="sidebar" :class="{ open }">
    <router-link to="/dashboard" class="brand" @click="$emit('navigate')">
      <span class="brand-mark">L</span>
      <span class="brand-name">Ledgerly</span>
    </router-link>

    <CompanySwitcher />

    <p class="nav-label">General</p>
    <nav class="nav-list">
      <router-link
        v-for="item in generalLinks"
        :key="item.to"
        :to="item.to"
        :class="{ active: isActive(item.to) }"
        @click="$emit('navigate')"
      >
        <component :is="item.icon" class="nav-icon" />
        {{ item.label }}
      </router-link>
    </nav>

    <p class="nav-label">Configuracion</p>
    <nav class="nav-list">
      <router-link
        v-for="item in configLinks"
        :key="item.to"
        :to="item.to"
        :class="{ active: isActive(item.to) }"
        @click="$emit('navigate')"
      >
        <component :is="item.icon" class="nav-icon" />
        {{ item.label }}
      </router-link>
      <router-link
        v-if="authStore.isAdmin"
        to="/admin"
        :class="{ active: isActive('/admin') }"
        @click="$emit('navigate')"
      >
        <Cog6ToothIcon class="nav-icon" />
        Administracion
      </router-link>
    </nav>

    <div class="account">
      <div class="avatar">{{ initial }}</div>
      <div class="account-copy">
        <strong>{{ authStore.user?.name || 'Usuario' }}</strong>
        <span>{{ roleLabel }}</span>
      </div>
      <button type="button" class="logout" title="Cerrar sesion" aria-label="Cerrar sesion" @click="logout">
        <ArrowRightOnRectangleIcon class="w-4 h-4" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CompanySwitcher from '@/components/layout/CompanySwitcher.vue'
import {
  HomeIcon,
  ArrowsUpDownIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  TagIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['navigate'])
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const initial = computed(() => (authStore.user?.name || 'U').charAt(0).toUpperCase())
const roleLabel = computed(() => ({
  admin: 'Administrador',
  dueno: 'Dueno',
  contador: 'Contador/a'
}[authStore.user?.role] || 'Usuario'))

const generalLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/sales-expenses', label: 'Ventas y gastos', icon: ArrowsUpDownIcon },
  { to: '/transactions', label: 'Compras', icon: ShoppingCartIcon },
  { to: '/income-statement', label: 'Estado de resultados', icon: ChartBarIcon }
]

const configLinks = [
  { to: '/periods', label: 'Periodos', icon: CalendarDaysIcon },
  { to: '/accounts', label: 'Cuentas', icon: BookOpenIcon },
  { to: '/cost-classes', label: 'Categorias', icon: TagIcon },
  { to: '/importar', label: 'Importar Excel', icon: ArrowUpTrayIcon },
  { to: '/analisis-ia', label: 'Analisis IA', icon: SparklesIcon }
]

function isActive(path) {
  return route.path === path || (path === '/admin' && route.path.startsWith('/admin'))
}

function logout() {
  authStore.logout()
  emit('navigate')
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  position: sticky; top: 0; z-index: 40;
  display: flex; flex-direction: column; flex-shrink: 0;
  width: 244px; height: 100vh; padding: 20px 14px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  box-shadow: none;
}

.brand {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 10px 22px;
  color: #111827; font-size: 18px; font-weight: 700; text-decoration: none;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 6px;
}

.brand-mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff; font-size: 16px; font-weight: 700;
}

.brand-name { color: #111827; }

.nav-label {
  margin: 14px 0 5px; padding: 0 12px;
  color: #9ca3af;
  font-size: 10px; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
}

.nav-list { display: flex; flex-direction: column; gap: 2px; }

.nav-list a {
  position: relative; display: flex; align-items: center; gap: 11px;
  padding: 9px 12px; border-radius: 8px;
  color: #6b7280;
  font-size: 13.5px; font-weight: 500; text-decoration: none;
  transition: background .15s, color .15s;
}

.nav-icon { width: 18px; height: 18px; flex-shrink: 0; stroke-width: 2; }

.nav-list a:hover {
  color: #111827;
  background: #f9fafb;
}

.nav-list a.active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 600;
  box-shadow: none;
}

.nav-list a.active::before { content: none; }

.account {
  display: flex; align-items: center; gap: 10px;
  margin-top: auto; padding: 14px 10px 4px;
  border-top: 1px solid #e2e8f0;
}

.avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  color: #fff; font-size: 13px; font-weight: 700;
}

.account-copy { min-width: 0; flex: 1; }
.account-copy strong,
.account-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.account-copy strong { color: #111827; font-size: 12.5px; }
.account-copy span { margin-top: 2px; color: #6b7280; font-size: 11px; }

.logout {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; padding: 0; border: 0; border-radius: 7px;
  color: #9ca3af; background: transparent; cursor: pointer;
  transition: color .15s, background .15s;
}

.logout:hover { color: #ef4444; background: #fef2f2; }
.logout svg { width: 17px; height: 17px; }

@media (max-width: 960px) {
  .sidebar { position: fixed; left: 0; transform: translateX(-100%); transition: transform .25s ease; background: #fff; }
  .sidebar.open { transform: translateX(0); }
}
</style>
