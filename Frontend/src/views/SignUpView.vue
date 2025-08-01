<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { UserPlusIcon, UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/firebase/config.js'

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}

  if (!form.value.name) {
    errors.value.name = 'Nome é obrigatório'
  } else if (form.value.name.length < 2) {
    errors.value.name = 'Nome deve ter pelo menos 2 caracteres'
  }

  if (!form.value.email) {
    errors.value.email = 'Email é obrigatório'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Email inválido'
  }

  if (!form.value.password) {
    errors.value.password = 'Senha é obrigatória'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Senha deve ter pelo menos 6 caracteres'
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Confirmação de senha é obrigatória'
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Senhas não coincidem'
  }

  if (!form.value.acceptTerms) {
    errors.value.acceptTerms = 'Você deve aceitar os termos de uso'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errors.value = {}

  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      form.value.email,
      form.value.password
    )

    // Atualizar perfil com o nome
    await updateProfile(userCredential.user, {
      displayName: form.value.name
    })

    console.log('✅ Cadastro realizado com sucesso')
    router.push('/app/dashboard')
  } catch (error) {
    console.error('❌ Erro no cadastro:', error)

    // Tratar erros específicos do Firebase
    switch (error.code) {
      case 'auth/email-already-in-use':
        errors.value.email = 'Este email já está em uso'
        break
      case 'auth/invalid-email':
        errors.value.email = 'Email inválido'
        break
      case 'auth/weak-password':
        errors.value.password = 'Senha muito fraca'
        break
      default:
        errors.value.general = 'Erro ao criar conta. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Adicionar provider do Google
const googleProvider = new GoogleAuthProvider()

// Função para cadastro com Google
const handleGoogleSignUp = async () => {
  isLoading.value = true
  errors.value = {}

  try {
    await signInWithPopup(auth, googleProvider)
    console.log('✅ Cadastro com Google realizado com sucesso')
    router.push('/app/dashboard')
  } catch (error) {
    console.error('❌ Erro no cadastro com Google:', error)

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errors.value.general = 'Cadastro cancelado pelo usuário'
        break
      case 'auth/popup-blocked':
        errors.value.general = 'Popup bloqueado pelo navegador'
        break
      case 'auth/account-exists-with-different-credential':
        errors.value.general = 'Já existe uma conta com este email'
        break
      default:
        errors.value.general = 'Erro ao cadastrar com Google. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen pt-32 pb-8 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Card Principal -->
      <div class="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/30">
        <!-- Header Melhorado -->
        <div class="text-center mb-6">
          <div class="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
            <UserPlusIcon class="w-8 h-8 text-white" />
            <div class="absolute -inset-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur opacity-30"></div>
          </div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Criar Conta
          </h2>
          <p class="text-gray-600 text-sm leading-relaxed">
            Cadastre-se para acessar a plataforma
          </p>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Campo Nome -->
          <div class="space-y-1">
            <label for="name" class="block text-xs font-semibold text-gray-700">
              Nome Completo
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon class="w-4 h-4 text-gray-400" />
              </div>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Seu nome completo"
                :class="[
                  'w-full pl-9 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm',
                  errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400'
                ]"
              />
            </div>
            <p v-if="errors.name" class="text-red-500 text-xs">{{ errors.name }}</p>
          </div>

          <!-- Campo Email -->
          <div class="space-y-1">
            <label for="email" class="block text-xs font-semibold text-gray-700">
              Email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon class="w-4 h-4 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="seu@email.com"
                :class="[
                  'w-full pl-9 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm',
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400'
                ]"
              />
            </div>
            <p v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</p>
          </div>

          <!-- Campo Senha -->
          <div class="space-y-1">
            <label for="password" class="block text-xs font-semibold text-gray-700">
              Senha
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="w-4 h-4 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                style="background-image: none !important;"
                :class="[
                  'w-full pl-9 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm password-input',
                  errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400'
                ]"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <EyeSlashIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</p>
          </div>

          <!-- Campo Confirmar Senha -->
          <div class="space-y-1">
            <label for="confirmPassword" class="block text-xs font-semibold text-gray-700">
              Confirmar Senha
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                style="background-image: none !important;"
                :class="[
                  'w-full pl-9 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm password-input',
                  errors.confirmPassword
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400'
                ]"
              />
              <button
                type="button"
                @click="toggleConfirmPasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <EyeSlashIcon v-if="showConfirmPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-red-500 text-xs">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Checkbox Termos -->
          <div class="space-y-1">
            <label class="flex items-start">
              <input
                v-model="form.acceptTerms"
                type="checkbox"
                :class="[
                  'w-4 h-4 mt-0.5 rounded border-2 focus:ring-2 focus:ring-purple-500 transition-colors',
                  errors.acceptTerms
                    ? 'border-red-300 text-red-600'
                    : 'border-gray-300 text-purple-600'
                ]"
              >
              <span class="ml-2 text-xs text-gray-600 leading-relaxed">
                Eu aceito os
                <a href="#" class="text-purple-600 hover:text-purple-800 font-medium transition-colors">Termos de Uso</a>
                e a
                <a href="#" class="text-purple-600 hover:text-purple-800 font-medium transition-colors">Política de Privacidade</a>
              </span>
            </label>
            <p v-if="errors.acceptTerms" class="text-red-500 text-xs">{{ errors.acceptTerms }}</p>
          </div>

          <!-- Botão de Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
          >
            <span v-if="!isLoading" class="flex items-center justify-center">
              Criar Conta
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Criando conta...
            </span>
          </button>
        </form>

        <!-- Divisor -->
        <div class="mt-3">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>
        </div>

        <!-- Login Social -->
        <div class="mt-3">
          <button
            @click="handleGoogleSignUp"
            :disabled="isLoading"
            class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ isLoading ? 'Cadastrando...' : 'Cadastrar com Google' }}
          </button>
        </div>

        <!-- Link para Login -->
        <div class="mt-3 text-center">
          <p class="text-gray-600 text-xs">
            Já tem uma conta?
            <RouterLink to="/signin" class="text-purple-600 hover:text-purple-800 font-semibold transition-colors">
              Entre aqui
            </RouterLink>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-3">
        <p class="text-xs text-gray-500">
          Ao se cadastrar, você concorda com nossos
          <a href="#" class="text-purple-600 hover:text-purple-800 transition-colors">Termos de Uso</a>
          e
          <a href="#" class="text-purple-600 hover:text-purple-800 transition-colors">Política de Privacidade</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remover botão nativo de mostrar senha do navegador */
.password-input::-ms-reveal,
.password-input::-ms-clear {
  display: none;
}

.password-input::-webkit-credentials-auto-fill-button,
.password-input::-webkit-strong-password-auto-fill-button {
  display: none !important;
}

/* Para Edge e outros navegadores Chromium */
input[type="password"]::-webkit-credentials-auto-fill-button {
  visibility: hidden;
  pointer-events: none;
  position: absolute;
  right: 0;
}
</style>





