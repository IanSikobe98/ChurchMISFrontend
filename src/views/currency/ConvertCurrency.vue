<script>
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import store from '@/store'

export default {
  components: { AppLoader },
  data() {
    return {
      permissions: [],
      user: {},
      loading: false,
      amount: '',
      fromCurrency: '',
      toCurrency: '',
      bankDirection:'',
      rateValue:'',
      convertedAmount:'',
      userName: '',
      email: '',
      phone: '',
      role: '',
      roles: [],
      errors: {},
      filteredCurrencyOptions: [],
      currencyOptions: [
        { id: 'USD', name: 'United States Dollar' },
        { id: 'KES', name: 'Kenyan Shilling' },
        { id: 'EUR', name: 'Euro' },
        { id: 'GBP', name: 'British Pound Sterling' },
        { id: 'ZAR', name: 'South African Rand' },
        { id: 'RWF', name: 'Rwandan Franc' },
      ],
    }
  },
  computed:{
    canCreateUsers () {
      return this.hasPerm("CREATE_USERS");
    },
    canViewUsers () {
      return this.hasPerm("VIEW_USERS");
    },
  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.permissions = this.user?.usersPerm;
    this.fetchRoles();
  },
  methods: {
    hasPerm (permission) {
      return this.permissions && this.permissions.includes(permission)
    },

    viewUsers(){
      this.$router.push('/viewUsers');
    },
    fetchRoles() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.roles.getRoles

      axios
        .post(url, { page: 0, size: 10 })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: data.responseMessage,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2',
                cancelButton: 'btn btn-secondary px-4'
              }
            })
            return
          }
          this.roles = data.data
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching roles',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2',
              cancelButton: 'btn btn-secondary px-4'
            }
          })
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    validateForm() {
      this.errors = {}
      if (!this.amount) {
        this.errors.amount = 'Amount is required.'
      } else if (!config.CURRENCY_REGEX.test(this.amount)) {
        this.errors.amount = 'Invalid Amount Input'
      }
      if (!this.fromCurrency) {
        this.errors.fromCurrency = 'From Currency Field is required.'
      }
      if (!this.toCurrency) {
        this.errors.toCurrency = 'To Currency Field is required.'
      }

      if (Object.keys(this.errors).length > 0) {
        return false
      }
      return true
    },
    checkBankDirection() {
      if (this.fromCurrency && this.toCurrency ) {
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getCurrencyDirection

        axios
          .post(url, {
            fromCurrency: this.fromCurrency,
            toCurrency: this.toCurrency
          })
          .then((response) => {
            const data = response.data
            // var responseMessage = data.responseMessage
            if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.responseMessage,
                customClass: {
                  confirmButton: 'btn btn-success px-4 me-2',
                  cancelButton: 'btn btn-secondary px-4'
                }
              })
              return
            }
            // Swal.fire({
            //   icon: 'success',
            //   title: 'Success!',
            //   text: responseMessage,
            //   timer: 3000,
            //   customClass: {
            //     confirmButton: 'btn btn-success px-4 me-2',
            //     cancelButton: 'btn btn-secondary px-4'
            //   }
            // })
            console.log('data', data)
            this.bankDirection = data?.entity
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Error occurred fetching Accounts',
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2',
                cancelButton: 'btn btn-secondary px-4'
              }
            })
            console.error(error)
          })
          .finally(() => {
            this.loading = false
          })
        if(this.rateValue && this.convertedAmount){
          this.fetchExchangeRates();
        }
      }
    },
    fetchExchangeRates() {
      if (!this.validateForm()) {
        console.log('Validation failed', this.errors)
        return
      }
      console.log('validation passed ')
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getSinglePairExchangeRate

        axios
          .post(url, {
            fromCurrency: this.fromCurrency,
            toCurrency: this.toCurrency,
            transactionAmount: this.amount
          })
          .then((response) => {
            const data = response.data
            var responseMessage = data.responseMessage
            if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.responseMessage,
                customClass: {
                  confirmButton: 'btn btn-success px-4 me-2',
                  cancelButton: 'btn btn-secondary px-4'
                }
              })
              return
            }
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: responseMessage,
              timer: 3000,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2',
                cancelButton: 'btn btn-secondary px-4'
              }
            })
            console.log('data', data)
            if (this.bankDirection === 'Sell') {
              this.rateValue = data.entity?.sellingRate
              this.convertedAmount = data.entity?.sellingConvertedAmount
            } else if (this.bankDirection === 'Buy') {
              this.rateValue = data.entity?.buyingRate
              this.convertedAmount = data.entity?.buyingConvertedAmount
            }
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Error occurred fetching Exchange Rates',
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2',
                cancelButton: 'btn btn-secondary px-4'
              }
            })
            console.error(error)
          })
          .finally(() => {
            this.loading = false
          })

    },

    filterCurrencyOptions(){
      this.filteredCurrencyOptions = this.currencyOptions.filter(
        currency => currency.id !== this.fromCurrency
      );
      this.checkBankDirection();
    }


  }
}
</script>

