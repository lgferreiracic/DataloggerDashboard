<script setup>
import { onMounted, onUnmounted, watch, computed, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Line } from 'vue-chartjs'
import { useFirebaseSensorData } from '@/composables/useFirebaseSensorData.js'
import { useSensorData } from '@/composables/useSensorData.js'
import { useChartsData } from '@/composables/useChartsData.js'
import { useFirebaseHistoricalData } from '@/composables/useFirebaseHistoricalData.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const route = useRoute()
const isInternalArea = route.path.startsWith('/app')

// Usar Firebase para área interna, simulação para área externa
const sensorDataComposable = isInternalArea
  ? useFirebaseSensorData()
  : useSensorData()

const { sensorData, systemStatus, isConnected } = sensorDataComposable
const startRealtimeUpdates = sensorDataComposable.startRealtimeUpdates || sensorDataComposable.startUpdates
const stopRealtimeUpdates = sensorDataComposable.stopRealtimeUpdates || sensorDataComposable.stopUpdates

// Verificar se os dados existem
if (!sensorData || !systemStatus) {
  console.error('❌ Dados dos sensores não inicializados corretamente')
}

const {
  updateCounter,
  temperatureData,
  humidityData,
  altitudeData,
  gyroscopeData,
  accelerationData,
  updateCharts,
  clearCharts,
  loadInitialData,
  isInitialized,
  setInitialized
} = useChartsData(isInternalArea) // Passar true se for área interna

// Carregar dados históricos para área interna
const { loadHistoricalData } = useFirebaseHistoricalData()

// Detectar se é mobile
const isMobile = ref(window.innerWidth < 1024)

// Listener para resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
}

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 0, // Evitar delay no resize
  animation: isMobile.value ? false : {
    duration: 300,
    easing: 'easeInOutQuart'
  },
  onResize: (chart) => {
    // Forçar altura fixa em mobile para evitar loop de resize
    if (isMobile.value) {
      chart.canvas.style.height = chart.canvas.parentElement.clientHeight + 'px'
    }
  },
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        maxTicksLimit: isMobile.value ? 4 : 6
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxTicksLimit: isMobile.value ? 4 : 8,
        maxRotation: 0
      }
    }
  },
  elements: {
    point: {
      radius: isMobile.value ? 1 : 2,
      hoverRadius: isMobile.value ? 3 : 4
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
}))

// Status do sistema formatado
const systemStatusFormatted = computed(() => {
  const defaultTime = new Date().toLocaleTimeString('pt-BR')
  const connected = isConnected?.value ?? false
  const status = systemStatus?.value

  return {
    status: connected ? 'Ativo' : 'Inativo',
    statusColor: connected ? 'emerald' : 'red',
    currentTime: status?.currentTime ?? defaultTime,
    lastUpdate: status?.lastUpdate
      ? status.lastUpdate.toLocaleTimeString('pt-BR')
      : status?.currentTime ?? defaultTime,
    connectionStatus: connected ? 'ONLINE' : 'OFFLINE',
    connectionColor: connected ? 'green' : 'red'
  }
})

// Observar mudanças nos dados dos sensores com mais robustez
watch(() => sensorData?.value, (newSensorData) => {
  if (newSensorData && newSensorData.temperature?.value !== undefined) {
    console.log('🔄 Dados dos sensores mudaram, atualizando gráficos:', newSensorData)
    updateCharts(newSensorData)
  }
}, {
  immediate: false,
  deep: true,
  flush: 'post' // Executar após as atualizações do DOM
})

// Watcher adicional para forçar atualização quando conectar
watch(() => isConnected?.value, (connected) => {
  if (connected && sensorData?.value) {
    console.log('🔗 Conexão estabelecida, forçando atualização dos gráficos')
    nextTick(() => {
      updateCharts(sensorData.value)
    })
  }
}, { immediate: false })

