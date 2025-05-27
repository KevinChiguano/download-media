<template>
  <div class="min-h-screen transition-colors duration-300 bg-white text-black dark:bg-gray-900 dark:text-white">
    <div class="flex justify-end p-4">
      <ThemeToggle />
    </div>

    <div class="flex justify-end p-4">
      <PrincipalPage />
    </div>
  </div>
</template>

<script>
import ThemeToggle from './components/ThemeToggle.vue'
import PrincipalPage from './components/PrincipalPage.vue'


export default {
  components: {
    ThemeToggle,
    PrincipalPage
  }
}
</script>
