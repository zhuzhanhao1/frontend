<template>
  <!--表格组件-->
  <div>
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin:0 0 20px 0;float: left;"
        type="primary"
        icon="el-icon-plus"
        size="small"
        @click="handleCreate"
      >新建用例
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;float: left;"
        type="primary"
        icon="el-icon-caret-right"
        size="small"
        @click="selectExecuteSql"
      >执行用例
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;float: left;"
        type="primary"
        icon="el-icon-s-check"
        size="small"
        @click="selectValidationSql"
      >验证用例
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;float: left;"
        type="primary"
        icon="el-icon-refresh"
        size="small"
        @click="refreshStock"
      >刷新存量
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;float: left;"
        type="primary"
        icon="el-icon-delete"
        size="small"
        @click="clearResult"
      >清除结果
      </el-button>
      <el-button class="filter-item" type="primary" size="small" icon="el-icon-search" style="float: right;" @click="handleFilter">
        搜索
      </el-button>
      <el-input
        v-model="listQuery.filterInputValue"
        placeholder="like %执行用例%"
        style="width: 200px;float: right;"
        class="filter-item"
        clearable
        size="small"
        prefix-icon="el-icon-search"
      />
      <el-select v-model="listQuery.version" clearable placeholder="版本过滤" @change="handleFilter"
                 style="float: right;margin-right: 5px;" size="small">
        <el-option
          v-for="item in options"
          :key="item"
          :label="item"
          :value="item">
        </el-option>
      </el-select>
    </div>
    <el-table
      class="sql_case_table"
      ref="fileTable"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      fit
      highlight-current-row
      size="medium"
      @selection-change="handleSelectionChange"
      @row-dblclick="openDetails"
      @row-click="handleClickTableRow"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        @selection-change="handleSelectionChange"
      />
      <el-table-column label="支持版本" align="left" width="200">
        <template slot-scope="scope">
          <span>{{ to_obj(scope.row.version).join('/') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用例名称" align="left">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="light" :content="scope.row.caseName" placement="top">
            <div class="oneLine">{{ scope.row.caseName }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="执行用例" align="left">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="light" placement="top">
            <div v-html="ToBreak(scope.row.executeSql)" slot="content"></div>
            <div class="oneLine">{{ scope.row.executeSql }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="" align="left" width="50">
      </el-table-column>
      <!--      <el-table-column label="验证用例" align="left">-->
      <!--        <template slot-scope="scope">-->
      <!--          {{ scope.row.executeResult }}-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="启用状态" width="100" align="left">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.enabled===true ? '开启' : '关闭'" placement="top">
            <el-switch
              v-model="scope.row.enabled"
              @change="switchChange(scope.$index,scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="源库存量" width="100" align="left">
        <template slot-scope="scope">
          {{ scope.row.sourceStock }}
        </template>
      </el-table-column>
      <el-table-column label="执行结果" width="100" align="left">

        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.executeResult" placement="top"
                      v-if="scope.row.executeResult !== '成功' && scope.row.executeResult !== null">
            <div>
              <el-tag v-if="scope.row.executeResult === null" size="medium">
                待执行
              </el-tag>
              <el-tag v-else size="medium" :type="scope.row.executeResult === '成功' ? 'success' : 'danger'">
                {{ scope.row.executeResult === '成功' ? '成功' : '失败' }}
              </el-tag>
            </div>
          </el-tooltip>
          <div v-else>
            <el-tag v-if="scope.row.executeResult === null" size="medium">
              待执行
            </el-tag>
            <el-tag v-else size="medium" :type="scope.row.executeResult === '成功' ? 'success' : 'danger'">
              {{ scope.row.executeResult === '成功' ? '成功' : '失败' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="目标库存量" width="100" align="left">
        <template slot-scope="scope">
          {{ scope.row.targetStock }}
        </template>
      </el-table-column>
      <el-table-column label="比对结果" width="100" align="left">
        <template slot-scope="scope">
          <div>
            <el-tag v-if="scope.row.validationResult === null" size="medium">
              待验证
            </el-tag>
            <el-tag v-else size="medium" :type="scope.row.validationResult === '不相同' ? 'danger' : 'success'">
              {{ scope.row.validationResult }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="160" align="left">
        <template slot-scope="scope">
          {{ formatTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="left">
        <template slot-scope="scope">
          <el-dropdown>
            <el-button type="primary" size="mini" round plain>
              操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleUpdate(scope.$index, scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handleDelete(scope.$index, scope.row)">删除</el-dropdown-item>
              <el-dropdown-item @click.native="rowExecuteSql(scope.$index, scope.row)">执行</el-dropdown-item>
              <el-dropdown-item @click.native="rowValidationSql(scope.$index, scope.row)">验证</el-dropdown-item>
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
      @pagination="getList"
    />
    <!--新建/编辑弹出层-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" class="sql_case_dialog" width="50%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        label-position="left"
        label-width="100px"
        size="small"
      >
        <el-form-item label="版本" prop="version">
          <el-select v-model="dataForm.version" multiple placeholder="请选择" style="width: 300px;">
            <el-option
              v-for="item in options"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用例名称" prop="caseName">
          <el-input v-model="dataForm.caseName"></el-input>
        </el-form-item>
        <el-form-item label="执行SQL" prop="executeSql">
          <el-input v-model="dataForm.executeSql" type="textarea" :autosize="{ minRows: 10, maxRows: 20 }"/>
        </el-form-item>
        <el-form-item label="验证SQL" prop="validationSql">
          <el-input v-model="dataForm.validationSql" type="textarea" :autosize="{ minRows: 10, maxRows: 20 }"/>
        </el-form-item>
        <div style="float: right;">
          <el-button @click="beautySql" type="success">
            美化
          </el-button>
          <el-button @click="dialogFormVisible = false">
            关闭
          </el-button>
          <el-button type="primary" @click="dialogStatus==='新建用例'?createData():updateData()">
            确定
          </el-button>
        </div>
      </el-form>

    </el-dialog>
  </div>

</template>

<script>
import sqlFormatter from 'sql-formatter'
import Pagination from '@/components/Pagination'
import {
  sqlCaseList,
  addSqlCase,
  updateSqlCase,
  delSqlCase,
  updateSqlCaseSwitch,
  executeSqlCase,
  validationSqlSqlCase,
  sqlCaseResultClear,
  refreshSourceStock
} from '@/api/db/sqlCaseManage' // secondary package based on el-pagination

export default {
  name: 'TabPane',
  components: {Pagination},
  props: {
    type: {
      type: String,
      default: 'ddl'
    },
    sourceHost: {
      type: String,
      default: ''
    },
    targetHost: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fileList: [],
      options: [],
      list: null,
      total: 0, // 列表数据总量
      multipleSelection: [], // 多选框的选值
      dialogStatus: '',
      dialogFormVisible: false, // 弹出层是否显示
      listQuery: {
        page: 1,
        limit: 10,
        type: this.type,
        filterInputValue: '',
        parent: this.$route.params.id,
        version: ''
      },
      listLoading: false,
      dataForm: {
        ddlDmlType: this.type,
        executeSql: '',
        validationSql: '',
        version: [],
        parent: this.$route.params.id,
        caseName: ''
      },
      rules: {
        version: [{required: true, message: 'version is required', trigger: 'change'}],
        executeSql: [{required: true, message: 'executeSql is required', trigger: 'change'}],
        validationSql: [{required: true, message: 'validationSql is required', trigger: 'change'}]
      }
    }
  },
  created() {
    const ops = {
      'MYSQL': ['5.6', '5.7', '8.0'],
      'SQL SERVER': ['05', '08', '12', '14', '17'],
      'ORACLE': ['9i', '10g', '11g', '12c', '18c', '19c']
    }
    this.options = ops[this.$route.params.dbTypeName]
    console.log(this.options)
    this.getList()
  },
  methods: {
    // tip内容将 \n 换为 <br/>标签
    ToBreak(val) {
      return val.split('\n').join('<br/>')
    },
    //
    to_obj(val) {
      if (typeof (val) === 'string') {
        return JSON.parse(val)
      } else {
        return val
      }
    }
    ,
    //获取用例列表
    getList() {
      this.listLoading = true
      sqlCaseList(this.listQuery).then(resp => {
          this.list = resp.data
          this.total = resp.count
          this.listLoading = false
        }
      )
    },

    //列表搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    //时间格式化
    formatTime(time) {
      return this.dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },

    //删除用例
    handleDelete(index, row) {
      this.$confirm('此操作将永久删除该用例, 是否继续?', '删除数据源', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delSqlCase({
          'id': row.id,
          'ddlDmlType': row.ddlDmlType,
          'parent': row.parent
        }).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.getList()
        })
      })
    },

    //创建前打开模态框
    handleCreate() {
      this.dialogStatus = '新建用例'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    //提交创建用例
    createData() {
      // this.dataForm.version = this.dataForm.version.join(',')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addSqlCase(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.getList()
          })
        }
      })
    },

    //美化SQL
    beautySql() {
      this.dataForm.executeSql = sqlFormatter.format(this.dataForm.executeSql)
      this.dataForm.validationSql = sqlFormatter.format(this.dataForm.validationSql)
    },

    //根据开关调整启用状态
    switchChange(index, row) {
      // 索引，行内数据
      updateSqlCaseSwitch({
        'id': row.id,
        'enabled': row.enabled
      }).then(resp => {
        this.$message({message: resp.data, type: 'success'})
        this.dialogFormVisible = false
        this.getList()
      })
    },

    //双击行打开编辑模态框
    openDetails(row) {
      let rowData = Object.assign({}, row) // copy obj
      this.dataForm = {
        ddlDmlType: rowData.ddlDmlType,
        executeSql: rowData.executeSql,
        validationSql: rowData.validationSql,
        version: rowData.version,
        caseName: rowData.caseName,
        parent: rowData.parent,
        id: rowData.id
      }
      this.dialogStatus = '编辑用例'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    //打开编辑的模态框
    handleUpdate(index, row) {
      let rowData = Object.assign({}, row) // copy obj
      this.dataForm = {
        ddlDmlType: rowData.ddlDmlType,
        executeSql: rowData.executeSql,
        validationSql: rowData.validationSql,
        caseName: rowData.caseName,
        version: rowData.version,
        parent: rowData.parent,
        id: rowData.id
      }
      this.dialogStatus = '编辑用例'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    //提交编辑按钮
    updateData() {
      // this.dataForm.version = this.dataForm.version.join(',')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateSqlCase(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.getList()
          })
        }
      })
    },

    //勾选CheckBox将val存入[]
    handleSelectionChange(val) {
      const list = []
      for (const row of val) {
        list.push({
          'id': row.id,
          'executeSql': row.executeSql,
          'validationSql': row.validationSql,
          'enabled': row.enabled
        })
      }
      this.multipleSelection = list
    },

    //单击行勾选CheckBox
    handleClickTableRow(row) {
      this.$refs.fileTable.toggleRowSelection(row)
    },

    //勾选执行SQL
    selectExecuteSql() {
      // 判断当前有没有选择源库主机，不选择不给请求
      if (!this.sourceHost) {
        this.$message.error('源库主机不能为空！')
      } else {
        const loading = this.$loading({
          lock: true, // lock的修改符--默认是false
          text: 'Loading', // 显示在加载图标下方的加载文案
          spinner: 'el-icon-loading', // 自定义加载图标类名
          background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
          target: document.querySelector('#table')// loadin覆盖的dom元素节点
        })
        // 勾选
        if (this.multipleSelection.length !== 0) {
          executeSqlCase({
            'host': this.sourceHost,
            'content': this.multipleSelection
          }).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getList()
            loading.close()
          }).catch(error => {
            console.log(error)
            loading.close()
          })
        }
        // 没勾选
        else {
          executeSqlCase({
            'host': this.sourceHost,
            'parentId': this.$route.params.id,
            'ddlDmlType': this.type,
            'filterInputValue': this.listQuery.filterInputValue,
            'version': this.listQuery.version
          }).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getList()
            loading.close()
          }).catch(error => {
            console.log(error)
            loading.close()
          })
        }
      }
    },

    //勾选验证SQL
    selectValidationSql() {
      // 判断当前有没有选择目标库主机，不选择不给请求
      if (!this.targetHost) {
        this.$message.error('目标库主机不能为空！')
      } else {
        const loading = this.$loading({
          lock: true, // lock的修改符--默认是false
          text: 'Loading', // 显示在加载图标下方的加载文案
          spinner: 'el-icon-loading', // 自定义加载图标类名
          background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
          target: document.querySelector('#table')// loadin覆盖的dom元素节点
        })
        // 勾选
        if (this.multipleSelection.length !== 0) {
          validationSqlSqlCase({
            'host': this.targetHost,
            'content': this.multipleSelection
          }).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getList()
            loading.close()
          }).catch(error => {
            console.log(error)
            loading.close()
          })
        }
        // 没勾选
        else {
          validationSqlSqlCase({
            'host': this.targetHost,
            'parentId': this.$route.params.id,
            'ddlDmlType': this.type,
            'filterInputValue': this.listQuery.filterInputValue,
            'version': this.listQuery.version
          }).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getList()
            loading.close()
          }).catch(error => {
            console.log(error)
            loading.close()
          })
        }
      }
    },

    //行内执行SQL
    rowExecuteSql(index, row) {
      if (!this.sourceHost) {
        this.$message.error('源库主机不能为空！')
      } else if (!row.enabled) {
        this.$message.error('禁用的用例不能执行！')
      } else {
        const loading = this.$loading({
          lock: true, // lock的修改符--默认是false
          text: 'Loading', // 显示在加载图标下方的加载文案
          spinner: 'el-icon-loading', // 自定义加载图标类名
          background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
          target: document.querySelector('#table')// loadin覆盖的dom元素节点
        })
        executeSqlCase({
          'host': this.sourceHost,
          'content': [
            {'id': row.id, 'executeSql': row.executeSql, 'validationSql': row.validationSql, 'enabled': row.enabled}
          ]
        }).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.getList()
          loading.close()
        }).catch(error => {
          console.log(error)
          loading.close()
        })
      }
    },

    //行内验证SQL
    rowValidationSql(index, row) {
      if (!this.targetHost) {
        this.$message.error('目标库主机不能为空！')
      } else if (!row.enabled) {
        this.$message.error('禁用的用例不能执行！')
      } else {
        const loading = this.$loading({
          lock: true, // lock的修改符--默认是false
          text: 'Loading', // 显示在加载图标下方的加载文案
          spinner: 'el-icon-loading', // 自定义加载图标类名
          background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
          target: document.querySelector('#table')// loadin覆盖的dom元素节点
        })
        validationSqlSqlCase({
          'host': this.targetHost,
          'content': [
            {'id': row.id, 'executeSql': row.executeSql, 'validationSql': row.validationSql, 'enabled': row.enabled}
          ]
        }).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.getList()
          loading.close()
        }).catch(error => {
          console.log(error)
          loading.close()
        })
      }
    },

    //清除记录
    clearResult() {
      const loading = this.$loading({
        lock: true, // lock的修改符--默认是false
        text: 'Loading', // 显示在加载图标下方的加载文案
        spinner: 'el-icon-loading', // 自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
        target: document.querySelector('#table')// loadin覆盖的dom元素节点
      })

      sqlCaseResultClear({
        'ddlDmlType': this.dataForm.ddlDmlType,
        'parent': this.$route.params.id,
        'filterInputValue': this.listQuery.filterInputValue,
        'version': this.listQuery.version
      }).then(resp => {
        this.$message({message: resp.data, type: 'success'})
        this.getList()
        loading.close()
      }).catch(error => {
        console.log(error)
        loading.close()
      })
    },

    //刷新存量
    refreshStock() {
      // 判断当前有没有选择源库主机，不选择不给请求
      if (!this.sourceHost) {
        this.$message.error('源库主机不能为空！')
      } else {
        const loading = this.$loading({
          lock: true, // lock的修改符--默认是false
          text: 'Loading', // 显示在加载图标下方的加载文案
          spinner: 'el-icon-loading', // 自定义加载图标类名
          background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
          target: document.querySelector('#table')// loadin覆盖的dom元素节点
        })
        // 勾选
        if (this.multipleSelection.length !== 0) {
          refreshSourceStock({
            'host': this.sourceHost,
            'content': this.multipleSelection
          }).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getList()
            loading.close()
          }).catch(error => {
            console.log(error)
            loading.close()
          })
        }
        // 没勾选
        else {
          refreshSourceStock({
            'host': this.sourceHost,
            'parentId': this.$route.params.id,
            'ddlDmlType': this.type,
            'filterInputValue': this.listQuery.filterInputValue,
            'version': this.listQuery.version
          }).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.getList()
            loading.close()
          }).catch(error => {
            console.log(error)
            loading.close()
          })
        }
      }
    }
  }
}
</script>

<style lang="scss">
//normal 默认。空白会被浏览器忽略。
//pre 空白会被浏览器保留。其行为方式类似 HTML 中的<pre> 标签。
//nowrap 文本不会换行，文本会在在同一行上继续，直到遇到 <br>标签为止。
//pre-wrap 保留空白符序列，但是正常地进行换行。
//pre-line 合并空白符序列，但是保留换行符。
//inherit 规定应该从父元素继承 white-space 属性的值。
.sql_case_table {
  //文本不会换行，文本会在在同一行上继续，直到遇到 <br>标签为止。
  .el-table .cell {
    white-space: nowrap;
  }

  //单元格过长....
  .oneLine {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

//调试结果弹出层
.sql_case_dialog {
  display: flex;
  justify-content: center;
  align-items: Center;
  overflow: hidden;

  .el-dialog {
    margin: 0 auto !important;

    .el-dialog__body {
      max-height: calc(100vh - 100px);
      overflow: auto;
    }
  }
}
</style>
