<script setup>
import { ChartBarIcon } from '@heroicons/vue/24/outline'
import SensorCards from '@/components/dashboard/SensorCards.vue'
import ChartsGrid from '@/components/dashboard/ChartsGrid.vue'
import { useFirebaseSensorData } from '@/composables/useFirebaseSensorData.js'
import { onMounted, onUnmounted } from 'vue'

const { startRealtimeUpdates, stopRealtimeUpdates, isConnected } = useFirebaseSensorData()

onMounted(() => {
  startRealtimeUpdates()
})

onUnmounted(() => {
  stopRealtimeUpdates()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Melhorado -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <ChartBarIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p class="text-gray-600 mt-1">Monitoramento em tempo real dos sensores</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div :class="[
            'flex items-center space-x-2 px-3 py-2 rounded-lg border',
            isConnected
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          ]">
            <div :class="[
              'w-3 h-3 rounded-full shadow-lg',
              isConnected
                ? 'bg-green-500 animate-pulse shadow-green-500/50'
                : 'bg-red-500 shadow-red-500/50'
            ]"></div>
            <span :class="[
              'text-sm font-medium',
              isConnected ? 'text-green-700' : 'text-red-700'
            ]">
              {{ isConnected ? 'Sistema Online' : 'Sistema Offline' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-4">
      <SensorCards />
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <ChartsGrid />
      </div>
    </div>
  </div>
</template>



