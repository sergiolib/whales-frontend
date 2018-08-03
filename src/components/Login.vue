<template>
    <div>
        <v-btn fab dark color="blue-grey darken-3" @click="login" v-if="!is_logged_in"><v-icon>fa-sign-in-alt</v-icon></v-btn>
        <a @click="logout" :title="user_name" v-else>
            <v-avatar
                    style="margin: 10px"
                    slot="activator"
            >
                <img
                        v-if="user_image != null"
                        :src="user_image"
                >
                <v-icon
                        v-else
                        color="blue-grey darken-3"
                >fa-user-secret</v-icon>
            </v-avatar>
        </a>
    </div>
</template>

<script>
import Vuex from 'vuex';
import 'materialize-css';

export default {
  data() {
    return {
    };
  },
  methods: {
    login () {
        this.$store.dispatch("login");
    },
    logout () {
        this.$store.dispatch("logout");
    },
  },
  computed: {
    ...Vuex.mapGetters({
      is_logged_in: "isLoggedIn",
    }),
    user_name () {
      return "Logged in as " + this.full_name
    },
    full_name () {
      return localStorage.getItem("full_name");
    },
    user_image () {
      return localStorage.getItem("user_image");
    },
  }
};
</script>
