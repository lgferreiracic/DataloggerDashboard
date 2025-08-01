<script setup>
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase/config.js'
import Sidebar from '@/components/layout/DesktopSidebar.vue'
import MobileSidebar from '@/components/layout/MobileSidebar.vue'
import TopBar from '@/components/layout/TopBar.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const logout = async () => {
  try {
    await signOut(auth)
    console.log('✅ Logout realizado com sucesso')
    router.push('/signin')
  } catch (error) {
    console.error('❌ Erro no logout:', error)
  }
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const openMobileSidebar = () => {
  sidebarOpen.value = true
}

const toggleSidebarCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Sidebar -->
    <MobileSidebar
      :sidebar-open="sidebarOpen"
      @close="closeSidebar"
      @logout="logout"
    />

    <!-- Desktop Sidebar -->
    <Sidebar
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-collapse="toggleSidebarCollapse"
      @logout="logout"
    />

    <!-- Top Bar with Main Content -->
    <TopBar
      :sidebar-collapsed="sidebarCollapsed"
      @open-mobile-sidebar="openMobileSidebar"
    >
      <!-- Page Content -->
      <main class="py-6">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RouterView />
        </div>
      </main>
    </TopBar>
  </div>
</template>














