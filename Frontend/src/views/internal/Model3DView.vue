<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { CubeIcon } from '@heroicons/vue/24/outline'
import { useFirebase3DSensorData } from '@/composables/useFirebase3DSensorData.js'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import airplaneURL from '@/assets/models/airplane.glb?url'

// Usar o composable para dados 3D
const { sensorData3D, isConnected, startRealtimeUpdates, stopRealtimeUpdates } = useFirebase3DSensorData()

// Computed para facilitar acesso aos dados com validação
const gyroscope = computed(() => {
  const gyro = sensorData3D.value?.gyroscope || {}
  return {
    x: Number(gyro.x || 0).toFixed(3),
    y: Number(gyro.y || 0).toFixed(3),
    z: Number(gyro.z || 0).toFixed(3),
    magnitude: Number(gyro.magnitude || 0).toFixed(3)
  }
})

const acceleration = computed(() => {
  const accel = sensorData3D.value?.acceleration || {}
  return {
    x: Number(accel.x || 0).toFixed(3),
    y: Number(accel.y || 0).toFixed(3),
    z: Number(accel.z || 0).toFixed(3),
    magnitude: Number(accel.magnitude || 0).toFixed(3)
  }
})

const orientation = computed(() => {
  const orient = sensorData3D.value?.orientation || {}
  return {
    pitch: Number(orient.pitch || 0).toFixed(1),
    roll: Number(orient.roll || 0).toFixed(1),
    yaw: Number(orient.yaw || 0).toFixed(1)
  }
})

// Referências Three.js
const canvasRef = ref()
const sceneReady = ref(false)

// Variáveis Three.js (não reativas)
let scene, camera, renderer, controls, airplaneModel
let animationId

// Variáveis para controlar atualizações
let lastPitch = 0
let lastRoll = 0
const ROTATION_THRESHOLD = 0.1 // Só atualizar se mudança for maior que 0.1 grau

// Inicializar Three.js
const initThreeJS = () => {
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8fafc)

  // Camera com posição mais afastada
  camera = new THREE.PerspectiveCamera(75, canvasRef.value.clientWidth / canvasRef.value.clientHeight, 0.1, 1000)
  camera.position.set(70, 60, 70)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasRef.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  console.log('🎯 Three.js inicializado')
}

// Carregar modelo GLTF - CORRIGIDO para deploy
const loadModel = async () => {
  try {
    console.log('🔍 Tentando carregar modelo GLB...')
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(airplaneURL) // Caminho correto para deploy
    airplaneModel = gltf.scene
    airplaneModel.scale.set(2, 2, 2)
    scene.add(airplaneModel)
    sceneReady.value = true
    console.log('✈️ Modelo GLB carregado com sucesso')
  } catch (error) {
    console.error('❌ Erro ao carregar modelo GLB:', error)
    sceneReady.value = true
  }
}

// Converter graus para radianos
const toRadians = (degrees) => degrees * (Math.PI / 180)

