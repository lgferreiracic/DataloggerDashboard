<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { auth } from '@/firebase/config.js'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const mobileMenuOpen = ref(false)
const user = ref(null)
const isLoading = ref(true)

// Monitorar estado de autenticação
onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    isLoading.value = false
  })
})

const logout = async () => {
  try {
    await signOut(auth)
    console.log('✅ Logout realizado com sucesso')
    mobileMenuOpen.value = false
    router.push('/')
  } catch (error) {
    console.error('❌ Erro no logout:', error)
  }
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[#1135ED]/90 backdrop-blur-sm shadow-lg h-28">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div class="flex justify-between items-center h-full">
        <div class="flex items-center space-x-4">
          <img
            src="@/assets/images/embarcatechLogoBranco.png"
            alt="EmbarcaTech Logo"
            class="h-12 sm:h-16 w-auto"
          />
        </div>

        <!-- Menu Desktop -->
        <div class="hidden md:flex items-center space-x-1">
          <!-- Menu para usuário NÃO logado -->
          <template v-if="!user && !isLoading">
            <RouterLink
              to="/"
              class="text-white hover:text-blue-200 h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2"
              active-class="text-white bg-white/10"
            >
              Sobre
            </RouterLink>
            <RouterLink
              to="/dashboard"
              class="text-white hover:text-blue-200 h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2"
              active-class="text-white bg-white/10"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              to="/tables"
              class="text-white hover:text-blue-200 h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2"
              active-class="text-white bg-white/10"
            >
              Tabelas
            </RouterLink>
            <RouterLink
              to="/signin"
              class="text-white hover:text-blue-200 h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2"
            >
              Entrar
            </RouterLink>
            <RouterLink
              to="/signup"
              class="bg-[#6077ED] hover:bg-[#7B11ED] text-white h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2 rounded-md"
            >
              Cadastrar
            </RouterLink>
          </template>

          <!-- Menu para usuário LOGADO -->
          <template v-if="user && !isLoading">
            <RouterLink
              to="/"
              class="text-white hover:text-blue-200 h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2"
              active-class="text-white bg-white/10"
            >
              Sobre
            </RouterLink>
            <RouterLink
              to="/app/dashboard"
              class="text-white hover:text-blue-200 h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2"
            >
              Meu Dashboard
            </RouterLink>
            <RouterLink
              to="/app/tables"
              class="text-white hover:text-blue-200 h-full flex items-center text-sm lg:text-lg font-medium transition-colors px-3 lg:px-6 py-2"
            >
              Minhas Tabelas
            </RouterLink>
            <div class="flex items-center space-x-3">
              <RouterLink
                to="/app/profile"
                class="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <div class="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-xs font-bold">
                    {{ user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U' }}
                  </span>
                </div>
                <span class="hidden lg:block">{{ user.displayName || 'Usuário' }}</span>
              </RouterLink>
              <button
                @click="logout"
                class="text-white hover:text-red-200 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/20"
              >
                Sair
              </button>
            </div>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-white hover:text-blue-200 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-[#1135ED]/95 backdrop-blur-sm border-t border-white/10">
        <div class="px-4 py-4 space-y-2">
          <!-- Mobile - Usuário NÃO logado -->
          <template v-if="!user && !isLoading">
            <RouterLink
              to="/"
              @click="mobileMenuOpen = false"
              class="block text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
              active-class="text-white bg-white/10"
            >
              Sobre
            </RouterLink>
            <RouterLink
              to="/dashboard"
              @click="mobileMenuOpen = false"
              class="block text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
              active-class="text-white bg-white/10"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              to="/tables"
              @click="mobileMenuOpen = false"
              class="block text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
              active-class="text-white bg-white/10"
            >
              Tabelas
            </RouterLink>
            <RouterLink
              to="/signin"
              @click="mobileMenuOpen = false"
              class="block text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
            >
              Entrar
            </RouterLink>
            <RouterLink
              to="/signup"
              @click="mobileMenuOpen = false"
              class="block bg-[#6077ED] hover:bg-[#7B11ED] text-white py-3 px-4 rounded-lg font-medium transition-all text-center"
            >
              Cadastrar
            </RouterLink>
          </template>

          <!-- Mobile - Usuário LOGADO -->
          <template v-if="user && !isLoading">
            <RouterLink
              to="/"
              @click="mobileMenuOpen = false"
              class="block text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
              active-class="text-white bg-white/10"
            >
              Sobre
            </RouterLink>
            <RouterLink
              to="/app/dashboard"
              @click="mobileMenuOpen = false"
              class="block text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
            >
              Meu Dashboard
            </RouterLink>
            <RouterLink
              to="/app/tables"
              @click="mobileMenuOpen = false"
              class="block text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
            >
              Minhas Tabelas
            </RouterLink>
            <RouterLink
              to="/app/profile"
              @click="mobileMenuOpen = false"
              class="flex items-center space-x-3 text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white/10 transition-all"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">
                  {{ user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U' }}
                </span>
              </div>
              <span>{{ user.displayName || 'Usuário' }}</span>
            </RouterLink>
            <button
              @click="logout"
              class="block w-full text-left text-white hover:text-red-200 py-3 px-4 rounded-lg hover:bg-red-500/20 transition-all"
            >
              Sair
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>





