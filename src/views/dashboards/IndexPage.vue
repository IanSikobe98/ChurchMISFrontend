<template>
  <div class="main-content-wrapper">
    <!-- Rate Carousel Section -->
    <div class="row mb-4">
      <div class="col-12" data-aos="fade-up" data-aos-delay="400">
        <div class="section-header">
          <div class="d-flex align-items-center gap-3">
            <h4 class="section-title mb-0"></h4>
          </div>
        </div>

        <div class="rate-carousel-container">
          <RateCarousel :rates="exchangeRates" />
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="row mb-4" data-aos="fade-up" data-aos-delay="600">

      <div v-if="canViewDealCodeRequests" class="col-md-6 mb-4">
        <div class="action-card action-secondary">
          <div class="action-content">
            <div class="action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M9 3V21M3 9H21M3 15H21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <h5 class="action-title">View All Deals</h5>
              <p class="action-description">Track and manage your forex transactions</p>
            </div>
          </div>
          <button class="action-btn" @click="viewDeals">
            <span>View Deals</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="canConvertCurrency" class="col-md-6 mb-4">
        <div class="action-card action-primary">
          <div class="action-content">
            <div class="action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h5 class="action-title">Convert Currency</h5>
              <p class="action-description">Convert amount to a new currency using current rate</p>
            </div>
          </div>
          <button class="action-btn" @click="convertCurrency">
            <span>Request Currency Conversion</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Deals Table Section -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="table-card" data-aos="fade-up" data-aos-delay="800">
          <div class="table-header">
            <div>
              <h4 class="table-title">Requested Deals</h4>
              <p class="table-subtitle">Recent forex deal requests and their status</p>
            </div>
            <div class="table-actions">
              <!--              <button class="filter-btn">-->
              <!--                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">-->
              <!--                  <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>-->
              <!--                </svg>-->
              <!--                Filter-->
              <!--              </button>-->
              <!--              <button class="export-btn">-->
              <!--                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">-->
              <!--                  <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>-->
              <!--                  <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>-->
              <!--                </svg>-->
              <!--                Export-->
              <!--              </button>-->
            </div>
          </div>

          <div class="table-body">
            <div class="table-responsive">
              <data-table v-if="tableReady" :data="dealRequests" :columns="columns" :isFooter="true" :striped="false" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import AOS from 'aos'
import store from '@/store'
import DataTable from '@/components/DataTable.vue'
import RateCarousel from '@/components/RateCarousel.vue'

export default {
  components: {
    RateCarousel,
    DataTable,
  },
  setup() {
    onMounted(() => {
      AOS.init({
        disable: function () {
          return window.innerWidth < 996
        },
        once: true,
        duration: 800
      })
    })

    return {}
  },
  data() {
    return {
      tableReady: false,
      loading: false,
      dealRequests: [],
      permissions: [],
      exchangeRates: [],
      currencyOptions: [
        { id: 'USD', name: 'United States Dollar' },
        { id: 'KES', name: 'Kenyan Shilling' },
        { id: 'EUR', name: 'Euro' },
        { id: 'GBP', name: 'British Pound Sterling' },
        { id: 'ZAR', name: 'South African Rand' },
        { id: 'RWF', name: 'Rwandan Franc' },
      ],
      rates: [
        { pair: 'DKK/KES', label: 'Danish Krone / Kenyan Shilling', buy: '-', sell: '22.23928' },
        { pair: 'JPY/KES', label: 'Japanese Yen / Kenyan Shilling', buy: '0.75437', sell: '0.91167' },
        { pair: 'KES/UGX', label: 'Kenyan Shilling / Ugandan Shilling', buy: '20.83043', sell: '32.98579' },
        { pair: 'EUR/KES', label: 'Euro / Kenyan Shilling', buy: '138.45', sell: '142.30' },
        { pair: 'USD/KES', label: 'US Dollar / Kenyan Shilling', buy: '128.50', sell: '131.20' },
        { pair: 'GBP/KES', label: 'British Pound / Kenyan Shilling', buy: '163.20', sell: '167.80' }
      ]
    }
  },
  computed: {
    columns() {
      const cols = [
        { title: 'Customer Name', data: 'customerName' },
        { title: 'Account Number', data: 'accountNumber' },
        { title: 'Amount', data: 'counterNominalAmount' },
        { title: 'Currency Pair', data: 'currencyPair' },
        { title: 'Buy/Sell', data: 'buySell' },
        {
          title: 'Request Date',
          data: 'requestDate',
          render: function (data) {
            return new Date(data).toISOString().split('T')[0]
          }
        },
        { title: 'Value Date', data: 'valueDate' },
        { title: 'Negotiated Rate', data: 'negotiatedRate' },
        {
          title: 'Deal Status',
          data: 'status',
          render: function (data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Active</span>`
            if (id === 0) return `<span class="badge bg-danger">Inactive</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            return `<span class="badge bg-primary">${data.statusName}</span>`
          }
        },
        { title: 'Deal Code', data: 'dealerCode' },
        { title: 'Order Number', data: 'orderId' }
      ]

      return cols
    },
    canCreateDealCodeRequests() {
      return this.hasPerm('CREATE_DEAL_REQUESTS')
    },
    canConvertCurrency() {
      return this.hasPerm('CONVERT_CURRENCY')
    },
    canViewDealCodeRequests() {
      return this.hasPerm("VIEW_DEAL_REQUESTS");
    },
    canApproveDealCodeRequests() {
      return this.hasPerm('APPROVE_DEAL_REQUESTS')
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user)
    this.permissions = this.user?.usersPerm
    this.tableReady = true
  },
  methods: {
    hasPerm(permission) {
      return this.permissions && this.permissions.includes(permission)
    },
    viewDeals() {
      this.$router.push('/viewDealCodes');
    },
    convertCurrency() {
      this.$router.push('/convertCurrency');
    },
  }
}
</script>

