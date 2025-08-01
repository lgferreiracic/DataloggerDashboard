<script setup>
import { useScrollAnimation } from '@/composables/useScrollAnimation'

useScrollAnimation()
</script>

<template>
  <section class="min-h-screen flex items-center px-4 bg-gradient-to-br from-[#7B11ED] via-[#6B46C1] to-[#8B5CF6] py-16">
    <div class="w-full max-w-7xl mx-auto">
      <div class="text-center mb-12 sm:mb-16 animate-on-scroll-bounce">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4 animate-on-scroll-bounce" style="animation-delay: 0.2s;">
          Dados Monitorados
        </h2>
        <p class="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto px-4 animate-on-scroll-bounce" style="animation-delay: 0.4s;">
          Sensores de alta precisão para coleta completa de dados ambientais e de movimento
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4">
        <div class="group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40 animate-on-scroll-flip" style="animation-delay: 0.6s;">
          <div class="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div class="relative z-10 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-500/50 transition-all duration-300">
              <span class="text-2xl">🌡️</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Temperatura</h3>
            <p class="text-sm text-blue-100">Monitoramento preciso</p>
          </div>
        </div>

        <div class="group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 animate-on-scroll-rotate" style="animation-delay: 0.8s;">
          <div class="absolute inset-0 bg-gradient-to-t from-blue-600/40 via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div class="relative z-10 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/50 transition-all duration-300">
              <span class="text-2xl">💧</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Umidade</h3>
            <p class="text-sm text-blue-100">Controle ambiental</p>
          </div>
        </div>

        <div class="group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40 animate-on-scroll-slide-up" style="animation-delay: 1s;">
          <div class="absolute inset-0 bg-gradient-to-t from-green-600/40 via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div class="relative z-10 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/50 transition-all duration-300">
              <span class="text-2xl">⛰️</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Altitude</h3>
            <p class="text-sm text-blue-100">Medição barométrica</p>
          </div>
        </div>

        <div class="group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/40 animate-on-scroll-zoom" style="animation-delay: 1.2s;">
          <div class="absolute inset-0 bg-gradient-to-t from-pink-600/40 via-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div class="relative z-10 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-pink-500/50 transition-all duration-300">
              <span class="text-2xl">🚀</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Aceleração</h3>
            <p class="text-sm text-blue-100">Detecção de movimento</p>
          </div>
        </div>

        <div class="group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 animate-on-scroll-swing" style="animation-delay: 1.4s;">
          <div class="absolute inset-0 bg-gradient-to-t from-indigo-600/40 via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div class="relative z-10 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/50 transition-all duration-300">
              <span class="text-2xl">🔄</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Giroscópio</h3>
            <p class="text-sm text-blue-100">Orientação espacial</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Animação de bounce para títulos */
.animate-on-scroll-bounce {
  opacity: 0;
  transform: translateY(-30px);
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-on-scroll-bounce.animate-in-view {
  opacity: 1;
  transform: translateY(0);
}

/* Animação de flip */
.animate-on-scroll-flip {
  opacity: 0;
  transform: rotateY(90deg);
  transition: all 0.8s ease-out;
}

.animate-on-scroll-flip.animate-in-view {
  opacity: 1;
  transform: rotateY(0);
}

/* Animação de rotação */
.animate-on-scroll-rotate {
  opacity: 0;
  transform: rotate(45deg) scale(0.8);
  transition: all 0.8s ease-out;
}

.animate-on-scroll-rotate.animate-in-view {
  opacity: 1;
  transform: rotate(0) scale(1);
}

/* Animação de slide up */
.animate-on-scroll-slide-up {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s ease-out;
}

.animate-on-scroll-slide-up.animate-in-view {
  opacity: 1;
  transform: translateY(0);
}

/* Animação de zoom */
.animate-on-scroll-zoom {
  opacity: 0;
  transform: scale(0.3);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-on-scroll-zoom.animate-in-view {
  opacity: 1;
  transform: scale(1);
}

/* Animação de swing */
.animate-on-scroll-swing {
  opacity: 0;
  transform: rotate(-15deg) translateX(-30px);
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-on-scroll-swing.animate-in-view {
  opacity: 1;
  transform: rotate(0) translateX(0);
}
</style>



