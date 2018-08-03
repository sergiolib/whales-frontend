import Vue from 'vue';
import Vuex from 'vuex';
import {users_url} from './config';
import axios from 'axios';
import http from './api/session';

Vue.use(Vuex);

const LOGIN = "LOGIN";
const LOGIN_FAILED = "LOGIN_FAILED";
const LOGOUT = "LOGOUT";

const store = new Vuex.Store({
  state: {
    isLoggedIn: !!localStorage.getItem('access_token'),
  },
  mutations: {
    [LOGIN](state) {
      state.isLoggedIn = true;
    },
    [LOGOUT](state) {
      state.isLoggedIn = false;
    },
    [LOGIN_FAILED](state) {
      state.isLoggedIn = false;
    },
  },
  actions: {
    login: function ({commit}) {
      Vue.googleAuth().directAccess();
      Vue.googleAuth().signIn(function (google_user) {
        localStorage.setItem("access_token", google_user.Zi.access_token);
        axios.post(users_url, {
          access_token: google_user.Zi.access_token,
        }).then(response => {
          localStorage.setItem("authorization_token", response.data.key);
          let profile = google_user.getBasicProfile();
          localStorage.setItem("full_name", profile.getName());
          localStorage.setItem("user_image", profile.getImageUrl());
          commit(LOGIN);
        });
      }, function (error) {
        console.log(error);
      });
    },
    logout({ commit }) {
      Vue.googleAuth().signOut(function () {
        localStorage.removeItem("access_token");
        localStorage.removeItem("full_name");
        localStorage.removeItem("user_image");
        localStorage.removeItem("authorization_token");
        commit(LOGOUT);
      }, function () {
        console.log("Failed logging out");
      });
    },
  },
  getters: {
    isLoggedIn: state => {
      return state.isLoggedIn;
    },
  },
});

export default store;
