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
                        :items="loaded_pipelines"
                        item-text="display_name"
                        item-value="name"
                        box
                        label="Create new pipeline or select to modify"
                        v-model="pipeline_selected"
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
                           @click="create_pipeline">Create pipeline
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-flex>
        <v-flex xs12 sm8 offset-sm2 v-else-if="loaded_pipelines.map(elem => elem.name).includes(pipeline_selected)">
            <v-card>
                <v-card-text>
                    <v-layout>
                        <h4 class="text-xs-left">{{ loaded_pipeline.name }} parameters</h4>
                        <!--<v-fab-transition>
                            <v-btn color="blue"
                                   dark
                                   fab
                                   fixed
                                   bottom
                                   right v-if="this.saved_state"
                                   @click="save_parameters"><v-icon class="text-xs-right">fa-save</v-icon></v-btn>
                            <v-btn color="blue"
                                   dark
                                   fab
                                   fixed
                                   bottom
                                   right v-else
                                   @click="save_parameters"><v-icon class="text-xs-right">fa-hourglass-end</v-icon></v-btn>
                        </v-fab-transition>-->
                    </v-layout>
                    <p v-for="(param, param_name) in loaded_pipeline.parameters" :key="param_name"
                       v-if="['str', 'bool', 'int'].includes(param.type)">
                        <input v-if="param.type === 'str'" :id="param_name" v-model="param.value"
                               :oninput="save_parameters(param_name)"/>
                        <input v-else-if="param.type === 'bool'" :id="param_name" type="checkbox" v-model="param.value"
                               :oninput="save_parameters(param_name)"/>
                        <input v-else-if="param.type === 'int'" :id="param_name" type="number" v-model="param.value"
                               :oninput="save_parameters(param_name)"/>
                        <label :for="param_name">{{ param_name }}</label>
                    </p>
                    <FilesForm :pipeline_name="pipeline_selected"
                               v-if="Object.keys(loaded_pipeline.parameters).includes('input_data')"
                               scope_name="Data files" scope="input_data"/>
                    <FilesForm :pipeline_name="pipeline_selected"
                               v-if="Object.keys(loaded_pipeline.parameters).includes('input_labels')"
                               scope_name="Labels files" scope="input_labels"/>
                    <PreProcessing
                            v-if="Object.keys(loaded_pipeline.parameters).includes('pre_processing') && selected_pipeline_type.toLowerCase().includes('training')"
                            :pipeline_name="pipeline_selected"/>
                    <FeaturesExtractors
                            v-if="Object.keys(loaded_pipeline.parameters).includes('features_extractors') && selected_pipeline_type.toLowerCase().includes('training')"
                            :pipeline_name="pipeline_selected"/>
                    <PerformanceIndicators
                            v-if="Object.keys(loaded_pipeline.parameters).includes('performance_indicators')"
                            :pipeline_name="pipeline_selected"/>
                    <MachineLearning
                            v-if="Object.keys(loaded_pipeline.parameters).includes('machine_learning') && selected_pipeline_type.toLowerCase().includes('training')"
                            :pipeline_name="pipeline_selected"/>
                    <div
                            v-else-if="Object.keys(loaded_pipeline.parameters).includes('machine_learning')">
                        <ul class="collection with-header">
                            <li class="collection-header">
                                <h4>
                                    Trained model
                                    <v-icon large class="right">lightbulb_outline</v-icon>
                                </h4>
                            </li>
                            <v-select
                                    :items="trained_ml_models"
                                    box
                                    label="Trained pipeline to use"
                                    v-model="loaded_pipeline.parameters['trained_model_pipeline'].value"
                                    @change="save_parameters('trained_model_pipeline')"
                            ></v-select>
                        </ul>
                    </div>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-container>
</template>

<script>
  import axios from 'axios';
  import {api_url} from "../config";
  import FeaturesExtractors from './FeaturesExtractors.vue';
  import PerformanceIndicators from './PerformanceIndicators.vue';
  import PreProcessing from './PreProcessing.vue';
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
      PreProcessing,
      FeaturesExtractors,
      PerformanceIndicators,
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
        trained_ml_models: [],
        selected_ml_model: "",
      };
    },
    computed: {
      pipelines_types_description() {
        return this.pipelines_types.map(elem => elem.description);
      },
      loaded_pipeline() {
        return this.loaded_pipelines.find(pip => pip.name === this.pipeline_selected);
      },
    },
    methods: {
      checkUserLoadedType(name) {
        if (this.loaded_pipelines.map(elem => elem.name).includes(name)) {
          this.selected_pipeline_type = this.loaded_pipeline.type;
        } else {
          this.selected_pipeline_type = '';
        }
      },
      load_pipelines_types() {
        let url = api_url + "get/pipelines";
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
      load_users_pipelines: function () {
        let url = api_url + "user_pipelines";
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
          this.loaded_pipelines.map(elem => Object.assign(elem, {display_name: elem.name + " (" + elem.owner + ")"}));
          this.loaded_pipelines.unshift({display_name: "---", name: "---", type: ""});
          this.loaded_pipelines.unshift({display_name: this.create_option, name: this.create_option, type: ""});
          let training_pipelines = this.loaded_pipelines.filter(elem => {
            return elem.type.toLowerCase().includes("training");
          });
          let trained_models = [];
          training_pipelines.forEach(elem => {
            let url = api_url + "user_pipelines/process?pipeline_name=" + elem.name;
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
                if (response.data[0] === 3) {
                  trained_models.push(elem.name);
                }
                return trained_models;
            }).then(trained_models => {
              this.trained_ml_models = trained_models;
              this.trained_ml_models.push('');
            })
          })
        });
      },
      create_pipeline() {
        let data = {
          new_pipeline_name: this.new_pipeline_name,
          new_pipeline_type: this.selected_pipeline_type
        };
        let url = api_url + "user_pipelines/create";
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
          this.new_pipeline_name = '';
          this.pipeline_selected = this.new_pipeline_name;
        });
      },
      save_parameters: _.debounce(function (k) {
          this.saved_state = false;
          let url = api_url + "user_pipelines/save/" + k + "?pipeline_name=" + this.pipeline_selected;
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
              value: this.loaded_pipeline.parameters[k].value,
              //type: this.loaded_pipeline.parameters[k].type,
            }
          };
          axios(options).catch(error => {
            console.log(error);
          }).then(() => {
            this.saved_state = true;
          })
        }, 3000
      ),
    },
    created() {
      this.load_pipelines_types();
      this.load_users_pipelines();
    },
  };
</script>
