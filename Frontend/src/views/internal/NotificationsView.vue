<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth } from '@/firebase/config.js'
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore'

const db = getFirestore()
const notifications = ref([])
const loading = ref(true)
const filter = ref('all') // all, unread, alerts

const sensorInfo = {
  temperature: { label: 'Temperatura', unit: '°C', icon: '🌡️', color: 'orange' },
  humidity: { label: 'Umidade', unit: '%', icon: '💧', color: 'blue' },
  altitude: { label: 'Altitude', unit: 'm', icon: '⛰️', color: 'green' },
  gyroscope: { label: 'Giroscópio', unit: 'rad/s', icon: '🔄', color: 'purple' },
  acceleration: { label: 'Aceleração', unit: 'm/s²', icon: '🚀', color: 'pink' }
}

const filteredNotifications = computed(() => {
  if (filter.value === 'all') return notifications.value
  if (filter.value === 'unread') return notifications.value.filter(n => !n.read)
  if (filter.value === 'alerts') return notifications.value.filter(n => n.type === 'alert')
  return notifications.value
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const loadNotifications = () => {
  if (!auth.currentUser) return

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', auth.currentUser.uid)
    // Remover orderBy para evitar necessidade de índice
  )

  onSnapshot(q, (snapshot) => {
    const notificationsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }))

    // Ordenar no cliente em vez do servidor
    notifications.value = notificationsData.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0
      return b.timestamp - a.timestamp
    })

    loading.value = false
  })
}

const markAsRead = async (notificationId) => {
  // Implementar marcação como lida
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

const getAlertIcon = (type, severity) => {
  if (type === 'alert') {
    return severity === 'high' ? '🚨' : '⚠️'
  }
  return 'ℹ️'
}

const getAlertColor = (type, severity) => {
  if (type === 'alert') {
    return severity === 'high' ? 'red' : 'yellow'
  }
  return 'blue'
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  return timestamp.toLocaleString('pt-BR')
}

onMounted(() => {
  loadNotifications()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-lg">🔔</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Notificações</h1>
            <p class="text-gray-600">Alertas e avisos do sistema</p>
          </div>
        </div>
        <div v-if="unreadCount > 0" class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          {{ unreadCount }} não lidas
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex space-x-2">
        <button
          @click="filter = 'all'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          Todas
        </button>
        <button
          @click="filter = 'unread'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'unread'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          Não Lidas ({{ unreadCount }})
        </button>
        <button
          @click="filter = 'alerts'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'alerts'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          Alertas
        </button>
      </div>
    </div>

    <!-- Lista de Notificações -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Carregando notificações...</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center">
        <span class="text-4xl">📭</span>
        <p class="text-gray-600 mt-2">Nenhuma notificação encontrada</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          @click="markAsRead(notification.id)"
          :class="[
            'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
            !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          ]"
        >
          <div class="flex items-start space-x-3">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              `bg-gradient-to-br from-${getAlertColor(notification.type, notification.severity)}-400 to-${getAlertColor(notification.type, notification.severity)}-500`
            ]">
              <span class="text-white text-sm">
                {{ getAlertIcon(notification.type, notification.severity) }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h3 :class="[
                  'text-sm font-medium',
                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                ]">
                  {{ notification.title }}
                </h3>
                <span class="text-xs text-gray-500">
                  {{ formatTimestamp(notification.timestamp) }}
                </span>
              </div>

              <p class="text-sm text-gray-600 mt-1">
                {{ notification.message }}
              </p>

              <div v-if="notification.sensorData" class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span>Sensor: {{ sensorInfo[notification.sensor]?.label }}</span>
                <span>Valor: {{ notification.sensorData.value }}{{ sensorInfo[notification.sensor]?.unit }}</span>
                <span v-if="notification.threshold">
                  Limite: {{ notification.threshold.min }}-{{ notification.threshold.max }}{{ sensorInfo[notification.sensor]?.unit }}
                </span>
              </div>
            </div>

            <div v-if="!notification.read" class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
