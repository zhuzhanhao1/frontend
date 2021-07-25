<template>
  <div class="log-app-container">
    <div class="filter-container">
      <el-input-number v-model="startNum" class="headersBtnMargin" size="small"></el-input-number>
      <el-input-number v-model="endNum" class="headersBtnMargin" size="small"></el-input-number>
      <el-select v-model="logLevel" placeholder="请选择日志级别" class="headersBtnMargin" size="small">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" size="small" icon="el-icon-search" @click="handleFilter">
        检索
      </el-button>
    </div>
    <div id="content">
      <el-input type="textarea" v-model="logContent" :autosize="{ minRows: 1,maxRows:25}"
                readonly="readonly"></el-input>
    </div>
  </div>
</template>


<script>
import {getOperationLog} from '@/api/systemManage/operationLog'

export default {
  data() {
    return {
      startNum: 1,
      endNum: 100,
      logContent: '',
      logLevel:'all',
      options:[{
          value: 'all',
          label: 'ALL'
        },{
          value: 'info',
          label: 'INFO'
        }, {
          value: 'error',
          label: 'REEOR'
        }]
    }
  },
  methods: {
    handleFilter() {
      getOperationLog({
        startNum: this.startNum,
        endNum: this.endNum,
        logLevel: this.logLevel
      }).then(resp => {
          this.logContent = resp.data
          if(!resp.data){
            this.$message({message: "抱歉，该日志级别下没有日志", type: 'warning'})
          }
        }
      )
    }
  }
}
</script>


<style lang="scss" scoped>
.log-app-container {
  margin: 15px;
  background: #ffffff;
  padding: 15px;
  overflow: auto;
  max-height: calc(100vh - 80px);
}
.headersBtnMargin{
  margin-right: 5px;
}
#content{
  margin-top: 20px;
}
</style>
