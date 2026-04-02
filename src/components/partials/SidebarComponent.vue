<script setup>
import DefaultSidebar from '@/components/custom/sidebar/DefaultSidebar.vue'
import SideMenu from '@/components/custom/nav/SideMenu.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const currentRoute = ref('')
const route = useRoute()
const toggle = (route) => {
  if (route === currentRoute.value && route.includes('.')) {
    const menu = currentRoute.value.split('.')
    return (currentRoute.value = menu[menu.length - 2])
  }
  if (route !== currentRoute.value && currentRoute.value.includes(route)) {
    return (currentRoute.value = '')
  }
  if (route !== currentRoute.value) {
    return (currentRoute.value = route)
  }
  if (route === currentRoute.value) {
    return (currentRoute.value = '')
  }
  return (currentRoute.value = '')
}
toggle(route.name)
</script>

<script>
import store from '@/store'

export default {
  data() {
    return {
      permissions: [],
      user: {}
    }
  },
  computed: {
    canCreateUsers() { return this.hasPerm("CREATE_USERS"); },
    canViewUsers()   { return this.hasPerm("VIEW_USERS"); },
    canApproveUsers(){ return this.hasPerm("APPROVE_USERS"); },
    canViewDealCodeRequests() { return this.hasPerm("VIEW_DEAL_REQUESTS"); },
    canCreateRoles() { return this.hasPerm("CREATE_ROLES"); },
    canViewRoles()   { return this.hasPerm("VIEW_ROLES"); },
    canApproveRoles(){ return this.hasPerm('APPROVE_ROLES'); },
    canConvertCurrency() { return this.hasPerm('CONVERT_CURRENCY'); },
  },
  methods: {
    hasPerm(permission) {
      return this.permissions && this.permissions.includes(permission)
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.permissions = this.user?.usersPerm;
  }
}
</script>

<template>
  <!-- Sidebar Component Start Here-->
  <default-sidebar>
    <ul class="navbar-nav iq-main-menu" id="sidebar-menu">
      <!-- Home Section -->
      <side-menu title="HOME" :static-item="true"></side-menu>
      <side-menu
        isTag="router-link"
        title="Dashboard"
        icon="view-grid"
        :route="{ to: 'default.dashboard' }"
      ></side-menu>

      <li><hr class="hr-horizontal" /></li>

      <!-- Main Navigation Section -->
      <side-menu title="MAIN MENU" :static-item="true"></side-menu>

      <!-- Equipment Menu -->
      <side-menu
        title="Equipment"
        icon="toolbox"
        toggle-id="equipments"
        :caret-icon="true"
        :route="{ popup: 'false', to: 'equipment' }"
        @onClick="toggle"
        :active="currentRoute.includes('equipment')"
      >
        <b-collapse
          tag="ul"
          class="sub-nav"
          id="equipments"
          accordion="sidebar-menu"
          :visible="currentRoute.includes('equipment')"
        >
          <side-menu
            isTag="router-link"
            title="Create Requisition Request"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="CU"
            :route="{ to: 'default.createEquipRequest' }"
          ></side-menu>
          <side-menu
            isTag="router-link"
            title="View Requisition Requests"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="VU"
            :route="{ to: 'default.viewRequests' }"
          ></side-menu>
          <side-menu
            isTag="router-link"
            title="View Approvals"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="VU"
            :route="{ to: 'default.viewRequestApprovals' }"
          ></side-menu>
        </b-collapse>
      </side-menu>

      <!-- Users Menu -->
      <side-menu
        v-if="canViewUsers"
        title="Users"
        icon="user-group"
        toggle-id="users"
        :caret-icon="true"
        :route="{ popup: 'false', to: 'user' }"
        @onClick="toggle"
        :active="currentRoute.includes('user')"
      >
        <b-collapse
          tag="ul"
          class="sub-nav"
          id="users"
          accordion="sidebar-menu"
          :visible="currentRoute.includes('user')"
        >
          <side-menu
            v-if="canCreateUsers"
            isTag="router-link"
            title="Create User"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="CU"
            :route="{ to: 'default.createUser' }"
          ></side-menu>
          <side-menu
            v-if="canViewUsers"
            isTag="router-link"
            title="View Users"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="VU"
            :route="{ to: 'default.viewUsers' }"
          ></side-menu>
          <side-menu
            v-if="canApproveUsers"
            isTag="router-link"
            title="User Approvals"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="UA"
            :route="{ to: 'default.viewUserApprovals' }"
          ></side-menu>
        </b-collapse>
      </side-menu>

      <!-- Roles Menu -->
      <side-menu
        v-if="canViewRoles"
        title="Roles"
        icon="user-group"
        toggle-id="roles"
        :caret-icon="true"
        :route="{ popup: 'false', to: 'role' }"
        @onClick="toggle"
        :active="currentRoute.includes('role')"
      >
        <b-collapse
          tag="ul"
          class="sub-nav"
          id="roles"
          accordion="sidebar-menu"
          :visible="currentRoute.includes('role')"
        >
          <side-menu
            v-if="canCreateRoles"
            isTag="router-link"
            title="Create Role"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="CR"
            :route="{ to: 'default.createRoles' }"
          ></side-menu>
          <side-menu
            v-if="canViewRoles"
            isTag="router-link"
            title="View Roles"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="VR"
            :route="{ to: 'default.viewRoles' }"
          ></side-menu>
          <side-menu
            v-if="canApproveRoles"
            isTag="router-link"
            title="Role Approvals"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="RA"
            :route="{ to: 'default.viewRoleApprovals' }"
          ></side-menu>
        </b-collapse>
      </side-menu>

      <!-- Deal Codes Menu -->
      <side-menu
        v-if="canViewDealCodeRequests"
        title="Deal Codes"
        icon="user-group"
        toggle-id="dealCodes"
        :caret-icon="true"
        :route="{ popup: 'false', to: 'dealCodes' }"
        @onClick="toggle"
        :active="currentRoute.includes('dealCodes')"
      >
        <b-collapse
          tag="ul"
          class="sub-nav"
          id="dealCodes"
          accordion="sidebar-menu"
          :visible="currentRoute.includes('dealCodes')"
        >
          <side-menu
            isTag="router-link"
            title="View Deal Requests"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="VD"
            :route="{ to: 'default.viewDealCodes' }"
          ></side-menu>
        </b-collapse>
      </side-menu>

      <!-- Currency Menu -->
      <side-menu
        v-if="canConvertCurrency"
        title="Currency"
        icon="user-group"
        toggle-id="currency"
        :caret-icon="true"
        :route="{ popup: 'false', to: 'currency' }"
        @onClick="toggle"
        :active="currentRoute.includes('currency')"
      >
        <b-collapse
          tag="ul"
          class="sub-nav"
          id="currency"
          accordion="sidebar-menu"
          :visible="currentRoute.includes('currency')"
        >
          <side-menu
            isTag="router-link"
            title="Conversion"
            icon="circle"
            :icon-size="10"
            icon-type="solid"
            miniTitle="VD"
            :route="{ to: 'default.convertCurrency' }"
          ></side-menu>
        </b-collapse>
      </side-menu>

      <li><hr class="hr-horizontal" /></li>
    </ul>
  </default-sidebar>
  <!-- Sidebar Component End Here-->
</template>

<style scoped>
/* ═══════════════════════════════════════════
   SIDEBAR — Blue Theme: rgba(46, 84, 126)
═══════════════════════════════════════════ */

.iq-main-menu {
  padding: 0;
}

/* ─── Section Headers ──────────────────── */
:deep(.nav-item .nav-text.static-item) {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #8aa0ba;
  padding: 20px 24px 8px 24px;
  text-transform: uppercase;
  margin-top: 8px;
}

/* ─── Main Nav Items ───────────────────── */
:deep(.nav-item > .nav-link) {
  padding: 12px 24px;
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

/* Active */
:deep(.nav-item > .nav-link.active) {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9) 0%,
    rgba(46, 84, 126, 0.7) 50%,
    rgba(46, 84, 126, 0.5) 100%
  );
  color: white;
  box-shadow: 0 4px 14px rgba(46, 84, 126, 0.35);
  transform: translateX(4px);
}

