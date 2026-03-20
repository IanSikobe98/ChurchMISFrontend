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
// import encryptText from "../../util/encryptor.js";
import Swal from 'sweetalert2'
import store from "@/store";
import decryptText from "../../util/decryptor.js";

export default{
  data () {
    return {
      loading: false,
      username: '',
      password: '',
      responseMessage: '',
      otp: ['', '', '', '', ''],
      displayError: false,
      errorMessage: '',
      resendTimer: 60,
      canResend: false,
      timerInterval: null,
      otpExpiry: null
    }
  },
  computed: {},
  methods: {
    moveToNext(index) {
      // Move to the next input if a digit is entered
      if (this.otp[index].length === 1 && index < 4) {
        this.$nextTick(() => {
          this.$refs[`otp${index + 1}`][0].focus();
        });
      }

      // Move to the previous input on backspace
      if (this.otp[index].length === 0 && index > 0) {
        this.$nextTick(() => {
          this.$refs[`otp${index - 1}`][0].focus();
        });
      }
      if(index === 4){
        this.checkOtpCompletion()
      }
    },

    handleKeyDown(event, index) {
      if (event.key === 'Backspace' && this.otp[index].length === 0 && index > 0) {
        event.preventDefault();
        this.otp[index - 1] = '';
        this.$nextTick(() => {
          this.$refs[`otp${index - 1}`][0].focus();
        });
      }
    },

    handlePaste(event) {
      event.preventDefault();
      const pastedData = event.clipboardData.getData('text').slice(0, 5);
      const digits = pastedData.split('').filter(char => /\d/.test(char));

      digits.forEach((digit, index) => {
        if (index < 5) {
          this.otp[index] = digit;
        }
      });

      if (digits.length === 5) {
        this.$refs.otp4[0].focus();
        this.checkOtpCompletion();
      }
    },

    checkOtpCompletion() {
      if (this.otp.every(digit => digit.length === 1)) {
        this.submitOtp();
      }
    },

    submitOtp() {
      this.loading = true;
      const otpValue = this.otp.join('');
      console.log('otp is ', otpValue)

      this.message = ''
      var url = env.apiUrl.baseUrl + env.apiUrl.auth.validateOtp
      console.log("url ", url)

      var encryptedUsername = store.state.username
      this.username = decryptText(encryptedUsername);
      this.password = store.state.password;

      axios.post(url, { username: this.username.trim(), password: this.password, otp: otpValue })
        .then(response => {
          var data = response.data
          var responseCode = data.responseCode;
          var responseMessage = data.responseMessage;
          if (responseCode === config.FAIL_RESPONSE_CODE) {
            this.responseMessage = responseMessage;
            this.errorMessage = responseMessage;
            console.log(this.responseMessage);
            this.displayError = true;
            this.clearOtp();
            return
          }

          console.log("Authentication Successful for ", this.username)
          var token = data.token;
          var user = data.user;
          console.log("user", user)
          this.$store.commit('setToken', token);
          this.$store.commit('setUser', JSON.stringify(user));
          this.$store.commit('clearOtpState');
          localStorage.removeItem('otpExpiry');
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: responseMessage,
            timer: 3000,
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2',
              cancelButton: 'btn btn-secondary px-4'
            }
          });
          this.$router.push('/');
        })
        .catch(error => {
          console.log('Error is ', error)
          this.errorMessage = 'Authentication error';
          console.log(this.errorMessage);
          this.displayError = true;
          this.clearOtp();
        })
        .finally(() => {
          this.loading = false;
        })
    },

    clearOtp() {
      this.otp = ['', '', '', '', ''];
      this.$nextTick(() => {
        this.$refs.otp0[0].focus();
      });
    },

    closeError() {
      this.displayError = false;
    },

    startResendTimer() {
      this.canResend = false;
      this.resendTimer = 60;

      this.timerInterval = setInterval(() => {
        this.resendTimer--;
        if (this.resendTimer <= 0) {
          this.canResend = true;
          clearInterval(this.timerInterval);
        }
      }, 1000);
    },

    resendOtp() {
      if (!this.canResend) return;

      console.log('Resending OTP...');
      this.startResendTimer();
      this.clearOtp();

      Swal.fire({
        icon: 'info',
        title: 'OTP Sent',
        text: 'A new OTP has been sent to your registered device',
        timer: 2000,
        customClass: {
          confirmButton: 'btn btn-success px-4 me-2'
        }
      });
    },

    backToSignIn() {
      this.$store.commit('clearOtpState');
      this.$router.push('/auth/sign-in');
    }
  },

  mounted() {
    setTimeout(() => {
      this.loading = false;
      this.$refs.otp0[0].focus();
    }, 100);

    this.startResendTimer();
    this.otpExpiry = localStorage.getItem('otpExpiry');
  },

  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
