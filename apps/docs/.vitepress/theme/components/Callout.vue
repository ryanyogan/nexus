<script setup lang="ts">
defineProps<{
  type?: 'tip' | 'warning' | 'danger' | 'info'
  title?: string
}>()
</script>

<template>
  <div :class="['callout', `callout-${type || 'tip'}`]">
    <div v-if="title" class="callout-title">{{ title }}</div>
    <div class="callout-content">
      <slot />
    </div>
  </div>
</template>
