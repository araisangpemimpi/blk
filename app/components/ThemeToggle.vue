<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      :aria-label="isDark ? 'Ubah ke mode terang' : 'Ubah ke mode gelap'"
      title="Gelap / Terang"
      class="flex size-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 active:bg-neutral-200 dark:border-neutral-700 dark:text-amber-300 dark:hover:bg-neutral-800"
      @click="toggle"
    >
      <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-[18px]" />
    </button>
    <template #fallback>
      <span class="block size-9 rounded-full border border-neutral-300 dark:border-neutral-700" />
    </template>
  </ClientOnly>
</template>
