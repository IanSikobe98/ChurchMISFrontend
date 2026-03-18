<template>
  <!--Enhanced Logo with Animation-->
  <div class="logo-main-enhanced">
    <div class="logo-wrapper">
      <!-- Logo Image -->
      <img
        :class="`logo-image ${color ? 'text-primary' : ''}`"
        src="@/assets/images/Kingdom-bank-logo.png"
        alt="Kingdom Bank Logo"
        width="200"
        height="50"
        loading="lazy"
      />

      <!-- Animated Border Effect -->
      <div class="logo-border-effect"></div>

      <!-- Shine Effect on Hover -->
      <div class="logo-shine"></div>
    </div>
  </div>
  <!--Logo End-->
</template>

<script>
export default {
  props: {
    color: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Enhanced Logo Container */
.logo-main-enhanced {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

/* Logo Wrapper with Effects */
.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%);
  border-radius: 14px;
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}

/* Logo Image Styling */
.logo-image {
  position: relative;
  z-index: 2;
  display: block;
  max-width: 100%;
  height: auto;
  transition: all 0.4s ease;
  filter: brightness(1) contrast(1.05);
}

/* Hover Effect for Logo Wrapper */
.logo-wrapper:hover {
  transform: scale(1.05);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(236, 253, 245, 0.7) 100%);
}

.logo-wrapper:hover .logo-image {
  filter: brightness(1.05) contrast(1.1);
}

/* Animated Border Effect */
.logo-border-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 14px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #10b981, #059669, #047857, #10b981);
  background-size: 300% 300%;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.4s ease;
  animation: gradientShift 4s ease infinite;
  pointer-events: none;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.logo-wrapper:hover .logo-border-effect {
  opacity: 1;
}

/* Shine Effect */
.logo-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: translateX(-100%) translateY(-100%) rotate(45deg);
  transition: transform 0.6s ease;
  pointer-events: none;
  z-index: 3;
}

.logo-wrapper:hover .logo-shine {
  transform: translateX(100%) translateY(100%) rotate(45deg);
}

/* Primary Color Variant */
.logo-image.text-primary {
  filter: brightness(1) contrast(1.1) saturate(1.2);
}

/* Pulsing Animation (Optional - can be activated with a class) */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
  }
  50% {
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
  }
}

.logo-wrapper.pulse {
  animation: pulse 3s ease-in-out infinite;
}

/* Glow Effect (Optional - can be activated with a class) */
.logo-wrapper.glow {
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.logo-wrapper.glow::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 16px;
  opacity: 0.2;
  filter: blur(10px);
  z-index: -1;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

/* Responsive Design */
@media (max-width: 1199px) {
  .logo-wrapper {
    padding: 10px 14px;
  }

  .logo-image {
    width: 180px;
    height: auto;
  }
}

@media (max-width: 991px) {
  .logo-wrapper {
    padding: 8px 12px;
  }

  .logo-image {
    width: 160px;
    height: auto;
  }
}

@media (max-width: 767px) {
  .logo-wrapper {
    padding: 6px 10px;
  }

  .logo-image {
    width: 140px;
    height: auto;
  }
}

/* Mini Sidebar State */
:deep(.sidebar-mini) .logo-image {
  width: 40px;
  height: auto;
}

:deep(.sidebar-mini) .logo-wrapper {
  padding: 8px;
}

/* Loading State */
.logo-image.loading {
  opacity: 0.6;
  animation: imageLoad 1.5s ease-in-out infinite;
}

@keyframes imageLoad {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

/* Focus State for Accessibility */
.logo-wrapper:focus-within {
  outline: 2px solid #10b981;
  outline-offset: 4px;
}

/* Print Styles */
@media print {
  .logo-border-effect,
  .logo-shine {
    display: none;
  }

  .logo-wrapper {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .logo-wrapper {
    border: 2px solid currentColor;
  }

  .logo-border-effect {
    display: none;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .logo-wrapper,
  .logo-image,
  .logo-shine,
  .logo-border-effect {
    animation: none;
    transition: none;
  }

  .logo-wrapper:hover {
    transform: none;
  }
}

/* Dark Mode Support (if applicable) */
@media (prefers-color-scheme: dark) {
  .logo-wrapper {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.7) 100%);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .logo-wrapper:hover {
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(4, 120, 87, 0.15) 100%);
  }
}
</style>
