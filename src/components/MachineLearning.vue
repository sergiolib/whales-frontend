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
                              v-model="selected_type" />
                    <span>Type</span>
                </label>
            </li>
            <li class="collection-item" v-if="selected_type !== ''">
                <label>
                    <v-select type="checkbox"
                              :items="elements[selected_type].map(elem => elem.description)"
                              v-model="selected_model" />
                    <span>Method</span>
                </label>
            </li>
            <li class="collection-item" v-if="selected_model !== '' && selected_type !== ''">
                <v-card>
                    <v-card-title><h4>Parameters</h4></v-card-title>
                    <v-card-text v-for="(value, parameter) in elements[selected_type][elemIndex].parameters"
                                 :key="parameter">
                        <input v-model="elements[selected_type][elemIndex].parameters[parameter].value"
                               :type="param_type(value.type)" :id="parameter" :name="parameter"
                               v-if="value.options === null" />
                        <v-select v-model="elements[selected_type][elemIndex].parameters[parameter].value" type="text"
                                  :id="parameter" :items="value.options" :name="parameter"
                                  v-else-if="value.type === 'str'" />
                        <input v-model="elements[selected_type][elemIndex].parameters[parameter].value" type="range"
                               :id="parameter" step=1 :min="value.options[0]" :max="value.options[1]" :name="parameter"
                               v-else-if="value.type === 'int'" />
                        <label :for="parameter">{{ parameter }}</label>
                    </v-card-text>
                </v-card>
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
        selected_type: '',
        selected_model: '',
        elements: {},
        element_types: [],
        saved_state: false,  // If true, the form has been saved. Else, it is pending
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
        this.saved_state = false;
        let url = api_url + "user_pipelines/save/machine_learning";
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
            type: this.selected_type,
            parameters: this.selected_element.parameters,
            value: this.selected_element.name,
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
      let suffix1 = "supervised_methods";
      let suffix2 = "unsupervised_methods";
      let suffix3 = "semi_supervised_methods";

        [suffix1, suffix2, suffix3].forEach(suffix => {
          axios(this.options(this.pipeline_name, api_url + "user_pipelines/load/machine_learning")).catch(error => {
            console.log(error);
          }).then(response => {
              this.elements = response.data.options;
              this.selected_type = response.data.type;
              let model_name = response.data.value;
              let elem = this.elements[this.selected_type].filter(e => e.name === model_name)[0];
              this.selected_model = elem.description;
              if (Object.keys(response.data).indexOf("parameters") > -1) {
                elem.parameters = response.data.parameters;
              }
            })
          }
      )
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
          return this.elements[this.selected_type][this.elemIndex]
        } catch (e) {
          return {};
        }
      },
      elemIndex() {
        return this.elements[this.selected_type].findIndex(elem => elem.description === this.selected_model);
      },
      parameters() {
        try {
          return this.elements[this.selected_type][this.elemIndex].parameters;
        } catch (e) {
          return {};
        }
      },
    },
    watch: {
      selected_element: {
        deep: true,
        handler () {
          if (!_.isEmpty(this.selected_element)) {
            this.save();
          }
        }
      }
    }
  }
</script>