</script>

<template>
  <section class="otp-content-enhanced">
    <b-row class="m-0 align-items-center h-100 g-0">
      <!-- Left Side - OTP Form -->
      <b-col md="6" class="otp-form-section">
        <div class="otp-container-wrapper">
          <b-row class="justify-content-center">
            <b-col md="10" lg="9" xl="8">
              <!-- Enhanced OTP Card -->
              <div class="auth-card-enhanced">
                <!-- Logo Section -->
                <div class="logo-section">
                  <router-link to="/" class="logo-link">
                    <div class="logo-wrapper">
                      <img
                        class="logo-image"
                        src="@/assets/images/adventist_logo.png"
                        alt="Kingdom Bank Logo"
                        width="280"
                        height="80"
                      />
                    </div>
                  </router-link>
                </div>

                <!-- Welcome Section -->
                <div class="welcome-section">
                  <h2 class="welcome-title">Verify Your Identity</h2>
                  <p class="welcome-subtitle">
                    Enter the 5-digit code sent to your registered device
                  </p>
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

                <!-- OTP Input Section -->
                <div class="otp-input-section">
                  <div class="otp-inputs-wrapper" @paste="handlePaste">
                    <input
                      v-for="(digit, index) in otp"
                      :key="index"
                      :ref="`otp${index}`"
                      type="text"
                      inputmode="numeric"
                      maxlength="1"
                      v-model="otp[index]"
                      @input="moveToNext(index)"
                      @keydown="handleKeyDown($event, index)"
                      class="otp-input-enhanced"
                      :class="{ 'filled': otp[index] !== '' }"
                      pattern="[0-9]"
                    />
                  </div>

                  <!-- Loading Indicator -->
                  <transition name="fade">
                    <div v-if="loading" class="loading-indicator">
                      <svg class="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                        <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                      </svg>
                      <span>Verifying...</span>
                    </div>
                  </transition>
                </div>

                <!-- Resend Section -->
                <!--                <div class="resend-section">-->
                <!--                  <p class="resend-text">Didn't receive the code?</p>-->
                <!--                  <button-->
                <!--                    class="resend-btn"-->
                <!--                    :class="{ 'disabled': !canResend }"-->
                <!--                    :disabled="!canResend"-->
                <!--                    @click="resendOtp"-->
                <!--                  >-->
                <!--                    <svg v-if="canResend" width="16" height="16" viewBox="0 0 24 24" fill="none">-->
                <!--                      <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
                <!--                      <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
                <!--                      <path d="M20.49 9C19.9828 7.56678 19.1209 6.28536 17.9845 5.27542C16.8482 4.26548 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7345 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
                <!--                    </svg>-->
                <!--                    <span v-if="canResend">Resend Code</span>-->
                <!--                    <span v-else>Resend in {{ resendTimer }}s</span>-->
                <!--                  </button>-->
                <!--                </div>-->

                <!-- Back to Sign In -->
                <div class="back-section">
                  <button class="back-btn" @click="backToSignIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Back to Sign In</span>
                  </button>
                </div>

                <!-- Security Notice -->
                <div class="security-notice">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>This code expires in {{ otpExpiry }} minutes</span>
                </div>
              </div>
            </b-col>
          </b-row>
        </div>
      </b-col>

      <!-- Right Side - Brand Section -->
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
            <h3 class="brand-title">Secure Verification</h3>
            <p class="brand-description">
              Two-factor authentication ensures your account remains protected with an additional layer of security.
            </p>
            <div class="brand-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Bank-level Security</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Encrypted Transmission</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Verified Access</span>
              </div>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
  </section>