<template>
  <!-- Loader -->
  <div>
    <AppLoader v-if="loading" />
  </div>

  <!-- Main Content Wrapper - Prevents overlap -->
  <div class="main-content-wrapper">
    <div class="row">
      <div class="col-lg-12">
        <div class="form-card">
          <!-- Card Header -->
          <div class="form-card-header">
            <div class="header-content">
              <div class="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 class="form-title">Convert Currency</h4>
                <p class="form-subtitle">Convert amount to a new currency</p>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="form-card-body">
            <form @submit.prevent="fetchExchangeRates">
              <!-- Info Banner -->
              <div class="info-banner">
                <div class="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="info-text">
                  <strong>Required fields are marked with an asterisk (*)</strong>
                  <p>All information provided will be used to convert the currency </p>
                </div>
              </div>

              <!-- Form Section: Basic Information -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M17 6H9.5C7.567 6 6 7.567 6 9.5C6 11.433 7.567 13 9.5 13H14.5C16.433 13 18 14.567 18 16.5C18 18.433 16.433 20 14.5 20H6"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h5 class="section-title">Currency Information</h5>
                </div>

                <div class="row g-4">
                  <!-- Username -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        Amount <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M17 6H9.5C7.567 6 6 7.567 6 9.5C6 11.433 7.567 13 9.5 13H14.5C16.433 13 18 14.567 18 16.5C18 18.433 16.433 20 14.5 20H6"
                                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <input
                          v-model="amount"
                          type="text"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.amount }"
                          placeholder="Enter amount"
                        />
                      </div>
                      <small v-if="errors.amount" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.amount }}
                      </small>
                    </div>
                  </div>

                  <!-- From -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        From <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                          <circle cx="16" cy="12" r="1" fill="currentColor"/>
                          <path d="M8 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          <path d="M5 9L2 12L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        </div>


                        <select
                          v-model="fromCurrency"
                          class="form-control modern-select"
                          :class="{ 'is-invalid': errors.fromCurrency }"
                          @change ="filterCurrencyOptions"
                        >
                          <option value="">Select From Currency</option>
                          <option v-for="currencyOption in currencyOptions" :key="currencyOption.id" :value="currencyOption.id">
                            {{ currencyOption.id }} - {{ currencyOption.name }}
                          </option>
                        </select>
                      </div>
                      <small v-if="errors.fromCurrency" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.fromCurrency }}
                      </small>
                    </div>
                  </div>

                  <!--To-->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        To <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M10 5L3 12L10 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        </div>
                        <select
                          v-model="toCurrency"
                          class="form-control modern-select"
                          :class="{ 'is-invalid': errors.toCurrency }"
                          @change ="checkBankDirection"
                        >
                          <option value="">Select To Currency</option>
                          <option v-for="currencyOption in filteredCurrencyOptions" :key="currencyOption.id" :value="currencyOption.id">
                            {{ currencyOption.id }} - {{ currencyOption.name }}
                          </option>
                        </select>
                      </div>
                      <small v-if="errors.toCurrency" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.toCurrency }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="$router.go(-1)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Cancel</span>
                </button>
                <button  type="submit" class="btn btn-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M5 6V12C5 13.657 8.134 15 12 15C15.866 15 19 13.657 19 12V6"
                          stroke="currentColor" stroke-width="2"/>
                    <path d="M5 12V18C5 19.657 8.134 21 12 21C15.866 21 19 19.657 19 18V12"
                          stroke="currentColor" stroke-width="2"/>
                  </svg>

                  <span>Convert Currency</span>
                </button>
              </div>

              <!-- Form Section: Conversion results -->
              <div v-if="rateValue && convertedAmount" class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7H21V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
                            stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                      <path d="M3 7V5C3 3.89543 3.89543 3 5 3H17C18.1046 3 19 3.89543 19 5V7"
                            stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                      <path d="M16 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <circle cx="16" cy="12" r="1" fill="currentColor"/>
                    </svg>



                  </div>
                  <h5 class="section-title">Conversion Results</h5>
                </div>

                <div class="row g-4">
                  <div class="col-lg-6">
                    <div class="detail-item">
                      <label>RATE:</label>

                      <p v-if="bankDirection === 'Buy'"><b class="uppercase">{{ bankDirection }}</b> 1 {{ fromCurrency }} = <b> {{ rateValue }} {{ toCurrency }}</b></p>
                      <p v-if="bankDirection === 'Sell'"><b class="uppercase">{{ bankDirection }}</b> 1 {{ toCurrency }}  = <b> {{ rateValue }} {{ fromCurrency }}  </b></p>
                      <br>
                      <label>RESULTS:</label>
                      <p>{{ amount }} {{ fromCurrency }} = <b> {{ convertedAmount }} {{ toCurrency }} </b></p>

                    </div>
                  </div>
                </div>
              </div>


            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Content Wrapper - Prevents overlap with subheader */
