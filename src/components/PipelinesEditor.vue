<template>
    <v-container>
        <v-card>
            <v-card-title>
                <h1>Pipeline Editor</h1>
            </v-card-title>
            <v-card-text>
                <p>This module allows the user to create and modify the processing pipeline.</p>
            </v-card-text>
            <v-card-text>
                <v-select
                        :items="pipelines_selector_items"
                        box
                        label="Create new pipeline or select to modify"
                        @change="checkUserLoadedType"
                ></v-select>
                <v-select
                        :items="pipelines_types_description"
                        box
                        label="Pipeline Type"
                        v-model="selected_pipeline_type"
                        :disabled="pipeline_selected !== create_option"
                ></v-select>
            </v-card-text>
        </v-card>
        <v-flex xs12 sm8 offset-sm2 v-if="pipeline_selected === create_option">
            <v-divider></v-divider>
            <v-card>
                <v-text-field label="Enter a unique name for the pipeline to create"
                              v-model="new_pipeline_name" style="padding-top: 30px"></v-text-field>
                <v-card-text class="text-xs-right">
                    <v-btn large :disabled="selected_pipeline_type === '' || new_pipeline_name.length === 0"
                           @click="create_pipeline">Create pipeline</v-btn>
                </v-card-text>
            </v-card>
        </v-flex>
        <v-flex xs12 sm8 offset-sm2 v-else-if="loaded_pipelines_names.includes(pipeline_selected)">
            <v-card>
                <v-card-text>
                    <v-layout>
                        <h4 class="text-xs-left">{{ loaded_pipeline.name }} parameters</h4>
                        <v-spacer></v-spacer>
                        <v-fab-transition>
                            <v-btn color="blue"
                                   dark
                                   fab
                                   fixed
                                   bottom
                                   right v-if="this.saved_state"
                                   @click="save_users_pipelines"><v-icon class="text-xs-right">fa-save</v-icon></v-btn>
                            <v-btn color="blue"
                                   dark
                                   fab
                                   fixed
                                   bottom
                                   right v-else
                                   @click="save_users_pipelines"><v-icon class="text-xs-right">fa-hourglass-end</v-icon></v-btn>
                        </v-fab-transition>
                    </v-layout>
                    <p v-for="(param, param_name) in loaded_pipeline.parameters" :key="param_name" v-if="['str', 'bool', 'int'].includes(param.type)">
                        <input v-if="param.type === 'str'" :id="param_name" v-model="param.value" />
                        <input type="checkbox" v-else-if="param.type === 'bool'" :id="param_name" v-model="param.value" />
                        <input type="number" v-else-if="param.type === 'int'" :id="param_name" v-model="param.value" />
                        <label :for="param_name">{{ param_name }}</label>
                    </p>
                    <FilesForm :selected.sync="loaded_pipeline.parameters.input_data.value"
                               v-if="Object.keys(loaded_pipeline.parameters).includes('input_data')"
                               scope_name="Data files" scope="data_files" />
                    <FilesForm :selected.sync="loaded_pipeline.parameters.input_labels.value"
                               v-if="Object.keys(loaded_pipeline.parameters).includes('input_labels')"
                               scope_name="Labels files" scope="labels_files" />
                    <Module scope="pre_processing" scope_name="Pre processing" icon="transform"
                            v-if="Object.keys(loaded_pipeline.parameters).includes('pre_processing')"
                            :parameters_data.sync="loaded_pipeline.parameters.pre_processing.value" />
                    <Module scope="features_extractors" scope_name="Features extractors" icon="equalizer"
                            v-if="Object.keys(loaded_pipeline.parameters).includes('features_extractors')"
                            :parameters_data.sync="loaded_pipeline.parameters.features_extractors.value" />
                    <Module scope="performance_indicators" scope_name="Performance indicators" icon="art_track"
                            v-if="Object.keys(loaded_pipeline.parameters).includes('performance_indicators')"
                            :parameters_data.sync="loaded_pipeline.parameters.performance_indicators.value" />
                    <MachineLearning
                            v-if="Object.keys(loaded_pipeline.parameters).includes('machine_learning')"
                            :parameters_data.sync="loaded_pipeline.parameters.machine_learning.value"/>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-container>
