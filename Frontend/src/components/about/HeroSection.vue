<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="relative bg-gradient-to-br from-[#117BED] via-[#1135ED] to-[#6B46C1] h-screen flex items-center overflow-hidden">
    <!-- Elementos decorativos de fundo -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div class="flex items-center justify-between gap-8">
        <div class="w-full lg:w-2/3 lg:pr-16 animate-fadeInUp">
          <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight text-left animate-fadeInUp" style="animation-delay: 0.2s;">
            Plataforma
            <span class="block text-white animate-fadeInUp" style="animation-delay: 0.4s;">Datalogger Dashboard</span>
          </h1>

          <p class="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 sm:mb-12 leading-relaxed text-left animate-fadeInUp" style="animation-delay: 0.6s;">
            Plataforma completa para monitoramento de dados de sensores em tempo real.
            Colete, visualize e analise dados de <span class="text-white font-bold">temperatura</span>,
            <span class="text-white font-bold">umidade</span>,
            <span class="text-white font-bold">altitude</span>,
            <span class="text-white font-bold">giroscópio</span> e
            <span class="text-white font-bold">aceleração</span> com facilidade.
          </p>

          <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 animate-fadeInUp" style="animation-delay: 0.8s;">
            <RouterLink
              to="/dashboard"
              class="group bg-white text-[#117BED] px-8 py-3 rounded-full font-bold text-lg sm:text-xl hover:bg-[#11C1ED] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
            >
              <span class="flex items-center justify-center">
                Dashboard
                <svg class="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </span>
            </RouterLink>
            <RouterLink
              to="/signup"
              class="group bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg sm:text-xl hover:bg-white hover:text-[#117BED] transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Começar Agora
            </RouterLink>
          </div>
        </div>

        <!-- Imagem do modelo -->
        <div class="hidden lg:flex w-1/3 justify-end items-end relative h-full overflow-visible animate-fadeInRight" style="animation-delay: 1s;">
          <!-- Efeitos decorativos -->
          <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-t from-white/20 via-white/10 to-transparent rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-1/3 w-32 h-32 bg-white/15 rounded-full blur-2xl animate-pulse"></div>
          <div class="absolute bottom-20 right-1/2 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" style="animation-delay: 1s;"></div>

          <!-- Container da imagem -->
          <div class="relative z-10 flex items-end animate-scaleIn" style="animation-delay: 1.2s;">
            <img
              src="@/assets/images/modelo.png"
              alt="Modelo DataLogger"
              class="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              style="filter: drop-shadow(0 0 30px rgba(255,255,255,0.3)); transform: translateY(25%) scale(1.8);"
            />
          </div>

          <!-- Reflexo sutil no chão -->
          <div class="absolute bottom-0 right-1/4 w-80 h-8 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
        </div>
      </div>
    </div>

    <!-- Indicador de scroll -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.animate-fadeInRight {
  animation: fadeInRight 0.8s ease-out forwards;
  opacity: 0;
}

.animate-scaleIn {
  animation: scaleIn 0.8s ease-out forwards;
  opacity: 0;
}
</style>

