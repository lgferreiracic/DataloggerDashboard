import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBkGV1T0XlY6lAg6QRen6NiVJznn6W-Qa0",
  authDomain: "embarcatech-datalogger.firebaseapp.com",
  databaseURL: "https://embarcatech-datalogger-default-rtdb.firebaseio.com/",
  projectId: "embarcatech-datalogger",
  storageBucket: "embarcatech-datalogger.firebasestorage.app",
  messagingSenderId: "318916809812",
  appId: "1:318916809812:web:5b52cfb476392cfc4309c1",
  measurementId: "G-5DQD9WX80P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

export const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const rtdb = getDatabase(app)

export default app


