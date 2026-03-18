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
      loggedInPermissions: [],
      user: {},
      loading: false,
      roleName:'',
      roleDescription:'',
      role: '',
      permissions: [],
      selectedPermissions: [],
      errors: {},
      roleToEdit:{},
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.loggedInPermissions = this.user?.usersPerm;
    this.fetchPermissions();
    var jsonData = localStorage.getItem("selectedRole")
    console.log("Component mounted2.", jsonData);
    if (jsonData) {
      try {
        this.roleToEdit = JSON.parse(jsonData);
        console.log("Parsed Data: ", this.roleToEdit);
        this.setFormData();
        this.fetchPermissions();
      } catch (error) {
        console.error("Error parsing JSON data: ", error);
      }
    }
  },
  computed: {
    canUpdateRoles () {
      return this.hasPerm("UPDATE_ROLES");
    },
    canViewRoles () {
      return this.hasPerm("VIEW_ROLES");
    },
    groupedPermissions() {
      const groups = {};
      this.permissions.forEach(permission => {
        const category = this.getPermissionCategory(permission.privilegeName);
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(permission);
      });
      return groups;
    }
  },
  methods: {
    hasPerm (permission) {
      return this.loggedInPermissions && this.loggedInPermissions.includes(permission)
    },
    setFormData() {
      this.roleName = this.roleToEdit.roleName;
      this.roleDescription = this.roleToEdit.roleDescription;
      var permissionsArray = this.roleToEdit?.privilegeList;
      permissionsArray.forEach((permission) => {
        this.selectedPermissions.push(permission.id);
      })
    },
    viewRoles(){
      this.$router.push('/viewRoles');
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
        'User Management': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Role Management': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Deal Management': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Approvals': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Reports': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'General': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      };
      return icons[category] || icons['General'];
    },
    selectAll(category) {
      const categoryPerms = this.groupedPermissions[category];
      const allSelected = categoryPerms.every(p => this.selectedPermissions.includes(p.privilegeId));

      if (allSelected) {
        categoryPerms.forEach(p => {
          const index = this.selectedPermissions.indexOf(p.privilegeId);
          if (index > -1) {
            this.selectedPermissions.splice(index, 1);
          }
        });
      } else {
        categoryPerms.forEach(p => {
          if (!this.selectedPermissions.includes(p.privilegeId)) {
            this.selectedPermissions.push(p.privilegeId);
          }
        });
      }
    },
    isCategorySelected(category) {
      const categoryPerms = this.groupedPermissions[category];
      return categoryPerms.every(p => this.selectedPermissions.includes(p.privilegeId));
    },
    fetchPermissions() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.permissions.getPermissions

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
          this.permissions = data.data
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching permissions',
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
    editRole() {
      if (!this.validateForm()) {
        console.log('Validation failed', this.errors)
        return
      }
      console.log('validation passed ')
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.roles.editRole
      console.log('url ', url)

      axios
        .post(url, {
          name: this.roleName,
          description: this.roleDescription,
          permissions: this.selectedPermissions,
          id: this.roleToEdit?.roleId
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
          console.log('Role updated successfully  ', this.userName)
          this.$router.push('/viewRoles')
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
        })
    },
    validateForm() {
      this.errors = {}
      if (!this.roleName) {
        this.errors.roleName = "Role Name is required.";
      }
      if (!this.roleDescription) {
        this.errors.roleDescription = "Role Description is required.";
      }

      if(this.selectedPermissions.length === 0){
        this.errors.selectedPermissions = "Please select at least one Permission for the Role";
      }

      if (Object.keys(this.errors).length > 0) {
        return false
      }
      return true
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
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 class="form-title">Update Role</h4>
                <p class="form-subtitle">Modify role details and permissions</p>
              </div>
            </div>
            <div class="header-actions">
              <button v-if="canViewRoles" class="view-roles-btn" @click="viewRoles">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12S5 4 12 4C19 4 23 12 23 12S19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>View All Roles</span>
              </button>
            </div>
          </div>

          <!-- Card Body -->
          <div class="form-card-body">
            <form @submit.prevent="editRole">
              <!-- Info Banner -->
              <div class="info-banner">
                <div class="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="info-text">
                  <strong>Updating Role: {{ roleToEdit.roleName }}</strong>
                  <p>Modify role information and adjust permissions as needed.</p>
                </div>
              </div>

              <!-- Form Section: Role Details -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h5 class="section-title">Role Details</h5>
                </div>

                <div class="row g-4">
                  <!-- Role Name -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        Role Name <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <input
                          v-model="roleName"
                          type="text"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.roleName }"
                          placeholder="e.g., Administrator, Manager, Agent"
                        />
                      </div>
                      <small v-if="errors.roleName" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.roleName }}
                      </small>
                    </div>
                  </div>

                  <!-- Role Description -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        Role Description <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <input
                          v-model="roleDescription"
                          type="text"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.roleDescription }"
                          placeholder="Brief description of role responsibilities"
                        />
                      </div>
                      <small v-if="errors.roleDescription" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.roleDescription }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Permissions Section -->
              <div class="form-section permissions-section" v-if="permissions.length !== 0">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h5 class="section-title">Permissions <span class="required">*</span></h5>
                    <p class="section-description">Update the permissions for this role</p>
                  </div>
                </div>

                <!-- Permission Groups -->
                <div class="permissions-grid">
                  <div
                    v-for="(perms, category) in groupedPermissions"
                    :key="category"
                    class="permission-group"
                  >
                    <!-- Group Header -->
                    <div class="group-header">
                      <div class="group-info">
                        <div class="group-icon" v-html="getCategoryIcon(category)"></div>
                        <div>
                          <h6 class="group-title">{{ category }}</h6>
                          <p class="group-count">{{ perms.length }} permission{{ perms.length !== 1 ? 's' : '' }}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="select-all-btn"
                        :class="{ 'active': isCategorySelected(category) }"
                        @click="selectAll(category)"
                      >
                        {{ isCategorySelected(category) ? 'Deselect All' : 'Select All' }}
                      </button>
                    </div>

                    <!-- Permissions List -->
                    <div class="permissions-list">
                      <label
                        v-for="permission in perms"
                        :key="permission.privilegeId"
                        class="permission-item"
                        :class="{ 'checked': selectedPermissions.includes(permission.privilegeId) }"
                      >
                        <input
                          type="checkbox"
                          :value="permission.privilegeId"
                          v-model="selectedPermissions"
                          class="permission-checkbox"
                        />
                        <div class="permission-checkmark">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <span class="permission-name">{{ permission.privilegeName }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <small v-if="errors.selectedPermissions" class="error-message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  {{ errors.selectedPermissions }}
                </small>

                <!-- Selected Count Badge -->
                <div class="selected-badge" v-if="selectedPermissions.length > 0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ selectedPermissions.length }} permission{{ selectedPermissions.length !== 1 ? 's' : '' }} selected</span>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="$router.push('/viewRoles')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Cancel</span>
                </button>
                <button v-if="canUpdateRoles" type="submit" class="btn btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Update Role</span>
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
/* Copy all the styles from CreateRole.vue - they are identical */
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

.view-roles-btn {
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

.view-roles-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Card Body */
.form-card-body {
  padding: 32px 28px;
}

/* Info Banner - Yellow for Edit mode */
.info-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
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
  background: linear-gradient(135deg, #f59e0b, #d97706);
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
  color: #78350f;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.info-text p {
  color: #92400e;
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

.section-description {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0 0;
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
.modern-input {
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

.modern-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  outline: none;
}

.modern-input:focus + .input-icon {
  color: #10b981;
}

.modern-input::placeholder {
  color: #9ca3af;
}

.modern-input.is-invalid {
  border-color: #ef4444;
}

.modern-input.is-invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
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

/* Permissions Section */
.permissions-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-color: #d1fae5;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.permission-group {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.permission-group:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.group-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.group-count {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.select-all-btn {
  padding: 6px 12px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-all-btn:hover {
  border-color: #10b981;
  color: #059669;
  background: #f0fdf4;
}

.select-all-btn.active {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
}

.permissions-list {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.permission-item:hover {
  background: #f0fdf4;
  border-color: #d1fae5;
}

.permission-item.checked {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.permission-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.permission-checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.permission-checkmark svg {
  stroke: white;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s ease;
}

.permission-item.checked .permission-checkmark {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
}

.permission-item.checked .permission-checkmark svg {
  opacity: 1;
  transform: scale(1);
}

.permission-name {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  flex: 1;
}

.permission-item.checked .permission-name {
  color: #064e3b;
  font-weight: 600;
}

/* Selected Badge */
.selected-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.selected-badge svg {
  stroke: white;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0fdf4;
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

  .view-roles-btn {
    width: 100%;
    justify-content: center;
  }

  .form-card-body {
    padding: 24px 20px;
  }

  .form-section {
    padding: 20px;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
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
