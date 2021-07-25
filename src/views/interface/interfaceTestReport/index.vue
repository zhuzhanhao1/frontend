<template>
  <div class="app-container">
    <el-container>
      <el-aside width="270px" class="report_left">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            {{ reportInfo.projectName }}
          </div>
          <div class="text item">
            开始时间：{{ formatTime(reportInfo.startTime) }}
          </div>
          <div class="text item">
            结束时间：{{ formatTime(reportInfo.endTime) }}
          </div>
          <div class="text item">
            执行状态：
            <el-tag size="medium"
                    :type="reportInfo.executeStatus === '待启动' ? 'info'
                    :reportInfo.executeStatus ==='进行中' ? ''
                    :reportInfo.executeStatus==='已完成' ? 'success'
                    :reportInfo.executeStatus ==='异常' ? 'danger'
                    :'warning' ">
              {{ reportInfo.executeStatus }}
            </el-tag>
          </div>
        </el-card>
        <el-card class="box-card" style="height: 650px;margin-top: 5px;">
          <div slot="header" class="clearfix">
            场景用例
          </div>
          <el-tree ref="SlotTree"
                   :data="reportInfo.setTree"
                   :props="defaultProps"
                   highlight-current
                   @node-click="handleNodeClick">
          </el-tree>
        </el-card>
      </el-aside>
      <el-main class="report_right">
        <div class="filter-container">
          <div>
            <el-button
              class="filter-item"
              icon="el-icon-back"
              round
              style="margin-right: 50px;"
              size="small"
              @click="goback"
            >Back
            </el-button>
            <el-tag>默认显示最新的测试结果，第：</el-tag>
            <el-select v-model="runNumberId" filterable placeholder="次数" size="small" clearable
                       @change="changeRunNumber(runNumberId)"
                       style="width: 100px;margin:0 5px 10px 5px;">
              <el-option
                v-for="item in reportInfo.runNumberList"
                :key="item.runNumber"
                :label="item.runNumber"
                :value="item.runNumber">
              </el-option>
            </el-select>
            <el-tag>次测试结果</el-tag>
          </div>
          <!--highCharts-->
          <charts ref="charts"></charts>
          <!--表格组件-->
          <div style="margin-top: 20px;" v-show="showTable" class="block">
            <el-table
              v-loading="listLoading"
              :data="list"
              element-loading-text="Loading"
              fit
              highlight-current-row
              size="medium">
              <el-table-column label="用例名称" align="left">
                <template slot-scope="scope">
                  <span>{{ scope.row.result.request_data.interfaceName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="请求方式" width="100" align="left">
                <template slot-scope="scope" class="request-method">
                  <el-tag size="mini"
                          :style="{'background-color': getColor(true, scope.row.result.request.method), border: getColor(true, scope.row.method)}"
                          class="api-el-tag">
                    {{ scope.row.result.request.method }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="请求地址" align="left">
                <template slot-scope="scope">
                  {{ scope.row.result.request_data.url.split('?')[0] }}
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
                  {{ formatTime(scope.row.UpdateTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="left" width="100">
                <template slot-scope="scope">
                  <el-button
                    size="mini" round plain
                    @click="resultDetails(scope.$index, scope.row)">详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <!--分页组件-->
            <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                        @pagination="interfaceList"/>
          </div>
        </div>
      </el-main>
    </el-container>
    <!--抽屉调试结果-->
    <response-result ref="responseResult"></response-result>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index'
import {getReportInfo, getReportList} from '@/api/interface/interfaceTestReport'
import responseResult from "@/views/interface/commponents/responseResult";
import charts from "@/views/interface/interfaceTestReport/charts";
import {API_METHOD_COLOUR} from "@/views/interface/sceneInterface/sceneInterfaceList";


export default {
  name: 'interfaceTestReport',
  components: {Pagination, responseResult, charts},
  data() {
    return {
      runNumberId: '',
      listLoading: false,
      dialogVisible: false,
      showTable: false,
      listQuery: {page: 1, limit: 10},
      list: [],
      total: 0,
      relatedId: '',
      reportInfo: {},
      defaultProps: {
        label: 'label'
      },
      methodColorMap: new Map(API_METHOD_COLOUR),
    }
  },
  created() {
    console.log(this.$route.params)
    //获取当前项目下的场景用例树
    getReportInfo({'id': this.$route.params.id}).then(resp => {
        this.reportInfo = resp
        this.runNumberId = resp.maxRunNumber
      }
    )
  },
  methods: {
    getColor(enable, method) {
      if (enable) {
        return this.methodColorMap.get(method);
      }
    },
    interfaceList() {
      const query = {
        'id': this.$route.params.id,
        'relatedId': this.relatedId,
        'runNumberId': this.runNumberId
      }
      //获取列表接口
      getReportList(query).then(resp => {
          this.showTable = true
          this.list = resp.data
          this.total = resp.count
        }
      )
      //获取Charts
      this.$refs.charts.openCharts(query)
    },
    //点击树节点获取右侧表格内容以及图表的内容
    handleNodeClick(data) {
      this.relatedId = data.value
      const query = {
        'id': this.$route.params.id,
        'relatedId': data.value,
        'runNumberId': this.runNumberId
      }
      //获取列表接口
      getReportList(query).then(resp => {
          this.showTable = true
          this.list = resp.data
          this.total = resp.count
        }
      )
      //获取Charts
      this.$refs.charts.openCharts(query)
    },
    //表格内时间格式化
    formatTime(time) {
      if (time) {
        return this.dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      } else {
        return "无"
      }
    },
    //改变运行次数需要重新渲染处列表和图表
    changeRunNumber(runNumberId) {
      this.runNumberId = runNumberId
      const query = {
        'id': this.$route.params.id,
        'relatedId': this.relatedId,
        'runNumberId': runNumberId
      }
      if (runNumberId) {
        //获取列表
        getReportList(query).then(resp => {
            this.showTable = true
            this.list = resp.data
            this.total = resp.count
          }
        )
        //获取charts
        this.$refs.charts.openCharts(query)
      } else {
        this.$refs.charts.openCharts(query)
        this.showTable = false
      }
    },
    //详情
    resultDetails(index, row) {
      console.log(row)
      if (row.result) {
        this.$refs.responseResult.openResultDetail({'data': row.result})
      } else {
        this.$message({message: '我还没有被运行，没有记录结果呢', type: 'warning'})
      }
    },
    //返回上一步
    goback() {
      console.log(this.$route.params)
      this.$router.push({ // 核心语句
        name: 'executePlan', // 跳转的路径
        params: { // 路由传参时push和query搭配使用 ，作用时传递参数
          // dbTypeName: this.$route.params.dbTypeName,
          // stockAddType: this.$route.params.stockAddType
        }
      })
    }
  }

}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 15px;
  overflow: auto;
  max-height: calc(100vh - 70px);
}

.my_textarea_width {
  width: 90%;
}

//左侧样式
.report_left {
  //height: 880px;
  .text {
    font-size: 14px;
  }

  .item {
    padding: 5px 0;
  }

  .box-card {
    width: 250px;
    overflow-y: auto;
  }

  .clearfix:before,
  .clearfix {
    text-align: center;
  }

  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
}

.report_right {
  padding: 15px;
  background: #ffffff;
}

.el-carousel__item div {
  color: #000000;
  font-size: 14px;
  //opacity: 0.75;
  margin: 0;
  padding: 5px;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}
.request-method {
  padding: 0 5px;
  color: #1E90FF;
}

.api-el-tag {
  color: white;
}
</style>



