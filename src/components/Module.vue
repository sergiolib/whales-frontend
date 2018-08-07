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
                <input type="checkbox" v-model="element.value" :id="element.name" />
                <label :for="element.name">{{ element.description }}</label>

                <v-card v-if="Object.keys(element.parameters).length > 0 && element.value">
                    <v-card-title>Parameters</v-card-title>
                    <v-card-text>
                         <p v-for="(value, parameter) in element.parameters" :key="parameter">
                            <input v-if="value.type === 'int'" type="number" :name="parameter" :id="parameter"
                                   v-model="value.value" />
                            <input v-else-if="value.type === 'float'" type="number" step=0.1 :name="parameter"
                                   :id="parameter" v-model="value.value" />
                            <input v-else-if="value.type === 'bool'" type="checkbox" :value="parameter"
                                   :name="parameter" :id="parameter" v-model="value.value" />
                             <v-select v-else-if="value.options !== null" :items="value.options"
                                       v-model="value.value"></v-select>
                            <input v-else :name="parameter" :id="parameter" v-model="value.value" />
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
  import { api_url } from '../config';
  export default {
    name: "Module",
    data () {
      return {
        elements: [],
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
      parameters_data: {
        type: Array,
        required: true,
      }
    },
    created () {
      let url = api_url + this.scope + "/";
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
        this.elements = request.data;  // Array
      });
    },
    watch: {
      elements (oldVal, newVal) {
        this.$emit('update:parameters_data', newVal);
      }
    },
  }
</script>

<style scoped>

</style>