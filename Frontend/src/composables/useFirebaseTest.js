import { ref } from 'vue'
import { auth, db, rtdb } from '@/firebase/config'
import { signInAnonymously } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { ref as dbRef, set, get } from 'firebase/database'

export function useFirebaseTest() {
  const testResults = ref({
    auth: null,
    firestore: null,
    realtimeDb: null
  })

  const testAuth = async () => {
    try {
      const result = await signInAnonymously(auth)
      testResults.value.auth = `✅ Auth OK - UID: ${result.user.uid}`
      return true
    } catch (error) {
      testResults.value.auth = `❌ Auth Error: ${error.message}`
      return false
    }
  }

  const testFirestore = async () => {
    try {
      const testDoc = doc(db, 'test', 'connection')
      await setDoc(testDoc, { timestamp: new Date(), test: true })
      const docSnap = await getDoc(testDoc)
      
      if (docSnap.exists()) {
        testResults.value.firestore = '✅ Firestore OK - Read/Write successful'
        return true
      } else {
        testResults.value.firestore = '❌ Firestore Error: Document not found'
        return false
      }
    } catch (error) {
      testResults.value.firestore = `❌ Firestore Error: ${error.message}`
      return false
    }
  }

  const testRealtimeDb = async () => {
    try {
      const testRef = dbRef(rtdb, 'test/connection')
      await set(testRef, { timestamp: new Date().toISOString(), test: true })
      const snapshot = await get(testRef)
      
      if (snapshot.exists()) {
        testResults.value.realtimeDb = '✅ Realtime DB OK - Read/Write successful'
        return true
      } else {
        testResults.value.realtimeDb = '❌ Realtime DB Error: Data not found'
        return false
      }
    } catch (error) {
      testResults.value.realtimeDb = `❌ Realtime DB Error: ${error.message}`
      return false
    }
  }

  const runAllTests = async () => {
    console.log('🧪 Testando conexões Firebase...')
    
    await testAuth()
    await testFirestore()
    await testRealtimeDb()
    
    console.log('📊 Resultados dos testes:', testResults.value)
  }

  return {
    testResults,
    testAuth,
    testFirestore,
    testRealtimeDb,
    runAllTests
  }
}