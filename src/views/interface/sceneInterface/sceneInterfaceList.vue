<template>
  <div v-if="showList">
    <div class="filter-container">
      <el-cascader
        placeholder="点我搜索用例哦"
        :options="interfaceOptions"
        size="small"
        clearable
        v-model="cascaderInterface"
        :show-all-levels="false"
        filterable></el-cascader>
      <el-button class="filter-item tableHeaderBtn" type="primary" icon="el-icon-plus"
                 @click="handleCreate(cascaderInterface)" size="small">添加接口
      </el-button>
      <el-button class="filter-item tableHeaderBtn" type="primary"
                 icon="el-icon-bottom-right"
                 @click="importCase" size="small">导入接口
      </el-button>
      <el-dropdown class="tableHeaderBtn">
        <el-button type="primary" size="small" icon="el-icon-date">
          参数化<i class="el-icon-arrow-down el-icon--right"/>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handlePublicParams">
            公共参数
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleLocalParams">
            局部参数
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button class="filter-item tableHeaderBtn" type="primary"
                 icon="el-icon-bicycle"
                 @click="batchRun" size="small">批量运行
      </el-button>
      <el-input
        v-model="listQuery.filterInputValue"
        placeholder="like %url% %name%"
        style="width: 200px;float: right;"
        class="filter-item"
        clearable
        size="small"
        prefix-icon="el-icon-search"
        @keyup.enter.native="keyEnter"
      />
    </div>
    <!--表格组件-->
    <el-table
      v-loading="listLoading"
      :data="list"
      row-key="id"
      ref="dragTable"
      element-loading-text="Loading"
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
      @row-dblclick="detail"
      size="medium">
      <el-table-column
        type="selection"
        width="55"
        align="center"
      />
      <el-table-column label="用例名称" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.interfaceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请求方式" width="100" align="left">
        <template slot-scope="scope" class="request-method">
          <el-tag size="mini"
                  :style="{'background-color': getColor(true, scope.row.method), border: getColor(true, scope.row.method)}"
                  class="api-el-tag">
            {{ scope.row.method }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="请求地址" align="left">
        <template slot-scope="scope">
          {{ scope.row.url.split('?')[0] }}
        </template>
      </el-table-column>
      <el-table-column label="响应延迟" width="100" align="left">
        <template slot-scope="scope">
          {{ scope.row.result.duration }}<span v-show="scope.row.result.duration">ms</span>
        </template>
      </el-table-column>
      <el-table-column label="响应状态码" width="100" align="left">
        <template slot-scope="scope">
          <el-tag size="mini" :type="scope.row.result.status_code !== 200 ? 'danger' : 'success'">
            {{ scope.row.result.status_code }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="断言结果" width="100" align="left">
        <template slot-scope="scope">
          <el-tag size="mini"
                  :type="scope.row.result.conclusion === '成功' ? 'success'
                  : scope.row.result.conclusion === '失败' ? 'danger'
                  :'info'">
            {{ scope.row.result.conclusion }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="160" align="left">
        <template slot-scope="scope">
          {{ formatTImeFun(scope.row.updateTime) }}
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
              <el-dropdown-item @click.native="rowRun(scope.$index, scope.row)">执行</el-dropdown-item>
              <el-dropdown-item @click.native="detail(scope.row, scope.$index)">详情</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>
    <interface-form ref="interfaceForm" :host="host" @refreshList="refreshList"></interface-form>
    <response-result ref="responseResult" :projectId="projectId"></response-result>
    <public-params ref="publicParams" :projectId="projectId"></public-params>
    <local-params ref="localParams" :projectId="projectId"></local-params>
    <case-import ref="caseImport" @refreshList="refreshList"></case-import>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import interfaceForm from '@/views/interface/commponents/interfaceForm'
import responseResult from '@/views/interface/commponents/responseResult'
import publicParams from '@/views/interface/commponents/publicParams'
import localParams from '@/views/interface/sceneInterface/localParams'
import Sortable from 'sortablejs'
import {
  addSceneInterface, delSceneInterface,
  getSceneInterfaceList, runSceneInterface,
  tableSort, getInterfaceSearch
} from '@/api/interface/sceneInterface'
import { formatTime } from '@/utils/format-date'
import caseImport from '@/views/interface/sceneInterface/caseImport'

export const API_METHOD_COLOUR = [
  ['GET', '#61AFFE'], ['POST', '#49CC90'], ['PUT', '#fca130'],
  ['PATCH', '#E2EE11'], ['DELETE', '#f93e3d'], ['OPTIONS', '#0EF5DA'],
  ['HEAD', '#8E58E7'], ['CONNECT', '#90AFAE']
]
export default {
  name: 'sceneInterfaceList',
  components: { Pagination, interfaceForm, responseResult, publicParams, localParams, caseImport },
  props: {
    projectId: {
      type: [String, Number],
      default: ''
    },
    host: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showList: false,
      list: [],
      listLoading: true,
      total: 0,                   //列表数据总量
      listQuery: { page: 1, limit: 10, id: '', filterInputValue: '' },
      sortable: null, //排序
      newList: [],
      oldList: [],
      multipleSelection: [],
      cascaderInterface: '',
      interfaceOptions: [],
      formatTImeFun: formatTime,
      methodColorMap: new Map(API_METHOD_COLOUR)
    }
  },
  watch: {
    projectId(val) {
      this.showList = false
      getInterfaceSearch({ 'id': val }).then(resp => {
          this.interfaceOptions = resp
        }
      )
    }
  },
  methods: {
    getColor(enable, method) {
      if (enable) {
        return this.methodColorMap.get(method)
      }
    },
    keyEnter(){
      this.getList(this.listQuery.id)
    },
    importCase() {
      this.$refs.caseImport.openDialog(this.listQuery.id)
    },
    getList() {
      getSceneInterfaceList(this.listQuery).then(resp => {
        this.list = resp.data
        this.total = resp.count
        this.listLoading = false
        //排序
        this.oldList = this.list.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
    },
    openList(treeNodeId) {
      this.showList = true
      this.listLoading = true
      this.listQuery.id = treeNodeId
      this.getList()
    },
    handleCreate(value) {
      if (value) {
        addSceneInterface({
          'id': value[1],
          'parent': this.listQuery.id
        }).then(resp => {
          this.$message({ message: resp.data.message, type: 'success' })
          // 更新排序内容
          this.newList.push(resp.data.id)
          this.getList()
        })
      } else {
        this.$message({ message: '级联选择器内容不能为空', type: 'warning' })
      }
    },
    handleUpdate(_node, _data) {
      this.$refs.interfaceForm.getSceneInterfaceDetail(_data.id)
    },
    handleDelete(index, row) {
      this.$confirm('此操作将永久删除?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delSceneInterface({ 'id': row.id }).then(resp => {
          this.$message({ message: resp.data, type: 'success' })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSelectionChange(val) {
      const list = []
      for (const row of val) {
        list.push(row.id)
      }
      this.multipleSelection = list
    },
    rowRun(index, row) {
      console.log(row)
      // 请求中删除result属性，添加项目domain属性
      delete row.result
      row['projectId'] = this.projectId
      row['host'] = this.host
      const loading = this.$loading({
        lock: true, // lock的修改符--默认是false
        text: 'Loading', // 显示在加载图标下方的加载文案
        spinner: 'el-icon-loading', // 自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
        target: document.querySelector('#table')// loading覆盖的dom元素节点
      })
      runSceneInterface(row).then(resp => {
        this.$message({ message: resp.message, type: 'success' })
        this.detail(resp.data)
        this.getList()
        loading.close()
      }).catch(error => {
        console.log(error)
        loading.close()
      })
    },
    detail(row, index) {
      console.log(row)
      if (row.result) {
        this.$refs.responseResult.openResultDetail({ 'data': row.result })
      } else {
        this.$message({ message: '我还没有被运行，没有记录结果呢', type: 'warning' })
      }
    },
    handlePublicParams() {
      this.$refs.publicParams.openDialog()
    },
    handleLocalParams() {
      const query = {
        'projectId': this.projectId,
        'sceneId': this.listQuery.id
      }
      this.$refs.localParams.openDialog(query)
    },
    batchRun() {
      //勾选批量运行
      const loading = this.$loading({
        lock: true, // lock的修改符--默认是false
        text: 'Loading', // 显示在加载图标下方的加载文案
        spinner: 'el-icon-loading', // 自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
        target: document.querySelector('#table')//loading覆盖的dom元素节点
      })
      if (this.multipleSelection.length > 0) {
        runSceneInterface({
          idList: this.multipleSelection,
          projectId: this.projectId,
          host: this.host
        }).then(resp => {
          //运行结束，消息提示
          this.$message({ message: resp.message, type: 'success' })
          //重新获取列表，更新结果列
          this.getList()
          loading.close()
        }).catch(error => {
          console.log(error)
          loading.close()
        })
      } else {
        //不勾选全部运行
        runSceneInterface({
          parentId: this.listQuery.id,
          projectId: this.projectId,
          host: this.host
        }).then(resp => {
          //运行结束，消息提示
          this.$message({ message: resp.message, type: 'success' })
          //重新获取列表，更新结果列
          this.getList()
          loading.close()
        }).catch(error => {
          console.log(error)
          loading.close()
        })
      }
    },
    refreshList() {
      this.getList(this.listQuery.id)
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.list.splice(evt.oldIndex, 1)[0]
          this.list.splice(evt.newIndex, 0, targetRow)
          // for show the changes, you can delete in you code
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)
          console.log(this.newList)
          this.$confirm('你已拖拽排序是否保存?', '提醒', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            tableSort({ newList: this.newList }).then(resp => {
              this.$message({ message: resp.data, type: 'success' })
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消排序'
            })
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.tableHeaderBtn {
  margin-bottom: 10px;
  margin-left: 5px;
}

.request-method {
  padding: 0 5px;
  color: #1E90FF;
}

.api-el-tag {
  color: white;
}
</style>
