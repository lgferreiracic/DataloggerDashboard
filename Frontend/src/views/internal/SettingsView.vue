<script setup>
import { ref, onMounted } from 'vue'
import { auth } from '@/firebase/config.js'
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore'

const db = getFirestore()
const loading = ref(false)
const saveSuccess = ref(false)

const thresholds = ref({
  temperature: {
    min: 15,
    max: 30,
    enabled: true
  },
  humidity: {
    min: 30,
    max: 80,
    enabled: true
  },
  altitude: {
    min: 500,
    max: 1200,
    enabled: true
  },
  gyroscope: {
    min: 0,
    max: 5,
    enabled: true
  },
  acceleration: {
    min: 8,
    max: 12,
    enabled: true
  }
})

const sensorInfo = {
  temperature: { label: 'Temperatura', unit: '°C', icon: '🌡️', color: 'orange' },
  humidity: { label: 'Umidade', unit: '%', icon: '💧', color: 'blue' },
  altitude: { label: 'Altitude', unit: 'm', icon: '⛰️', color: 'green' },
  gyroscope: { label: 'Giroscópio', unit: 'rad/s', icon: '🔄', color: 'purple' },
  acceleration: { label: 'Aceleração', unit: 'm/s²', icon: '🚀', color: 'pink' }
}

const loadSettings = async () => {
  if (!auth.currentUser) return

  try {
    const docRef = doc(db, 'userSettings', auth.currentUser.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      thresholds.value = { ...thresholds.value, ...docSnap.data().thresholds }
      console.log('✅ Configurações carregadas')
    } else {
      // Documento não existe, usar valores padrão e criar na primeira vez que salvar
      console.log('📝 Usando configurações padrão (documento será criado ao salvar)')
    }
  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error)
    // Usar valores padrão em caso de erro
    console.log('📝 Usando configurações padrão devido ao erro')
  }
}

const saveSettings = async () => {
  if (!auth.currentUser) return

  loading.value = true
  try {
    const docRef = doc(db, 'userSettings', auth.currentUser.uid)
    await setDoc(docRef, {
      thresholds: thresholds.value,
      updatedAt: new Date()
    }, { merge: true })

    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <span class="text-white text-lg">⚙️</span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Configurações</h1>
          <p class="text-gray-600">Configure os limites de alerta para os sensores</p>
        </div>
      </div>
    </div>

    <!-- Configurações dos Sensores -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Limites de Alerta</h2>
        <p class="text-sm text-gray-600 mt-1">Defina os valores mínimos e máximos para cada sensor</p>
      </div>

      <div class="p-6 space-y-6">
        <div v-for="(sensor, key) in sensorInfo" :key="key" class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center',
                `bg-gradient-to-br from-${sensor.color}-400 to-${sensor.color}-500`
              ]">
                <span class="text-white text-sm">{{ sensor.icon }}</span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">{{ sensor.label }}</h3>
                <p class="text-sm text-gray-500">Unidade: {{ sensor.unit }}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="thresholds[key].enabled"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div v-if="thresholds[key].enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Valor Mínimo ({{ sensor.unit }})
              </label>
              <input
                type="number"
                v-model.number="thresholds[key].min"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Valor Máximo ({{ sensor.unit }})
              </label>
              <input
                type="number"
                v-model.number="thresholds[key].max"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div class="flex items-center justify-between">
          <div v-if="saveSuccess" class="flex items-center text-green-600">
            <span class="text-sm font-medium">✅ Configurações salvas com sucesso!</span>
          </div>
          <button
            @click="saveSettings"
            :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {{ loading ? 'Salvando...' : 'Salvar Configurações' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


