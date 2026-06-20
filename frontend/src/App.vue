<template>
  <div id="app" class="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-main)]">
    <router-view v-slot="{ Component }">
      <MainLayout v-if="authStore.isAuthenticated">
        <component :is="Component" />
      </MainLayout>
      <component :is="Component" v-else />
    </router-view>
  </div>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
