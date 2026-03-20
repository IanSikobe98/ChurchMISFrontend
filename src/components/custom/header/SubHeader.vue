<template>
  <div class="iq-navbar-header modern-header">
    <b-container fluid class="iq-container">
      <b-row>
        <b-col md="12">
          <div class="header-content">
            <div class="welcome-section">
              <div class="greeting-wrapper">
                <h1 class="welcome-title">
                  <span class="wave-emoji">👋</span>
                  Welcome back, <span class="username-highlight">{{ username }}</span>!
                </h1>
                <p class="welcome-subtitle">Get your deal in a matter of seconds in a seamless and easy way.</p>
              </div>

              <!-- Quick Stats Cards -->
              <div class="quick-stats">
                <div class="stat-card" v-for="(stat, index) in stats" :key="index">
                  <div class="stat-icon" :class="`stat-icon-${index + 1}`" v-html="stat.icon"></div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                  </div>
                  <div class="stat-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>

    <!-- Animated Background -->
    <div class="iq-header-img">
      <img
        src="@/assets/images/forex-trading-course.jpeg"
        alt="header"
        class="header-bg-image"
      />
      <div class="overlay-gradient"></div>
      <div class="animated-particles">
        <div class="particle" v-for="i in 20" :key="i"></div>
      </div>

      <!-- Animated Grid -->
      <div class="grid-overlay">
        <div class="grid-line" v-for="i in 8" :key="`line-${i}`"></div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'

export default {
  data() {
    return {
      user: {},
      username: '',
      dashStats: {},
      role: '',
      stats: [
        {
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          value: '0',
          label: 'Active Deals'
        },
        {
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          value: '0%',
          label: 'Success Rate'
        },
        {
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          value: '+0%',
          label: 'This Week'
        }
      ]
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user)
    this.username = this.user?.user?.username || 'User'
    this.role = this.user?.role
  },
  methods: {}
}
</script>

<style scoped>
.modern-header {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.iq-header-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.header-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(35%);
  transition: transform 0.3s ease;
}

.modern-header:hover .header-bg-image {
  transform: scale(1.05);
}

/* ── Blue overlay gradient ── */
.overlay-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.75) 0%,
    rgba(30, 58, 92, 0.65) 35%,
    rgba(26, 51, 82, 0.75) 70%,
    rgba(15, 30, 46, 0.85) 100%
  );
  z-index: 1;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  gap: 0;
  opacity: 0.1;
}

.grid-line {
  flex: 1;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  animation: gridPulse 3s ease-in-out infinite;
}

.grid-line:nth-child(1) { animation-delay: 0s; }
.grid-line:nth-child(2) { animation-delay: 0.2s; }
.grid-line:nth-child(3) { animation-delay: 0.4s; }
.grid-line:nth-child(4) { animation-delay: 0.6s; }
.grid-line:nth-child(5) { animation-delay: 0.8s; }
.grid-line:nth-child(6) { animation-delay: 1s; }
.grid-line:nth-child(7) { animation-delay: 1.2s; }
.grid-line:nth-child(8) { animation-delay: 1.4s; }

@keyframes gridPulse {
  0%, 100% { opacity: 0.3; }
  50%       { opacity: 0.8; }
}

.iq-container {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
}

