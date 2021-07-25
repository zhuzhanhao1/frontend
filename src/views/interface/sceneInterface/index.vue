<template>
  <div class="scene-interface">
    <el-container>
      <el-aside class="my-aside" width="280px">
        <project-filter @changeProject="changeProject"></project-filter>
        <case-tree ref="caseTree" :projectId="projectId" @handleNodeClick="handleNodeClick"></case-tree>
      </el-aside>
      <el-main class="my-main">
        <scene-interface-list ref="sceneInterfaceList" :projectId="projectId" :host="host"></scene-interface-list>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import projectFilter from '../commponents/projectFilter'
import caseTree from './caseTree'
import sceneInterfaceList from "./sceneInterfaceList";

export default {
  name: "sceneInterface",
  components: {projectFilter,caseTree,sceneInterfaceList},
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
      this.$refs.sceneInterfaceList.openList(treeNodeId);
    }
  }
}
</script>

<style scoped>
.scene-interface {
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
