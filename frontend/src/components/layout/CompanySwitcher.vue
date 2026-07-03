<template>
  <div v-if="show" class="company-switcher">
    <p class="switcher-label">Empresa activa</p>

    <!-- Un solo empresa: solo mostrarla, sin dropdown -->
    <div v-if="!authStore.hasMultipleCompanies" class="switcher-single">
      <span class="switcher-name" :title="currentName">{{ currentName }}</span>
    </div>

    <!-- Varias empresas: dropdown -->
    <div v-else class="switcher-wrap" :class="{ open }">
      <button type="button" class="switcher-trigger" @click="open = !open" :disabled="switching">
        <span class="switcher-name" :title="currentName">{{ currentName }}</span>
        <svg class="switcher-caret" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="open" class="switcher-menu">
        <button
          v-for="c in authStore.availableCompanies"
          :key="c._id"
          type="button"
          class="switcher-option"
          :class="{ active: c._id === authStore.currentCompany?._id }"
          :disabled="switching"
          @click="handleSwitch(c)"
        >
          <span class="switcher-option-name">{{ c.name }}</span>
          <span class="switcher-option-role">{{ roleLabel(c.role) }}</span>
        </button>
      </div>
    </div>

    <p v-if="error" class="switcher-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const open = ref(false)
const switching = ref(false)
const error = ref('')

// El admin no ve el selector (no trabaja con empresas)
const show = computed(() => !authStore.isAdmin && authStore.availableCompanies.length > 0)

const currentName = computed(() => authStore.currentCompany?.name || 'Sin empresa')

function roleLabel(role) {
  return { contador: 'Contador/a', dueno: 'Dueno/a' }[role] || role
}

async function handleSwitch(company) {
  if (company._id === authStore.currentCompany?._id) {
    open.value = false
    return
  }

  switching.value = true
  error.value = ''
  try {
    await authStore.switchCompany(company._id)
    open.value = false
    // Refrescar la pagina actual para que los datos se recarguen con la nueva empresa
    router.go(0)
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudo cambiar de empresa'
  } finally {
    switching.value = false
  }
}
</script>

<style scoped>
.company-switcher {
  padding: 10px 8px 12px;
  margin: 4px 6px 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
}

.switcher-label {
  margin: 0 0 6px;
  padding: 0 4px;
  color: rgba(255,255,255,0.4);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.switcher-single {
  padding: 6px 8px;
}

.switcher-name {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.switcher-wrap { position: relative; }

.switcher-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background .15s;
}
.switcher-trigger:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
.switcher-trigger:disabled { opacity: .6; cursor: not-allowed; }

.switcher-caret {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: rgba(255,255,255,0.5);
  transition: transform .2s;
}
.switcher-wrap.open .switcher-caret { transform: rotate(180deg); }

.switcher-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  padding: 4px;
  border-radius: 8px;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  max-height: 260px;
  overflow-y: auto;
}

.switcher-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}
.switcher-option:hover { background: rgba(255,255,255,0.08); }
.switcher-option.active {
  background: rgba(37,99,235,0.35);
  color: #fff;
}

.switcher-option-name { font-size: 13px; font-weight: 600; }
.switcher-option-role { font-size: 11px; color: rgba(255,255,255,0.55); }

.switcher-error {
  margin: 6px 4px 0;
  color: #fca5a5;
  font-size: 11px;
}
</style>
