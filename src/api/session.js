import axios from 'axios'
import { api_url } from '../config'

const http = axios.create(
    {
        baseURL: api_url,
    }
);

export default http;