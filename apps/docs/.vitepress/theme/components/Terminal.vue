<script setup lang="ts">
import { ref, useSlots } from 'vue'

defineProps<{
  title?: string
}>()

const copied = ref(false)
const slots = useSlots()

function copyToClipboard() {
  // Get the text content from the slot
  const slotContent = slots.default?.()
  if (!slotContent) return

  // Extract text from VNodes
  const text = extractText(slotContent)
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function extractText(nodes: any[]): string {
  return nodes.map(node => {
    if (typeof node.children === 'string') {
      return node.children
    }
    if (Array.isArray(node.children)) {
      return extractText(node.children)
    }
    return ''
  }).join('')
}
</script>

<template>
  <div class="terminal">
    <div class="terminal-header">
      <div class="terminal-buttons">
        <span class="terminal-button close" />
        <span class="terminal-button minimize" />
        <span class="terminal-button maximize" />
      </div>
      <span class="terminal-title">{{ title || 'Terminal' }}</span>
      <button class="terminal-copy" @click="copyToClipboard">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="terminal-content"><slot /></pre>
  </div>
</template>
