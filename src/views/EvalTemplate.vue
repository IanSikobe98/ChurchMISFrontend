<template>
  <div class="row">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between">
          <div class="header-title">
            <h4 class="card-title">Requested Deals</h4>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive border-bottom my-3">
            <data-table :data="DataTableOptions.data" :columns="DataTableOptions.columns" isFooter="bootstrap-data-table" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DataTable from '@/components/DataTable.vue'

export default {
  name: 'YourComponentName',
  components: {
    DataTable
  },
  data() {
    return {
      DataTableOptions: {
        columns: [
          { title: 'Name' },
          { title: 'Position' },
          { title: 'Office' },
          { title: 'Age' },
          { title: 'Startdate' },
          { title: 'Salary' }
        ],
        data: []
      }
    }
  },
  methods: {
    // fetchFarmer(){
    //   var url = env.apiUrl.baseUrl + env.apiUrl.farmer.getFarmers
    //   console.log("url ",url)
    //   this.loading = true
    //   const token = localStorage.getItem('token')
    //   console.log("token",token)
    //   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    //   axios.post(url,
    //     {
    //       page: 0,
    //       size: 10,
    //     }
    //   )
    //     .then(response => {
    //       var data = response.data
    //       /* Checking if error object was returned from the server */
    //       var responseCode = data.responseCode;
    //       var responseMessage = data.responseMessage;
    //       if (responseCode === config.FAIL_RESPONSE_CODE) {
    //         this.responseMessage = responseMessage;
    //         this.errorMessage = responseMessage;
    //         console.log(this.responseMessage);
    //         this.displayError = true;
    //         return
    //       }
    //       this.farmers = response.data.data;
    //       console.log('farmers',this.farmers);
    //     })
    //     .catch(error => {
    //       console.log('Error is ',error)
    //       this.errorMessage = 'Authentication error';
    //       console.log(this.errorMessage);
    //       this.displayError = true;
    //     })
    // },
  },
  mounted() {
    this.fetchFarmer()
  }

}
</script>

