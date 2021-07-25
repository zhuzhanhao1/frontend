<template>
  <div class="app-container">
    <el-container>
      <el-aside width="220px" style="margin-right: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span style="text-align: center">数据库分类</span>
          </div>
          <div class="structureTree">
            <el-tree
              :data="data"
              :props="defaultProps"
              node-key="id"
              :default-expanded-keys="[1, 3, 5, 7]"
              @node-click="handleNodeClick"
            />
          </div>
        </el-card>

      </el-aside>
      <el-main style="background: #ffffff">
        <div>
          <div class="filter-container">
            <el-button
              class="filter-item"
              style="margin-bottom: 15px;"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleCreate"
            >
              新建结构
            </el-button>
            <el-button
              class="filter-item"
              style="margin-left: 10px;"
              type="primary"
              icon="el-icon-upload2"
              size="small"
              @click="uploadCase"
            >导入用例
            </el-button>
            <el-dropdown style="margin-left: 10px;">
              <el-button type="primary" size="small" icon="el-icon-download">
                导出用例<i class="el-icon-arrow-down el-icon--right"/>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="exportCase('ddl')">
                  导出DDL用例
                </el-dropdown-item>
                <el-dropdown-item @click.native="exportCase('dml')">
                  导出DML用例
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <!--            <span style="margin-left: 20px;">当前选择树节点： <el-tag>{{listQuery.dbTypeName+'-'+listQuery.stockAddType}}</el-tag></span>-->
          </div>
          <!--表格组件-->
          <el-table
            v-loading="listLoading"
            :data="list"
            element-loading-text="Loading"
            fit
            highlight-current-row
            size="medium"
            @row-dblclick="openDetails"
          >
            <el-table-column label="数据库结构" align="left">
              <template slot-scope="scope">
                <span>{{ scope.row.structureName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="DDL数量" align="left">
              <template slot-scope="scope">
                <el-tag>{{ scope.row.ddlCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="DML数量" align="left">
              <template slot-scope="scope">
                <el-tag>{{ scope.row.dmlCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" align="left">
              <template slot-scope="scope">
                {{ formatTime(scope.row.updateTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="left" width="100">
              <template slot-scope="scope">
                <el-dropdown>
                  <el-button type="primary" size="mini" round plain>
                    操作<i class="el-icon-arrow-down el-icon--right"/>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="toDdlPage(scope.$index, scope.row)">前往</el-dropdown-item>
                    <el-dropdown-item @click.native="handleUpdate(scope.$index, scope.row)">编辑</el-dropdown-item>
                    <el-dropdown-item @click.native="handleDelete(scope.$index, scope.row)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.limit"
            @pagination="fetchData"
          />
        </div>
      </el-main>
    </el-container>
    <!--新建/编辑弹出层-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="30%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        label-position="left"
        label-width="100px"
        style="width: 80%; margin-left:50px;"
        size="small"
      >

        <el-form-item label="结构名称" prop="structureName">
          <el-input v-model="dataForm.structureName"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='新建结构'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--导入用例-->
    <el-dialog title="导入用例" :visible.sync="dialogUploadVisible" width="30%">
      <div style="margin-left: 20px;">
        <p style="margin-top: -10px;">所选中数据库类型：
          <el-tag>{{ dataForm.dbTypeName }}</el-tag>
        </p>
        <p>所选中数据模式：
          <el-tag>{{ dataForm.stockAddType }}</el-tag>
        </p>
        <el-upload
          ref="upload"
          class="upload-demo"
          :action="UploadUrl()"
          :data="dataForm"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="uploadSuccessCallback"
          :on-error="uploadErrorCallback"
          :file-list="fileList"
          :auto-upload="false"
          :headers="upHeaders"
        >
          <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件且文件名必须包含ddl/dml</div>
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">确定上传</el-button>
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUploadVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import Pagination from '@/components/Pagination/index' // secondary package based on el-pagination
import {
  dataStructureList,
  addDataStructure,
  updateDataStructure,
  delDataStructure,
  dataStructureDownload,
} from '@/api/db/dataStructureManage'
import {getToken} from "@/utils/auth"

const ip = process.env.VUE_APP_BASE_API
const treeData = [{
  label: 'MYSQL',
  children: [{
    id: 1,
    label: '存量',
    parent: 'MYSQL'
  }, {
    id: 2,
    label: '增量',
    parent: 'MYSQL'
  }]
}, {
  label: 'ORACLE',
  children: [{
    id: 3,
    label: '存量',
    parent: 'ORACLE'

  }, {
    id: 4,
    label: '增量',
    parent: 'ORACLE'
  }]
}, {
  label: 'SQL SERVER',
  children: [{
    id: 5,
    label: '存量',
    parent: 'SQL SERVER'
  }, {
    id: 6,
    label: '增量',
    parent: 'SQL SERVER'
  }]
}, {
  label: 'PostgreSQL',
  children: [{
    id: 7,
    label: '存量',
    parent: 'POSTGTESQL'
  }, {
    id: 8,
    label: '增量',
    parent: 'POSTGTESQL'
  }]
}]
export default {
  components: {Pagination},
  data() {
    return {
      data: treeData,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      list: null,
      listLoading: true,
      dialogFormVisible: false, // 弹出层是否显示
      dialogUploadVisible: false,
      downloadLoading: false,
      fileList: [],
      dialogStatus: '', // 判断是新建还是编辑的状态
      total: 0, // 列表数据总量
      listQuery: {
        page: 1,
        limit: 10,
        dbTypeName: '',
        stockAddType: ''
      },
      dataForm: {
        dbTypeName: 'MYSQL',
        structureName: '',
        stockAddType: '存量'
      },
      upHeaders: {'X-Token': getToken()},
      rules: {
        structureName: [{required: true, message: 'structureName is required', trigger: 'change'}]
      }
    }
  },
  created() {
    if (this.$route.params.dbTypeName !== ':dbTypeName') {
      this.listQuery.dbTypeName = this.$route.params.dbTypeName
      this.listQuery.stockAddType = this.$route.params.stockAddType
    } else {
      this.listQuery.dbTypeName = 'MYSQL'
      this.listQuery.stockAddType = '存量'
    }
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      dataStructureList(this.listQuery).then(resp => {
          this.list = resp.data
          this.total = resp.count
          this.listLoading = false
        }
      )
    },
    //时间格式化
    formatTime(time) {
      return this.dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据源, 是否继续?', '删除数据源', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delDataStructure({'id': index.id}).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.fetchData()
        })
      })
    },
    handleCreate() {
      this.dialogStatus = '新建结构'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addDataStructure(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.fetchData()
          })
        }
      })
    },
    handleUpdate(index, row) {
      this.dataForm = Object.assign({}, row) // copy obj
      this.dialogStatus = '编辑结构'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateDataStructure(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.fetchData()
          })
        }
      })
    },
    handleNodeClick(data) {
      if (data.id !== undefined) {
        console.log(this)
        // 通过点击树节点，更新表格请求参数
        this.listQuery.dbTypeName = data.parent
        this.listQuery.stockAddType = data.label
        this.fetchData()
        // 通过点击树节点，更新表单绑定的参数
        this.dataForm.dbTypeName = data.parent
        this.dataForm.stockAddType = data.label
      } else {
        this.$message.warning('只有点击子节点才会刷新表格内容哦！')
        this.listLoading = true
      }
    },
    toDdlPage(index, row) {
      this.$router.push(
        {name: 'sqlCaseManage', params: {id: row.id, dbTypeName: row.dbTypeName, stockAddType: row.stockAddType}}
        // '/dbTest/sqlCaseManage/' + row.id
      )
    },
    openDetails(row, event, column) {
      this.$router.push({
        name: 'sqlCaseManage',
        params: {id: row.id, dbTypeName: row.dbTypeName, stockAddType: row.stockAddType}
      })
    },
    UploadUrl() {
      return ip + '/sqlCaseManage/upload'
    },
    uploadCase() {
      this.dialogUploadVisible = true
    },
    submitUpload() {
      if (this.dataForm.stockAddType === '') {
        this.$message.warning('只有点击子节点才能进行导入用例哦！')
      } else {
        this.$refs.upload.submit()
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    uploadSuccessCallback(response, file, fileList) {
      this.$message({message: response.data, type: 'success'})
      this.dialogUploadVisible = false
      this.fetchData()
    },
    uploadErrorCallback(err, file, fileList) {
      console.log(err)
      this.$message.error('导入失败，请查看控制台！')
    },
    exportCase(ddlDmlType) {
      dataStructureDownload({
        'dbTypeName': this.listQuery.dbTypeName,
        'stockAddType': this.listQuery.stockAddType,
        'ddlDmlType': ddlDmlType
      }).then(resp => {
        // 创建标签a
        const link = document.createElement('a')
        const blob = new Blob([resp], {type: 'application/vnd.ms-excel'})
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        let num = ''
        // 生成随机数
        for (let i = 0; i < 10; i++) {
          num += Math.ceil(Math.random() * 10)
        }
        link.setAttribute('download', this.listQuery.dbTypeName + '-' + this.listQuery.stockAddType + '-' + ddlDmlType + '-' + num + '.xlsx')
        document.body.appendChild(link)
        link.click()
        // 删除标签
        document.body.removeChild(link)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  max-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: auto;
}

.el-aside {
  text-align: center;
}
</style>

<style lang="scss">
.structureTree {
  .el-tree-node:focus > .el-tree-node__content {
    background-color: #66b1ff; //背景色
    color: #ffffff;
  }

  .el-tree-node__content {
    &:hover {
      background: #66b1ff;
      color: #ffffff;
    }
  }
}
</style>


