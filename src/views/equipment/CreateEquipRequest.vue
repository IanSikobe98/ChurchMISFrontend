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
      quantity: '',
      event:'',
      purpose:'',
      venue:'',
      returnDate:'',
      email: '',
      phone: '',
      role: '',
      roles: [],
      equipmentInfo:[],
      equipment: {},
      errors: {},
      today: new Date().toISOString().split('T')[0]
    }
  },
  computed: {
    canCreateEquipmentRequests() {
      return this.hasPerm("CREATE_USERS");
    },
    canViewUsers() {
      return this.hasPerm("VIEW_USERS");
    },
  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.permissions = this.user?.usersPerm;
    this.fetchEquipmentInfo()
  },
  methods: {
    hasPerm(permission) {
      return this.permissions && this.permissions.includes(permission)
    },
    viewRequests() {
      this.$router.push('/viewRequests');
    },
    fetchEquipmentInfo() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.equipment.fetchEquipmentInfo

      axios
        .post(url, { page: 0, size: 10 })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error', title: 'Error!', text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
            })
            return
          }
          this.equipmentInfo = data.data
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error', title: 'Error!', text: 'Error occurred fetching Equipment Information',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
          console.error(error)
        })
        .finally(() => { this.loading = false })
    },
    createEquipmentRequest() {
      if (!this.validateForm()) return
      this.loading = true
      this.message = ''
      var url = env.apiUrl.baseUrl + env.apiUrl.equipment.createEquipmentRequest
      const token = localStorage.getItem('token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios
        .post(url, { equipmentId: this.equipment?.equipment?.id, quantity: this.quantity, event: this.event, purpose: this.purpose , venue: this.venue, returnDate: this.returnDate})
        .then((response) => {
          var data = response.data
          var responseCode = data.responseCode
          var responseMessage = data.responseMessage
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            this.responseMessage = responseMessage
            this.errorMessage = responseMessage
            Swal.fire({
              icon: 'error', title: 'Error!', text: this.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
            })
            return
          }
          Swal.fire({
            icon: 'success', title: 'Success!', text: responseMessage, timer: 3000,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
          this.$router.push('/viewRequests')
        })
        .catch((error) => {
          console.log('Error is ', error)
          Swal.fire({
            icon: 'error', title: 'Error!', text: 'An error occurred during Requisition of the equipment',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
        })
        .finally(() => { this.loading = false })
    },
    validateForm() {
      this.errors = {}
      if (Object.keys(this.equipment).length === 0) {
        this.errors.equipment = 'Equipment is required.'
      }


      if (!this.quantity) {
        this.errors.quantity = 'Quantity is required.'
      } else if (!config.CURRENCY_REGEX.test(this.quantity)) {
        this.errors.quantity = 'Invalid Quantity format.'
      }
      else if (this.quantity > this.equipment.quantity) {
        this.errors.quantity = 'Quantity set is more than the available quantity.'
      }

      if (!this.event) {
        this.errors.event = 'Event is required.'
      } else if (!config.TEXT_REGEX.test(this.event)) {
        this.errors.event = 'Invalid Event Name'
      }

      if (!this.purpose) {
        this.errors.purpose = 'Purpose is required.'
      } else if (!config.TEXT_REGEX.test(this.purpose) ) {
        this.errors.purpose = 'Invalid Purpose Input'
      }


      if (!this.venue) {
        this.errors.venue = 'Venue is required.'
      }

      if (!this.returnDate) {
        this.errors.returnDate = 'Return date is required.'
      }

      return Object.keys(this.errors).length === 0
    }
  }
}
</script>

<template>
  <!-- Loader -->
  <div>
    <AppLoader v-if="loading" />
  </div>

  <!-- Main Content Wrapper -->
  <div class="main-content-wrapper">
    <div class="row">
      <div class="col-lg-12">
        <div class="form-card">
          <!-- Card Header -->
          <div class="form-card-header">
            <div class="header-content">
              <div class="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <!-- Box -->
                  <path d="M3 7L12 2L21 7L12 12L3 7Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"/>
                  <path d="M3 7V17L12 22L21 17V7"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"/>

                  <!-- Plus -->
                  <path d="M12 9V15M9 12H15"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h4 class="form-title">Request Equipment</h4>
                <p class="form-subtitle">Add a new request for church equipment</p>
              </div>
            </div>
            <div class="header-actions">
              <button class="view-users-btn" @click="viewRequests">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <!-- Box -->
                  <path d="M3 7L12 2L21 7L12 12L3 7Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"/>
                  <path d="M3 7V17L12 22L21 17V7"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"/>

                  <!-- Plus -->
                  <path d="M12 9V15M9 12H15"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"/>
                </svg>
                <span>View All Requests</span>
              </button>
            </div>
          </div>

          <!-- Card Body -->
          <div class="form-card-body">
            <form @submit.prevent="createEquipmentRequest">
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
                  <p>All information provided will be used to create the equipment request.</p>
                </div>
              </div>

              <!-- Form Section: Basic Information -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <!-- Handle -->
                      <path d="M9 6V4H15V6"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"/>

                      <!-- Box -->
                      <rect x="3" y="6" width="18" height="14" rx="2"
                            stroke="currentColor"
                            stroke-width="2"/>

                      <!-- Divider -->
                      <path d="M3 12H21"
                            stroke="currentColor"
                            stroke-width="2"/>
                    </svg>
                  </div>
                  <h5 class="section-title">Equipment</h5>
                </div>

                <div class="row g-4">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label"> Select Equipment <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <!-- Handle -->
                            <path d="M9 6V4H15V6"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"/>

                            <!-- Box -->
                            <rect x="3" y="6" width="18" height="14" rx="2"
                                  stroke="currentColor"
                                  stroke-width="2"/>

                            <!-- Divider -->
                            <path d="M3 12H21"
                                  stroke="currentColor"
                                  stroke-width="2"/>
                          </svg>
                        </div>
                        <select
                          v-model="equipment"
                          class="form-control modern-select"
                          :class="{ 'is-invalid': errors.equipment }"
                        >
                          <option value="">Select Equipment</option>
                          <option v-for="equipmentItem in equipmentInfo" :key="equipmentItem" :value="equipmentItem">
                            {{ equipmentItem.equipment.name }}
                          </option>
                        </select>
                      </div>
                      <small v-if="errors.equipment" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.equipment }}
                      </small>
                    </div>
                  </div>




                  <!-- Username -->
                  <div class="col-lg-6" v-if="Object.keys(equipment).length>0">
                    <div class="form-group">
                      <label class="form-label">Quantity <span v-if="Object.keys(equipment).length>0"> (Available  {{equipment.equipment.name}} : {{equipment.quantity}}) </span> <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M4 9H20M4 15H20"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"/>

                            <path d="M10 3L8 21M16 3L14 21"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"/>
                          </svg>
                        </div>
                        <input
                          v-model="quantity"
                          type="text"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.quantity }"
                          placeholder="Enter Quantity"
                        />
                      </div>
                      <small v-if="errors.quantity" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.quantity }}
                      </small>
                    </div>
                  </div>


                </div>
              </div>

              <!-- Form Section: Contact & Role -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <!-- Document -->
                      <path d="M6 2H14L20 8V22H6V2Z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"/>

                      <!-- Fold -->
                      <path d="M14 2V8H20"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"/>

                      <!-- Detail lines -->
                      <path d="M9 13H15M9 17H15M9 9H11"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"/>
                    </svg>
                  </div>
                  <h5 class="section-title">Request Details</h5>
                </div>

                <div class="row g-4">
                  <!-- Event  -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">Event Name <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M20 12L12 20L4 12V4H12L20 12Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linejoin="round"/>

                            <circle cx="9" cy="9" r="1.5"
                                    fill="currentColor"/>
                          </svg>
                        </div>
                        <input
                          v-model="event"
                          type="tel"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.event }"
                          placeholder="Enter Event Name"
                        />
                      </div>
                      <small v-if="errors.event" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.event }}
                      </small>
                    </div>
                  </div>


                  <!-- Venue  -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">Venue<span class="required">*</span></label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <!-- Pin shape -->
                            <path d="M12 21C12 21 5 14.5 5 9.5C5 6.46243 7.46243 4 10.5 4H13.5C16.5376 4 19 6.46243 19 9.5C19 14.5 12 21 12 21Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linejoin="round"/>

                            <!-- Inner dot -->
                            <circle cx="12" cy="9.5" r="2"
                                    stroke="currentColor"
                                    stroke-width="2"/>
                          </svg>
                        </div>
                        <input
                          v-model="venue"
                          type="tel"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.venue }"
                          placeholder="Enter Venue"
                        />
                      </div>
                      <small v-if="errors.venue" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.venue }}
                      </small>
                    </div>
                  </div>


                  <!-- Purpose  -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">Purpose<span class="required">*</span></label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <!-- Outer circle -->
                            <circle cx="12" cy="12" r="9"
                                    stroke="currentColor"
                                    stroke-width="2"/>

                            <!-- Middle circle -->
                            <circle cx="12" cy="12" r="5"
                                    stroke="currentColor"
                                    stroke-width="2"/>

                            <!-- Center point -->
                            <circle cx="12" cy="12" r="2"
                                    fill="currentColor"/>
                          </svg>
                        </div>
                        <input
                          v-model="purpose"
                          type="tel"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.purpose }"
                          placeholder="Enter Purpose of the Equipment"
                        />
                      </div>
                      <small v-if="errors.purpose" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.purpose }}
                      </small>
                    </div>
                  </div>

                  <!-- Return Date -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">Return Date<span class="required">*</span></label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <!-- Calendar box -->
                            <rect x="3" y="5" width="18" height="16" rx="2"
                                  stroke="currentColor"
                                  stroke-width="2"/>

                            <!-- Top bar -->
                            <path d="M3 10H21"
                                  stroke="currentColor"
                                  stroke-width="2"/>

                            <!-- Rings -->
                            <path d="M8 3V7M16 3V7"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"/>

                            <!-- Date indicator -->
                            <circle cx="12" cy="15" r="1.5"
                                    fill="currentColor"/>
                          </svg>
                        </div>
                        <input
                          v-model="returnDate"
                          type="date"
                          class="form-control modern-input"
                          :min="today"
                          :class="{ 'is-invalid': errors.returnDate }"
                          placeholder="Enter Return Date"
                        />
                      </div>
                      <small v-if="errors.returnDate" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.returnDate }}
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
<!--                v-if="canCreateEquipmentRequests"-->
                <button type="submit" class="btn btn-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Clipboard / document -->
                    <path d="M9 2H15C15.5523 2 16 2.44772 16 3V21C16 21.5523 15.5523 22 15 22H9C8.44772 22 8 21.5523 8 21V3C8 2.44772 8.44772 2 9 2Z"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <!-- Plus / add symbol -->
                    <path d="M12 7V13M9 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <!-- Optional detail lines for equipment -->
                    <path d="M9 17H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Request for Equipment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Content Wrapper */
