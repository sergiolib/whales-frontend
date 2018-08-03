<template>
    <div>
        <v-card-title id="LabelsList">
            <h1>{{ table_title }}</h1>
        </v-card-title>
        <v-card-text>
            <p>Showing only files that are private for the user or public.</p>
        </v-card-text>
        <v-data-table :items="elements" :headers="table_headers"
                      select-all item-key="name" v-model="selected_elements">
            <template slot="items" slot-scope="props">
                <td>
                    <v-checkbox
                            v-model="props.selected"
                            id="props.name"
                            primary
                    ></v-checkbox>
                </td>
                <td>{{ props.item.name }}</td>
                <td class="text-xs-left">{{ props.item.owner }}</td>
                <td class="text-xs-left"><v-icon>{{ props.item.public === true ? "fa-check" : "fa-times" }}</v-icon></td>
            </template>
            <template slot="no-data">
                <v-alert :value="true" color="error" icon="warning">
                    {{ alert_message }}
                </v-alert>
            </template>
        </v-data-table>

        <v-card-text>
            <v-btn :disabled="selected_elements.length <= 0" @click.native="delete_elements_inner">
                Delete {{ selected_elements.length }} {{ what_to_delete }}</v-btn>
            <v-btn :disabled="selected_elements.length <= 0" @click.native="toggle_public_elements_inner">
                Toggle {{ selected_elements.length }} {{ what_to_delete }} private/public</v-btn>
        </v-card-text>
    </div>
</template>

<script>
  export default {
    name: "CommonTable",
    data () {
      return {
        table_title: '',
        selected_elements: [],
        table_headers: [],
        what_to_delete: '',
        data_source: ''
      }
    },
    props: {
      elements: Array,
      delete_fun: Function,
      update_fun: Function,
    },
    methods: {
      delete_elements_inner () {
        this.delete_fun(this.selected_elements);
        this.selected_elements = [];
      },
      toggle_public_elements_inner () {
        this.update_fun(this.selected_elements, "toggle_public");
        this.selected_elements = [];
      }
    }
  }
</script>

<style scoped>
</style>