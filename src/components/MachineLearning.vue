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

  export default {
    data() {
      return {
        selected_type: '',
        selected_model: '',
        elements: {},
        element_types: [],
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
    created() {
      let suffix1 = "supervised_methods";
      let suffix2 = "unsupervised_methods";
      let suffix3 = "semi_supervised_methods";

      [suffix1, suffix2, suffix3].forEach(suffix => {
        axios(this.options(api_url + suffix + "/")).catch(error => {
          console.log(error);
        }).then(request => {
          if (request.data.length > 0) {
            this.elements[suffix] = request.data;
            this.element_types.push(suffix)
          }
        });
      });
    },
    props: {
      parameters_data: {
        type: Object,
        required: true,
      }
    },
    computed: {
      selected_element() {
        try {
          return this.elements[this.selected_type][this.elemIndex]
        } catch (e) {
          return {}
        }
      },
      elemIndex() {
        return this.elements[this.selected_type].findIndex(elem => elem.description === this.selected_model);
      }
    },
    watch: {
      selected_element(value) {
        if (value !== undefined) {
          this.$emit('update:parameters_data', value);
        }
      }
    }
  }
</script>
