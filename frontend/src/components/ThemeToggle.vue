<template>
    <button
      @click="toggleDarkMode"
      class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition-transform duration-300"
      aria-label="Cambiar tema"
    >
      <span v-if="isDark">🌙</span>
      <span v-else>☀️</span>
    </button>
  </template>
  
  <script>
  export default {
    name: 'ThemeToggle',
    data() {
      return {
        isDark: false
      }
    },
    mounted() {
      this.isDark = localStorage.getItem('theme') === 'dark';
      document.documentElement.classList.toggle('dark', this.isDark);
    },
    methods: {
      toggleDarkMode() {
        this.isDark = !this.isDark;
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', this.isDark);
      }
    }
  }
  </script>
  