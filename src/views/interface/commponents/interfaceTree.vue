<template>
  <div>
    <div class="tree-container">
      <el-input
        placeholder="输入关键字进行过滤" v-if="this.projectId !== ''" size="small"
        v-model="filterText" :class="this.$route.name === 'singleInterface'?'treeFilter1':'treeFilter'">
      </el-input>
      <el-button class="comp-tr-top"
                 type="primary"
                 size="small"
                 v-if="this.projectId !== ''"
                 v-show="showBtn"
                 @click="handleCreate">新建
      </el-button>
      <div v-show="false">{{ currentProjectId }}</div>
      <el-tree ref="SlotTree"
               :data="treeData"
               :props="defaultProps"
               highlight-current
               draggable
               @node-drop="handleDrop"
               class="my-tree"
               :filter-node-method="filterNode"
               @node-click="handleNodeClick">
        <div class="comp-tr-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span class="comp-tr-node--btns" v-if="showBtn">
                <el-button icon="el-icon-plus" size="mini" circle type="primary" @click.stop="handleAdd(node, data)"
                           v-show="node.level < 2"></el-button>
                <el-button icon="el-icon-edit" size="mini" circle type="info" @click.stop="handleUpdate(node, data)"
                           v-show="node.level < 2"></el-button>
                <el-button icon="el-icon-delete" size="mini" circle type="danger"
                           @click.stop="handleDelete(node, data)"></el-button>
              </span>
        </div>
      </el-tree>
    </div>
    <!--新建/编辑弹出层-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="30%">
      <el-form
        ref="moduleForm"
        :rules="rules"
        :model="moduleForm"
        label-position="left"
        label-width="100px"
        style="width: 80%; margin-left:50px;"
        size="small"
      >
        <el-form-item label="模块名称" prop="name">
          <el-input v-model="moduleForm.name"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='新建模块'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import {
  addModule,
  delInterface,
  delModule,
  getModuleTreeData, updateTreeNode,
  updatModule
} from "@/api/interface/interfaceManage";

export default {
  name: "interfaceTree",
  props: {
    projectId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      showBtn: true,
      width: 0,
      filterText: "",
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      treeData: [],
      dialogStatus: '',        //新建模块标题
      dialogFormVisible: false,//新建模块弹框
      moduleForm: {
        name: '',
        parent: '',
        pid: 0
      },
      rules: {
        name: [{required: true, message: 'name is required', trigger: 'blur'}],
      },
    }
  },
  created() {
    if(this.$route.name === 'singleInterface') {
      this.showBtn = false
    } else {
      this.showBtn = true
    }
  },
  computed: {
    currentProjectId() {
      console.log("计算属性监听改变的项目ID" + this.projectId)
      this.getTreeData()
    }
  },
  watch: {
    filterText(val) {
      this.$refs.SlotTree.filter(val)
    },
    // projectId(val) {
    //   console.log("watch监听的改变的项目ID" + val)
    // }
  },
  methods: {
    //获取树数据
    getTreeData() {
      getModuleTreeData({'id': this.projectId}).then(resp => {
          this.treeData = resp
        }
      )
    },
    //增加模块
    handleCreate() {
      this.dialogStatus = '新建模块'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['moduleForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['moduleForm'].validate((valid) => {
        if (valid) {
          this.moduleForm['parent'] = this.projectId
          addModule(this.moduleForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.getTreeData()
          })
        }
      })
    },
    //模块更新
    handleUpdate(_node, _data) {
      delete _data.children
      this.moduleForm = _data
      this.dialogStatus = '编辑模块'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['moduleForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['moduleForm'].validate((valid) => {
        if (valid) {
          updatModule(this.moduleForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.getTreeData()
          })
        }
      })
    },
    //删除模块||删除接口
    handleDelete(_node, _data) {
      this.$confirm('此操作将永久删除?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (_data.pid === 0) {
          delModule({'id': _data.id}).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getTreeData()
          })
        } else {
          delInterface({'id': _data.id}).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getTreeData()
          })
        }
      })
    },
    //接口拖拽
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('tree drop: ', draggingNode, dropNode, dropType)
      if (Object.keys(draggingNode.data).length === 2) {
        //只有当子节点拖拽到别的父节点下面的时候才请求接口
        updateTreeNode({
          nodeId: dropNode.data.id,
          id: draggingNode.data.id
        }).then(resp => {
          this.$message({message: resp.data, type: 'success'})
        })
      } else {
        this.$message({showClose: true, message: '只有挪动子节点到其他模块下才会真正保存哦，这样挪动刷新页面将恢复原样！', type: 'warning', duration: 0})
      }
    },
    //树节点过滤
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    //树节点点击，传递树节点ID给表单组件
    handleNodeClick(data) {
      if (data.pid !== 0) {
        //子传父组件，项目ID
        this.$emit('handleNodeClick', data.id)
      }
    },
    handleAdd(_node, _data) {
      //子传父组件，项目ID
      this.$emit('addInterfaceClick', _data.id)
    },
  }
}
</script>

<style lang="scss">

// 自定义节点
.tree-container {
  .treeFilter {
    margin-right: 5px;
    margin-bottom: 10px;
    width: 185px;
  }

  .treeFilter1 {
    margin-right: 5px;
    margin-bottom: 10px;
  }

  .my-tree {
    height: 500px;
    overflow-y: auto;
  }

  .comp-tr-node {
    // button
    .comp-tr-node--btns {
      margin-left: 10px;
      opacity: 0;
      transition: opacity .1s;

      .el-button {
        transform: scale(0.8); // 缩小按钮
        & + .el-button {
          margin-left: -1px;
        }
      }
    }
  }

  //树节点左侧图表
  .el-tree-node__expand-icon {
    font-size: 14px;
  }

  //树节点内容
  .el-tree-node__content {
    margin-top: 1px;
    font-size: 14px;
  }

  //显示树节点右侧图标
  .show-btns {
    opacity: 1;
  }

  // 高亮显示按钮
  .is-current {
    & > .el-tree-node__content {
      .comp-tr-node--btns {
        @extend .show-btns;
      }
    }
  }

  // 悬浮显示按钮
  .el-tree-node__content {
    &:hover {
      .comp-tr-node--btns {
        @extend .show-btns;
      }
    }
  }
}


</style>
