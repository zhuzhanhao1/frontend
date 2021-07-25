<template>
  <div class="single-interface">
    <el-container>
      <el-aside class="my-aside" width="280px">
        <project-filter @changeProject="changeProject"></project-filter>
        <interface-tree ref="interfaceTree" :projectId="projectId" @handleNodeClick="handleNodeClick"></interface-tree>
      </el-aside>
      <el-main class="my-main">
        <single-interface-list ref="singleInterfaceList" :projectId="projectId" :host="host"></single-interface-list>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import projectFilter from '../commponents/projectFilter'
import interfaceTree from '../commponents/interfaceTree'
import singleInterfaceList from "@/views/interface/singleInterface/singleInterfaceList";

export default {
  name: "singleInterface",
  components: {projectFilter,interfaceTree,singleInterfaceList},
  data() {
    return {
      projectId: '',
      host: ''
    }
  },
  methods: {
    changeProject(obj) {
      this.projectId = obj.projectId
      this.host = obj.host
    },
    handleNodeClick(treeNodeId){
      this.$refs.singleInterfaceList.getList(treeNodeId);
    }
  }
}
</script>

<style scoped>
.single-interface {
  width: 100%;
  padding: 15px;
  max-height: calc(100vh - 60px);
  position: relative;
  overflow: auto;
}

.my-aside {
  padding: 15px;
  background: #ffffff;
}

.my-main {
  margin-left: 10px;
  background: #ffffff;
}

</style>
