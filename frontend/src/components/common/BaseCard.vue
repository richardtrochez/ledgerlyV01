<template>
  <div :class="cardClasses">
    <!-- Header (opcional) -->
    <div v-if="$slots.header" class="px-6 py-4 border-b border-[var(--color-border-soft)]">
      <slot name="header"></slot>
    </div>

    <!-- Body -->
    <div :class="bodyClasses">
      <slot></slot>
    </div>

    <!-- Footer (opcional) -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-surface-soft)]">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hoverable: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'normal', // none, sm, normal, lg
    validator: (value) => ['none', 'sm', 'normal', 'lg'].includes(value)
  },
  shadow: {
    type: String,
    default: 'normal', // none, sm, normal, lg
    validator: (value) => ['none', 'sm', 'normal', 'lg'].includes(value)
  }
})

const cardClasses = computed(() => {
  const base = 'bg-white rounded-lg border border-[var(--color-border-soft)]'
  
  const shadows = {
    none: '',
    sm: 'shadow-[var(--shadow-card)]',
    normal: 'shadow-[var(--shadow-card)]',
    lg: 'shadow-[var(--shadow-card-hover)]'
  }

  const hoverClass = props.hoverable ? 'hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''

  return `${base} ${shadows[props.shadow]} ${hoverClass}`
})

const bodyClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-3',
    normal: 'p-6',
    lg: 'p-8'
  }

  return paddings[props.padding]
})
</script>
