<template>
  <div class="tab-container sqlCase">
    <el-button
      class="filter-item"
      type="primary"
      icon="el-icon-back"
      round
      style="margin-right: 50px;"
      size="small"
      @click="goback"
      plain
    >返回
    </el-button>
    <el-tag style="margin-right: 10px;">源库主机：</el-tag>
    <el-select v-model="sourceHost" filterable class="filter-item" placeholder="执行用例必须选择源库主机"
               @change="updateSourceHostContent(sourceHost)" style="width: 250px" size="small">
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
    <el-tag style="margin: 0px 10px 0px 50px;">目标库主机：</el-tag>
    <el-select v-model="targetHost" filterable class="filter-item" placeholder="验证用例必须选择目标库主机"
               @change="updateTargetHostContent(targetHost)" style="width: 250px" size="small">
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
    <el-tabs v-model="activeName" style="margin-top:15px;" type="card">
      <el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
        <keep-alive>
          <TabPane v-if="activeName==item.key" :type="item.key" :source-host="sourceHost"  class="sqlCase-tab" :target-host="targetHost"/>
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import TabPane from './sqlCaseList'

import { dataSourceHosts } from '@/api/db/dataSourceConfig'

export default {
  name: 'Tab',
  components: { TabPane },
  data() {
    return {
      tabMapOptions: [
        { label: 'DDL用例', key: 'ddl' },
        { label: 'DML用例', key: 'dml' }
      ],
      activeName: 'ddl',
      createdTimes: 0,
      sourceHost: '',
      targetHost: '',
      Hosts: null,
      options: null
    }
  },
  watch: {
    activeName(val) {
      this.$router.push(`${this.$route.path}?tab=${val}`)
    }
  },
  created() {
    console.log(this.$route.params)
    this.getHosts()
    // init the default selected tab
    const tab = this.$route.query.tab
    if (tab) {
      this.activeName = tab
    }
  },
  methods: {
    getHosts() {
      dataSourceHosts().then(resp => {
        let data = []
        for (let item of resp) {
          if (item.label === this.$route.params.dbTypeName) {
            data.push(item)
            this.options = data
          }
        }
      })
    },
    updateSourceHostContent(sourceHost) {
      this.sourceHost = sourceHost
    },
    updateTargetHostContent(targetHost) {
      this.targetHost = targetHost
    },
    goback() {
      console.log(this.$route.params)
      this.$router.push({ // 核心语句
        name: 'dataStructureManage', // 跳转的路径
        params: { // 路由传参时push和query搭配使用 ，作用时传递参数
          dbTypeName: this.$route.params.dbTypeName,
          stockAddType: this.$route.params.stockAddType
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.sqlCase {
  margin: 15px;
  background: #ffffff;
  padding: 15px;
}

.sqlCase-tab {
  padding-right: 5px;
  overflow: auto;
  max-height: calc(100vh - 230px);
}
</style>

<style lang="scss">
.sqlCase {
  .el-tabs__nav {
    width: 100%;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item {
    width: 50%;
    text-align: center;
    font-size: 18px;
  }

  .el-tabs__item {
    height: 40px;
    line-height: 40px;
  }
}

</style>
