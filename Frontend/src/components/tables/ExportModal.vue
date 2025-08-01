<script setup>
const props = defineProps({
  show: Boolean,
  exportFilters: Object,
  sensorOptions: Array
})

const emit = defineEmits(['close', 'export', 'update:exportFilters'])

const toggleAllSensors = (value) => {
  const updatedFilters = { ...props.exportFilters }
  Object.keys(updatedFilters.sensors).forEach(sensor => {
    updatedFilters.sensors[sensor] = value
  })
  emit('update:exportFilters', updatedFilters)
}

const updateFilters = (field, value) => {
  const updatedFilters = { ...props.exportFilters }
  if (field.includes('.')) {
    const [parent, child] = field.split('.')
    updatedFilters[parent][child] = value
  } else {
    updatedFilters[field] = value
  }
  emit('update:exportFilters', updatedFilters)
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">📤</span>
          <h3 class="text-lg font-semibold text-blue-900">Exportar CSV</h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <div class="space-y-6">
        <!-- Filtros de Data -->
        <div>
          <h4 class="text-md font-semibold text-gray-800 mb-3">Período</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
              <input
                :value="exportFilters.dateFrom"
                @input="updateFilters('dateFrom', $event.target.value)"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
              <input
                :value="exportFilters.dateTo"
                @input="updateFilters('dateTo', $event.target.value)"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Seleção de Sensores -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
            <h4 class="text-md font-semibold text-gray-800 mb-2 sm:mb-0">Sensores</h4>
            <div class="flex gap-2">
              <button
                @click="toggleAllSensors(true)"
                class="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
              >
                Marcar Todos
              </button>
              <button
                @click="toggleAllSensors(false)"
                class="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                Desmarcar Todos
              </button>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              v-for="sensor in sensorOptions"
              :key="sensor.value"
              class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                :checked="exportFilters.sensors[sensor.value]"
                @change="updateFilters(`sensors.${sensor.value}`, $event.target.checked)"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              >
              <span class="text-lg">{{ sensor.icon }}</span>
              <span class="text-sm font-medium text-gray-700">{{ sensor.label }}</span>
            </label>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            @click="$emit('export')"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors order-1 sm:order-2 sm:ml-auto"
          >
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


