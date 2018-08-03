<template>
    <vue-clip :options="options" class="uploader"
              :on-drag-enter="dragging" :on-drag-leave="stopped_dragging"
              :on-queue-complete="on_complete">
        <template slot="clip-uploader-action" slot-scope="params">
            <v-layout align-center justify-center>
                <v-flex xs10>
                    <v-card :color="dz_color" hover class="dz-message center">
                        <v-card-text>
                            {{ dz_message }}
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </template>
        <template slot="clip-uploader-body" slot-scope="props" v-if="props.files.length > 0">
            <v-layout align-center justify-center>
                <v-flex>
                    <v-card>
                        <v-list two-line subheader>
                            <v-subheader inset>Uploaded files</v-subheader>

                            <v-list-tile
                                    v-for="item in props.files"
                                    :key="item.name"
                                    avatar
                                    :color="item.xhrResponse.statusCode === 200 ? 'green' : 'red'"
                            >
                                <v-list-tile-avatar>
                                    <v-icon>{{ files_icon }}</v-icon>
                                </v-list-tile-avatar>

                                <v-list-tile-content>
                                    <v-list-tile-title v-if="item.status !== 'success'">{{ item.progress }}%</v-list-tile-title>
                                    <v-list-tile-title v-else>{{ parse_message(item.xhrResponse.response) }}</v-list-tile-title>
                                    <v-list-tile-sub-title>{{ item.name }}</v-list-tile-sub-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                    </v-card>
                </v-flex>
            </v-layout>
        </template>
    </vue-clip>
</template>

<script>
import 'materialize-css'; // It installs the JS asset only
import 'materialize-css/dist/css/materialize.min.css';

export default {
    data() {
        return {
          options: {
            url: "",
          },
          dz_color: "white",
          response_color: "blue",
          files_icon: "fa-file-audio",
          dz_message: "Browser or drop your files to upload here"
        };
    },
  methods: {
    dragging () {
      this.dz_color = "grey lighten-3"
    },
    stopped_dragging () {
      this.dz_color = "white"
    },
    parse_message (data) {
      if (data) {
        return JSON.parse(data).message;
      } else {
        return "";
      }
    }
  },
  props: {
    "on_complete": Function,
  },
}
</script>

<style>
</style>