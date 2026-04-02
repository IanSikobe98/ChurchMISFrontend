<script>
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import store from '@/store'
import DataTable from '@/components/DataTable.vue'

export default {
  name: 'ViewRequestDetails',
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
      request: {}
    }
  },

  computed: {
    requestStatusBadge() {
      const id = Number(this.request?.status?.statusId)
      if (id === 1) return { label: 'Approved',         cls: 'pill-approved' }
      if (id === 6) return { label: 'Pending Approval', cls: 'pill-pending'  }
      if (id === 7) return { label: 'Rejected',         cls: 'pill-rejected' }
      if (id === 0) return { label: 'Inactive',         cls: 'pill-inactive' }
      return { label: this.request?.status?.statusName || '—', cls: 'pill-default' }
    },

    approvalColumns() {
      return [
        { title: 'Approver Role', data: 'approverRole.roleName' },
        { title: 'Approver Name', data: 'actionBy.username' },
        { title: 'Level',         data: 'stepLevel' },
        { title: 'Comments',      data: 'comments' },
        {
          title: 'Approval Date',
          data: 'createdAt',
          render: (d) => d ? new Date(d).toISOString().split('T')[0] : '—'
        },
        {
          title: 'Status',
          data: 'status',
          render(data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="tbl-badge badge-approved">Approved</span>`
            if (id === 6) return `<span class="tbl-badge badge-pending">Pending</span>`
            if (id === 7) return `<span class="tbl-badge badge-rejected">Rejected</span>`
            if (id === 0) return `<span class="tbl-badge badge-inactive">Inactive</span>`
            return `<span class="tbl-badge badge-default">${data.statusName}</span>`
          }
        }
      ]
    },

    equipmentColumns() {
      return [
        { title: 'Serial Number',    data: 'equipmentItem.serialNumber' },
        { title: 'Equipment Name',   data: 'equipmentItem.equipment.name' },
        { title: 'Condition Before', data: 'conditionBefore.statusName' },
        {
          title: 'Date Allocated',
          data: 'allocatedAt',
          render: (d) => d ? new Date(d).toISOString().split('T')[0] : '—'
        },
        {
          title: 'Date Returned',
          data: 'returnedBy',
          render: (d) => d ? new Date(d).toISOString().split('T')[0] : '—'
        },
        {
          title: 'Status',
          data: 'status',
          render(data) {
            const id = Number(data.statusId)
            if (id === 1)  return `<span class="tbl-badge badge-approved">Approved</span>`
            if (id === 13) return `<span class="tbl-badge badge-allocated">Allocated</span>`
            if (id === 6)  return `<span class="tbl-badge badge-pending">Pending</span>`
            if (id === 7)  return `<span class="tbl-badge badge-rejected">Rejected</span>`
            if (id === 0)  return `<span class="tbl-badge badge-inactive">Inactive</span>`
            return `<span class="tbl-badge badge-default">${data.statusName}</span>`
          }
        }
      ]
    }
  },

  mounted() {
    const raw = localStorage.getItem('selectedRequest')
    if (raw) {
      try { this.request = JSON.parse(raw) } catch (e) { console.error(e) }
    }
    this.user        = JSON.parse(store.state.user)
    this.permissions = this.user?.usersPerm
    this.tableReady  = true
    this.tableReady2 = true
    if (this.request?.id) {
      this.fetchApprovals(this.request.id)
      this.fetchEquipment(this.request.id)
    }
  },

  methods: {
    hasPerm(p) { return this.permissions?.includes(p) },

    fetchApprovals(id) {
      this.loading = true
      axios
        .post(env.apiUrl.baseUrl + env.apiUrl.equipment.getRequestApprovalsByRequest, { page: 0, size: 50, id })
        .then(({ data }) => {
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            return Swal.fire({ icon: 'error', title: 'Error', text: data.responseMessage })
          }
          this.requestApprovals = data.data ?? []
        })
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch approvals.' }))
        .finally(() => { this.loading = false })
    },

    fetchEquipment(id) {
      this.loading = true
      axios
        .post(env.apiUrl.baseUrl + env.apiUrl.equipment.getEquipmentByRequest, { page: 0, size: 50, id })
        .then(({ data }) => {
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            return Swal.fire({ icon: 'error', title: 'Error', text: data.responseMessage })
          }
          this.equipmentAllocation = data.data ?? []
        })
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch equipment.' }))
        .finally(() => { this.loading = false })
    }
  }
}
</script>

<template>
  <div><AppLoader v-if="loading" /></div>

  <div class="page-wrapper">
    <div class="row">
      <div class="col-lg-12">
        <div class="detail-card">

          <!-- ══ HEADER ══ -->
          <div class="card-header">
            <div class="header-left">
              <button class="back-btn" type="button" @click="$router.go(-1)" title="Go back">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2.2"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="header-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 12v3m-1.5-1.5h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h4 class="card-title">Equipment Request Details</h4>
                <p class="card-subtitle">Approval trail and allocated equipment</p>
              </div>
            </div>
            <div v-if="request.status" class="header-right">
              <span :class="['status-pill', requestStatusBadge.cls]">{{ requestStatusBadge.label }}</span>
            </div>
          </div>

          <!-- ══ SUMMARY STRIP ══ -->
          <div v-if="request.id" class="summary-strip">
            <div v-if="request.event" class="summary-cell">
              <span class="sc-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Event
              </span>
              <span class="sc-value">{{ request.event }}</span>
            </div>
            <div v-if="request.purpose" class="summary-cell">
              <span class="sc-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Purpose
              </span>
              <span class="sc-value">{{ request.purpose }}</span>
            </div>
            <div v-if="request.venue" class="summary-cell">
              <span class="sc-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                </svg>
                Venue
              </span>
              <span class="sc-value">{{ request.venue }}</span>
            </div>
            <div v-if="request.returnDate" class="summary-cell">
              <span class="sc-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Return Date
              </span>
              <span class="sc-value">{{ request.returnDate }}</span>
            </div>
            <div v-if="request.quantity" class="summary-cell">
              <span class="sc-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
                        stroke="currentColor" stroke-width="2"/>
                </svg>
                Quantity
              </span>
              <span class="sc-value">{{ request.quantity }}</span>
            </div>
          </div>

          <!-- ══ BODY ══ -->
          <div class="card-body">

            <!-- Tab bar -->
            <div class="tab-bar">
              <button
                v-for="tab in tabs"
                :key="tab"
                type="button"
                :class="['tab-btn', { 'tab-btn--active': activeTab === tab }]"
                @click="activeTab = tab"
              >
                <!-- Approvals icon -->
                <svg v-if="tab === 'Approvals'" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <!-- Equipment icon -->
                <svg v-if="tab === 'Equipment'" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ tab }}
                <span
                  v-if="tab === 'Approvals' && requestApprovals.length"
                  :class="['tab-count', { 'tab-count--active': activeTab === tab }]"
                >{{ requestApprovals.length }}</span>
                <span
                  v-if="tab === 'Equipment' && equipmentAllocation.length"
                  :class="['tab-count', { 'tab-count--active': activeTab === tab }]"
                >{{ equipmentAllocation.length }}</span>
              </button>
            </div>

            <!-- Tab panels -->
            <div class="tab-panel">

              <!-- Approvals panel -->
              <div v-show="activeTab === 'Approvals'">
                <div v-if="!loading && requestApprovals.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="1.5"
                            stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <p class="empty-title">No approvals yet</p>
                  <p class="empty-sub">Approval records will appear once the request is processed.</p>
                </div>
                <div v-else class="table-responsive">
                  <data-table
                    v-if="tableReady"
                    :data="requestApprovals"
                    :columns="approvalColumns"
                    :isFooter="true"
                    :striped="false"
                  />
                </div>
              </div>

              <!-- Equipment panel -->
              <div v-show="activeTab === 'Equipment'">
                <div v-if="!loading && equipmentAllocation.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <p class="empty-title">No equipment allocated</p>
                  <p class="empty-sub">Equipment records will appear once items are assigned.</p>
                </div>
                <div v-else class="table-responsive">
                  <data-table
                    v-if="tableReady2"
                    :data="equipmentAllocation"
                    :columns="equipmentColumns"
                    :isFooter="true"
                    :striped="false"
                  />
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
/* ─── Page wrapper ─────────────────────────────── */
.page-wrapper {
  min-height: calc(100vh - 360px);
  padding: 20px 0 60px;
}

/* ─── Card ─────────────────────────────────────── */
.detail-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(46, 84, 126, 0.12);
  box-shadow: 0 4px 20px rgba(46, 84, 126, 0.08);
  transition: box-shadow 0.3s, border-color 0.3s;
  animation: fadeUp 0.4s ease-out both;
}
.detail-card:hover {
  box-shadow: 0 8px 32px rgba(46, 84, 126, 0.13);
  border-color: rgba(46, 84, 126, 0.2);
}

/* ─── Header ───────────────────────────────────── */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding: 22px 28px;
  background: linear-gradient(135deg, #eef4fb 0%, #ffffff 100%);
  border-bottom: 2px solid #eef4fb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 2px solid rgba(46, 84, 126, 0.18);
  background: #ffffff;
  color: #2e547e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.back-btn:hover {
  background: #eef4fb;
  border-color: #2e547e;
  transform: translateX(-2px);
}

.header-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 13px;
  background: linear-gradient(135deg, rgba(46, 84, 126, 0.14), rgba(46, 84, 126, 0.06));
  color: #2e547e;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(46, 84, 126, 0.1);
}

.card-title {
  font-size: 19px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a3352, #2e547e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 3px;
}
.card-subtitle {
  font-size: 13px;
  color: #5a7a9e;
  margin: 0;
}

/* Status pill */
.status-pill {
  display: inline-block;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.pill-approved { background: rgba(46,84,126,0.1);  color: #1a3352; border: 1.5px solid rgba(46,84,126,0.25); }
.pill-pending  { background: rgba(245,158,11,0.1); color: #92400e; border: 1.5px solid rgba(245,158,11,0.3); }
.pill-rejected { background: rgba(239,68,68,0.08); color: #991b1b; border: 1.5px solid rgba(239,68,68,0.2);  }
.pill-inactive { background: rgba(107,114,128,0.1);color: #374151; border: 1.5px solid rgba(107,114,128,0.2);}
.pill-default  { background: #f3f4f6; color: #6b7280; border: 1.5px solid #e5e7eb; }

/* ─── Summary strip ────────────────────────────── */
.summary-strip {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 2px solid #eef4fb;
  background: #fafcff;
}
.summary-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 16px 24px;
  flex: 1;
  min-width: 140px;
  border-right: 1px solid rgba(46, 84, 126, 0.08);
}
.summary-cell:last-child { border-right: none; }

.sc-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8aa0ba;
}
.sc-label svg { stroke: #8aa0ba; flex-shrink: 0; }

.sc-value {
  font-size: 13.5px;
  font-weight: 600;
  color: #1a3352;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Card body ────────────────────────────────── */
.card-body {
  padding: 26px 28px;
}

/* ─── Tab bar ──────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 5px;
  background: #f0f4f9;
  border-radius: 12px;
  width: fit-content;
  margin-bottom: 24px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  border: none;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: #5a7a9e;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.tab-btn svg { stroke: currentColor; flex-shrink: 0; }
.tab-btn:hover { background: rgba(255,255,255,0.65); color: #2e547e; }

.tab-btn--active {
  background: #ffffff;
  color: #1a3352;
  box-shadow: 0 2px 10px rgba(46, 84, 126, 0.14);
}
.tab-btn--active svg { stroke: #2e547e; }

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(46, 84, 126, 0.1);
  color: #2e547e;
  transition: background 0.2s, color 0.2s;
}
.tab-count--active {
  background: linear-gradient(135deg, rgba(46,84,126,0.9), rgba(46,84,126,0.65));
  color: #ffffff;
}

/* ─── Tab panel ────────────────────────────────── */
.tab-panel { min-height: 180px; }

/* ─── Empty state ──────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 52px 20px;
  text-align: center;
}
.empty-icon {
  width: 68px;
  height: 68px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eef4fb, #dce9f5);
  border: 2px solid rgba(46, 84, 126, 0.1);
  color: #5a8fc8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a3352;
  margin: 0 0 6px;
}
.empty-sub {
  font-size: 13px;
  color: #8aa0ba;
  max-width: 300px;
  line-height: 1.6;
  margin: 0;
}

/* ─── Table badge overrides ────────────────────── */
:deep(.tbl-badge) {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
:deep(.badge-approved)  { background: rgba(46,84,126,0.12);  color: #1a3352; }
:deep(.badge-allocated) { background: rgba(16,185,129,0.12); color: #065f46; }
:deep(.badge-pending)   { background: rgba(245,158,11,0.12); color: #92400e; }
:deep(.badge-rejected)  { background: rgba(239,68,68,0.1);   color: #991b1b; }
:deep(.badge-inactive)  { background: rgba(107,114,128,0.1); color: #374151; }
:deep(.badge-default)   { background: #f3f4f6; color: #6b7280; }

/* ─── Animation ────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Responsive ───────────────────────────────── */
@media (max-width: 768px) {
  .page-wrapper  { padding: 14px 0 40px; }
  .card-header   { padding: 16px 18px; }
  .summary-strip { flex-direction: row; overflow-x: auto; flex-wrap: nowrap; }
  .summary-cell  { min-width: 130px; padding: 14px 16px; }
  .card-body     { padding: 20px 16px; }
  .tab-bar       { width: 100%; }
  .tab-btn       { flex: 1; justify-content: center; }
}

@media (max-width: 480px) {
  .card-title   { font-size: 16px; }
  .header-icon  { width: 40px; height: 40px; }
  .tab-btn      { padding: 9px 12px; font-size: 12.5px; }
}
</style>
