<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import updateUser from '@/views/user/UpdateUser.vue'
import store from '@/store'

export default {

  components: { AppLoader, DataTable },
  data() {
    return {
      tableReady: false,
      permissions: [],
      user: {},
      accounts: [],
      accountInfo:{},
      customerInfo: {},
      users: [],
      dealRequests:[],
      showEnableModal: false,
      showDisableModal: false,
      showCreateDealModal: false,
      showCustomerModal: false,
      showTellerModal: false,
      showCustomerDetailsModal: false,
      showTellerDetailsModal: false,
      showCreateRFQModal: false,
      showApproveModal: false,
      showRejectModal: false,
      loading: false,
      comment: '',
      rfqComment: '',
      currency: '',
      selectedAccount: '',
      purpose: '',
      valueDate: '',
      bankDirection: '',
      amount: '',
      action: '',
      negotiatedRate:'',
      errors: {},
      idType: '',
      idNumber: '',
      idNumberValue: '',
      idTypeValue: '',
      rateFrom: '',
      multiplyDivide:'',
      rateTo: '',
      rateValue: '',
      expectedValue: '',
      sourceAccCurrency: '',
      useCurrentRate:true,
      isCustomer:false,
      useNegotiatedRate:false,
      showDealDetailsModal:false,
      options: [
        { id: 'COR', name: 'Certificate of Registration' },
        { id: 'NATID', name: 'National id' },
        { id: 'ACCNO', name: 'Account Number' }
      ],
      filteredCurrencyOptions:[],
      currencyOptions: [
        { id: 'USD', name: 'United States Dollar' },
        { id: 'KES', name: 'Kenyan Shilling' },
        { id: 'EUR', name: 'Euro' },
        { id: 'GBP', name: 'British Pound Sterling' },
        { id: 'ZAR', name: 'South African Rand' },
        { id: 'RWF', name: 'Rwandan Franc' },
      ],
      row: {}
    }
  },
  computed: {
    columns() {
      const canApprove = this.canApproveDealCodeRequests;

      const cols = [
        { title: 'Customer Name', data: 'customerName' },
        { title: 'Account Number', data: 'accountNumber' },
        { title: 'Amount',
          data: null,
        render : function(data,type,row){
          return `${row.fromCurrency} ${row.counterNominalAmount}`
        }
        },
        { title: 'Currency Pair', data: 'currencyPair' },
        { title: 'Bank direction', data: null ,
        render: function(row){
          return `${row.buySell}  ${row.fromCurrency}`
        }
        },
        {
          title: 'Request Date', data: 'requestDate',
          render: function(data) {
            var a = new Date(data)
            return a.toISOString().split('T')[0]
          }
        },
        { title: 'Value Date', data: 'valueDate' },
        { title: 'Negotiated Rate', data: 'negotiatedRate' },
        {
          title: 'Deal Status',
          data: 'status',
          render: function(data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Active</span>`
            if (id === 0) return `<span class="badge bg-danger ">Inactive</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            else return `<span class="badge bg-primary">${data.statusName}</span>`
          }
        },
        { title: 'Deal Code', data: 'dealerCode' },
        { title: 'Dealer', data: 'dealerId' },
        { title: 'Order Number', data: 'orderId' },
        { title: 'Initiator', data: 'tellerId' },
      ]

      if (canApprove) {
        cols.push({
            title: 'Actions',
            data: null,
            orderable: false,
            searchable: false,
            render: function(data, type, row) {
              if (canApprove) {
                const approveDisabled = row.status.statusId === 6 ? '' : 'disabled'
                return `
                    <button class="btn btn-sm btn-dark dt-view" data-id="${row.id}" >View Details</button>
                    <button class="btn btn-sm btn-success me-1 dt-approve" data-id="${row.id}"  ${approveDisabled}>Approve</button>
                   <button class="btn btn-sm btn-danger dt-reject" data-id="${row.id}" ${approveDisabled}>Reject</button>`
              } else return ''
            }
          }
        )
      }
      return cols;
    },

    updateUser() {
      return updateUser
    },
    canCreateDealCodeRequests() {
      return this.hasPerm("CREATE_DEAL_REQUESTS");
    },
    canApproveDealCodeRequests() {
      return this.hasPerm("APPROVE_DEAL_REQUESTS");
    },

  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.permissions = this.user?.usersPerm;
    this.tableReady = true;
    this.fetchDealRequests()
  },
  methods: {
    hasPerm (permission) {
      return this.permissions && this.permissions.includes(permission)
    },
    filterCurrencyOptions() {
      if (this.selectedAccount) {
        console.log("test " ,this.selectedAccount)
        this.sourceAccCurrency = this.selectedAccount?.currency
        this.filteredCurrencyOptions = this.currencyOptions.filter(
          currency => currency.id !== this.sourceAccCurrency
        );
        this.checkBankDirection();
      }
    },
    editUsers(item) {
      console.log('user ', JSON.stringify(item))
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

    showCreateDealDialog() {
      this.showCreateDealModal = true
    },
    showCustomerModalDialog() {
      this.showCreateDealModal = false
      this.showCustomerModal = true
      this.isCustomer = true;
      this.idType = '';
      this.idNumber = '';
    },
    showTellerModalDialog() {
      this.showCreateDealModal = false
      this.showTellerModal = true
      this.idType = 'ACCNO'
      this.isCustomer = false;
    },
    showCustomerDetailsModalDialog() {
      console.log('test1')
      this.showCustomerModal = false
      this.showCustomerDetailsModal = true
      this.idNumberValue = this.idNumber
      this.idTypeValue = this.idType?.name
    },

    showTellerDetailsModalDialog() {
      console.log('test1')
      this.showTellerModal = false
      this.showTellerDetailsModal = true
      this.idNumberValue = this.idNumber
      this.idTypeValue = this.idType?.name
    },

    showCreateRFQModalDialog() {
      this.showCreateRFQModal = true
      this.showTellerDetailsModal = false
      this.showCustomerDetailsModal = false
      this.selectedAccount = '';
      this.action = '';
      this.currency = '';
      this.amount = '';
      this.negotiatedRate = '';
      this.valueDate = '';
      this.purpose = '';
      this.rfqComment = '';

    },

    enableRecord(row) {
      this.changeStatus(row, '1')
    },
    disableRecord(row) {
      this.changeStatus(row, '0')
    },
    validateForm() {
      this.errors = {}

      if (!this.selectedAccount) {
        this.errors.selectedAccount = '*Account is required.'
      }
      if (!this.action) {
        this.errors.action = '*Kindly state if it is credit or a Debit .'
      }
      if (!this.currency) {
        this.errors.currency = '*Kindly Input Currency .'
      }

      if (!this.amount) {
        this.errors.amount = "*Amount is required.";
      }
      else if(!config.CURRENCY_REGEX.test(this.amount)){
        this.errors.amount = "*Amount is invalid";
      }

      if (!this.negotiatedRate) {
        this.errors.negotiatedRate = "*Negotiated rate is required.";
      }
      else if(!config.CURRENCY_REGEX.test(this.negotiatedRate)){
        this.errors.negotiatedRate = "*Negotiated rate is invalid";
      }

      if (!this.valueDate) {
        this.errors.purpose = "*Purpose is required.";
      }
      if (!this.purpose) {
        this.errors.purpose = "Purpose is required.";
      }

      if (!this.rfqComment) {
        this.errors.rfqComment = "Comments is required.";
      }

      if (Object.keys(this.errors).length > 0) {
        return false
      }
      return true
    },
    submitDealRateRequest() {
      if (!this.validateForm()) {
        console.log('Validation failed', this.errors)
        return
      }
      this.loading = true
      this.message = ''
      var counterCurrency = this.currency.id
      var accountCurrency = this.selectedAccount.currency



      var url = env.apiUrl.baseUrl + env.apiUrl.rfq.createRFQ
      console.log('status', url)
      console.log('iscCustomerr ', this.isCustomer)
      axios
        .post(url, {
          customerNo: this.selectedAccount?.customerCif,
          customerName: this.selectedAccount?.accountName,
          idNumber: this.customerInfo?.idNumber,
          amount: this.amount,
          fromCurrency: counterCurrency,
          toCurrency: accountCurrency,
          accountNumber: this.selectedAccount?.accountNumber,
          valueDate: this.valueDate,
          negotiatedRate: this.negotiatedRate,
          tellerAccountName: !this.isCustomer? this.selectedAccount?.accountName : "",
          purpose: this.purpose,
          comments:this.rfqComment,
          branchCode: this.selectedAccount?.branchCode,
          treasuryRate: this.rateValue,
          bankDirection:this.bankDirection
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
          console.log('Deal Code  Request created successfully  ', this.userName)
          this.fetchDealRequests()
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'Deal Code  Request  Creation error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during Deal Code  Request  Creation',
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
          this.showCreateRFQModal = false
        })
    },
    fetchDealRequests() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getDealRequests
      const token = localStorage.getItem('token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      axios
        .post(url, {
          page: 0,
          size: 10
        })
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
          this.dealRequests = data.data
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching Deal Requests',
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

    validateAccountsForm() {
      this.errors = {}

      if (!this.idNumber) {
        this.errors.idNumber= '*Id Number is required.'
      }
      if (this.isCustomer && !this.idType) {
        this.errors.idType = '*Id Type is required. .'
      }

      if (Object.keys(this.errors).length > 0) {
        return false
      }
      return true
    },

    fetchAccounts(isCustomer) {
      console.log('iscustomer', isCustomer)
      if (!this.validateAccountsForm()) {
        console.log('Validation failed', this.errors)
        return
      }
      this.isCustomer = isCustomer
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.fetchAccounts

      axios
        .post(url, {
          option: this.idType?.id,
          customer: isCustomer,
          identificationNumber: this.idNumber
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
          this.accounts = data?.entity?.accounts
          this.customerInfo = data?.entity
          console.log('Accounts', this.accounts)
          if (isCustomer) {
            this.showCustomerDetailsModalDialog()
          } else {
            this.showTellerDetailsModalDialog()
          }
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
    },

    checkBankDirection() {
      if (this.currency && this.selectedAccount && this.action) {
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getCurrencyDirection
        var counterCurrency = this.currency.id
        var accountCurrency = this.selectedAccount.currency

        var fromCurrency = accountCurrency
        var toCurrency = counterCurrency

        if (this.action === 'CREDIT') {
          fromCurrency = counterCurrency
          toCurrency = accountCurrency
        }

        axios
          .post(url, {
            fromCurrency: fromCurrency,
            toCurrency: toCurrency
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
            this.bankDirection = data?.entity
            this.fetchExchangeRates()
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
      }
    },

    fetchExchangeRates() {
      if (this.currency && this.selectedAccount && this.action && this.amount) {
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getSinglePairExchangeRate
        var counterCurrency = this.currency.id
        var accountCurrency = this.selectedAccount.currency

        axios
          .post(url, {
            fromCurrency: counterCurrency,
            toCurrency: accountCurrency,
            account: this.selectedAccount.accountNumber,
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
            this.rateFrom = counterCurrency
            this.rateTo = accountCurrency
            if (this.bankDirection === 'Sell') {
              this.rateValue = data.entity?.sellingRate
              if(this.action === 'CREDIT'){
                this.rateFrom = accountCurrency
                this.rateTo = counterCurrency
                this.multiplyDivide ="D"
              }
              else if(this.action === 'DEBIT'){
                this.rateFrom = counterCurrency
                this.rateTo = accountCurrency
                this.multiplyDivide ="M"
              }
            } else if (this.bankDirection === 'Buy') {
              this.rateValue = data.entity?.buyingRate
              if(this.action === 'CREDIT'){
                this.rateFrom = counterCurrency
                this.rateTo = accountCurrency
                this.multiplyDivide ="M"
              }
              else if(this.action === 'DEBIT'){
                this.rateFrom = accountCurrency
                this.rateTo = counterCurrency
                this.multiplyDivide ="D"
              }
            }
            if(this.multiplyDivide === "M"){
              this.expectedValue = this.amount * this.rateValue
            }
            else if(this.multiplyDivide === "D"){
              this.expectedValue = this.amount / this.rateValue
            }

            this.expectedValue = Number(this.expectedValue).toFixed(2)
            this.useCurrentRate = true;
            this.useNegotiatedRate = false;
            this.displayNegotiatedRate()
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
      }
    },
    displayNegotiatedRate(){
      if(this.currency && this.selectedAccount && this.action && this.amount && this.negotiatedRate){
        if(this.multiplyDivide === "M") {
          this.expectedValue = this.amount * this.negotiatedRate
        }
        else if(this.multiplyDivide === "D") {
          this.expectedValue = this.amount / this.negotiatedRate
        }
        this.expectedValue = Number(this.expectedValue).toFixed(2)
        this.useCurrentRate = false;
        this.useNegotiatedRate = true;
      }
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

    showDetailsDialog(row) {
      this.row = row
      this.fetchCustomerInformation()
      this.comment = ''
      this.showDealDetailsModal= true

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
          approvalType: 'APPROVED_DEALS'
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
          console.log('Deal Request approved successfully  ')
          this.fetchDealRequests()
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'Deal Request Approval error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during Deal Request Approval',
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
    fetchCustomerInformation() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.fetchCustomerInfo+ this.row?.accountNumber

      axios
        .post(url)
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
          this.accountInfo = data?.entity
          console.log('Account', this.accountInfo)
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
    },
  }
}
</script>

<template>
  <!-- Loader -->
  <div>
    <AppLoader v-if="loading" />
  </div>

  <!-- Main Content - Added wrapper to prevent overlap -->
  <div class="main-content-wrapper">
    <div class="row">
      <div class="col-sm-12">
        <div class="table-card">
          <div class="table-header">
            <div>
              <h4 class="table-title">Requested Deals</h4>
              <p class="table-subtitle">Manage and track all forex deal requests</p>
            </div>
            <div class="table-actions">
              <button v-if="canCreateDealCodeRequests" class="create-deal-btn" @click="showCreateDealDialog">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Create Deal Code</span>
              </button>
            </div>
          </div>
          <div class="table-body">
            <div class="table-responsive">
              <data-table
                v-if="tableReady"
                :data="dealRequests"
                :columns="columns"
                :isFooter="true"
                :striped="false"
                @approve="showApproveDialog"
                @reject="showRejectionDialog"
                @view="showDetailsDialog"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Deal Modal -->
  <div v-if="showCreateDealModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Request New Deal</h5>
        <button class="modal-close-btn" @click="showCreateDealModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="modal-question">Is this person a Customer?</p>
        <p class="modal-description">Select whether a person has an existing account with us.</p>
        <div class="choice-grid">
          <button class="choice-card" @click="showCustomerModalDialog()">
            <div class="choice-icon customer">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="choice-label">Yes</div>
            <div class="choice-sublabel">Existing Customer</div>
          </button>

          <button class="choice-card" @click="showTellerModalDialog()">
            <div class="choice-icon teller">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="choice-label">No</div>
            <div class="choice-sublabel">Non Customer</div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Customer Modal -->
  <div v-if="showCustomerModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Customer Account Lookup</h5>
        <button class="modal-close-btn" @click="showCustomerModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Search for customer by their identification details</p>
        <b-row class="mb-3">
          <b-col lg="6">
            <b-form-group label="Search By" label-for="search value" label-class="fw-semibold">
              <select v-model="idType" class="form-control modern-select">
                <option v-for="option in options" :key="option" :value="option">
                  {{ option.name }}
                </option>
              </select>
              <small v-if="errors.idType" class="text-danger">{{ errors.idType }}</small>
            </b-form-group>
          </b-col>

          <b-col lg="6">
            <b-form-group label="Search Value" label-for="search by value" label-class="fw-semibold">
              <b-form-input v-model="idNumber" type="text" class="modern-input" placeholder="Enter Value"></b-form-input>
              <small v-if="errors.idNumber" class="text-danger">{{ errors.idNumber }}</small>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showCustomerModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="fetchAccounts(true)">
          <i class="fas fa-search me-2"></i>Search
        </button>
      </div>
    </div>
  </div>

  <!-- Teller Modal -->
  <div v-if="showTellerModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Teller Account Lookup</h5>
        <button class="modal-close-btn" @click="showTellerModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Enter the teller account number to proceed</p>
        <b-row class="mb-3">
          <b-col lg="12">
            <b-form-group label="Teller Account Number" label-for="search by value" label-class="fw-semibold">
              <b-form-input v-model="idNumber" type="text" class="modern-input" placeholder="Enter Teller Account"></b-form-input>
              <small v-if="errors.idNumber" class="text-danger">{{ errors.idNumber }}</small>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showTellerModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="fetchAccounts(false)">
          <i class="fas fa-search me-2"></i>Search
        </button>
      </div>
    </div>
  </div>

  <!-- Customer Details Modal -->
  <div v-if="showCustomerDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-lg">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Customer Details</h5>
        <button class="modal-close-btn" @click="showCustomerDetailsModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="customer-card">
          <div class="customer-header">
            <div class="customer-avatar">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h6 class="customer-name">{{ customerInfo?.fullName }}</h6>
              <p class="customer-since">Customer since {{ customerInfo?.joiningYear }}</p>
            </div>
          </div>

          <div class="customer-details">
                     <!-- labels-->
            <div class="detail-item">
              <label>Customer ID</label>
              <label></label>
              <label>Phone Number</label>
            </div>
              <!-- Data-->
            <div class="detail-item">
              <p>{{ customerInfo?.customerCif }}</p>
              <p></p>
              <p>{{ customerInfo?.phoneNumber }}</p>
            </div>
          </div>

          <div class="accounts-section">
            <label class="section-label">Available Accounts</label>
            <div class="accounts-grid">
              <div class="account-badge" v-for="(acc, index) in accounts" :key="index">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 3V21" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ acc.accountNumber }} ({{ acc.currency }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showCustomerDetailsModal = false">Back</button>
        <button class="btn btn-success px-4" @click="showCreateRFQModalDialog">
          Continue <i class="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Teller Details Modal -->
  <div v-if="showTellerDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-lg">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Teller Account Details</h5>
        <button class="modal-close-btn" @click="showTellerDetailsModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="teller-card">
          <div class="teller-details">
            <div class="detail-item">
              <label>Account Name</label>
              <label>Account Number</label>
              <label>Branch Code</label>

            </div>
            <div class="detail-item">
              <p>{{ accounts[0]?.accountName }}</p>
              <p>{{ accounts[0]?.accountNumber }}</p>
              <p>{{ accounts[0]?.branchCode }}</p>
            </div>

          </div>
        </div>
      </div>

      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showTellerDetailsModal = false">Back</button>
        <button class="btn btn-success px-4" @click="showCreateRFQModalDialog">
          Continue <i class="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Create RFQ Modal -->
  <div v-if="showCreateRFQModal" class="modal-backdrop">
    <div class="custom-modal modal-xl">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Create Deal Request</h5>
        <button class="modal-close-btn" @click="showCreateRFQModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="rfq-form">
          <div class="row g-4">
            <!-- Select Account -->
            <div class="col-md-6">
              <label class="form-label">Select Account <span class="text-danger">*</span></label>
              <select class="form-select modern-select" v-model="selectedAccount" @change="filterCurrencyOptions">
                <option value="">Choose an account</option>
                <option v-for="acc in accounts" :key="acc" :value="acc">
                  {{ acc.accountNumber }} - {{ acc.currency }}
                </option>
              </select>
              <small v-if="errors.selectedAccount" class="text-danger">{{ errors.selectedAccount }}</small>
            </div>

            <!-- Account Action -->
            <div class="col-md-6">
              <label class="form-label">Account Action <span class="text-danger">*</span></label>
              <select class="form-select modern-select" v-model="action" @change="checkBankDirection">
                <option value="">Select action</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
              <small v-if="errors.action" class="text-danger">{{ errors.action }}</small>
            </div>

            <!-- Counter Currency -->
            <div class="col-md-6">
              <label class="form-label">Counter Currency <span class="text-danger">*</span></label>
              <select class="form-select modern-select" v-model="currency" @change="checkBankDirection">
                <option value="">Select currency</option>
                <option v-for="option in filteredCurrencyOptions" :key="option" :value="option">
                  {{ option.id }} - {{ option.name }}
                </option>
              </select>
              <small v-if="errors.currency" class="text-danger">{{ errors.currency }}</small>
            </div>

            <!-- Amount -->
            <div class="col-md-6">
              <label class="form-label">Counter Currency Amount <span class="text-danger">*</span></label>
              <input @change="fetchExchangeRates" type="number" class="form-control modern-input" v-model="amount" placeholder="0.00" />
              <small v-if="errors.amount" class="text-danger">{{ errors.amount }}</small>
            </div>

            <!-- Bank Direction -->
            <div class="col-md-6">
              <label class="form-label">Bank's Direction</label>
              <input class="form-control modern-input" disabled placeholder="Auto-calculated" v-model="bankDirection" />
            </div>

            <!-- Negotiated Rate -->
            <div class="col-md-6">
              <label class="form-label">Negotiated Rate <span class="text-danger">*</span></label>
              <input @change="displayNegotiatedRate" class="form-control modern-input" placeholder="0.00" v-model="negotiatedRate"/>
              <small v-if="errors.negotiatedRate" class="text-danger">{{ errors.negotiatedRate }}</small>
            </div>

            <!-- Value Date -->
            <div class="col-md-6">
              <label class="form-label">Value Date <span class="text-danger">*</span></label>
              <input type="date" class="form-control modern-input" v-model="valueDate" />
              <small v-if="errors.valueDate" class="text-danger">{{ errors.valueDate }}</small>
            </div>

            <!-- Current Rate Box -->
            <div class="col-md-6">
              <div class="info-box rate-box">
                <div class="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p class="info-label">Current Rate</p>
                  <p class="info-value" v-if="rateFrom && rateValue && rateTo">
                    1 {{ rateFrom }} = {{ rateValue }} {{ rateTo }}
                  </p>
                  <p class="info-value" v-else>---</p>
                </div>
              </div>
            </div>

            <!-- Purpose -->
            <div class="col-md-6">
              <label class="form-label">Purpose <span class="text-danger">*</span></label>
              <textarea class="form-control modern-input" rows="2" v-model="purpose" placeholder="Enter transaction purpose"></textarea>
              <small v-if="errors.purpose" class="text-danger">{{ errors.purpose }}</small>
            </div>

            <!-- Expected Total Box -->
            <div class="col-md-6">
              <div class="info-box total-box">
                <div class="info-icon success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <p class="info-label" v-if="useCurrentRate">Expected Total (Current Rate)</p>
                  <p class="info-label" v-if="useNegotiatedRate">Expected Total (Negotiated Rate)</p>
                  <p class="info-value success">{{ expectedValue }} {{ selectedAccount.currency }}</p>
                </div>
              </div>
            </div>

            <!-- Comment -->
            <div class="col-md-12">
              <label class="form-label">Comment <span class="text-danger">*</span></label>
              <textarea class="form-control modern-input" rows="3" v-model="rfqComment" placeholder="Add any additional comments or notes"></textarea>
              <small v-if="errors.rfqComment" class="text-danger">{{ errors.rfqComment }}</small>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showCreateRFQModal = false">Cancel</button>
        <button class="btn btn-success px-5" @click="submitDealRateRequest">
          <i class="fas fa-paper-plane me-2"></i>Submit Request
        </button>
      </div>
    </div>
  </div>

  <!-- Approve Modal -->
  <div v-if="showApproveModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Approve Deal Request</h5>
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
        <p class="modal-question">Approve this deal request?</p>
        <p class="modal-description">
          You are about to approve order <strong>{{ row?.orderId }}</strong>. This action cannot be undone.
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
        <h5 class="modal-title text-white">Reject Deal Request</h5>
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
        <p class="modal-question">Reject this deal request?</p>
        <p class="modal-description">
          You are about to reject order <strong>{{ row?.orderId }}</strong>. Please provide a reason.
        </p>
        <div class="mt-3">
          <label for="rejectComment" class="form-label">Rejection Reason <span class="text-danger">*</span></label>
          <textarea id="rejectComment" class="form-control modern-input" v-model="comment" rows="3" placeholder="Explain why you're rejecting this request..."></textarea>
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

  <!-- Deal Details Modal -->
  <div v-if="showDealDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-xl">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Deal Details</h5>
        <button class="modal-close-btn" @click="showDealDetailsModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="deal-details-grid">
          <!-- Deal Information Card -->
          <div class="detail-card">
            <div class="detail-card-header">
              <div class="detail-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h6>Deal Information</h6>
            </div>
            <div class="detail-card-body">
              <div class="detail-row">
                <span class="detail-label">Order ID</span>
                <span class="detail-value">{{ row.orderId }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="badge" :class="{
                  'bg-success': row?.status?.statusId === 1,
                  'bg-warning': row?.status?.statusId === 6,
                  'bg-danger': row?.status?.statusId === 0,
                  'bg-dark': row?.status?.statusId === 7
                }">{{ row?.status?.statusName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Currency Pair</span>
                <span class="detail-value">{{ row?.currencyPair }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Side</span>
                <span class="badge" :class="row.buySell === 'BUY' ? 'bg-primary' : 'bg-danger'">
                  {{ row?.buySell }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">{{ row.fromCurrency }} {{ row?.counterNominalAmount }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Account</span>
                <span class="detail-value">{{ row?.accountNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Request Date</span>
                <span class="detail-value">{{ row?.requestDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Value Date</span>
                <span class="detail-value">{{ row?.valueDate }}</span>
              </div>
            </div>
          </div>

          <!-- Customer Information Card -->
          <div class="detail-card">
            <div class="detail-card-header">
              <div class="detail-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h6>Customer Information</h6>
            </div>
            <div class="detail-card-body">
              <div class="detail-row">
                <span class="detail-label">Name</span>
                <span class="detail-value">{{ accountInfo?.accountName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Issuer</span>
                <span class="detail-value">{{ row.createdBy }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Originator</span>
                <span class="detail-value">{{ row.createdBy }}</span>
              </div>
            </div>
          </div>

          <!-- Rate Information Card - Full Width -->
          <div class="detail-card full-width">
            <div class="detail-card-header">
              <div class="detail-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h6>Rate Information</h6>
            </div>
            <div class="detail-card-body">
              <div class="rate-info-grid">
                <div class="rate-info-item">
                  <span class="rate-label">Offer Rate</span>
                  <span class="rate-value">{{ row.treasuryRate }}</span>
                </div>
                <div class="rate-info-item">
                  <span class="rate-label">Negotiated Rate</span>
                  <span class="rate-value highlight">{{ row.negotiatedRate }}</span>
                </div>
                <div class="rate-info-item primary">
                  <span class="rate-label">Expected Total</span>
                  <span class="rate-value primary">{{ row.expectedAmount }} {{ row.toCurrency }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4" @click="showDealDetailsModal = false">
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

.table-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
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

.create-deal-btn {
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

.create-deal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.table-body {
  padding: 28px;
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
  width: 600px;
  max-width: 95%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-lg {
  width: 900px;
}

.modal-xl {
  width: 1200px;
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
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
  filter: drop-shadow(0 4px 12px rgba(220, 53, 69, 0.3));
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

/* Choice Grid */
.choice-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.choice-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-card:hover {
  border-color: #10b981;
  background: #f0fdf4;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
}

.choice-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.choice-icon.customer {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #059669;
}

.choice-icon.teller {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.05));
  color: #10b981;
}

.choice-card:hover .choice-icon {
  transform: scale(1.1);
}

.choice-label {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.choice-sublabel {
  font-size: 13px;
  color: #6b7280;
}

/* Customer/Teller Cards */
.customer-card,
.teller-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 2px solid #d1fae5;
  border-radius: 16px;
  padding: 24px;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #d1fae5;
}

.customer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.customer-name {
  font-size: 18px;
  font-weight: 700;
  color: #064e3b;
  margin-bottom: 4px;
}

.customer-since {
  font-size: 13px;
  color: #059669;
  margin: 0;
}

.customer-details,
.teller-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
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

.accounts-section {
  margin-top: 24px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: block;
}

.accounts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.account-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 2px solid #d1fae5;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #064e3b;
  transition: all 0.2s ease;
}

.account-badge:hover {
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.account-badge svg {
  color: #10b981;
}

/* Form Elements */
.modern-select,
.modern-input {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.modern-select:focus,
.modern-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* Info Boxes */
.info-box {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-box.rate-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-color: #d1fae5;
}

.info-box.total-box {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.info-value.success {
  font-size: 20px;
  color: #059669;
}

/* Deal Details Grid */
.deal-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.detail-card.full-width {
  grid-column: 1 / -1;
}

.detail-card-header {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  padding: 16px 20px;
  border-bottom: 2px solid #d1fae5;
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-card-header h6 {
  font-size: 15px;
  font-weight: 700;
  color: #064e3b;
  margin: 0;
}

.detail-card-body {
  padding: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

/* Rate Info Grid */
.rate-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.rate-info-item {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}

.rate-info-item.primary {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.rate-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  display: block;
  margin-bottom: 8px;
}

.rate-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: block;
}

.rate-value.highlight {
  color: #059669;
}

.rate-value.primary {
  font-size: 22px;
  color: #10b981;
}

/* Badge Styles */
:deep(.badge.bg-success) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

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

/* Responsive Design */
@media (max-width: 1200px) {
  .deal-details-grid {
    grid-template-columns: 1fr;
  }

  .rate-info-grid {
    grid-template-columns: 1fr;
  }
}

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

  .table-body {
    padding: 16px;
  }

  .choice-grid {
    grid-template-columns: 1fr;
  }

  .customer-details,
  .teller-details {
    grid-template-columns: 1fr;
  }

  .modal-xl,
  .modal-lg {
    width: 95%;
  }
}

@media (max-width: 576px) {
  .table-title {
    font-size: 18px;
  }

  .create-deal-btn {
    width: 100%;
    justify-content: center;
  }

  .accounts-grid {
    flex-direction: column;
  }

  .account-badge {
    width: 100%;
  }
}
</style>
