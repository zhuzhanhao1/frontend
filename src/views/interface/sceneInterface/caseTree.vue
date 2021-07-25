<template>
  <div class="tree-container">
    <el-input
      placeholder="输入关键字进行过滤" v-if="this.projectId !== ''" size="small"
      v-model="filterText" class="treeFilter">
    </el-input>
    <el-button class="comp-tr-top"
               type="primary"
               size="small"
               v-if="this.projectId !== ''"
               @click="handleCreate">新建
    </el-button>
    <div v-show="false">{{ currentProjectId }}</div>
    <el-tree ref="SlotTree"
             :data="treeData"
             :props="defaultProps"
             :expand-on-click-node="false"
             highlight-current
             default-expand-all
             draggable
             class="my-tree"
             :filter-node-method="filterNode"
             @node-click="handleNodeClick">
      <div class="comp-tr-node" slot-scope="{ node, data }">
        <template>
          <!-- 树节点名称-->
          <div>
            <span class="tree-node">{{ node.label }}</span>
            <span class="comp-tr-node--btns">
                    <el-button icon="el-icon-edit" size="mini" circle type="primary"
                               @click.stop="handleUpdate(node, data)"></el-button>
                    <el-button icon="el-icon-delete" size="mini" circle type="danger"
                               @click.stop="handleDelete(node, data)"></el-button>
                </span>
          </div>
        </template>
      </div>
    </el-tree>
    <!--新建/编辑树-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="30%">
      <el-form
        ref="treeForm"
        :rules="rules"
        :model="treeForm"
        label-position="left"
        label-width="100px"
        style="width: 80%; margin-left:50px;"
        size="small"
      >
        <el-form-item label="场景名称" prop="name">
          <el-input v-model="treeForm.name"/>
        </el-form-item>
        <el-form-item label="描述信息" prop="describe">
          <el-input type="textarea" v-model="treeForm.describe"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='新建场景'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addSceneCase,
  getSceneInterfaceTree,
  updateSceneCase,
  delSceneCase
} from "@/api/interface/sceneInterface";

export default {
  name: "caseTree",
  props: {
    projectId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      treeData:[],
      treeForm: {
        name: '',
        parent: '',
        pid: 0,
        describe: ''
      },
      dialogFormVisible:false,
      dialogStatus:'',
      rules: {
        //场景接口名称
        name: [{required: true, message: 'name is required', trigger: 'blur'}],
      },
    }
  },
  methods:{
    //通过项目id获取树数据与接口管理数据
    init(){
      getSceneInterfaceTree({'id': this.projectId}).then(resp => {
          this.treeData = resp
        }
      )
    },
    handleCreate(){
      this.dialogStatus = '新建场景'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['treeForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['treeForm'].validate((valid) => {
        if (valid) {
          this.treeForm['parent'] = this.projectId
          addSceneCase(this.treeForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.init()
          })
        }
      })
    },
    filterNode(){
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleNodeClick(data){
      //子传父组件，项目ID
      console.log(data)
      this.$emit('handleNodeClick', data.id)
    },
    handleUpdate(_node, _data) {
      this.treeForm = _data
      this.dialogStatus = '编辑场景接口'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['treeForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['treeForm'].validate((valid) => {
        if (valid) {
          updateSceneCase(this.treeForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.init()
          })
        }
      })
    },
    handleDelete(_node, _data){
      this.$confirm('此操作将永久删除?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delSceneCase({'id': _data.id}).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.init()
        })
      })
    }
  },
  computed: {
    currentProjectId() {
      console.log("计算属性监听改变的项目ID" + this.projectId)
      this.init()
    }
  },
  watch: {
    filterText(val) {
      this.$refs.SlotTree.filter(val)
    },
  }
}
</script>

<style scoped>
.tree-node {
  width: 160px;
  vertical-align: middle;
  white-space: nowrap;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: -10px;
}
</style>
