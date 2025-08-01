<script setup>
defineProps({
  show: Boolean,
  selectedSensor: String,
  selectedSensorInfo: Object,
  sensorOptions: Array,
  stats: Object
})

defineEmits(['close', 'update:selectedSensor'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">📊</span>
          <h3 class="text-lg font-semibold text-blue-900">Estatísticas</h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Selecionar Sensor</label>
          <select
            :value="selectedSensor"
            @change="$emit('update:selectedSensor', $event.target.value)"
            class="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um sensor</option>
            <option v-for="sensor in sensorOptions" :key="sensor.value" :value="sensor.value">
              {{ sensor.icon }} {{ sensor.label }}
            </option>
          </select>
        </div>

        <div v-if="stats && selectedSensorInfo" class="space-y-4">
          <div class="flex items-center space-x-2 mb-4">
            <span class="text-2xl">{{ selectedSensorInfo.icon }}</span>
            <h4 class="text-xl font-semibold" :class="`text-${selectedSensorInfo.color}-600`">
              {{ selectedSensorInfo.label }} ({{ selectedSensorInfo.unit }})
            </h4>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            <div class="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
              <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ stats.count }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Registros</div>
            </div>
            <div class="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
              <div class="text-xl sm:text-2xl font-bold text-green-600">{{ stats.mean }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Média {{ selectedSensorInfo.unit }}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
              <div class="text-xl sm:text-2xl font-bold text-purple-600">{{ stats.median }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Mediana {{ selectedSensorInfo.unit }}</div>
            </div>
            <div class="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
              <div class="text-xl sm:text-2xl font-bold text-orange-600">{{ stats.mode }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Moda {{ selectedSensorInfo.unit }}</div>
            </div>
            <div class="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
              <div class="text-xl sm:text-2xl font-bold text-red-600">{{ stats.min }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Mínimo {{ selectedSensorInfo.unit }}</div>
            </div>
            <div class="bg-indigo-50 rounded-lg p-3 sm:p-4 text-center">
              <div class="text-xl sm:text-2xl font-bold text-indigo-600">{{ stats.max }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Máximo {{ selectedSensorInfo.unit }}</div>
            </div>
            <div class="bg-pink-50 rounded-lg p-3 sm:p-4 text-center">
              <div class="text-xl sm:text-2xl font-bold text-pink-600">{{ stats.stdDev }}</div>
              <div class="text-xs sm:text-sm text-gray-600">Desvio Padrão {{ selectedSensorInfo.unit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


