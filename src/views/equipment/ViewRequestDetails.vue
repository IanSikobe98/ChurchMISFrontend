<script>
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import store from '@/store'
import DataTable from '@/components/DataTable.vue'

export default {
  components: { DataTable, AppLoader },
  data() {
    return {
      tableReady: false,
      tableReady2: false,
      tabs: ['Approvals', 'Equipment'],
      activeTab: 'Approvals',
      requestApprovals: [],
      equipmentAllocation: [],
      permissions: [],
      user: {},
      loading: false,
      quantity: '',
      event: '',
      purpose: '',
      venue: '',
      returnDate: '',
      email: '',
      phone: '',
      role: '',
      roles: [],
      equipmentInfo: [],
      equipment: {},
      errors: {},
      request: {},
      today: new Date().toISOString().split('T')[0]
    }
  },
  computed: {
    canCreateEquipmentRequests() {
      return this.hasPerm('CREATE_USERS')
    },
    canViewUsers() {
      return this.hasPerm('VIEW_USERS')
    },
    columns() {
      const cols = [
        { title: 'Approver Role', data: 'approverRole.roleName' },
        { title: 'Approver Name', data: 'actionBy.username' },
        { title: 'Level', data: 'stepLevel' },
        { title: 'Comments', data: 'comments' },
        {
          title: 'Approval Date', data: 'createdAt',
          render: function(data) {
            if(!data){
              return '';
            }
            var a = new Date(data)
            return a.toISOString().split('T')[0]
          }
        },



        {
          title: 'Status',
          data: 'status',
          render: function (data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Approved</span>`
            if (id === 0) return `<span class="badge bg-danger">Inactive</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending Approval</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            return data
          }
        },


      ]

      return cols
    },

    columns1() {
      const cols = [
        { title: 'Equipment Number', data: 'equipmentItem.serialNumber' },
        { title: 'Equipment Name', data: 'equipmentItem.equipment.name' },
        { title: 'Condition Before', data: 'conditionBefore.statusName' },
        {
          title: 'Date Allocated', data: 'allocatedAt',
          render: function(data) {
            if(!data){
              return '';
            }
            var a = new Date(data)
            return a.toISOString().split('T')[0]
          }
        },
        {
          title: 'Date Returned', data: 'returnedBy',
          render: function(data) {
            if(!data){
              return '';
            }
            var a = new Date(data)
            return a.toISOString().split('T')[0]
          }
        },



        {
          title: 'Status',
          data: 'status',
          render: function (data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Approved</span>`
            if (id === 13) return `<span class="badge bg-success">Allocated</span>`
            if (id === 0) return `<span class="badge bg-danger">Inactive</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending Approval</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            return data
          }
        },


      ]

      return cols
    },
  },
  mounted() {
    var jsonData = localStorage.getItem('selectedRequest')
    console.log('Component mounted2.', jsonData)
    if (jsonData) {
      try {
        this.request = JSON.parse(jsonData)
        console.log('Parsed Data: ', this.request)
        // Use parsedData as needed
      } catch (error) {
        console.error('Error parsing JSON data: ', error)
      }
    }
    this.user = JSON.parse(store.state.user)
    this.permissions = this.user?.usersPerm
    // this.fetchEquipmentInfo()
    this.tableReady = true
    this.tableReady2 = true
    this.fetchRequestApprovals(this.request.id)
    this.fetchEquipment(this.request.id)
  },
  methods: {
    hasPerm(permission) {
      return this.permissions && this.permissions.includes(permission)
    },
    viewRequests() {
      this.$router.push('/viewRequests')
    },

    fetchRequestApprovals(requestId) {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.equipment.getRequestApprovalsByRequest

      axios
        .post(url, { page: 0, size: 10, id: requestId })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
            })
            return
          }
          this.requestApprovals = data.data
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching Approvals',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    fetchEquipment(requestId) {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.equipment.getEquipmentByRequest

      axios
        .post(url, { page: 0, size: 10, id: requestId })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
            })
            return
          }
          this.equipmentAllocation = data.data
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching Equipment Information',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    createEquipmentRequest() {
      if (!this.validateForm()) return
      this.loading = true
      this.message = ''
      var url = env.apiUrl.baseUrl + env.apiUrl.equipment.createEquipmentRequest
      const token = localStorage.getItem('token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios
        .post(url, { equipmentId: this.equipment?.equipment?.id, quantity: this.quantity, event: this.event, purpose: this.purpose, venue: this.venue, returnDate: this.returnDate })
        .then((response) => {
          var data = response.data
          var responseCode = data.responseCode
          var responseMessage = data.responseMessage
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            this.responseMessage = responseMessage
            this.errorMessage = responseMessage
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: this.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
            })
            return
          }
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: responseMessage,
            timer: 3000,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
          this.$router.push('/viewRequests')
        })
        .catch((error) => {
          console.log('Error is ', error)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during Requisition of the equipment',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
        })
        .finally(() => {
          this.loading = false
        })
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
      } else if (this.quantity > this.equipment.quantity) {
        this.errors.quantity = 'Quantity set is more than the available quantity.'
      }

      if (!this.event) {
        this.errors.event = 'Event is required.'
      } else if (!config.TEXT_REGEX.test(this.event)) {
        this.errors.event = 'Invalid Event Name'
      }

      if (!this.purpose) {
        this.errors.purpose = 'Purpose is required.'
      } else if (!config.TEXT_REGEX.test(this.purpose)) {
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
            <div class="header-actions">
<!--              <div class="header-icon" @click="$router.go(-1)">-->
                <button type="button" class="btn btn-outline" @click="$router.go(-1)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
<!--                  <span>Cancel</span>-->
                </button>

              <div>
                <h4 class="form-title">Equipment Request Details</h4>
                <p class="form-subtitle">View Equipment Request Details</p>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="form-card-body">
            <div class="tabs">
              <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="['tab-btn', { active: activeTab === tab }]">
                {{ tab }}
              </button>
            </div>

            <div class="tab-content">
              <div v-if="activeTab === 'Approvals'">
                <!-- Table Body -->
                <div class="table-body">
                  <div class="table-responsive">
                    <data-table v-if="tableReady" :data="requestApprovals" :columns="columns" :isFooter="true" :striped="false"  />
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'Equipment'">
              <!-- Table Body -->
              <div class="table-body">
                <div class="table-responsive">
                  <data-table v-if="tableReady2" :data="equipmentAllocation" :columns="columns1" :isFooter="true" :striped="false" />
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  background: #eee;
  border-radius: 6px;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

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
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.9) 0%, rgba(46, 84, 126, 0.7) 50%, rgba(46, 84, 126, 0.5) 100%);
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
  background: linear-gradient(135deg, rgba(46, 84, 126, 1) 0%, rgba(46, 84, 126, 0.85) 50%, rgba(46, 84, 126, 0.7) 100%);
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
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.9) 0%, rgba(46, 84, 126, 0.7) 50%, rgba(46, 84, 126, 0.5) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, rgba(46, 84, 126, 1) 0%, rgba(46, 84, 126, 0.85) 50%, rgba(46, 84, 126, 0.7) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 84, 126, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
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
</style>
