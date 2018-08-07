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
                    <v-card-text>
                        <h4>{{ pipeline_description }}</h4>
                        <p v-for="i in this.form" :key="i.label" v-if="['str', 'bool', 'int'].includes(i.type)">
                            <input v-if="i.type === 'str'" :id="i.label" v-model="form_data[i.label]" />
                            <input type="checkbox" v-else-if="i.type === 'bool'" :id="i.label" v-model="form_data[i.label]" />
                            <input type="number" v-else-if="i.type === 'int'" :id="i.label" v-model="form_data[i.label]" />
                            <label :for="i.label">{{ i.label }}</label>
                        </p>
                        <DataFilesForm v-if="this.form.map(elem => elem.label).includes('input_data')"></DataFilesForm>
                        <LabelsFilesForm v-if="this.form.map(elem => elem.label).includes('input_labels')"></LabelsFilesForm>
                        <Module scope="features_extractors" scope_name="Features extractors" icon="equalizer"
                                v-if="this.form.map(elem => elem.label).includes('features_extractors')"
                                v-model="form_data['features_extractors']"></Module>
                        <Module scope="pre_processing" scope_name="Pre processing" icon="transform"
                                v-if="this.form.map(elem => elem.label).includes('pre_processing')"
                                v-model="form_data['pre_processing']"></Module>
                        <Module scope="performance_indicators" scope_name="Performance indicators" icon="art_track"
                                v-if="this.form.map(elem => elem.label).includes('performance_indicators')"
                                v-model="form_data['performance_indicators']"></Module>
                        <MachineLearning
                                v-if="this.form.map(elem => elem.label).includes('machine_learning')"></MachineLearning>
                    </v-card-text>
                    <v-card-text class="text-xs-right">
                        <input type="button" class="btn waves-effect waves-light" name="save" value="Save" />
                        <input type="button" class="btn waves-effect waves-light" name="submit" value="Submit" />
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
      };
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
        for (let parameter in selected_pipeline.parameters) {
          this.form_data[parameter] = selected_pipeline.parameters[parameter].value;
          this.form.push({
            label: parameter,
            type: selected_pipeline.parameters[parameter].type,
            value: selected_pipeline.parameters[parameter].value,
          });
        }

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
      parse_type(param, param_type) {
        if (["features_extractors", "pre_processing", "performance_indicators", "machine_learning", "input_data", "input_labels"].includes(param)) {
          return param;
        }
        else {
          switch (param_type) {
            case "str":
              return "text";
            case "int":
              return "text";
            case "bool":
              return "checkbox";
            default:
              return null;
          }
        }
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
          this.users_pipelines = request.data;
          this.users_pipelines.forEach(elem => {
            this.user_pipelines_items.push(elem.name);
          });
          this.user_pipelines_items = this.user_pipelines_items.concat()
        });
      },
    },
    mounted() {
      this.load_users_pipelines();
      this.load_pipelines_types();
    },
  };
</script>
