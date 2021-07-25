import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '主页', icon: 'dashboard' }
    }]
  },
  {
    path: '/dbTest',
    component: Layout,
    redirect: '/dbTest/dataSourceConfig',
    name: 'dbTest',
    meta: { title: '数据测试', icon: 'el-icon-document-copy' },
    children: [
      {
        path: 'dataSourceConfig',
        name: 'dataSourceConfig',
        component: () => import('@/views/db/dataSource'),
        meta: { title: '数据源配置', icon: 'el-icon-coin' }
      },
      {
        path: 'dataStructureManage/:dbTypeName/:stockAddType',
        name: 'dataStructureManage',
        component: () => import('@/views/db/dataStructure'),
        meta: { title: 'SQL用例', icon: 'tree' }
      },
      {
        path: 'sqlCaseManage/:id/:dbTypeName/:stockAddType',
        name: 'sqlCaseManage',
        hidden: true,
        component: () => import('@/views/db/sqlCase/sqlCaseTab'),
        meta: { title: '测试用例管理', icon: 'el-icon-cpu' }
      },
      {
        path: 'sqlQuery',
        name: 'sqlQuery',
        component: () => import('@/views/db/sqlQuery'),
        meta: { title: 'SQL查询', icon: 'el-icon-search' }
      }
    ]
  },
  {
    path: '/interfaceTest',
    component: Layout,
    redirect: '/interfaceTest/projectManage',
    // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
    name: 'interfaceTest',
    meta: { title: '接口测试', icon: 'el-icon-discover' },
    children: [
      {
        path: 'projectManage',
        name: 'projectManage',
        component: () => import('@/views/interface/projectManage/index'),
        meta: { title: '项目管理', icon: 'el-icon-coin' }
      },
      {
        path: 'interfaceManage',
        name: 'interfaceManage',
        component: () => import('@/views/interface/interfaceManage/index'),
        meta: { title: '接口管理', icon: 'tree' }
      },
      {
        path: 'singleInterface',
        name: 'singleInterface',
        component: () => import('@/views/interface/singleInterface/index'),
        meta: { title: '单一接口', icon: 'el-icon-document' }
      },
      {
        path: 'sceneInterface',
        name: 'sceneInterface',
        component: () => import('@/views/interface/sceneInterface/index'),
        meta: { title: '场景接口', icon: 'el-icon-takeaway-box' }
      },
      {
        path: 'executePlan',
        name: 'executePlan',
        component: () => import('@/views/interface/executePlan/index'),
        meta: { title: '执行计划', icon: 'el-icon-alarm-clock' }
      },
      {
        path: 'interfaceTestReport/:id',
        name: 'interfaceTestReport',
        hidden: true,
        component: () => import('@/views/interface/interfaceTestReport/index'),
        meta: { title: '测试报告', icon: 'el-icon-monitor' }
      }
    ]
  },
  {
    path: '/systemManage',
    component: Layout,
    redirect: '/systemManage/mailConfig',
    name: 'systemManage',       // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
    meta: { title: '系统管理', icon: 'el-icon-setting' },
    children: [
      {
        path: 'mailConfig',
        name: 'mailConfig',
        component: () => import('@/views/systemManage/mailConfig'),
        meta: { title: '邮箱配置', icon: 'el-icon-eleme' }
      },
      {
        path: 'operationLog',
        name: 'operationLog',
        component: () => import('@/views/systemManage/operationLog'),
        meta: { title: '操作日志', icon: 'el-icon-s-order' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