<style scoped>
/* Main Content Wrapper */
.main-content-wrapper {
  min-height: calc(100vh - 280px - 80px);
  padding-bottom: 60px;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a3352 0%, #2e547e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: #2e547e;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  box-shadow: 0 0 0 0 rgba(46, 84, 126, 0.7);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(46, 84, 126, 0.7);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(46, 84, 126, 0);
  }
}

/* Action Cards */
.action-card {
  border-radius: 20px;
  padding: 28px;
  border: 2px solid rgba(46, 84, 126, 0.18);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.08);
}

.action-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(46, 84, 126, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.action-card:hover::before {
  opacity: 1;
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(46, 84, 126, 0.18);
  border-color: rgba(46, 84, 126, 0.35);
}

.action-primary {
  background: linear-gradient(135deg, #eef4fb 0%, #dce9f5 100%);
}

.action-secondary {
  background: linear-gradient(135deg, #f0f4f9 0%, #e4eff8 100%);
}

.action-content {
  display: flex;
  gap: 18px;
  margin-bottom: 24px;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.action-primary .action-icon {
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.18), rgba(46, 84, 126, 0.1));
  color: #2e547e;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.15);
}

.action-secondary .action-icon {
  background: linear-gradient(135deg, rgba(61, 111, 168, 0.18), rgba(46, 84, 126, 0.1));
  color: #3d6fa8;
  box-shadow: 0 4px 12px rgba(61, 111, 168, 0.15);
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
}

.action-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a3352;
  margin-bottom: 6px;
}

.action-description {
  font-size: 14px;
  color: #2e547e;
  margin: 0;
  line-height: 1.5;
}

.action-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.action-primary .action-btn {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9) 0%,
    rgba(46, 84, 126, 0.7) 50%,
    rgba(46, 84, 126, 0.5) 100%
  );
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.3);
}

.action-secondary .action-btn {
  background: linear-gradient(
    135deg,
    rgba(61, 111, 168, 0.9) 0%,
    rgba(46, 84, 126, 0.75) 50%,
    rgba(46, 84, 126, 0.6) 100%
  );
  box-shadow: 0 4px 12px rgba(61, 111, 168, 0.3);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-btn:hover::before {
  width: 300px;
  height: 300px;
}

.action-primary .action-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 1) 0%,
    rgba(46, 84, 126, 0.85) 50%,
    rgba(46, 84, 126, 0.7) 100%
  );
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(46, 84, 126, 0.4);
}

.action-secondary .action-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(61, 111, 168, 1) 0%,
    rgba(46, 84, 126, 0.9) 50%,
    rgba(46, 84, 126, 0.75) 100%
  );
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(46, 84, 126, 0.4);
}

.action-btn svg {
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.action-btn:hover svg {
  transform: translateX(6px);
}

.action-btn span {
  position: relative;
  z-index: 1;
}

/* Table Card */
.table-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(46, 84, 126, 0.08);
  border: 2px solid rgba(46, 84, 126, 0.12);
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 8px 24px rgba(46, 84, 126, 0.14);
  border-color: rgba(46, 84, 126, 0.22);
}

.table-header {
  padding: 28px;
  border-bottom: 2px solid #eef4fb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #eef4fb 0%, #ffffff 100%);
}

.table-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a3352 0%, #2e547e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}

.table-subtitle {
  font-size: 14px;
  color: #2e547e;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.filter-btn,
.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #fff;
  border: 2px solid rgba(46, 84, 126, 0.2);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #2e547e;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.export-btn:hover {
  background: #eef4fb;
  border-color: #2e547e;
  color: #1a3352;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.15);
}

.table-body {
  padding: 28px;
}

/* Rate Carousel Container */
.rate-carousel-container {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(46, 84, 126, 0.08);
  border: 2px solid rgba(46, 84, 126, 0.12);
  transition: all 0.3s ease;
}

.rate-carousel-container:hover {
  box-shadow: 0 8px 24px rgba(46, 84, 126, 0.14);
  border-color: rgba(46, 84, 126, 0.22);
}

/* Custom Badge Styles */
:deep(.badge.bg-success) {
  background: linear-gradient(135deg, #2e547e, #1a3352) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(46, 84, 126, 0.2);
}

:deep(.dt-approve) {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9) 0%,
    rgba(46, 84, 126, 0.7) 100%
  ) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(46, 84, 126, 0.2);
}

:deep(.dt-approve):hover {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 1) 0%,
    rgba(46, 84, 126, 0.85) 100%
  ) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.3);
}

@media (max-width: 768px) {
  .main-content-wrapper {
    min-height: auto;
    padding-bottom: 40px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .section-title {
    font-size: 22px;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .table-actions {
    width: 100%;
  }

  .filter-btn,
  .export-btn {
    flex: 1;
  }

  .action-card {
    padding: 20px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
  }

  .action-icon svg {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 576px) {
  .action-title {
    font-size: 18px;
  }

  .action-description {
    font-size: 13px;
  }

  .rate-carousel-container,
  .table-card {
    border-radius: 16px;
  }
}
</style>
