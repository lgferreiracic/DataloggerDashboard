<script setup>
import HeroSection from '@/components/about/HeroSection.vue'
import FeaturesSection from '@/components/about/FeaturesSection.vue'
import StatsSection from '@/components/about/StatsSection.vue'
import CTASection from '@/components/about/CTASection.vue'
</script>

<template>
  <div class="min-h-screen pt-28">
    <HeroSection />
    <FeaturesSection />
    <StatsSection />
    <CTASection />
  </div>
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
</style>



































