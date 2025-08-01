<script setup>
import { useRoute } from 'vue-router'
import { useFirebaseSensorData } from '@/composables/useFirebaseSensorData.js'
import { useSensorData } from '@/composables/useSensorData.js'

const route = useRoute()
const isInternalArea = route.path.startsWith('/app')

// Usar Firebase para área interna, simulação para área externa
const { sensorData } = isInternalArea
  ? useFirebaseSensorData()
  : useSensorData()

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up': return '↗️'
    case 'down': return '↘️'
    default: return '➡️'
  }
}

const getTrendColor = (trend) => {
  switch (trend) {
    case 'up': return 'text-green-600'
    case 'down': return 'text-red-600'
    default: return 'text-gray-600'
  }
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4 flex-shrink-0">
    <!-- Temperatura -->
    <div class="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-1">
        <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
          <span class="text-white text-sm">🌡️</span>
        </div>
        <span :class="getTrendColor(sensorData.temperature.trend)" class="text-xs font-medium">
          {{ getTrendIcon(sensorData.temperature.trend) }}
        </span>
      </div>
      <h3 class="text-xs font-medium text-gray-600 mb-1">Temperatura</h3>
      <p class="text-lg font-bold text-orange-600">
        {{ sensorData.temperature.value }}{{ sensorData.temperature.unit }}
      </p>
    </div>

    <!-- Umidade -->
    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-1">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
          <span class="text-white text-sm">💧</span>
        </div>
        <span :class="getTrendColor(sensorData.humidity.trend)" class="text-xs font-medium">
          {{ getTrendIcon(sensorData.humidity.trend) }}
        </span>
      </div>
      <h3 class="text-xs font-medium text-gray-600 mb-1">Umidade</h3>
      <p class="text-lg font-bold text-blue-600">
        {{ sensorData.humidity.value }}{{ sensorData.humidity.unit }}
      </p>
    </div>

    <!-- Altitude -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-1">
        <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
          <span class="text-white text-sm">⛰️</span>
        </div>
        <span :class="getTrendColor(sensorData.altitude.trend)" class="text-xs font-medium">
          {{ getTrendIcon(sensorData.altitude.trend) }}
        </span>
      </div>
      <h3 class="text-xs font-medium text-gray-600 mb-1">Altitude</h3>
      <p class="text-lg font-bold text-green-600">
        {{ sensorData.altitude.value }}{{ sensorData.altitude.unit }}
      </p>
    </div>

    <!-- Giroscópio -->
    <div class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-1">
        <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
          <span class="text-white text-sm">🔄</span>
        </div>
        <span :class="getTrendColor(sensorData.gyroscope.trend)" class="text-xs font-medium">
          {{ getTrendIcon(sensorData.gyroscope.trend) }}
        </span>
      </div>
      <h3 class="text-xs font-medium text-gray-600 mb-1">Giroscópio</h3>
      <p class="text-lg font-bold text-purple-600">
        {{ sensorData.gyroscope.value }}{{ sensorData.gyroscope.unit }}
      </p>
    </div>

    <!-- Aceleração -->
    <div class="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-3 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-1">
        <div class="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
          <span class="text-white text-sm">🚀</span>
        </div>
        <span :class="getTrendColor(sensorData.acceleration.trend)" class="text-xs font-medium">
          {{ getTrendIcon(sensorData.acceleration.trend) }}
        </span>
      </div>
      <h3 class="text-xs font-medium text-gray-600 mb-1">Aceleração</h3>
      <p class="text-lg font-bold text-pink-600">
        {{ sensorData.acceleration.value }}{{ sensorData.acceleration.unit }}
      </p>
    </div>
  </div>
</template>




