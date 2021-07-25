<template>
  <div class="interface-manage">
    <el-container>
      <el-aside class="my-aside" width="280px">
        <projectFilter @changeProject="changeProject"></projectFilter>
        <interfaceTree ref="interfaceTree" :projectId="projectId" @handleNodeClick="handleNodeClick" @addInterfaceClick="addInterfaceClick"></interfaceTree>
      </el-aside>
      <el-main class="my-main">
        <interface-form ref="interfaceForm" :projectId="projectId" :host="host" @refreshTree="refreshTree"></interface-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import interfaceTree from '../commponents/interfaceTree'
import projectFilter from '../commponents/projectFilter'
import interfaceForm from './interfaceForm'
export default {
  name: "interfaceManage",
  components: {interfaceTree,projectFilter,interfaceForm},
  data(){
    return{
      projectId: '',
      host:''
    }
  },
  methods:{
    changeProject(obj){
      this.projectId = obj.projectId
      this.host = obj.host
    },
    handleNodeClick(treeNodeId){
      this.$refs.interfaceForm.getInterfaceDetail(treeNodeId);
    },
    addInterfaceClick(moduleId){
      this.$refs.interfaceForm.handleCreate(moduleId);
    },
    //表单更新刷新树
    refreshTree(){
      this.$refs.interfaceTree.getTreeData();
    }
  }
}
</script>

<style scoped>
.interface-manage{
  width: 100%;
  padding: 15px;
  max-height: calc(100vh - 60px);
  position: relative;
  overflow: auto;
}
.my-aside{
  padding: 15px;
  background: #ffffff;
  width: 300px;
}
.my-main{
  margin-left: 10px;
  background: #ffffff;
}
</style>
