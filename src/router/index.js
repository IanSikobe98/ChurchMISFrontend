import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Error404Page from '@/views/errors/Error404Page.vue'
import IndexPage from '@/views/dashboards/IndexPage.vue'
import CreateUser from '@/views/user/CreateUser.vue'
import ViewUsers from '@/views/user/ViewUsers.vue'
import ViewUserApprovals from '@/views/user/ViewUserApprovals.vue'
import UpdateUser from '@/views/user/UpdateUser.vue'
import ViewRoles from '@/views/roles/ViewRoles.vue'
import CreateRoles from '@/views/roles/CreateRoles.vue'
import ViewRoleApprovals from '@/views/roles/ViewRoleApprovals.vue'
import UpdateRole from '@/views/roles/UpdateRole.vue'
import ViewDealCodes from '@/views/teller/ViewDealCodes.vue'
import ConvertCurrency from '@/views/currency/ConvertCurrency.vue'


const defaultChildRoutes = (prefix) => [
  {
    path: '',
    name: prefix + '.dashboard',
    meta: { auth: true, name: 'Home', isBanner: true, requiresAuth: true },
    component: IndexPage
  },

  {
    path: '/createUser',
    name: prefix + '.createUser',
    meta: { auth: true, name: 'CreateUser', isBanner: true, requiresAuth: true },
    component: CreateUser
  },

  {
    path: '/viewUsers',
    name: prefix + '.viewUsers',
    meta: { auth: true, name: 'viewUsers', isBanner: true, requiresAuth: true },
    component: ViewUsers
  },
  {
    path: '/updateUser',
    name: prefix + '.updateUser',
    meta: { auth: true, name: 'updateUser', isBanner: true, requiresAuth: true },
    component: UpdateUser
  },

  {
    path: '/viewUserApprovals',
    name: prefix + '.viewUserApprovals',
    meta: { auth: true, name: 'viewUserApprovals', isBanner: true, requiresAuth: true },
    component: ViewUserApprovals
  },

  {
    path: '/viewRoles',
    name: prefix + '.viewRoles',
    meta: { auth: true, name: 'viewRoles', isBanner: true, requiresAuth: true },
    component: ViewRoles
  },
  {
    path: '/createRoles',
    name: prefix + '.createRoles',
    meta: { auth: true, name: 'CreateRoles', isBanner: true, requiresAuth: true },
    component: CreateRoles
  },

  {
    path: '/viewDealCodes',
    name: prefix + '.viewDealCodes',
    meta: { auth: true, name: 'viewDealCodes', isBanner: true, requiresAuth: true },
    component: ViewDealCodes
  },
  {
    path: '/convertCurrency',
    name: prefix + '.convertCurrency',
    meta: { auth: true, name: 'convertCurrency', isBanner: true, requiresAuth: true },
    component: ConvertCurrency
  },


  {
    path: '/viewRoleApprovals',
    name: prefix + '.viewRoleApprovals',
    meta: { auth: true, name: 'viewRoleApprovals', isBanner: true, requiresAuth: true },
    component: ViewRoleApprovals
  },
  {
    path: '/updateRole',
    name: prefix + '.updateRole',
    meta: { auth: true, name: 'updateRole', isBanner: true, requiresAuth: true },
    component: UpdateRole
  },


]

const routes = [

  {
    path: '/signIn',
    name: 'SignIn',
    component: () => import('../views/auth/SignIn.vue'),
  },

  {
    path: '/validateOtp',
    name: 'ValidateOtp',
    meta: { description: 'ValidateOtp', requiresAuth: true,validateOtp: true },
    component: () => import('../views/auth/ValidateOtp.vue'),
  },
  {
    path: '/',
    name: 'defaultLayout',
    component: () => import('../layouts/DefaultLayout.vue'),
    children: defaultChildRoutes('default')
  },
  {
    path: "/:catchAll(.*)",
    name: "Error404Page",
    component: Error404Page,
    meta: { description: 'Error404Page', requiresAuth: true }
  },
]


const router = createRouter({
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  history: createWebHistory(process.env.BASE_URL),
  base: process.env.BASE_URL,
  routes
})

// Some middleware to help us ensure the user is authenticated.
router.beforeEach((to, from, next) => {
  if (
    to.matched.some((record) => record.meta.validateOtp) &&
    (store.state.username && store.state.username !== 'null') && (store.state.password && store.state.password !== 'null')
  ){

    window.console.log('validateOtp')
    next();
  }
  else {
    if (
      to.matched.some((record) => record.meta.requiresAuth) &&
      (!store.state.token || store.state.token === 'null')
    ) {
      // this route requires auth, check if logged in
      // if not, redirect to login page.
      window.console.log('Not authenticated')
      next({
        path: '/signin',
        query: {redirect: to.fullPath}
      })
    } else {
      if (to.matched.some((record) => record.meta.validateOtp)) {
        window.console.log('Not Otp State')
        next({
          path: '',
          query: {redirect: to.fullPath}
        })
      } else {
        if (store.state.token !== null) {
          // const token = store.state.token.slice(7)
          // checkToken(token)
        }
        next()
      }
    }
  }
})


export default router