// Atualizar rotação do modelo baseado na orientação
const updateAirplaneRotation = () => {
  if (airplaneModel && orientation.value) {
    try {
      const pitch = Number(orientation.value.pitch) || 0
      const roll = Number(orientation.value.roll) || 0

      // Só atualizar se houve mudança significativa
      if (Math.abs(pitch - lastPitch) > ROTATION_THRESHOLD ||
          Math.abs(roll - lastRoll) > ROTATION_THRESHOLD) {

        airplaneModel.rotation.x = toRadians(pitch)
        airplaneModel.rotation.z = toRadians(roll)

        lastPitch = pitch
        lastRoll = roll

        console.log('🔄 Rotação atualizada:', { pitch, roll })
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar rotação:', error)
    }
  }
}

// Watch para atualizar rotação - COM THROTTLE
let updateTimeout = null
watch(orientation, (newOrientation) => {
  if (newOrientation && airplaneModel) {
    // Cancelar timeout anterior
    if (updateTimeout) {
      clearTimeout(updateTimeout)
    }

    // Agendar atualização com delay
    updateTimeout = setTimeout(() => {
      updateAirplaneRotation()
    }, 100) // Atualizar no máximo a cada 100ms
  }
}, { deep: true, immediate: false })

// Loop de animação SEM atualização de rotação
const animate = () => {
  if (!renderer || !scene || !camera) return

  animationId = requestAnimationFrame(animate)

  if (controls) {
    controls.update()
  }

  // REMOVER esta linha para evitar loop infinito
  // updateAirplaneRotation()

  renderer.render(scene, camera)
}

// Redimensionar canvas
const handleResize = () => {
  if (camera && renderer && canvasRef.value) {
    camera.aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  }
}

onMounted(async () => {
  console.log('🎯 Tela 3D montada')
  startRealtimeUpdates()

  await nextTick()
  initThreeJS()
  await loadModel()
  animate()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  console.log('🎯 Tela 3D desmontada')
  stopRealtimeUpdates()

  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  if (controls) {
    controls.dispose()
    controls = null
  }

  scene = null
  camera = null
  airplaneModel = null

  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="min-h-screen p-4 lg:p-6 space-y-4 lg:space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <CubeIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Modelo 3D</h1>
            <p class="text-sm text-gray-600 hidden sm:block">Visualização em tempo real da orientação dos sensores</p>
          </div>
        </div>

        <!-- Status -->
        <div :class="[
          'flex items-center space-x-2 px-3 py-2 rounded-lg border',
          isConnected
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        ]">
          <div :class="[
            'w-3 h-3 rounded-full shadow-lg',
            isConnected
              ? 'bg-green-500 animate-pulse shadow-green-500/50'
              : 'bg-red-500 shadow-red-500/50'
          ]"></div>
          <span :class="[
            'text-sm font-medium',
            isConnected ? 'text-green-700' : 'text-red-700'
          ]">
            <span class="hidden sm:inline">{{ isConnected ? 'Sensores Online' : 'Sensores Offline' }}</span>
            <span class="sm:hidden">{{ isConnected ? 'Online' : 'Offline' }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Área do Modelo 3D - Primeiro no mobile -->
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200 order-1 lg:order-2">
      <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <span class="text-indigo-500 mr-2">✈️</span>
        Modelo 3D - Avião
      </h3>
      <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg relative overflow-hidden h-64 sm:h-80 lg:h-96">
        <!-- Canvas Three.js -->
        <div
          ref="canvasRef"
          class="w-full h-full"
        ></div>

        <!-- Loading indicator -->
        <div
          v-if="!sceneReady"
          class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75"
        >
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p class="text-sm text-gray-600">Carregando modelo 3D...</p>
          </div>
        </div>

        <!-- Orientação overlay -->
        <div class="absolute top-2 right-2 lg:top-4 lg:right-4 bg-white bg-opacity-90 rounded-lg p-2 lg:p-3 text-xs">
          <div class="space-y-1">
            <div>Pitch: <span class="font-mono">{{ orientation.pitch }}°</span></div>
            <div>Roll: <span class="font-mono">{{ orientation.roll }}°</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dados dos Sensores - Depois do modelo no mobile -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 order-2 lg:order-1">
      <!-- Orientação -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <span class="text-blue-500 mr-2">📐</span>
          Orientação
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="text-center">
            <div class="text-xl font-bold text-blue-600">{{ orientation.pitch }}°</div>
            <div class="text-xs text-gray-500">Pitch</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-green-600">{{ orientation.roll }}°</div>
            <div class="text-xs text-gray-500">Roll</div>
          </div>
        </div>
      </div>

      <!-- Aceleração -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <span class="text-pink-500 mr-2">🚀</span>
          Aceleração (m/s²)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div class="text-center">
            <div class="text-lg font-bold text-pink-600">{{ acceleration.x }}</div>
            <div class="text-xs text-gray-500">X</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-pink-600">{{ acceleration.y }}</div>
            <div class="text-xs text-gray-500">Y</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-pink-600">{{ acceleration.z }}</div>
            <div class="text-xs text-gray-500">Z</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-pink-800">{{ acceleration.magnitude }}</div>
            <div class="text-xs text-gray-500">Mag</div>
          </div>
        </div>
      </div>

      <!-- Giroscópio -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200 sm:col-span-2 lg:col-span-1">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <span class="text-purple-500 mr-2">🔄</span>
          Giroscópio (rad/s)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div class="text-center">
            <div class="text-lg font-bold text-purple-600">{{ gyroscope.x }}</div>
            <div class="text-xs text-gray-500">X</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-purple-600">{{ gyroscope.y }}</div>
            <div class="text-xs text-gray-500">Y</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-purple-600">{{ gyroscope.z }}</div>
            <div class="text-xs text-gray-500">Z</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-purple-800">{{ gyroscope.magnitude }}</div>
            <div class="text-xs text-gray-500">Mag</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>










