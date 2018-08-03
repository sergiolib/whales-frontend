<script>
  import CommonTable from './CommonTable';
  export default {
    name: "LabelsTable",
    extends: CommonTable,
    data () {
      return {
        table_title: 'Label files in server',
        selected_elements: [],
        table_headers: [
          {
            value: 'name',
            text: 'Labels file name',
            align: 'left',
          },
          {
            text: 'Owner',
            value: 'owner',
          },
          {
            text: 'Public',
            value: 'public',
          },
        ],
        what_to_delete: 'labels files',
        alert_message: 'There are no labels available for you',
      }
    },
  }
</script>

<style scoped>

</style>