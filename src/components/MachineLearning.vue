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
                    <v-select :items="Array.from(new Set (elements.map(elem => {return elem.type})))"
                              v-model="selected_type"/>
                    <span>Type</span>
                </label>
            </li>
            <li class="collection-item" v-if="selected_type !== ''">
                <label>
                    <v-select type="checkbox"
                              :items="elements.filter(elem => elem.type === selected_type).map(elem => elem.description)"
                              v-model="selected_model"/>
                    <span>Method</span>
                </label>
            </li>
            <li class="collection-item" v-if="selected_model !== '' && selected_type !== ''">
                <v-card>
                    <v-card-title>Parameters</v-card-title>
                    <v-card-text v-for="(value, parameter) in elements.filter(elem => elem.description === selected_model)[0].parameters"
                                 :key="parameter">
                        <input :value="value.value" id="parameter" />
                        <label for="parameter">{{ parameter }}</label>
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
        elements: []
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
      }
    },
    mounted() {
      let url1 = api_url + "supervised_methods/";
      let url2 = api_url + "unsupervised_methods/";
      let url3 = api_url + "semi_supervised_methods/";

      [url1, url2, url3].forEach(url => {
        axios(this.options(url)).catch(error => {
          console.log(error);
        }).then(request => {
          let elements = request.data;  // Array
          elements = elements.map(elem => {
            elem.type = url.split('/')[5];
            return elem;
          });
          this.elements = this.elements.concat(elements);
        });
      });
    },
  }
</script>
