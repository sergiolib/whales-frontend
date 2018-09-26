<template>
    <v-container>
        <v-card>
            <v-parallax
                dark
                src="/whale_background.jpg"
            >
                <v-card-text>
                    <h1>Welcome</h1>
                    <h2>This is the whale detector application</h2>
                    <p>This application allows you to load audio files and detect whale sounds within.</p>
                    <p>In order to start, please login by clicking the incognito guy at the top right.</p>

                    <h2>Last public pipelines created</h2>
                    <ol>
                        <li v-for="p in last_pipelines" :key="p.name + ' ' +  p.owner">{{ p.name }} owned by {{ p.owner }} created on {{ p.created_on }}</li>
                    </ol>
                </v-card-text>
            </v-parallax>
        </v-card>
    </v-container>

</template>

<script>
    import axios from 'axios';
    import {api_url} from "../config";

    export default {
        data() {
            return {
                last_pipelines: [],
            }
        },
        mounted () {
            let url = api_url + "user_pipelines";
            const options = {
                method: 'GET',
                url,
            };
            axios(options).catch(error => {
                console.log(error);
            }).then(request => {
                this.last_pipelines = request.data;
            });
        }
    }
</script>