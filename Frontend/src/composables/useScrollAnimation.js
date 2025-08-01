import { onMounted, onUnmounted } from 'vue'

export function useScrollAnimation() {
  let observer = null

  const initScrollAnimation = () => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    // Observar todos os elementos com classes de animação
    const animationClasses = [
      '.animate-on-scroll',
      '.animate-on-scroll-fade',
      '.animate-on-scroll-left',
      '.animate-on-scroll-right',
      '.animate-on-scroll-scale',
      '.animate-on-scroll-bounce',
      '.animate-on-scroll-flip',
      '.animate-on-scroll-rotate',
      '.animate-on-scroll-slide-up',
      '.animate-on-scroll-zoom',
      '.animate-on-scroll-swing',
      '.animate-on-scroll-typewriter',
      '.animate-on-scroll-wave',
      '.animate-on-scroll-pulse',
      '.animate-on-scroll-glow'
    ]

    animationClasses.forEach(className => {
      const elements = document.querySelectorAll(className)
      elements.forEach((el) => {
        observer.observe(el)
      })
    })
  }

  onMounted(() => {
    setTimeout(initScrollAnimation, 100)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    initScrollAnimation
  }
}

