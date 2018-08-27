<template>
    <v-container>
        <v-layout>
            <v-flex xs12>
                <v-card>
                    <v-card-title>
                        <h1>Process manager</h1>
                    </v-card-title>
                    <v-card-text>
                        <p>This module allows the user to lunch or cancel the pipelines processes. It also shows the results.</p>
                    </v-card-text>
                    <v-card-text>
                        <v-select
                                :items="loaded_pipelines_names"
                                box
                                label="Select pipeline to manage"
                                @change="checkUserLoadedType"
                        ></v-select>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex xs12 sm10 offset-sm1 v-if="pipeline_selected !== ''">
                <v-card>
                    <v-card-text>
                        <v-flex>
                            <h4 class="text-xs-left">{{ loaded_pipeline.name }} manager</h4>
                        </v-flex>
                    </v-card-text>
                    <v-card-text>
                        <v-card style="padding: 5px">
                            <v-flex class="text-xs-center" v-if="process_state === 0">
                                <v-btn fab color="blue" dark large><v-icon x-large circle
                                       @click="launch_pipeline">fa-play</v-icon></v-btn>
                                <p>Start the pipeline</p>
                            </v-flex>
                            <v-flex class="text-xs-center" v-else-if="process_state === 1">
                                <v-btn fab color="alert" dark large><v-icon x-large circle>fa-stop</v-icon></v-btn>
                                <p>The pipeline is running...</p>
                            </v-flex>
                            <v-flex class="text-xs-center" v-else-if="process_state === 2">
                                <v-btn fab color="warning" dark large><v-icon x-large circle>fa-exclamation-triangle</v-icon></v-btn>
                                <p>The pipeline suddenly stopped!</p>
                            </v-flex>
                            <v-flex class="text-xs-center" v-else-if="process_state === 3">
                                <v-btn fab color="green" dark large><v-icon x-large circle>fa-check-double</v-icon></v-btn>
                                <p>The pipeline has finished. Check its results below.</p>
                            </v-flex>
                        </v-card>
                        <v-flex><p></p></v-flex>
                        <v-card style="padding: 5px">
                            <v-list>
                                <v-subheader>
                                    <h5>Logs</h5>
                                </v-subheader>
                                <v-expansion-panel>
                                    <v-expansion-panel-content
                                            v-for="(item,i) in logs"
                                            :key="i"
                                            style="width: 100%"
                                    >
                                        <div slot="header">{{ item.name }}</div>
                                        <v-card>
                                            <v-card-text>{{ item.content }}</v-card-text>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-list>
                        </v-card>
                        <v-flex><p></p></v-flex>
                        <v-card style="padding: 5px">
                            <v-list>
                                <v-subheader>
                                    <h5>Results</h5>
                                </v-subheader>
                                <v-expansion-panel>
                                    <v-expansion-panel-content
                                            v-for="(item,i) in results"
                                            :key="i"
                                    >
                                        <div slot="header">{{ item.name }}</div>
                                        <v-card>
                                            <v-card-text v-if="!item.content.startsWith('data:image')">{{ item.content }}</v-card-text>
                                            <v-card-text v-else><img :src="item.content" /></v-card-text>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-list>
                        </v-card>
                        <v-flex><p></p></v-flex>
                        <v-card style="padding: 5px">
                            <h5 class="text-xs-left">Pipeline operations</h5>
                            <v-btn @click.stop="delete_dialog = true">Delete pipeline</v-btn>
                            <v-btn @click.native="duplicate_pipeline">Duplicate pipeline</v-btn>
                            <v-btn @click.stop="rename_dialog = true">Rename pipeline</v-btn>
                        </v-card>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>

        <v-layout>
            <v-dialog width="500" v-model="delete_dialog">
                <v-card>
                    <v-card-title class="headline">Confirmation</v-card-title>
                    <v-card-text>Are you sure you want to delete "{{ pipeline_selected }}"?</v-card-text>
                    <v-card-text>(This is a definitive decision)</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1" flat @click.stop="delete_dialog = false">No</v-btn>
                        <v-btn color="green darken-1" flat @click.native="delete_pipeline">Yes</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>

        <v-layout wrap row>
            <v-dialog width="500" v-model="rename_dialog">
                <v-card>
                    <v-card-title class="headline">Rename</v-card-title>
                    <v-card-actions>
                        <v-text-field
                                label="Enter the new name for the pipeline"
                                v-model="rename_new_name" required></v-text-field>
                        <v-btn color="green darken-1" flat @click.stop="rename_dialog = false">Cancel</v-btn>
                        <v-btn color="green darken-1" flat :disabled="rename_new_name.length === 0" @click.native="rename_pipeline">Ok</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
    </v-container>
