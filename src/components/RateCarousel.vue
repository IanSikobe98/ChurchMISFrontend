<template>
  <div class="rate-carousel-wrapper">
    <swiper
      :slides-per-view="3"
      :space-between="24"
      :loop="true"
      :breakpoints="breakpoints"
      :speed="2400"
      :autoplay="{ delay: 0, disableOnInteraction: false }"
      class="rate-swiper"
    >
      <swiper-slide v-for="(rate, index) in rates" :key="index">
        <div class="rate-card">
          <!-- Animated background gradient -->
          <div class="card-bg-gradient"></div>

          <!-- Live indicator -->
          <div class="live-indicator">
            <span class="live-dot"></span>
            <span class="live-text">LIVE</span>
          </div>

          <!-- Currency Pair Header -->
          <div class="card-header">
            <h3 class="pair-title">{{ rate.combination }}</h3>

          </div>

          <p class="pair-label">{{ rate.label }}</p>

          <!-- Rates Section -->
          <div class="rates-container">
            <div class="rate-item buy">
              <div class="rate-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                <span>Buy</span>
              </div>
              <strong class="rate-value">{{ rate.buyingRate }}</strong>
            </div>

            <div class="rate-divider"></div>

            <div class="rate-item sell">
              <div class="rate-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 12H16M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Sell</span>
              </div>
              <strong class="rate-value">{{ rate.sellingRate }}</strong>
            </div>
          </div>

          <!-- Trade Button -->
<!--          <button class="trade-btn">-->
<!--            <span>Trade Now</span>-->
<!--            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">-->
<!--              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--            </svg>-->
<!--          </button>-->
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue'
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

SwiperCore.use([Navigation, Pagination, Autoplay])

export default {
  name: 'RateCarousel',
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    rates: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      breakpoints: {
        320: { slidesPerView: 1, spaceBetween: 16 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 }
      }
    }
  },
  methods: {
    getTrendClass(index) {
      return index % 2 === 0 ? 'trend-up' : 'trend-down'
    }
  }
}
</script>

<style scoped>
.rate-carousel-wrapper {
  padding: 20px 0;
  position: relative;
}

.rate-swiper {
  padding: 10px 5px 30px;
}

.rate-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 24px;
  border-radius: 20px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.rate-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.card-bg-gradient {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.rate-card:hover .card-bg-gradient {
  opacity: 1;
}

.live-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.live-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.live-text {
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
  letter-spacing: 0.5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.pair-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: #FFFFFF;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.trend-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.trend-badge.trend-up {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.trend-badge.trend-down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.pair-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px 0;
  position: relative;
  z-index: 1;
}

.rates-container {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  flex: 1;
}

.rate-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.rate-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.05);
}

.rate-item.buy {
  border-color: rgba(16, 185, 129, 0.2);
}

.rate-item.sell {
  border-color: rgba(59, 130, 246, 0.2);
}

.rate-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rate-item.buy .rate-label {
  color: #10b981;
}

.rate-item.sell .rate-label {
  color: #FF0000;
}

.rate-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.rate-divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.trade-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.trade-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.trade-btn:hover::before {
  left: 100%;
}

.trade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
}

.trade-btn svg {
  transition: transform 0.3s ease;
}

.trade-btn:hover svg {
  transform: translateX(4px);
}

/* Swiper Navigation Customization */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

:deep(.swiper-button-next):hover,
:deep(.swiper-button-prev):hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  transform: scale(1.1);
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 18px;
  color: white;
  font-weight: 700;
}

@media (max-width: 768px) {
  .rate-card {
    min-height: 260px;
    padding: 20px;
  }

  .pair-title {
    font-size: 20px;
  }

  .rate-value {
    font-size: 18px;
  }
}
</style>
