<template>
  <div class="logo-main">
    <div class="logo-wrapper" :class="{ 'logo-wrapper--colored': color }">
      <!-- Logo image -->
      <img
        class="logo-image"
        src="@/assets/images/adventist_logo.png"
        alt="Kingdom Bank Logo"
        width="200"
        height="50"
        loading="lazy"
      />

      <!-- Animated gradient border (shown on hover) -->
      <div class="logo-border-effect" aria-hidden="true"></div>

      <!-- Shine sweep (shown on hover) -->
      <div class="logo-shine" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppLogo',
  props: {
    color: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* ─── Container ──────────────────────────────── */
.logo-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

/* ─── Wrapper ────────────────────────────────── */
.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(238, 244, 251, 0.75) 100%
  );
  border-radius: 14px;
  border: 2px solid transparent;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
  box-shadow 0.35s ease,
  border-color 0.35s ease,
  background 0.35s ease;
  box-shadow: 0 4px 14px rgba(46, 84, 126, 0.09);
}

/* ─── Hover state ────────────────────────────── */
.logo-wrapper:hover {
  transform: scale(1.04);
  border-color: rgba(46, 84, 126, 0.28);
  box-shadow: 0 8px 24px rgba(46, 84, 126, 0.18);
  background: linear-gradient(
    135deg,
    rgba(238, 244, 251, 0.95) 0%,
    rgba(220, 233, 245, 0.8) 100%
  );
}

.logo-wrapper:hover .logo-image {
  filter: brightness(1.04) contrast(1.08);
}

/* Colored variant (prop: color=true) */
.logo-wrapper--colored {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.08) 0%,
    rgba(46, 84, 126, 0.04) 100%
  );
}

/* ─── Image ──────────────────────────────────── */
.logo-image {
  position: relative;
  z-index: 2;
  display: block;
  max-width: 100%;
  height: auto;
  transition: filter 0.35s ease;
  filter: brightness(1) contrast(1.05);
}

/* ─── Animated gradient border ───────────────── */
/*
  Visible only on hover via opacity transition.
  Uses mask-composite to show only the border area.
*/
.logo-border-effect {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  padding: 2px;
  background: linear-gradient(
    135deg,
    #2e547e,
    #3d6fa8,
    #5a8fc8,
    #2e547e
  );
  background-size: 300% 300%;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  pointer-events: none;
  animation: gradientShift 4s ease infinite;
  transition: opacity 0.35s ease;
  z-index: 1;
}

.logo-wrapper:hover .logo-border-effect {
  opacity: 1;
}

@keyframes gradientShift {
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}

/* ─── Shine sweep ────────────────────────────── */
.logo-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.32) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  background-position: 200% 0;
  pointer-events: none;
  z-index: 3;
  transition: background-position 0.65s ease;
}

.logo-wrapper:hover .logo-shine {
  background-position: -200% 0;
}

/* ─── Optional utility classes ───────────────── */

/* .logo-wrapper.pulse — subtle breathing shadow */
.logo-wrapper.pulse {
  animation: logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse {
  0%, 100% { box-shadow: 0 4px 14px rgba(46, 84, 126, 0.09); }
  50%       { box-shadow: 0 6px 22px rgba(46, 84, 126, 0.22); }
}

/* .logo-wrapper.glow — blue ambient glow */
.logo-wrapper.glow {
  box-shadow: 0 4px 24px rgba(46, 84, 126, 0.28);
}
.logo-wrapper.glow::before {
  content: '';
  position: absolute;
  inset: -3px;
  background: linear-gradient(135deg, #2e547e, #3d6fa8);
  border-radius: 17px;
  opacity: 0.18;
  filter: blur(10px);
  z-index: -1;
  animation: glowPulse 3s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.18; transform: scale(0.96); }
  50%       { opacity: 0.32; transform: scale(1.04); }
}

/* ─── Accessibility ──────────────────────────── */
.logo-wrapper:focus-within {
  outline: 2px solid #2e547e;
  outline-offset: 4px;
}

/* ─── Responsive ─────────────────────────────── */
@media (max-width: 1199px) {
  .logo-wrapper { padding: 10px 14px; }
  .logo-image   { width: 180px; }
}

@media (max-width: 991px) {
  .logo-wrapper { padding: 8px 12px; }
  .logo-image   { width: 160px; }
}

@media (max-width: 767px) {
  .logo-wrapper { padding: 6px 10px; }
  .logo-image   { width: 140px; }
}

/* ─── Mini sidebar ───────────────────────────── */
:deep(.sidebar-mini) .logo-wrapper { padding: 8px; }
:deep(.sidebar-mini) .logo-image   { width: 40px; }

/* ─── Print ──────────────────────────────────── */
@media print {
  .logo-border-effect,
  .logo-shine { display: none; }
  .logo-wrapper { box-shadow: none; border: 1px solid #d1d9e0; }
}

/* ─── High contrast ──────────────────────────── */
@media (prefers-contrast: high) {
  .logo-wrapper        { border: 2px solid currentColor; }
  .logo-border-effect  { display: none; }
}

/* ─── Reduced motion ─────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .logo-wrapper,
  .logo-image,
  .logo-shine,
  .logo-border-effect {
    animation: none;
    transition: none;
  }
  .logo-wrapper:hover { transform: none; }
}

/* ─── Dark mode ──────────────────────────────── */
@media (prefers-color-scheme: dark) {
  .logo-wrapper {
    background: linear-gradient(
      135deg,
      rgba(26, 51, 82, 0.95) 0%,
      rgba(46, 84, 126, 0.80) 100%
    );
    border-color: rgba(90, 143, 200, 0.2);
  }
  .logo-wrapper:hover {
    background: linear-gradient(
      135deg,
      rgba(46, 84, 126, 0.9) 0%,
      rgba(61, 111, 168, 0.75) 100%
    );
    border-color: rgba(90, 143, 200, 0.4);
  }
}
</style>
