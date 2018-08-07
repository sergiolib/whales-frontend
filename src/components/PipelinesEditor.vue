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
                        :items="user_pipelines_items"
                        box
                        label="Select create pipeline or select to modify"
                        @change="open_form"
                        v_model="loaded_pipeline"
                ></v-select>
                <v-select
                        :items="pipelines_descriptions"
                        box
                        label="Pipeline Type"
                        @change="reloadForm"
                        v-model="selected_pipeline"
                        :disabled="loaded_pipeline === ''"
                ></v-select>
            </v-card-text>
        </v-card>
        <v-divider></v-divider>
        <v-flex xs12 sm8 offset-sm2 v-if="form_opened">
            <v-card>
                <!-- form in materialize -->
                <form>
                    <v-card-text class="text-xs-right">
                        <input type="button" class="btn waves-effect waves-light" name="save" value="Save" />
                        <input type="button" class="btn waves-effect waves-light" name="submit" value="Submit" />
                    </v-card-text>
                    <v-card-text>
                        <h4>{{ pipeline_description }}</h4>
                        <p v-for="i in this.form" :key="i.label" v-if="['str', 'bool', 'int'].includes(i.type)">
                            <input v-if="i.type === 'str'" :id="i.label" v-model="form_data[i.label]" />
                            <input type="checkbox" v-else-if="i.type === 'bool'" :id="i.label" v-model="form_data[i.label]" />
                            <input type="number" v-else-if="i.type === 'int'" :id="i.label" v-model="form_data[i.label]" />
                            <label :for="i.label">{{ i.label }}</label>
                        </p>
                        <DataFilesForm :selected.sync="input_data"
                                       v-if="this.form.map(elem => elem.label).includes('input_data')" />
                        <LabelsFilesForm :selected.sync="input_labels"
                                         v-if="this.form.map(elem => elem.label).includes('input_labels')" />
                        <Module scope="pre_processing" scope_name="Pre processing" icon="transform"
                                v-if="this.form.map(elem => elem.label).includes('pre_processing')"
                                :parameters_data.sync="pre_processing" />
                        <Module scope="features_extractors" scope_name="Features extractors" icon="equalizer"
                                v-if="this.form.map(elem => elem.label).includes('features_extractors')"
                                :parameters_data.sync="features_extractors" />
                        <Module scope="performance_indicators" scope_name="Performance indicators" icon="art_track"
                                v-if="this.form.map(elem => elem.label).includes('performance_indicators')"
                                :parameters_data.sync="performance_indicators" />
                        <MachineLearning
                                v-if="this.form.map(elem => elem.label).includes('machine_learning')"
                                :parameters_data.sync="machine_learning"/>
                    </v-card-text>
                </form>
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
  import DataFilesForm from "./DataFilesForm";
  import LabelsFilesForm from "./LabelsFilesForm";
  import lodash from 'lodash';

  export default {
    components: {
      Module,
      MachineLearning,
      DataFilesForm,
      LabelsFilesForm,
    },
    data() {
      return {
        pipelines: [],
        selected_pipeline: '',
        current_pipeline_form: '',
        pipeline_forms: {},
        show_data_files_form: false,
        show_labels_files_form: false,
        user_pipelines_items: ['Create new pipeline', '---'],
        loaded_pipeline: '',
        form_opened: false,
        users_pipelines: [],
        pipelines_descriptions: [],
        pipelines_url: "",
        form: [],
        pipeline_description: "",
        form_data: {},
        input_data: [],
        input_labels: [],
        pre_processing: [],
        features_extractors: [],
        performance_indicators: [],
        machine_learning: {}
      };
    },
    computed: {
      form_json () {
        return {
          // input_data: this.input_data.map(df => {
          //   return {
          //     file_name: df,
          //     data_file: "audio",
          //     formatter: "aif"
          //   }
          // }),
          // input_labels: this.input_labels.map(df => {
          //   return {
          //     labels_file: df,
          //     labels_formatter: "csv"
          //   }
          // })
        }
      }
    },
    methods: {
      reloadForm(value) {
        this.form = [
          {
            label: "Pipeline name",
            type: "str",
            value: ""
          }
        ];
        let selected_pipeline = null;
        this.pipelines.forEach(pip => {
          if (pip.description === value) {
            selected_pipeline = pip
          }
        });
        Object.entries(selected_pipeline.parameters).forEach(([parameter_name, parameter]) => {
          this.form_data[parameter_name] = parameter.value;
          this.form.push({
            label: parameter_name,
            type: parameter.type,
            value: parameter.value,
          });
        });

        // If loaded pipeline, fill form with its values
        // if (this.loaded_pipeline !== "Create new pipeline") {
        // }
        // // Else, create an empty (default parameters) form
        // else {
        // }
      },
      load_pipelines_types() {
        this.pipelines_url = api_url + "pipelines/";
        let url = this.pipelines_url;
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
          this.pipelines = request.data;
          this.pipelines.forEach(element => {
            this.pipelines_descriptions.push(element.description);
          })
        });
      },
      open_form(value) {
        if (this.users_pipelines.includes(value) ||
          "Create new pipeline" === value) {
          this.loaded_pipeline = value;
          this.form_opened = true;
        } else {
          this.form_opened = false;
          this.loaded_pipeline = '';
        }
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
          console.log(request);
        });
      },
      save_users_pipelines() {
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
            form: this.form_json,
          }
        };
        axios(options).catch(error => {
          console.log(error);
        }).then(request => {
          console.log(request)
        });
      }
    },
    mounted() {
      this.load_users_pipelines();
      this.load_pipelines_types();
    },
    watch: {
      features_extractors () {
        this.save_users_pipelines()
      }
    }
  };
</script>
