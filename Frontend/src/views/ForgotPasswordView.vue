<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/config.js'

const form = ref({
  email: ''
})

const isLoading = ref(false)
const isSuccess = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'Email é obrigatório'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Email inválido'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errors.value = {}

  try {
    await sendPasswordResetEmail(auth, form.value.email)
    console.log('✅ Email de recuperação enviado para:', form.value.email)
    isSuccess.value = true
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)

    // Tratar erros específicos do Firebase
    switch (error.code) {
      case 'auth/user-not-found':
        errors.value.email = 'Usuário não encontrado'
        break
      case 'auth/invalid-email':
        errors.value.email = 'Email inválido'
        break
      case 'auth/too-many-requests':
        errors.value.general = 'Muitas tentativas. Tente novamente mais tarde.'
        break
      default:
        errors.value.general = 'Erro ao enviar email. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  isSuccess.value = false
  form.value.email = ''
  errors.value = {}
}
</script>

<template>
  <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen pt-32 pb-8 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Card Principal -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">

        <!-- Estado de Sucesso -->
        <div v-if="isSuccess" class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Email Enviado!
          </h2>
          <p class="text-gray-600 text-sm mb-6 leading-relaxed">
            Enviamos um link de recuperação para <strong>{{ form.email }}</strong>.
            Verifique sua caixa de entrada e spam.
          </p>

          <div class="space-y-3">
            <button
              @click="resetForm"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
            >
              Enviar Novamente
            </button>

            <RouterLink
              to="/signin"
              class="block w-full text-center py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Voltar ao Login
            </RouterLink>
          </div>
        </div>

        <!-- Estado do Formulário -->
        <div v-else>
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Esqueceu a senha?
            </h2>
            <p class="text-gray-600 mt-2 text-sm leading-relaxed">
              Não se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <!-- Formulário -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Campo Email -->
            <div class="space-y-1">
              <label for="email" class="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="seu@email.com"
                  :class="[
                    'w-full pl-9 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm',
                    errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                  ]"
                />
              </div>
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
            </div>

            <!-- Botão de Submit -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
            >
              <span v-if="!isLoading" class="flex items-center justify-center">
                Enviar Link de Recuperação
                <svg class="w-4 h-4 ml-2 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            </button>
          </form>

          <!-- Link para voltar -->
          <div class="mt-6 text-center">
            <RouterLink
              to="/signin"
              class="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Voltar ao login
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Dicas de Segurança -->
      <div class="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 mt-4 border border-blue-100">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-semibold text-blue-800 mb-1">Dicas de Segurança</h3>
            <ul class="text-xs text-blue-700 space-y-1">
              <li>• Verifique sua caixa de spam se não receber o email</li>
              <li>• O link expira em 24 horas por segurança</li>
              <li>• Nunca compartilhe o link de recuperação</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-4">
        <p class="text-xs text-gray-500">
          Precisa de ajuda?
          <a href="#" class="text-blue-600 hover:text-blue-800 transition-colors font-medium">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  </div>
</template>


