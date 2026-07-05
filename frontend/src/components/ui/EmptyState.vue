<template>
  <div class="flex flex-col items-center gap-3 py-12 text-center">
    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
      <component :is="iconComponent" class="w-5 h-5 text-gray-400" />
    </div>
    <p class="text-sm text-gray-500 max-w-sm">{{ message }}</p>
    <button
      v-if="actionLabel"
      type="button"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg px-3 py-1.5 transition-colors duration-200"
      @click="$emit('action')"
    >
      <PlusIcon class="w-4 h-4" />
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InboxIcon, PlusIcon, FolderOpenIcon, UsersIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  message: { type: String, default: 'No hay datos que mostrar' },
  actionLabel: { type: String, default: '' },
  icon: { type: String, default: 'inbox' }
})

defineEmits(['action'])

const iconMap = {
  inbox: InboxIcon,
  folder: FolderOpenIcon,
  users: UsersIcon,
  document: DocumentTextIcon
}

const iconComponent = computed(() => iconMap[props.icon] || InboxIcon)
</script>
