<template>
<div>
  <ul class="collection with-header">
    <li class="collection-header">
      <h4>
	Machine Learning
	<v-icon large class="right">lightbulb_outline</v-icon>
    </h4></li>
    <li class="collection-item">
      <label>
	<v-select :items="module_types" v-model="selected_type" />
	<span>Type</span>
      </label>
    </li>
    <li class="collection-item" v-if="selected_type in modules && Object.keys(modules[selected_type]).length > 0">
      <label>
    	<v-select type="checkbox" :items="Object.keys(modules[selected_type])" v-model="selected_model" />
    	<span>Method</span>
      </label>
    </li>
    <li class="collection-item" v-if="selected_type in modules && selected_model in modules[selected_type]">
      <v-card>
    	<v-card-title>Parameters</v-card-title>
    	<v-card-text>
    	  <label v-for="(value, parameter) in modules[selected_type][selected_model].parameters" :key="parameter"><input :value="value.value" /><span>{{ parameter }}</span></label>
    	</v-card-text>
      </v-card>
    </li>
  </ul>
</div>
</template>

<script>
import http from '../api/session';

export default {
  data() {
    return {
      selected_type: '',
      selected_model: '',
      modules: {},
      checked: {},
	    module_types: [],
    };
  },
  mounted() {
    http.get('supervised_methods')
      .then((response) => {
        const data = response.data;
        const new_data = {};
        for (const k in data) {
          const desc = data[k].description;
          new_data[desc] = data[k];
        }
        this.modules.supervised = new_data;
        this.module_types.push('supervised');
      });
    http.get('unsupervised_methods')
      .then((response) => {
        const data = response.data;
        const new_data = {};
        for (const k in data) {
          const desc = data[k].description;
          new_data[desc] = data[k];
        }
        this.modules.unsupervised = new_data;
        this.module_types.push('unsupervised');
      });
    http.get('semi_supervised_methods')
      .then((response) => {
        const data = response.data;
        const new_data = {};
        for (const k in data) {
          const desc = data[k].description;
          new_data[desc] = data[k];
        }
        this.modules.semi_supervised = new_data;
        this.module_types.push('semi_supervised');
      });
  },
};
</script>
