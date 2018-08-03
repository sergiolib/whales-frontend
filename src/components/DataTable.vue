<script>
  import CommonTable from './CommonTable';
  export default {
    name: "DataTable",
    extends: CommonTable,
    data () {
      return {
        table_title: 'Data files in server',
        selected_elements: [],
        table_headers: [
          {
            value: 'name',
            text: 'Data file name',
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
        what_to_delete: 'data files',
        alert_message: 'There are no data files available for you',
      }
    }
  }
</script>

<style scoped>

</style>