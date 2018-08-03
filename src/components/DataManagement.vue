<template>
<v-container grid-list-md>
    <v-layout wrap>
        <v-flex xs12>
            <v-card>
                <v-card-title>
                    <h1>Data management</h1>
                </v-card-title>
                <v-card-text>
                    <p>This module allows the user to upload data files and labels files to the server
                        in order to train and predict models with them.</p>
                    <p>It also allows him/her to visualize the data.</p>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>

    <v-layout xs12 wrap>
        <v-flex xs6>
            <v-card>
                <DataTable :elements="data_elements" :delete_fun="delete_data" :update_fun="update_data"></DataTable>
                <DropDataFiles :on_complete="get_data"></DropDataFiles>
            </v-card>
        </v-flex>
        <v-flex xs6>
            <v-card>
                <LabelsTable :elements="labels_elements" :delete_fun="delete_labels" :update_fun="update_labels"></LabelsTable>
                <DropLabelsFiles :on_complete="get_labels"></DropLabelsFiles>
            </v-card>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import VueClip from 'vue-clip';
import DropDataFiles from './DropDataFiles';
import DropLabelsFiles from './DropLabelsFiles';
import DataTable from './DataTable';
import LabelsTable from './LabelsTable';
import axios from 'axios';
import { api_url } from '../config';

export default {
  components: {
    DataTable,
    LabelsTable,
    DropDataFiles,
    DropLabelsFiles,
    VueClip,
  },
  data() {
    return {
      data_elements: [],
      labels_elements: []
    };
  },
  methods: {
    get_data () {
      let url = api_url + "data_files/";
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
      axios(options).then(response => {
        this.data_elements = response.data;
      }).catch(error => {
        console.log(error);
        this.data_elements = [];
      });
    },
    get_labels () {
      let url = api_url + "labels_files/";
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + localStorage.getItem("authorization_token")
        },
        url,
        xhrFields: {
          withCredentials: true
        },
      };
      axios(options).then(response => {
        this.labels_elements = response.data;
      }).catch(error => {
        console.log(error);
        this.labels_elements = [];
      });
    },
    delete_data (elements) {
      let url = api_url + "data_files/";
      const options = {
        method: 'DELETE',
        headers: {
          'Authorization': 'Token ' + localStorage.getItem("authorization_token")
        },
        data: {
          elements
        },
        xhrFields: {
          withCredentials: true
        },
        url,
      };
      axios(options).catch(error => {
        console.log(error);
      }).then(request => {
        this.get_data();
      });
    },
    delete_labels (elements) {
      let url = api_url + "labels_files/";
      const options = {
        method: 'DELETE',
        headers: {
          'Authorization': 'Token ' + localStorage.getItem("authorization_token")
        },
        url,
        data: {
          elements
        },
      };
      axios(options).catch(error => {
        console.log(error);
        this.labels_elements = [];
      }).then(request => {
        this.get_labels();
      });
    },
    update_data (elements, operation) {
      // Elements should have the changes in them
      let url = api_url + "data_files/";
      const options = {
        method: 'PATCH',
        headers: {
          'Authorization': 'Token ' + localStorage.getItem("authorization_token")
        },
        data: {
          elements,
          operation,
        },
        xhrFields: {
          withCredentials: true
        },
        url,
      };
      axios(options).catch(error => {
        console.log(error);
      }).then(request => {
        this.get_data();
      });
    },
    update_labels (elements, operation) {
      // Elements should have the changes in them
      let url = api_url + "labels_files/";
      const options = {
        method: 'PATCH',
        headers: {
          'Authorization': 'Token ' + localStorage.getItem("authorization_token")
        },
        data: {
          elements,
          operation,
        },
        xhrFields: {
          withCredentials: true
        },
        url,
      };
      axios(options).catch(error => {
        console.log(error);
      }).then(request => {
        this.get_labels();
      });
    },
  },
  mounted () {
    this.get_data();
    this.get_labels();
  }
};
</script>