.main-content-wrapper {
  min-height: calc(100vh - 280px - 80px);
  padding-top: 20px;
  padding-bottom: 60px;
}

/* Form Card */
.form-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(46, 84, 126, 0.08);
  border: 2px solid rgba(46, 84, 126, 0.12);
  transition: all 0.3s ease;
  animation: slideInUp 0.4s ease-out;
}

.form-card:hover {
  box-shadow: 0 8px 24px rgba(46, 84, 126, 0.14);
  border-color: rgba(46, 84, 126, 0.22);
}

/* Card Header */
.form-card-header {
  padding: 28px;
  border-bottom: 2px solid #eef4fb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #eef4fb 0%, #ffffff 100%);
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
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.15), rgba(46, 84, 126, 0.08));
  color: #2e547e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.15);
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a3352 0%, #2e547e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.form-subtitle {
  font-size: 14px;
  color: #2e547e;
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
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9) 0%,
    rgba(46, 84, 126, 0.7) 50%,
    rgba(46, 84, 126, 0.5) 100%
  );
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.3);
}

.view-users-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 1) 0%,
    rgba(46, 84, 126, 0.85) 50%,
    rgba(46, 84, 126, 0.7) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 84, 126, 0.4);
}

/* Card Body */
.form-card-body {
  padding: 32px 28px;
}

