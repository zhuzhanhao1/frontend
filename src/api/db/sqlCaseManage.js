import request from '@/utils/request'

export function sqlCaseList(params) {
  return request({
    url: '/sqlCaseManage',
    method: 'get',
    params
  })
}

export function addSqlCase(data) {
  return request({
    url: '/sqlCaseManage',
    method: 'post',
    data
  })
}

export function updateSqlCase(data) {
  return request({
    url: '/sqlCaseManage',
    method: 'put',
    data
  })
}

export function delSqlCase(params) {
  return request({
    url: '/sqlCaseManage',
    method: 'delete',
    params
  })
}

export function updateSqlCaseSwitch(data) {
  return request({
    url: '/sqlCaseManage',
    method: 'put',
    data
  })
}

export function executeSqlCase(data) {
  return request({
    url: '/sqlCaseManage/executeSql',
    method: 'post',
    data
  })
}

export function validationSqlSqlCase(data) {
  return request({
    url: '/sqlCaseManage/ValidationSql',
    method: 'post',
    data
  })
}

export function refreshSourceStock(data) {
  return request({
    url: '/sqlCaseManage/refreshSourceStock',
    method: 'post',
    data
  })
}

export function sqlCaseResultClear(data) {
  return request({
    url: '/sqlCaseManage/clear',
    method: 'post',
    data
  })
}
