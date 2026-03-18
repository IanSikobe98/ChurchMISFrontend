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
      userName: '',
      email: '',
      phone: '',
      role: '',
      roles: [],
      errors: {}
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
      var statuses = [];
      statuses.push(1)
      axios
        .post(url, { page: 0, size: 10 ,statuses:statuses})
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
    createUser() {
      if (!this.validateForm()) {
        console.log('Validation failed', this.errors)
        return
      }
      console.log('validation passed ')
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.user.createUser
      console.log('url ', url)
      const token = localStorage.getItem('token')
      console.log('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios
        .post(url, {
          userName: this.userName,
          phoneNumber: this.phone,
          email: this.email,
          roleId: this.role
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
          console.log('User created successfully  ', this.userName)
          this.$router.push('/viewUsers')
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'User Creation error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during User Creation',
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
      if (!this.userName) {
        this.errors.userName = 'UserName is required.'
      } else if (!config.TEXT_REGEX.test(this.userName) && !config.EMAIL_REGEX.test(this.userName)) {
        this.errors.userName = 'Invalid UserName Input'
      }

      if (!this.email) {
        this.errors.email = 'Email is required.'
      } else if (!config.EMAIL_REGEX.test(this.email)) {
        this.errors.email = 'Invalid email format.'
      }

      if (!this.phone) {
        this.errors.phone = 'Phone is required.'
      } else if (!config.PHONE_REGEX.test(this.phone)) {
        this.errors.phone = 'Invalid phone number format.'
      }

      if (!this.role) {
        this.errors.role = 'Role is required.'
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
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 class="form-title">Create New User</h4>
                <p class="form-subtitle">Add a new user to the system</p>
              </div>
            </div>
            <div class="header-actions">
              <button v-if="canViewUsers" class="view-users-btn" @click="viewUsers">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>View All Users</span>
              </button>
            </div>
          </div>

          <!-- Card Body -->
          <div class="form-card-body">
            <form @submit.prevent="createUser">
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
                  <p>All information provided will be used to create the user account.</p>
                </div>
              </div>

              <!-- Form Section: Basic Information -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h5 class="section-title">Basic Information</h5>
                </div>

                <div class="row g-4">
                  <!-- Username -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        Username <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <input
                          v-model="userName"
                          type="text"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.userName }"
                          placeholder="Enter username"
                        />
                      </div>
                      <small v-if="errors.userName" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.userName }}
                      </small>
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        Email Address <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <input
                          v-model="email"
                          type="email"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.email }"
                          placeholder="user@example.com"
                        />
                      </div>
                      <small v-if="errors.email" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.email }}
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
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h5 class="section-title">Contact & Access</h5>
                </div>

                <div class="row g-4">
                  <!-- Phone -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        Phone Number <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <input
                          v-model="phone"
                          type="tel"
                          class="form-control modern-input"
                          :class="{ 'is-invalid': errors.phone }"
                          placeholder="+254 712 345 678"
                        />
                      </div>
                      <small v-if="errors.phone" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.phone }}
                      </small>
                    </div>
                  </div>

                  <!-- Role -->
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-label">
                        User Role <span class="required">*</span>
                      </label>
                      <div class="input-wrapper">
                        <div class="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <select
                          v-model="role"
                          class="form-control modern-select"
                          :class="{ 'is-invalid': errors.role }"
                        >
                          <option value="">Select a role</option>
                          <option v-for="roleItem in roles" :key="roleItem.roleId" :value="roleItem.roleId">
                            {{ roleItem.roleName }}
                          </option>
                        </select>
                      </div>
                      <small v-if="errors.role" class="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ errors.role }}
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
                <button v-if="canCreateUsers" type="submit" class="btn btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Create User</span>
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

.btn-primary:active {
  transform: translateY(0);
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
