<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import store from '@/store'

export default {
  components: { AppLoader, DataTable },
  data() {
    return {
      tableReady: false,
      permissions: [],
      user: {},
      users: [],
      showApproveModal: false,
      showRejectModal: false,
      loading: false,
      comment: '',
      row: {}
    }
  },
  computed:{
    columns () {
      const canApproveUser = this.canApproveUsers;
      const cols = [
        { title: 'Name', data: 'username' },
        { title: 'Phone', data: 'phone' },
        { title: 'Email', data: 'email' },
        { title: 'Role', data: 'role.roleName' },
        { title: 'New Status', data: 'entityStatusName' },
        { title: 'Action', data: 'action' },
        {
          title: 'Status',
          data: 'status',
          render: function (data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Active</span>`
            if (id === 0) return `<span class="badge bg-danger ">Inactive</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            return data
          }
        },
      ]

      if(canApproveUser) {
        cols.push({
          title: 'Actions',
          data: null,
          orderable: false,
          searchable: false,
          render: function(data, type, row) {
            const approveDisabled = row.status.statusId === 6 ? '' : 'disabled'
            return `<button class="btn btn-sm btn-success me-1 dt-approve" data-id="${row.id}" ${approveDisabled}>Approve</button>
                   <button class="btn btn-sm btn-danger dt-reject" data-id="${row.id}" ${approveDisabled}>Reject</button>`
          }
        })
      }

      return cols;
    },
    canApproveUsers () {
      return this.hasPerm("APPROVE_USERS");
    },
  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.permissions = this.user?.usersPerm;
    this.tableReady = true;
    this.fetchUsers()
  },
  methods: {
    hasPerm (permission) {
      return this.permissions && this.permissions.includes(permission)
    },
    showApproveDialog(row) {
      this.comment = ''
      this.row = row
      this.showApproveModal = true
    },
    showRejectionDialog(row) {
      this.comment = ''
      this.row = row
      this.showRejectModal = true
    },

    approveRecord(row) {
      this.approveOrReject(row, 'APPROVE')
    },
    rejectRecord(row) {
      this.approveOrReject(row, 'REJECT')
    },

    approveOrReject(row, action) {
      console.log(action, row,"x")
      this.loading = true
      var url = env.apiUrl.baseUrl + env.apiUrl.approvals.approveEntity
      var ids = []
      ids.push(this.row?.id)

      axios
        .post(url, {
          ids: ids,
          action: action,
          description: this.comment,
          approvalType: 'USER'
        })
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
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2',
                cancelButton: 'btn btn-secondary px-4'
              }
            })
            console.log(this.responseMessage)
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
          console.log('User approved successfully  ')
          this.fetchUsers()
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'User Approval error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during User Approval',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2',
              cancelButton: 'btn btn-secondary px-4'
            }
          })
        })
        .finally(() => {
          this.loading = false
          if (action === 'APPROVE') {
            this.showApproveModal = false
          } else {
            this.showRejectModal = false
          }
        })
    },
    fetchUsers() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.user.getUserApprovals
      var statuses = [6];// Pending Status
      axios
        .post(url, {statuses:statuses, page: 0, size: 10 })
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
          this.users = data.data
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching Users',
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
      <div class="col-sm-12">
        <div class="table-card">
          <!-- Table Header -->
          <div class="table-header">
            <div class="header-content">
              <div class="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 11L19 13L23 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 class="table-title">User Approvals</h4>
                <p class="table-subtitle">Review and approve pending user requests</p>
              </div>
            </div>
<!--            <div class="table-actions">-->
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
<!--            </div>-->
          </div>

          <!-- Table Body -->
          <div class="table-body">
            <div class="table-responsive">
              <data-table
                v-if="tableReady"
                :data="users"
                :columns="columns"
                :isFooter="true"
                :striped="false"
                @approve="showApproveDialog"
                @reject="showRejectionDialog"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Approve Modal -->
  <div v-if="showApproveModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Approve User</h5>
        <button class="modal-close-btn" @click="showApproveModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-icon success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="modal-question">Approve this user?</p>
        <p class="modal-description">
          You are about to approve <strong>{{ row?.username }}</strong>. This user will gain access to the system.
        </p>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showApproveModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="approveRecord(row)">
          <i class="fas fa-check me-2"></i>Approve
        </button>
      </div>
    </div>
  </div>

  <!-- Reject Modal -->
  <div v-if="showRejectModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-reject">
        <h5 class="modal-title text-white">Reject User</h5>
        <button class="modal-close-btn" @click="showRejectModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-icon danger">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#dc3545" stroke-width="2"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="#dc3545" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="modal-question">Reject this user?</p>
        <p class="modal-description">
          You are about to reject <strong>{{ row?.username }}</strong>. Please provide a reason for rejection.
        </p>

        <div class="comment-section">
          <label for="rejectComment" class="comment-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Comments (Optional)
          </label>
          <textarea
            id="rejectComment"
            class="comment-textarea"
            v-model="comment"
            rows="3"
            placeholder="Explain why you're rejecting this user..."
          ></textarea>
        </div>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showRejectModal = false">Cancel</button>
        <button class="btn btn-danger px-4" @click="rejectRecord(row)">
          <i class="fas fa-times me-2"></i>Reject
        </button>
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

/* Table Card - Matching Dashboard Style */
.table-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  border: 2px solid rgba(16, 185, 129, 0.1);
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.2);
}

/* Table Header */
.table-header {
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
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.table-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.table-subtitle {
  font-size: 14px;
  color: #059669;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btn,
.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #fff;
  border: 2px solid #d1fae5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.export-btn:hover {
  background: #ecfdf5;
  border-color: #10b981;
  color: #047857;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.table-body {
  padding: 28px;
}

/* Custom Badge Styles */
:deep(.badge.bg-success) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
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

/* Action Buttons */
:deep(.dt-approve) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

:deep(.dt-approve):hover {
  background: linear-gradient(135deg, #059669, #047857) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

:deep(.dt-reject) {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

:deep(.dt-reject):hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  border-bottom: 2px solid #f0fdf4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-approve {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

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
  padding: 28px;
}

.modal-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.modal-icon.success svg {
  filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3));
}

.modal-icon.danger svg {
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
}

.modal-question {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 12px;
}

.modal-description {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 0;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 2px solid #f0fdf4;
  display: flex;
  gap: 12px;
}

/* Comment Section */
.comment-section {
  margin-top: 24px;
  text-align: left;
}

.comment-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.comment-label svg {
  stroke: #059669;
}

.comment-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
}

.comment-textarea:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  outline: none;
}

.comment-textarea::placeholder {
  color: #9ca3af;
}

/* Buttons */
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

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

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

/* Responsive Design */
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

  .table-actions {
    width: 100%;
  }

  .filter-btn,
  .export-btn {
    flex: 1;
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

  .modal-question {
    font-size: 16px;
  }

  .modal-description {
    font-size: 13px;
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

.table-card {
  animation: slideInUp 0.4s ease-out;
}
</style>
