import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Importar configuração do Firebase para inicializar os serviços
import './firebase/config.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')