/* Hover */
:deep(.nav-item > .nav-link:hover:not(.active)) {
  background: linear-gradient(135deg, #eef4fb 0%, #e4eff8 100%);
  color: #1a3352;
  transform: translateX(4px);
}

/* ─── Icons ───────────────────────────── */
:deep(.nav-item .icon svg) {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

:deep(.nav-item > .nav-link.active .icon svg) {
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
}

/* ─── Sub-navigation ──────────────────── */
:deep(.sub-nav) {
  padding: 4px 0;
  margin-left: 24px;
  border-left: 2px solid rgba(46, 84, 126, 0.15);
}

:deep(.sub-nav .nav-item) {
  margin: 2px 0;
}

:deep(.sub-nav .nav-link) {
  padding: 10px 20px;
  margin: 2px 8px 2px 0;
  border-radius: 10px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

/* Left accent line on sub items */
:deep(.sub-nav .nav-link::before) {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 0;
  background: linear-gradient(
    180deg,
    rgba(46, 84, 126, 0.9),
    rgba(46, 84, 126, 0.5)
  );
  transition: all 0.3s ease;
  border-radius: 2px;
}

:deep(.sub-nav .nav-link.active::before) {
  height: 100%;
}

:deep(.sub-nav .nav-link:hover::before) {
  height: 60%;
}

/* Active sub-item */
:deep(.sub-nav .nav-link.active) {
  background: linear-gradient(135deg, #eef4fb 0%, #dce9f5 100%);
  color: #1a3352;
  font-weight: 600;
  border-left: 2px solid transparent;
}

/* Hover sub-item */
:deep(.sub-nav .nav-link:hover:not(.active)) {
  background: #f0f4f9;
  color: #2e547e;
  transform: translateX(4px);
}

/* ─── Caret Icon ──────────────────────── */
:deep(.nav-item .right-icon) {
  transition: all 0.3s ease;
}

:deep(.nav-item.show .right-icon),
:deep(.nav-item[aria-expanded="true"] .right-icon) {
  transform: rotate(90deg);
}

:deep(.nav-item > .nav-link.active .right-icon svg) {
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
}

/* ─── HR Divider ──────────────────────── */
.hr-horizontal {
  margin: 16px 24px;
  border: 0;
  border-top: 2px solid rgba(46, 84, 126, 0.1);
  opacity: 1;
}

/* ─── Mini Title (Collapsed Sidebar) ──── */
:deep(.mini-title) {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef4fb 0%, #e4eff8 100%);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #2e547e;
  transition: all 0.3s ease;
}

:deep(.nav-link.active .mini-title) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.15);
}

/* ─── Badges ──────────────────────────── */
:deep(.badge) {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
}

:deep(.badge.badge-primary) {
  background: linear-gradient(
    135deg,
    rgba(46, 84, 126, 0.9),
    rgba(46, 84, 126, 0.7)
  );
  color: white;
  box-shadow: 0 2px 6px rgba(46, 84, 126, 0.3);
}

/* ─── Scrollbar ───────────────────────── */
:deep(.sidebar-body::-webkit-scrollbar) {
  width: 5px;
}

:deep(.sidebar-body::-webkit-scrollbar-track) {
  background: #f0f4f9;
  border-radius: 10px;
}

:deep(.sidebar-body::-webkit-scrollbar-thumb) {
  background: linear-gradient(
    180deg,
    rgba(46, 84, 126, 0.3),
    rgba(46, 84, 126, 0.15)
  );
  border-radius: 10px;
  transition: all 0.3s ease;
}

:deep(.sidebar-body::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(
    180deg,
    rgba(46, 84, 126, 0.8),
    rgba(46, 84, 126, 0.5)
  );
}

/* ─── Focus / Accessibility ───────────── */
:deep(.nav-link:focus) {
  outline: 2px solid rgba(46, 84, 126, 0.5);
  outline-offset: 2px;
}

/* ─── Notification Badge ──────────────── */
:deep(.notification-badge) {
  position: absolute;
  top: 8px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  animation: notifPulse 2s infinite;
}

/* ─── Animations ──────────────────────── */
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}

:deep(.nav-item) {
  animation: slideIn 0.3s ease-out;
}

@keyframes notifPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.1); }
}

