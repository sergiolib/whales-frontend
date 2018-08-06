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
                <input type="checkbox" v-model="checked[element.name]" :id="element.name" />
                <label :for="element.name">{{ element.description }}</label>

                <v-card v-if="Object.keys(element.parameters).length > 0 && checked[element.name]">
                    <v-card-title>Parameters</v-card-title>
                    <v-card-text>
                         <div v-for="parameter in Object.keys(element.parameters)" :key="parameter">
                            <input :value="element.parameters[parameter].value" />
                            <label :for="parameter">{{ parameter }}</label>
                         </div>
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
        checked: {},
      }
    },
    props: {
      scope: {
        type: String
      },
      scope_name: {
        type: String
      },
      icon: {
        type: String
      },
    },
    created () {
      let url = api_url + this.scope + "/";
      console.log(url);
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
        let checked = {};
        for (const element_id in this.elements) {
          checked[this.elements[element_id].name] = false;
        }
        this.checked = checked;
      });
    }
  }
</script>

<style scoped>

</style>