<template>
  <div>
    <h2 style="text-align: center;">Zhuzh Test Tools</h2>
    <div class="app-container">
      <el-tag>开发基于Vue2.6.10、Python3.8</el-tag>
      <el-tag type="warning" style="margin-left: 10px;">界面基于15.6寸、24寸显示器布局</el-tag>
      <h3><a class="md-header-anchor"/><span>主要功能：</span></h3>
      <ul>
        <li><h4>数据源配置：管理各类数据库链接所需要的基本信息，目前支持MYSQL、SQL SERVER、ORACLE</h4></li>
        <li><h4>SQL用例：按数据库种类、增量/全量、ddl/dml管理用例，执行用例按count(*)比对数据量</h4></li>
        <li><h4>SQL查询：查询表字段结构、查询表内所有数据</h4></li>
        <li><h4>项目管理：接口测试项目，目的为了全局使用项目的domain</h4></li>
        <li><h4>接口管理：按项目管理用例，可以进行调试</h4></li>
        <li><h4>单一接口：从接口管理中选择接口进行测试，无前后接口依赖，只需配合公共参数进行运行</h4></li>
        <li><h4>场景接口：从接口管理中选择接口进行测试，支持json文件导入，有前后接口依赖，需配合前置提取，公共参数进行运行</h4></li>
        <li><h4>执行计划：从场景接口中选择场景进行测试，支撑cron表达式定时运行，测试报告通过邮箱发送</h4></li>
        <li><h4>邮箱配置：设置邮箱发件人，收件人等</h4></li>
        <li><h4>操作日志：查询最新的日志记录</h4></li>
      </ul>
      <h4>
        <span>项目拉取：</span>
        <el-link type="primary">git clone http://zhuzhanhao.cn:10080/zhuzhTest/AutoTestTools.git</el-link>
      </h4>
      <div class="all-install-content">
        <div class="install-content">
          <h4>前端项目启动：</h4>
          <p>
            <span>进入项目目录：</span>
            cd /本地目录/fronted
          </p>
          <p>
            <span>安装项目依赖库：</span>
            npm install --registry=https://registry.npm.taobao.org
          </p>
          <p>
            <span>开发调试：</span>
            npm run dev
          </p>
          <p>
            <span>生产打包：</span>
            npm run build
          </p>
        </div>
        <div class="install-content" style="margin-left: 20px;">
          <h4>后端项目启动：</h4>
          <p>
            <span>进入项目目录：</span>
            cd /本地目录/backed
          </p>
          <p>
            <span>安装项目依赖库：</span>
            pip install -r requirements
          </p>
          <p>
            <span>开发调试：</span>
            python manage.py runserver 0.0.0.0:8000
          </p>
          <p>
            <span>生产运行：</span>
            uwsgi...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
}
</script>

<style lang="scss" scoped>
.app-container {
  margin: 15px;
  background: #ffffff;
  padding: 15px;
  overflow: auto;
  max-height: calc(100vh - 140px);
}

.install-content {
  float: left;
  padding: 1px 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  width: 45%;


  p {
    margin-left: 20px;
  }
}

.all-install-content {
  margin-left: 20px;
  height: 200px;
}
</style>