.welcome-section {
  animation: slideInUp 0.8s ease-out;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.greeting-wrapper {
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.wave-emoji {
  display: inline-block;
  animation: wave 2s ease-in-out infinite;
  transform-origin: 70% 70%;
  margin-right: 0.5rem;
  font-size: 2.5rem;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(14deg); }
  20%       { transform: rotate(-8deg); }
  40%       { transform: rotate(14deg); }
  50%       { transform: rotate(-4deg); }
  60%       { transform: rotate(10deg); }
}

/* ── Blue username highlight ── */
.username-highlight {
  background: linear-gradient(135deg, #5a8fc8 0%, #a8c4e0 50%, #d6e8f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  font-weight: 800;
  text-shadow: none;
  filter: drop-shadow(0 2px 8px rgba(46, 84, 126, 0.5));
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* ── Stat Cards ── */
.quick-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInScale 0.6s ease-out backwards;
  min-width: 180px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-card:nth-child(1) { animation-delay: 0.2s; }
.stat-card:nth-child(2) { animation-delay: 0.3s; }
.stat-card:nth-child(3) { animation-delay: 0.4s; }

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.stat-shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%   { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

/* ── Hover: blue shadow instead of green ── */
.stat-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 28px rgba(46, 84, 126, 0.4);
  border-color: rgba(168, 196, 224, 0.5);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

/* ── Icon backgrounds — three blue tones ── */
.stat-icon-1 {
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.95), rgba(30, 58, 92, 0.85));
}

.stat-icon-2 {
  background: linear-gradient(135deg, rgba(61, 111, 168, 0.95), rgba(46, 84, 126, 0.85));
}

.stat-icon-3 {
  background: linear-gradient(135deg, rgba(90, 143, 200, 0.95), rgba(61, 111, 168, 0.85));
}

.stat-icon svg {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.3rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* ── Particles — blue tones ── */
.animated-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(168, 196, 224, 0.8), rgba(90, 143, 200, 0.4));
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(46, 84, 126, 0.6);
}

.particle:nth-child(1)  { left: 10%; animation-delay: 0s; }
.particle:nth-child(2)  { left: 20%; animation-delay: 1s; }
.particle:nth-child(3)  { left: 30%; animation-delay: 2s; }
.particle:nth-child(4)  { left: 40%; animation-delay: 3s; }
.particle:nth-child(5)  { left: 50%; animation-delay: 4s; }
.particle:nth-child(6)  { left: 60%; animation-delay: 0.5s; }
.particle:nth-child(7)  { left: 70%; animation-delay: 1.5s; }
.particle:nth-child(8)  { left: 80%; animation-delay: 2.5s; }
.particle:nth-child(9)  { left: 90%; animation-delay: 3.5s; }
.particle:nth-child(10) { left: 15%; animation-delay: 0.8s; }
.particle:nth-child(11) { left: 25%; animation-delay: 1.8s; }
.particle:nth-child(12) { left: 35%; animation-delay: 2.8s; }
.particle:nth-child(13) { left: 45%; animation-delay: 3.8s; }
.particle:nth-child(14) { left: 55%; animation-delay: 0.3s; }
.particle:nth-child(15) { left: 65%; animation-delay: 1.3s; }
.particle:nth-child(16) { left: 75%; animation-delay: 2.3s; }
.particle:nth-child(17) { left: 85%; animation-delay: 3.3s; }
.particle:nth-child(18) { left: 95%; animation-delay: 0.6s; }
.particle:nth-child(19) { left: 5%;  animation-delay: 1.6s; }
.particle:nth-child(20) { left: 50%; animation-delay: 2.6s; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10%  { opacity: 0.6; }
  90%  { opacity: 0.6; }
  50%  {
    transform: translateY(-120px) translateX(30px) scale(1.5);
    opacity: 1;
  }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .modern-header {
    height: auto;
    min-height: 340px;
    padding: 20px 0;
  }

  .welcome-title   { font-size: 1.75rem; }
  .wave-emoji      { font-size: 1.75rem; }
  .welcome-subtitle { font-size: 1rem; }

  .quick-stats    { flex-direction: column; }
  .stat-card      { width: 100%; }
  .stat-value     { font-size: 1.5rem; }
}

@media (max-width: 576px) {
  .greeting-wrapper { margin-bottom: 1.5rem; }

  .stat-card {
    padding: 1rem 1.25rem;
    min-width: auto;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
  }

  .stat-icon svg {
    width: 22px;
    height: 22px;
  }
}
</style>
