<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
import { computed } from 'vue'

const route = useRoute()

const isInternalArea = computed(() => {
  return route.path.startsWith('/app')
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar v-if="!isInternalArea" />
    <RouterView />
    <AppFooter v-if="!isInternalArea" />
  </div>
</template>

<style scoped>
/* Estilos específicos se necessário */
</style>



