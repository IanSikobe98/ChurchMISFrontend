<script setup>
import '@/assets/css/global.scss'
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/vue-fontawesome';
import '@fortawesome/fontawesome-svg-core';
</script>

<script>
import axios from 'axios';
import env from '../../environment/environment.js'
import config from '../../config/config.js'
import encryptText from "../../util/encryptor.js";

export default{
  data () {
    return {
      loading: false,
      username :'',
      password: '',
      responseMessage: '',
      displayError: false,
      errorMessage: '',
      isDisabled: false,
      showPassword: false
    }
  },
  computed: {},
  methods: {
    authenticate () {
      this.isDisabled = true;
      this.loading = true
      this.message = ''
      var url = env.apiUrl.baseUrl + env.apiUrl.auth.login
      console.log("url ",url)
      this.loading = true
      const encryptedUsername = encryptText(this.username.trim())
      const encryptedPassword = encryptText(this.password);
      axios.post(url, { username: this.username.trim(), password: encryptedPassword })
        .then(response => {
          var data = response.data
          var responseCode = data.responseCode;
          var responseMessage = data.responseMessage;
          if (responseCode === config.FAIL_RESPONSE_CODE) {
            this.responseMessage = responseMessage;
            this.errorMessage = responseMessage;
            console.log(this.responseMessage);
            this.displayError = true;
            return
          }

          console.log("Authentication Successful for " ,this.username)
          this.$store.commit('setUsername', encryptedUsername);
          this.$store.commit('setPassword' , encryptedPassword);
          localStorage.setItem('otpExpiry', data.otpExpiry);
          this.$router.push('/validateOtp');
        })
        .catch(error => {
          console.log('Error is ',error)
          if(error.response) {
            if (error.response.status === 403) {
              this.errorMessage = 'Invalid Credentials';
              console.log(this.errorMessage);
              this.displayError = true;
            } else {
              this.errorMessage = 'Authentication error';
              console.log(this.errorMessage);
              this.displayError = true;
            }
          }
          else{
            this.errorMessage = 'Authentication error';
            console.log(this.errorMessage);
            this.displayError = true;
          }
        }).finally(() => {
        this.loading = false;
        this.isDisabled = false;
      })
    },
    closeError(){
      this.displayError = false;
    },
    forgotPassword(){
      this.$router.push('/forgotPassword');
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false;
    }, 100);
  }
}
</script>

<template>
  <section class="login-content-enhanced">
    <b-row class="m-0 align-items-center h-100 g-0">
      <!-- Left Side - Login Form -->
      <b-col md="6" class="login-form-section">
        <div class="login-container">
          <b-row class="justify-content-center">
            <b-col md="10" lg="9" xl="8">
              <!-- Enhanced Login Card -->
              <div class="auth-card-enhanced">
                <!-- Logo Section -->
                <div class="logo-section">
                  <router-link to="/" class="logo-link">
                    <div class="logo-wrapper">
                      <img
                        class="logo-image"
                        src="@/assets/images/Kingdom-bank-logo.png"
                        alt="Kingdom Bank Logo"
                        width="280"
                        height="80"
                      />
                    </div>
                  </router-link>
                </div>

                <!-- Welcome Section -->
                <div class="welcome-section">
                  <h2 class="welcome-title">Welcome Back</h2>
                  <p class="welcome-subtitle">Sign in to access your forex Quote account</p>
                </div>

                <!-- Error Alert -->
                <transition name="slide-fade">
                  <div v-if="displayError" class="alert-enhanced alert-error">
                    <div class="alert-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <div class="alert-content">
                      <span class="alert-message">{{ errorMessage }}</span>
                    </div>
                    <button class="alert-close" @click="closeError" aria-label="Close alert">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>
                </transition>

                <!-- Login Form -->
                <form @submit.prevent="authenticate" class="login-form">
                  <div class="form-group-enhanced">
                    <label for="username" class="form-label-enhanced">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Username</span>
                    </label>
                    <div class="input-wrapper">
                      <input
                        type="text"
                        class="form-control-enhanced"
                        id="username"
                        v-model="username"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>

                  <div class="form-group-enhanced">
                    <label for="password" class="form-label-enhanced">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>Password</span>
                    </label>
                    <div class="input-wrapper password-wrapper">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control-enhanced"
                        id="password"
                        v-model="password"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="togglePassword"
                        aria-label="Toggle password visibility"
                      >
                        <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4C19 4 23 12 23 12S19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M1 1L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Forgot Password Link -->
