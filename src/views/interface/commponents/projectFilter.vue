<template>
  <div>
    <div>
      <el-tag>项目：</el-tag>
      <el-select v-model="projectId" filterable placeholder="请先选择项目" size="small" clearable
                 @change="changeProject(projectId)" class="project-select">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.projectName"
          :value="item.id">
        </el-option>
      </el-select>
      <el-divider content-position="center"><i class="el-icon-guide"></i>{{ dividerName }}</el-divider>
    </div>
    <!--    <interfaceTree :projectId="projectId.toString()" :host="host" :treeData="treeData"></interfaceTree>-->
  </div>
</template>

<script>
import {projectList} from "@/api/interface/projectManage";
import interfaceTree from './interfaceTree'

export default {
  name: "projectFilter",
  components: {interfaceTree},
  data() {
    return {
      dividerName: '接口管理',
      filterText: '',
      projectId: '',
      options: [],
      treeData: []
    }
  },
  methods: {
    changeProject(projectId) {
      //子传父组件，项目ID
      for (let item of this.options) {
        if (item['id'] === projectId) {
          this.$emit('changeProject', {projectId,'host':item['host']})
        }
      }
    },
    init() {
      projectList().then(resp => {
          this.options = resp.data
          console.log(this.options)
        }
      )
    }
  },
  created() {
    //获取项目列表
    this.init()
  }
}
</script>

<style scoped>
.project-select {
  width: 180px;
  margin-bottom: 10px;
  margin-left: 5px;
}
</style>
