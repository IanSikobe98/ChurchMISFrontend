<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import updateUser from '@/views/user/UpdateUser.vue'
import store from '@/store'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default {
  computed: {
    canCreateUsers() {
      return this.hasPerm('CREATE_USERS')
    },
    updateUser() {
      return updateUser
    },
    columns() {
      const canUpdateUser = this.canUpdateUsers
      const cols = [
        { title: 'RequestId', data: 'trxId' },
        { title: 'Equipment', data: 'equipment.name' },
        { title: 'Quantity', data: 'quantity' },
        { title: 'Event', data: 'event' },
        { title: 'Purpose', data: 'purpose' },
        { title: 'Venue', data: 'venue' },
        {
          title: 'Request Date', data: 'createdAt',
          render: function(data) {
            if(!data){
              return '';
            }
            var a = new Date(data)
            return a.toISOString().split('T')[0]
          }
        },
        {
          title: 'Return Date', data: 'returnDate',
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

        cols.push({
          title: 'Actions',
          data: null,
          orderable: false,
          searchable: false,
          render: function (data, type, row) {
            const activeDisabled = row.status.statusId === 0 ? '' : 'disabled'
            const inactiveDisabled = row.status.statusId === 1 ? '' : 'disabled'
            var actions = `<button class="btn btn-sm btn-dark me-1 dt-view" data-id="${row.id}">View</button>`
            if (canUpdateUser) {
              actions += `
    <button class="btn btn-sm btn-warning me-1 dt-edit" data-id="${row.id}">Edit</button>
    <button class="btn btn-sm btn-success me-1 dt-enable" data-id="${row.id}" ${activeDisabled}>Enable</button>
    <button class="btn btn-sm btn-danger me-1 dt-disable" data-id="${row.id}" ${inactiveDisabled}>Disable</button>`
            }
            return actions
          }
        })
      return cols
    },
    canUpdateUsers() {
      return this.hasPerm('UPDATE_USERS')
    }
  },
  components: { AppLoader, DataTable },
  data() {
    return {
      tableReady: false,
      permissions: [],
      user: {},
      users: [],
      equipmentRequests:[],
      showEnableModal: false,
      showDisableModal: false,
      loading: false,
      comment: '',
      row: {}
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user)
    this.permissions = this.user?.usersPerm
    this.tableReady = true
    this.fetchEquipmentRequests()
  },
  methods: {
    exportToExcel() {
      const users = this.users
      const formattedData = users.map((user) => ({
        Name: user.username,
        Phone: user.phone,
        Email: user.email,
        Role: user.role?.roleName,
        Status: user.status?.statusName,
        CreatedBy: user.createdBy,
        DateAdded: new Date(user.dateAdded).toLocaleString()
      }))
      const worksheet = XLSX.utils.json_to_sheet(formattedData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' })
      saveAs(fileData, 'users.xlsx')
    },
    hasPerm(permission) {
      return this.permissions && this.permissions.includes(permission)
    },
    editUsers(item) {
      localStorage.setItem('selectedUser', JSON.stringify(item))
      this.$router.push('/updateUser')
    },
    showEnableDialog(row) {
      this.comment = ''
      this.row = row
      this.showEnableModal = true
    },
    showDisableDialog(row) {
      this.comment = ''
      this.row = row
      this.showDisableModal = true
    },
    enableRecord(row) {
      this.changeStatus(row, '1')
    },
    disableRecord(row) {
      this.changeStatus(row, '0')
    },
    createUser() {
      this.$router.push('/createUser')
    },
    showDetailsPage(row){
      console.log("user ",JSON.stringify(row))
      localStorage.setItem("selectedRequest", JSON.stringify(row))
      this.$router.push('/viewRequestDetails')
    },
    changeStatus(row, status) {
      this.loading = true
      this.message = ''
      var url = env.apiUrl.baseUrl + env.apiUrl.user.editUser
      this.row = row
      axios
        .post(url, { status: status, id: this.row?.userId })
        .then((response) => {
          var data = response.data
          var responseCode = data.responseCode
          var responseMessage = data.responseMessage
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: responseMessage,
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
          // this.fetchUsers()
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during User Update',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
        })
        .finally(() => {
          this.loading = false
          this.showEnableModal = false
          this.showDisableModal = false
        })
    },
    fetchEquipmentRequests() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.equipment.getEquipmentRequests
      const token = localStorage.getItem('token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios
        .post(url, { page: 0, size: 10 })
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
          this.equipmentRequests = data.data
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching Equipment Requests',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' }
          })
        })
        .finally(() => {
          this.loading = false
        })
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
      <div class="col-sm-12">
        <div class="table-card">
          <!-- Table Header -->
          <div class="table-header">
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
                <h4 class="table-title">Equipment Requests</h4>
                <p class="table-subtitle">Manage equipment Requests and approvals</p>
              </div>
            </div>
            <div class="header-actions">
              <button v-if="canCreateUsers" class="action-btn action-btn-primary" @click="createUser">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>Create User</span>
              </button>
            </div>
            <div class="header-actions">
              <button class="action-btn action-btn-secondary" @click="exportToExcel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M5 21H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>

          <!-- Table Body -->
          <div class="table-body">
            <div class="table-responsive">
              <data-table v-if="tableReady" :data="equipmentRequests" :columns="columns" :isFooter="true" :striped="false" @enable="showEnableDialog" @disable="showDisableDialog" @edit="editUsers"  @view="showDetailsPage"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Enable User Modal -->
  <div v-if="showEnableModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Enable User</h5>
        <button class="modal-close-btn" @click="showEnableModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-icon success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="#2e547e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M22 4L12 14.01L9 11.01" stroke="#2e547e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="modal-question">Enable this user account?</p>
        <p class="modal-description">
          You are about to enable <strong>{{ row?.username }}</strong
          >. This will grant them access to the system.
        </p>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showEnableModal = false">Cancel</button>
        <button class="btn btn-confirm px-4" @click="enableRecord(row)"><i class="fas fa-check me-2"></i>Enable</button>
      </div>
    </div>
  </div>

  <!-- Disable User Modal -->
  <div v-if="showDisableModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-reject">
        <h5 class="modal-title text-white">Disable User</h5>
        <button class="modal-close-btn" @click="showDisableModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-icon danger">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#dc3545" stroke-width="2" />
            <path d="M15 9L9 15M9 9L15 15" stroke="#dc3545" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <p class="modal-question">Disable this user account?</p>
        <p class="modal-description">
          You are about to disable <strong>{{ row?.username }}</strong
          >. This will revoke their system access.
        </p>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showDisableModal = false">Cancel</button>
        <button class="btn btn-danger px-4" @click="disableRecord(row)"><i class="fas fa-times me-2"></i>Disable</button>
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

/* Table Card */
.table-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(46, 84, 126, 0.08);
  border: 2px solid rgba(46, 84, 126, 0.12);
  transition: all 0.3s ease;
  animation: slideInUp 0.4s ease-out;
}