</template>

<script>
  import axios from 'axios';
  import {api_url} from "../config";
  import 'materialize-css'; // It installs the JS asset only
  import 'materialize-css/dist/css/materialize.min.css';
  import _ from 'lodash';

  let options_inner = function (pipeline_name) {
    let url = api_url + "user_pipelines/process?pipeline_name=" + pipeline_name;
    return {
      method: 'GET',
      headers: {
        'Authorization': 'Token ' + localStorage.getItem("authorization_token")
      },
      xhrFields: {
        withCredentials: true
      },
      url,
    };
  };

  const insert = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index)
  ];

  export default {
    data() {
      return {
        pipelines_types: [],  // Array of pipelines types from API
        loaded_pipelines: [],  // Array of pipelines existing in DB
        pipeline_selected: "",  // First selector model: name of pipeline (member of loaded_pipelines_names)
        selected_pipeline_type: "",  // Second selector model: changeable only if pipeline_selected === create_option
        new_pipeline_name: "",  // When creating a new pipeline, this is the name the used gives to it
        saved_state: false,  // If true, the form has been saved. Else, it is pending
        delete_dialog: false,
        rename_dialog: false,
        rename_new_name: '',
        process_state: 0,  // 0: not started, 1: started and running ok, 2: started and finished in error, 3: started and finished ok
        logs: [],
        results: [],
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
      update_button_state() {
        axios(options_inner(this.pipeline_selected)).catch(error => {
          console.log(error);
        }).then((response) => {
          switch (response.data) {
            case 0:
              // READY
              this.process_state = 0;
              break;
            case 2:
              // FAILURE
              this.process_state = 2;
              this.update_logs();
              this.update_results();
              break;
            case 1:
              // STARTED
              this.process_state = 1;
              break;
            case 3:
              // SUCCESS
              this.process_state = 3;
              this.update_results();
              break;
            default:
              this.process_state = 0;
              break;
          }
        });
      },
      update_logs() {
        if (this.pipeline_selected !== '') {
          let url = api_url + "user_pipelines/logs?pipeline_name=" + this.pipeline_selected;
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
            this.logs = [];
          }).then(request => {
            this.logs = request.data;
          });
        } else {
          this.logs = [];
        }
      },
      update_results() {
        if (this.pipeline_selected !== '') {
          let url = api_url + "user_pipelines/results?pipeline_name=" + this.pipeline_selected;
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
            this.results = [];
          }).then(request => {
            this.results = request.data;
          });
        } else {
          this.results = [];
        }
      },
      checkUserLoadedType (name) {
        this.pipeline_selected = name;
        if (this.loaded_pipelines_names.includes(name)) {
          this.selected_pipeline_type = this.loaded_pipeline.type;
        } else {
          this.selected_pipeline_type = '';
        }
      },
      load_users_pipelines() {
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
          this.pipeline_selected = this.rename_new_name;
        });
      },
      delete_pipeline () {
        this.delete_dialog = false;
        let url = api_url + "user_pipelines/delete?pipeline_name=" + this.pipeline_selected;
        const options = {
          method: 'DELETE',
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
        }).then(() => {
          this.pipeline_selected = '';
        }).then(() => {
          this.load_users_pipelines();
        });
      },
      duplicate_pipeline () {
        let url = api_url + "user_pipelines/duplicate";
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
            pipeline_name: this.pipeline_selected
          },
        };
        axios(options).catch(error => {
          console.log(error);
        }).then(() => {
          this.pipeline_selected = '';
        }).then(() => {
          this.load_users_pipelines();
        });
      },
      rename_pipeline () {
        this.rename_dialog = false;

        let url = api_url + "user_pipelines/rename";
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
            new_pipeline_name: this.rename_new_name,
          }
        };
        axios(options).catch(error => {
          console.log(error);
        }).then(() => {
          this.load_users_pipelines();
        });
      },
      launch_pipeline () {
        let url = api_url + "user_pipelines/launch";
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
          }
        };
        axios(options).catch(error => {
          console.log(error);
        })
      }
    },
    watch: {
      loaded_pipeline: {
        deep: true,
        handler () {
          this.update_logs();
          this.update_results();
          if (this.loaded_pipeline === undefined) {
            return {
              name: ''
            };
          }
        }
      },
    },
    mounted() {
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
      }).then(() => {
        this.load_users_pipelines();
      }).then(() => {
        setInterval(() => {
          if (this.pipeline_selected.length > 0 && this.process_state === 1) {
            this.update_logs();
            this.update_button_state();
          }
        } , 500);
      });
    },
  };
</script>
