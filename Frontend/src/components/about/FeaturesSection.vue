<script setup>
import { useScrollAnimation } from '@/composables/useScrollAnimation'

useScrollAnimation()
</script>

<template>
  <section class="min-h-screen flex items-center px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-16">
    <div class="w-full max-w-7xl mx-auto">
      <div class="text-center mb-12 sm:mb-16 animate-on-scroll-fade">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-[#117BED] mb-4 sm:mb-6 px-4 animate-on-scroll-fade" style="animation-delay: 0.2s;">
          Recursos Avançados
        </h2>
        <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 animate-on-scroll-fade" style="animation-delay: 0.4s;">
          Tecnologia de ponta para monitoramento completo e análise inteligente de dados
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
        <div class="group bg-white rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-[#117BED] hover:border-t-8 animate-on-scroll-left" style="animation-delay: 0.6s;">
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#117BED] to-[#1135ED] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
            <span class="text-2xl sm:text-3xl text-white">📊</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-[#117BED] mb-3 sm:mb-4">Dashboards Interativos</h3>
          <p class="text-gray-600 leading-relaxed text-sm sm:text-base">
            Visualize seus dados em tempo real com gráficos dinâmicos e intuitivos.
          </p>
        </div>

        <div class="group bg-white rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-[#6B46C1] hover:border-t-8 animate-on-scroll-scale" style="animation-delay: 0.8s;">
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#6B46C1] to-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
            <span class="text-2xl sm:text-3xl text-white">⚡</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-[#6B46C1] mb-3 sm:mb-4">Tempo Real</h3>
          <p class="text-gray-600 leading-relaxed text-sm sm:text-base">
            Monitoramento instantâneo com atualizações automáticas dos sensores.
          </p>
        </div>

        <div class="group bg-white rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-[#10B981] hover:border-t-8 animate-on-scroll-right" style="animation-delay: 1s;">
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
            <span class="text-2xl sm:text-3xl text-white">🔒</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-[#10B981] mb-3 sm:mb-4">Segurança Total</h3>
          <p class="text-gray-600 leading-relaxed text-sm sm:text-base">
            Dados protegidos com criptografia e backup automático na nuvem.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Animação de fade in para títulos */
.animate-on-scroll-fade {
  opacity: 0;
  transition: all 1s ease-out;
}

.animate-on-scroll-fade.animate-in-view {
  opacity: 1;
}

/* Animação da esquerda */
.animate-on-scroll-left {
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.8s ease-out;
}

.animate-on-scroll-left.animate-in-view {
  opacity: 1;
  transform: translateX(0);
}

/* Animação de escala */
.animate-on-scroll-scale {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.8s ease-out;
}

.animate-on-scroll-scale.animate-in-view {
  opacity: 1;
  transform: scale(1);
}

/* Animação da direita */
.animate-on-scroll-right {
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.8s ease-out;
}

.animate-on-scroll-right.animate-in-view {
  opacity: 1;
  transform: translateX(0);
}
</style>