/* Info Banner — kept blue (was already blue in original) */
.info-banner {
  background: linear-gradient(135deg, #eef4fb 0%, #dce9f5 100%);
  border: 2px solid rgba(46, 84, 126, 0.2);
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
  background: linear-gradient(135deg, #2e547e, #1a3352);
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
  color: #1a3352;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.info-text p {
  color: #2e547e;
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
  border-color: rgba(46, 84, 126, 0.22);
  background: linear-gradient(135deg, #eef4fb 0%, #ffffff 100%);
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
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.1), rgba(46, 84, 126, 0.05));
  color: #2e547e;
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
.form-group { margin-bottom: 0; }

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
.input-wrapper { position: relative; }

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

/* Modern Input & Select */
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
  border-color: #2e547e;
  box-shadow: 0 0 0 4px rgba(46, 84, 126, 0.1);
  outline: none;
}

.modern-input::placeholder { color: #9ca3af; }

.modern-input.is-invalid,
.modern-select.is-invalid {
  border-color: #ef4444;
}

.modern-input.is-invalid:focus,
.modern-select.is-invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

/* Select — updated chevron color to blue */
.modern-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  cursor: pointer;
}

.modern-select:focus {
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%232e547e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
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
  border-top: 2px solid #eef4fb;
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
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9) 0%,
    rgba(46, 84, 126, 0.7) 50%,
    rgba(46, 84, 126, 0.5) 100%
  );
  color: white;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 1) 0%,
    rgba(46, 84, 126, 0.85) 50%,
    rgba(46, 84, 126, 0.7) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 84, 126, 0.4);
}

.btn-primary:active { transform: translateY(0); }

/* Animation */
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Responsive */
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

  .header-content { width: 100%; }
  .header-actions  { width: 100%; }

  .view-users-btn {
    width: 100%;
    justify-content: center;
  }

  .form-card-body { padding: 24px 20px; }
  .form-section   { padding: 20px; }

  .form-actions { flex-direction: column-reverse; }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .info-banner { flex-direction: column; }
}

@media (max-width: 576px) {
  .form-title  { font-size: 18px; }
  .header-icon { width: 48px; height: 48px; }
  .section-icon { width: 36px; height: 36px; }
}
</style>
