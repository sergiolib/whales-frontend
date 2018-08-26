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
                            <v-subheader inset>Files uploading</v-subheader>

                            <v-list-tile
                                    v-for="item in props.files"
                                    v-if="item.status !== 'success'"
                                    :key="item.name"
                                    avatar
                                    color="red"
                            >
                                <v-list-tile-avatar>
                                    <v-icon>{{ files_icon }}</v-icon>
                                </v-list-tile-avatar>

                                <v-list-tile-content>
                                    <v-list-tile-title>{{ item.progress.toFixed([2]) }}%</v-list-tile-title>
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
            method: "put",
          },
          dz_color: "white",
          response_color: "blue",
          files_icon: "fa-file-audio",
          dz_message: "Browser or drop your files to upload here",
        };
    },
  methods: {
    dragging () {
      this.dz_color = "grey lighten-3"
    },
    stopped_dragging () {
      this.dz_color = "white"
    },
  },
  props: {
    "on_complete": Function,
  },
}
</script>

<style>
</style>