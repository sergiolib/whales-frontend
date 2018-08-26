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
                              select-all item-key="name">
                    <template slot="items" slot-scope="props">
                        <td>
                            <v-checkbox
                                    v-model="selected[props.item.name]"
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
  import _ from 'lodash';

  export default {
    data() {
      return {
        elements: [],
        selected: {},
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
      },
        save: _.debounce(function () {
          this.saved_state = false;
          let url = api_url + "user_pipelines/save/" + this.scope;
          const options = {
            method: 'POST',
            headers: {
              'Authorization': 'Token ' + localStorage.getItem("authorization_token")
            },
            xhrFields: {
              withCredentials: true
            },
            url,
            data: {
              pipeline_name: this.pipeline_name,
              parameters: this.selected_elements,
            }
          };
          axios(options).catch(error => {
            console.log(error);
          }).then(() => {
            this.saved_state = true;
          })}, 500
        ),
      },
    mounted() {
      let url = api_url + "get/" + this.scope;
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
      scope_name: {
        type: String,
        required: true,
      },
      scope: {
        type: String,
        required: true,
      },
      pipeline_name: {
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
      selected_elements () {
        let selected = Object.entries(this.selected).filter(([k, v]) => {
          if (v) {
            return k;
          }
        }).map(e => {return e[0]});
        return Object.values(this.elements).filter(v => {
          if (selected.indexOf(v.name) > -1) {
            return v;
          }
        })
      }
    },
    watch: {
      selected: {
        deep: true,
        handler () {
          this.save()
        }
      }
    }
  }
</script>
