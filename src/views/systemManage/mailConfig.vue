<template>
  <div class="mail-app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-bottom: 15px;" type="primary" icon="el-icon-plus" disabled
                 @click="handleCreate" size="small">
        新建邮箱配置
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
      <el-table-column label="邮箱服务器" align="left">
        <template slot-scope="scope" >
          <span>{{ scope.row.mailHost }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.mailUser }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发件人" align="left">
        <template slot-scope="scope">
          {{ scope.row.sender }}
        </template>
      </el-table-column>
      <el-table-column label="收件人" align="left">
        <template slot-scope="scope">
          {{ scope.row.receivers }}
        </template>
      </el-table-column>
      <el-table-column label="" width="100" align="left">
        <template slot-scope="scope">
          <el-dropdown>
            <el-button type="primary" size="mini" round plain>
              操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleUpdate(scope.$index, scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handleDelete(scope.$index, scope.row)" disabled>删除</el-dropdown-item>
              <el-dropdown-item @click.native="mailTest(scope.$index, scope.row)">测试邮箱</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" :hide-on-single-page="true"
                @pagination="MailConfigList"/>
    <!--新建/编辑弹出层-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="30%" class="mail_config_dialog">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" label-position="left" label-width="100px"
               style="width: 80%; margin-left:30px;" size="small">
        <el-form-item label="邮箱服务器" prop="mailHost">
          <el-select v-model="dataForm.mailHost" placeholder="请选择邮箱服务器" disabled>
            <el-option label="smtp.qq.com" value="smtp.qq.com"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="mailUser">
          <el-input v-model="dataForm.mailUser" disabled></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="mailPassword">
          <el-input type="password" v-model="dataForm.mailPassword" disabled></el-input>
        </el-form-item>

        <el-form-item label="发件人" prop="sender">
          <el-input v-model="dataForm.sender" disabled></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click.prevent="addReceivers" type="success" icon="el-icon-plus" size="small">添加收件人</el-button>
        </el-form-item>
        <el-form-item
          v-for="(value,index) in dataForm.receivers"
          :label="'收件人'+index"
          :key="index"
          prop="receivers"
          :rules="{
            required: true, message: '收件人不能为空', trigger: 'blur'
          }"
        >
          <el-input v-model="dataForm.receivers[index]" style="width: 80%;margin-right: 5px;"
                    autocomplete="off"></el-input>
          <el-button @click.prevent="removeReceivers(value)" type="danger" icon="el-icon-minus" circle></el-button>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='新建邮箱配置'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index' // secondary package based on el-pagination
import {
  getMailConfigList,
  addMailConfig, updateMailConfig,
  delMailConfig, mailTestSend
} from '@/api/systemManage/mailConfig'

export default {
  components: {Pagination},
  data() {
    return {
      list: null,
      listLoading: true,
      dialogFormVisible: false,   //弹出层是否显示
      dialogStatus: '',           //判断是新建还是编辑的状态
      total: 0,                   //列表数据总量
      listQuery: {
        page: 1,
        limit: 10,
      },
      dataForm: {
        mailHost: '',
        mailUser: '',
        mailPassword: '',
        sender: '',
        receivers: []
      },
      rules: {
        mailHost: [{required: true, message: 'mailHost is required', trigger: 'blur'}],
        mailUser: [{required: true, message: 'mailUser is required', trigger: 'blur'}],
        mailPassword: [{required: true, message: 'mailPassword is required', trigger: 'blur'}],
        sender: [{required: true, message: 'sender is required', trigger: 'blur'}],
        receivers: [{required: true, message: 'receivers is required', trigger: 'blur'}],
      }
    }
  },
  //钩子函数，在生命周期内，页面加载完成触发
  created() {
    this.MailConfigList()
  },
  methods: {
    //增加接收人input
    addReceivers() {
      this.dataForm.receivers.push("");
    },
    //移除接收人input
    removeReceivers(item) {
      let index = this.dataForm.receivers.indexOf(item)
      this.dataForm.receivers.splice(index, 1)
    },
    MailConfigList() {
      this.listLoading = true
      getMailConfigList(this.listQuery).then(resp => {
          this.list = resp.data
          this.total = resp.count
          this.listLoading = false
        }
      )
    },
    //列表搜索
    handleFilter() {
      this.MailConfigList()
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该邮箱配置, 是否继续?', '删除邮箱配置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delMailConfig({'id': index.id}).then(resp => {
          this.$message({message: resp.data, type: 'success'})
          this.MailConfigList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleCreate() {
      this.dialogStatus = '新建邮箱配置'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm.receivers = [""]
      })
    },
    createData() {
      //过滤掉key为‘’的空行
      this.dataForm.receivers = this.dataForm.receivers.filter(function (item) {
        return item.match(/\S+/)
      })
      console.log(this.dataForm.receivers)
      if (this.dataForm.receivers.length === 0) {
        this.$message({message: "接收人不能为空", type: 'warning'})
      } else {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            addMailConfig(this.dataForm).then(resp => {
              this.$message({message: resp.data, type: 'success'})
              this.dialogFormVisible = false
              this.MailConfigList()
            })
          }
        })
      }

    },
    handleUpdate(index, row) {
      console.log(row)
      this.dataForm = Object.assign({}, row) // copy obj
      this.dialogStatus = '编辑邮箱配置'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateMailConfig(this.dataForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogFormVisible = false
            this.MailConfigList()
          })
        }
      })
    },
    mailTest(index, row) {
      console.log(row)
      mailTestSend(row).then(resp => {
          this.$message({message: resp.data, type: 'success'})
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.mail-app-container {
  margin: 15px;
  background: #ffffff;
  padding: 15px;
  overflow: auto;
  max-height: calc(100vh - 50px);
}
</style>

<style lang="scss">
.mail_config_dialog {
  display: flex;
  justify-content: center;
  align-items: Center;
  overflow: hidden;

  .el-dialog {
    margin: 0 auto !important;
    overflow: hidden;

    .el-dialog__body {
      height: 450px;
      overflow: auto;
    }

  }
}
</style>
