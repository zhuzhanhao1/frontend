<template>
  <div v-if="showList">
    <div class="filter-container">
      <el-button class="filter-item tableHeaderBtn" type="primary"
                 icon="el-icon-collection-tag"
                 @click="handlePublicParams" size="small">公共参数
      </el-button>
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
      element-loading-text="Loading"
      fit
      highlight-current-row
      @row-dblclick="detail"
      @selection-change="handleSelectionChange"
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
          <el-tag size="mini" :type="scope.row.result.conclusion !== '成功' ? 'danger' : 'success'">
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
              <el-dropdown-item @click.native="handleUpdate(scope.$index,scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handleDelete(scope.$index, scope.row)">删除</el-dropdown-item>
              <el-dropdown-item @click.native="rowRun(scope.$index, scope.row)">执行</el-dropdown-item>
              <el-dropdown-item @click.native="copyRow(scope.$index, scope.row)">复制</el-dropdown-item>
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
  </div>
</template>

<script>
import publicParams from '../commponents/publicParams'
import interfaceForm from '../commponents/interfaceForm'
import { formatTime } from '@/utils/format-date'
import Pagination from '@/components/Pagination'
import responseResult from '../commponents/responseResult'
import {
  addInterfaceCase,
  delInterfaceCase,
  getSingleInterfaceList,
  runInterfaceCase
} from '@/api/interface/singleInterface'
import { API_METHOD_COLOUR } from '@/views/interface/sceneInterface/sceneInterfaceList'

export default {
  name: 'singleInterfaceList',
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
  components: { Pagination, interfaceForm, responseResult, publicParams },
  data() {
    return {
      listLoading: false,
      list: [],
      showList: false,
      total: 0,
      multipleSelection: [],
      listQuery: { page: 1, limit: 10, id: '', filterInputValue: '' },
      formatTImeFun: formatTime,
      dialogUpdateInterface: false,
      methodColorMap: new Map(API_METHOD_COLOUR)
    }
  },
  watch: {
    projectId(val) {
      this.showList = false
    }
  },
  methods: {
    getColor(enable, method) {
      if (enable) {
        return this.methodColorMap.get(method)
      }
    },
    handleSelectionChange(val) {
      console.log(val)
      const list = []
      for (const row of val) {
        list.push(row.id)
      }
      this.multipleSelection = list
    },
    handleUpdate(_node, _data) {
      this.$refs.interfaceForm.getInterfaceDetail(_data.id)
    },
    getList(treeNodeId) {
      this.showList = true
      this.listLoading = true
      this.listQuery.id = treeNodeId
      getSingleInterfaceList(this.listQuery).then(resp => {
        this.list = resp.data
        this.total = resp.count
        this.listLoading = false
      })
    },
    keyEnter(){
      this.getList(this.listQuery.id)
    },
    handleDelete(index, row) {
      this.$confirm('此操作将永久删除?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delInterfaceCase({ 'id': row.id }).then(resp => {
          this.$message({ message: resp.data, type: 'success' })
          this.getList(this.listQuery.id)
        })
      })
    },
    rowRun(index, row) {
      // 请求中删除result属性
      delete row.result
      delete row.parent
      row['host'] = this.host
      row['projectId'] = this.projectId
      const loading = this.$loading({
        lock: true, // lock的修改符--默认是false
        text: 'Loading', // 显示在加载图标下方的加载文案
        spinner: 'el-icon-loading', // 自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
        target: document.querySelector('#table')// loading覆盖的dom元素节点
      })
      runInterfaceCase(row).then(resp => {
        this.$message({ message: resp.message, type: 'success' })
        this.getList(this.listQuery.id)
        // 执行完打开结果页
        this.detail(resp.data)
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
        runInterfaceCase({
          idList: this.multipleSelection,
          projectId: this.projectId,
          host: this.host
        }).then(resp => {
          //运行结束，消息提示
          this.$message({ message: resp.message, type: 'success' })
          //重新获取列表，更新结果列
          this.getList(this.listQuery.id)
          loading.close()
        }).catch(error => {
          console.log(error)
          loading.close()
        })
      } else {
        //不勾选全部运行
        runInterfaceCase({
          parent: this.listQuery.id,
          projectId: this.projectId,
          host: this.host
        }).then(resp => {
          //运行结束，消息提示
          this.$message({ message: resp.message, type: 'success' })
          //重新获取列表，更新结果列
          this.getList(this.listQuery.id)
          loading.close()
        }).catch(error => {
          console.log(error)
          loading.close()
        })
      }
    },
    copyRow(index, data) {
      addInterfaceCase({
        'id': data.id,
        'parent': this.listQuery.id
      }).then(resp => {
        this.$message({ message: resp.data, type: 'success' })
        this.getList(this.listQuery.id)
      })
    },
    refreshList() {
      this.getList(this.listQuery.id)
    },
    handlePublicParams() {
      this.$refs.publicParams.openDialog()
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
