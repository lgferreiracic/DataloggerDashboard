import { ref, computed, onUnmounted } from 'vue'
import { rtdb } from '@/firebase/config'
import { ref as dbRef, query, limitToLast, get, onValue, off } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const auth = getAuth()

export function useFirebaseHistoricalData() {
  const historicalData = ref([])
  const isLoading = ref(false)
  const filters = ref({
    dateFrom: '',
    dateTo: '',
    search: ''
  })

  let historyListener = null

  const loadHistoricalData = async (limit = 200) => {
    isLoading.value = true
    try {
      const user = auth.currentUser
      if (!user) {
        console.log('❌ Usuário não autenticado')
        return
      }

      const readingsRef = dbRef(rtdb, `sensors/${user.uid}/readings`)
      const readingsQuery = query(readingsRef, limitToLast(limit))
      const snapshot = await get(readingsQuery)

      if (snapshot.exists()) {
        const readings = snapshot.val()
        const data = Object.entries(readings).map(([key, reading]) => {
          // Verificar se existe a estrutura 'current'
          const currentData = reading.current || {}
          return {
            id: key,
            timestamp: new Date(reading.timestamp || Date.now()),
            date: new Date(reading.timestamp || Date.now()).toLocaleDateString('pt-BR'),
            time: new Date(reading.timestamp || Date.now()).toLocaleTimeString('pt-BR'),
            temperature: Number(currentData.temperature || 0).toFixed(1),
            humidity: Number(currentData.humidity || 0).toFixed(1),
            altitude: Number(currentData.altitude || 0).toFixed(1),
            gyroscope: Number(currentData.gyroscope || 0).toFixed(2),
            acceleration: Number(currentData.acceleration || 0).toFixed(2)
          }
        })

        // Ordenar no cliente em vez do servidor
        historicalData.value = data.sort((a, b) => b.timestamp - a.timestamp)
        console.log('📊 Dados históricos carregados:', data.length, 'registros')
      } else {
        console.log('⚠️ Nenhum dado histórico encontrado')
        historicalData.value = []
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados históricos:', error)
      historicalData.value = []
    } finally {
      isLoading.value = false
    }
  }

  const startRealtimeHistoryUpdates = () => {
    const user = auth.currentUser
    if (!user) return

    const historyRef = dbRef(rtdb, `sensors/${user.uid}/readings`)
    const historyQuery = query(historyRef, limitToLast(200))

    historyListener = onValue(historyQuery, (snapshot) => {
      if (snapshot.exists()) {
        const readings = snapshot.val()
        const data = Object.entries(readings).map(([key, reading]) => {
          // Verificar se existe a estrutura 'current'
          const currentData = reading.current || {}
          return {
            id: key,
            timestamp: new Date(reading.timestamp || Date.now()),
            date: new Date(reading.timestamp || Date.now()).toLocaleDateString('pt-BR'),
            time: new Date(reading.timestamp || Date.now()).toLocaleTimeString('pt-BR'),
            temperature: Number(currentData.temperature || 0).toFixed(1),
            humidity: Number(currentData.humidity || 0).toFixed(1),
            altitude: Number(currentData.altitude || 0).toFixed(1),
            gyroscope: Number(currentData.gyroscope || 0).toFixed(2),
            acceleration: Number(currentData.acceleration || 0).toFixed(2)
          }
        })

        // Ordenar no cliente
        historicalData.value = data.sort((a, b) => b.timestamp - a.timestamp)
        console.log('🔄 Dados históricos atualizados em tempo real')
      }
    })
  }

  const stopRealtimeHistoryUpdates = () => {
    if (historyListener) {
      const historyRef = dbRef(rtdb, 'sensors/history')
      off(historyRef, 'value', historyListener)
      historyListener = null
    }
  }

  const filteredData = computed(() => {
    let data = [...historicalData.value]

    if (filters.value.dateFrom) {
      const fromDate = new Date(filters.value.dateFrom)
      data = data.filter(item => item.timestamp >= fromDate)
    }

    if (filters.value.dateTo) {
      const toDate = new Date(filters.value.dateTo + 'T23:59:59')
      data = data.filter(item => item.timestamp <= toDate)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      data = data.filter(item =>
        item.date.toLowerCase().includes(search) ||
        item.time.toLowerCase().includes(search)
      )
    }

    return data
  })

  const calculateStats = (sensorType) => {
    const values = filteredData.value.map(item => parseFloat(item[sensorType])).filter(val => !isNaN(val))

    if (values.length === 0) return null

    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length

    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      count: values.length
    }
  }

  onUnmounted(() => {
    stopRealtimeHistoryUpdates()
  })

  return {
    historicalData,
    filteredData,
    filters,
    isLoading,
    loadHistoricalData,
    startRealtimeHistoryUpdates,
    stopRealtimeHistoryUpdates,
    calculateStats
  }
}

