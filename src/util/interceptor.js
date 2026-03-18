import axios from 'axios'

import store from '../store'
import router from '../router'
import Swal from "sweetalert2";

export default function setup () {
    axios.interceptors.request.use(function (config) {
        const token = window.localStorage.getItem('token')
        const tokenUrls = ['authenticate', 'activate']
        var tokenUrl = 0
        for (var i = 0; i < tokenUrls.length; i++) {
            tokenUrl = config.url.indexOf(tokenUrls[i])
            if (tokenUrl !== -1) {
                break
            }
        }
        // if token exists and token url not the current request url used to get the token
        if (token && tokenUrl === -1) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    }, function (err) {
        return Promise.reject(err)
    })

    axios.interceptors.response.use(function (response) {
        return response
    }, function (error) {
        if (!error.response) {
            console.log('Network error')
            return Promise.reject(error)
        }
        console.log(error.response)
        if (error.response.status === 403) {
            console.log("User Session has expired")
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Session has expired!',
            });
            store.commit('clearAuthState');
            router.push('/signin');

        }
        // store.state.networkError = false
        return Promise.reject(error)
    })
}
