<template>
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
    </div>
    <div class="shrink-0"><slot name="action" /></div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>