</template>

<style scoped>
/* OTP Page Styles — Blue Theme: rgba(46, 84, 126) */

/* Main Container */
.otp-content-enhanced {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4f9 0%, #ffffff 100%);
  overflow: hidden;
}

/* Left Section - OTP Form */
.otp-form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #ffffff;
  position: relative;
}

.otp-container-wrapper {
  width: 100%;
  max-width: 1000px;
}

/* Enhanced Auth Card */
.auth-card-enhanced {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 10px 40px rgba(46, 84, 126, 0.1);
  border: 2px solid rgba(46, 84, 126, 0.12);
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
  background: linear-gradient(135deg, #eef4fb 0%, #e4eff8 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.logo-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(46, 84, 126, 0.18);
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
  background: linear-gradient(135deg, #1a3352 0%, #2e547e 100%);
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
  line-height: 1.5;
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
.slide-fade-enter-active, .slide-fade-leave-active {
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

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* OTP Input Section */
.otp-input-section {
  margin-bottom: 32px;
}

.otp-inputs-wrapper {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.otp-input-enhanced {
  width: 56px;
  height: 64px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  transition: all 0.3s ease;
  background: #ffffff;
  caret-color: #2e547e;
}

.otp-input-enhanced:focus {
  border-color: #2e547e;
  box-shadow: 0 0 0 4px rgba(46, 84, 126, 0.1);
  outline: none;
  transform: scale(1.05);
}

.otp-input-enhanced.filled {
  border-color: #2e547e;
  background: linear-gradient(135deg, #eef4fb 0%, #e4eff8 100%);
}

.otp-input-enhanced::placeholder {
  color: #d1d5db;
}

/* Loading Indicator */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, #eef4fb 0%, #e4eff8 100%);
  border: 2px solid rgba(46, 84, 126, 0.18);
  border-radius: 12px;
  color: #1a3352;
  font-size: 14px;
  font-weight: 600;
}

.loading-indicator .spinner {
  animation: spin 1s linear infinite;
  stroke: #2e547e;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Resend Section */
.resend-section {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid #eef4fb;
}

.resend-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.resend-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9) 0%,
    rgba(46, 84, 126, 0.7) 50%,
    rgba(46, 84, 126, 0.5) 100%
  );
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.25);
}

.resend-btn:hover:not(.disabled) {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 1) 0%,
    rgba(46, 84, 126, 0.85) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 84, 126, 0.35);
}

.resend-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.resend-btn svg {
  flex-shrink: 0;
}

/* Back Section */
.back-section {
  text-align: center;
  margin-bottom: 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #eef4fb;
  border-color: rgba(46, 84, 126, 0.25);
  color: #2e547e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 84, 126, 0.1);
}

.back-btn svg {
  flex-shrink: 0;
}

/* Security Notice */
.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #eef4fb 0%, #e4eff8 100%);
  border: 2px solid rgba(46, 84, 126, 0.18);
  border-radius: 10px;
  font-size: 13px;
  color: #1a3352;
  font-weight: 500;
}

.security-notice svg {
  stroke: #2e547e;
  flex-shrink: 0;
}

/* Right Section - Brand */
.brand-section {
  position: relative;
  background: linear-gradient(135deg, #1a3352 0%, #2e547e 100%);
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
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9) 0%,
    rgba(46, 84, 126, 0.7) 50%,
    rgba(46, 84, 126, 0.5) 100%
  );
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
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.32);
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

  .otp-input-enhanced {
    width: 52px;
    height: 60px;
    font-size: 22px;
  }
}

@media (max-width: 767px) {
  .otp-form-section {
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

  .otp-inputs-wrapper {
    gap: 8px;
  }

  .otp-input-enhanced {
    width: 48px;
    height: 56px;
    font-size: 20px;
  }
}

@media (max-width: 575px) {
  .auth-card-enhanced {
    padding: 28px 20px;
  }

  .logo-image {
    width: 200px;
  }

  .otp-inputs-wrapper {
    gap: 6px;
  }

  .otp-input-enhanced {
    width: 44px;
    height: 52px;
    font-size: 18px;
  }
}

/* Print Styles */
@media print {
  .brand-section {
    display: none;
  }
}
</style>
