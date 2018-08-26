<script>
import DropFiles from './DropFiles';
import { api_url } from '../config';

export default {
    name: "DropDataFiles",
    extends: DropFiles,
    data () {
      return {
        options: {
          url: api_url + "store/data_files/audio/aif",
          headers: {
            Authorization: "Token " + localStorage.getItem("authorization_token"),
          },
        },
        files_icon: "fa-audio-code",
        dz_message: "Drop data files (aif) here or click"
      }
    }
};
</script>
