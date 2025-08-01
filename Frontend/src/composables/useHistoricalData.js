import { ref, computed } from 'vue'

export function useHistoricalData() {
  // Gerar dados históricos de exemplo
  const generateHistoricalData = () => {
    const data = []
    const now = new Date()
    
    for (let i = 0; i < 100; i++) {
      const date = new Date(now.getTime() - (i * 30 * 60 * 1000)) // 30 min intervals
      data.push({
        id: i + 1,
        timestamp: date,
        date: date.toLocaleDateString('pt-BR'),
        time: date.toLocaleTimeString('pt-BR'),
        temperature: Number((18 + Math.random() * 15).toFixed(1)),
        humidity: Number((40 + Math.random() * 40).toFixed(1)),
        altitude: Number((750 + Math.random() * 200).toFixed(1)),
        gyroscope: Number((Math.random() * 6).toFixed(2)),
        acceleration: Number((8.5 + Math.random() * 3).toFixed(2))
      })
    }
    
    return data.sort((a, b) => b.timestamp - a.timestamp)
  }

  const historicalData = ref(generateHistoricalData())
  const filters = ref({
    sensor: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })

  const filteredData = computed(() => {
    let filtered = [...historicalData.value]

    if (filters.value.dateFrom) {
      const fromDate = new Date(filters.value.dateFrom)
      filtered = filtered.filter(item => item.timestamp >= fromDate)
    }

    if (filters.value.dateTo) {
      const toDate = new Date(filters.value.dateTo + 'T23:59:59')
      filtered = filtered.filter(item => item.timestamp <= toDate)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.date.toLowerCase().includes(search) ||
        item.time.toLowerCase().includes(search)
      )
    }

    return filtered
  })

  const calculateStats = (sensor, data = filteredData.value) => {
    if (!sensor || data.length === 0) return null

    const values = data.map(item => item[sensor]).sort((a, b) => a - b)
    const sum = values.reduce((acc, val) => acc + val, 0)
    const mean = sum / values.length

    // Mediana
    const median = values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)]

    // Moda
    const frequency = {}
    values.forEach(val => frequency[val] = (frequency[val] || 0) + 1)
    const mode = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b)

    // Desvio padrão
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    return {
      count: values.length,
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      mode: Number(mode),
      min: Math.min(...values),
      max: Math.max(...values),
      stdDev: Number(stdDev.toFixed(2))
    }
  }

  return {
    historicalData,
    filteredData,
    filters,
    calculateStats
  }
}