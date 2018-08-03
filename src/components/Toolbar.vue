<template>
    <v-card color="grey lighten-4" flat>
        <v-toolbar color="blue-grey darken-1" dark>
            <v-menu :nudge-width="100">
                <v-toolbar-title slot="activator">
                    <v-layout>
                        <span>{{ this.$route.name }}</span>
                        <v-icon dark>arrow_drop_down</v-icon>
                    </v-layout>
                </v-toolbar-title>
                <v-list>
                    <v-list-tile
                            v-for="item in components"
                            :key="item.name"
                            :to="item.route"
                            :disabled="item.auth_only && !$store.getters.isLoggedIn"
                    >
                        <v-list-tile-title v-text="item.name"></v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
            <v-spacer></v-spacer>
            <v-icon>fa-fish</v-icon>
            <v-toolbar-title class="text-md-center">Whales detector application</v-toolbar-title>
            <Login />
        </v-toolbar>
    </v-card>
</template>

<script>
import Login from "./Login.vue";

export default {
  components: {
    Login
  },
  props: {
    components: {
      type: Array,
      required: true
    }
  }
};
</script>
