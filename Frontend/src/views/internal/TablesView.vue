<script setup>
import { ref, computed, h, onMounted, onUnmounted } from 'vue'
import { useVueTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/vue-table'
import { useFirebaseHistoricalData } from '@/composables/useFirebaseHistoricalData.js'
import { TableCellsIcon, ChartBarIcon } from '@heroicons/vue/24/outline'
import FiltersSection from '@/components/tables/FiltersSection.vue'
import DataTable from '@/components/tables/DataTable.vue'
import ExportModal from '@/components/tables/ExportModal.vue'
import StatsModal from '@/components/tables/StatsModal.vue'

// Usar dados históricos do Firebase
const {
  filteredData,
  filters,
  loadHistoricalData,
  startRealtimeHistoryUpdates,
  stopRealtimeHistoryUpdates,
  calculateStats
} = useFirebaseHistoricalData()

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

const stats = computed(() => {
  if (!selectedSensor.value) return null
  return calculateStats(selectedSensor.value)
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

// Lifecycle hooks
onMounted(async () => {
  await loadHistoricalData()
  startRealtimeHistoryUpdates()
})

onUnmounted(() => {
  stopRealtimeHistoryUpdates()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Melhorado -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <TableCellsIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tabelas de Dados
            </h1>
            <p class="text-gray-600 mt-1">Visualize e exporte dados históricos dos sensores</p>
          </div>
        </div>
        <button
          @click="showStats = true"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ChartBarIcon class="w-5 h-5" />
          <span>Estatísticas</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-6">
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
  </div>
</template>




