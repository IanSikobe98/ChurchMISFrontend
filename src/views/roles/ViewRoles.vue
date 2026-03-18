<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import updateUser from '@/views/user/UpdateUser.vue'
import '@/assets/css/global.scss'
import store from '@/store'

export default {
  computed: {
    updateUser() {
      return updateUser
    },

    canCreateRoles () {
      return this.hasPerm("CREATE_ROLES");
    },

    columns() {
      const canUpdateRole = this.canUpdateRoles
      return [
        { title: 'Name', data: 'roleName' },
        { title: 'Description', data: 'roleDescription' },
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
        {
          title: 'Actions',
          data: null,
          orderable: false,
          searchable: false,
          render: function (data, type, row) {
            const activeDisabled = row.status.statusId === 0 ? '' : 'disabled'
            const inactiveDisabled = row.status.statusId === 1 ? '' : 'disabled'

            var actions = `<button class="btn btn-sm btn-dark me-1 dt-view" data-id="${row.id}">View</button>`
            if (canUpdateRole) {
              actions += `
    <button class="btn btn-sm btn-warning me-1 dt-edit" data-id="${row.id}">Edit</button>
    <button class="btn btn-sm btn-success me-1 dt-enable" data-id="${row.id}" ${activeDisabled}>Enable</button>
    <button class="btn btn-sm btn-danger me-1 dt-disable" data-id="${row.id}" ${inactiveDisabled}>Disable</button>`
            }
            return actions
          }
        }
      ]
    },
    canUpdateRoles() {
      return this.hasPerm('UPDATE_ROLES')
    },
    groupedPermissions() {
      if (!this.row?.privilegeList || !Array.isArray(this.row.privilegeList)) return {};

      const groups = {};
      this.row.privilegeList.forEach(perm => {
        // Handle both possible data structures
        const permissionName = perm.permission || perm.privilegeName || perm;
        const category = this.getPermissionCategory(permissionName);
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(permissionName);
      });
      return groups;
    }
  },
  components: { AppLoader, DataTable },
  data() {
    return {
      tableReady: false,
      loggedInPermissions: [],
      user: {},
      roles: [],
      showEnableModal: false,
      showDisableModal: false,
      showDetailsModal: false,
      loading: false,
      comment: '',
      row: {}
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user)
    this.loggedInPermissions = this.user?.usersPerm
    this.tableReady = true
    this.fetchRoles()
  },
  methods: {
    createRoles(){
      this.$router.push('/createRoles');
    },
    hasPerm(permission) {
      return this.loggedInPermissions && this.loggedInPermissions.includes(permission)
    },
    getPermissionCategory(permissionName) {
      if (permissionName.includes('USER')) return 'User Management';
      if (permissionName.includes('ROLE')) return 'Role Management';
      if (permissionName.includes('DEAL')) return 'Deal Management';
      if (permissionName.includes('APPROVE')) return 'Approvals';
      if (permissionName.includes('REPORT')) return 'Reports';
      return 'General';
    },
    getCategoryIcon(category) {
      const icons = {
        'User Management': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Role Management': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Deal Management': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Approvals': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Reports': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'General': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>'
      };
      return icons[category] || icons['General'];
    },
    editUsers(item) {
      console.log('role ', JSON.stringify(item))
      localStorage.setItem('selectedRole', JSON.stringify(item))
      this.$router.push('/updateRole')
    },
    showEnableDialog(row) {
      this.comment = ''
      this.row = row
      this.showEnableModal = true
    },

    showDetailsDialog(row) {
      this.comment = ''
      this.row = row
      console.log('Role data:', row)
      console.log('Privilege list:', row.privilegeList)
      this.showDetailsModal = true
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
    changeStatus(row, status) {
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.roles.editRole
      console.log('status', url)
      console.log('row ', url)
      this.row = row
      axios
        .post(url, {
          status: status,
          id: this.row?.roleId
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
          console.log('Role Update Request created successfully  ', this.userName)
          this.fetchRoles()
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'Role Update error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during Role Update',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2',
              cancelButton: 'btn btn-secondary px-4'
            }
          })
        })
        .finally(() => {
          this.loading = false
          this.showEnableModal = false
          this.showDisableModal = false
        })
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
            text: 'Error occurred fetching Roles',
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
                  <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 class="table-title">System Roles</h4>
                <p class="table-subtitle">Manage roles and their permissions</p>
              </div>
            </div>
            <div class="header-actions">
              <button v-if="canCreateRoles" class="create-roles-btn" @click="createRoles">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Create Role</span>
              </button>
            </div>
          </div>

          <!-- Table Body -->
          <div class="table-body">
            <div class="table-responsive">
              <data-table
                v-if="tableReady"
                :data="roles"
                :columns="columns"
                :isFooter="true"
                :striped="false"
                @enable="showEnableDialog"
                @disable="showDisableDialog"
                @edit="editUsers"
                @view="showDetailsDialog"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Enable Role Modal -->
  <div v-if="showEnableModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Enable Role</h5>
        <button class="modal-close-btn" @click="showEnableModal = false">
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
        <p class="modal-question">Enable this role?</p>
        <p class="modal-description">
          You are about to enable <strong>{{ row?.roleName }}</strong>. Users assigned to this role will have access based on its permissions.
        </p>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showEnableModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="enableRecord(row)">
          <i class="fas fa-check me-2"></i>Enable
        </button>
      </div>
    </div>
  </div>

  <!-- Disable Role Modal -->
  <div v-if="showDisableModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-reject">
        <h5 class="modal-title text-white">Disable Role</h5>
        <button class="modal-close-btn" @click="showDisableModal = false">
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
        <p class="modal-question">Disable this role?</p>
        <p class="modal-description">
          You are about to disable <strong>{{ row?.roleName }}</strong>. This will affect users currently assigned to this role.
        </p>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showDisableModal = false">Cancel</button>
        <button class="btn btn-danger px-4" @click="disableRecord(row)">
          <i class="fas fa-times me-2"></i>Disable
        </button>
      </div>
    </div>
  </div>

  <!-- View Role Details Modal -->
  <div v-if="showDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-lg">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Role Details</h5>
        <button class="modal-close-btn" @click="showDetailsModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <!-- Role Info Card -->
        <div class="role-info-card">
          <div class="role-header-section">
            <div class="role-icon-large">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 class="role-name">{{ row.roleName }}</h3>
              <p class="role-description">{{ row.roleDescription }}</p>
            </div>
          </div>

          <!-- Permissions Section -->
          <div class="permissions-section">
            <div class="permissions-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h6>Assigned Permissions</h6>
              <span class="permission-count">{{ row.privilegeList?.length || 0 }} permission{{ (row.privilegeList?.length !== 1) ? 's' : '' }}</span>
            </div>

            <!-- No Permissions Message -->
            <div v-if="!row.privilegeList || row.privilegeList.length === 0" class="no-permissions">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p>No permissions assigned to this role</p>
            </div>

            <!-- Grouped Permissions -->
            <div v-else class="permission-groups">
              <div
                v-for="(perms, category) in groupedPermissions"
                :key="category"
                class="permission-category"
              >
                <div class="category-header">
                  <div class="category-icon" v-html="getCategoryIcon(category)"></div>
                  <span class="category-name">{{ category }}</span>
                  <span class="category-badge">{{ perms.length }}</span>
                </div>
                <div class="category-permissions">
                  <div
                    v-for="(perm, index) in perms"
                    :key="index"
                    class="permission-badge"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{{ perm }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4" @click="showDetailsModal = false">
          <i class="fas fa-times me-2"></i>Close
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

.create-roles-btn {
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

.create-roles-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
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
:deep(.dt-view) {
  background: linear-gradient(135deg, #4b5563, #374151) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(75, 85, 99, 0.2);
}

:deep(.dt-view):hover {
  background: linear-gradient(135deg, #374151, #1f2937) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 85, 99, 0.3);
}

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

:deep(.dt-enable) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

:deep(.dt-enable):hover {
  background: linear-gradient(135deg, #059669, #047857) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
  overflow-y: auto;
}

.custom-modal {
  background: #fff;
  border-radius: 16px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-lg {
  width: 800px;
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

/* Role Info Card */
.role-info-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border: 2px solid #d1fae5;
  border-radius: 16px;
  padding: 24px;
}

.role-header-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 2px solid #d1fae5;
  margin-bottom: 24px;
}

.role-icon-large {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.role-name {
  font-size: 24px;
  font-weight: 700;
  color: #064e3b;
  margin-bottom: 6px;
}

.role-description {
  font-size: 14px;
  color: #059669;
  margin: 0;
}

/* Permissions Section */
.permissions-section {
  margin-top: 24px;
}

.permissions-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.permissions-header svg {
  color: #059669;
}

.permissions-header h6 {
  font-size: 16px;
  font-weight: 700;
  color: #064e3b;
  margin: 0;
  flex: 1;
}

.permission-count {
  padding: 4px 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

/* Permission Groups */
.permission-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-permissions {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  color: #6b7280;
}

.no-permissions svg {
  stroke: #9ca3af;
  margin-bottom: 16px;
}

.no-permissions p {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.permission-category {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.permission-category:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-bottom: 2px solid #e5e7eb;
}

.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-name {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  flex: 1;
}

.category-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.category-permissions {
  padding: 16px 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 2px solid #10b981;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #064e3b;
  transition: all 0.2s ease;
}

.permission-badge:hover {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.permission-badge svg {
  stroke: #059669;
  flex-shrink: 0;
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

  .modal-lg {
    width: 95%;
  }

  .role-header-section {
    flex-direction: column;
    align-items: flex-start;
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

  .role-name {
    font-size: 20px;
  }

  .role-icon-large {
    width: 56px;
    height: 56px;
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
