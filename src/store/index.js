import { createStore, createLogger } from 'vuex'
import setting from './setting'
const debug = process.env.NODE_ENV !== 'production'
export default createStore({
  state: {
    shareOffcanvas: false,
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null, // Load from localStorage
    password: localStorage.getItem('password') || null,
    user: localStorage.getItem('user') || null,
  },
  getters: {
    shareOffcanvas: (state) => state.shareOffcanvas
  },
  mutations: {
    setUsername(state, username) {
      state.username = username;
      localStorage.setItem('username', username);
    },
    // Define a mutation to set the password
    setPassword(state, password) {
      state.password = password;
      localStorage.setItem('password', password);
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    setUser(state,user){
      state.user = user;
      localStorage.setItem('user',user);
    },
    clearOtpState(state) {
      state.username = '';
      state.password = '';
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    },
    clearAuthState(state) {
      state.token = '';
      state.user = '';
      localStorage.clear();
    },
    openBottomCanvasCommit(state, payload) {
      state[payload.name] = payload.value
    }
  },
  actions: {
    openBottomCanvasAction({ commit }, payload) {
      commit('openBottomCanvasCommit', payload)
    }
  },
  modules: {
    setting: setting
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
