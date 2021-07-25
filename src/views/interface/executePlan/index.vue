<template>
  <div class="app-container">
    <div class="filter-container">
      <el-tag>项目：</el-tag>
      <el-select v-model="projectId" filterable placeholder="请先选择计划" size="small" clearable
                 @change="changeProject" style="width: 180px;margin-bottom: 10px;margin-left: 5px;">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.projectName"
          :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" style="margin:0 5px 15px 5px;" type="primary" icon="el-icon-plus"
                 @click="handleCreate" size="small" v-show="this.projectId !== ''">
        新建计划
      </el-button>
      <el-input
        v-model="listQuery.filterInputValue"
        placeholder="like %计划名称%"
        style="width: 200px;float: right;"
        class="filter-item"
        clearable
        size="small"
        prefix-icon="el-icon-search"
        @keyup.enter.native="keyEnter"
      />
    </div>
    <div v-if="this.projectId !== ''">
      <!--表格组件-->
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        fit
        highlight-current-row
        size="medium">
        <el-table-column label="计划名称" align="left">
          <template slot-scope="scope">
            <span>{{ scope.row.planName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="策略" align="left" width="">
          <template slot-scope="scope">
            {{ scope.row.ploy }}
          </template>
        </el-table-column>
<!--        <el-table-column label="策略描述" align="left">-->
<!--          <template slot-scope="scope">-->
<!--            {{ scope.row.describe }}-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column label="是否通知" align="left" width="">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.executeType === false ? '通知开启' : '通知关闭'" placement="top">
              <el-switch
                v-model="scope.row.notification"
                @change="notificationChange(scope.$index,scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="执行方式" align="left" width="">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.executeType === true ? '直接运行一次' : '按策略定时运行'" placement="top">
              <el-switch
                v-model="scope.row.executeType"
                @change="executeTypeChange(scope.$index,scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" align="left" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="left" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="执行状态" align="left" width="120">
          <template slot-scope="scope">
            <el-tag size="mini"
                    :type="scope.row.executeStatus === '待启动' ? 'info'
                    :scope.row.executeStatus ==='进行中' ? ''
                    :scope.row.executeStatus ==='已完成' ? 'success'
                    :scope.row.executeStatus ==='异常' ? 'danger'
                    :'warning' ">
              {{ scope.row.executeStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="left">
          <template slot-scope="scope">
            <el-dropdown>
              <el-button type="primary" size="mini" round plain>
                操作<i class="el-icon-arrow-down el-icon--right"/>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleUpdate(scope.$index, scope.row)">编辑计划</el-dropdown-item>
                <el-dropdown-item @click.native="handleDelete(scope.$index, scope.row)">删除计划</el-dropdown-item>
                <el-dropdown-item @click.native="runPlan(scope.$index, scope.row)">执行计划</el-dropdown-item>
                <el-dropdown-item @click.native="resultDetails(scope.$index, scope.row)">查看报告</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                  @pagination="getExecutePlanList"/>
    </div>
    <!--新建/编辑弹出层-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="35%">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" label-position="left" label-width="100px" size="small">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="dataForm.planName"></el-input>
        </el-form-item>
        <el-form-item label="场景用例" prop="sceneCaseIds">
          <el-select v-model="dataForm.sceneCaseIds" multiple placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in sceneCaseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消息通知" prop="notification">
          <el-radio-group v-model="dataForm.notification">
            <el-radio border :label="true">开启通知</el-radio>
            <el-radio border :label="false">关闭通知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行方式" prop="executeType">
          <el-switch
            v-model="dataForm.executeType"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="快速执行"
            inactive-text="策略执行">
          </el-switch>
        </el-form-item>
        <div v-if="dataForm.executeType === false">
          <el-form-item label="策略" prop="ploy">
            <!--<el-input v-model="dataForm.ploy"></el-input>-->
            <el-autocomplete
              popper-class="my-autocomplete"
              v-model="dataForm.ploy"
              :fetch-suggestions="querySearch"
              placeholder="请输入内容"
              clearable
              @select="handleSelect">
              <template slot-scope="{ item }">
                <div class="name">{{ item.value }}</div>
                <span class="addr">{{ item.describe }}</span>
              </template>
            </el-autocomplete>
            <el-popover
              placement="top-start"
              title=""
              trigger="hover">
              <h3>格式描述</h3>
              <el-table :data="formatDesc" size="medium">
                <el-table-column width="150" property="expression" label="名称"></el-table-column>
                <el-table-column width="100" property="type" label="参数类型"></el-table-column>
                <el-table-column width="300" property="describe" label="描述"></el-table-column>
              </el-table>
              <el-divider>使用前先看看规则哦</el-divider>
              <h3>参数描述</h3>
              <el-table :data="propertyDesc" size="medium">
                <el-table-column width="150" property="expression" label="表达式"></el-table-column>
                <el-table-column width="100" property="type" label="参数类型"></el-table-column>
                <el-table-column width="300" property="describe" label="描述"></el-table-column>
              </el-table>
              <el-button slot="reference" style="margin-left: 5px">格式：年 月 日 周 时 分 秒</el-button>
            </el-popover>
          </el-form-item>
          <!--          <el-form-item label="策略描述" prop="describe">-->
          <!--            <el-input type="textarea" v-model="dataForm.describe"></el-input>-->
          <!--          </el-form-item>-->
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="dataForm.startTime"
              type="datetime"
              placeholder="选择日期时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="dataForm.endTime"
              type="datetime"
              placeholder="选择日期时间">
            </el-date-picker>
          </el-form-item>
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='新建计划'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index' // secondary package based on el-pagination
import {projectList} from '@/api/interface/projectManage'
import {getSceneInterfaceTree} from '@/api/interface/sceneInterface'
import {
  getExecutePlanList,
  addExecutePlan,
  updateExecutePlan,
  delExecutePlan,
  runExecutePlan
} from '@/api/interface/executePlan'

export default {
  components: {Pagination},
  data() {
    return {
      projectId: '',
      host: '',
      options: [],
      sceneCaseOptions: [],
      list: [],
      listLoading: true,
      dialogFormVisible: false,   //弹出层是否显示
      dialogStatus: '',           //判断是新建还是编辑的状态
      total: 0,                   //列表数据总量
      listQuery: {
        page: 1,
        limit: 10,
        projectId: '',
        filterInputValue: ''
      },
      dataForm: {
        planName: '',
        ploy: '',
        startTime: '',
        endTime: '',
        describe: '',
        notification: false,
        sceneCaseIds: [],
        parent: '',
        executeType: true
      },
      rules: {
        planName: [{required: true, message: 'planName is required', trigger: 'blur'}],
        notification: [{required: true, message: 'notification is required', trigger: 'blur'}],
        sceneCaseIds: [{required: true, message: 'sceneCaseIds is required', trigger: 'blur'}]
      },
      restaurants: [
        {'value': '* * * * * */1 0', 'describe': '每分钟执行一次'},
        {'value': '* * * * * 0-15 0', 'describe': '每小时的前15分钟每分钟执行一次'},
        {'value': '* * * * * */30 0', 'describe': '每30分钟分钟执行一次'},
        {'value': '* * * * */1 0 0', 'describe': '每小时执行一次'},
        {'value': '* * * * 0-8 0 0', 'describe': '每天的0到8点每小时执行一次'},
        {'value': '* * * mon-fri 8 30 0', 'describe': '每周一到周五8：30执行一次'},
      ],
      propertyDesc:[
        {
          expression: '*',
          type: '所有',
          describe: '通配符。例： minutes=* 即每分钟触发'
        },
        {
          expression: '*/a',
          type: '所有',
          describe: '可被a整除的通配符'
        },
        {
          expression: 'a-b',
          type: '所有',
          describe: '范围a-b触发'
        },
        {
          expression: 'a-b/c',
          type: '所有',
          describe: '范围a-b，且可被c整除时触发'
        },
        {
          expression: 'xth y',
          type: '日',
          describe: '第几个星期几触发。x为第几个，y为星期几'
        },
        {
          expression: 'last x',
          type: '日',
          describe: '一个月中，最后个星期几触发'
        },
        {
          expression: 'last',
          type: '日',
          describe: '一个月最后一天触发'
        },
        {
          expression: 'x,y,z',
          type: '所有',
          describe: '组合表达式，可以组合确定值或上方的表达式'
        },
      ],
      formatDesc:[
        {
          expression: 'year',
          type: 'int|str',
          describe: '年，4位数字'
        },
        {
          expression: 'month',
          type: 'int|str',
          describe: '月 (范围1-12)'
        },
        {
          expression: 'day',
          type: 'int|str',
          describe: '日 (范围1-31)'
        },
        {
          expression: 'day_of_week',
          type: 'int|str',
          describe: '周内第几天或者星期几 (范围0-6 或者 mon,tue)'
        },
        {
          expression: 'hour',
          type: 'int|str',
          describe: '时 (范围0-23)'
        },
        {
          expression: 'minute',
          type: 'int|str',
          describe: '分 (范围0-59)'
        },
        {
          expression: 'second',
          type: 'int|str',
          describe: '秒 (范围0-59)'
        },
      ],
    }
  },
  //钩子函数，在生命周期内，页面加载完成触发
  created() {
    this.getProjectList()
  },
  methods: {
    //input搜索获取下拉内容
    querySearch(queryString, cb) {
      let restaurants = this.restaurants
      let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect(item) {
      console.log(item)
    },
    //获取项目下拉菜单内容
    getProjectList() {
      projectList().then(resp => {
          this.options = resp.data
        }
      )
    },
    //按计划过滤不同的数
    changeProject() {
      this.getExecutePlanList()
    },
    getExecutePlanList() {
      this.listLoading = true
      this.listQuery['projectId'] = this.projectId
      getExecutePlanList(this.listQuery).then(resp => {
          this.list = resp.data
          this.listLoading = false
          if (resp.data.length !== 0) {
            this.total = resp.count
          } else {
            this.total = 0
          }
        }
      )
    },
    //表格内时间格式化
    formatTime(time) {
      if (time) {
        return this.dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      } else {
        return '无'
      }
    },
    //列表搜索
    keyEnter() {
      this.getExecutePlanList()
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该计划, 是否继续?', '删除计划', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delExecutePlan({'id': index.id}).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.getExecutePlanList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    getSceneList() {
      getSceneInterfaceTree({
        id: this.projectId,
        planCase: true
      }).then(resp => {
          this.sceneCaseOptions = resp
        }
      )
    },
    handleCreate() {
      // 调取场景用例树的接口
      this.getSceneList()
      this.dialogStatus = '新建计划'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    handleTime(executeType) {
      if (executeType === true) {
        delete this.dataForm.startTime
        delete this.dataForm.endTime
      }
      if (this.dataForm.startTime) {
        this.dataForm.startTime = this.formatTime(this.dataForm.startTime)
      }
      if (this.dataForm.endTime) {
        this.dataForm.endTime = this.formatTime(this.dataForm.endTime)
      }
    },

    createData() {
      this.handleTime(this.dataForm.executeType)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.dataForm.parent = this.projectId
          addExecutePlan(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.getExecutePlanList()
          })
        }
      })
    },

    handleUpdate(index, row) {
      // 调取场景用例树的接口
      this.getSceneList()
      this.dataForm = Object.assign({}, row) // copy obj
      this.dialogStatus = '编辑计划'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.handleTime(this.dataForm.executeType)
          updateExecutePlan(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.getExecutePlanList()
          })
        }
      })
    },
    notificationChange(index, row) {
      updateExecutePlan({
        id: row.id,
        notification: row.notification
      }).then(resp => {
        this.$message({message: resp.data, type: 'success'})
        this.dialogFormVisible = false
        this.getExecutePlanList()
      })
    },
    executeTypeChange(index, row) {
      updateExecutePlan({
        id: row.id,
        executeType: row.executeType,
        useless: true
      }).then(resp => {
        this.$message({message: resp.data, type: 'success'})
        this.dialogFormVisible = false
        this.getExecutePlanList()
      })
    },
    runPlan(index, row) {
      row.startTime = this.formatTime(row.startTime)
      row.endTime = this.formatTime(row.endTime)
      runExecutePlan(row).then(resp => {
        this.$message({message: resp.data, type: 'success'})
        this.getExecutePlanList()
      })
    },
    resultDetails(index, row) {
      this.$router.push({
        name: 'interfaceTestReport',
        params: {id: row.id}
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
  max-height: calc(100vh - 50px);
}

.my-autocomplete {
  li {
    line-height: normal;
    padding: 7px;

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .addr {
      font-size: 12px;
      color: #b4b4b4;
    }

    .highlighted .addr {
      color: #ddd;
    }
  }
}
</style>
