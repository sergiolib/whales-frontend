<template>
    <div>
        <ul class="collection with-header">
            <li class="collection-header">
                <h4>
                    Machine Learning
                    <v-icon large class="right">lightbulb_outline</v-icon>
                </h4>
            </li>
            <li class="collection-item">
                <label>
                    <v-select :items="element_types"
                              v-model="selected_type"/>
                    <span>Type</span>
                </label>
            </li>
            <li class="collection-item" v-if="selected_type !== ''">
                <label>
                    <v-select type="checkbox"
                              :items="elements.map(elem => elem.description)"
                              v-model="selected_model"/>
                    <span>Method</span>
                </label>
            </li>
            <li class="collection-item" v-if="selected_model !== '' && selected_type !== ''">
                <v-card>
                    <v-card-title><h4>Parameters</h4></v-card-title>
                    <v-card-text v-for="(value, parameter) in elements[elemIndex].parameters"
                                 :key="parameter">
                        <input v-if="value.type === 'int'" type="number" :name="parameter" :id="parameter"
                               v-model="value.value" />
                        <input v-else-if="value.type === 'float'" type="number" step=0.1 :name="parameter"
                               :id="parameter" v-model="value.value" />
                        <input v-else-if="value.type === 'bool'" type="checkbox" :value="parameter"
                               :name="parameter" :id="parameter" v-model="value.value" />
                        <v-select v-else-if="value.options.length > 0" :items="value.options"
                                  v-model="value.value"></v-select>
                        <input v-else :name="parameter" :id="parameter" v-model="value.value" />
                        <label :for="parameter">{{ parameter }}</label>
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
    data() {
      return {
        selected_type: '',
        selected_model: '',
        elements: [],
        element_types: [],
        can_save: false,
      };
    },
    methods: {
      options: (pipeline_name, url) => {
        url = url + "?pipeline_name=" + pipeline_name;
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
          if (this.can_save) {
            let url = api_url + "user_pipelines/save/machine_learning?pipeline_name=" + this.pipeline_name;
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
                value: {
                  method: this.selected_element.name,
                  type: this.selected_element.type,
                  parameters: this.selected_element.parameters
                },
              }
            };
            axios(options).catch(error => {
              console.log(error);
            })
          }
        }, 500
      ),
      reload_users_parameters() {
        this.can_save = false;
        axios(this.options(this.pipeline_name, api_url + "user_pipelines/load/machine_learning"))
          .catch(error => {
            console.log(error);
          })
          .then(response => {
            let gotten_parameters = response.data.value;
            if (!_.isEmpty(gotten_parameters)) {
              let corresponding_element = this.elements.filter(
                elem => elem.name === gotten_parameters.method && elem.type === gotten_parameters.type)[0];
              this.selected_type = corresponding_element.type;
              this.selected_model = corresponding_element.description;
              if (Object.keys(gotten_parameters).includes("parameters") > -1) {
                corresponding_element.parameters = gotten_parameters.parameters;
              }
            }
            this.can_save = true;
          })
      }
    },
    mounted() {
      axios(this.options(this.pipeline_name, api_url + "get/machine_learning"))
        .catch(error => {
          console.log(error);
        }).then(response => {
        this.elements = response.data;
        this.element_types = Array.from(new Set(this.elements.map(elem => elem.type)));
      }).then(() => {
        this.reload_users_parameters();
      });
    },
    props: {
      pipeline_name: {
        type: String,
        required: true,
      }
    },
    computed: {
      selected_element() {
        try {
          return this.elements[this.elemIndex]
        } catch (e) {
          return {};
        }
      },
      elemIndex() {
        return this.elements.findIndex(elem => elem.description === this.selected_model);
      },
    },
    watch: {
      selected_element: {
        deep: true,
        handler() {
          if (!_.isEmpty(this.selected_element)) {
            this.save();
          }
        }
      },
      pipeline_name() {
        this.reload_users_parameters()
      },
    }
  }
</script>