/* ─── Smooth global transitions ───────── */
* {
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

/* ─── Responsive ──────────────────────── */
@media (max-width: 1199px) {
  :deep(.nav-item > .nav-link) {
    padding: 10px 20px;
    margin: 3px 10px;
  }

  :deep(.sub-nav .nav-link) {
    padding: 8px 16px;
    font-size: 12px;
  }
}

@media (max-width: 991px) {
  :deep(.nav-item .nav-text.static-item) {
    font-size: 10px;
    padding: 16px 20px 6px 20px;
  }

  .hr-horizontal {
    margin: 12px 20px;
  }
}

/* ─── Dark mode ───────────────────────── */
@media (prefers-color-scheme: dark) {
  :deep(.nav-item > .nav-link:not(.active)) {
    color: #e5e7eb;
  }

  :deep(.sub-nav .nav-link:not(.active)) {
    color: #d1d5db;
  }

  :deep(.nav-item .nav-text.static-item) {
    color: #8aa0ba;
  }

  .hr-horizontal {
    border-top-color: rgba(46, 84, 126, 0.25);
  }
}

/* ─── Utility states ──────────────────── */
.sidebar-loading {
  opacity: 0.6;
  pointer-events: none;
}

.sidebar-empty {
  padding: 40px 24px;
  text-align: center;
  color: #8aa0ba;
  font-size: 13px;
}
</style>
