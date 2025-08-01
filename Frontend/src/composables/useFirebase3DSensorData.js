import { ref, onUnmounted } from 'vue'
import { rtdb, auth } from '@/firebase/config'
import { ref as dbRef, onValue, off } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'

// Estado global compartilhado para dados 3D
let global3DSensorData = null
let globalIsConnected = null
let listeners = []
let instanceCount = 0
let authListener = null

export function useFirebase3DSensorData() {
  // Inicializar dados globais apenas uma vez
  if (!global3DSensorData) {
    global3DSensorData = ref({
      gyroscope: {
        x: 0,
        y: 0,
        z: 0,
        magnitude: 0
      },
      acceleration: {
        x: 0,
        y: 0,
        z: 0,
        magnitude: 0
      },
      orientation: {
        pitch: 0,
        roll: 0,
        yaw: 0
      }
    })

    globalIsConnected = ref(false)

    // Listener para mudanças de autenticação
    authListener = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('🚪 Usuário fez logout - parando listeners 3D Firebase')
        stopAllListeners()
        globalIsConnected.value = false
      }
    })
  }

  const calculateMagnitude = (x, y, z) => {
    return Math.sqrt(x * x + y * y + z * z)
  }

  const calculateOrientation = (accelX, accelY, accelZ) => {
    // Validar entradas
    const x = Number(accelX) || 0
    const y = Number(accelY) || 0
    const z = Number(accelZ) || 0

    // Calcular pitch (rotação em X) - cabrar/picar
    const pitch = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI)

    // Calcular roll (rotação em Z) - inclinar lateralmente
    const roll = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)

    return {
      pitch: isNaN(pitch) ? 0 : pitch,
      roll: isNaN(roll) ? 0 : roll
    }
  }

  const stopAllListeners = () => {
    listeners.forEach(({ ref, listener }) => {
      if (ref && listener) {
        off(ref, 'value', listener)
      }
    })
    listeners = []
    instanceCount = 0

    // Clean up auth listener
    if (authListener) {
      authListener()
      authListener = null
    }

    console.log('🛑 Todos os listeners 3D Firebase foram parados')
  }

  const startRealtimeUpdates = () => {
    // Verificar se usuário está logado
    if (!auth.currentUser) {
      console.log('⚠️ Usuário não logado - não iniciando listeners 3D')
      return
    }

    instanceCount++

    // Só criar listeners se não existirem
    if (listeners.length === 0) {
      console.log('🔄 Iniciando listeners 3D Firebase...')

      // Listener para dados dos sensores 3D no novo formato: readings/{id}/current
      const readings3DRef = dbRef(rtdb, `sensors/${auth.currentUser.uid}/readings`)
      const sensors3DListener = onValue(readings3DRef, (snapshot) => {
        if (snapshot.exists()) {
          const readings = snapshot.val()

          // Pegar a leitura mais recente (última chave ordenada)
          const readingIds = Object.keys(readings).sort()
          const latestReadingId = readingIds[readingIds.length - 1]
          const latestReading = readings[latestReadingId]

          // Verificar se existe a estrutura 'current'
          if (latestReading && latestReading.current) {
            const data = latestReading.current

            // Extrair dados do giroscópio
            const gyroX = Number(data.gyroscope_x || 0)
            const gyroY = Number(data.gyroscope_y || 0)
            const gyroZ = Number(data.gyroscope_z || 0)

            // Extrair dados da aceleração
            const accelX = Number(data.acceleration_x || 0)
            const accelY = Number(data.acceleration_y || 0)
            const accelZ = Number(data.acceleration_z || 0)

            // Calcular orientação
            const orientation = calculateOrientation(accelX, accelY, accelZ)

            // Atualizar yaw baseado no giroscópio (integração simples)
            const currentYaw = Number(global3DSensorData.value.orientation.yaw) || 0
            const gyroZValue = Number(gyroZ) || 0
            const newYaw = currentYaw + (gyroZValue * 0.1) // Integração simples

            global3DSensorData.value = {
              gyroscope: {
                x: Number(gyroX.toFixed(3)),
                y: Number(gyroY.toFixed(3)),
                z: Number(gyroZ.toFixed(3)),
                magnitude: Number(calculateMagnitude(gyroX, gyroY, gyroZ).toFixed(3))
              },
              acceleration: {
                x: Number(accelX.toFixed(3)),
                y: Number(accelY.toFixed(3)),
                z: Number(accelZ.toFixed(3)),
                magnitude: Number(calculateMagnitude(accelX, accelY, accelZ).toFixed(3))
              },
              orientation: {
                pitch: Number(orientation.pitch.toFixed(1)),
                roll: Number(orientation.roll.toFixed(1)),
                yaw: Number(newYaw.toFixed(1))
              }
            }

            globalIsConnected.value = true
            console.log('📊 Dados 3D dos sensores atualizados:', {
              gyro: { x: gyroX, y: gyroY, z: gyroZ },
              accel: { x: accelX, y: accelY, z: accelZ },
              orientation: orientation
            })
          } else {
            console.log('⚠️ Estrutura current não encontrada na leitura 3D mais recente')
            globalIsConnected.value = false
          }
        } else {
          console.log('⚠️ Nenhum dado 3D encontrado em sensors/' + auth.currentUser.uid + '/readings')
          globalIsConnected.value = false
        }
      }, (error) => {
        if (error.code === 'PERMISSION_DENIED') {
          console.log('⚠️ Aguardando dados 3D dos sensores...')
        } else {
          console.error('❌ Erro ao ler dados 3D dos sensores:', error)
        }
        globalIsConnected.value = false
      })

      listeners.push({ ref: readings3DRef, listener: sensors3DListener })
    }
  }

  const stopRealtimeUpdates = () => {
    instanceCount--

    // Remover listeners apenas quando não há mais instâncias
    if (instanceCount <= 0) {
      stopAllListeners()
      globalIsConnected.value = false
    }
  }

  // Cleanup automático quando o componente for desmontado
  onUnmounted(() => {
    stopRealtimeUpdates()
  })

  return {
    sensorData3D: global3DSensorData,
    isConnected: globalIsConnected,
    startRealtimeUpdates,
    stopRealtimeUpdates
  }
}



