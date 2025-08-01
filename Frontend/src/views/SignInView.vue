<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/firebase/config.js'

const router = useRouter()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)
const showPassword = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}

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

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errors.value = {}

  try {
    await signInWithEmailAndPassword(auth, form.value.email, form.value.password)

    // Salvar email se "lembrar-me" estiver marcado
    if (form.value.rememberMe) {
      localStorage.setItem('rememberedEmail', form.value.email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    console.log('✅ Login realizado com sucesso')
    router.push('/app/dashboard')
  } catch (error) {
    console.error('❌ Erro no login:', error)

    // Tratar erros específicos do Firebase
    switch (error.code) {
      case 'auth/user-not-found':
        errors.value.email = 'Usuário não encontrado'
        break
      case 'auth/wrong-password':
        errors.value.password = 'Senha incorreta'
        break
      case 'auth/invalid-email':
        errors.value.email = 'Email inválido'
        break
      case 'auth/user-disabled':
        errors.value.email = 'Conta desabilitada'
        break
      default:
        errors.value.general = 'Erro ao fazer login. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Adicionar provider do Google
const googleProvider = new GoogleAuthProvider()

// Função para login com Google
const handleGoogleSignIn = async () => {
  isLoading.value = true
  errors.value = {}

  try {
    await signInWithPopup(auth, googleProvider)
    console.log('✅ Login com Google realizado com sucesso')
    router.push('/app/dashboard')
  } catch (error) {
    console.error('❌ Erro no login com Google:', error)

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errors.value.general = 'Login cancelado pelo usuário'
        break
      case 'auth/popup-blocked':
        errors.value.general = 'Popup bloqueado pelo navegador'
        break
      default:
        errors.value.general = 'Erro ao fazer login com Google. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Carregar email salvo quando o componente for montado
onMounted(() => {
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  if (rememberedEmail) {
    form.value.email = rememberedEmail
    form.value.rememberMe = true
  }
})
</script>

<template>
  <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen pt-32 pb-8 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Card Principal -->
      <div class="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30">
        <!-- Header Melhorado -->
        <div class="text-center mb-8">
          <div class="relative w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <UserIcon class="w-10 h-10 text-white" />
            <div class="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur opacity-30"></div>
          </div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Bem-vindo de volta!
          </h2>
          <p class="text-gray-600 text-base leading-relaxed">
            Entre na sua conta para acessar o dashboard
          </p>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Campo Email -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="seu@email.com"
                :class="[
                  'w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200',
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                ]"
              />
            </div>
            <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
          </div>

          <!-- Campo Senha -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-gray-700">
              Senha
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                style="background-image: none !important;"
                :class="[
                  'w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 password-input',
                  errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                ]"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <EyeSlashIcon v-if="showPassword" class="w-5 h-5" />
                <EyeIcon v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>
          </div>

          <!-- Lembrar-me e Esqueci a senha -->
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              >
              <span class="ml-2 text-gray-600">Lembrar-me</span>
            </label>
            <RouterLink to="/forgot-password" class="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Esqueci minha senha
            </RouterLink>
          </div>

          <!-- Botão de Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <span v-if="!isLoading" class="flex items-center justify-center">
              Entrar
              <ArrowRightIcon class="w-5 h-5 ml-2" />
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </span>
          </button>
        </form>

        <!-- Divisor -->
        <div class="mt-4">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>
        </div>

        <!-- Login Social -->
        <div class="mt-4">
          <button
            @click="handleGoogleSignIn"
            :disabled="isLoading"
            class="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ isLoading ? 'Entrando...' : 'Continuar com Google' }}
          </button>
        </div>

        <!-- Link para Cadastro -->
        <div class="mt-4 text-center">
          <p class="text-gray-600 text-sm">
            Não tem uma conta?
            <RouterLink to="/signup" class="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Cadastre-se aqui
            </RouterLink>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-4">
        <p class="text-xs text-gray-500">
          Ao entrar, você concorda com nossos
          <a href="#" class="text-blue-600 hover:text-blue-800 transition-colors">Termos de Uso</a>
          e
          <a href="#" class="text-blue-600 hover:text-blue-800 transition-colors">Política de Privacidade</a>
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



