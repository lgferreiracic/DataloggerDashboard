import { ref, nextTick, shallowRef } from 'vue'

// Estado global compartilhado dos gráficos
let globalChartsData = null
let isInitialized = false

export function useChartsData(startWithZeros = false) {
  // Inicializar dados globais apenas uma vez
  if (!globalChartsData) {
    const initialData = startWithZeros ? [] : []

    globalChartsData = {
      updateCounter: ref(0),
      temperatureData: shallowRef({
        labels: [...initialData],
        datasets: [{
          label: 'Temperatura (°C)',
          data: [...initialData],
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }),
      humidityData: shallowRef({
        labels: [...initialData],
        datasets: [{
          label: 'Umidade (%)',
          data: [...initialData],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }),
      altitudeData: shallowRef({
        labels: [...initialData],
        datasets: [{
          label: 'Altitude (m)',
          data: [...initialData],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }),
      gyroscopeData: shallowRef({
        labels: [...initialData],
        datasets: [{
          label: 'Giroscópio (rad/s)',
          data: [...initialData],
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }),
      accelerationData: shallowRef({
        labels: [...initialData],
        datasets: [{
          label: 'Aceleração (m/s²)',
          data: [...initialData],
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          fill: true,
          tension: 0.4
        }]
      })
    }
  }

  const clearCharts = () => {
    if (!globalChartsData) return

    // Limpar dados mantendo a estrutura
    globalChartsData.temperatureData.value = {
      labels: [],
      datasets: [{
        label: 'Temperatura (°C)',
        data: [],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }

    globalChartsData.humidityData.value = {
      labels: [],
      datasets: [{
        label: 'Umidade (%)',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }

    globalChartsData.altitudeData.value = {
      labels: [],
      datasets: [{
        label: 'Altitude (m)',
        data: [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }

    globalChartsData.gyroscopeData.value = {
      labels: [],
      datasets: [{
        label: 'Giroscópio (rad/s)',
        data: [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }

    globalChartsData.accelerationData.value = {
      labels: [],
      datasets: [{
        label: 'Aceleração (m/s²)',
        data: [],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }

    globalChartsData.updateCounter.value++
    isInitialized = false
  }

  const loadInitialData = async (historicalData) => {
    if (!historicalData || historicalData.length === 0) return

    try {
      // Pegar os últimos 10 registros e reverter para ordem cronológica
      const recentData = historicalData.slice(0, 10).reverse()

      const labels = recentData.map(item => item.time || new Date().toLocaleTimeString())

      // Validar dados antes de usar
      const tempData = recentData.map(item => {
        const val = parseFloat(item.temperature || 0)
        return isNaN(val) ? 0 : val
      })

      const humData = recentData.map(item => {
        const val = parseFloat(item.humidity || 0)
        return isNaN(val) ? 0 : val
      })

      const altData = recentData.map(item => {
        const val = parseFloat(item.altitude || 0)
        return isNaN(val) ? 0 : val
      })

      const gyroData = recentData.map(item => {
        const val = parseFloat(item.gyroscope || 0)
        return isNaN(val) ? 0 : val
      })

      const accelData = recentData.map(item => {
        const val = parseFloat(item.acceleration || 0)
        return isNaN(val) ? 0 : val
      })

      // Atualizar cada gráfico com dados validados
      globalChartsData.temperatureData.value = {
        labels: [...labels],
        datasets: [{
          label: 'Temperatura (°C)',
          data: [...tempData],
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }

      globalChartsData.humidityData.value = {
        labels: [...labels],
        datasets: [{
          label: 'Umidade (%)',
          data: [...humData],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }

      globalChartsData.altitudeData.value = {
        labels: [...labels],
        datasets: [{
          label: 'Altitude (m)',
          data: [...altData],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }

      globalChartsData.gyroscopeData.value = {
        labels: [...labels],
        datasets: [{
          label: 'Giroscópio (rad/s)',
          data: [...gyroData],
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }

      globalChartsData.accelerationData.value = {
        labels: [...labels],
        datasets: [{
          label: 'Aceleração (m/s²)',
          data: [...accelData],
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }

      globalChartsData.updateCounter.value++
      isInitialized = true

      console.log('📊 Gráficos inicializados com dados históricos:', recentData.length, 'pontos')
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais dos gráficos:', error)
    }
  }

  const updateCharts = async (sensorData) => {
    if (!sensorData || !globalChartsData) return

    try {
      const now = new Date()
      const timeLabel = now.toLocaleTimeString()
      const maxPoints = 15

      // Validar dados de entrada
      const tempValue = parseFloat(sensorData.temperature?.value || 0)
      const humValue = parseFloat(sensorData.humidity?.value || 0)
      const altValue = parseFloat(sensorData.altitude?.value || 0)
      const gyroValue = parseFloat(sensorData.gyroscope?.value || 0)
      const accelValue = parseFloat(sensorData.acceleration?.value || 0)

      if (isNaN(tempValue) || isNaN(humValue) || isNaN(altValue) || isNaN(gyroValue) || isNaN(accelValue)) {
        console.warn('⚠️ Dados inválidos recebidos:', sensorData)
        return
      }

      console.log('📊 Atualizando gráficos com:', { tempValue, humValue, altValue, gyroValue, accelValue })

      // Função helper para atualizar um gráfico
      const updateSingleChart = (chartData, newValue) => {
        const newData = { ...chartData.value }

        if (newData.labels.length >= maxPoints) {
          newData.labels.shift()
          newData.datasets[0].data.shift()
        }

        newData.labels.push(timeLabel)
        newData.datasets[0].data.push(newValue)

        return newData
      }

      // Atualizar todos os gráficos
      globalChartsData.temperatureData.value = updateSingleChart(globalChartsData.temperatureData, tempValue)
      globalChartsData.humidityData.value = updateSingleChart(globalChartsData.humidityData, humValue)
      globalChartsData.altitudeData.value = updateSingleChart(globalChartsData.altitudeData, altValue)
      globalChartsData.gyroscopeData.value = updateSingleChart(globalChartsData.gyroscopeData, gyroValue)
      globalChartsData.accelerationData.value = updateSingleChart(globalChartsData.accelerationData, accelValue)

      // Incrementar contador para forçar reatividade
      globalChartsData.updateCounter.value++

      // Aguardar próximo tick para garantir que a atualização seja processada
      await nextTick()

      console.log('✅ Gráficos atualizados, contador:', globalChartsData.updateCounter.value)
    } catch (error) {
      console.error('❌ Erro ao atualizar gráficos:', error)
    }
  }

  return {
    ...globalChartsData,
    updateCharts,
    loadInitialData,
    isInitialized: () => isInitialized,
    setInitialized: () => { isInitialized = true },
    clearCharts
  }
}