<!--                  <div class="form-footer">-->
<!--                    <a href="#" @click.prevent="forgotPassword" class="forgot-link">-->
<!--                      Forgot password?-->
<!--                    </a>-->
<!--                  </div>-->

                  <!-- Submit Button -->
                  <div class="form-actions">
                    <button
                      type="submit"
                      class="btn-signin"
                      :disabled="isDisabled || loading"
                    >
                      <span v-if="!loading" class="btn-content">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Sign In</span>
                      </span>
                      <span v-else class="btn-loading">
                        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                          <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                        <span>Signing In...</span>
                      </span>
                    </button>
                  </div>
                </form>

                <!-- Security Notice -->
                <div class="security-notice">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Your connection is secure and encrypted</span>
                </div>
              </div>
            </b-col>
          </b-row>
        </div>
      </b-col>

      <!-- Right Side - Image/Brand Section -->
      <b-col md="6" class="d-none d-md-block brand-section">
        <div class="brand-content">
          <div class="brand-overlay"></div>
          <img
            src="../../assets/images/auth/green-auth.png"
            class="brand-image"
            alt="Kingdom Bank Forex Trading"
            loading="lazy"
          />
          <div class="brand-info">
            <h3 class="brand-title">Forex Quote</h3>
            <p class="brand-description">
              Access accurate FX Deals at branches within a matter of seconds.
            </p>
            <div class="brand-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Secure Platform</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Deal Code Generation </span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Award-winning Service</span>
              </div>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
  </section>
</template>

<style scoped>
/* Enhanced Login Page Styles */

/* Main Container */
.login-content-enhanced {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  overflow: hidden;
}

/* Left Section - Login Form */
.login-form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #ffffff;
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 1000px;
}

/* Enhanced Auth Card */
.auth-card-enhanced {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.08);
  border: 2px solid rgba(16, 185, 129, 0.1);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-link {
  display: inline-block;
  text-decoration: none;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.logo-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
}

.logo-image {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

/* Enhanced Alert */
.alert-enhanced {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  animation: shake 0.5s ease;
}

.alert-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fca5a5;
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: #dc2626;
}

.alert-content {
  flex: 1;
}

.alert-message {
  font-size: 14px;
  font-weight: 500;
  color: #991b1b;
}

.alert-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.alert-close:hover {
  background: rgba(220, 38, 38, 0.1);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Slide Fade Transition */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Enhanced Form */
.login-form {
  margin-bottom: 24px;
}

.form-group-enhanced {
  margin-bottom: 24px;
}

.form-label-enhanced {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.form-label-enhanced svg {
  stroke: #059669;
  flex-shrink: 0;
}

.input-wrapper {
  position: relative;
}

.form-control-enhanced {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.3s ease;
  background: #ffffff;
}

.form-control-enhanced:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  outline: none;
}

.form-control-enhanced::placeholder {
  color: #9ca3af;
}

/* Password Wrapper */
.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  background: #f3f4f6;
  color: #059669;
}

/* Form Footer */
.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.forgot-link {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.forgot-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.forgot-link:hover::after {
  width: 100%;
}

.forgot-link:hover {
  color: #047857;
}

/* Sign In Button */
.form-actions {
  margin-bottom: 24px;
}

.btn-signin {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-signin::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-signin:hover::before {
  width: 300px;
  height: 300px;
}

.btn-signin:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-signin:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-content,
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.btn-loading .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Security Notice */
.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 2px solid #d1fae5;
  border-radius: 10px;
  font-size: 13px;
  color: #047857;
  font-weight: 500;
}

.security-notice svg {
  stroke: #059669;
  flex-shrink: 0;
}

/* Right Section - Brand */
.brand-section {
  position: relative;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  overflow: hidden;
}

.brand-content {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 60px;
}

.brand-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(4, 120, 87, 0.95) 0%, rgba(5, 150, 105, 0.85) 100%);
  z-index: 1;
}

.brand-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
  animation: subtleZoom 20s ease-in-out infinite;
}

@keyframes subtleZoom {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.brand-info {
  position: relative;
  z-index: 2;
  color: white;
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.brand-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
  opacity: 0.95;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(8px);
}

.feature-item svg {
  stroke: white;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 991px) {
  .auth-card-enhanced {
    padding: 40px 32px;
  }

  .welcome-title {
    font-size: 24px;
  }
}

@media (max-width: 767px) {
  .login-form-section {
    padding: 30px 16px;
  }

  .auth-card-enhanced {
    padding: 32px 24px;
    border-radius: 20px;
  }

  .logo-wrapper {
    padding: 12px;
  }

  .logo-image {
    width: 220px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 575px) {
  .auth-card-enhanced {
    padding: 28px 20px;
  }

  .logo-image {
    width: 200px;
  }

  .btn-signin {
    padding: 14px 20px;
    font-size: 15px;
  }
}

/* Print Styles */
@media print {
  .brand-section {
    display: none;
  }
}
</style>
