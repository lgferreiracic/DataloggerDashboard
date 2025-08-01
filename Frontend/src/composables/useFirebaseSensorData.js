import { ref, onUnmounted, nextTick } from 'vue'
import { rtdb, auth } from '@/firebase/config'
import { ref as dbRef, onValue, off } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'

// Estado global compartilhado
let globalSensorData = null
let globalSystemStatus = null
let globalIsConnected = null
let listeners = []
let instanceCount = 0
let authListener = null

export function useFirebaseSensorData() {
  // Inicializar dados globais apenas uma vez
  if (!globalSensorData) {
    globalSensorData = ref({
      temperature: { value: 0, unit: '°C', trend: 'stable' },
      humidity: { value: 0, unit: '%', trend: 'stable' },
      altitude: { value: 0, unit: 'm', trend: 'stable' },
      gyroscope: { value: 0, unit: 'rad/s', trend: 'stable' },
      acceleration: { value: 0, unit: 'm/s²', trend: 'stable' }
    })

    globalSystemStatus = ref({
      isOnline: false,
      uptime: '0m',
      currentTime: new Date().toLocaleTimeString(),
      lastUpdate: null
    })

    globalIsConnected = ref(false)

    // Listener para mudanças de autenticação
    authListener = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Usuário fez logout - parar todos os listeners
        console.log('🚪 Usuário fez logout - parando listeners Firebase')
        stopAllListeners()
        globalIsConnected.value = false
        globalSystemStatus.value.isOnline = false
      }
    })
  }

  const calculateTrend = (current, previous) => {
    if (!previous) return 'stable'
    const diff = current - previous
    if (Math.abs(diff) < 0.1) return 'stable'
    return diff > 0 ? 'up' : 'down'
  }

  const stopAllListeners = () => {
    listeners.forEach(({ ref, listener, interval }) => {
      if (ref && listener) {
        off(ref, 'value', listener)
      }
      if (interval) {
        clearInterval(interval)
      }
    })
    listeners = []
    instanceCount = 0

    // Clean up auth listener
    if (authListener) {
      authListener()
      authListener = null
    }

    console.log('🛑 Todos os listeners Firebase foram parados')
  }

  const startRealtimeUpdates = () => {
    // Verificar se usuário está logado
    if (!auth.currentUser) {
      console.log('⚠️ Usuário não logado - não iniciando listeners')
      return
    }

    instanceCount++

    // Só criar listeners se não existirem
    if (listeners.length === 0) {
      console.log('🔄 Iniciando listeners Firebase...')

      // Listener para dados dos sensores no novo formato: readings/{id}/current
      const readingsRef = dbRef(rtdb, `sensors/${auth.currentUser.uid}/readings`)
      const sensorsListener = onValue(readingsRef, async (snapshot) => {
        if (snapshot.exists()) {
          const readings = snapshot.val()

          // Pegar a leitura mais recente (última chave ordenada)
          const readingIds = Object.keys(readings).sort()
          const latestReadingId = readingIds[readingIds.length - 1]
          const latestReading = readings[latestReadingId]

          // Verificar se existe a estrutura 'current'
          if (latestReading && latestReading.current) {
            const data = latestReading.current
            const timestamp = new Date()

            // Calcular trends baseado nos valores anteriores
            const prevTemp = globalSensorData.value.temperature.value
            const prevHum = globalSensorData.value.humidity.value
            const prevAlt = globalSensorData.value.altitude.value
            const prevGyro = globalSensorData.value.gyroscope.value
            const prevAccel = globalSensorData.value.acceleration.value

            // Atualizar dados de forma reativa
            const newSensorData = {
              temperature: {
                value: Number(data.temperature || 0).toFixed(1),
                unit: '°C',
                trend: calculateTrend(data.temperature, prevTemp)
              },
              humidity: {
                value: Number(data.humidity || 0).toFixed(1),
                unit: '%',
                trend: calculateTrend(data.humidity, prevHum)
              },
              altitude: {
                value: Number(data.altitude || 0).toFixed(1),
                unit: 'm',
                trend: calculateTrend(data.altitude, prevAlt)
              },
              gyroscope: {
                value: Number(data.gyroscope || 0).toFixed(2),
                unit: 'rad/s',
                trend: calculateTrend(data.gyroscope, prevGyro)
              },
              acceleration: {
                value: Number(data.acceleration || 0).toFixed(2),
                unit: 'm/s²',
                trend: calculateTrend(data.acceleration, prevAccel)
              }
            }

            // Atualizar de forma reativa
            globalSensorData.value = newSensorData
            globalSystemStatus.value.lastUpdate = timestamp
            globalSystemStatus.value.isOnline = true
            globalIsConnected.value = true

            // Aguardar próximo tick para garantir reatividade
            await nextTick()

            console.log('📊 Dados dos sensores atualizados:', data)
          } else {
            console.log('⚠️ Estrutura current não encontrada na leitura mais recente')
            globalIsConnected.value = false
          }
        } else {
          console.log('⚠️ Nenhum dado encontrado em sensors/' + auth.currentUser.uid + '/readings')
          globalIsConnected.value = false
        }
      }, (error) => {
        if (error.code === 'PERMISSION_DENIED') {
          console.log('⚠️ Aguardando dados dos sensores...')
        } else {
          console.error('❌ Erro ao ler dados dos sensores:', error)
        }
        globalIsConnected.value = false
        globalSystemStatus.value.isOnline = false
      })

      listeners.push({ ref: readingsRef, listener: sensorsListener })

      // Timer para atualizar horário atual
      const timeInterval = setInterval(() => {
        globalSystemStatus.value.currentTime = new Date().toLocaleTimeString()
      }, 1000)

      listeners.push({ interval: timeInterval })
    }
  }

  const stopRealtimeUpdates = () => {
    instanceCount--

    // Remover listeners apenas quando não há mais instâncias
    if (instanceCount <= 0) {
      stopAllListeners()
      globalIsConnected.value = false
    }
  }

  // Cleanup automático quando o componente for desmontado
  onUnmounted(() => {
    stopRealtimeUpdates()
  })

  return {
    sensorData: globalSensorData,
    systemStatus: globalSystemStatus,
    isConnected: globalIsConnected,
    startRealtimeUpdates,
    stopRealtimeUpdates
  }
}