onMounted(async () => {
  window.addEventListener('resize', handleResize)

  if (startRealtimeUpdates) {
    startRealtimeUpdates()
  }

  // Aguardar um tick para garantir que tudo está montado
  await nextTick()

  // Se for área interna (logado), carregar dados históricos primeiro
  if (isInternalArea) {
    try {
      clearCharts()

      // Carregar dados históricos para inicializar gráficos
      await loadHistoricalData(10)
      const { historicalData } = useFirebaseHistoricalData()

      if (historicalData.value && historicalData.value.length > 0) {
        await loadInitialData(historicalData.value)
        console.log('📊 Gráficos inicializados com dados históricos')
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar gráficos:', error)
    }
  } else {
    // Se for área externa, gerar dados iniciais apenas se não foi inicializado
    if (!isInitialized() && sensorData?.value) {
      try {
        for (let i = 0; i < 8; i++) {
          updateCharts(sensorData.value)
        }
        setInitialized()
      } catch (error) {
        console.error('❌ Erro ao gerar dados iniciais:', error)
      }
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (stopRealtimeUpdates) {
    stopRealtimeUpdates()
  }
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
    <!-- Primeira coluna - Temperatura e Umidade -->
    <div class="space-y-4">
      <!-- Gráfico de Temperatura -->
      <div class="bg-white rounded-lg shadow-md p-4 h-[calc(50%-0.5rem)]">
        <div class="flex items-center mb-3">
          <div class="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-2">
            <span class="text-white text-xs">🌡️</span>
          </div>
          <h3 class="text-sm font-semibold text-gray-800">Temperatura</h3>
        </div>
        <div
          class="h-[calc(100%-3rem)] relative"
          :class="{ 'mobile-chart-container': isMobile }"
          :key="`temp-${updateCounter}`"
        >
          <Line :data="temperatureData" :options="chartOptions" />
        </div>
      </div>

      <!-- Gráfico de Umidade -->
      <div class="bg-white rounded-lg shadow-md p-4 h-[calc(50%-0.5rem)]">
        <div class="flex items-center mb-3">
          <div class="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mr-2">
            <span class="text-white text-xs">💧</span>
          </div>
          <h3 class="text-sm font-semibold text-gray-800">Umidade</h3>
        </div>
        <div
          class="h-[calc(100%-3rem)] relative"
          :class="{ 'mobile-chart-container': isMobile }"
          :key="`hum-${updateCounter}`"
        >
          <Line :data="humidityData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <!-- Segunda coluna - Altitude e Giroscópio -->
    <div class="space-y-4">
      <!-- Gráfico de Altitude -->
      <div class="bg-white rounded-lg shadow-md p-4 h-[calc(50%-0.5rem)]">
        <div class="flex items-center mb-3">
          <div class="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-2">
            <span class="text-white text-xs">⛰️</span>
          </div>
          <h3 class="text-sm font-semibold text-gray-800">Altitude</h3>
        </div>
        <div
          class="h-[calc(100%-3rem)] relative"
          :class="{ 'mobile-chart-container': isMobile }"
          :key="`alt-${updateCounter}`"
        >
          <Line :data="altitudeData" :options="chartOptions" />
        </div>
      </div>

      <!-- Gráfico de Giroscópio -->
      <div class="bg-white rounded-lg shadow-md p-4 h-[calc(50%-0.5rem)]">
        <div class="flex items-center mb-3">
          <div class="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center mr-2">
            <span class="text-white text-xs">🔄</span>
          </div>
          <h3 class="text-sm font-semibold text-gray-800">Giroscópio</h3>
        </div>
        <div
          class="h-[calc(100%-3rem)] relative"
          :class="{ 'mobile-chart-container': isMobile }"
          :key="`gyro-${updateCounter}`"
        >
          <Line :data="gyroscopeData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <!-- Terceira coluna - Aceleração e Status do Sistema -->
    <div class="space-y-4">
      <!-- Gráfico de Aceleração -->
      <div class="bg-white rounded-lg shadow-md p-4 h-[calc(50%-0.5rem)]">
        <div class="flex items-center mb-3">
          <div class="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center mr-2">
            <span class="text-white text-xs">🚀</span>
          </div>
          <h3 class="text-sm font-semibold text-gray-800">Aceleração</h3>
        </div>
        <div
          class="h-[calc(100%-3rem)] relative"
          :class="{ 'mobile-chart-container': isMobile }"
          :key="`accel-${updateCounter}`"
        >
          <Line :data="accelerationData" :options="chartOptions" />
        </div>
      </div>

      <!-- Status do Sistema -->
      <div :class="[
        'bg-white rounded-lg shadow-md p-4 h-[calc(50%-0.5rem)] border-l-4',
        isConnected ? 'border-emerald-500' : 'border-red-500'
      ]">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div :class="[
              'w-6 h-6 rounded-lg flex items-center justify-center mr-2',
              isConnected
                ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                : 'bg-gradient-to-br from-red-400 to-red-500'
            ]">
              <span class="text-white text-xs">{{ isConnected ? '⚡' : '⚠️' }}</span>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">Status do Sistema</h3>
          </div>
          <div class="flex items-center">
            <div :class="[
              'w-2 h-2 rounded-full mr-2 shadow-lg',
              isConnected
                ? 'bg-green-500 animate-pulse shadow-green-500/50'
                : 'bg-red-500 shadow-red-500/50'
            ]"></div>
            <span :class="[
              'text-xs font-medium',
              isConnected ? 'text-emerald-600' : 'text-red-600'
            ]">
              {{ systemStatusFormatted.connectionStatus }}
            </span>
          </div>
        </div>

        <div class="space-y-4 h-[calc(100%-4rem)] flex flex-col justify-center">
          <div :class="[
            'rounded-lg p-3',
            isConnected ? 'bg-emerald-50' : 'bg-red-50'
          ]">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Status:</span>
              <span :class="[
                'text-sm font-bold px-2 py-1 rounded-full',
                isConnected
                  ? 'text-emerald-600 bg-emerald-100'
                  : 'text-red-600 bg-red-100'
              ]">
                {{ systemStatusFormatted.status }}
              </span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Horário:</span>
              <span :class="[
                'text-sm font-mono font-bold',
                isConnected ? 'text-emerald-700' : 'text-red-700'
              ]">
                {{ systemStatusFormatted.currentTime }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Última atualização:</span>
              <span :class="[
                'text-xs px-2 py-1 rounded-full',
                isConnected
                  ? 'text-emerald-600 bg-emerald-100'
                  : 'text-red-600 bg-red-100'
              ]">
                {{ systemStatusFormatted.lastUpdate }}
              </span>
            </div>
          </div>

          <div class="text-center">
            <div :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
              isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            ]">
              <div :class="[
                'w-1.5 h-1.5 rounded-full mr-2',
                isConnected
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-red-500'
              ]"></div>
              {{ isConnected ? 'Sistema funcionando normalmente' : 'Sistema desconectado' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-chart-container {
  overflow: hidden;
  min-height: 200px;
  max-height: 300px;
}

.mobile-chart-container canvas {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 1023px) {
  .mobile-chart-container {
    height: 250px !important;
  }

  .space-y-4 > * + * {
    margin-top: 1.5rem !important;
  }

  .grid {
    padding-bottom: 2rem;
  }

  /* Ajuste específico para o card de aceleração */
  .space-y-4:last-child > div:first-child {
    height: calc(50% - 1rem) !important;
  }

  .space-y-4:last-child > div:first-child .mobile-chart-container {
    height: 200px !important;
  }
}
</style>






