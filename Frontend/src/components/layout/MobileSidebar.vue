<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { auth } from '@/firebase/config.js'
import { onAuthStateChanged } from 'firebase/auth'
import { ChartBarIcon, TableCellsIcon, UserIcon, XMarkIcon, ArrowRightOnRectangleIcon, CubeIcon } from '@heroicons/vue/24/outline'

const { sidebarOpen } = defineProps({
  sidebarOpen: Boolean
})

const emit = defineEmits(['close', 'logout'])

const route = useRoute()
const user = ref(null)

// Monitorar estado de autenticação
onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
})

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: ChartBarIcon },
  { name: 'Tabelas', href: '/app/tables', icon: TableCellsIcon },
  { name: 'Modelo 3D', href: '/app/model3d', icon: CubeIcon },
  { name: 'Perfil', href: '/app/profile', icon: UserIcon }
]

const currentNavigation = computed(() => {
  return navigation.map(item => ({
    ...item,
    current: route.path === item.href
  }))
})

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
  <div v-if="sidebarOpen" class="relative z-50 lg:hidden">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-gray-900/80" @click="emit('close')"></div>

    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
      <div class="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <img
            src="@/assets/images/embarcatechLogo.png"
            alt="EmbarcaTech Logo"
            class="h-8 w-auto"
          />
        </div>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- User Info Section -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-bold">{{ userInitials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user?.email || 'email@exemplo.com' }}</p>
          </div>
        </div>
      </div>

      <nav class="mt-6 px-3">
        <div class="space-y-1">
          <RouterLink
            v-for="item in currentNavigation"
            :key="item.name"
            :to="item.href"
            @click="emit('close')"
            :class="[
              item.current
                ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors'
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
            />
            {{ item.name }}
          </RouterLink>
        </div>

        <!-- Botão de Logout -->
        <div class="mt-8 pt-4 border-t border-gray-200">
          <button
            @click="$emit('logout')"
            class="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <ArrowRightOnRectangleIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
            Sair
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>




