<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-bottom: 15px;" type="primary" icon="el-icon-plus"
                 @click="handleCreate" size="small">
        新建数据源
      </el-button>
      <el-button class="filter-item" style="margin-bottom: 15px;" type="primary" icon="el-icon-upload2"
                 @click="uploadDataSource" size="small">
        导入数据源
      </el-button>
      <el-button class="filter-item" style="margin-bottom: 15px;" type="primary" icon="el-icon-download"
                 @click="downloadDataSource" size="small">
        导出数据源
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="float: right;" size="small" @click="handleFilter">
        搜索
      </el-button>
      <el-input
        v-model="listQuery.filterInputValue"
        placeholder="like %host%"
        style="width: 200px;float: right;margin-left:5px;"
        class="filter-item"
        clearable
        size="small"
        prefix-icon="el-icon-search"
      />
      <el-select v-model="listQuery.filterDbType[0]" style="float: right;" @change="handleFilter" multiple  size="small"
                 placeholder="选择数据库类型">
        <el-option
          v-for="item in dbTypes"
          :key="item.display_name"
          :label="item.display_name"
          :value="item.display_name">
        </el-option>
      </el-select>
    </div>
    <!--表格组件-->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      fit
      highlight-current-row
      size="medium"
    >
      <el-table-column label="数据库类型" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.dbType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="版本号" align="left">
        <template slot-scope="scope">
          {{ scope.row.version }}
        </template>
      </el-table-column>
      <el-table-column label="地址" align="left">
        <template slot-scope="scope">
          {{ scope.row.host }}
        </template>
      </el-table-column>
      <el-table-column label="端口" align="left">
        <template slot-scope="scope">
          {{ scope.row.port }}
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="left">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="数据库" align="left">
        <template slot-scope="scope">
          {{ scope.row.dbName }}
        </template>
      </el-table-column>
      <el-table-column label="服务名" align="left">
        <template slot-scope="scope">
          {{ scope.row.serviceName }}
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
                @pagination="getDataSourceList"/>
    <!--新建/编辑弹出层-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="35%">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" label-position="left" label-width="100px"
               style="width: 80%; margin-left:30px;" size="small">

        <el-form-item label="数据库类型" prop="dbType">
          <el-select v-model="dataForm.dbType" class="filter-item" placeholder="请选择数据库类型">
            <el-option v-for="item in dbTypes" :key="item.display_name" :label="item.display_name"
                       :value="item.display_name"/>
          </el-select>
        </el-form-item>

        <el-form-item label="版本号" prop="version">
          <el-input v-model="dataForm.version"></el-input>
        </el-form-item>

        <el-form-item label="主机" prop="host">
          <el-input v-model="dataForm.host"></el-input>
        </el-form-item>

        <el-form-item label="端口" prop="port">
          <el-input v-model="dataForm.port"></el-input>
        </el-form-item>

        <el-form-item label="账号" prop="username">
          <el-input v-model="dataForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="dataForm.password" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="数据库名" prop="dbName" v-show="dataForm.dbType!=='ORACLE'">
          <el-input v-model="dataForm.dbName"></el-input>
        </el-form-item>

        <el-form-item label="服务名" prop="serviceName" v-show="dataForm.dbType==='ORACLE'">
          <el-input v-model="dataForm.serviceName" placeholder="Oracle must input"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="testConnect">
          测试连接
        </el-button>
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='新建数据源'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index' // secondary package based on el-pagination
import {
  dataSourceList,
  addDataSource,
  updateDataSource,
  delDataSource,
  testDataSourceConnect,
  dataSourceDownload
} from '@/api/db/dataSourceConfig'

export default {
  components: {Pagination},
  data() {
    return {
      list: null,
      listLoading: true,
      dialogFormVisible: false,   //弹出层是否显示
      dialogStatus: '',           //判断是新建还是编辑的状态
      total: 0,                   //列表数据总量
      dbTypes: [
        {display_name: 'MYSQL'},
        {display_name: 'ORACLE'},
        {display_name: 'SQL SERVER'}
      ],
      listQuery: {
        page: 1,
        limit: 10,
        filterInputValue: '',
        filterDbType: []        //过滤的数据库类型
      },
      dataForm: {
        id: '',
        dbType: '',
        version: '',
        host: '',
        username: '',
        password: '',
        port: '',
        dbName: '',
        serviceName: ''
      },
      rules: {
        dbType: [{required: true, message: 'dbType is required', trigger: 'blur'}],
        host: [{required: true, message: 'type is required', trigger: 'blur'}],
        version: [{required: true, message: 'version is required', trigger: 'blur'}],
        username: [{required: true, message: 'username is required', trigger: 'blur'}],
        password: [{required: true, message: 'password is required', trigger: 'blur'}],
        port: [{required: true, message: 'port is required', trigger: 'blur'}]
      }
    }
  },
  //钩子函数，在生命周期内，页面加载完成触发
  created() {
    this.getDataSourceList()
  },
  methods: {
    getDataSourceList() {
      this.listLoading = true
      dataSourceList(this.listQuery).then(resp => {
          this.list = resp.data
          this.total = resp.count
          this.listLoading = false
        }
      )
    },
    //列表搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getDataSourceList()
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据源, 是否继续?', '删除数据源', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delDataSource({'id': index.id}).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.getDataSourceList()
        })
      })
    },
    handleCreate() {
      this.dialogStatus = '新建数据源'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addDataSource(this.dataForm).then(resp => {
            console.log(resp)
            this.dialogFormVisible = false
            this.getDataSourceList()
            this.$message({message: resp.data, type: 'success'})
          })
        }
      })
    },
    handleUpdate(index, row) {
      this.dataForm = Object.assign({}, row) // copy obj
      this.dialogStatus = '编辑数据源'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateDataSource(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.getDataSourceList()
          })
        }
      })
    },
    testConnect() {
      const loading = this.$loading({
        lock: true,//lock的修改符--默认是false
        text: 'Loading',//显示在加载图标下方的加载文案
        spinner: 'el-icon-loading',//自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.7)',//遮罩层颜色
        target: document.querySelector('#table')//loadin覆盖的dom元素节点
      })
      testDataSourceConnect(this.dataForm).then(resp => {
        this.$message({message: resp.data, type: 'success'})
        loading.close()
      }).catch(error => {
        console.log(error)
        loading.close()
      })
    },
    uploadDataSource() {
      this.$message.warning('懒得写！')
    },
    downloadDataSource() {
      dataSourceDownload().then(resp => {
        // 创建标签a
        const link = document.createElement('a')
        const blob = new Blob([resp], {type: 'application/vnd.ms-excel'})
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        console.log(link)
        let num = ''
        // 生成随机数
        for (let i = 0; i < 10; i++) {
          num += Math.ceil(Math.random() * 10)
        }
        link.setAttribute('download', '数据源信息' + num + '.xlsx')
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
  margin: 15px;
  background: #ffffff;
  padding: 15px;
  overflow: auto;
  max-height: calc(100vh - 85px);
}
</style>
