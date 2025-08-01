<script setup>
import { RouterLink } from 'vue-router'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

useScrollAnimation()
</script>

<template>
  <section class="min-h-screen flex items-center px-4 bg-gradient-to-br from-[#1135ED] via-[#117BED] to-[#11C1ED] py-16">
    <div class="w-full max-w-4xl mx-auto text-center">
      <div class="animate-on-scroll-typewriter">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 animate-on-scroll-typewriter" style="animation-delay: 0.2s;">
          Pronto para Começar?
        </h2>
        <p class="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-on-scroll-wave" style="animation-delay: 0.4s;">
          Junte-se a milhares de usuários que já confiam na nossa plataforma para monitoramento de dados em tempo real.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6" style="animation-delay: 0.6s;">
        <RouterLink
          to="/dashboard"
          class="group bg-white text-[#117BED] px-8 py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-[#11C1ED] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto animate-on-scroll-pulse"
          style="animation-delay: 0.8s;"
        >
          <span class="flex items-center justify-center">
            Acessar Dashboard
            <svg class="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </span>
        </RouterLink>

        <RouterLink
          to="/tables"
          class="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-white hover:text-[#117BED] transition-all duration-300 transform hover:scale-105 w-full sm:w-auto animate-on-scroll-glow"
          style="animation-delay: 1s;"
        >
          Ver Tabelas
        </RouterLink>
      </div>

      <!-- Elementos decorativos -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Animação de typewriter */
.animate-on-scroll-typewriter {
  opacity: 0;
  transform: translateX(-20px);
  transition: all 1.2s ease-out;
}

.animate-on-scroll-typewriter.animate-in-view {
  opacity: 1;
  transform: translateX(0);
}

/* Animação de wave */
.animate-on-scroll-wave {
  opacity: 0;
  transform: translateY(20px) rotateX(45deg);
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-on-scroll-wave.animate-in-view {
  opacity: 1;
  transform: translateY(0) rotateX(0);
}

/* Animação de pulse */
.animate-on-scroll-pulse {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-on-scroll-pulse.animate-in-view {
  opacity: 1;
  transform: scale(1);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.6);
  }
}

/* Animação de glow */
.animate-on-scroll-glow {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.8s ease-out;
}

.animate-on-scroll-glow.animate-in-view {
  opacity: 1;
  transform: translateY(0) scale(1);
  animation: border-glow 3s infinite;
}

@keyframes border-glow {
  0%, 100% {
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
  50% {
    border-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
  }
}
</style>



