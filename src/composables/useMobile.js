import { ref, onMounted, onUnmounted } from 'vue';

export function useMobile() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(false);
  const screenWidth = ref(window.innerWidth);

  const BREAKPOINTS = {
    mobile: 640,
    tablet: 1024
  };

  function updateScreenSize() {
    screenWidth.value = window.innerWidth;
    isMobile.value = screenWidth.value < BREAKPOINTS.mobile;
    isTablet.value = screenWidth.value >= BREAKPOINTS.mobile && screenWidth.value < BREAKPOINTS.tablet;
    isDesktop.value = screenWidth.value >= BREAKPOINTS.tablet;
  }

  onMounted(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    isTouchDevice: ref('ontouchstart' in window || navigator.maxTouchPoints > 0)
  };
}