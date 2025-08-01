<script setup>
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { auth } from '@/firebase/config.js'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore'
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  CpuChipIcon
} from '@heroicons/vue/24/outline'

const { sidebarCollapsed } = defineProps({
  sidebarCollapsed: Boolean
})

const emit = defineEmits(['open-mobile-sidebar'])

const user = ref(null)
const unreadNotifications = ref(0)
const db = getFirestore()

// Monitorar estado de autenticação
onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      loadUnreadNotifications()
    } else {
      unreadNotifications.value = 0
    }
  })
})

// Carregar notificações não lidas
const loadUnreadNotifications = () => {
  if (!auth.currentUser) return

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', auth.currentUser.uid),
    where('read', '==', false)
  )

  onSnapshot(q, (snapshot) => {
    unreadNotifications.value = snapshot.size
  }, (error) => {
    console.error('Erro ao carregar notificações:', error)
    unreadNotifications.value = 0
  })
}

// Gerar iniciais do nome do usuário
const userInitials = computed(() => {
  if (!user.value?.displayName) return 'U'
  return user.value.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

// Nome do usuário
const userName = computed(() => {
  return user.value?.displayName || 'Usuário'
})
</script>

<template>
  <div :class="[
    'transition-all duration-300',
    sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
  ]">
    <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <!-- Mobile menu button -->
      <button
        type="button"
        class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        @click="emit('open-mobile-sidebar')"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>

      <!-- Separator -->
      <div class="h-6 w-px bg-gray-200 lg:hidden" />

      <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div class="flex flex-1 items-center">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <CpuChipIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Plataforma Datalogger Dashboard
              </h1>
              <p class="text-xs text-gray-500 hidden sm:block">Sistema de Monitoramento IoT</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-x-3 lg:gap-x-4">
          <!-- Notifications -->
          <RouterLink
            to="/app/notifications"
            class="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
            title="Notificações"
          >
            <BellIcon class="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
            >
              <span v-if="unreadNotifications > 9" class="text-white text-xs font-bold">9+</span>
            </span>
          </RouterLink>

          <!-- Settings -->
          <RouterLink
            to="/app/settings"
            class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
            title="Configurações"
          >
            <Cog6ToothIcon class="h-6 w-6 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300" />
          </RouterLink>

          <!-- Separator -->
          <div class="hidden lg:block lg:h-8 lg:w-px lg:bg-gray-200" />

          <!-- Profile dropdown -->
          <div class="relative">
            <RouterLink
              to="/app/profile"
              class="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 group"
            >
              <div class="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span class="text-white text-sm font-bold">{{ userInitials }}</span>
              </div>
              <div class="hidden lg:block">
                <p class="font-medium">{{ userName }}</p>
                <p class="text-xs text-gray-500">{{ user?.email || 'email@exemplo.com' }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <slot />
  </div>
</template>




