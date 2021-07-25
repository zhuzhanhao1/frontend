<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-bottom: 15px;" type="primary" icon="el-icon-plus"
                 @click="handleCreate" size="small">
        新建项目
      </el-button>
    </div>
    <!--表格组件-->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      fit
      highlight-current-row
      size="medium">
      <el-table-column label="项目名称" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.projectName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目地址" align="left">
        <template slot-scope="scope">
          {{ scope.row.host }}
        </template>
      </el-table-column>
      <el-table-column label="项目描述" align="left">
        <template slot-scope="scope">
          {{ scope.row.describe }}
        </template>
      </el-table-column>
      <el-table-column label="负责人" align="left">
        <template slot-scope="scope">
          {{ scope.row.head }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="100">
        <template slot-scope="scope">
          <el-dropdown>
            <el-button type="primary" size="mini" round plain>
              操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleUpdate(scope.$index, scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handleDelete(scope.$index, scope.row)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getgetProjectList"/>
    <!--新建/编辑弹出层-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="30%">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" label-position="left" label-width="100px"
               style="width: 80%; margin-left:30px;" size="small">

        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="dataForm.projectName"></el-input>
        </el-form-item>

        <el-form-item label="项目地址" prop="host">
          <el-input v-model="dataForm.host"></el-input>
        </el-form-item>

        <el-form-item label="项目描述" prop="describe">
          <el-input v-model="dataForm.describe"></el-input>
        </el-form-item>

        <el-form-item label="负责人" prop="head">
          <el-input v-model="dataForm.head"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='新建项目'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index' // secondary package based on el-pagination
import {
  projectList,
  addProject, updateProject,
  delProject
} from '@/api/interface/projectManage'

export default {
  components: { Pagination },
  data() {
    return {
      list: null,
      listLoading: true,
      dialogFormVisible: false,   //弹出层是否显示
      dialogStatus: '',           //判断是新建还是编辑的状态
      total: 0,                   //列表数据总量
      listQuery: {
        page: 1,
        limit: 10
      },
      dataForm: {
        host: '',
        projectName: '',
        describe: '',
        head: ''
      },
      rules: {
        projectName: [{ required: true, message: 'projectName is required', trigger: 'change' }],
        host: [{ required: true, message: 'host is required', trigger: 'change' }],
        head: [{ required: true, message: 'head is required', trigger: 'change' }]
      }
    }
  },
  //钩子函数，在生命周期内，页面加载完成触发
  created() {
    this.getgetProjectList()
  },
  methods: {
    getgetProjectList() {
      this.listLoading = true
      projectList(this.listQuery).then(resp => {
          this.list = resp.data
          this.total = resp.count
          this.listLoading = false
        }
      )
    },
    //列表搜索
    handleFilter() {
      this.getgetProjectList()
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该项目, 是否继续?', '删除项目', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delProject({ 'id': index.id }).then(resp => {
          this.$message({ message: resp.data, type: 'success' })
          this.getgetProjectList()
        })
      })
    },
    handleCreate() {
      this.dialogStatus = '新建项目'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addProject(this.dataForm).then(resp => {
            this.$message({ message: resp.data, type: 'success' })
            this.dialogFormVisible = false
            this.getgetProjectList()
          })

        }
      })
    },
    handleUpdate(index, row) {
      console.log(row)
      this.dataForm = Object.assign({}, row) // copy obj
      this.dialogStatus = '编辑项目'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateProject(this.dataForm).then(resp => {
            this.$message({ message: resp.data, type: 'success' })
            this.dialogFormVisible = false
            this.getgetProjectList()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  margin: 15px;
  background: #ffffff;
  padding: 15px;
  overflow: auto;
  max-height: calc(100vh - 50px);
}
</style>
