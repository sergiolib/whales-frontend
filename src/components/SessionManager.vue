<template>
    <v-dialog width="500">
        <v-btn icon slot="activator">
            <div>
                <v-icon x-large>fa-user</v-icon>
            </div>
        </v-btn>
        <v-card>
            <v-card-title>Welcome, {{ user() }}</v-card-title>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
  name: 'SessionManager',
  data() {
    return {
    };
  },
  methods: {
    user() {},
  },
};
</script>
