<template>
  <nav class="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 shadow-[0_6px_18px_rgba(15,23,42,0.04)] backdrop-blur">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <router-link to="/dashboard" class="flex items-center gap-2 text-xl font-bold text-[var(--color-text-main)] hover:text-[var(--color-primary-deep)] transition">
          <div class="w-8 h-8 bg-[var(--color-primary-deep)] rounded-lg flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-sm">L</span>
          </div>
          <span>Ledgerly</span>
        </router-link>

        <div class="hidden md:flex items-center gap-1">
          <NavLink to="/dashboard" label="Panel principal" />
          <NavLink to="/transactions" label="Compras" />
          <NavLink to="/sales-expenses" label="Ventas y gastos" />
          <NavLink to="/income-statement" label="Estado de resultados" />
          <NavLink to="/accounts" label="Cuentas" />
          <NavLink to="/cost-classes" label="Categorías" />
          <NavLink to="/importar" label="Importar" />
        </div>

        <div class="flex items-center gap-3">
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary-deep)] hover:bg-[var(--color-primary-soft)] rounded-lg transition"
          >
            Administración
          </router-link>

          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-soft)] rounded-lg transition"
            >
              <div class="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {{ authStore.user?.name?.charAt(0) || 'U' }}
              </div>
              <span class="hidden sm:inline">{{ authStore.user?.name || 'Usuario' }}</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-[var(--color-border-soft)] shadow-[var(--shadow-card-hover)] py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-[var(--color-border-soft)]">
                <p class="text-sm font-semibold text-[var(--color-text-main)]">{{ authStore.user?.name }}</p>
                <p class="text-xs text-[var(--color-text-muted)]">{{ authStore.user?.email }}</p>
              </div>
              <button
                v-if="authStore.isAdmin"
                @click="goToAdmin"
                class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                Panel de administración
              </button>
              <button
                @click="logout"
                class="w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 transition font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavLink from './NavLink.vue'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

function goToAdmin() {
  showUserMenu.value = false
  router.push('/admin')
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
