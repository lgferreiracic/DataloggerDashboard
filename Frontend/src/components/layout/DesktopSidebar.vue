<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { auth } from '@/firebase/config.js'
import { onAuthStateChanged } from 'firebase/auth'
import {
  ChartBarIcon,
  TableCellsIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon
} from '@heroicons/vue/24/outline'

const { sidebarCollapsed } = defineProps({
  sidebarCollapsed: Boolean
})

const emit = defineEmits(['toggle-collapse', 'logout'])

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

// Email do usuário
const userEmail = computed(() => {
  return user.value?.email || 'email@exemplo.com'
})
</script>

<template>
  <div :class="[
    'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300',
    sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
  ]">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
      <!-- Logo -->
      <div class="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 relative">
        <div v-if="!sidebarCollapsed" class="flex items-center space-x-3">
          <img
            src="@/assets/images/embarcatechLogo.png"
            alt="EmbarcaTech Logo"
            class="h-10 w-auto"
          />
        </div>

        <button
          @click="emit('toggle-collapse')"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 shadow-sm"
          :title="sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <ChevronLeftIcon v-if="!sidebarCollapsed" class="w-4 h-4" />
          <ChevronRightIcon v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col px-3">
        <div class="space-y-1">
          <RouterLink
            v-for="item in currentNavigation"
            :key="item.name"
            :to="item.href"
            :class="[
              item.current
                ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-all duration-200'
            ]"
            :title="sidebarCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              :class="[
                item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                sidebarCollapsed ? 'mx-auto' : 'mr-3',
                'h-5 w-5 transition-colors'
              ]"
            />
            <span v-if="!sidebarCollapsed">{{ item.name }}</span>
          </RouterLink>
        </div>

        <!-- User Section -->
        <div class="mt-auto pb-4">
          <div class="border-t border-gray-200 pt-4">
            <div v-if="!sidebarCollapsed" class="flex items-center px-3 py-2 text-sm">
              <div class="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mr-3">
                <span class="text-white text-xs font-bold">{{ userInitials }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
              </div>
            </div>
            <div v-else class="flex justify-center px-3 py-2">
              <div class="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">{{ userInitials }}</span>
              </div>
            </div>

            <div class="mt-2 space-y-1">
              <button
                @click="emit('logout')"
                :class="[
                  'group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors',
                  sidebarCollapsed ? 'justify-center' : ''
                ]"
                :title="sidebarCollapsed ? 'Sair' : ''"
              >
                <ArrowRightOnRectangleIcon :class="[
                  'h-5 w-5 text-gray-400 group-hover:text-red-500',
                  sidebarCollapsed ? '' : 'mr-3'
                ]" />
                <span v-if="!sidebarCollapsed">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>