.main-content-wrapper {
  min-height: calc(100vh - 280px - 80px);
  padding-top: 20px;
  padding-bottom: 60px;
}

/* Form Card - Matching Dashboard Style */
.form-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  border: 2px solid rgba(16, 185, 129, 0.1);
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.2);
}

/* Card Header */
.form-card-header {
  padding: 28px;
  border-bottom: 2px solid #f0fdf4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.form-subtitle {
  font-size: 14px;
  color: #059669;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.view-users-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.view-users-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Card Body */
.form-card-body {
  padding: 32px 28px;
}

/* Info Banner */
.info-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  gap: 14px;
  margin-bottom: 32px;
}

.info-banner .info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
}

.info-text strong {
  color: #1e40af;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.info-text p {
  color: #3b82f6;
  font-size: 13px;
  margin: 0;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.form-section:hover {
  border-color: #d1fae5;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Form Groups */
.form-group {
  margin-bottom: 0;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  display: block;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}

/* Modern Input */
.modern-input,
.modern-select {
  width: 100%;
  padding: 12px 14px 12px 46px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.2s ease;
  background: white;
}

.modern-input:focus,
.modern-select:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  outline: none;
}

.modern-input:focus + .input-icon,
.modern-select:focus + .input-icon {
  color: #10b981;
}

.modern-input::placeholder {
  color: #9ca3af;
}

.modern-input.is-invalid,
.modern-select.is-invalid {
  border-color: #ef4444;
}

.modern-input.is-invalid:focus,
.modern-select.is-invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

/* Modern Select */
.modern-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  cursor: pointer;
}

.modern-select:focus {
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
}

.error-message svg {
  flex-shrink: 0;
  stroke: #ef4444;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  padding-bottom: 24px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-outline {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: block;
}

.detail-item p {
  font-size: 15px;
  font-weight: 600;
  color: #064e3b;
  margin: 0;
}


/* Responsive Design */
@media (max-width: 768px) {
  .main-content-wrapper {
    padding-top: 16px;
    padding-bottom: 40px;
  }

  .form-card-header {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content {
    width: 100%;
  }

  .header-actions {
    width: 100%;
  }

  .view-users-btn {
    width: 100%;
    justify-content: center;
  }

  .form-card-body {
    padding: 24px 20px;
  }

  .form-section {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .info-banner {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .form-title {
    font-size: 18px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .section-icon {
    width: 36px;
    height: 36px;
  }
}

/* Animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  animation: slideInUp 0.4s ease-out;
}
</style>
