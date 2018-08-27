<script>
import DropFiles from './DropFiles';
import { api_url } from '../config';

export default {
    name: "DropLabelsFiles",
    extends: DropFiles,
    data () {
      return {
        options: {
          url: api_url + "store/input_labels/csv",
          headers: {
            Authorization: "Token " + localStorage.getItem("authorization_token"),
          },
        },
        files_icon: "fa-file-code",
        dz_message: "Drop labels files (csv or txt) here or click"
      };
    },
};
</script>

<style scoped>

</style>