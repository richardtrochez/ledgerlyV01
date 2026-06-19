<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <!-- Logo -->
            <div class="flex-shrink-0">
              <router-link to="/dashboard" class="flex items-center">
                <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Ledgerly
                </h1>
              </router-link>
            </div>
            
            <!-- Navigation Links -->
            <div class="hidden md:block ml-10">
              <div class="flex items-baseline space-x-4">
                <router-link
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.to"
                  :class="[
                    isActive(item.to) 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors'
                  ]"
                >
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center">
            <span class="text-sm text-gray-600 mr-3">Admin</span>
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-sm">A</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div class="md:hidden" v-if="mobileMenuOpen">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            :class="[
              isActive(item.to)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              'block px-3 py-2 rounded-md text-base font-medium'
            ]"
            @click="mobileMenuOpen = false"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Transacciones', to: '/transactions' },
  { name: 'Cuentas', to: '/accounts' },
  { name: 'Clases de Costo', to: '/cost-classes' }
]

const isActive = (path) => {
  return route.path === path
}
</script>
