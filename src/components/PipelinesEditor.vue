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
                        <div v-html="current_pipeline_form"></div>
                        <Module scope="features_extractors" scope_name="Features extractors" icon="equalizer" v-if="show_features_extractors"></Module>
                        <Module scope="pre_processing" scope_name="Pre processing" icon="transform" v-if="show_pre_processing"></Module>
                        <Module scope="performance_indicators" scope_name="Performance indicators" icon="art_track" v-if="show_performance_indicators"></Module>
                        <!--<MachineLearning v-if="show_machine_learning"></MachineLearning>-->
                    </v-card-text>
                    <v-card-text class="text-xs-right">
                        <button class="btn waves-effect waves-light" :disabled="button_disabled" name="action">Submit</button>
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
  import 'materialize-css'; // It installs the JS asset only
  import 'materialize-css/dist/css/materialize.min.css';

  export default {
    components: {
      Module,
    },
    data() {
      return {
        pipelines: [],
        selected_pipeline: '',
        current_pipeline_form: '',
        pipeline_forms: {},
        show_features_extractors: false,
        show_pre_processing: false,
        show_performance_indicators: false,
        show_machine_learning: false,
        user_pipelines_items: ['Create new pipeline', '---'],
        loaded_pipeline: '',
        form_opened: false,
        users_pipelines: [],
        pipelines_descriptions: [],
        form: [],
        button_disabled: true,
      };
    },
    methods: {
      reloadForm(value) {
        this.form = [
          {
            label: "Pipeline name",
            type: "text",
            id: "pname",
            class: "validate",
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
          this.form.push({
            label: parameter,
            type: this.parse_type(parameter, selected_pipeline.parameters[parameter].type),
            value: selected_pipeline.parameters[parameter].value,
          });
        }

        // If loaded pipeline, fill form with its values
        if (this.loaded_pipeline !== "Create new pipeline") {
        }
        // Else, create an empty (default parameters) form
        else {
          this.create_form(value);
        }
      },
      create_form(pipeline_description) {
        let addition = "";
        addition += `<h1>${pipeline_description}</h1><br />`;
        for (let element_id in this.form) {
          let element = this.form[element_id];
          if (["text", "checkbox"].includes(element.type)) {
            addition += `<input `;
            if (element.id !== null) {
              addition += `id="${element.id}" `;
            }
            if (element.type !== null) {
              addition += `type="${element.type}" `
            }
            if (element.class !== null) {
              addition += `class="${element.class}" `
            }
            if (element.name !== null) {
              addition += `name="${element.name}" `
            }
            if (element.value !== null) {
              addition += `value="${element.value} "`;
            }
            addition += ` />`
            if (element.label !== null) {
              addition += `<label for="${element.id}">${element.label}</label>`
            }
          } else {
            switch (element.type) {
              case "features_extractors":
                this.show_features_extractors = true;
                break;
              case "pre_processing":
                this.show_pre_processing = true;
                break;
              case "performance_indicators":
                this.show_performance_indicators = true;
                break;
              case "machine_learning":
                this.show_machine_learning = true;
                break;
            }
          }
        }
        addition += '<br />';
        this.current_pipeline_form = addition;
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
          this.button_disabled = false;
        } else {
          this.form_opened = false;
          this.loaded_pipeline = '';
          this.button_disabled = true;
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
