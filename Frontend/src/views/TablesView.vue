<script setup>
import { ref, computed, h } from 'vue'
import { useVueTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/vue-table'
import { useHistoricalData } from '@/composables/useHistoricalData.js'
import { ChartBarIcon } from '@heroicons/vue/24/outline'
import FiltersSection from '@/components/tables/FiltersSection.vue'
import DataTable from '@/components/tables/DataTable.vue'
import ExportModal from '@/components/tables/ExportModal.vue'
import StatsModal from '@/components/tables/StatsModal.vue'

const { filteredData, filters, calculateStats } = useHistoricalData()

const showStats = ref(false)
const showExportModal = ref(false)
const selectedSensor = ref('')
const globalFilter = ref('')

const exportFilters = ref({
  dateFrom: '',
  dateTo: '',
  sensors: {
    temperature: true,
    humidity: true,
    altitude: true,
    gyroscope: true,
    acceleration: true
  }
})

const sensorOptions = [
  { value: 'temperature', label: 'Temperatura', unit: '°C', icon: '🌡️', color: 'orange' },
  { value: 'humidity', label: 'Umidade', unit: '%', icon: '💧', color: 'blue' },
  { value: 'altitude', label: 'Altitude', unit: 'm', icon: '⛰️', color: 'green' },
  { value: 'gyroscope', label: 'Giroscópio', unit: 'rad/s', icon: '🔄', color: 'purple' },
  { value: 'acceleration', label: 'Aceleração', unit: 'm/s²', icon: '🚀', color: 'pink' }
]

const selectedSensorInfo = computed(() => {
  return sensorOptions.find(sensor => sensor.value === selectedSensor.value)
})

const columns = [
  {
    accessorKey: 'date',
    header: 'Data',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-gray-900' }, getValue())
  },
  {
    accessorKey: 'time',
    header: 'Horário',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-gray-700' }, getValue())
  },
  {
    accessorKey: 'temperature',
    header: 'Temperatura (°C)',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-orange-600' }, getValue())
  },
  {
    accessorKey: 'humidity',
    header: 'Umidade (%)',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-blue-600' }, getValue())
  },
  {
    accessorKey: 'altitude',
    header: 'Altitude (m)',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-green-600' }, getValue())
  },
  {
    accessorKey: 'gyroscope',
    header: 'Giroscópio (rad/s)',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-purple-600' }, getValue())
  },
  {
    accessorKey: 'acceleration',
    header: 'Aceleração (m/s²)',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-pink-600' }, getValue())
  }
]

const table = useVueTable({
  get data() { return filteredData.value },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get globalFilter() { return globalFilter.value }
  },
  onGlobalFilterChange: (value) => {
    globalFilter.value = value
  },
  initialState: {
    pagination: {
      pageSize: 10
    }
  }
})

const stats = computed(() => {
  if (!selectedSensor.value) return null
  return calculateStats(selectedSensor.value)
})

const getFilteredExportData = () => {
  let data = [...filteredData.value]

  if (exportFilters.value.dateFrom) {
    const fromDate = new Date(exportFilters.value.dateFrom)
    data = data.filter(item => item.timestamp >= fromDate)
  }

  if (exportFilters.value.dateTo) {
    const toDate = new Date(exportFilters.value.dateTo + 'T23:59:59')
    data = data.filter(item => item.timestamp <= toDate)
  }

  return data
}

const exportCSV = () => {
  const data = getFilteredExportData()
  const selectedSensors = Object.keys(exportFilters.value.sensors).filter(
    sensor => exportFilters.value.sensors[sensor]
  )

  const headers = ['Data', 'Horário']
  const sensorHeaders = []

  selectedSensors.forEach(sensor => {
    const sensorInfo = sensorOptions.find(s => s.value === sensor)
    if (sensorInfo) {
      headers.push(`${sensorInfo.label} (${sensorInfo.unit})`)
      sensorHeaders.push(sensor)
    }
  })

  const csvContent = [
    headers.join(','),
    ...data.map(row => {
      const rowData = [row.date, row.time]
      sensorHeaders.forEach(sensor => {
        rowData.push(row[sensor])
      })
      return rowData.join(',')
    })
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dados_sensores.csv'
  a.click()
  window.URL.revokeObjectURL(url)

  showExportModal.value = false
}

const clearFilters = () => {
  filters.value.dateFrom = ''
  filters.value.dateTo = ''
  filters.value.search = ''
  globalFilter.value = ''
}

const toggleAllSensors = (value) => {
  Object.keys(exportFilters.value.sensors).forEach(sensor => {
    exportFilters.value.sensors[sensor] = value
  })
}
</script>

<template>
  <div class="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen pt-32 pb-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header Melhorado -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChartBarIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dados Históricos
              </h1>
              <p class="text-gray-600 mt-1">
                Visualize e analise todos os dados coletados pelos sensores
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <FiltersSection
        :filters="filters"
        :global-filter="globalFilter"
        :table="table"
        @update:filters="filters = $event"
        @update:global-filter="globalFilter = $event"
        @clear="clearFilters"
      />

      <!-- Tabela -->
      <DataTable
        :table="table"
        @export="showExportModal = true"
      />

      <!-- Modal de Exportação -->
      <ExportModal
        :show="showExportModal"
        :export-filters="exportFilters"
        :sensor-options="sensorOptions"
        @close="showExportModal = false"
        @export="exportCSV"
        @update:export-filters="exportFilters = $event"
        @toggle-all-sensors="toggleAllSensors"
      />

      <!-- Modal de Estatísticas -->
      <StatsModal
        :show="showStats"
        :selected-sensor="selectedSensor"
        :selected-sensor-info="selectedSensorInfo"
        :sensor-options="sensorOptions"
        :stats="stats"
        @close="showStats = false"
        @update:selected-sensor="selectedSensor = $event"
      />
    </div>

    <!-- FAB - Floating Action Button -->
    <button
      @click="showStats = true"
      class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
      title="Ver Estatísticas"
    >
      <ChartBarIcon class="w-6 h-6" />
    </button>
  </div>
</template>










