<template>
<div id="app">
  <v-app id="inspire">
    <Toolbar v-bind:components="this.components" />
    <router-view></router-view>
    <Footer />
  </v-app>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Toolbar from './components/Toolbar.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'app',
  components: {
    Toolbar,
    Footer,
  },
  data: () => ({
    components: [
      {
        name: 'Front Page',
        route: '/',
        auth_only: false,
      },
      {
        name: 'Data Management',
        route: '/data',
        auth_only: true,
      },
      {
        name: 'Pipelines Editor',
        route: '/editor',
        auth_only: true,
      },
      {
        name: 'Pipelines Manager',
        route: '/manager',
        auth_only: true,
      },
    ],
  }),
  computed: mapGetters('auth', [
    'isAuthenticated',
  ]),
};
</script>

<style>
</style>
