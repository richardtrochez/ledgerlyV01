<template>
  <div v-if="show" class="company-switcher">
    <p class="switcher-label">Empresa activa</p>

    <div v-if="!authStore.hasMultipleCompanies" class="switcher-single">
      <span class="switcher-name" :title="currentName">{{ currentName }}</span>
    </div>

    <div v-else class="switcher-wrap" :class="{ open }">
      <button type="button" class="switcher-trigger" @click="open = !open" :disabled="switching">
        <span class="switcher-name" :title="currentName">{{ currentName }}</span>
        <ChevronDownIcon class="switcher-caret" />
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
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const router = useRouter()

const open = ref(false)
const switching = ref(false)
const error = ref('')

const show = computed(() => !authStore.isAdmin && authStore.availableCompanies.length > 0)
const currentName = computed(() => authStore.currentCompany?.name || 'Sin empresa')

function roleLabel(role) {
  return { contador: 'Contador/a', dueno: 'Dueño/a' }[role] || role
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
  padding: 8px 6px 10px;
  margin: 4px 4px 6px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.switcher-label {
  margin: 0 0 5px;
  padding: 0 4px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.switcher-single { padding: 5px 8px; }

.switcher-name {
  color: #0f172a;
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
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.switcher-trigger:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
.switcher-trigger:disabled { opacity: .6; cursor: not-allowed; }

.switcher-caret {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #94a3b8;
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1);
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
  color: #475569;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}
.switcher-option:hover { background: #f8fafc; }
.switcher-option.active {
  background: #eff6ff;
  color: #2563eb;
}

.switcher-option-name { font-size: 13px; font-weight: 600; }
.switcher-option-role { font-size: 11px; color: #94a3b8; }

.switcher-error {
  margin: 6px 4px 0;
  color: #dc2626;
  font-size: 11px;
}
</style>
