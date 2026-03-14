<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description: string
  link?: string
}>()
</script>

<template>
  <component
    :is="link ? 'a' : 'div'"
    :href="link"
    class="feature-card"
    :class="{ 'feature-card-link': link }"
  >
    <div v-if="icon" class="feature-card-icon">
      {{ icon }}
    </div>
    <h3 class="feature-card-title">{{ title }}</h3>
    <p class="feature-card-description">{{ description }}</p>
  </component>
</template>

<style scoped>
.feature-card-link {
  text-decoration: none;
  display: block;
}

.feature-card-link:hover {
  text-decoration: none;
}
</style>
