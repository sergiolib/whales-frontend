<template>
    <div>
        <ul class="collection with-header">
            <li class="collection-header">
                <h4>
                    {{ scope_name }}
                    <v-icon large class="right">fa-database</v-icon>
                </h4>
            </li>
            <li>
                <v-data-table :items="elements" :headers="table_headers"
                              select-all item-key="name" v-model="local_selected">
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
                    </template>
                    <template slot="no-data">
                        <v-alert :value="true" color="error" icon="warning">
                            {{ alert_message }}
                        </v-alert>
                    </template>
                </v-data-table>
            </li>
        </ul>
    </div>
</template>

<script>
  import axios from 'axios';
  import { api_url } from "../config";

  export default {
    data() {
      return {
        elements: [],
      };
    },
    methods: {
      options: url => {
        return {
          method: 'GET',
          headers: {
            'Authorization': 'Token ' + localStorage.getItem("authorization_token")
          },
          xhrFields: {
            withCredentials: true
          },
          url,
        }
      },
      param_type(t) {
        switch (t) {
          case "bool":
            return "checkbox";
          default:
            return "text";
        }
      }
    },
    mounted() {
      let url = api_url + this.scope + "/";
      axios(this.options(url)).catch(error => {
        console.log(error);
      }).then(request => {
        let elements = request.data;  // Array
        elements = elements.map(elem => {
          return elem;
        });
        this.elements = elements;
      });
    },
    props: {
      selected: {
        type: Array,
        required: true,
      },
      scope_name: {
        type: String,
        required: true,
      },
      scope: {
        type: String,
        required: true,
      }
    },
    computed: {
      table_headers() {
        if (this.scope_name === undefined) {
          return [];
        }
        return [{
          value: 'name',
          text: this.scope_name + ' name',
          align: 'left',
        },
          {
            text: 'Owner',
            value: 'owner',
          }]
      },
      alert_message () {
        if (this.scope_name === undefined) {
          return [];
        }
        return 'There are no ' + this.scope_name + ' available for you'
      },
      local_selected: {
        get() {
          return this.selected;
        },
        set(val) {
          this.$emit('update:selected', val);
        }
      }
    },
  }
</script>
