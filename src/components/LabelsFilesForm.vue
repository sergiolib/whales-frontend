<template>
    <div>
        <ul class="collection with-header">
            <li class="collection-header">
                <h4>
                    Labels Files
                    <v-icon large class="right">fa-tag</v-icon>
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
        table_headers: [
          {
            value: 'name',
            text: 'Labels file name',
            align: 'left',
          },
          {
            text: 'Owner',
            value: 'owner',
          }
        ],
        alert_message: 'There are no labels files available for you',
        local_selected: [],
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
      let url = api_url + "labels_files/";
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
      }
    },
    watch: {
      local_selected (data) {
        let output = [];
        data.forEach(df => {
          output.push(df.name);
        });
        this.$emit('update:selected', output);
      }
    }
  }
</script>