.table-card:hover {
  box-shadow: 0 8px 24px rgba(46, 84, 126, 0.14);
  border-color: rgba(46, 84, 126, 0.22);
}

/* Table Header */
.table-header {
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
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.15), rgba(46, 84, 126, 0.08));
  color: #2e547e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.15);
}

.table-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a3352 0%, #2e547e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.table-subtitle {
  font-size: 14px;
  color: #2e547e;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Unified action button — two variants */
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn-primary {
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.9) 0%, rgba(46, 84, 126, 0.7) 50%, rgba(46, 84, 126, 0.5) 100%);
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.3);
}

.action-btn-primary:hover {
  background: linear-gradient(135deg, rgba(46, 84, 126, 1) 0%, rgba(46, 84, 126, 0.85) 50%, rgba(46, 84, 126, 0.7) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 84, 126, 0.4);
}

.action-btn-secondary {
  background: linear-gradient(135deg, rgba(61, 111, 168, 0.9) 0%, rgba(46, 84, 126, 0.75) 50%, rgba(46, 84, 126, 0.6) 100%);
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.25);
}

.action-btn-secondary:hover {
  background: linear-gradient(135deg, rgba(61, 111, 168, 1) 0%, rgba(46, 84, 126, 0.9) 50%, rgba(46, 84, 126, 0.75) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 84, 126, 0.35);
}

/* Filter / Export buttons */
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

/* Badge overrides */
:deep(.badge.bg-success) {
  background: linear-gradient(135deg, #2e547e, #1a3352) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(46, 84, 126, 0.2);
}

:deep(.badge.bg-danger) {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

:deep(.badge.bg-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

:deep(.badge.bg-dark) {
  background: linear-gradient(135deg, #4b5563, #374151) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(75, 85, 99, 0.2);
}

/* DataTable action buttons */
:deep(.dt-edit) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}
:deep(.dt-edit):hover {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* Enable button — blue instead of green */
:deep(.dt-enable) {
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.9) 0%, rgba(46, 84, 126, 0.7) 100%) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(46, 84, 126, 0.2);
}
:deep(.dt-enable):hover {
  background: linear-gradient(135deg, rgba(46, 84, 126, 1) 0%, rgba(46, 84, 126, 0.85) 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.35);
}

:deep(.dt-disable) {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}
:deep(.dt-disable):hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 20px;
}

.custom-modal {
  background: #fff;
  border-radius: 16px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 2px solid #eef4fb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
}

/* Enable modal header — blue */
.modal-header-approve {
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.9) 0%, rgba(46, 84, 126, 0.7) 50%, rgba(46, 84, 126, 0.5) 100%);
}

/* Disable modal header — red (kept as semantic danger) */
.modal-header-reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 32px 28px;
  text-align: center;
}

.modal-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.modal-icon.success svg {
  filter: drop-shadow(0 4px 12px rgba(46, 84, 126, 0.3));
}

.modal-icon.danger svg {
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
}

.modal-question {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.modal-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 0;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 2px solid #eef4fb;
  display: flex;
  gap: 12px;
}

/* Modal / form buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-outline-secondary {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}
.btn-outline-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Confirm (enable) button — blue */
.btn-confirm {
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.9) 0%, rgba(46, 84, 126, 0.7) 50%, rgba(46, 84, 126, 0.5) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.3);
}
.btn-confirm:hover {
  background: linear-gradient(135deg, rgba(46, 84, 126, 1) 0%, rgba(46, 84, 126, 0.85) 50%, rgba(46, 84, 126, 0.7) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 84, 126, 0.4);
}

/* Disable button — red (semantic) */
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
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

  .table-header {
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

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .table-body {
    padding: 16px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .table-title {
    font-size: 18px;
  }
  .header-icon {
    width: 44px;
    height: 44px;
  }
  .header-icon svg {
    width: 20px;
    height: 20px;
  }
  .modal-question {
    font-size: 16px;
  }
  .modal-description {
    font-size: 13px;
  }
}
</style>
