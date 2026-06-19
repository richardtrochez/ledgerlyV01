<template>
  <div id="app" class="min-h-screen flex flex-col bg-[var(--color-bg-app)] text-[var(--color-text-main)]">
    <AppNavbar v-if="authStore.isAuthenticated" />
    <main class="flex-1">
      <router-view />
    </main>
    <footer v-if="authStore.isAuthenticated" class="bg-white border-t border-[var(--color-border-soft)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-sm text-[var(--color-text-muted)]">
          (c) 2026 Ledgerly Base - Sistema de gestion financiera para MiPymes
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/common/AppNavbar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
