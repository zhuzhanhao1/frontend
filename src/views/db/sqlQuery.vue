<template>
  <div class="app-container sql_query_tab">
    <el-tag type="primary" style="margin-right: 27px;">请您先选择你需要查询的数据源</el-tag>
    <el-select v-model="host" filterable placeholder="选择数据源" size="small"
               @change="updateHostContent(host)" style="width: 250px;margin-bottom: 10px;">
      <el-option-group
        v-for="group in options"
        :key="group.label"
        :label="group.label">
        <el-option
          v-for="item in group.options"
          :key="item.dbType+','+item.host+','+item.username+','+item.dbName+','+item.serviceName"
          :label="item.host+'/'+item.username+'/'+item.dbName+item.serviceName"
          :value="item.dbType+','+item.host+','+item.username+','+item.dbName+','+item.serviceName">
          <span style="float: left">{{ item.host }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.dbName }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.username }}/</span>
        </el-option>
      </el-option-group>
    </el-select>
    <el-tabs :tab-position="tabPosition" stretch @tab-click="handleLeftTabClick">
      <el-tab-pane v-for="(item,index) in tables"
                   :label="item"
                   :value="item"
                   :key="item+index"
      >
        <el-tabs v-model="activeName" @tab-click="handleClick(item)" style="margin-left: 20px;">
          <!--          <el-tab-pane label="建表SQL" name="first">-->
          <!--            <pre>{{ showTable }}</pre>-->
          <!--          </el-tab-pane>-->
          <el-tab-pane label="列字段" name="second">
            <el-table
              v-loading="listLoading"
              :data="columns"
              element-loading-text="Loading"
              fit
              highlight-current-row
              size="medium"
            >
              <el-table-column :label="colunmName" align="left" v-for="(colunmName,index) in columnNames">
                <template slot-scope="scope">
                  <span>{{ scope.row[index] }}</span>
                </template>
              </el-table-column>
            </el-table>
            <!--分页组件-->
            <pagination
              v-show="columnTotal>0"
              :total="columnTotal"
              :page.sync="columnList.page"
              :limit.sync="columnList.limit"
              @pagination="handleClick(item)"
            />
          </el-tab-pane>
          <el-tab-pane label="表数据" name="third">
            <el-table
              v-loading="listLoading"
              :data="tableDatas"
              element-loading-text="Loading"
              fit
              highlight-current-row
              size="small"
            >
              <el-table-column :label="colunmName" align="left" v-for="(colunmName,index) in columnNames">
                <template slot-scope="scope">
                  <span>{{ scope.row[index] }}</span>
                </template>
              </el-table-column>
            </el-table>
            <!--分页组件-->
            <pagination
              v-show="total>0"
              :total="total"
              :page.sync="listQuery.page"
              :limit.sync="listQuery.limit"
              @pagination="handleClick(item)"
            />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
import { getAlltables, getTableColumns, getTableDatas } from '@/api/db/sqlQuery'
import { dataSourceHosts } from '@/api/db/dataSourceConfig'
import Pagination from '@/components/Pagination/index'

export default {
  name: 'sqlQuery',
  components: { Pagination },
  data() {
    return {
      activeName: 'second',
      tabPosition: 'left',
      host: '',
      changeHost: '',
      showTable: '',
      options: null,
      tables: [],
      columns: [],
      total: 0, // 列表数据总量
      columnTotal: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      columnList: {
        page: 1,
        limit: 10
      },
      tableDatas: [],
      listLoading: false,
      columnNames: []
    }
  },
  created() {
    this.getHosts()
  },
  methods: {
    //select下拉菜单内容
    getHosts() {
      dataSourceHosts().then(resp => {
        this.options = resp
      })
    },
    //更改下拉菜单渲染所有表的信息
    updateHostContent(host) {
      const loading = this.$loading({
        lock: true, // lock的修改符--默认是false
        text: 'Loading', // 显示在加载图标下方的加载文案
        spinner: 'el-icon-loading', // 自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
        target: document.querySelector('#table')// loadin覆盖的dom元素节点
      })
      getAlltables({
        'host': host
      }).then(resp => {
        if (resp.code === 1000) {
          this.changeHost = host
          this.tables = resp.data
          //去执行查询列的接口
          getTableColumns({
            'tableName': this.tables[0],
            'host': this.host,
            'columns': true
          }).then(resp => {
            this.columnTotal = resp.count
            this.columnNames = resp.data[0]
            this.columns = resp.data[1]
            this.listLoading = false
          })
        } else {
          this.$message.error(resp.data)
          this.host = this.changeHost
        }
        loading.close()
      })

    },
    handleLeftTabClick(tab, event) {
      this.handleClick(tab.label)
    },
    //点击tab的回调
    handleClick(item) {
      if (this.activeName === 'second') {
        this.listLoading = true
        //去执行查询列的接口
        getTableColumns({
          'tableName': item,
          'host': this.host,
          'columns': true,
          'limit': this.columnList.limit,
          'page': this.columnList.page
        }).then(resp => {
          this.columnTotal = resp.count
          this.columnNames = resp.data[0]
          this.columns = resp.data[1]
          this.listLoading = false
        })
      } else {
        //执行获取数据的接口
        this.listLoading = true
        //在获取内容信息
        getTableDatas({
          'tableName': item,
          'host': this.host,
          'limit': this.listQuery.limit,
          'page': this.listQuery.page
        }).then(resp => {
          this.total = resp.count
          this.columnNames = resp.data[0]
          this.tableDatas = resp.data[1]
          this.listLoading = false
        })
      }
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
  max-height: calc(100vh - 80px);
}
</style>
<style lang="scss">
//左侧tab的高度
.sql_query_tab {
  .el-tabs--left .el-tabs__header.is-left {
    height: 700px;
  }
}
</style>