</template>

<script>
  import axios from 'axios';
  import {api_url} from "../config";
  import Module from './Module.vue';
  import MachineLearning from './MachineLearning';
  import 'materialize-css'; // It installs the JS asset only
  import 'materialize-css/dist/css/materialize.min.css';
  import FilesForm from "./FilesForm";
  import _ from 'lodash';

  const insert = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index)
  ];

  export default {
    components: {
      Module,
      MachineLearning,
      FilesForm,
    },
    data() {
      return {
        create_option: "Create new pipeline",  // Constant
        pipelines_types: [],  // Array of pipelines types from API
        loaded_pipelines: [],  // Array of pipelines existing in DB
        pipeline_selected: "",  // First selector model: name of pipeline (member of loaded_pipelines_names) or create_option
        selected_pipeline_type: "",  // Second selector model: changeable only if pipeline_selected === create_option
        new_pipeline_name: "",  // When creating a new pipeline, this is the name the used gives to it
        saved_state: false,  // If true, the form has been saved. Else, it is pending
      };
    },
    computed: {
      pipelines_types_description () {
        return this.pipelines_types.map(elem => elem.description);
      },
      loaded_pipelines_names () {
        return this.loaded_pipelines.map(elem => elem.name);
      },
      pipelines_selector_items () {
        return insert(insert(this.loaded_pipelines_names, 0, this.create_option), 1, '---')
      },
      loaded_pipeline() {
        return this.loaded_pipelines.find(pip => pip.name === this.pipeline_selected);
      },
    },
    methods: {
      checkUserLoadedType (name) {
        this.pipeline_selected = name;
        let pipeline_object = this.loaded_pipelines.find(elem => elem.name === name);
        // this.populate_remaining_data(pipeline_object);
        if (this.loaded_pipelines_names.includes(name)) {
          this.selected_pipeline_type = pipeline_object.type;
        } else {
          this.selected_pipeline_type = '';
        }
      },
      load_pipelines_types() {
        let url = api_url + "pipelines/";
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
          this.pipelines_types = request.data;
        });
      },
      load_users_pipelines() {
        let url = api_url + "user_pipelines/";
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
          this.loaded_pipelines = request.data;
        });
      },
      save_users_pipelines: _.debounce(function () {
        this.saved_state = false;
        let url = api_url + "user_pipelines/";
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
            pipeline_name: this.pipeline_selected,
            parameters: this.loaded_pipeline.parameters,
          }
        };
        axios(options).catch(error => {
          console.log(error);
        }).then(() => {
          this.saved_state = true;
        })}, 500
        ),
      create_pipeline() {
        let data = {
          new_pipeline_name: this.new_pipeline_name,
          new_pipeline_type: this.selected_pipeline_type
        };
        let url = api_url + "user_pipelines/";
        const options = {
          method: 'POST',
          headers: {
            'Authorization': 'Token ' + localStorage.getItem("authorization_token")
          },
          xhrFields: {
            withCredentials: true
          },
          url,
          data: data
        };
        axios(options).catch(error => {
          console.log(error);
        }).then(() => {
          this.load_users_pipelines();
          this.$forceUpdate();
          this.pipeline_selected = this.new_pipeline_name;
          this.new_pipeline_name = '';
        });
      },
    },
    watch: {
      loaded_pipeline: {
        deep: true,
        handler () {
          if (this.loaded_pipeline === undefined) {
            return;
          }
          if ("parameters" in this.loaded_pipeline) {
            this.save_users_pipelines()
          }
        }
      }
    },
    created () {
      this.load_pipelines_types();
      this.load_users_pipelines();
    }
  };
</script>
