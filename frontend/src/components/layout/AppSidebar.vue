<template>
  <aside class="sidebar" :class="{ open }">
    <router-link to="/dashboard" class="brand" @click="$emit('navigate')">
      <span class="brand-mark">L</span>
      <span>Ledgerly</span>
    </router-link>

    <p class="nav-label">General</p>
    <nav class="nav-list">
      <router-link v-for="item in generalLinks" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }" @click="$emit('navigate')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" :d="item.icon" /></svg>
        {{ item.label }}
      </router-link>
    </nav>

    <p class="nav-label">Configuracion</p>
    <nav class="nav-list">
      <router-link v-for="item in configLinks" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }" @click="$emit('navigate')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" :d="item.icon" /></svg>
        {{ item.label }}
      </router-link>
      <router-link v-if="authStore.isAdmin" to="/admin" :class="{ active: isActive('/admin') }" @click="$emit('navigate')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.94-3.5a7.94 7.94 0 0 0-.12-1.37l1.72-1.34-1.8-3.12-2.03.82a8.1 8.1 0 0 0-2.37-1.37L15 3h-3.6l-.34 2.32A8.1 8.1 0 0 0 8.7 6.69l-2.04-.82-1.8 3.12 1.72 1.34A7.94 7.94 0 0 0 6.46 12c0 .47.04.93.12 1.37l-1.72 1.34 1.8 3.12 2.04-.82a8.1 8.1 0 0 0 2.36 1.37L11.4 21H15l.34-2.32a8.1 8.1 0 0 0 2.37-1.37l2.03.82 1.8-3.12-1.72-1.34c.08-.44.12-.9.12-1.37Z" /></svg>
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
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4 5-5-5-5m5 5H3" /></svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['navigate'])
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const initial = computed(() => (authStore.user?.name || 'U').charAt(0).toUpperCase())
const roleLabel = computed(() => ({ admin: 'Administrador', dueno: 'Dueno', contador: 'Contador/a' }[authStore.user?.role] || 'Usuario'))

const generalLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10' },
  { to: '/sales-expenses', label: 'Ventas y gastos', icon: 'M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4' },
  { to: '/transactions', label: 'Compras', icon: 'M8 4h8l3 3v13H5V4h3Zm0 0a2 2 0 0 0 4 0m-3 8h6m-6 4h6' },
  { to: '/income-statement', label: 'Estado de resultados', icon: 'M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6' }
]

const configLinks = [
  { to: '/accounts', label: 'Cuentas', icon: 'M4 6h16M6 6l-2 13h16L18 6M9 10v5m6-5v5' },
  { to: '/cost-classes', label: 'Categorias', icon: 'M7 7h.01M7 3h5l9 9-8 8-9-9V7a4 4 0 0 1 4-4Z' },
  { to: '/importar', label: 'Importar Excel', icon: 'M12 16V4m0 0-4 4m4-4 4 4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2' },
  { to: '/analisis-ia', label: 'Análisis IA', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
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
/* ── Sidebar dark navy ───────────────────────────────────────────────────── */
.sidebar {
  position: sticky; top: 0; z-index: 40;
  display: flex; flex-direction: column; flex-shrink: 0;
  width: 244px; height: 100vh; padding: 20px 14px;
  background: linear-gradient(180deg, #0f1f3d 0%, #0d1b36 100%);
  border-right: none;
  box-shadow: 4px 0 24px rgba(0,0,0,0.18);
}

/* ── Marca ───────────────────────────────────────────────────────────────── */
.brand {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 10px 22px;
  color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 6px;
}
.brand-mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff; font-size: 16px;
  box-shadow: 0 4px 12px rgba(37,99,235,0.4);
}

/* ── Etiquetas de sección ────────────────────────────────────────────────── */
.nav-label {
  margin: 14px 0 5px; padding: 0 12px;
  color: rgba(255,255,255,0.3);
  font-size: 10px; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
}

/* ── Links de navegación ─────────────────────────────────────────────────── */
.nav-list { display: flex; flex-direction: column; gap: 2px; }

.nav-list a {
  position: relative; display: flex; align-items: center; gap: 11px;
  padding: 9px 12px; border-radius: 9px;
  color: rgba(255,255,255,0.55);
  font-size: 13.5px; font-weight: 500; text-decoration: none;
  transition: background .15s, color .15s;
}
.nav-list a svg { width: 18px; height: 18px; flex-shrink: 0; }

.nav-list a:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.08);
}

.nav-list a.active {
  color: #ffffff;
  background: linear-gradient(90deg, rgba(37,99,235,0.7) 0%, rgba(59,130,246,0.5) 100%);
  font-weight: 600;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
}

.nav-list a.active::before {
  position: absolute; top: 6px; bottom: 6px; left: -14px;
  width: 3px; border-radius: 0 3px 3px 0;
  background: #60a5fa; content: '';
}

/* ── Cuenta de usuario ───────────────────────────────────────────────────── */
.account {
  display: flex; align-items: center; gap: 10px;
  margin-top: auto; padding: 14px 10px 4px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff; font-size: 13px; font-weight: 700;
  box-shadow: 0 2px 8px rgba(37,99,235,0.35);
}

.account-copy { min-width: 0; flex: 1; }
.account-copy strong,
.account-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.account-copy strong { color: #ffffff; font-size: 12.5px; }
.account-copy span   { margin-top: 2px; color: rgba(255,255,255,0.4); font-size: 11px; }

.logout {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; padding: 0; border: 0; border-radius: 7px;
  color: rgba(255,255,255,0.35); background: transparent; cursor: pointer;
  transition: color .15s, background .15s;
}
.logout:hover { color: #f87171; background: rgba(239,68,68,0.12); }
.logout svg { width: 17px; height: 17px; }

@media (max-width: 960px) {
  .sidebar { position: fixed; left: 0; transform: translateX(-100%); transition: transform .25s ease; }
  .sidebar.open { transform: translateX(0); }
}
</style>
