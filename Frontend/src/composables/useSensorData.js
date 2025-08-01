import { ref } from 'vue'

// Estado global compartilhado
let globalSensorData = null
let globalSystemStatus = null
let globalIsConnected = null
let interval = null
let timeInterval = null
let instanceCount = 0

export function useSensorData() {
  // Inicializar dados globais apenas uma vez
  if (!globalSensorData) {
    globalSensorData = ref({
      temperature: { value: 23.5, unit: '°C', trend: 'up' },
      humidity: { value: 65.2, unit: '%', trend: 'down' },
      altitude: { value: 847.3, unit: 'm', trend: 'stable' },
      gyroscope: { value: 2.1, unit: 'rad/s', trend: 'up' },
      acceleration: { value: 9.81, unit: 'm/s²', trend: 'stable' }
    })

    globalSystemStatus = ref({
      isOnline: true,
      uptime: '2h 34m',
      currentTime: new Date().toLocaleTimeString()
    })

    // Para simulação, sempre conectado
    globalIsConnected = ref(true)
  }

  const updateSensorData = () => {
    // Atualizar valores
    globalSensorData.value.temperature.value = Number((20 + Math.random() * 10).toFixed(1))
    globalSensorData.value.humidity.value = Number((50 + Math.random() * 30).toFixed(1))
    globalSensorData.value.altitude.value = Number((800 + Math.random() * 100).toFixed(1))
    globalSensorData.value.gyroscope.value = Number((Math.random() * 5).toFixed(1))
    globalSensorData.value.acceleration.value = Number((9 + Math.random() * 2).toFixed(2))

    // Atualizar trends aleatoriamente
    const trends = ['up', 'down', 'stable']
    globalSensorData.value.temperature.trend = trends[Math.floor(Math.random() * trends.length)]
    globalSensorData.value.humidity.trend = trends[Math.floor(Math.random() * trends.length)]
    globalSensorData.value.altitude.trend = trends[Math.floor(Math.random() * trends.length)]
    globalSensorData.value.gyroscope.trend = trends[Math.floor(Math.random() * trends.length)]
    globalSensorData.value.acceleration.trend = trends[Math.floor(Math.random() * trends.length)]
  }

  const startUpdates = () => {
    instanceCount++

    // Iniciar timers apenas se não existirem
    if (!interval) {
      interval = setInterval(updateSensorData, 3000)
    }

    if (!timeInterval) {
      timeInterval = setInterval(() => {
        globalSystemStatus.value.currentTime = new Date().toLocaleTimeString()
      }, 1000)
    }
  }

  const stopUpdates = () => {
    instanceCount--

    // Parar timers apenas quando não há mais instâncias
    if (instanceCount <= 0) {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      if (timeInterval) {
        clearInterval(timeInterval)
        timeInterval = null
      }
      instanceCount = 0
    }
  }

  return {
    sensorData: globalSensorData,
    systemStatus: globalSystemStatus,
    isConnected: globalIsConnected,
    updateSensorData,
    startUpdates,
    stopUpdates
  }
}


