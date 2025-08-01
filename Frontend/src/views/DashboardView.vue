<script setup>
import SensorCards from '@/components/dashboard/SensorCards.vue'
import ChartsGrid from '@/components/dashboard/ChartsGrid.vue'
import { useSensorData } from '@/composables/useSensorData.js'
import { onMounted, onUnmounted } from 'vue'

const { startUpdates, stopUpdates } = useSensorData()

onMounted(() => {
  startUpdates()
})

onUnmounted(() => {
  stopUpdates()
})
</script>

<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-col" style="min-height: calc(100vh - 32rem);">
        <SensorCards />
        <div class="flex-1 min-h-0">
          <ChartsGrid />
        </div>
      </div>
    </div>
  </div>
</template>



