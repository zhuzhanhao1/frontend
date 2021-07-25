<template>
  <div>
    <el-dialog title="局部参数" :visible.sync="dialogTableVisible" center>
      <el-table :data="list">
        <el-table-column property="key" label="key" width="200"></el-table-column>
        <el-table-column property="value" label="value"></el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                  @pagination="getList" :hide-on-single-page="value"/>
    </el-dialog>
  </div>
</template>

<script>
import {getLocalParams} from "@/api/interface/sceneInterface";
import Pagination from "@/components/Pagination";

export default {
  name: "localParams",
  components: {Pagination},
  data() {
    return {
      list: [],
      listQuery: {
        page: 1,
        limit: 5,
        projectId: '',
        sceneId: ''
      },
      dialogTableVisible: false,
      total: 0,
      value: true
    }
  },
  methods: {
    openDialog(query) {
      this.dialogTableVisible = true
      this.listQuery.projectId = query.projectId
      this.listQuery.sceneId = query.sceneId
      this.getList()
    },
    getList() {
      getLocalParams(this.listQuery).then(resp => {
        this.list = resp.data
        this.total = resp.count
      })
    }
  }
}
</script>

<style scoped>

</style>
