<template>
    <div>
        <ul class="collection with-header">
            <li class="collection-header">
                <h4>
                    {{ scope_name }}
                    <v-icon large class="right">{{ icon }}</v-icon>
                </h4>
            </li>
            <li class="collection-item" v-for="element in elements" :key="element.description">
                <input type="checkbox" v-model="element.value" :id="element.name"/>
                <label :for="element.name">{{ element.description }}</label>

                <v-card v-if="Object.keys(element.parameters).length > 0 && element.value">
                    <v-card-title>Parameters</v-card-title>
                    <v-card-text>
                        <p v-for="(value, parameter) in element.parameters" :key="parameter">
                            <input v-if="value.type === 'int'" type="number" :name="parameter" :id="parameter"
                                   v-model="value.value"/>
                            <input v-else-if="value.type === 'float'" type="number" step=0.1 :name="parameter"
                                   :id="parameter" v-model="value.value"/>
                            <input v-else-if="value.type === 'bool'" type="checkbox" :value="parameter"
                                   :name="parameter" :id="parameter" v-model="value.value"/>
                            <v-select v-else-if="value.options !== null" :items="value.options"
                                      v-model="value.value"></v-select>
                            <input v-else :name="parameter" :id="parameter" v-model="value.value"/>
                            <label :for="parameter">{{ parameter }}</label>
                        </p>
                    </v-card-text>
                </v-card>
            </li>
        </ul>
    </div>
</template>

<script>
  import axios from 'axios';
  import {api_url} from "../config";
  import _ from 'lodash';

  export default {
    name: "Module",
    data() {
      return {
        elements: [],
        can_save: false,
      }
    },
    props: {
      scope: {
        type: String,
      },
      scope_name: {
        type: String,
      },
      icon: {
        type: String,
      },
      pipeline_name: {
        type: String,
        required: true,
      }
    },
    methods: {
      save: _.debounce(function () {
          if (this.can_save) {
              let url = api_url + "user_pipelines/save/" + this.scope + "?pipeline_name=" + this.pipeline_name;
              let saved_elements = [];
              this.elements.forEach(element => {
                if (element.value === true) {
                  saved_elements.push({
                    "method": element.name,
                    "parameters": element.parameters
                  });
                }
              });
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
                  value: saved_elements,
                }
              };
              axios(options).catch(error => {
                console.log(error);
              }).then();
          }
        }, 500
      ),
      reload_users_parameters () {
        this.can_save = false;
        let url = api_url + "user_pipelines/load/" + this.scope + "?pipeline_name=" + this.pipeline_name;
        const options = {
          method: 'GET',
          headers: {
            'Authorization': 'Token ' + localStorage.getItem("authorization_token")
          },
          xhrFields: {
            withCredentials: true
          },
          url,
        };
        axios(options).catch(error => {
          console.log(error);
        }).then(response => {
          return response.data.value;
        }).then(user_response => {
          user_response.forEach(pipeline_element => {
            this.elements.forEach(e => {
              if (e.name === pipeline_element.method) {
                e.parameters = Object.assign(pipeline_element.parameters, e.parameters);
                e['value'] = true;
              }
            })
          });
          this.can_save = true;
        })
      }
    },
    mounted() {
      let url = api_url + "get/" + this.scope + "?pipeline_name=" + this.pipeline_name;
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + localStorage.getItem("authorization_token")
        },
        xhrFields: {
          withCredentials: true
        },
        url,
      };
      axios(options).catch(error => {
        console.log(error);
      }).then(request => {
        // Get elements list
        return request.data;
      }).then(elements => {
        // Get users settings
        this.can_save = false;
        this.elements = elements;
        this.reload_users_parameters()
      })
    },
    watch: {
      elements: {
        deep: true,
        handler() {
          this.save()
        }
      },
      pipeline_name () {
        this.reload_users_parameters();
      }
    },
  }
</script>