<script setup>
import { ref, onMounted } from 'vue'
import { UserIcon, PencilIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { auth, db } from '@/firebase/config.js'
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref({
  name: '',
  email: ''
})

const isEditing = ref(false)
const showChangePassword = ref(false)
const isLoading = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({})

// Carregar dados do usuário do Firebase
const loadUserData = async () => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      router.push('/signin')
      return
    }

    // Dados básicos do Firebase Auth
    user.value.name = currentUser.displayName || ''
    user.value.email = currentUser.email || ''

    console.log('✅ Dados do usuário carregados')
  } catch (error) {
    console.error('❌ Erro ao carregar dados do usuário:', error)
    errors.value.general = 'Erro ao carregar dados do perfil'
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    errors.value = {}
    loadUserData() // Recarregar dados se cancelar edição
  }
}

const validateProfile = () => {
  errors.value = {}

  if (!user.value.name.trim()) {
    errors.value.name = 'Nome é obrigatório'
  }

  return Object.keys(errors.value).length === 0
}

const saveProfile = async () => {
  if (!validateProfile()) return

  isLoading.value = true
  errors.value = {}

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    // Atualizar nome no Firebase Auth
    await updateProfile(currentUser, {
      displayName: user.value.name
    })

    // Salvar dados básicos no Firestore
    await setDoc(doc(db, 'users', currentUser.uid), {
      name: user.value.name,
      email: user.value.email,
      updatedAt: new Date().toISOString()
    }, { merge: true })

    console.log('✅ Perfil atualizado com sucesso')
    isEditing.value = false
  } catch (error) {
    console.error('❌ Erro ao salvar perfil:', error)
    errors.value.general = 'Erro ao salvar perfil. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}

const validatePassword = () => {
  errors.value = {}

  if (!passwordForm.value.currentPassword) {
    errors.value.currentPassword = 'Senha atual é obrigatória'
  }

  if (!passwordForm.value.newPassword) {
    errors.value.newPassword = 'Nova senha é obrigatória'
  } else if (passwordForm.value.newPassword.length < 6) {
    errors.value.newPassword = 'Nova senha deve ter pelo menos 6 caracteres'
  }

  if (!passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Confirmação de senha é obrigatória'
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Senhas não coincidem'
  }

  return Object.keys(errors.value).length === 0
}

const changePassword = async () => {
  if (!validatePassword()) return

  isLoading.value = true
  errors.value = {}

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    // Reautenticar usuário antes de alterar senha
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      passwordForm.value.currentPassword
    )
    await reauthenticateWithCredential(currentUser, credential)

    // Alterar senha
    await updatePassword(currentUser, passwordForm.value.newPassword)

    console.log('✅ Senha alterada com sucesso')
    showChangePassword.value = false
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error)

    switch (error.code) {
      case 'auth/wrong-password':
        errors.value.currentPassword = 'Senha atual incorreta'
        break
      case 'auth/weak-password':
        errors.value.newPassword = 'Nova senha muito fraca'
        break
      case 'auth/requires-recent-login':
        errors.value.general = 'Por segurança, faça login novamente antes de alterar a senha'
        break
      default:
        errors.value.general = 'Erro ao alterar senha. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Carregar dados quando o componente for montado
onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
            <p class="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
          </div>
        </div>
        <button
          @click="toggleEdit"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PencilIcon class="w-5 h-5" />
          <span>{{ isEditing ? 'Cancelar' : 'Editar' }}</span>
        </button>
      </div>
    </div>

    <!-- Mensagem de erro geral -->
    <div v-if="errors.general" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600 text-sm">{{ errors.general }}</p>
    </div>

    <!-- Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulário Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informações Pessoais -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h2>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <!-- Nome -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
              <div class="relative">
                <UserIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="user.name"
                  :disabled="!isEditing"
                  type="text"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  :class="{ 'border-red-300': errors.name }"
                />
              </div>
              <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div class="relative">
                <EnvelopeIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="user.email"
                  disabled
                  type="email"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  title="Email não pode ser alterado"
                />
              </div>
              <p class="text-gray-500 text-xs mt-1">Email não pode ser alterado</p>
            </div>

            <!-- Botões de Ação -->
            <div v-if="isEditing" class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="toggleEdit"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ isLoading ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Alterar Senha -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Segurança</h2>
            <button
              @click="showChangePassword = !showChangePassword"
              class="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {{ showChangePassword ? 'Cancelar' : 'Alterar Senha' }}
            </button>
          </div>

          <div v-if="showChangePassword">
            <form @submit.prevent="changePassword" class="space-y-4">
              <!-- Senha Atual -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                <div class="relative">
                  <LockClosedIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-300': errors.currentPassword }"
                  />
                </div>
                <p v-if="errors.currentPassword" class="text-red-500 text-sm mt-1">{{ errors.currentPassword }}</p>
              </div>

              <!-- Nova Senha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <div class="relative">
                  <LockClosedIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-300': errors.newPassword }"
                  />
                </div>
                <p v-if="errors.newPassword" class="text-red-500 text-sm mt-1">{{ errors.newPassword }}</p>
              </div>

              <!-- Confirmar Nova Senha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                <div class="relative">
                  <LockClosedIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-300': errors.confirmPassword }"
                  />
                </div>
                <p v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">{{ errors.confirmPassword }}</p>
              </div>

              <!-- Botão Alterar Senha -->
              <div class="flex justify-end pt-4">
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {{ isLoading ? 'Alterando...' : 'Alterar Senha' }}
                </button>
              </div>
            </form>
          </div>
          <div v-else>
            <p class="text-gray-600">Mantenha sua conta segura alterando sua senha regularmente.</p>
          </div>
        </div>
      </div>

      <!-- Sidebar do Perfil -->
      <div class="space-y-6">
        <!-- Avatar -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-2xl font-bold">
              {{ user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U' }}
            </span>
          </div>
          <h3 class="font-semibold text-gray-900">{{ user.name || 'Usuário' }}</h3>
          <p class="text-sm text-gray-600">{{ user.email }}</p>
        </div>

        <!-- Estatísticas -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-4">Informações da Conta</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Último acesso</span>
              <span class="text-sm font-medium">Hoje</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Conta criada</span>
              <span class="text-sm font-medium">
                {{ auth.currentUser?.metadata?.creationTime ?
                   new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('pt-BR') :
                   'N/A' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

