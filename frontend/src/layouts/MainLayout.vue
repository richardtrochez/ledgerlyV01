<template>
  <div class="shell">
    <AppSidebar :open="navOpen" @navigate="navOpen = false" />
    <div v-if="navOpen" class="backdrop" @click="navOpen = false"></div>

    <div class="content">
      <header class="mobile-topbar">
        <button class="menu-button" type="button" aria-label="Abrir menu" @click="navOpen = true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <router-link to="/dashboard" class="mobile-brand"><span> L </span> Ledgerly</router-link>
      </header>

      <main class="flex-1">
        <slot />
      </main>

      <footer class="border-t border-[var(--color-border-soft)] bg-white">
        <p class="px-4 py-5 text-center text-xs text-[var(--color-text-muted)]">(c) 2026 Ledgerly Base - Sistema de gestion financiera para MiPymes</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const navOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  navOpen.value = false
})
</script>

<style scoped>
.shell { display: flex; min-height: 100vh; background: var(--color-bg-app); }
.content { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.backdrop { display: none; }
.mobile-topbar { display: none; }

@media (max-width: 960px) {
  .backdrop { position: fixed; inset: 0; display: block; z-index: 35; background: rgba(15, 23, 42, 0.38); }
  .mobile-topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 0 18px; background: linear-gradient(90deg, #0f1f3d, #1e3a8a); box-shadow: 0 2px 12px rgba(0,0,0,0.2); }
  .menu-button { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; padding: 0; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.15); border-radius: 9px; background: rgba(255,255,255,0.08); }
  .menu-button svg { width: 20px; height: 20px; }
  .mobile-brand { display: inline-flex; align-items: center; gap: 8px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; }
  .mobile-brand span { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; color: #fff; border-radius: 8px; background: linear-gradient(135deg,#2563eb,#3b82f6); font-size: 13px; }
}
</style>
